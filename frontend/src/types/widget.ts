/**
 * Widget configuration types for the dashboard system
 * These types define the structure for all widget types and their configurations
 */

import { SciFiThemeId, SciFiFrameConfig, SciFiVisualConfig } from './sci-fi';
import { SensorPath } from './sensor';

// Base widget types
export type WidgetType = 'gauge' | 'graph' | 'simple' | 'meter' | 'multi-resource';

// Position and size types
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  w: number;
  h: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Alert condition types
export interface AlertCondition {
  id: string;
  name: string;
  sensorPath: SensorPath;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  threshold: number;
  thresholdMax?: number; // For 'between' operator
  duration: number; // seconds
  enabled: boolean;
  actions: AlertAction[];
  cooldown: number; // seconds between alerts
}

export interface AlertAction {
  type: 'notification' | 'email' | 'webhook' | 'sound' | 'log';
  config: Record<string, any>;
  enabled: boolean;
}

export interface Alert {
  id: string;
  conditionId: string;
  conditionName: string;
  sensorPath: SensorPath;
  value: number;
  threshold: number;
  timestamp: number;
  acknowledged: boolean;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
}

// Base widget configuration
export interface BaseWidgetConfig {
  id: string;
  type: WidgetType;
  title: string;
  sensorPath: SensorPath;
  position: Position;
  size: Size;
  minSize: Size;
  maxSize?: Size;
  theme: SciFiThemeId;
  alerts: AlertCondition[];
  created: number;
  modified: number;
  locked: boolean;
  hidden: boolean;
  opacity: number;
  zIndex: number;
}

// Gauge widget specific configuration
export type GaugeType = 'arc' | 'radial' | 'linear' | 'speedometer';

export interface GaugeThresholds {
  warning: number;
  critical: number;
  colors: {
    normal: string;
    warning: string;
    critical: string;
  };
}

export interface GaugeWidgetConfig extends BaseWidgetConfig {
  type: 'gauge';
  config: {
    gaugeType: GaugeType;
    startAngle: number;
    endAngle: number;
    thickness: number;
    showValue: boolean;
    showLabel: boolean;
    showMinMax: boolean;
    animated: boolean;
    animationDuration: number;
    smoothTransitions: boolean;
    glowEffect: boolean;
    pulseAnimation: boolean;
    gradientFill: boolean;
    gradientStops: string[];
    frame: SciFiFrameConfig;
    thresholds: GaugeThresholds;
    valueFormat: {
      precision: number;
      unit: string;
      prefix: string;
      suffix: string;
    };
    scale: {
      min: number;
      max: number;
      autoScale: boolean;
      logarithmic: boolean;
    };
  };
}

// Graph widget specific configuration
export type ChartType = 'line' | 'area' | 'bar' | 'scatter' | 'candlestick';

export interface GraphWidgetConfig extends BaseWidgetConfig {
  type: 'graph';
  config: {
    chartType: ChartType;
    timeRange: number; // seconds
    dataPoints: number;
    showGrid: boolean;
    showLegend: boolean;
    showAxes: boolean;
    animated: boolean;
    animationDuration: number;
    smoothCurves: boolean;
    fillArea: boolean;
    frame: SciFiFrameConfig;
    cosmicStyling: {
      glowLines: boolean;
      scanlineEffect: boolean;
      gridOpacity: number;
      particleTrail: boolean;
    };
    colors: {
      line: string;
      fill: string;
      grid: string;
      axes: string;
    };
    yAxis: {
      min?: number;
      max?: number;
      autoScale: boolean;
      logarithmic: boolean;
      unit: string;
    };
    xAxis: {
      showLabels: boolean;
      timeFormat: string;
      gridLines: boolean;
    };
    interaction: {
      zoom: boolean;
      pan: boolean;
      tooltip: boolean;
      crosshair: boolean;
    };
  };
}

// Simple widget specific configuration
export type DisplayFormat = 'number' | 'percentage' | 'bytes' | 'frequency' | 'time' | 'currency';

