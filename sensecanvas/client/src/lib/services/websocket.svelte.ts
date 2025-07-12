/**
 * SenseCanvas WebSocket Client Service
 * Manages real-time connection to SenseCanvas server with Svelte 5 runes and automatic reconnection.
 */

import { browser } from '$app/environment';
import { hardwareStore } from '../stores/hardware.svelte.js';
import type { HardwareMetrics, HardwareAlert } from '../types/hardware.js';

interface WebSocketMessage {
  type: string;
  timestamp: string;
  [key: string]: any;
}

interface SubscriptionConfig {
  hardware_metrics: boolean;
  alerts: boolean;
  system_status: boolean;
}

// ✅ Using Svelte 5 runes for reactive WebSocket state
let ws = $state<WebSocket | null>(null);
let reconnectAttempts = $state(0);
let maxReconnectAttempts = $state(10);
let reconnectDelay = $state(1000);
let isReconnecting = $state(false);
let subscriptions = $state<SubscriptionConfig>({
  hardware_metrics: false,
  alerts: false,
  system_status: false
});

// ✅ Derived connection state
let isConnected = $derived(() => ws?.readyState === WebSocket.OPEN);
let canReconnect = $derived(() => reconnectAttempts < maxReconnectAttempts);

class WebSocketService {
  private serverUrl: string;
  private pingInterval: number = 30000; // 30 seconds
  private pingTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(serverUrl: string = 'ws://localhost:8000/ws') {
    this.serverUrl = serverUrl;
    
    // Only initialize in browser environment
    if (browser) {
      this.initialize();
    }
  }

  private initialize() {
    // ✅ Using $effect for side effects with cleanup
    $effect(() => {
      if (browser) {
        this.connect();
        
        // Cleanup function - CRITICAL for preventing memory leaks
        return () => {
          this.disconnect();
        };
      }
    });
  }

  private connect(): void {
    if (!browser || ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      hardwareStore.setConnectionState('connecting');
      console.log('🔌 Connecting to SenseCanvas WebSocket...');

      ws = new WebSocket(this.serverUrl);

      ws.onopen = this.handleOpen.bind(this);
      ws.onmessage = this.handleMessage.bind(this);
      ws.onclose = this.handleClose.bind(this);
      ws.onerror = this.handleError.bind(this);

    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      hardwareStore.setConnectionError(`Connection failed: ${error}`);
      this.scheduleReconnect();
    }
  }

