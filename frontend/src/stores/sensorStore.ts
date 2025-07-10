/**
 * Sensor data store for real-time hardware monitoring
 * Uses Zustand for lightweight state management with React 19+ automatic batching
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { SensorData, SensorPath, getSensorDisplayName, getSensorUnit } from '@types/sensor';

interface SensorHistory {
  timestamp: number;
  value: number;
}

interface SensorState {
  // Current sensor data
  data: SensorData;
  previousData: SensorData | null;
  
  // Connection state
  isConnected: boolean;
  isReconnecting: boolean;
  connectionError: string | null;
  lastUpdate: number;
  connectionUptime: number;
  
  // History tracking for graphs
  history: Record<SensorPath, SensorHistory[]>;
  maxHistoryPoints: number;
  
  // Performance metrics
  updateFrequency: number;
  averageLatency: number;
  dataAge: number;
  
  // Actions
  updateSensorData: (data: SensorData) => void;
  setConnectionStatus: (connected: boolean, error?: string) => void;
  setReconnecting: (reconnecting: boolean) => void;
  addHistoryPoint: (sensorPath: SensorPath, value: number) => void;
  clearHistory: (sensorPath?: SensorPath) => void;
  getSensorValue: (path: SensorPath) => number | null;
  getSensorHistory: (path: SensorPath, points?: number) => SensorHistory[];
  getConnectionStats: () => {
    isConnected: boolean;
    uptime: number;
    frequency: number;
    latency: number;
    error: string | null;
  };
}

// Initial empty sensor data structure
const createInitialSensorData = (): SensorData => ({
  timestamp: 0,
  cpu: {
    usage: 0,
    temperature: 0,
    frequency: 0,
    voltage: 0,
    power: 0,
    cores: [],
  },
  gpu: [],
  memory: {
    usage: 0,
    available: 0,
    total: 0,
    used: 0,
    speed: 0,
    voltage: 0,
  },
  storage: [],
  fans: {},
  voltages: {},
  motherboard: {
    temperature: 0,
    voltage: 0,
    name: '',
    manufacturer: '',
  },
  network: [],
});

export const useSensorStore = create<SensorState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    data: createInitialSensorData(),
    previousData: null,
    isConnected: false,
    isReconnecting: false,
    connectionError: null,
    lastUpdate: 0,
    connectionUptime: 0,
    history: {},
    maxHistoryPoints: 100,
    updateFrequency: 0,
    averageLatency: 0,
    dataAge: 0,

    // Actions
    updateSensorData: (newData: SensorData) => {
      const now = Date.now();
      const state = get();
      
      // Calculate update frequency
      const timeSinceLastUpdate = now - state.lastUpdate;
      const newFrequency = timeSinceLastUpdate > 0 
        ? (1000 / timeSinceLastUpdate) 
        : state.updateFrequency;
      
      // Calculate data age
      const dataAge = newData.timestamp > 0 ? now - newData.timestamp : 0;
      
      // React 19's automatic batching handles multiple state updates efficiently
      set({
        previousData: state.data,
        data: newData,
        lastUpdate: now,
        updateFrequency: newFrequency,
        dataAge,
        connectionError: null, // Clear error on successful update
      });
      
      // Update history for key sensors automatically
      const keyPaths: SensorPath[] = [
        'cpu.usage',
        'cpu.temperature',
        'memory.usage',
        'gpu.0.usage',
        'gpu.0.temperature',
      ];
      
      keyPaths.forEach(path => {
        const value = get().getSensorValue(path);
        if (value !== null) {
          get().addHistoryPoint(path, value);
        }
      });
    },

    setConnectionStatus: (connected: boolean, error?: string) => {
      const now = Date.now();
      const state = get();
      
      set({
        isConnected: connected,
        isReconnecting: false,
        connectionError: error || null,
        connectionUptime: connected ? state.connectionUptime : 0,
        lastUpdate: connected ? state.lastUpdate : now,
      });
    },

    setReconnecting: (reconnecting: boolean) => {
      set({ isReconnecting: reconnecting });
    },

    addHistoryPoint: (sensorPath: SensorPath, value: number) => {
      const state = get();
      const history = state.history[sensorPath] || [];
      const timestamp = Date.now();
      
      // Add new point
      const newHistory = [
        ...history,
        { timestamp, value }
      ];
      
      // Keep only the last maxHistoryPoints
      const trimmedHistory = newHistory.slice(-state.maxHistoryPoints);
      
      set({
        history: {
          ...state.history,
          [sensorPath]: trimmedHistory,
        },
      });
    },

    clearHistory: (sensorPath?: SensorPath) => {
      const state = get();
      
      if (sensorPath) {
        const newHistory = { ...state.history };
        delete newHistory[sensorPath];
        set({ history: newHistory });
      } else {
        set({ history: {} });
      }
    },

    getSensorValue: (path: SensorPath): number | null => {
      const { data } = get();
      
      try {
        // Split the path and traverse the data object
        const pathParts = path.split('.');
        let current: any = data;
        
        for (const part of pathParts) {
          if (current === null || current === undefined) {
            return null;
          }
          
          // Handle array indices (e.g., gpu.0.usage)
          if (!isNaN(Number(part))) {
            const index = Number(part);
            if (Array.isArray(current) && index < current.length) {
              current = current[index];
            } else {
              return null;
            }
          } else {
            current = current[part];
          }
        }
        
        return typeof current === 'number' ? current : null;
      } catch (error) {
        console.warn(`Failed to get sensor value for path: ${path}`, error);
        return null;
      }
    },

    getSensorHistory: (path: SensorPath, points?: number): SensorHistory[] => {
      const { history } = get();
      const sensorHistory = history[path] || [];
      
      if (points && points > 0) {
        return sensorHistory.slice(-points);
      }
      
      return sensorHistory;
    },

    getConnectionStats: () => {
      const state = get();
      return {
        isConnected: state.isConnected,
        uptime: state.connectionUptime,
        frequency: state.updateFrequency,
        latency: state.averageLatency,
        error: state.connectionError,
      };
    },
  }))
);

// Utility functions for working with sensor data

/**
 * Get a human-readable sensor value with unit
 */