export interface SimpleWidgetConfig extends BaseWidgetConfig {
  type: 'simple';
  config: {
    displayFormat: DisplayFormat;
    precision: number;
    showUnit: boolean;
    showIcon: boolean;
    iconName?: string;
    iconPosition: 'left' | 'right' | 'top' | 'bottom';
    fontSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
    textAlign: 'left' | 'center' | 'right';
    frame: SciFiFrameConfig;
    cosmicEffects: {
      glowText: boolean;
      scanlineAnimation: boolean;
      typewriterEffect: boolean;
      pulseOnChange: boolean;
      colorChangeOnThreshold: boolean;
    };
    thresholds: {
      warning: number;
      critical: number;
      colors: {
        normal: string;
        warning: string;
        critical: string;
      };
    };
    formatting: {
      prefix: string;
      suffix: string;
      separator: string;
      decimalSeparator: string;
    };
  };
}

// Meter widget specific configuration
export type MeterOrientation = 'horizontal' | 'vertical';

export interface MeterWidgetConfig extends BaseWidgetConfig {
  type: 'meter';
  config: {
    orientation: MeterOrientation;
    showValue: boolean;
    showPercentage: boolean;
    showMinMax: boolean;
    animated: boolean;
    animationDuration: number;
    glowEffect: boolean;
    gradientFill: boolean;
    frame: SciFiFrameConfig;
    bar: {
      thickness: number;
      borderRadius: number;
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    };
    fill: {
      colors: string[];
      direction: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'bottom-to-top';
      animated: boolean;
    };
    scale: {
      min: number;
      max: number;
      autoScale: boolean;
      segments: number;
      showTicks: boolean;
    };
    thresholds: {
      warning: number;
      critical: number;
      colors: {
        normal: string;
        warning: string;
        critical: string;
      };
    };
  };
}

// Multi-resource widget specific configuration
export interface ResourceGroup {
  id: string;
  name: string;
  sensorPaths: SensorPath[];
  displayType: 'list' | 'grid' | 'chart';
  aggregation: 'none' | 'average' | 'sum' | 'min' | 'max';
}

export interface MultiResourceWidgetConfig extends BaseWidgetConfig {
  type: 'multi-resource';
  config: {
    layout: 'tabs' | 'grid' | 'accordion' | 'carousel';
    resourceGroups: ResourceGroup[];
    showSummary: boolean;
    compactMode: boolean;
    animated: boolean;
    frame: SciFiFrameConfig;
    grouping: {
      showHeaders: boolean;
      headerStyle: 'minimal' | 'prominent' | 'sci-fi';
      spacing: 'compact' | 'normal' | 'spacious';
    };
    display: {
      showIcons: boolean;
      showValues: boolean;
      showUnits: boolean;
      showTrends: boolean;
      valueFormat: DisplayFormat;
      precision: number;
    };
    cosmicEffects: {
      groupGlow: boolean;
      headerScanlines: boolean;
      valueAnimations: boolean;
    };
  };
}

// Union type for all widget configurations
export type WidgetConfig = 
  | GaugeWidgetConfig 
  | GraphWidgetConfig 
  | SimpleWidgetConfig 
  | MeterWidgetConfig 
  | MultiResourceWidgetConfig;

// Widget preset types
export interface WidgetPreset {
  id: string;
  name: string;
  description: string;
  category: 'cpu' | 'gpu' | 'memory' | 'storage' | 'network' | 'system' | 'custom';
  widgetType: WidgetType;
  config: Omit<WidgetConfig, 'id' | 'position' | 'created' | 'modified'>;
  thumbnail?: string;
  tags: string[];
  popularity: number;
}

// Widget template for creating new widgets
export interface WidgetTemplate {
  type: WidgetType;
  name: string;
  defaultSize: Size;
  minSize: Size;
  maxSize: Size;
  defaultConfig: Partial<WidgetConfig>;
  supportedSensorTypes: string[];
  description: string;
  icon: string;
}

// Dashboard layout types
export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  widgets: WidgetConfig[];
  gridSize: number;
  theme: SciFiThemeId;
  backgroundEffects: {
    particles: boolean;
    scanlines: boolean;
    glowGrid: boolean;
    hologram: boolean;
  };
  metadata: {
    created: number;
    modified: number;
    version: string;
    author?: string;
    tags: string[];
  };
  settings: {
    snapToGrid: boolean;
    showGrid: boolean;
    lockLayout: boolean;
    autoSave: boolean;
    maxWidgets: number;
  };
}

// Layout preset types
export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  layout: Omit<DashboardLayout, 'id' | 'metadata'>;
  category: 'gaming' | 'professional' | 'minimal' | 'showcase' | 'monitoring';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  popularity: number;
}

