/**
 * SenseCanvas Hardware Types
 * TypeScript types for hardware monitoring data (synced with server models)
 */

// Core hardware metric interfaces
export interface CoreMetric {
  id: number;
  usage: number;
  temperature: number;
}

export interface CpuMetrics {
  usage: number;
  temperature: number;
  cores: CoreMetric[];
  frequency: number;
  power: number;
}

export interface GpuMemory {
  used: number;
  total: number;
  usage: number;
}

export interface GpuFrequency {
  core: number;
  memory: number;
}

export interface GpuMetrics {
  usage: number;
  temperature: number;
  memory: GpuMemory;
  frequency: GpuFrequency;
  power: number;
  fanSpeed: number;
}

export interface MemoryMetrics {
  usage: number;
  used: number;
  total: number;
  available: number;
  speed: number;
}

export interface StorageMetrics {
  usage: number;
  used: number;
  total: number;
  temperature: number;
  health: string;
  name?: string;
  type?: string;
}

export interface NetworkMetrics {
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  speed: number;
  interface?: string;
}

export interface SystemMetrics {
  uptime: number;
  processes: number;
  temperature: number;
  bootTime?: number;
}

export interface HardwareMetrics {
  timestamp: number;
  cpu: CpuMetrics;
  gpu: GpuMetrics;
  memory: MemoryMetrics;
  storage: StorageMetrics[];
  network: NetworkMetrics;
  system: SystemMetrics;
}

// Hardware alert types
export interface HardwareAlert {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  value: number | string;
  threshold: number | string;
  timestamp: number;
  sensor: string;
}

// Hardware monitoring status
export interface HardwareStatus {
  isInitialized: boolean;
  useLibreHardware: boolean;
  adminPrivileges: boolean;
  availableSensors: string[];
  lastUpdate: number;
  errorCount: number;
  pollingInterval: number;
}

// Sensor type enumeration
export type SensorType = 'cpu' | 'gpu' | 'memory' | 'storage' | 'network';

// Hardware monitoring configuration
export interface HardwareConfig {
  pollingInterval: number;
  enabledSensors: SensorType[];
  alertThresholds: {
    cpuTemp: { warning: number; critical: number };
    gpuTemp: { warning: number; critical: number };
    memoryUsage: { warning: number; critical: number };
    storageUsage: { warning: number; critical: number };
  };
  enableAlerts: boolean;
  enableNotifications: boolean;
}

// Hardware monitoring events
export type HardwareEventType = 
  | 'metrics_updated'
  | 'alert_triggered'
  | 'sensor_error'
  | 'connection_lost'
  | 'connection_restored';

export interface HardwareEvent {
  type: HardwareEventType;
  timestamp: number;
  data?: any;
  message?: string;
}

// Utility types for hardware metrics
export type MetricValue = number | string;
export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type SpeedUnit = 'mhz' | 'ghz';
export type DataUnit = 'bytes' | 'kb' | 'mb' | 'gb' | 'tb';

// Hardware monitoring filters
export interface MetricsFilter {
  sensors?: SensorType[];
  timeRange?: {
    start: number;
    end: number;
  };
  includeAlerts?: boolean;
  maxDataPoints?: number;
}

// Hardware benchmark data
export interface BenchmarkData {
  sensor: SensorType;
  metric: string;
  value: number;
  timestamp: number;
  baseline?: number;
  percentile?: number;
}

// Hardware trend analysis
export interface TrendData {
  sensor: SensorType;
  metric: string;
  values: Array<{
    timestamp: number;
    value: number;
  }>;
  trend: 'increasing' | 'decreasing' | 'stable';
  changeRate: number;
}

// Hardware limits and specifications
export interface HardwareSpecs {
  cpu: {
    model: string;
    cores: number;
    threads: number;
    baseFrequency: number;
    maxFrequency: number;
    maxTemp: number;
    tdp: number;
  };
  gpu: {
    model: string;
    memory: number;
    baseFrequency: number;
    boostFrequency: number;
    maxTemp: number;
    tdp: number;
  };
  memory: {
    total: number;
    speed: number;
    type: string;
    channels: number;
  };
  storage: Array<{
    model: string;
    capacity: number;
    type: 'SSD' | 'HDD' | 'NVMe';
    interface: string;
  }>;
}

// Export all types for use in components
export type {
  CoreMetric,
  CpuMetrics,
  GpuMemory,
  GpuFrequency,
  GpuMetrics,
  MemoryMetrics,
  StorageMetrics,
  NetworkMetrics,
  SystemMetrics,
  HardwareMetrics,
  HardwareAlert,
  HardwareStatus,
  SensorType,
  HardwareConfig,
  HardwareEvent,
  HardwareEventType,
  MetricValue,
  TemperatureUnit,
  SpeedUnit,
  DataUnit,
  MetricsFilter,
  BenchmarkData,
  TrendData,
  HardwareSpecs
};