/**
 * Sensor data types based on PyHardwareMonitor and LibreHardwareMonitorLib format
 * These types mirror the exact sensor data structure from the backend
 */

export type SensorType = 
  | 'Temperature' 
  | 'Load' 
  | 'Fan' 
  | 'Voltage' 
  | 'Clock' 
  | 'Data' 
  | 'Control';

export type HardwareType = 
  | 'Cpu' 
  | 'GpuNvidia' 
  | 'GpuAmd' 
  | 'Memory' 
  | 'Motherboard' 
  | 'Storage'
  | 'Network';

export interface SensorReading {
  timestamp: number;
  value: number;
  unit: string;
  name: string;
  sensorType: SensorType;
  hardwareType: HardwareType;
  identifier: string;
  min?: number;
  max?: number;
}

export interface HardwareComponent {
  name: string;
  hardwareType: HardwareType;
  identifier: string;
  sensors: SensorReading[];
  subHardware?: HardwareComponent[];
}

export interface CpuCore {
  id: number;
  usage: number;
  temperature: number;
  frequency: number;
}

export interface CpuData {
  usage: number;
  temperature: number;
  frequency: number;
  voltage: number;
  power: number;
  cores: CpuCore[];
}

export interface GpuMemory {
  used: number;
  total: number;
  usage: number;
}

export interface GpuData {
  id: number;
  name: string;
  usage: number;
  temperature: number;
  memory: GpuMemory;
  fanSpeed: number;
  voltage: number;
  powerDraw: number;
  clockCore: number;
  clockMemory: number;
}

export interface MemoryData {
  usage: number;
  available: number;
  total: number;
  used: number;
  speed: number;
  voltage: number;
}

export interface StorageDevice {
  id: string;
  name: string;
  usage: number;
  temperature: number;
  readSpeed: number;
  writeSpeed: number;
  health: number;
  totalSpace: number;
  usedSpace: number;
}

export interface FanData {
  name: string;
  rpm: number;
  percentage: number;
  minRpm: number;
  maxRpm: number;
}

export interface VoltageData {
  name: string;
  value: number;
  min: number;
  max: number;
}

export interface MotherboardData {
  temperature: number;
  voltage: number;
  name: string;
  manufacturer: string;
}

export interface NetworkAdapter {
  name: string;
  bytesReceived: number;
  bytesSent: number;
  packetsReceived: number;
  packetsSent: number;
  downloadSpeed: number;
  uploadSpeed: number;
}

// Main sensor data structure - the complete system snapshot
export interface SensorData {
  timestamp: number;
  cpu: CpuData;
  gpu: GpuData[];
  memory: MemoryData;
  storage: StorageDevice[];
  fans: Record<string, FanData>;
  voltages: Record<string, VoltageData>;
  motherboard: MotherboardData;
  network: NetworkAdapter[];
}

// WebSocket message types for real-time communication
export interface WebSocketMessage<T = any> {
  type: 'sensor_data' | 'connection_status' | 'error' | 'ping' | 'pong';
  data: T;
  timestamp: number;
}

export interface SensorDataMessage extends WebSocketMessage<SensorData> {
  type: 'sensor_data';
}

export interface ConnectionStatusMessage extends WebSocketMessage {
  type: 'connection_status';
  data: {
    connected: boolean;
    clientCount: number;
    uptime: number;
  };
}

export interface ErrorMessage extends WebSocketMessage {
  type: 'error';
  data: {
    code: string;
    message: string;
    details?: any;
  };
}

// Type-safe sensor path strings using template literals
export type SensorPath = 
  | 'cpu.usage' 
  | 'cpu.temperature' 
  | 'cpu.frequency'
  | 'cpu.voltage'
  | 'cpu.power'
  | `cpu.cores.${number}.usage`
  | `cpu.cores.${number}.temperature`
  | `cpu.cores.${number}.frequency`
  | `gpu.${number}.usage` 
  | `gpu.${number}.temperature`
  | `gpu.${number}.memory.usage`
  | `gpu.${number}.memory.used`
  | `gpu.${number}.fanSpeed`
  | `gpu.${number}.voltage`
  | `gpu.${number}.powerDraw`
  | `gpu.${number}.clockCore`
  | `gpu.${number}.clockMemory`
  | 'memory.usage'
  | 'memory.available'
  | 'memory.used'
  | 'memory.speed'
  | 'memory.voltage'
  | `storage.${string}.usage`
  | `storage.${string}.temperature`
  | `storage.${string}.readSpeed`
  | `storage.${string}.writeSpeed`
  | `storage.${string}.health`
  | `fans.${string}.rpm`
  | `fans.${string}.percentage`
  | `voltages.${string}.value`
  | 'motherboard.temperature'
  | 'motherboard.voltage'
  | `network.${number}.downloadSpeed`
  | `network.${number}.uploadSpeed`
  | `network.${number}.bytesReceived`
  | `network.${number}.bytesSent`;

