/**
 * Zod validation schemas for widget configuration
 * Type-safe form validation with React Hook Form
 */

import { z } from 'zod';

// Base widget schema
const baseWidgetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50, 'Title too long'),
  sensorPath: z.string().min(1, 'Sensor path is required'),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0)
  }),
  size: z.object({
    w: z.number().min(1).max(12),
    h: z.number().min(1).max(8)
  }),
  minSize: z.object({
    w: z.number().min(1),
    h: z.number().min(1)
  }),
  maxSize: z.object({
    w: z.number().min(1),
    h: z.number().min(1)
  }).optional(),
  theme: z.enum(['cyberpunk', 'neon', 'gaming', 'corporate', 'matrix']),
  range: z.object({
    min: z.number(),
    max: z.number()
  }).refine(data => data.max > data.min, {
    message: 'Max must be greater than min'
  }),
  unit: z.string().max(10, 'Unit too long'),
  alerts: z.array(z.object({
    id: z.string(),
    condition: z.enum(['greater_than', 'less_than', 'equals', 'not_equals']),
    threshold: z.number(),
    severity: z.enum(['warning', 'critical']),
    message: z.string().min(1, 'Alert message required'),
    enabled: z.boolean()
  }))
});

// Gauge widget config schema
export const gaugeConfigSchema = z.object({
  gaugeType: z.enum(['arc', 'circle', 'linear']),
  startAngle: z.number().min(-180).max(180),
  endAngle: z.number().min(-180).max(180),
  thickness: z.number().min(5).max(50),
  showValue: z.boolean(),
  showMinMax: z.boolean(),
  animated: z.boolean(),
  glowEffect: z.boolean(),
  segments: z.number().min(1).max(20),
  segmentColors: z.array(z.string()).optional(),
  innerRadius: z.number().min(20).max(200),
  outerRadius: z.number().min(30).max(250)
}).refine(data => data.outerRadius > data.innerRadius, {
  message: 'Outer radius must be greater than inner radius'
});

export const gaugeWidgetSchema = baseWidgetSchema.extend({
  type: z.literal('gauge'),
  config: gaugeConfigSchema
});

// Graph widget config schema
export const graphConfigSchema = z.object({
  chartType: z.enum(['line', 'area', 'bar']),
  timeRange: z.number().min(10).max(3600),
  maxDataPoints: z.number().min(10).max(1000),
  showGrid: z.boolean(),
  showLegend: z.boolean(),
  smoothLine: z.boolean(),
  fillArea: z.boolean(),
  showValues: z.boolean(),
  yAxisMin: z.number().optional(),
  yAxisMax: z.number().optional(),
  animationSpeed: z.number().min(100).max(5000)
});

export const graphWidgetSchema = baseWidgetSchema.extend({
  type: z.literal('graph'),
  config: graphConfigSchema
});

