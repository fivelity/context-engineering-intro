/**
 * WebSocket Client for Real-time Hardware Monitoring
 * This example demonstrates WebSocket integration with Svelte 5 runes
 * for streaming sensor data in the SenseCanvas dashboard.
 */

import type { SensorData, WebSocketMessage } from './widget-schemas';

// WebSocket connection states
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

// WebSocket client configuration
export interface WebSocketConfig {
  url: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  heartbeatInterval: number;
  maxReconnectDelay: number;
  protocols?: string[];
}

// Default configuration
const defaultConfig: WebSocketConfig = {
  url: 'ws://localhost:8000/ws/sensors',
  reconnectAttempts: 5,
  reconnectDelay: 1000,
  heartbeatInterval: 30000,
  maxReconnectDelay: 30000,
  protocols: ['sensecanvas-v1']
};

/**
 * WebSocket Client Class with automatic reconnection and heartbeat
 */
export class SensorWebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectCount = 0;
  private heartbeatTimer: number | null = null;
  private reconnectTimer: number | null = null;
  private isManualClose = false;
  
  // Event callbacks
  private onDataCallback?: (data: SensorData[]) => void;
  private onStateChangeCallback?: (state: ConnectionState) => void;
  private onErrorCallback?: (error: Error) => void;
  
  private currentState: ConnectionState = 'disconnected';
  
  constructor(config: Partial<WebSocketConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }
  
  /**
   * Connect to the WebSocket server
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }
    
    this.isManualClose = false;
    this.setState('connecting');
    
    try {
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      this.setupEventHandlers();
    } catch (error) {
      this.setState('error');
      this.onErrorCallback?.(error instanceof Error ? error : new Error('Connection failed'));
      this.scheduleReconnect();
    }
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.isManualClose = true;
    this.clearTimers();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.setState('disconnected');
    this.reconnectCount = 0;
  }
  
  /**
   * Send a message to the server
   */
  send(message: any): boolean {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
        return true;
      } catch (error) {
        this.onErrorCallback?.(error instanceof Error ? error : new Error('Send failed'));
        return false;
      }
    }
    return false;
  }
  
  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return this.currentState;
  }
  
  /**
   * Set up WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;
    
    this.ws.onopen = () => {
      this.setState('connected');
      this.reconnectCount = 0;
      this.startHeartbeat();
      
      // Send initial connection message
      this.send({
        type: 'connect',
        clientInfo: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      });
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        this.onErrorCallback?.(new Error('Invalid message format'));
      }
    };
    
    this.ws.onclose = (event) => {
      this.clearTimers();
      
      if (!this.isManualClose) {
        if (event.code === 1006 || event.code === 1001) {
          // Abnormal closure or going away - attempt reconnect
          this.setState('reconnecting');
          this.scheduleReconnect();
        } else {
          this.setState('disconnected');
        }
      }
    };
    
    this.ws.onerror = (event) => {
      this.setState('error');
      this.onErrorCallback?.(new Error('WebSocket error occurred'));
    };
  }
  
  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'sensor_data':
        if (Array.isArray(message.data)) {
          this.onDataCallback?.(message.data as SensorData[]);
        }
        break;
        
      case 'connection_status':
        // Handle connection status updates
        break;
        
      case 'error':
        const errorData = message.data as { message: string; code: number };
        this.onErrorCallback?.(new Error(errorData.message));
        break;
        
      case 'ping':
        // Respond to server ping with pong
        this.send({ type: 'pong', timestamp: new Date() });
        break;
        
      default:
        console.warn('Unknown message type:', message.type);
    }
  }
  
  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.clearHeartbeat();
    
    this.heartbeatTimer = window.setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ type: 'ping', timestamp: new Date() });
      }
    }, this.config.heartbeatInterval);
  }
  
  /**
   * Clear heartbeat timer
   */
  private clearHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectCount >= this.config.reconnectAttempts || this.isManualClose) {
      this.setState('disconnected');
      return;
    }
    
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectCount),
      this.config.maxReconnectDelay
    );
    
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectCount++;
      this.connect();
    }, delay);
  }
  
  /**
   * Clear all timers
   */
  private clearTimers(): void {
    this.clearHeartbeat();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  /**
   * Set connection state and notify listeners
   */
  private setState(state: ConnectionState): void {
    if (this.currentState !== state) {
      this.currentState = state;
      this.onStateChangeCallback?.(state);
    }
  }
  
  /**
   * Set event callbacks
   */
  onData(callback: (data: SensorData[]) => void): void {
    this.onDataCallback = callback;
  }
  
  onStateChange(callback: (state: ConnectionState) => void): void {
    this.onStateChangeCallback = callback;
  }
  
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }
  
  /**
   * Cleanup resources
   */
  destroy(): void {
    this.disconnect();
    this.onDataCallback = undefined;
    this.onStateChangeCallback = undefined;
    this.onErrorCallback = undefined;
  }
}

