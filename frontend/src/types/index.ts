/**
 * Central exports for all TypeScript types used in SenseCanvas
 * This file provides a single import point for all type definitions
 */

// Sensor types
export * from './sensor';

// Sci-fi design system types
export * from './sci-fi';

// Widget configuration types
export * from './widget';

// Dashboard layout and management types
export * from './dashboard';

// API communication types
export * from './api';

// Common type re-exports (automatically handled by export * above)

// Type utility helpers
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Sensor value extraction utility type
export type ExtractSensorValue<T extends import('./sensor').SensorPath> = T extends `${infer Component}.${infer Property}`
  ? Component extends 'cpu'
    ? Property extends keyof import('./sensor').CpuData
      ? import('./sensor').CpuData[Property]
      : never
    : Component extends 'memory'
    ? Property extends keyof import('./sensor').MemoryData
      ? import('./sensor').MemoryData[Property]
      : never
    : never
  : never;

// Widget configuration utility types
export type WidgetConfigByType<T extends import('./widget').WidgetType> = 
  T extends 'gauge' ? import('./widget').GaugeWidgetConfig :
  T extends 'graph' ? import('./widget').GraphWidgetConfig :
  T extends 'simple' ? import('./widget').SimpleWidgetConfig :
  T extends 'meter' ? import('./widget').MeterWidgetConfig :
  T extends 'multi-resource' ? import('./widget').MultiResourceWidgetConfig :
  never;

export type WidgetConfigUnion = WidgetConfigByType<import('./widget').WidgetType>;

// Theme utility types
export type ThemeColorKey = keyof import('./sci-fi').SciFiColors;
export type ThemeEffectKey = keyof import('./sci-fi').SciFiEffects;

// API response utility types
export type ApiSuccessResponse<T> = import('./api').ApiResponse<T> & { 
  success: true; 
  data: T; 
};

export type ApiErrorResponse = import('./api').ApiResponse & { 
  success: false; 
  error: import('./api').ApiError; 
};

// Event payload types
export type DashboardEventPayload<T extends import('./dashboard').DashboardEvent> = 
  import('./dashboard').DashboardEventPayload & { event: T };

// State update types for stores
export type SensorStoreState = {
  data: import('./sensor').SensorData;
  isConnected: boolean;
  lastUpdate: number;
  connectionError: string | null;
};

export type LayoutStoreState = {
  currentLayout: import('./widget').DashboardLayout;
  widgets: import('./widget').WidgetConfig[];
  selectedWidgetIds: string[];
  gridSize: number;
  editMode: boolean;
  isDirty: boolean;
};

export type ThemeStoreState = {
  currentTheme: import('./sci-fi').SciFiThemeId;
  customThemes: Record<string, import('./sci-fi').SciFiTheme>;
  effectsEnabled: boolean;
  animationsEnabled: boolean;
};

// Form validation types
export type WidgetFormData<T extends import('./widget').WidgetType> = Omit<
  WidgetConfigByType<T>, 
  'id' | 'created' | 'modified'
>;

export type DashboardFormData = Omit<
  import('./widget').DashboardLayout,
  'id' | 'metadata'
>;

// Component prop types
export type WidgetComponentProps<T extends import('./widget').WidgetType = import('./widget').WidgetType> = {
  widget: WidgetConfigByType<T>;
  sensorData: import('./sensor').SensorData;
  isSelected?: boolean;
  isEditing?: boolean;
  onUpdate?: (updates: Partial<WidgetConfigByType<T>>) => void;
  onRemove?: () => void;
  onSelect?: () => void;
};

export type DashboardComponentProps = {
  layout: import('./widget').DashboardLayout;
  sensorData: import('./sensor').SensorData;
  mode: import('./dashboard').DashboardMode;
  onLayoutChange?: (layout: import('./widget').DashboardLayout) => void;
  onModeChange?: (mode: import('./dashboard').DashboardMode) => void;
};

// Hook return types
export type UseSensorDataReturn = {
  data: import('./sensor').SensorData;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
  reconnect: () => void;
};

export type UseWidgetGridReturn = {
  widgets: import('./widget').WidgetConfig[];
  selectedWidgets: string[];
  gridConfig: import('./dashboard').GridConfig;
  addWidget: (widget: Partial<import('./widget').WidgetConfig>) => void;
  updateWidget: (id: string, updates: Partial<import('./widget').WidgetConfig>) => void;
  removeWidget: (id: string) => void;
  selectWidget: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  moveWidget: (id: string, position: import('./widget').Position) => void;
  resizeWidget: (id: string, size: import('./widget').Size) => void;
};

export type UseThemeReturn = {
  currentTheme: import('./sci-fi').SciFiTheme;
  availableThemes: import('./sci-fi').SciFiTheme[];
  setTheme: (themeId: import('./sci-fi').SciFiThemeId) => void;
  createCustomTheme: (theme: Partial<import('./sci-fi').SciFiTheme>) => void;
  cssVariables: Record<string, string>;
  effectsEnabled: boolean;
  toggleEffects: () => void;
};