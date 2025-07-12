import { z } from 'zod';

// Base widget configuration schema
export const WidgetConfigSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(50),
  displayType: z.enum(['gauge', 'graph', 'simple', 'meter', 'multi-resource']),
  orientation: z.enum(['vertical', 'horizontal']),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    width: z.number().min(1),
    height: z.number().min(1)
  }),
  sensors: z.array(z.string()).min(1),
  theme: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Style configuration schema
export const StyleConfigSchema = z.object({
  appearance: z.object({
    style: z.enum(['circular', 'arc', 'linear', 'area', 'line', 'bar']).optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    gradientColors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).optional(),
    thickness: z.number().min(1).max(20).default(4),
    width: z.number().min(1).max(20).default(2),
    // Arc-specific options
    startAngle: z.number().min(0).max(360).optional(),
    endAngle: z.number().min(0).max(360).optional(),
    tickCount: z.number().min(0).max(20).optional()
  }),
  icon: z.object({
    show: z.boolean().default(true),
    name: z.enum(['thermometer', 'fan', 'cpu', 'gpu', 'memory', 'storage', 'network']),
    size: z.number().min(12).max(64).default(24),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    thickness: z.number().min(1).max(8).default(2)
  }).optional(),
  typography: z.object({
    showValue: z.boolean().default(true),
    showLabel: z.boolean().default(true),
    valueColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    labelColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    unitOverride: z.string().max(10).optional()
  }),
  border: z.object({
    enabled: z.boolean().default(false),
    style: z.enum(['solid', 'dotted', 'dashed', 'custom-svg']).default('solid'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    width: z.number().min(1).max(8).default(1)
  }).optional(),
  // Cosmic UI specific
  cosmicFrame: z.object({
    type: z.enum(['basic', 'enhanced', 'custom']).default('basic'),
    glowEffect: z.boolean().default(true),
    animationSpeed: z.number().min(0).max(10).default(5),
    customSvgPath: z.string().optional()
  }).optional()
});

// Alert configuration schema
export const AlertConfigSchema = z.object({
  enabled: z.boolean().default(false),
  thresholds: z.array(z.object({
    id: z.string().uuid(),
    value: z.number(),
    operator: z.enum(['>', '<', '>=', '<=', '==', '!=']).default('>'),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    message: z.string().min(1).max(100),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    sound: z.boolean().default(false),
    persist: z.boolean().default(false)
  })).max(5) // Max 5 thresholds per widget
});

// Complete widget schema combining all parts
export const CompleteWidgetSchema = WidgetConfigSchema.extend({
  style: StyleConfigSchema,
  alerts: AlertConfigSchema
});

// Widget preset schema for library
export const WidgetPresetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(30),
  description: z.string().max(200).optional(),
  category: z.enum(['gaming', 'professional', 'minimal', 'rgb', 'cyberpunk']),
  thumbnail: z.string().url().optional(), // Base64 or URL
  config: CompleteWidgetSchema.omit({ id: true, createdAt: true, updatedAt: true, position: true }),
  tags: z.array(z.string()).max(5),
  isCustom: z.boolean().default(false),
  downloads: z.number().min(0).default(0),
  rating: z.number().min(0).max(5).optional(),
  author: z.string().max(50).optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0')
});

// AI generation request schema
export const AIGenerationRequestSchema = z.object({
  prompt: z.string().min(10).max(500),
  context: z.object({
    availableSensors: z.array(z.string()),
    currentTheme: z.string(),
    dashboardState: z.object({
      widgets: z.array(WidgetConfigSchema),
      screenSize: z.object({
        width: z.number(),
        height: z.number()
      })
    })
  }),
  options: z.object({
    creativity: z.number().min(0).max(1).default(0.7),
    model: z.enum(['gemini-1.5-pro', 'gemini-1.5-flash']).default('gemini-1.5-pro'),
    maxVariations: z.number().min(1).max(5).default(3),
    includeCustomSvg: z.boolean().default(false)
  })
});