/**
 * Svelte 5 runes-based store for sensor data management
 */
export function createSensorDataStore() {
  // Reactive state using Svelte 5 runes
  let sensorData = $state<SensorData[]>([]);
  let connectionState = $state<ConnectionState>('disconnected');
  let lastUpdate = $state<Date | null>(null);
  let errorMessage = $state<string | null>(null);
  
  // WebSocket client instance
  let client: SensorWebSocketClient | null = null;
  
  // Derived values for computed properties
  const isConnected = $derived(connectionState === 'connected');
  const isReconnecting = $derived(connectionState === 'reconnecting');
  const hasError = $derived(connectionState === 'error' || errorMessage !== null);
  
  // Sensor data organized by type for easy access
  const sensorsByType = $derived(() => {
    const grouped: Record<string, SensorData[]> = {};
    
    for (const sensor of sensorData) {
      if (!grouped[sensor.type]) {
        grouped[sensor.type] = [];
      }
      grouped[sensor.type].push(sensor);
    }
    
    return grouped;
  });
  
  // Hardware-specific sensor groups
  const cpuSensors = $derived(() => sensorData.filter(s => s.hardware === 'cpu'));
  const gpuSensors = $derived(() => sensorData.filter(s => s.hardware === 'gpu'));
  const memorySensors = $derived(() => sensorData.filter(s => s.hardware === 'memory'));
  const storageSensors = $derived(() => sensorData.filter(s => s.hardware === 'storage'));
  
  // Connection statistics
  const connectionStats = $derived(() => ({
    sensorCount: sensorData.length,
    lastUpdate: lastUpdate?.toLocaleTimeString(),
    connectionState,
    uptimeMinutes: lastUpdate ? Math.floor((Date.now() - lastUpdate.getTime()) / 60000) : 0
  }));
  
  /**
   * Initialize the WebSocket connection
   */
  function connect(config?: Partial<WebSocketConfig>): void {
    if (client) {
      client.destroy();
    }
    
    client = new SensorWebSocketClient(config);
    
    // Set up event handlers
    client.onData((data) => {
      sensorData = data;
      lastUpdate = new Date();
      errorMessage = null;
    });
    
    client.onStateChange((state) => {
      connectionState = state;
      
      if (state === 'connected') {
        errorMessage = null;
      }
    });
    
    client.onError((error) => {
      errorMessage = error.message;
      console.error('WebSocket error:', error);
    });
    
    // Start connection
    client.connect();
  }
  
  /**
   * Disconnect from the WebSocket server
   */
  function disconnect(): void {
    client?.disconnect();
  }
  
  /**
   * Manually refresh sensor data
   */
  function refresh(): void {
    if (client?.getState() === 'connected') {
      client.send({ type: 'refresh', timestamp: new Date() });
    }
  }
  
  /**
   * Get sensor by ID
   */
  function getSensorById(id: string): SensorData | undefined {
    return sensorData.find(sensor => sensor.id === id);
  }
  
  /**
   * Get sensors by hardware type
   */
  function getSensorsByHardware(hardware: SensorData['hardware']): SensorData[] {
    return sensorData.filter(sensor => sensor.hardware === hardware);
  }
  
  /**
   * Get sensors by data type
   */
  function getSensorsByType(type: SensorData['type']): SensorData[] {
    return sensorData.filter(sensor => sensor.type === type);
  }
  
  /**
   * Subscribe to specific sensor updates
   */
  function subscribeSensors(sensorIds: string[]): void {
    if (client?.getState() === 'connected') {
      client.send({
        type: 'subscribe',
        sensorIds,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Unsubscribe from sensor updates
   */
  function unsubscribeSensors(sensorIds: string[]): void {
    if (client?.getState() === 'connected') {
      client.send({
        type: 'unsubscribe',
        sensorIds,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Cleanup resources
   */
  function destroy(): void {
    client?.destroy();
    client = null;
  }
  
  // Return the store interface
  return {
    // Reactive state (read-only for external use)
    get sensorData() { return sensorData; },
    get connectionState() { return connectionState; },
    get lastUpdate() { return lastUpdate; },
    get errorMessage() { return errorMessage; },
    
    // Derived values
    get isConnected() { return isConnected; },
    get isReconnecting() { return isReconnecting; },
    get hasError() { return hasError; },
    get sensorsByType() { return sensorsByType; },
    get cpuSensors() { return cpuSensors; },
    get gpuSensors() { return gpuSensors; },
    get memorySensors() { return memorySensors; },
    get storageSensors() { return storageSensors; },
    get connectionStats() { return connectionStats; },
    
    // Actions
    connect,
    disconnect,
    refresh,
    getSensorById,
    getSensorsByHardware,
    getSensorsByType,
    subscribeSensors,
    unsubscribeSensors,
    destroy
  };
}

/**
 * Global sensor data store instance
 * Usage: import { sensorStore } from './websocket-client';
 */
export const sensorStore = createSensorDataStore();

/**
 * Connection status indicator component helper
 */
export function getConnectionStatusInfo(state: ConnectionState) {
  switch (state) {
    case 'connected':
      return {
        color: 'text-green-400',
        icon: '●',
        message: 'Connected'
      };
    case 'connecting':
      return {
        color: 'text-yellow-400',
        icon: '⋯',
        message: 'Connecting...'
      };
    case 'reconnecting':
      return {
        color: 'text-orange-400',
        icon: '↻',
        message: 'Reconnecting...'
      };
    case 'error':
      return {
        color: 'text-red-400',
        icon: '✕',
        message: 'Connection Error'
      };
    case 'disconnected':
    default:
      return {
        color: 'text-gray-400',
        icon: '○',
        message: 'Disconnected'
      };
  }
}

/**
 * Auto-connect on module load (browser environment only)
 */
if (typeof window !== 'undefined') {
  // Auto-connect when the module is imported
  sensorStore.connect();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    sensorStore.destroy();
  });
  
  // Handle visibility changes to pause/resume connection
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, can implement connection pausing if needed
    } else {
      // Page is visible, ensure connection is active
      if (sensorStore.connectionState === 'disconnected') {
        sensorStore.connect();
      }
    }
  });
}

/**
 * Usage example in a Svelte component:
 * 
 * <script lang="ts">
 *   import { sensorStore } from './websocket-client';
 *   
 *   // Access reactive sensor data
 *   $: cpuUsage = sensorStore.cpuSensors.find(s => s.type === 'usage')?.value || 0;
 *   $: isOnline = sensorStore.isConnected;
 * </script>
 * 
 * <div class="sensor-display">
 *   {#if isOnline}
 *     <span class="text-green-400">● Connected</span>
 *     <p>CPU Usage: {cpuUsage.toFixed(1)}%</p>
 *   {:else}
 *     <span class="text-red-400">○ Disconnected</span>
 *   {/if}
 * </div>
 */ 