export function formatSensorValue(path: SensorPath, value: number): string {
  const unit = getSensorUnit(path);
  
  // Format based on sensor type
  if (path.includes('bytes') || path.includes('memory') || path.includes('storage')) {
    return formatBytes(value);
  }
  
  if (path.includes('frequency') || path.includes('clock')) {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} GHz`;
    }
    return `${value.toFixed(0)} ${unit}`;
  }
  
  if (path.includes('temperature')) {
    return `${value.toFixed(1)}${unit}`;
  }
  
  if (path.includes('percentage') || path.includes('usage')) {
    return `${value.toFixed(1)}${unit}`;
  }
  
  // Default formatting
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k ${unit}`;
  }
  
  return `${value.toFixed(1)} ${unit}`;
}

/**
 * Format bytes in human-readable format
 */
function formatBytes(bytes: number): string {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  
  return `${value.toFixed(1)} ${sizes[i]}`;
}

/**
 * Get the trend direction for a sensor value
 */
export function getSensorTrend(path: SensorPath, points: number = 5): 'up' | 'down' | 'stable' {
  const history = useSensorStore.getState().getSensorHistory(path, points);
  
  if (history.length < 2) return 'stable';
  
  const first = history[0].value;
  const last = history[history.length - 1].value;
  const difference = last - first;
  const threshold = Math.abs(first) * 0.05; // 5% threshold
  
  if (Math.abs(difference) < threshold) return 'stable';
  return difference > 0 ? 'up' : 'down';
}

/**
 * Check if a sensor value is within normal range
 */
export function isSensorValueNormal(path: SensorPath, value: number): boolean {
  // Define normal ranges for different sensor types
  if (path.includes('temperature')) {
    if (path.includes('cpu')) return value < 80;
    if (path.includes('gpu')) return value < 85;
    return value < 70;
  }
  
  if (path.includes('usage') || path.includes('load')) {
    return value < 80;
  }
  
  if (path.includes('voltage')) {
    // Most voltages should be between 0.5V and 15V
    return value >= 0.5 && value <= 15;
  }
  
  // Default: assume normal
  return true;
}

/**
 * Subscribe to sensor data changes
 */
export function subscribeSensorData(callback: (data: SensorData) => void) {
  return useSensorStore.subscribe(
    (state) => state.data,
    callback,
    {
      fireImmediately: true,
    }
  );
}

/**
 * Subscribe to connection status changes
 */
export function subscribeConnectionStatus(callback: (connected: boolean) => void) {
  return useSensorStore.subscribe(
    (state) => state.isConnected,
    callback,
    {
      fireImmediately: true,
    }
  );
}

/**
 * Subscribe to specific sensor value changes
 */
export function subscribeSensorValue(
  path: SensorPath, 
  callback: (value: number | null) => void
) {
  return useSensorStore.subscribe(
    (state) => state.getSensorValue(path),
    callback,
    {
      fireImmediately: true,
    }
  );
}