// Simple widget config schema
export const simpleConfigSchema = z.object({
  displayMode: z.enum(['compact', 'medium', 'large', 'xl']),
  showLabel: z.boolean(),
  showUnit: z.boolean(),
  showTrend: z.boolean(),
  showMinMax: z.boolean(),
  precision: z.number().min(0).max(5),
  fontSize: z.union([z.string(), z.enum(['auto'])]),
  textAlign: z.enum(['left', 'center', 'right']),
  iconType: z.enum(['cpu', 'gpu', 'memory', 'storage', 'fan', 'temperature', 'voltage', 'frequency']).optional(),
  customIcon: z.string().optional(),
  glowEffect: z.boolean(),
  pulseOnChange: z.boolean(),
  colorThresholds: z.array(z.object({
    value: z.number(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format')
  })).optional()
});

export const simpleWidgetSchema = baseWidgetSchema.extend({
  type: z.literal('simple'),
  config: simpleConfigSchema
});

// Meter widget config schema
export const meterConfigSchema = z.object({
  meterType: z.enum(['horizontal', 'vertical', 'circular']),
  showValue: z.boolean(),
  showMarkers: z.boolean(),
  showThresholds: z.boolean(),
  segments: z.number().min(1).max(50),
  cornerRadius: z.number().min(0).max(20),
  thickness: z.number().min(5).max(100),
  glowEffect: z.boolean(),
  animationSpeed: z.number().min(100).max(5000),
  gradientColors: z.array(z.string()).optional(),
  thresholdColors: z.object({
    normal: z.string(),
    warning: z.string(),
    critical: z.string()
  })
});

export const meterWidgetSchema = baseWidgetSchema.extend({
  type: z.literal('meter'),
  config: meterConfigSchema
});

// Multi-resource widget config schema
export const multiResourceConfigSchema = z.object({
  displayMode: z.enum(['grid', 'list']),
  showLabels: z.boolean(),
  showValues: z.boolean(),
  showBars: z.boolean(),
  compactMode: z.boolean(),
  maxItems: z.number().min(1).max(20),
  sortBy: z.enum(['name', 'value', 'status']),
  sortDirection: z.enum(['asc', 'desc']),
  colorCoding: z.boolean(),
  animationDelay: z.number().min(0).max(1000),
  barHeight: z.number().min(2).max(20),
  itemSpacing: z.number().min(2).max(20)
});

export const multiResourceWidgetSchema = baseWidgetSchema.extend({
  type: z.literal('multi-resource'),
  config: multiResourceConfigSchema,
  resources: z.array(z.object({
    id: z.string(),
    label: z.string().min(1, 'Label required'),
    sensorPath: z.string().min(1, 'Sensor path required'),
    unit: z.string().optional(),
    color: z.string().optional(),
    minValue: z.number().optional(),
    maxValue: z.number().optional(),
    warningThreshold: z.number().optional(),
    criticalThreshold: z.number().optional()
  }))
});

// Discriminated union schema for all widget types
export const widgetSchema = z.discriminatedUnion('type', [
  gaugeWidgetSchema,
  graphWidgetSchema,
  simpleWidgetSchema,
  meterWidgetSchema,
  multiResourceWidgetSchema
]);

// Form validation helpers
export const validateWidgetConfig = (data: unknown) => {
  try {
    return widgetSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => ({
          path: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return { success: false, errors: [{ path: 'unknown', message: 'Validation failed' }] };
  }
};

// Get schema for specific widget type
export const getWidgetSchema = (type: string) => {
  switch (type) {
    case 'gauge': return gaugeWidgetSchema;
    case 'graph': return graphWidgetSchema;
    case 'simple': return simpleWidgetSchema;
    case 'meter': return meterWidgetSchema;
    case 'multi-resource': return multiResourceWidgetSchema;
    default: throw new Error(`Unknown widget type: ${type}`);
  }
};

// Default configurations for each widget type
export const defaultConfigs = {
  gauge: {
    gaugeType: 'arc',
    startAngle: -90,
    endAngle: 90,
    thickness: 20,
    showValue: true,
    showMinMax: true,
    animated: true,
    glowEffect: true,
    segments: 1,
    innerRadius: 60,
    outerRadius: 100
  },
  graph: {
    chartType: 'line',
    timeRange: 60,
    maxDataPoints: 100,
    showGrid: true,
    showLegend: true,
    smoothLine: true,
    fillArea: false,
    showValues: false,
    animationSpeed: 1000
  },
  simple: {
    displayMode: 'large',
    showLabel: true,
    showUnit: true,
    showTrend: false,
    showMinMax: false,
    precision: 1,
    fontSize: 'auto',
    textAlign: 'center',
    glowEffect: false,
    pulseOnChange: true
  },
  meter: {
    meterType: 'horizontal',
    showValue: true,
    showMarkers: true,
    showThresholds: true,
    segments: 10,
    cornerRadius: 4,
    thickness: 20,
    glowEffect: true,
    animationSpeed: 1000,
    thresholdColors: {
      normal: '#00ff88',
      warning: '#ffaa00',
      critical: '#ff0044'
    }
  },
  'multi-resource': {
    displayMode: 'grid',
    showLabels: true,
    showValues: true,
    showBars: true,
    compactMode: false,
    maxItems: 8,
    sortBy: 'name',
    sortDirection: 'asc',
    colorCoding: true,
    animationDelay: 50,
    barHeight: 4,
    itemSpacing: 8
  }
} as const;