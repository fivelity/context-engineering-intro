import { z } from 'zod';

// Base schemas for widget configuration validation
export const GridPositionSchema = z.object({
	x: z.number().min(0),
	y: z.number().min(0),
	w: z.number().min(1),
	h: z.number().min(1)
});

export const WidgetAppearanceSchema = z.object({
	colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(1),
	typography: z.object({
		fontSize: z.number().min(8).max(72),
		fontWeight: z.enum(['light', 'normal', 'medium', 'semibold', 'bold']),
		color: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
	}),
	borders: z.object({
		thickness: z.number().min(0).max(10),
		style: z.enum(['solid', 'dashed', 'dotted', 'none']),
		radius: z.number().min(0).max(50)
	}),
	chartParams: z.object({
		barThickness: z.number().min(1).max(50).optional(),
		strokeWidth: z.number().min(1).max(20).optional(),
		startAngle: z.number().min(0).max(360).optional(),
		endAngle: z.number().min(0).max(360).optional(),
		tickCount: z.number().min(2).max(100).optional(),
		segments: z.number().min(10).max(200).optional(),
		showLabels: z.boolean().optional(),
		animationDuration: z.number().min(0).max(5000).optional()
	}).optional()
});

export const AlertConditionSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(100),
	sensorPath: z.string().min(1),
	operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
	threshold: z.number(),
	unit: z.string(),
	enabled: z.boolean(),
	triggered: z.boolean(),
	lastTriggered: z.number().optional(),
	notificationEnabled: z.boolean(),
	severity: z.enum(['low', 'medium', 'high', 'critical'])
});

export const WidgetConfigSchema = z.object({
	id: z.string(),
	type: z.enum(['gauge', 'graph', 'simple', 'meter', 'multi-resource']),
	position: GridPositionSchema,
	size: GridPositionSchema.pick({ w: true, h: true }),
	title: z.string().min(1).max(200),
	sensorPath: z.string().min(1),
	appearance: WidgetAppearanceSchema,
	alerts: z.array(AlertConditionSchema),
	minSize: GridPositionSchema.pick({ w: true, h: true }),
	maxSize: GridPositionSchema.pick({ w: true, h: true }),
	createdAt: z.number(),
	updatedAt: z.number()
});

// Widget-specific schemas
export const GaugeWidgetConfigSchema = WidgetConfigSchema.extend({
	type: z.literal('gauge'),
	appearance: WidgetAppearanceSchema.extend({
		chartParams: z.object({
			segments: z.number().min(10).max(200).default(60),
			startAngle: z.number().min(0).max(360).default(0),
			endAngle: z.number().min(0).max(360).default(270),
			showLabels: z.boolean().default(true),
			animationDuration: z.number().min(0).max(5000).default(750)
		}).optional()
	})
});

export const GraphWidgetConfigSchema = WidgetConfigSchema.extend({
	type: z.literal('graph'),
	appearance: WidgetAppearanceSchema.extend({
		chartParams: z.object({
			strokeWidth: z.number().min(1).max(10).default(2),
			showLabels: z.boolean().default(true),
			tickCount: z.number().min(2).max(20).default(5),
			animationDuration: z.number().min(0).max(2000).default(500)
		}).optional()
	})
});

export const SimpleWidgetConfigSchema = WidgetConfigSchema.extend({
	type: z.literal('simple'),
	appearance: WidgetAppearanceSchema.extend({
		chartParams: z.object({
			showLabels: z.boolean().default(true),
			animationDuration: z.number().min(0).max(1000).default(250)
		}).optional()
	})
});

export const MeterWidgetConfigSchema = WidgetConfigSchema.extend({
	type: z.literal('meter'),
	appearance: WidgetAppearanceSchema.extend({
		chartParams: z.object({
			barThickness: z.number().min(2).max(20).default(8),
			showLabels: z.boolean().default(true),
			animationDuration: z.number().min(0).max(1000).default(300)
		}).optional()
	})
});

export const MultiResourceWidgetConfigSchema = WidgetConfigSchema.extend({
	type: z.literal('multi-resource'),
	sensorPath: z.string(), // Can be multiple paths separated by commas
	appearance: WidgetAppearanceSchema.extend({
		chartParams: z.object({
			showLabels: z.boolean().default(true),
			tickCount: z.number().min(2).max(10).default(4),
			animationDuration: z.number().min(0).max(1000).default(400)
		}).optional()
	})
});

// Union schema for all widget types
export const AnyWidgetConfigSchema = z.discriminatedUnion('type', [
	GaugeWidgetConfigSchema,
	GraphWidgetConfigSchema,
	SimpleWidgetConfigSchema,
	MeterWidgetConfigSchema,
	MultiResourceWidgetConfigSchema
]);

// Widget preset schema
export const WidgetPresetSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(100),
	description: z.string().max(500),
	category: z.string(),
	config: WidgetConfigSchema.partial(),
	tags: z.array(z.string())
});

// Widget registration schema
export const WidgetRegistrationSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(100),
	description: z.string().max(500),
	component: z.string(),
	defaultConfig: WidgetConfigSchema.partial(),
	defaultSize: GridPositionSchema.pick({ w: true, h: true }),
	minSize: GridPositionSchema.pick({ w: true, h: true }).optional(),
	maxSize: GridPositionSchema.pick({ w: true, h: true }).optional(),
	category: z.enum(['performance', 'thermal', 'power', 'storage', 'custom']),
	icon: z.string()
});

// Form validation schemas
export const WidgetFormSchema = z.object({
	title: z.string().min(1).max(200),
	type: z.enum(['gauge', 'graph', 'simple', 'meter', 'multi-resource']),
	sensorPath: z.string().min(1),
	colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(1).max(10),
	fontSize: z.number().min(8).max(72),
	fontWeight: z.enum(['light', 'normal', 'medium', 'semibold', 'bold']),
	borderRadius: z.number().min(0).max(50),
	borderThickness: z.number().min(0).max(10),
	enableAlerts: z.boolean(),
	alertThreshold: z.number().optional(),
	alertSeverity: z.enum(['low', 'medium', 'high', 'critical']).optional()
});

export const AlertFormSchema = z.object({
	name: z.string().min(1).max(100),
	sensorPath: z.string().min(1),
	operator: z.enum(['gt', 'lt', 'eq', 'gte', 'lte']),
	threshold: z.number(),
	unit: z.string().min(1),
	severity: z.enum(['low', 'medium', 'high', 'critical']),
	notificationEnabled: z.boolean()
});

// Validation helper functions
export function validateWidgetConfig(config: unknown) {
	return WidgetConfigSchema.safeParse(config);
}

export function validateWidgetForm(form: unknown) {
	return WidgetFormSchema.safeParse(form);
}

export function validateAlertForm(form: unknown) {
	return AlertFormSchema.safeParse(form);
}

// Type exports
export type WidgetConfigInput = z.infer<typeof WidgetConfigSchema>;
export type WidgetFormInput = z.infer<typeof WidgetFormSchema>;
export type AlertFormInput = z.infer<typeof AlertFormSchema>;
export type WidgetPresetInput = z.infer<typeof WidgetPresetSchema>;
export type WidgetRegistrationInput = z.infer<typeof WidgetRegistrationSchema>;