// SenseCanvas: Hardware Sensor Type Definitions
// Used across frontend examples for consistent typing

export interface CpuMetrics {
  usage: number; // Percentage 0-100
  temperature: number; // Celsius
  cores: Array<{
    id: number;
    usage: number;
    temperature: number;
  }>;
  frequency: number; // MHz
  power: number; // Watts
}

export interface GpuMetrics {
  usage: number; // Percentage 0-100
  temperature: number; // Celsius
  memory: {
    used: number; // MB
    total: number; // MB
    usage: number; // Percentage 0-100
  };
  frequency: {
    core: number; // MHz
    memory: number; // MHz
  };
  power: number; // Watts
  fanSpeed: number; // RPM
}

export interface MemoryMetrics {
  usage: number; // Percentage 0-100
  used: number; // MB
  total: number; // MB
  available: number; // MB
  speed: number; // MHz
}

export interface StorageMetrics {
  usage: number; // Percentage 0-100
  used: number; // GB
  total: number; // GB
  temperature: number; // Celsius
  health: 'good' | 'warning' | 'critical';
}

export interface NetworkMetrics {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  speed: number; // Mbps
}

export interface HardwareMetrics {
  timestamp: number;
  cpu: CpuMetrics;
  gpu: GpuMetrics;
  memory: MemoryMetrics;
  storage: StorageMetrics[];
  network: NetworkMetrics;
  system: {
    uptime: number; // seconds
    processes: number;
    temperature: number; // Celsius (motherboard)
  };
}

export interface SensorAlert {
  id: string;
  sensorType: string;
  sensorName: string;
  threshold: number;
  currentValue: number;
  severity: 'warning' | 'critical';
  timestamp: number;
  message: string;
}

export interface SensorConfig {
  id: string;
  name: string;
  type: 'cpu' | 'gpu' | 'memory' | 'storage' | 'network';
  enabled: boolean;
  refreshRate: number; // milliseconds
  alerts: {
    enabled: boolean;
    thresholds: {
      warning: number;
      critical: number;
    };
  };
}

export type SensorType = 'cpu' | 'gpu' | 'memory' | 'storage' | 'network';
export type AlertLevel = 'normal' | 'warning' | 'critical';
export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error' | 'loading'; 