// WebSocket sensor client utility
import type { HardwareComponent } from '$types/sensor.js';

export interface SensorClientConfig {
	url: string;
	reconnectInterval: number;
	maxReconnectAttempts: number;
	heartbeatInterval: number;
	timeout: number;
}

export interface SensorClientEvents {
	onConnect?: () => void;
	onDisconnect?: (reason: string) => void;
	onData?: (data: HardwareComponent[]) => void;
	onError?: (error: Error) => void;
	onReconnectAttempt?: (attempt: number) => void;
}

export class SensorClient {
	private websocket: WebSocket | null = null;
	private config: SensorClientConfig;
	private events: SensorClientEvents;
	private reconnectTimer: number | null = null;
	private heartbeatTimer: number | null = null;
	private reconnectAttempts = 0;
	private isManualDisconnect = false;
	private lastHeartbeat = 0;

	constructor(config: Partial<SensorClientConfig> = {}, events: SensorClientEvents = {}) {
		this.config = {
			url: 'ws://localhost:8000/sensors',
			reconnectInterval: 1000,
			maxReconnectAttempts: 5,
			heartbeatInterval: 30000,
			timeout: 10000,
			...config
		};
		this.events = events;
	}

	connect(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.websocket?.readyState === WebSocket.OPEN) {
				resolve();
				return;
			}

			this.isManualDisconnect = false;
			this.websocket = new WebSocket(this.config.url);

			const timeout = setTimeout(() => {
				this.websocket?.close();
				reject(new Error('Connection timeout'));
			}, this.config.timeout);

			this.websocket.onopen = () => {
				clearTimeout(timeout);
				console.log(`SensorClient connected to ${this.config.url}`);
				this.reconnectAttempts = 0;
				this.startHeartbeat();
				this.events.onConnect?.();
				resolve();
			};

			this.websocket.onmessage = (event) => {
				this.handleMessage(event);
			};

			this.websocket.onclose = (event) => {
				clearTimeout(timeout);
				this.handleClose(event);
			};

			this.websocket.onerror = (event) => {
				clearTimeout(timeout);
				this.handleError(event);
				reject(new Error('WebSocket connection failed'));
			};
		});
	}

	disconnect(): void {
		this.isManualDisconnect = true;
		this.clearTimers();
		
		if (this.websocket) {
			this.websocket.close(1000, 'Manual disconnect');
			this.websocket = null;
		}
	}

	send(data: any): boolean {
		if (this.websocket?.readyState === WebSocket.OPEN) {
			try {
				this.websocket.send(JSON.stringify(data));
				return true;
			} catch (error) {
				console.error('Failed to send data:', error);
				this.events.onError?.(error as Error);
				return false;
			}
		}
		return false;
	}

	getReadyState(): number {
		return this.websocket?.readyState ?? WebSocket.CLOSED;
	}

	isConnected(): boolean {
		return this.websocket?.readyState === WebSocket.OPEN;
	}

	getConnectionInfo() {
		return {
			url: this.config.url,
			readyState: this.getReadyState(),
			reconnectAttempts: this.reconnectAttempts,
			lastHeartbeat: this.lastHeartbeat,
			isManualDisconnect: this.isManualDisconnect
		};
	}

	private handleMessage(event: MessageEvent): void {
		try {
			// Handle heartbeat/ping messages
			if (event.data === 'ping') {
				this.send('pong');
				this.lastHeartbeat = Date.now();
				return;
			}

			// Handle sensor data
			const data = JSON.parse(event.data);
			
			// Validate data structure
			if (Array.isArray(data)) {
				this.events.onData?.(data as HardwareComponent[]);
			} else {
				console.warn('Received invalid sensor data format:', data);
			}
		} catch (error) {
			console.error('Error parsing sensor data:', error);
			this.events.onError?.(error as Error);
		}
	}

	private handleClose(event: CloseEvent): void {
		console.log(`SensorClient disconnected: ${event.code} - ${event.reason}`);
		this.clearTimers();
		this.events.onDisconnect?.(event.reason || 'Unknown reason');

		// Auto-reconnect unless manually disconnected
		if (!this.isManualDisconnect && this.reconnectAttempts < this.config.maxReconnectAttempts) {
			this.scheduleReconnect();
		}
	}

	private handleError(event: Event): void {
		console.error('SensorClient error:', event);
		const error = new Error('WebSocket connection error');
		this.events.onError?.(error);
	}

	private scheduleReconnect(): void {
		this.reconnectAttempts++;
		this.events.onReconnectAttempt?.(this.reconnectAttempts);

		// Exponential backoff with jitter
		const baseDelay = this.config.reconnectInterval;
		const exponentialDelay = baseDelay * Math.pow(2, this.reconnectAttempts - 1);
		const jitter = Math.random() * 0.1 * exponentialDelay;
		const delay = Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds

		console.log(`Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts})`);

		this.reconnectTimer = window.setTimeout(() => {
			this.connect().catch((error) => {
				console.error('Reconnection failed:', error);
				
				// If we've reached max attempts, stop trying
				if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
					console.error('Max reconnection attempts reached, giving up');
					this.events.onError?.(new Error('Max reconnection attempts reached'));
				}
			});
		}, delay);
	}

	private startHeartbeat(): void {
		this.lastHeartbeat = Date.now();
		
		this.heartbeatTimer = window.setInterval(() => {
			if (this.isConnected()) {
				this.send('ping');
			}
		}, this.config.heartbeatInterval);
	}

	private clearTimers(): void {
		if (this.reconnectTimer) {
			clearTimeout(this.reconnectTimer);
			this.reconnectTimer = null;
		}
		
		if (this.heartbeatTimer) {
			clearInterval(this.heartbeatTimer);
			this.heartbeatTimer = null;
		}
	}

	// Update configuration
	updateConfig(newConfig: Partial<SensorClientConfig>): void {
		this.config = { ...this.config, ...newConfig };
	}

	// Update event handlers
	updateEvents(newEvents: Partial<SensorClientEvents>): void {
		this.events = { ...this.events, ...newEvents };
	}

	// Get current statistics
	getStats() {
		return {
			connected: this.isConnected(),
			reconnectAttempts: this.reconnectAttempts,
			lastHeartbeat: this.lastHeartbeat,
			uptime: this.lastHeartbeat ? Date.now() - this.lastHeartbeat : 0,
			config: { ...this.config }
		};
	}
}

// Utility function to create a configured sensor client
export function createSensorClient(
	url?: string,
	events?: SensorClientEvents
): SensorClient {
	const config: Partial<SensorClientConfig> = url ? { url } : {};
	return new SensorClient(config, events);
}

// Browser detection utilities
export function isBrowserEnvironment(): boolean {
	return typeof window !== 'undefined' && typeof WebSocket !== 'undefined';
}

export function getWebSocketState(state: number): string {
	switch (state) {
		case WebSocket.CONNECTING: return 'CONNECTING';
		case WebSocket.OPEN: return 'OPEN';
		case WebSocket.CLOSING: return 'CLOSING';
		case WebSocket.CLOSED: return 'CLOSED';
		default: return 'UNKNOWN';
	}
}