/**
 * SenseCanvas Widget Components
 * Export barrel for all widget-related components
 */

// Main widget components
export { default as Widget } from './Widget.svelte';
export { default as BaseWidget } from './BaseWidget.svelte';

// Specific widget types
export { default as GaugeWidget } from './GaugeWidget.svelte';
export { default as GraphWidget } from './GraphWidget.svelte';
export { default as TextWidget } from './TextWidget.svelte';
export { default as MultiSensorWidget } from './MultiSensorWidget.svelte';

// Widget utilities and helpers
export * from '../../types/widgets.js';

// Default widget configurations for each type
export const DEFAULT_WIDGET_CONFIGS = {
  gauge: {
    minValue: 0,
    maxValue: 100,
    startAngle: -135,
    endAngle: 135,
    arcWidth: 10,
    showValue: true,
    showLabel: true,
    showTicks: true,
    tickInterval: 20,
    unit: '%'
  },
  graph: {
    timeRange: 60, // minutes
    maxDataPoints: 100,
    showGrid: true,
    showAxes: true,
    lineWidth: 2,
    fillArea: true,
    smoothing: true,
    yAxisMin: 0,
    yAxisMax: 100
  },
  text: {
    format: '{value}{unit}',
    fontSize: 24,
    fontWeight: 'bold',
    alignment: 'center',
    showIcon: true,
    iconPosition: 'left',
    iconSize: 32
  },
  multiSensor: {
    sensors: ['cpu', 'gpu', 'memory'],
    layout: 'grid',
    showLabels: true,
    showValues: true,
    compactMode: false
  }
} as const;

// Widget factory function
export function createWidget(type: string, overrides: Partial<any> = {}) {
  const baseConfig = {
    id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
    sensorType: 'cpu',
    position: { x: 0, y: 0 },
    size: { width: 200, height: 200 },
    style: {
      theme: 'default',
      colors: ['#22d3ee', '#ef4444', '#f59e0b'],
      opacity: 1,
      borderRadius: 8,
      fontSize: 14,
      fontFamily: 'Orbitron, monospace',
      borderWidth: 1,
      borderColor: '#374151',
      shadowEnabled: false,
      shadowColor: '#000000',
      shadowBlur: 4,
      gradientEnabled: false,
      gradientDirection: 'horizontal'
    },
    alerts: {
      enabled: false,
      thresholds: {
        warning: 75,
        critical: 90
      },
      showNotifications: true,
      playSound: false,
      flashWidget: true
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: '1.0.0',
    tags: [],
    isSelected: false,
    isResizing: false,
    isDragging: false,
    zIndex: 1,
    ...overrides
  };

  // Add type-specific configuration
  switch (type) {
    case 'gauge':
      baseConfig.gaugeConfig = { ...DEFAULT_WIDGET_CONFIGS.gauge, ...overrides.gaugeConfig };
      break;
    case 'graph':
      baseConfig.graphConfig = { ...DEFAULT_WIDGET_CONFIGS.graph, ...overrides.graphConfig };
      break;
    case 'text':
      baseConfig.textConfig = { ...DEFAULT_WIDGET_CONFIGS.text, ...overrides.textConfig };
      break;
    case 'multi-sensor':
      baseConfig.multiSensorConfig = { ...DEFAULT_WIDGET_CONFIGS.multiSensor, ...overrides.multiSensorConfig };
      break;
  }

  return baseConfig;
}

// Widget validation utilities
export function validateWidgetType(type: string): boolean {
  return ['gauge', 'graph', 'text', 'multi-sensor'].includes(type);
}

export function getWidgetIcon(type: string): string {
  switch (type) {
    case 'gauge': return '⭕';
    case 'graph': return '📈';
    case 'text': return '📝';
    case 'multi-sensor': return '📊';
    default: return '❓';
  }
}

export function getWidgetDescription(type: string): string {
  switch (type) {
    case 'gauge': return 'Circular gauge display for single metric monitoring';
    case 'graph': return 'Time-series line chart for trend visualization';
    case 'text': return 'Customizable text display with formatting options';
    case 'multi-sensor': return 'Multiple sensor display in grid, list, or radial layout';
    default: return 'Unknown widget type';
  }
}

// Widget performance helpers
export function getOptimalWidgetSize(type: string): { width: number; height: number } {
  switch (type) {
    case 'gauge':
      return { width: 200, height: 200 };
    case 'graph':
      return { width: 300, height: 200 };
    case 'text':
      return { width: 200, height: 100 };
    case 'multi-sensor':
      return { width: 250, height: 200 };
    default:
      return { width: 200, height: 200 };
  }
}

// Color scheme helpers
export const WIDGET_COLOR_SCHEMES = {
  default: ['#22d3ee', '#ef4444', '#f59e0b', '#10b981'],
  cyberpunk: ['#a855f7', '#ec4899', '#06b6d4', '#84cc16'],
  gaming: ['#22c55e', '#eab308', '#f97316', '#dc2626'],
  minimal: ['#6b7280', '#374151', '#9ca3af', '#d1d5db'],
  rgb: ['#ff0000', '#00ff00', '#0000ff', '#ffff00']
} as const;

export function getColorScheme(theme: string): string[] {
  return WIDGET_COLOR_SCHEMES[theme as keyof typeof WIDGET_COLOR_SCHEMES] || WIDGET_COLOR_SCHEMES.default;
}