// AI generation response schema
export const AIGenerationResponseSchema = z.object({
  success: z.boolean(),
  variations: z.array(z.object({
    id: z.string().uuid(),
    config: CompleteWidgetSchema.omit({ id: true, createdAt: true, updatedAt: true, position: true }),
    confidence: z.number().min(0).max(1),
    reasoning: z.string().max(200),
    customSvg: z.string().optional()
  })),
  metadata: z.object({
    processingTime: z.number(),
    model: z.string(),
    tokensUsed: z.number()
  }),
  error: z.string().optional()
});

// Hardware sensor data schema
export const SensorDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['temperature', 'usage', 'frequency', 'voltage', 'fan', 'power', 'memory', 'storage']),
  value: z.number(),
  unit: z.string(),
  min: z.number().optional(),
  max: z.number().optional(),
  timestamp: z.date(),
  hardware: z.enum(['cpu', 'gpu', 'memory', 'storage', 'network', 'motherboard'])
});

// WebSocket message schema
export const WebSocketMessageSchema = z.object({
  type: z.enum(['sensor_data', 'connection_status', 'error', 'ping']),
  data: z.union([
    z.array(SensorDataSchema),
    z.object({ status: z.enum(['connected', 'disconnected', 'reconnecting']) }),
    z.object({ message: z.string(), code: z.number() }),
    z.object({ timestamp: z.date() })
  ]),
  timestamp: z.date()
});

// Dashboard configuration schema
export const DashboardConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  theme: z.enum(['gaming', 'rgb', 'neon', 'cyberpunk', 'minimal']),
  widgets: z.array(CompleteWidgetSchema),
  layout: z.object({
    gridSize: z.number().min(10).max(50).default(20),
    snapToGrid: z.boolean().default(true),
    showGrid: z.boolean().default(false),
    backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    backgroundImage: z.string().url().optional()
  }),
  settings: z.object({
    refreshRate: z.number().min(100).max(10000).default(1000),
    enableNotifications: z.boolean().default(true),
    enableAnimations: z.boolean().default(true),
    enableSound: z.boolean().default(false),
    autoSave: z.boolean().default(true)
  }),
  version: z.string().regex(/^\d+\.\d+\.\d+$/).default('1.0.0'),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Export/Import schema for sharing
export const ExportConfigSchema = z.object({
  type: z.enum(['widget', 'preset', 'dashboard', 'theme']),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  data: z.union([
    CompleteWidgetSchema,
    WidgetPresetSchema,
    DashboardConfigSchema,
    z.object({ name: z.string(), colors: z.record(z.string()) })
  ]),
  metadata: z.object({
    exportedAt: z.date(),
    exportedBy: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional()
  })
});

// Type exports for TypeScript
export type WidgetConfig = z.infer<typeof WidgetConfigSchema>;
export type StyleConfig = z.infer<typeof StyleConfigSchema>;
export type AlertConfig = z.infer<typeof AlertConfigSchema>;
export type CompleteWidget = z.infer<typeof CompleteWidgetSchema>;
export type WidgetPreset = z.infer<typeof WidgetPresetSchema>;
export type AIGenerationRequest = z.infer<typeof AIGenerationRequestSchema>;
export type AIGenerationResponse = z.infer<typeof AIGenerationResponseSchema>;
export type SensorData = z.infer<typeof SensorDataSchema>;
export type WebSocketMessage = z.infer<typeof WebSocketMessageSchema>;
export type DashboardConfig = z.infer<typeof DashboardConfigSchema>;
export type ExportConfig = z.infer<typeof ExportConfigSchema>;

// Validation helper functions
export function validateWidgetConfig(config: unknown): CompleteWidget {
  return CompleteWidgetSchema.parse(config);
}

export function validatePreset(preset: unknown): WidgetPreset {
  return WidgetPresetSchema.parse(preset);
}

export function validateAIRequest(request: unknown): AIGenerationRequest {
  return AIGenerationRequestSchema.parse(request);
}

export function validateSensorData(data: unknown): SensorData[] {
  return z.array(SensorDataSchema).parse(data);
}

export function validateExportConfig(config: unknown): ExportConfig {
  return ExportConfigSchema.parse(config);
}

// Schema validation with detailed error reporting
export function validateWithErrors<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.issues.map(issue => 
    `${issue.path.join('.')}: ${issue.message}`
  );
  
  return { success: false, errors };
} 