/**
 * useWebSocket.ts - React 19+ WebSocket Hook Example
 * 
 * Demonstrates:
 * - WebSocket connection management with React 19 concurrent features
 * - Automatic reconnection with exponential backoff
 * - Proper cleanup in useEffect to prevent memory leaks
 * - Integration with TanStack Query for server state management
 * - Type-safe WebSocket message handling
 * - Connection state management with Zustand store integration
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSensorStore } from '../stores/sensorStore';
import type { SensorData, WebSocketMessage } from '../types/sensor';

interface WebSocketOptions {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  onMessage?: (data: any) => void;
}

interface WebSocketState {
  socket: WebSocket | null;
  isConnected: boolean;
  isConnecting: boolean;
  reconnectCount: number;
  lastError: string | null;
  connectionUptime: number;
}

export const useWebSocket = (options: WebSocketOptions) => {
  const {
    url,
    protocols,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    heartbeatInterval = 30000,
    onOpen,
    onClose,
    onError,
    onMessage
  } = options;

  // React state for connection management
  const [state, setState] = useState<WebSocketState>({
    socket: null,
    isConnected: false,
    isConnecting: false,
    reconnectCount: 0,
    lastError: null,
    connectionUptime: 0
  });

  // Refs for stable references
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionStartTime = useRef<number>(0);

  // TanStack Query client for cache invalidation
  const queryClient = useQueryClient();
  
  // Zustand store for sensor data updates
  const { updateSensorData, setConnectionStatus, setError: setSensorError } = useSensorStore();

  // Calculate exponential backoff delay
  const getReconnectDelay = useCallback((attempt: number): number => {
    return Math.min(reconnectInterval * Math.pow(2, attempt), 30000);
  }, [reconnectInterval]);

  // Send heartbeat to keep connection alive
  const sendHeartbeat = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      
      heartbeatTimeoutRef.current = setTimeout(sendHeartbeat, heartbeatInterval);
    }
  }, [heartbeatInterval]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    // Prevent multiple simultaneous connection attempts
    if (state.isConnecting || socketRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setState(prev => ({ ...prev, isConnecting: true, lastError: null }));

    try {
      const socket = new WebSocket(url, protocols);
      socketRef.current = socket;
      connectionStartTime.current = Date.now();

      socket.onopen = () => {
        // React 19's automatic batching handles multiple state updates efficiently
        setState(prev => ({
          ...prev,
          socket,
          isConnected: true,
          isConnecting: false,
          reconnectCount: 0,
          lastError: null,
          connectionUptime: 0
        }));

        setConnectionStatus(true);
        
        // Start heartbeat
        sendHeartbeat();
        
        // Start uptime counter
        const uptimeInterval = setInterval(() => {
          setState(prev => ({
            ...prev,
            connectionUptime: Date.now() - connectionStartTime.current
          }));
        }, 1000);

        socket.addEventListener('close', () => {
          clearInterval(uptimeInterval);
        });

        onOpen?.();
      };

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Handle different message types
          switch (message.type) {
            case 'sensor_data':
              // Update sensor store and invalidate TanStack Query cache
              updateSensorData(message.data as SensorData);
              queryClient.invalidateQueries(['sensors']);
              break;
              
            case 'connection_status':
              // Handle connection status updates
              break;
              
            case 'pong':
              // Handle heartbeat response
              break;
              
            case 'error':
              setSensorError(message.data.message);
              break;
              
            default:
              console.warn('Unknown WebSocket message type:', message.type);
          }

          onMessage?.(message.data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      socket.onclose = (event) => {
        // Clear heartbeat
        if (heartbeatTimeoutRef.current) {
          clearTimeout(heartbeatTimeoutRef.current);
          heartbeatTimeoutRef.current = null;
        }

        setState(prev => ({
          ...prev,
          socket: null,
          isConnected: false,
          isConnecting: false
        }));

        setConnectionStatus(false);

        // Attempt reconnection if not intentionally closed
        if (!event.wasClean && state.reconnectCount < maxReconnectAttempts) {
          const delay = getReconnectDelay(state.reconnectCount);
          
          setState(prev => ({
            ...prev,
            reconnectCount: prev.reconnectCount + 1
          }));

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }

        onClose?.();
      };

      socket.onerror = (error) => {
        setState(prev => ({
          ...prev,
          lastError: 'WebSocket connection failed',
          isConnecting: false
        }));

        setSensorError('WebSocket connection failed');
        onError?.(error);
      };

    } catch (error) {
      setState(prev => ({
        ...prev,
        isConnecting: false,
        lastError: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [
    url, 
    protocols, 
    state.isConnecting, 
    state.reconnectCount,
    maxReconnectAttempts,
    getReconnectDelay,
    sendHeartbeat,
    updateSensorData,
    setConnectionStatus,
    setSensorError,
    queryClient,
    onOpen,
    onClose,
    onError,
    onMessage
  ]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }

    if (socketRef.current) {
      socketRef.current.close(1000, 'Intentional disconnect');
      socketRef.current = null;
    }

    setState(prev => ({
      ...prev,
      socket: null,
      isConnected: false,
      isConnecting: false,
      reconnectCount: 0
    }));
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((message: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
      return true;
    }
    return false;
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    disconnect();
    setState(prev => ({ ...prev, reconnectCount: 0 }));
    connect();
  }, [disconnect, connect]);

  // Effect for automatic connection and cleanup
  useEffect(() => {
    connect();

    // Cleanup on unmount - Critical for React 19+ memory management
    return () => {
      disconnect();
    };
  }, [url]); // Only reconnect when URL changes

  // Effect for handling page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !state.isConnected) {
        // Reconnect when page becomes visible
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connect, state.isConnected]);

  return {
    // Connection state
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    reconnectCount: state.reconnectCount,
    lastError: state.lastError,
    connectionUptime: state.connectionUptime,
    
    // Actions
    connect,
    disconnect,
    reconnect,
    sendMessage,
    
    // Socket reference (for advanced usage)
    socket: socketRef.current
  };
};

// Example usage:
/*
const Dashboard = () => {
  const { 
    isConnected, 
    isConnecting, 
    lastError, 
    connectionUptime,
    reconnect 
  } = useWebSocket({
    url: 'ws://localhost:8000/sensors',
    onOpen: () => console.log('Connected to sensor stream'),
    onClose: () => console.log('Disconnected from sensor stream'),
    onError: (error) => console.error('WebSocket error:', error)
  });

  return (
    <div>
      <div className="connection-status">
        {isConnecting && <span>Connecting...</span>}
        {isConnected && (
          <span className="text-green-500">
            Connected (uptime: {Math.floor(connectionUptime / 1000)}s)
          </span>
        )}
        {lastError && (
          <span className="text-red-500">
            Error: {lastError}
            <button onClick={reconnect}>Retry</button>
          </span>
        )}
      </div>
      
      <DashboardGrid />
    </div>
  );
};
*/

export default useWebSocket; 