/**
 * Central exports for all React hooks used in SenseCanvas
 * Provides easy imports for all custom hooks throughout the application
 */

// Core data hooks
export { default as useWebSocket } from './useWebSocket';
export { default as useSensorData } from './useSensorData';

// UI and interaction hooks
export { default as useWidgetGrid } from './useWidgetGrid';
export { default as useTheme } from './useTheme';

// Re-export commonly used hooks for convenience
export {
  useWebSocket as useRealtimeConnection,
  useSensorData as useHardwareMonitoring,
  useWidgetGrid as useDashboardGrid,
  useTheme as useSciFiTheme
};

// Type exports for hook options and return types
export type {
  // WebSocket hook types
  WebSocketOptions,
  WebSocketStats
} from './useWebSocket';

export type {
  // Sensor data hook types
  SensorDataOptions,
  SensorAlert
} from './useSensorData';

export type {
  // Widget grid hook types
  WidgetGridOptions,
  DragState,
  ResizeState
} from './useWidgetGrid';

export type {
  // Theme hook types
  ThemeState
} from './useTheme';