  private handleOpen(): void {
    console.log('✅ Connected to SenseCanvas WebSocket server');
    hardwareStore.setConnectionState('connected');
    hardwareStore.setConnectionError(null);
    
    reconnectAttempts = 0;
    isReconnecting = false;
    
    // Start ping/pong heartbeat
    this.startPingInterval();
    
    // Auto-subscribe to hardware metrics
    this.subscribe('hardware_metrics');
    this.subscribe('alerts');
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'connection_established':
          hardwareStore.setClientId(message.client_id);
          console.log(`📡 Client ID: ${message.client_id}`);
          break;

        case 'hardware_metrics':
          if (hardwareStore.isValidMetrics(message.data)) {
            hardwareStore.setMetrics(message.data as HardwareMetrics);
          }
          break;

        case 'current_metrics':
          if (hardwareStore.isValidMetrics(message.data)) {
            hardwareStore.setMetrics(message.data as HardwareMetrics);
          }
          break;

        case 'alerts':
          if (Array.isArray(message.alerts)) {
            const validAlerts = message.alerts.filter(alert => 
              hardwareStore.isValidAlert(alert)
            );
            hardwareStore.addAlerts(validAlerts as HardwareAlert[]);
          }
          break;

        case 'hardware_status':
          if (message.status) {
            hardwareStore.setStatus(message.status);
          }
          break;

        case 'subscription_confirmed':
          console.log(`✅ Subscribed to ${message.subscription_type}`);
          if (message.subscription_type in subscriptions) {
            subscriptions[message.subscription_type as keyof SubscriptionConfig] = true;
          }
          break;

        case 'unsubscription_confirmed':
          console.log(`✅ Unsubscribed from ${message.subscription_type}`);
          if (message.subscription_type in subscriptions) {
            subscriptions[message.subscription_type as keyof SubscriptionConfig] = false;
          }
          break;

        case 'ping':
          this.sendMessage({ type: 'ping' });
          break;

        case 'pong':
          // Heartbeat received, connection is healthy
          break;

        case 'error':
          console.error('❌ Server error:', message.message);
          hardwareStore.setConnectionError(message.message);
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }

    } catch (error) {
      console.error('❌ Failed to parse WebSocket message:', error);
    }
  }

  private handleClose(event: CloseEvent): void {
    console.log('🔌 WebSocket connection closed', event.code, event.reason);
    hardwareStore.setConnectionState('disconnected');
    
    this.stopPingInterval();
    
    // Reset subscription states
    subscriptions = {
      hardware_metrics: false,
      alerts: false,
      system_status: false
    };

    // Attempt reconnection if not a clean close
    if (event.code !== 1000 && canReconnect()) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('❌ WebSocket error:', error);
    hardwareStore.setConnectionError('WebSocket connection error');
  }

  private scheduleReconnect(): void {
    if (!canReconnect() || isReconnecting) {
      return;
    }

    isReconnecting = true;
    reconnectAttempts++;
    
    const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts - 1), 30000);
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(() => {
      if (canReconnect()) {
        this.connect();
      }
    }, delay);
  }

  private startPingInterval(): void {
    this.pingTimer = setInterval(() => {
      if (isConnected()) {
        this.sendMessage({ type: 'ping' });
      }
    }, this.pingInterval);
  }

  private stopPingInterval(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  // Public API methods
  public sendMessage(message: object): boolean {
    if (!isConnected()) {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      ws!.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error('❌ Failed to send WebSocket message:', error);
      return false;
    }
  }

  public subscribe(subscriptionType: keyof SubscriptionConfig): boolean {
    return this.sendMessage({
      type: 'subscribe',
      subscription_type: subscriptionType
    });
  }

  public unsubscribe(subscriptionType: keyof SubscriptionConfig): boolean {
    return this.sendMessage({
      type: 'unsubscribe',
      subscription_type: subscriptionType
    });
  }

  public getCurrentMetrics(): boolean {
    return this.sendMessage({ type: 'get_current_metrics' });
  }

  public getHardwareStatus(): boolean {
    return this.sendMessage({ type: 'get_hardware_status' });
  }

  public setAlertThreshold(alertType: string, value: number): boolean {
    return this.sendMessage({
      type: 'set_alert_threshold',
      alert_type: alertType,
      value: value
    });
  }

  public disconnect(): void {
    console.log('🔌 Disconnecting WebSocket...');
    
    // Clear timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPingInterval();

    // Close WebSocket connection
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      ws.close(1000, 'Client disconnect');
    }
    
    ws = null;
    isReconnecting = false;
    hardwareStore.setConnectionState('disconnected');
  }

  public reconnect(): void {
    this.disconnect();
    reconnectAttempts = 0;
    this.connect();
  }

  // Getters for reactive state
  get connected(): boolean { return isConnected(); }
  get reconnecting(): boolean { return isReconnecting; }
  get attempts(): number { return reconnectAttempts; }
  get canReconnect(): boolean { return canReconnect(); }
  get subscriptionStatus(): SubscriptionConfig { return subscriptions; }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Export reactive getters for use in components
export const websocketStore = {
  get connected() { return isConnected(); },
  get reconnecting() { return isReconnecting; },
  get attempts() { return reconnectAttempts; },
  get canReconnect() { return canReconnect(); },
  get subscriptions() { return subscriptions; },
  get service() { return websocketService; },
  
  // Public methods
  async initialize() {
    // The service auto-initializes in the constructor
    return Promise.resolve();
  },
  
  reconnect() {
    websocketService.reconnect();
  }
};