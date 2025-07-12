/**
 * SenseCanvas Widget Configuration Types and Schemas
 * Zod schemas and TypeScript types for widget configurations (synced with server models)
 */

import { z } from 'zod';

// Base types and enums
export const WidgetTypeSchema = z.enum(['gauge', 'graph', 'text', 'multi-sensor']);
export const SensorTypeSchema = z.enum(['cpu', 'gpu', 'memory', 'storage', 'network']);
export const ThemeTypeSchema = z.enum(['default', 'cyberpunk', 'gaming', 'minimal', 'rgb']);

export type WidgetType = z.infer<typeof WidgetTypeSchema>;
export type SensorType = z.infer<typeof SensorTypeSchema>;
export type ThemeType = z.infer<typeof ThemeTypeSchema>;

// Position and size schemas
export const PositionSchema = z.object({
  x: z.number().min(0).max(10000),
  y: z.number().min(0).max(10000)
});

export const SizeSchema = z.object({
  width: z.number().min(100).max(800),
  height: z.number().min(100).max(600)
});

export type Position = z.infer<typeof PositionSchema>;
export type Size = z.infer<typeof SizeSchema>;

// Color validation
export const ColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color');

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

export type WidgetStyle = z.infer<typeof WidgetStyleSchema>;

// Alert configuration schemas
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

export type AlertThresholds = z.infer<typeof AlertThresholdsSchema>;
export type WidgetAlerts = z.infer<typeof WidgetAlertsSchema>;

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

export type GaugeConfig = z.infer<typeof GaugeConfigSchema>;
export type GraphConfig = z.infer<typeof GraphConfigSchema>;
export type TextConfig = z.infer<typeof TextConfigSchema>;
export type MultiSensorConfig = z.infer<typeof MultiSensorConfigSchema>;

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

export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;

// Grid configuration schema
export const GridSizeSchema = z.object({
  cols: z.number().min(1).max(20),
  rows: z.number().min(1).max(20),
  cellSize: z.number().min(50).max(200)
});

export type GridSize = z.infer<typeof GridSizeSchema>;

// Dashboard layout schema
export const DashboardLayoutSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(50),
  description: z.string().max(200),
  widgets: z.array(WidgetConfigSchema).max(50),
  gridSize: GridSizeSchema,
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
}).refine(data => {
  // Ensure all widget IDs are unique
  const widgetIds = data.widgets.map(w => w.id);
  return widgetIds.length === new Set(widgetIds).size;
}, {
  message: "Widget IDs must be unique within a layout"
});

export type DashboardLayout = z.infer<typeof DashboardLayoutSchema>;

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

export type WidgetLibraryItem = z.infer<typeof WidgetLibraryItemSchema>;

// AI generation schemas
export const AiGenerationPromptSchema = z.object({
  id: z.string().min(1).max(100),
  prompt: z.string().min(10).max(500),
  context: z.record(z.any()),
  generatedConfig: z.record(z.any()),
  rating: z.number().min(1).max(5).optional(),
  createdAt: z.number().min(0)
});

export type AiGenerationPrompt = z.infer<typeof AiGenerationPromptSchema>;

// Export/Import schemas
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

export type WidgetExport = z.infer<typeof WidgetExportSchema>;
export type WidgetImport = z.infer<typeof WidgetImportSchema>;

// Form validation schemas (for partial updates)
export const WidgetFormDataSchema = WidgetConfigSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const WidgetUpdateSchema = WidgetConfigSchema.partial();

export type WidgetFormData = z.infer<typeof WidgetFormDataSchema>;
export type WidgetUpdate = z.infer<typeof WidgetUpdateSchema>;

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

// Default configurations
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

export const DEFAULT_GAUGE_CONFIG: GaugeConfig = {
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
};

export const DEFAULT_GRAPH_CONFIG: GraphConfig = {
  timeRange: 60, // 1 hour
  maxDataPoints: 100,
  showGrid: true,
  showAxes: true,
  lineWidth: 2,
  fillArea: false,
  smoothing: true
};

export const DEFAULT_TEXT_CONFIG: TextConfig = {
  format: '{value}{unit}',
  fontSize: 24,
  fontWeight: 'normal',
  alignment: 'center',
  showIcon: true,
  iconPosition: 'left',
  iconSize: 24
};

export const DEFAULT_MULTI_SENSOR_CONFIG: MultiSensorConfig = {
  sensors: ['cpu'],
  layout: 'grid',
  showLabels: true,
  showValues: true,
  compactMode: false
};

// Widget type constants
export const WIDGET_TYPES: WidgetType[] = ['gauge', 'graph', 'text', 'multi-sensor'];
export const SENSOR_TYPES: SensorType[] = ['cpu', 'gpu', 'memory', 'storage', 'network'];
export const THEME_TYPES: ThemeType[] = ['default', 'cyberpunk', 'gaming', 'minimal', 'rgb'];

// Utility types
export type WidgetConfiguratorTab = 'library' | 'ai-generate' | 'create-custom';
export type WidgetValidationError = {
  field: string;
  message: string;
  severity: 'error' | 'warning';
};

export interface WidgetConfiguratorState {
  activeTab: WidgetConfiguratorTab;
  currentConfig: Partial<WidgetConfig>;
  validationErrors: WidgetValidationError[];
  isValid: boolean;
  previewData: any;
  libraryItems: WidgetLibraryItem[];
  recentPrompts: AiGenerationPrompt[];
}

// Utility types for forms and API
export type WidgetCreate = Omit<WidgetConfig, 'id' | 'createdAt' | 'updatedAt'>;
export type WidgetPreset = Omit<WidgetConfig, 'id' | 'position' | 'createdAt' | 'updatedAt' | 'isSelected' | 'isResizing' | 'isDragging' | 'zIndex'>;