// Widget interaction types
export interface WidgetInteraction {
  type: 'hover' | 'click' | 'double-click' | 'right-click' | 'drag' | 'resize';
  action: 'configure' | 'remove' | 'duplicate' | 'lock' | 'hide' | 'focus' | 'expand';
  enabled: boolean;
  modifier?: 'ctrl' | 'shift' | 'alt';
}

// Widget state for runtime
export interface WidgetState {
  id: string;
  isSelected: boolean;
  isHovered: boolean;
  isDragging: boolean;
  isResizing: boolean;
  isConfiguring: boolean;
  isLoading: boolean;
  hasError: boolean;
  errorMessage?: string;
  lastUpdate: number;
  dataAge: number;
}

// Utility types for widget operations
export type WidgetOperation = 
  | 'create'
  | 'update'
  | 'delete'
  | 'move'
  | 'resize'
  | 'configure'
  | 'duplicate'
  | 'lock'
  | 'unlock'
  | 'hide'
  | 'show';

export interface WidgetOperationPayload {
  operation: WidgetOperation;
  widgetId: string;
  data?: any;
  timestamp: number;
}

// Default widget configurations
export const DEFAULT_WIDGET_SIZES: Record<WidgetType, { default: Size; min: Size; max: Size }> = {
  gauge: {
    default: { w: 4, h: 4 },
    min: { w: 2, h: 2 },
    max: { w: 8, h: 8 }
  },
  graph: {
    default: { w: 6, h: 4 },
    min: { w: 4, h: 3 },
    max: { w: 12, h: 8 }
  },
  simple: {
    default: { w: 3, h: 2 },
    min: { w: 2, h: 1 },
    max: { w: 6, h: 4 }
  },
  meter: {
    default: { w: 4, h: 2 },
    min: { w: 3, h: 1 },
    max: { w: 8, h: 3 }
  },
  'multi-resource': {
    default: { w: 6, h: 6 },
    min: { w: 4, h: 4 },
    max: { w: 12, h: 12 }
  }
};

// Widget category metadata
export const WIDGET_CATEGORIES = {
  cpu: { name: 'CPU', icon: 'Cpu', color: '#3b82f6' },
  gpu: { name: 'GPU', icon: 'Monitor', color: '#10b981' },
  memory: { name: 'Memory', icon: 'HardDrive', color: '#f59e0b' },
  storage: { name: 'Storage', icon: 'Database', color: '#8b5cf6' },
  network: { name: 'Network', icon: 'Wifi', color: '#06b6d4' },
  system: { name: 'System', icon: 'Settings', color: '#64748b' },
  custom: { name: 'Custom', icon: 'Puzzle', color: '#ec4899' }
};

// Utility functions
export function createWidgetId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getWidgetDisplayName(type: WidgetType): string {
  const names: Record<WidgetType, string> = {
    gauge: 'Gauge',
    graph: 'Graph',
    simple: 'Simple Display',
    meter: 'Progress Meter',
    'multi-resource': 'Multi-Resource'
  };
  return names[type];
}

export function getDefaultWidgetConfig(type: WidgetType): Partial<WidgetConfig> {
  const base = {
    title: `New ${getWidgetDisplayName(type)}`,
    theme: 'cyberpunk' as SciFiThemeId,
    alerts: [],
    locked: false,
    hidden: false,
    opacity: 1,
    zIndex: 1,
  };

  const sizes = DEFAULT_WIDGET_SIZES[type];
  return {
    ...base,
    type,
    size: sizes.default,
    minSize: sizes.min,
    maxSize: sizes.max,
  };
}

// Grid utility functions
export function checkCollision(
  widget: { position: Position; size: Size },
  otherWidgets: WidgetConfig[]
): boolean {
  const { position, size } = widget;
  
  return otherWidgets.some(other => {
    const otherRight = other.position.x + other.size.w;
    const otherBottom = other.position.y + other.size.h;
    const widgetRight = position.x + size.w;
    const widgetBottom = position.y + size.h;
    
    return !(
      position.x >= otherRight ||
      widgetRight <= other.position.x ||
      position.y >= otherBottom ||
      widgetBottom <= other.position.y
    );
  });
}

export function calculateGridPosition(
  position: Position,
  gridSize: number,
  snapToGrid: boolean = false
): Position {
  if (!snapToGrid) return position;
  
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize,
  };
}