/**
 * WebSocket hook for real-time sensor data streaming
 * Enhanced with React 19+ concurrent features and TanStack Query integration
 */

import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSensorStore } from '@stores/sensorStore';
import { useLayoutStore } from '@stores/layoutStore';
import { SensorData, WebSocketMessage } from '@types';

interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  timeout?: number;
  enableHeartbeat?: boolean;
  enableReconnect?: boolean;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
  onMessage?: (data: any) => void;
  onReconnectAttempt?: (attempt: number) => void;
}

interface WebSocketStats {
  messagesReceived: number;
  messagesPerSecond: number;
  bytesReceived: number;
  averageLatency: number;
  lastMessageTime: number;
}

export const useWebSocket = (options: WebSocketOptions) => {
  const {
    url,
    protocols,
    reconnectInterval = 3000,
    maxReconnectAttempts = 10,
    heartbeatInterval = 30000,
    timeout = 10000,
    enableHeartbeat = true,
    enableReconnect = true,
    onOpen,
    onClose,
    onError,
    onMessage,
    onReconnectAttempt
  } = options;

  // Refs for stable references across renders
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionStartTime = useRef<number>(0);
  const lastHeartbeatRef = useRef<number>(0);
  const statsRef = useRef<WebSocketStats>({
    messagesReceived: 0,
    messagesPerSecond: 0,
    bytesReceived: 0,
    averageLatency: 0,
    lastMessageTime: 0
  });
  const messageTimesRef = useRef<number[]>([]);

  // TanStack Query client for cache management
  const queryClient = useQueryClient();
  
  // Zustand stores for state management
  const { 
    updateSensorData, 
    setConnectionStatus, 
    setReconnecting,
    isConnected,
    isReconnecting 
  } = useSensorStore();
  
  const { autoSave, saveCurrentLayout } = useLayoutStore();

  // Calculate exponential backoff delay with jitter
  const getReconnectDelay = useCallback((attempt: number): number => {
    const baseDelay = Math.min(reconnectInterval * Math.pow(1.5, attempt), 30000);
    const jitter = Math.random() * 0.3; // Add 30% random jitter
    return baseDelay * (1 + jitter);
  }, [reconnectInterval]);

  // Update message statistics
  const updateStats = useCallback((messageSize: number) => {
    const now = Date.now();
    const stats = statsRef.current;
    
    stats.messagesReceived++;
    stats.bytesReceived += messageSize;
    stats.lastMessageTime = now;
    
    // Track message times for rate calculation (last 10 seconds)
    messageTimesRef.current.push(now);
    messageTimesRef.current = messageTimesRef.current.filter(time => now - time < 10000);
    
    // Calculate messages per second
    stats.messagesPerSecond = messageTimesRef.current.length / 10;
  }, []);

  // Send heartbeat to keep connection alive
  const sendHeartbeat = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN && enableHeartbeat) {
      const heartbeatMessage = {
        type: 'ping',
        timestamp: Date.now(),
        id: `heartbeat-${Date.now()}`
      };
      
      lastHeartbeatRef.current = Date.now();
      socketRef.current.send(JSON.stringify(heartbeatMessage));
      
      heartbeatTimeoutRef.current = setTimeout(sendHeartbeat, heartbeatInterval);
    }
  }, [heartbeatInterval, enableHeartbeat]);

  // Clear all timeouts
  const clearTimeouts = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Prevent multiple simultaneous connections
    if (socketRef.current?.readyState === WebSocket.CONNECTING || isConnected) {
      return;
    }

    setReconnecting(true);
    connectionStartTime.current = Date.now();

    try {
      const socket = new WebSocket(url, protocols);
      socketRef.current = socket;

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (socket.readyState === WebSocket.CONNECTING) {
          socket.close();
          setConnectionStatus(false, 'Connection timeout');
        }
      }, timeout);

      socket.onopen = () => {
        clearTimeouts();
        
        // React 19's automatic batching efficiently handles multiple updates
        setConnectionStatus(true);
        setReconnecting(false);
        
        // Reset statistics
        statsRef.current = {
          messagesReceived: 0,
          messagesPerSecond: 0,
          bytesReceived: 0,
          averageLatency: 0,
          lastMessageTime: Date.now()
        };
        messageTimesRef.current = [];
        
        // Start heartbeat if enabled
        if (enableHeartbeat) {
          sendHeartbeat();
        }
        
        // Subscribe to sensor data stream
        socket.send(JSON.stringify({
          type: 'subscribe',
          data: {
            streams: ['sensors', 'hardware_status'],
            interval: 1000 // 1 second update interval
          }
        }));

        onOpen?.();
      };

      socket.onmessage = (event) => {
        try {
          const messageData = event.data;
          const message: WebSocketMessage = JSON.parse(messageData);
          
          // Update statistics
          updateStats(messageData.length);
          
          // Calculate latency for heartbeat responses
          if (message.type === 'pong' && lastHeartbeatRef.current > 0) {
            const latency = Date.now() - lastHeartbeatRef.current;
            statsRef.current.averageLatency = 
              (statsRef.current.averageLatency + latency) / 2;
          }
          
          // Handle different message types
          switch (message.type) {
            case 'sensor_data':
              // Update sensor store with React 19's automatic batching
              if (message.data && typeof message.data === 'object') {
                updateSensorData(message.data as SensorData);
                
                // Invalidate relevant TanStack Query cache
                queryClient.invalidateQueries({ 
                  queryKey: ['sensors'], 
                  exact: false 
                });
              }
              break;
              
            case 'hardware_status':
              // Update hardware status
              queryClient.setQueryData(['hardware-status'], message.data);
              break;
              
            case 'layout_sync':
              // Handle layout synchronization for multi-device setups
              if (message.data && autoSave) {
                // Don't auto-save if this is a sync from another device
                // Implementation would check sync source
              }
              break;
              
            case 'pong':
              // Heartbeat response - latency already calculated above
              break;
              
            case 'error':
              console.error('WebSocket server error:', message.data);
              setConnectionStatus(false, message.data?.message || 'Server error');
              break;
              
            case 'notification':
              // Handle server notifications (alerts, warnings, etc.)
              if (message.data?.type === 'alert') {
                // Could integrate with notification system here
                console.warn('Server alert:', message.data.message);
              }
              break;
              
            default:
              console.warn('Unknown WebSocket message type:', message.type);
          }

          onMessage?.(message.data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error, event.data);
        }
      };

      socket.onclose = (event) => {
        clearTimeouts();
        setConnectionStatus(false, event.reason || 'Connection closed');
        
        // Attempt reconnection if not intentionally closed and reconnect is enabled
        if (!event.wasClean && enableReconnect) {
          const currentAttempts = useSensorStore.getState().connectionError ? 
            parseInt(useSensorStore.getState().connectionError?.split('attempt ')[1] || '0') : 0;
            
          if (currentAttempts < maxReconnectAttempts) {
            const delay = getReconnectDelay(currentAttempts);
            const newAttempts = currentAttempts + 1;
            
            setConnectionStatus(false, `Reconnecting... attempt ${newAttempts}/${maxReconnectAttempts}`);
            onReconnectAttempt?.(newAttempts);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, delay);
          } else {
            setConnectionStatus(false, 'Max reconnection attempts reached');
            setReconnecting(false);
          }
        } else {
          setReconnecting(false);
        }

        onClose?.(event);
      };

      socket.onerror = (error) => {
        clearTimeouts();
        setConnectionStatus(false, 'WebSocket connection error');
        setReconnecting(false);
        onError?.(error);
      };

    } catch (error) {
      clearTimeouts();
      setConnectionStatus(
        false, 
        error instanceof Error ? error.message : 'Unknown connection error'
      );
      setReconnecting(false);
    }
  }, [
    url, 
    protocols, 
    timeout,
    enableHeartbeat,
    enableReconnect,
    maxReconnectAttempts,
    isConnected,
    getReconnectDelay,
    sendHeartbeat,
    clearTimeouts,
    updateStats,
    updateSensorData,
    setConnectionStatus,
    setReconnecting,
    queryClient,
    autoSave,
    onOpen,
    onClose,
    onError,
    onMessage,
    onReconnectAttempt
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    clearTimeouts();

    if (socketRef.current) {
      socketRef.current.close(1000, 'Intentional disconnect');
      socketRef.current = null;
    }

    setConnectionStatus(false);
    setReconnecting(false);
  }, [clearTimeouts, setConnectionStatus, setReconnecting]);

  // Send message through WebSocket
  const sendMessage = useCallback((message: any): boolean => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      try {
        const messageString = typeof message === 'string' 
          ? message 
          : JSON.stringify(message);
        socketRef.current.send(messageString);
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Manual reconnect with reset
  const reconnect = useCallback(() => {
    disconnect();
    // Reset reconnection attempts
    setConnectionStatus(false, null);
    setTimeout(connect, 1000); // Brief delay before reconnecting
  }, [disconnect, connect, setConnectionStatus]);

  // Subscribe to specific sensor updates
  const subscribe = useCallback((sensorPaths: string[]) => {
    return sendMessage({
      type: 'subscribe_sensors',
      data: { paths: sensorPaths }
    });
  }, [sendMessage]);

  // Unsubscribe from sensor updates
  const unsubscribe = useCallback((sensorPaths: string[]) => {
    return sendMessage({
      type: 'unsubscribe_sensors',
      data: { paths: sensorPaths }
    });
  }, [sendMessage]);

  // Effect for automatic connection and cleanup
  useEffect(() => {
    connect();

    // Critical cleanup for React 19+ - prevents memory leaks
    return () => {
      disconnect();
    };
  }, [url]); // Only reconnect when URL changes

  // Effect for handling page visibility changes (battery optimization)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isConnected && !isReconnecting) {
        // Reconnect when page becomes visible
        connect();
      } else if (document.visibilityState === 'hidden' && enableHeartbeat) {
        // Reduce heartbeat frequency when page is hidden
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
          heartbeatTimeoutRef.current = setTimeout(sendHeartbeat, heartbeatInterval * 2);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect, isConnected, isReconnecting, enableHeartbeat, heartbeatInterval, sendHeartbeat]);

  // Effect for handling network changes
  useEffect(() => {
    const handleOnline = () => {
      if (!isConnected) {
        reconnect();
      }
    };

    const handleOffline = () => {
      setConnectionStatus(false, 'Network offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isConnected, reconnect, setConnectionStatus]);

  return {
    // Connection state
    isConnected,
    isConnecting: isReconnecting,
    lastError: useSensorStore.getState().connectionError,
    connectionUptime: isConnected ? Date.now() - connectionStartTime.current : 0,
    
    // Statistics
    stats: {
      messagesReceived: statsRef.current.messagesReceived,
      messagesPerSecond: statsRef.current.messagesPerSecond,
      bytesReceived: statsRef.current.bytesReceived,
      averageLatency: statsRef.current.averageLatency,
      lastMessageTime: statsRef.current.lastMessageTime
    },
    
    // Actions
    connect,
    disconnect,
    reconnect,
    sendMessage,
    subscribe,
    unsubscribe,
    
    // Socket reference for advanced usage
    socket: socketRef.current
  };
};

export default useWebSocket;