// SenseCanvas: Widget Configuration Type Definitions
// Used for widget configurator and dashboard layout examples

export type WidgetType = 'gauge' | 'graph' | 'text' | 'multi-sensor';
export type SensorType = 'cpu' | 'gpu' | 'memory' | 'storage' | 'network';
export type ThemeType = 'default' | 'cyberpunk' | 'gaming' | 'minimal' | 'rgb';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WidgetStyle {
  theme: ThemeType;
  colors: string[];
  opacity: number;
  borderRadius: number;
  backgroundImage?: string;
  fontSize?: number;
  fontFamily?: string;
  borderWidth?: number;
  borderColor?: string;
  shadowEnabled?: boolean;
  shadowColor?: string;
  shadowBlur?: number;
  gradientEnabled?: boolean;
  gradientDirection?: 'horizontal' | 'vertical' | 'radial';
}

export interface AlertThresholds {
  warning: number;
  critical: number;
}

export interface WidgetAlerts {
  enabled: boolean;
  thresholds: AlertThresholds;
  showNotifications?: boolean;
  playSound?: boolean;
  flashWidget?: boolean;
}

export interface GaugeConfig {
  minValue: number;
  maxValue: number;
  startAngle: number;
  endAngle: number;
  arcWidth: number;
  showValue: boolean;
  showLabel: boolean;
  showTicks: boolean;
  tickInterval: number;
  unit: string;
}

export interface GraphConfig {
  timeRange: number; // minutes
  maxDataPoints: number;
  showGrid: boolean;
  showAxes: boolean;
  lineWidth: number;
  fillArea: boolean;
  smoothing: boolean;
  yAxisMin?: number;
  yAxisMax?: number;
}

export interface TextConfig {
  format: string; // e.g., "{value}%" or "{value} {unit}"
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'light';
  alignment: 'left' | 'center' | 'right';
  showIcon: boolean;
  iconPosition: 'left' | 'right' | 'top' | 'bottom';
  iconSize: number;
}

export interface MultiSensorConfig {
  sensors: SensorType[];
  layout: 'grid' | 'list' | 'radial';
  showLabels: boolean;
  showValues: boolean;
  compactMode: boolean;
}

export interface WidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  sensorType: SensorType;
  position: Position;
  size: Size;
  style: WidgetStyle;
  alerts: WidgetAlerts;
  
  // Type-specific configurations
  gaugeConfig?: GaugeConfig;
  graphConfig?: GraphConfig;
  textConfig?: TextConfig;
  multiSensorConfig?: MultiSensorConfig;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  version: string;
  tags: string[];
  description?: string;
  author?: string;
  
  // Runtime state (not serialized)
  isSelected?: boolean;
  isResizing?: boolean;
  isDragging?: boolean;
  zIndex?: number;
}

export interface WidgetLibraryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  thumbnail: string;
  config: WidgetConfig;
  popularity: number;
  author: string;
  createdAt: number;
  downloads: number;
}

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: WidgetConfig[];
  gridSize: {
    cols: number;
    rows: number;
    cellSize: number;
  };
  theme: ThemeType;
  backgroundImage?: string;
  backgroundColor?: string;
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  version: string;
  author?: string;
  tags: string[];
  
  // Export/Import
  isPublic: boolean;
  shareKey?: string;
}

export interface WidgetPreset {
  id: string;
  name: string;
  type: WidgetType;
  config: Partial<WidgetConfig>;
  thumbnail: string;
  category: string;
  tags: string[];
}

export interface AiGenerationPrompt {
  id: string;
  prompt: string;
  context: {
    sensorType?: SensorType;
    widgetType?: WidgetType;
    theme?: ThemeType;
    style?: string;
  };
  generatedConfig: Partial<WidgetConfig>;
  rating?: number;
  createdAt: number;
}

export interface WidgetValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface WidgetConfiguratorState {
  activeTab: 'library' | 'ai-generate' | 'create-custom';
  currentConfig: Partial<WidgetConfig>;
  validationErrors: WidgetValidationError[];
  isValid: boolean;
  previewData: any;
  libraryItems: WidgetLibraryItem[];
  recentPrompts: AiGenerationPrompt[];
}

// Utility types for forms and validation
export type WidgetFormData = Omit<WidgetConfig, 'id' | 'createdAt' | 'updatedAt'>;
export type WidgetUpdate = Partial<WidgetConfig>;
export type WidgetCreate = Omit<WidgetConfig, 'id' | 'createdAt' | 'updatedAt'>;

// Constants
export const WIDGET_TYPES: WidgetType[] = ['gauge', 'graph', 'text', 'multi-sensor'];
export const SENSOR_TYPES: SensorType[] = ['cpu', 'gpu', 'memory', 'storage', 'network'];
export const THEME_TYPES: ThemeType[] = ['default', 'cyberpunk', 'gaming', 'minimal', 'rgb'];

export const DEFAULT_WIDGET_SIZE: Size = { width: 200, height: 200 };
export const MIN_WIDGET_SIZE: Size = { width: 100, height: 100 };
export const MAX_WIDGET_SIZE: Size = { width: 800, height: 600 };

export const DEFAULT_WIDGET_STYLE: WidgetStyle = {
  theme: 'default',
  colors: ['#00ff88', '#ff6b6b'],
  opacity: 1,
  borderRadius: 8,
  fontSize: 14,
  fontFamily: 'Inter, sans-serif',
  borderWidth: 1,
  borderColor: '#e5e7eb',
  shadowEnabled: false,
  shadowColor: '#000000',
  shadowBlur: 4,
  gradientEnabled: false,
  gradientDirection: 'horizontal'
};

export const DEFAULT_ALERTS: WidgetAlerts = {
  enabled: false,
  thresholds: {
    warning: 75,
    critical: 90
  },
  showNotifications: true,
  playSound: false,
  flashWidget: true
}; 