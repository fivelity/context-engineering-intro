/**
 * SenseCanvas Widget Factory Utilities
 * Helper functions for creating and configuring widgets with proper defaults
 */

import type { 
  WidgetConfig, 
  WidgetType, 
  SensorType,
  GaugeConfig,
  GraphConfig,
  TextConfig,
  MultiSensorConfig
} from '../types/widgets.js';

// Default widget configurations by type
export const WIDGET_DEFAULTS = {
  gauge: {
    size: { width: 200, height: 200 },
    gaugeConfig: {
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
    } as GaugeConfig
  },
  graph: {
    size: { width: 300, height: 200 },
    graphConfig: {
      timeRange: 5,
      maxDataPoints: 50,
      showGrid: true,
      showAxes: true,
      lineWidth: 2,
      fillArea: false,
      smoothing: true
    } as GraphConfig
  },
  text: {
    size: { width: 150, height: 100 },
    textConfig: {
      format: '{value}{unit}',
      fontSize: 24,
      fontWeight: 'bold',
      alignment: 'center',
      showIcon: true,
      iconPosition: 'left',
      iconSize: 32
    } as TextConfig
  },
  'multi-sensor': {
    size: { width: 250, height: 300 },
    multiSensorConfig: {
      sensors: ['cpu', 'gpu', 'memory'],
      layout: 'grid',
      showLabels: true,
      showValues: true,
      compactMode: false
    } as MultiSensorConfig
  }
};

/**
 * Create a new widget with defaults based on type
 */
