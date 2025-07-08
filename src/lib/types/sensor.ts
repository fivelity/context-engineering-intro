// Hardware sensor data types (PyHardwareMonitor format)
export interface SensorReading {
	timestamp: number;
	value: number;
	unit: string;
	name: string;
	sensorType: 'Temperature' | 'Load' | 'Fan' | 'Voltage' | 'Clock' | 'Data' | 'Control';
	hardwareType: 'Cpu' | 'GpuNvidia' | 'GpuAmd' | 'Memory' | 'Motherboard' | 'Storage';
	identifier: string;
}

export interface HardwareComponent {
	name: string;
	hardwareType: string;
	sensors: SensorReading[];
}

export interface SensorData {
	cpu: {
		usage: number;
		temperature: number;
		frequency: number;
		voltage: number;
	};
	gpu: {
		usage: number;
		temperature: number;
		memory: number;
		fanSpeed: number;
		voltage: number;
	};
	memory: {
		usage: number;
		available: number;
		total: number;
	};
	storage: {
		usage: number;
		temperature: number;
		readSpeed: number;
		writeSpeed: number;
	};
	fans: {
		[key: string]: number; // RPM values
	};
	voltages: {
		[key: string]: number; // Voltage values
	};
	motherboard: {
		temperature: number;
		voltage: number;
	};
}

export interface SensorHistory {
	timestamp: number;
	data: SensorData;
}

export interface SensorStats {
	min: number;
	max: number;
	avg: number;
	current: number;
}

// Sensor type mappings for units
export const SENSOR_TYPE_UNITS = {
	Temperature: '°C',
	Load: '%',
	Fan: 'RPM',
	Voltage: 'V',
	Clock: 'MHz',
	Data: 'GB',
	Control: '%'
} as const;

export type SensorType = keyof typeof SENSOR_TYPE_UNITS;
export type HardwareType = 'Cpu' | 'GpuNvidia' | 'GpuAmd' | 'Memory' | 'Motherboard' | 'Storage';