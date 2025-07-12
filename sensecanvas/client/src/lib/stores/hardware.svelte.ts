/**
 * SenseCanvas Hardware Data Store
 * Svelte 5 runes-based store for managing real-time hardware metrics and WebSocket connection.
 */

import type { 
  HardwareMetrics, 
  HardwareAlert, 
  HardwareStatus,
  ConnectionState 
} from '../types/hardware.js';

// ✅ Using Svelte 5 runes for reactive state management
let hardwareMetrics = $state<HardwareMetrics | null>(null);
let hardwareStatus = $state<HardwareStatus | null>(null);
let alerts = $state<HardwareAlert[]>([]);
let connectionState = $state<ConnectionState>('disconnected');
let connectionError = $state<string | null>(null);
let lastUpdateTime = $state<number>(0);
let clientId = $state<string | null>(null);

// ✅ Derived computed values
let isConnected = $derived(() => connectionState === 'connected');
let hasRecentData = $derived(() => {
  if (!lastUpdateTime) return false;
  return (Date.now() - lastUpdateTime) < 5000; // Data is recent if < 5 seconds old
});

let connectionHealth = $derived(() => {
  if (connectionError) return 'error';
  if (!isConnected) return 'disconnected';
  if (!hasRecentData()) return 'stale';
  return 'healthy';
});

let cpuMetrics = $derived(() => hardwareMetrics?.cpu || null);
let gpuMetrics = $derived(() => hardwareMetrics?.gpu || null);
let memoryMetrics = $derived(() => hardwareMetrics?.memory || null);
let storageMetrics = $derived(() => hardwareMetrics?.storage || []);
let networkMetrics = $derived(() => hardwareMetrics?.network || null);
let systemMetrics = $derived(() => hardwareMetrics?.system || null);

// Alert filtering and sorting
let criticalAlerts = $derived(() => 
  alerts.filter(alert => alert.severity === 'critical')
);

let warningAlerts = $derived(() => 
  alerts.filter(alert => alert.severity === 'warning')
);

let sortedAlerts = $derived(() => 
  [...alerts].sort((a, b) => b.timestamp - a.timestamp)
);

// Temperature monitoring
let highestTemperature = $derived(() => {
  const temps = [];
  const cpu = cpuMetrics();
  const gpu = gpuMetrics();
  const system = systemMetrics();
  if (cpu) temps.push(cpu.temperature);
  if (gpu) temps.push(gpu.temperature);
  if (system) temps.push(system.temperature);
  return temps.length > 0 ? Math.max(...temps.filter(t => t > 0)) : 0;
});

// Usage monitoring  
let systemLoad = $derived(() => {
  const cpu = cpuMetrics();
  const memory = memoryMetrics();
  if (!cpu || !memory) return 0;
  return Math.max(cpu.usage, memory.usage);
});

/**
 * Store actions and methods
 */
export const hardwareStore = {
  // State getters (read-only access to reactive state)
  get metrics() { return hardwareMetrics; },
  get status() { return hardwareStatus; },
  get alerts() { return sortedAlerts(); },
  get connectionState() { return connectionState; },
  get connectionError() { return connectionError; },
  get lastUpdateTime() { return lastUpdateTime; },
  get clientId() { return clientId; },
  
  // Derived getters
  get isConnected() { return isConnected(); },
  get hasData() { return hasRecentData(); },
  get hasRecentData() { return hasRecentData(); },
  get connectionHealth() { return connectionHealth(); },
  get cpu() { return cpuMetrics(); },
  get gpu() { return gpuMetrics(); },
  get memory() { return memoryMetrics(); },
  get storage() { return storageMetrics(); },
  get network() { return networkMetrics(); },
  get system() { return systemMetrics(); },
  get criticalAlerts() { return criticalAlerts(); },
  get warningAlerts() { return warningAlerts(); },
  get highestTemperature() { return highestTemperature(); },
  get systemLoad() { return systemLoad(); },

  // State setters (internal use)
  setMetrics(metrics: HardwareMetrics) {
    hardwareMetrics = metrics;
    lastUpdateTime = Date.now();
  },

  setStatus(status: HardwareStatus) {
    hardwareStatus = status;
  },

  addAlert(alert: HardwareAlert) {
    alerts = [...alerts, alert];
  },

  addAlerts(newAlerts: HardwareAlert[]) {
    alerts = [...alerts, ...newAlerts];
  },

  clearAlerts() {
    alerts = [];
  },

  removeAlert(alertId: string) {
    alerts = alerts.filter(alert => alert.timestamp.toString() !== alertId);
  },

  setConnectionState(state: ConnectionState) {
    connectionState = state;
    if (state === 'connected') {
      connectionError = null;
    }
  },

  setConnectionError(error: string | null) {
    connectionError = error;
    if (error) {
      connectionState = 'error';
    }
  },

  setClientId(id: string) {
    clientId = id;
  },

  // Utility methods
  getMetricValue(metricPath: string): number {
    if (!hardwareMetrics) return 0;
    
    const pathParts = metricPath.split('.');
    let current: any = hardwareMetrics;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return 0;
      }
    }
    
    return typeof current === 'number' ? current : 0;
  },

  getCoreMetrics(coreId: number) {
    return cpuMetrics()?.cores?.find(core => core.id === coreId) || null;
  },

  getStorageByName(name: string) {
    return storageMetrics().find(storage => storage.name === name) || null;
  },

  // Data validation
  isValidMetrics(data: any): data is HardwareMetrics {
    return data && 
           typeof data === 'object' &&
           'timestamp' in data &&
           'cpu' in data &&
           'memory' in data;
  },

  isValidAlert(data: any): data is HardwareAlert {
    return data &&
           typeof data === 'object' &&
           'type' in data &&
           'severity' in data &&
           'message' in data &&
           'timestamp' in data;
  },

  // Reset store state
  reset() {
    hardwareMetrics = null;
    hardwareStatus = null;
    alerts = [];
    connectionState = 'disconnected';
    connectionError = null;
    lastUpdateTime = 0;
    clientId = null;
  }
};