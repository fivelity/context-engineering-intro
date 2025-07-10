/**
 * Hook for managing sensor data subscriptions and real-time updates
 * Optimized for React 19+ with TanStack Query integration
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { useSensorStore } from '@stores/sensorStore';
import { 
  SensorData, 
  SensorPath, 
  SensorReading,
  formatSensorValue,
  getSensorTrend,
  isSensorValueNormal
} from '@types';

interface SensorDataOptions {
  enableRealTime?: boolean;
  historyPoints?: number;
  updateInterval?: number;
  sensorPaths?: SensorPath[];
  onValueChange?: (path: SensorPath, value: number, previous: number) => void;
  onAlert?: (path: SensorPath, value: number, threshold: number) => void;
}

interface SensorAlert {
  path: SensorPath;
  value: number;
  threshold: number;
  type: 'warning' | 'critical';
  message: string;
  timestamp: number;
}

export const useSensorData = (options: SensorDataOptions = {}) => {
  const {
    enableRealTime = true,
    historyPoints = 100,
    updateInterval = 1000,
    sensorPaths = [],
    onValueChange,
    onAlert
  } = options;

  const queryClient = useQueryClient();
  const { 
    data: sensorData, 
    isConnected, 
    getSensorValue, 
    getSensorHistory,
    subscribeSensorValue
  } = useSensorStore();

  // Query for initial sensor data and hardware info
  const {
    data: hardwareInfo,
    isLoading: isLoadingHardware,
    error: hardwareError
  } = useQuery({
    queryKey: ['hardware-info'],
    queryFn: async () => {
      const response = await fetch('/api/hardware');
      if (!response.ok) throw new Error('Failed to fetch hardware info');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Query for sensor configuration and thresholds
  const {
    data: sensorConfig,
    isLoading: isLoadingConfig
  } = useQuery({
    queryKey: ['sensor-config'],
    queryFn: async () => {
      const response = await fetch('/api/sensors/config');
      if (!response.ok) throw new Error('Failed to fetch sensor config');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: isConnected
  });

  // Get current sensor reading for a specific path
  const getSensorReading = useCallback((path: SensorPath): SensorReading | null => {
    const value = getSensorValue(path);
    if (value === null) return null;

    const history = getSensorHistory(path, 10);
    const trend = getSensorTrend(path, 5);
    const isNormal = isSensorValueNormal(path, value);
    const formattedValue = formatSensorValue(path, value);

    return {
      path,
      value,
      formattedValue,
      trend,
      isNormal,
      timestamp: Date.now(),
      history: history.slice(-historyPoints)
    };
  }, [getSensorValue, getSensorHistory, historyPoints]);

  // Get multiple sensor readings
  const getSensorReadings = useCallback((paths: SensorPath[]): Record<SensorPath, SensorReading | null> => {
    return paths.reduce((acc, path) => {
      acc[path] = getSensorReading(path);
      return acc;
    }, {} as Record<SensorPath, SensorReading | null>);
  }, [getSensorReading]);

  // Check for sensor alerts based on thresholds
  const checkAlerts = useCallback((path: SensorPath, value: number): SensorAlert | null => {
    if (!sensorConfig?.thresholds) return null;

    const thresholds = sensorConfig.thresholds[path];
    if (!thresholds) return null;

    // Check critical threshold first
    if (thresholds.critical !== undefined && value >= thresholds.critical) {
      return {
        path,
        value,
        threshold: thresholds.critical,
        type: 'critical',
        message: `${path} is critically high: ${formatSensorValue(path, value)}`,
        timestamp: Date.now()
      };
    }

    // Check warning threshold
    if (thresholds.warning !== undefined && value >= thresholds.warning) {
      return {
        path,
        value,
        threshold: thresholds.warning,
        type: 'warning',
        message: `${path} is above warning threshold: ${formatSensorValue(path, value)}`,
        timestamp: Date.now()
      };
    }

    return null;
  }, [sensorConfig]);

  // Subscribe to specific sensor paths for real-time updates
  useEffect(() => {
    if (!enableRealTime || sensorPaths.length === 0) return;

    const unsubscribeFunctions = sensorPaths.map(path => 
      subscribeSensorValue(path, (value, previous) => {
        // Call value change callback
        if (value !== null && previous !== null && value !== previous) {
          onValueChange?.(path, value, previous);
        }

        // Check for alerts
        if (value !== null) {
          const alert = checkAlerts(path, value);
          if (alert) {
            onAlert?.(path, value, alert.threshold);
          }
        }

        // Invalidate relevant queries to trigger re-renders
        queryClient.invalidateQueries({ 
          queryKey: ['sensor-reading', path],
          exact: true
        });
      })
    );

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [
    enableRealTime, 
    sensorPaths, 
    subscribeSensorValue, 
    onValueChange, 
    onAlert, 
    checkAlerts, 
    queryClient
  ]);

  // Create queries for individual sensor paths
  const sensorQueries = useMemo(() => {
    return sensorPaths.map(path => ({
      queryKey: ['sensor-reading', path],
      queryFn: () => getSensorReading(path),
      enabled: isConnected,
      refetchInterval: enableRealTime ? updateInterval : false,
      staleTime: updateInterval / 2,
    }));
  }, [sensorPaths, getSensorReading, isConnected, enableRealTime, updateInterval]);

  // Get aggregated sensor statistics
  const getSensorStats = useCallback(() => {
    const stats = {
      totalSensors: 0,
      activeSensors: 0,
      criticalAlerts: 0,
      warningAlerts: 0,
      averageTemperature: 0,
      averageUsage: 0,
      maxTemperature: 0,
      maxUsage: 0
    };

    if (!sensorData) return stats;

    // Analyze CPU data
    if (sensorData.cpu) {
      stats.totalSensors += 5; // usage, temp, frequency, voltage, power
      stats.activeSensors += sensorData.cpu.usage > 0 ? 1 : 0;
      stats.activeSensors += sensorData.cpu.temperature > 0 ? 1 : 0;
      stats.activeSensors += sensorData.cpu.frequency > 0 ? 1 : 0;
      stats.activeSensors += sensorData.cpu.voltage > 0 ? 1 : 0;
      stats.activeSensors += sensorData.cpu.power > 0 ? 1 : 0;
      
      stats.averageUsage += sensorData.cpu.usage;
      stats.averageTemperature += sensorData.cpu.temperature;
      stats.maxUsage = Math.max(stats.maxUsage, sensorData.cpu.usage);
      stats.maxTemperature = Math.max(stats.maxTemperature, sensorData.cpu.temperature);
      
      // Check for alerts
      if (sensorData.cpu.temperature > 80) stats.criticalAlerts++;
      else if (sensorData.cpu.temperature > 70) stats.warningAlerts++;
      
      if (sensorData.cpu.usage > 90) stats.criticalAlerts++;
      else if (sensorData.cpu.usage > 80) stats.warningAlerts++;
    }

    // Analyze GPU data
    sensorData.gpu?.forEach((gpu, index) => {
      stats.totalSensors += 3; // usage, temp, memory
      stats.activeSensors += gpu.usage > 0 ? 1 : 0;
      stats.activeSensors += gpu.temperature > 0 ? 1 : 0;
      stats.activeSensors += gpu.memoryUsage > 0 ? 1 : 0;
      
      stats.averageUsage += gpu.usage;
      stats.averageTemperature += gpu.temperature;
      stats.maxUsage = Math.max(stats.maxUsage, gpu.usage);
      stats.maxTemperature = Math.max(stats.maxTemperature, gpu.temperature);
      
      // Check for alerts
      if (gpu.temperature > 85) stats.criticalAlerts++;
      else if (gpu.temperature > 75) stats.warningAlerts++;
      
      if (gpu.usage > 95) stats.criticalAlerts++;
      else if (gpu.usage > 85) stats.warningAlerts++;
    });

    // Analyze memory data
    if (sensorData.memory) {
      stats.totalSensors += 2; // usage, temperature
      stats.activeSensors += sensorData.memory.usage > 0 ? 1 : 0;
      
      stats.averageUsage += sensorData.memory.usage;
      stats.maxUsage = Math.max(stats.maxUsage, sensorData.memory.usage);
      
      // Check for alerts
      if (sensorData.memory.usage > 90) stats.criticalAlerts++;
      else if (sensorData.memory.usage > 80) stats.warningAlerts++;
    }

    // Calculate averages
    const sensorCount = Math.max(1, stats.activeSensors);
    stats.averageTemperature = stats.averageTemperature / sensorCount;
    stats.averageUsage = stats.averageUsage / sensorCount;

    return stats;
  }, [sensorData]);

  // Get sensor health status
  const getSensorHealth = useCallback(() => {
    const stats = getSensorStats();
    
    if (stats.criticalAlerts > 0) return 'critical';
    if (stats.warningAlerts > 0) return 'warning';
    if (stats.activeSensors < stats.totalSensors * 0.8) return 'degraded';
    return 'healthy';
  }, [getSensorStats]);

  return {
    // Data
    sensorData,
    hardwareInfo,
    sensorConfig,
    
    // Connection state
    isConnected,
    isLoading: isLoadingHardware || isLoadingConfig,
    error: hardwareError,
    
    // Sensor readings
    getSensorReading,
    getSensorReadings,
    getSensorValue,
    getSensorHistory,
    
    // Statistics and health
    getSensorStats,
    getSensorHealth,
    checkAlerts,
    
    // Queries for individual sensors
    sensorQueries,
    
    // Utilities
    formatSensorValue,
    getSensorTrend,
    isSensorValueNormal
  };
};

export default useSensorData;