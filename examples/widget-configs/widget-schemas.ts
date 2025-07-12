// SenseCanvas: Widget Configuration Schemas
// Zod schemas for comprehensive widget configuration validation

import { z } from 'zod';

// Base types
export const PositionSchema = z.object({
  x: z.number().min(0).max(10000),
  y: z.number().min(0).max(10000)
});

export const SizeSchema = z.object({
  width: z.number().min(100).max(800),
  height: z.number().min(100).max(600)
});

export const ColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color');

export const SensorTypeSchema = z.enum(['cpu', 'gpu', 'memory', 'storage', 'network']);
export const WidgetTypeSchema = z.enum(['gauge', 'graph', 'text', 'multi-sensor']);
export const ThemeTypeSchema = z.enum(['default', 'cyberpunk', 'gaming', 'minimal', 'rgb']);

// Widget style schema
export const WidgetStyleSchema = z.object({
  theme: ThemeTypeSchema,
  colors: z.array(ColorSchema).min(1).max(10),
  opacity: z.number().min(0).max(1),
  borderRadius: z.number().min(0).max(50),
  backgroundImage: z.string().url().optional(),
  fontSize: z.number().min(8).max(48).optional(),
  fontFamily: z.string().optional(),
  borderWidth: z.number().min(0).max(10).optional(),
  borderColor: ColorSchema.optional(),
  shadowEnabled: z.boolean().optional(),
  shadowColor: ColorSchema.optional(),
  shadowBlur: z.number().min(0).max(20).optional(),
  gradientEnabled: z.boolean().optional(),
  gradientDirection: z.enum(['horizontal', 'vertical', 'radial']).optional()
});

// Alert schemas
export const AlertThresholdsSchema = z.object({
  warning: z.number().min(0).max(100),
  critical: z.number().min(0).max(100)
}).refine(data => data.critical > data.warning, {
  message: "Critical threshold must be higher than warning threshold"
});

export const WidgetAlertsSchema = z.object({
  enabled: z.boolean(),
  thresholds: AlertThresholdsSchema,
  showNotifications: z.boolean().optional(),
  playSound: z.boolean().optional(),
  flashWidget: z.boolean().optional()
});

// Type-specific configuration schemas
export const GaugeConfigSchema = z.object({
  minValue: z.number(),
  maxValue: z.number(),
  startAngle: z.number().min(-360).max(360),
  endAngle: z.number().min(-360).max(360),
  arcWidth: z.number().min(1).max(50),
  showValue: z.boolean(),
  showLabel: z.boolean(),
  showTicks: z.boolean(),
  tickInterval: z.number().min(1).max(100),
  unit: z.string().max(10)
}).refine(data => data.maxValue > data.minValue, {
  message: "Max value must be greater than min value"
});

export const GraphConfigSchema = z.object({
  timeRange: z.number().min(1).max(1440), // 1 minute to 24 hours
  maxDataPoints: z.number().min(10).max(1000),
  showGrid: z.boolean(),
  showAxes: z.boolean(),
  lineWidth: z.number().min(1).max(10),
  fillArea: z.boolean(),
  smoothing: z.boolean(),
  yAxisMin: z.number().optional(),
  yAxisMax: z.number().optional()
}).refine(data => {
  if (data.yAxisMin !== undefined && data.yAxisMax !== undefined) {
    return data.yAxisMax > data.yAxisMin;
  }
  return true;
}, {
  message: "Y-axis max must be greater than min"
});

export const TextConfigSchema = z.object({
  format: z.string().min(1).max(100),
  fontSize: z.number().min(8).max(72),
  fontWeight: z.enum(['normal', 'bold', 'light']),
  alignment: z.enum(['left', 'center', 'right']),
  showIcon: z.boolean(),
  iconPosition: z.enum(['left', 'right', 'top', 'bottom']),
  iconSize: z.number().min(8).max(64)
});

export const MultiSensorConfigSchema = z.object({
  sensors: z.array(SensorTypeSchema).min(1).max(10),
  layout: z.enum(['grid', 'list', 'radial']),
  showLabels: z.boolean(),
  showValues: z.boolean(),
  compactMode: z.boolean()
});

// Main widget configuration schema
export const WidgetConfigSchema = z.object({
  id: z.string().min(1).max(100),
  type: WidgetTypeSchema,
  title: z.string().min(1).max(50),
  sensorType: SensorTypeSchema,
  position: PositionSchema,
  size: SizeSchema,
  style: WidgetStyleSchema,
  alerts: WidgetAlertsSchema,
  
  // Type-specific configurations (conditional)
  gaugeConfig: GaugeConfigSchema.optional(),
  graphConfig: GraphConfigSchema.optional(),
  textConfig: TextConfigSchema.optional(),
  multiSensorConfig: MultiSensorConfigSchema.optional(),
  
  // Metadata
  createdAt: z.number().min(0),
  updatedAt: z.number().min(0),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid version format'),
  tags: z.array(z.string().max(20)).max(10),
  description: z.string().max(200).optional(),
  author: z.string().max(50).optional(),
  
  // Runtime state (optional, not serialized)
  isSelected: z.boolean().optional(),
  isResizing: z.boolean().optional(),
  isDragging: z.boolean().optional(),
  zIndex: z.number().min(0).max(1000).optional()
}).refine(data => {
  // Ensure type-specific config is present based on widget type
  switch (data.type) {
    case 'gauge':
      return data.gaugeConfig !== undefined;
    case 'graph':
      return data.graphConfig !== undefined;
    case 'text':
      return data.textConfig !== undefined;
    case 'multi-sensor':
      return data.multiSensorConfig !== undefined;
    default:
      return true;
  }
}, {
  message: "Type-specific configuration is required for the selected widget type"
});

