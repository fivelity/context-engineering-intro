// Real-time sensor data store (Svelte 5)
import type { SensorData, HardwareComponent, SensorHistory } from '$types/sensor.js';

// Svelte 5 state for real-time sensor data
let sensorData = $state<SensorData>({
	cpu: { usage: 0, temperature: 0, frequency: 0, voltage: 0 },
	gpu: { usage: 0, temperature: 0, memory: 0, fanSpeed: 0, voltage: 0 },
	memory: { usage: 0, available: 0, total: 0 },
	storage: { usage: 0, temperature: 0, readSpeed: 0, writeSpeed: 0 },
	fans: {},
	voltages: {},
	motherboard: { temperature: 0, voltage: 0 }
});

let connectionStatus = $state<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
let lastUpdate = $state<number>(0);
let websocket = $state<WebSocket | null>(null);
let reconnectAttempts = $state<number>(0);
let maxReconnectAttempts = $state<number>(5);
let reconnectDelay = $state<number>(1000);

// History for trends and graphs
let sensorHistory = $state<SensorHistory[]>([]);
const maxHistoryLength = 100;

// Connection management
let isConnecting = $state<boolean>(false);

export const sensorStore = {
	// Getters for reactive data
	get data() { return sensorData; },
	get status() { return connectionStatus; },
	get lastUpdate() { return lastUpdate; },
	get history() { return sensorHistory; },
	get isConnected() { return connectionStatus === 'connected'; },
	get isReconnecting() { return connectionStatus === 'reconnecting'; },
	
	// Connection management
	connect(url: string = 'ws://localhost:8000/sensors') {
		if (isConnecting || websocket?.readyState === WebSocket.OPEN) {
			console.log('WebSocket already connecting or connected');
			return;
		}

		isConnecting = true;
		connectionStatus = 'reconnecting';

		try {
			websocket = new WebSocket(url);
			
			websocket.onopen = () => {
				console.log('WebSocket connected');
				connectionStatus = 'connected';
				isConnecting = false;
				reconnectAttempts = 0;
				reconnectDelay = 1000;
			};

			websocket.onmessage = (event) => {
				try {
					const rawData: HardwareComponent[] = JSON.parse(event.data);
					sensorData = this.parseHardwareData(rawData);
					lastUpdate = Date.now();
					
					// Add to history
					this.addToHistory(sensorData);
				} catch (error) {
					console.error('Error parsing sensor data:', error);
				}
			};

			websocket.onclose = (event) => {
				console.log('WebSocket closed:', event.code, event.reason);
				connectionStatus = 'disconnected';
				isConnecting = false;
				websocket = null;
				
				// Auto-reconnect with exponential backoff
				if (reconnectAttempts < maxReconnectAttempts) {
					this.scheduleReconnect(url);
				} else {
					console.error('Max reconnection attempts reached');
				}
			};

			websocket.onerror = (error) => {
				console.error('WebSocket error:', error);
				connectionStatus = 'disconnected';
				isConnecting = false;
			};

		} catch (error) {
			console.error('Failed to create WebSocket:', error);
			connectionStatus = 'disconnected';
			isConnecting = false;
		}
	},

	disconnect() {
		if (websocket) {
			websocket.close(1000, 'User initiated disconnect');
			websocket = null;
		}
		connectionStatus = 'disconnected';
		isConnecting = false;
		reconnectAttempts = maxReconnectAttempts; // Prevent auto-reconnect
	},

	scheduleReconnect(url: string) {
		reconnectAttempts++;
		const delay = Math.min(reconnectDelay * Math.pow(2, reconnectAttempts - 1), 30000);
		
		console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
		
		setTimeout(() => {
			if (connectionStatus === 'disconnected') {
				this.connect(url);
			}
		}, delay);
	},

	// Parse PyHardwareMonitor data format
	parseHardwareData(hardware: HardwareComponent[]): SensorData {
		const parsed: SensorData = {
			cpu: { usage: 0, temperature: 0, frequency: 0, voltage: 0 },
			gpu: { usage: 0, temperature: 0, memory: 0, fanSpeed: 0, voltage: 0 },
			memory: { usage: 0, available: 0, total: 0 },
			storage: { usage: 0, temperature: 0, readSpeed: 0, writeSpeed: 0 },
			fans: {},
			voltages: {},
			motherboard: { temperature: 0, voltage: 0 }
		};

		hardware.forEach(component => {
			component.sensors.forEach(sensor => {
				const value = sensor.value || 0;
				
				// Map LibreHardwareMonitorLib sensor types to UI data
				switch (component.hardwareType) {
					case 'Cpu':
						if (sensor.sensorType === 'Load' && sensor.name.includes('Total')) {
							parsed.cpu.usage = value;
						} else if (sensor.sensorType === 'Temperature') {
							parsed.cpu.temperature = Math.max(parsed.cpu.temperature, value);
						} else if (sensor.sensorType === 'Clock') {
							parsed.cpu.frequency = Math.max(parsed.cpu.frequency, value);
						} else if (sensor.sensorType === 'Voltage' && sensor.name.includes('Core')) {
							parsed.cpu.voltage = value;
						}
						break;

					case 'GpuNvidia':
					case 'GpuAmd':
						if (sensor.sensorType === 'Load' && sensor.name.includes('Core')) {
							parsed.gpu.usage = value;
						} else if (sensor.sensorType === 'Temperature') {
							parsed.gpu.temperature = value;
						} else if (sensor.sensorType === 'Load' && sensor.name.includes('Memory')) {
							parsed.gpu.memory = value;
						} else if (sensor.sensorType === 'Fan') {
							parsed.gpu.fanSpeed = value;
						} else if (sensor.sensorType === 'Voltage') {
							parsed.gpu.voltage = value;
						}
						break;

					case 'Memory':
						if (sensor.sensorType === 'Load') {
							parsed.memory.usage = value;
						} else if (sensor.sensorType === 'Data' && sensor.name.includes('Available')) {
							parsed.memory.available = value;
						} else if (sensor.sensorType === 'Data' && sensor.name.includes('Used')) {
							parsed.memory.total = parsed.memory.available + value;
						}
						break;

					case 'Storage':
						if (sensor.sensorType === 'Load') {
							parsed.storage.usage = value;
						} else if (sensor.sensorType === 'Temperature') {
							parsed.storage.temperature = value;
						} else if (sensor.sensorType === 'Data' && sensor.name.includes('Read Rate')) {
							parsed.storage.readSpeed = value;
						} else if (sensor.sensorType === 'Data' && sensor.name.includes('Write Rate')) {
							parsed.storage.writeSpeed = value;
						}
						break;

					case 'Motherboard':
						if (sensor.sensorType === 'Temperature') {
							parsed.motherboard.temperature = Math.max(parsed.motherboard.temperature, value);
						} else if (sensor.sensorType === 'Voltage') {
							parsed.motherboard.voltage = value;
						} else if (sensor.sensorType === 'Fan') {
							parsed.fans[sensor.name] = value;
						}
						break;
				}

				// Collect all voltage readings
				if (sensor.sensorType === 'Voltage') {
					parsed.voltages[sensor.name] = value;
				}

				// Collect all fan readings
				if (sensor.sensorType === 'Fan') {
					parsed.fans[sensor.name] = value;
				}
			});
		});

		return parsed;
	},

	addToHistory(data: SensorData) {
		const historyEntry: SensorHistory = {
			timestamp: Date.now(),
			data: { ...data }
		};

		sensorHistory = [...sensorHistory, historyEntry].slice(-maxHistoryLength);
	},

	// Get sensor value by path (e.g., 'cpu.usage', 'gpu.temperature')
	getSensorValue(path: string): number {
		const parts = path.split('.');
		let value: any = sensorData;
		
		for (const part of parts) {
			if (value && typeof value === 'object' && part in value) {
				value = value[part];
			} else {
				return 0;
			}
		}
		
		return typeof value === 'number' ? value : 0;
	},

	// Get historical data for a sensor path
	getHistoryForSensor(path: string, limit: number = 50): Array<{ timestamp: number; value: number }> {
		return sensorHistory
			.slice(-limit)
			.map(entry => ({
				timestamp: entry.timestamp,
				value: this.getSensorValueFromData(entry.data, path)
			}));
	},

	getSensorValueFromData(data: SensorData, path: string): number {
		const parts = path.split('.');
		let value: any = data;
		
		for (const part of parts) {
			if (value && typeof value === 'object' && part in value) {
				value = value[part];
			} else {
				return 0;
			}
		}
		
		return typeof value === 'number' ? value : 0;
	},

	// Clear history
	clearHistory() {
		sensorHistory = [];
	},

	// Get connection stats
	getConnectionStats() {
		return {
			status: connectionStatus,
			reconnectAttempts,
			lastUpdate,
			historyLength: sensorHistory.length,
			isConnecting
		};
	},

	// Set mock data for testing
	setMockData(mockData: Partial<SensorData>) {
		sensorData = { ...sensorData, ...mockData };
		lastUpdate = Date.now();
		this.addToHistory(sensorData);
	}
};