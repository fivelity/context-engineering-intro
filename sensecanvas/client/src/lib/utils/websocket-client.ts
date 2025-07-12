/**
 * SenseCanvas WebSocket Client Utilities
 * Helper functions for WebSocket connection management and message handling
 */

// WebSocket message interface
export interface WebSocketMessage {
  type: string;
  timestamp: string;
  data?: any;
  [key: string]: any;
}

export interface WebSocketConfig {
  url: string;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  messageTimeout?: number;
}

export interface ConnectionOptions {
  protocols?: string[];
  headers?: Record<string, string>;
}

/**
 * Create a WebSocket URL with proper protocol based on current location
 */
export function createWebSocketUrl(endpoint: string = '/ws'): string {
  if (typeof window === 'undefined') {
    return 'ws://localhost:8000/ws';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = import.meta.env.VITE_WEBSOCKET_URL || 
               `${protocol}//${window.location.hostname}:8000`;
  
  return `${host}${endpoint}`;
}

/**
 * Parse and validate WebSocket messages
 */
export function parseWebSocketMessage(data: string): WebSocketMessage | null {
  try {
    const message = JSON.parse(data);
    
    // Basic validation
    if (!message.type || !message.timestamp) {
      console.warn('Invalid WebSocket message format:', message);
      return null;
    }
    
    return message as WebSocketMessage;
  } catch (error) {
    console.error('Failed to parse WebSocket message:', error);
    return null;
  }
}

/**
 * Create a subscription message
 */
export function createSubscriptionMessage(
  subscriptionType: string,
  options?: Record<string, any>
): string {
  return JSON.stringify({
    type: 'subscribe',
    subscription_type: subscriptionType,
    timestamp: new Date().toISOString(),
    ...options
  });
}

/**
 * Create an unsubscription message
 */
export function createUnsubscriptionMessage(subscriptionType: string): string {
  return JSON.stringify({
    type: 'unsubscribe',
    subscription_type: subscriptionType,
    timestamp: new Date().toISOString()
  });
}

/**
 * Calculate exponential backoff delay for reconnection
 */
export function calculateBackoffDelay(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number {
  const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * delay * 0.1;
  return Math.floor(delay + jitter);
}

/**
 * Check if WebSocket is supported in the current environment
 */
export function isWebSocketSupported(): boolean {
  return typeof WebSocket !== 'undefined';
}

/**
 * Format connection status for display
 */
export function formatConnectionStatus(
  readyState: number | undefined
): string {
  switch (readyState) {
    case WebSocket.CONNECTING:
      return 'Connecting...';
    case WebSocket.OPEN:
      return 'Connected';
    case WebSocket.CLOSING:
      return 'Closing...';
    case WebSocket.CLOSED:
      return 'Disconnected';
    default:
      return 'Unknown';
  }
}

/**
 * Create a heartbeat message
 */
export function createHeartbeatMessage(): string {
  return JSON.stringify({
    type: 'ping',
    timestamp: new Date().toISOString()
  });
}

/**
 * Check if a message is a heartbeat response
 */
export function isHeartbeatResponse(message: WebSocketMessage): boolean {
  return message.type === 'pong';
}

/**
 * Debounce WebSocket messages to prevent flooding
 */
export function createMessageDebouncer(delay: number = 100) {
  const pending = new Map<string, ReturnType<typeof setTimeout>>();
  
  return {
    send(key: string, message: string, sendFn: (msg: string) => void) {
      const existing = pending.get(key);
      if (existing) {
        clearTimeout(existing);
      }
      
      const timeout = setTimeout(() => {
        sendFn(message);
        pending.delete(key);
      }, delay);
      
      pending.set(key, timeout);
    },
    
    clear() {
      pending.forEach(timeout => clearTimeout(timeout));
      pending.clear();
    }
  };
}

/**
 * Track WebSocket metrics for monitoring
 */
export class WebSocketMetrics {
  private messageCount = 0;
  private bytesSent = 0;
  private bytesReceived = 0;
  private connectTime?: number;
  private disconnectTime?: number;
  private errors: Array<{ timestamp: number; error: string }> = [];
  
  onConnect() {
    this.connectTime = Date.now();
    this.disconnectTime = undefined;
  }
  
  onDisconnect() {
    this.disconnectTime = Date.now();
  }
  
  onMessageSent(message: string) {
    this.messageCount++;
    this.bytesSent += new Blob([message]).size;
  }
  
  onMessageReceived(message: string) {
    this.messageCount++;
    this.bytesReceived += new Blob([message]).size;
  }
  
  onError(error: string) {
    this.errors.push({ timestamp: Date.now(), error });
    // Keep only last 10 errors
    if (this.errors.length > 10) {
      this.errors.shift();
    }
  }
  
  getMetrics() {
    return {
      messageCount: this.messageCount,
      bytesSent: this.bytesSent,
      bytesReceived: this.bytesReceived,
      connectionDuration: this.connectTime && !this.disconnectTime 
        ? Date.now() - this.connectTime 
        : 0,
      isConnected: !!this.connectTime && !this.disconnectTime,
      recentErrors: this.errors
    };
  }
  
  reset() {
    this.messageCount = 0;
    this.bytesSent = 0;
    this.bytesReceived = 0;
    this.connectTime = undefined;
    this.disconnectTime = undefined;
    this.errors = [];
  }
}