export function createWidget(
  type: WidgetType,
  sensorType: SensorType,
  overrides: Partial<WidgetConfig> = {}
): WidgetConfig {
  const id = overrides.id || generateWidgetId();
  const defaults = WIDGET_DEFAULTS[type as keyof typeof WIDGET_DEFAULTS];
  const timestamp = Date.now();
  
  const baseConfig: WidgetConfig = {
    id,
    type,
    title: overrides.title || `${formatSensorName(sensorType)} ${formatWidgetType(type)}`,
    sensorType,
    position: overrides.position || { x: 0, y: 0 },
    size: overrides.size || defaults.size,
    style: {
      theme: 'default',
      colors: getDefaultColors(type, sensorType),
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
      gradientDirection: 'horizontal',
      ...overrides.style
    },
    alerts: {
      enabled: false,
      thresholds: getDefaultThresholds(sensorType),
      showNotifications: true,
      playSound: false,
      flashWidget: true,
      ...overrides.alerts
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    version: '1.0.0',
    tags: [],
    ...overrides
  };

  // Add type-specific configuration
  switch (type) {
    case 'gauge':
      baseConfig.gaugeConfig = { ...WIDGET_DEFAULTS.gauge.gaugeConfig, ...overrides.gaugeConfig };
      break;
    case 'graph':
      baseConfig.graphConfig = { ...WIDGET_DEFAULTS.graph.graphConfig, ...overrides.graphConfig };
      break;
    case 'text':
      baseConfig.textConfig = { ...WIDGET_DEFAULTS.text.textConfig, ...overrides.textConfig };
      break;
    case 'multi-sensor':
      baseConfig.multiSensorConfig = { ...WIDGET_DEFAULTS['multi-sensor'].multiSensorConfig, ...overrides.multiSensorConfig };
      break;
  }

  return baseConfig;
}

/**
 * Generate a unique widget ID
 */
export function generateWidgetId(): string {
  return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get default colors based on widget and sensor type
 */
export function getDefaultColors(type: WidgetType, sensorType: SensorType): string[] {
  const colorMap: Record<SensorType, string[]> = {
    cpu: ['#22d3ee', '#ef4444', '#f59e0b'],
    gpu: ['#a855f7', '#ec4899', '#f59e0b'],
    memory: ['#3b82f6', '#ef4444', '#f59e0b'],
    storage: ['#10b981', '#ef4444', '#f59e0b'],
    network: ['#6366f1', '#ef4444', '#f59e0b']
  };

  return colorMap[sensorType] || ['#22d3ee', '#ef4444', '#f59e0b'];
}

/**
 * Get default alert thresholds based on sensor type
 */
export function getDefaultThresholds(sensorType: SensorType): { warning: number; critical: number } {
  const thresholdMap: Record<SensorType, { warning: number; critical: number }> = {
    cpu: { warning: 75, critical: 90 },
    gpu: { warning: 80, critical: 95 },
    memory: { warning: 80, critical: 95 },
    storage: { warning: 85, critical: 95 },
    network: { warning: 70, critical: 90 }
  };

  return thresholdMap[sensorType] || { warning: 75, critical: 90 };
}

/**
 * Format sensor name for display
 */
export function formatSensorName(sensorType: SensorType): string {
  const nameMap: Record<SensorType, string> = {
    cpu: 'CPU',
    gpu: 'GPU',
    memory: 'Memory',
    storage: 'Storage',
    network: 'Network'
  };

  return nameMap[sensorType] || sensorType.toUpperCase();
}

/**
 * Format widget type for display
 */
export function formatWidgetType(widgetType: WidgetType): string {
  const nameMap: Record<WidgetType, string> = {
    gauge: 'Gauge',
    graph: 'Graph',
    text: 'Display',
    'multi-sensor': 'Multi-Sensor'
  };

  return nameMap[widgetType] || widgetType;
}

/**
 * Clone a widget configuration with new ID
 */
export function cloneWidget(widget: WidgetConfig, position?: { x: number; y: number }): WidgetConfig {
  return {
    ...widget,
    id: generateWidgetId(),
    position: position || { 
      x: widget.position.x + 20, 
      y: widget.position.y + 20 
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    isSelected: false,
    isResizing: false,
    isDragging: false
  };
}

/**
 * Check if widget position is within bounds
 */
export function isWithinBounds(
  widget: WidgetConfig,
  bounds: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    widget.position.x >= bounds.x &&
    widget.position.y >= bounds.y &&
    widget.position.x + widget.size.width <= bounds.x + bounds.width &&
    widget.position.y + widget.size.height <= bounds.y + bounds.height
  );
}

/**
 * Snap widget position to grid
 */
export function snapToGrid(
  position: { x: number; y: number },
  gridSize: number = 20
): { x: number; y: number } {
  return {
    x: Math.round(position.x / gridSize) * gridSize,
    y: Math.round(position.y / gridSize) * gridSize
  };
}

/**
 * Check for widget collision
 */
export function checkCollision(
  widget1: WidgetConfig,
  widget2: WidgetConfig
): boolean {
  return !(
    widget1.position.x + widget1.size.width <= widget2.position.x ||
    widget2.position.x + widget2.size.width <= widget1.position.x ||
    widget1.position.y + widget1.size.height <= widget2.position.y ||
    widget2.position.y + widget2.size.height <= widget1.position.y
  );
}

/**
 * Find available position for new widget
 */
export function findAvailablePosition(
  widgets: WidgetConfig[],
  newWidget: Omit<WidgetConfig, 'position'>,
  bounds: { width: number; height: number },
  gridSize: number = 20
): { x: number; y: number } {
  const maxAttempts = 100;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const position = snapToGrid({
      x: Math.random() * (bounds.width - newWidget.size.width),
      y: Math.random() * (bounds.height - newWidget.size.height)
    }, gridSize);
    
    const testWidget = { ...newWidget, position } as WidgetConfig;
    const hasCollision = widgets.some(widget => checkCollision(widget, testWidget));
    
    if (!hasCollision) {
      return position;
    }
  }
  
  // Fallback: stack at origin if no space found
  return { x: 0, y: 0 };
}

/**
 * Sort widgets by z-index for rendering order
 */
export function sortWidgetsByZIndex(widgets: WidgetConfig[]): WidgetConfig[] {
  return [...widgets].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
}

/**
 * Update widget z-index to bring to front
 */
export function bringToFront(widget: WidgetConfig, widgets: WidgetConfig[]): number {
  const maxZIndex = Math.max(...widgets.map(w => w.zIndex || 0), 0);
  return maxZIndex + 1;
}