// Widget library item schema
export const WidgetLibraryItemSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  category: z.string().min(1).max(30),
  tags: z.array(z.string().max(20)).max(10),
  thumbnail: z.string().url().or(z.string().startsWith('data:image/')),
  config: WidgetConfigSchema,
  popularity: z.number().min(0).max(100),
  author: z.string().max(50),
  createdAt: z.number().min(0),
  downloads: z.number().min(0)
});

// Dashboard layout schema
export const DashboardLayoutSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(50),
  description: z.string().max(200),
  widgets: z.array(WidgetConfigSchema).max(50),
  gridSize: z.object({
    cols: z.number().min(1).max(20),
    rows: z.number().min(1).max(20),
    cellSize: z.number().min(50).max(200)
  }),
  theme: ThemeTypeSchema,
  backgroundImage: z.string().url().optional(),
  backgroundColor: ColorSchema.optional(),
  
  // Metadata
  createdAt: z.number().min(0),
  updatedAt: z.number().min(0),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid version format'),
  author: z.string().max(50).optional(),
  tags: z.array(z.string().max(20)).max(10),
  
  // Export/Import
  isPublic: z.boolean(),
  shareKey: z.string().optional()
});

// AI generation schemas
export const AiGenerationPromptSchema = z.object({
  id: z.string().min(1).max(100),
  prompt: z.string().min(10).max(500),
  context: z.object({
    sensorType: SensorTypeSchema.optional(),
    widgetType: WidgetTypeSchema.optional(),
    theme: ThemeTypeSchema.optional(),
    style: z.string().max(100).optional()
  }),
  generatedConfig: WidgetConfigSchema.partial(),
  rating: z.number().min(1).max(5).optional(),
  createdAt: z.number().min(0)
});

// Form validation schemas (for partial updates)
export const WidgetFormDataSchema = WidgetConfigSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const WidgetUpdateSchema = WidgetConfigSchema.partial();

// Import/Export schemas
export const WidgetExportSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid version format'),
  exportedAt: z.number().min(0),
  exportedBy: z.string().max(50).optional(),
  widgets: z.array(WidgetConfigSchema).min(1).max(50),
  layout: DashboardLayoutSchema.optional()
});

export const WidgetImportSchema = z.object({
  data: WidgetExportSchema,
  options: z.object({
    preserveIds: z.boolean().optional(),
    replaceExisting: z.boolean().optional(),
    validateCompatibility: z.boolean().optional()
  }).optional()
});

// Validation helper functions
export function validateWidgetConfig(config: unknown) {
  const result = WidgetConfigSchema.safeParse(config);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    };
  }
  return { valid: true, data: result.data };
}

export function validateDashboardLayout(layout: unknown) {
  const result = DashboardLayoutSchema.safeParse(layout);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    };
  }
  return { valid: true, data: result.data };
}

export function validateWidgetImport(importData: unknown) {
  const result = WidgetImportSchema.safeParse(importData);
  if (!result.success) {
    return {
      valid: false,
      errors: result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code
      }))
    };
  }
  return { valid: true, data: result.data };
}

// Default values for creating new widgets
export const DEFAULT_WIDGET_CONFIG = {
  type: 'gauge' as const,
  title: 'New Widget',
  sensorType: 'cpu' as const,
  position: { x: 0, y: 0 },
  size: { width: 200, height: 200 },
  style: {
    theme: 'default' as const,
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
    gradientDirection: 'horizontal' as const
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
  },
  createdAt: Date.now(),
  updatedAt: Date.now(),
  version: '1.0.0',
  tags: [],
  isSelected: false,
  isResizing: false,
  isDragging: false,
  zIndex: 1
};

// Type exports for TypeScript
export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;
export type WidgetLibraryItem = z.infer<typeof WidgetLibraryItemSchema>;
export type DashboardLayout = z.infer<typeof DashboardLayoutSchema>;
export type AiGenerationPrompt = z.infer<typeof AiGenerationPromptSchema>;
export type WidgetFormData = z.infer<typeof WidgetFormDataSchema>;
export type WidgetUpdate = z.infer<typeof WidgetUpdateSchema>;
export type WidgetExport = z.infer<typeof WidgetExportSchema>;
export type WidgetImport = z.infer<typeof WidgetImportSchema>; 