// Utility type to get the value type for a sensor path
export type SensorValue<T extends SensorPath> = 
  T extends `cpu.cores.${number}.${infer U}` 
    ? U extends keyof CpuCore 
      ? CpuCore[U] 
      : never
  : T extends `gpu.${number}.${infer U}`
    ? U extends keyof GpuData
      ? GpuData[U]
      : never
  : T extends `gpu.${number}.memory.${infer U}`
    ? U extends keyof GpuMemory
      ? GpuMemory[U]
      : never
  : T extends `storage.${string}.${infer U}`
    ? U extends keyof StorageDevice
      ? StorageDevice[U]
      : never
  : T extends `fans.${string}.${infer U}`
    ? U extends keyof FanData
      ? FanData[U]
      : never
  : T extends `voltages.${string}.${infer U}`
    ? U extends keyof VoltageData
      ? VoltageData[U]
      : never
  : T extends `network.${number}.${infer U}`
    ? U extends keyof NetworkAdapter
      ? NetworkAdapter[U]
      : never
  : T extends keyof SensorData
    ? SensorData[T]
    : T extends `cpu.${infer U}`
      ? U extends keyof CpuData
        ? CpuData[U]
        : never
    : T extends `memory.${infer U}`
      ? U extends keyof MemoryData
        ? MemoryData[U]
        : never
    : T extends `motherboard.${infer U}`
      ? U extends keyof MotherboardData
        ? MotherboardData[U]
        : never
    : never;

// Sensor unit mapping based on sensor type
export const SENSOR_UNITS: Record<SensorType, string> = {
  'Temperature': '°C',
  'Load': '%',
  'Fan': 'RPM',
  'Voltage': 'V',
  'Clock': 'MHz',
  'Data': 'GB',
  'Control': '%'
};

// Hardware type display names
export const HARDWARE_NAMES: Record<HardwareType, string> = {
  'Cpu': 'CPU',
  'GpuNvidia': 'NVIDIA GPU',
  'GpuAmd': 'AMD GPU',
  'Memory': 'Memory',
  'Motherboard': 'Motherboard',
  'Storage': 'Storage',
  'Network': 'Network'
};

// Utility function to get sensor unit based on path
export function getSensorUnit(sensorPath: SensorPath): string {
  if (sensorPath.includes('temperature')) return '°C';
  if (sensorPath.includes('usage') || sensorPath.includes('load')) return '%';
  if (sensorPath.includes('frequency') || sensorPath.includes('clock')) return 'MHz';
  if (sensorPath.includes('voltage')) return 'V';
  if (sensorPath.includes('fan') || sensorPath.includes('rpm')) return 'RPM';
  if (sensorPath.includes('Speed')) return 'MB/s';
  if (sensorPath.includes('power') || sensorPath.includes('Power')) return 'W';
  if (sensorPath.includes('bytes') || sensorPath.includes('Bytes')) return 'B';
  if (sensorPath.includes('health')) return '%';
  return '';
}

// Utility function to get sensor display name
export function getSensorDisplayName(sensorPath: SensorPath): string {
  const parts = sensorPath.split('.');
  const component = parts[0];
  const property = parts[parts.length - 1];
  
  const componentNames: Record<string, string> = {
    cpu: 'CPU',
    gpu: 'GPU',
    memory: 'Memory',
    storage: 'Storage',
    fans: 'Fan',
    voltages: 'Voltage',
    motherboard: 'Motherboard',
    network: 'Network'
  };
  
  const propertyNames: Record<string, string> = {
    usage: 'Usage',
    temperature: 'Temperature',
    frequency: 'Frequency',
    voltage: 'Voltage',
    power: 'Power',
    rpm: 'RPM',
    percentage: 'Speed',
    readSpeed: 'Read Speed',
    writeSpeed: 'Write Speed',
    health: 'Health',
    downloadSpeed: 'Download',
    uploadSpeed: 'Upload'
  };
  
  return `${componentNames[component] || component} ${propertyNames[property] || property}`;
}