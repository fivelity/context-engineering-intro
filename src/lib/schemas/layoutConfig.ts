import { z } from 'zod';
import { WidgetConfigSchema } from './widgetConfig.js';

// Grid configuration schema
export const GridConfigSchema = z.object({
	cols: z.number().min(1).max(100),
	cellSize: z.number().min(16).max(128),
	gap: z.number().min(0).max(32),
	bounds: z.object({
		width: z.number().min(320).max(7680),
		height: z.number().min(240).max(4320)
	})
});

// Dashboard layout schema
export const DashboardLayoutSchema = z.record(
	z.string(),
	z.object({
		x: z.number().min(0),
		y: z.number().min(0),
		w: z.number().min(1),
		h: z.number().min(1)
	})
);

// Dashboard configuration schema
export const DashboardConfigSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(200),
	description: z.string().max(1000),
	grid: GridConfigSchema,
	widgets: z.array(WidgetConfigSchema),
	theme: z.string(),
	createdAt: z.number(),
	updatedAt: z.number(),
	version: z.string()
});

// Dashboard state schema
export const DashboardStateSchema = z.object({
	isEditing: z.boolean(),
	selectedWidget: z.string().nullable(),
	draggedWidget: z.string().nullable(),
	showGrid: z.boolean(),
	snapToGrid: z.boolean(),
	zoom: z.number().min(0.25).max(3),
	viewMode: z.enum(['desktop', 'tablet', 'mobile'])
});

// Dashboard metrics schema
export const DashboardMetricsSchema = z.object({
	totalWidgets: z.number().min(0),
	activeAlerts: z.number().min(0),
	connectionStatus: z.enum(['connected', 'disconnected', 'reconnecting']),
	lastUpdate: z.number(),
	performance: z.object({
		fps: z.number().min(0).max(120),
		memory: z.number().min(0),
		renderTime: z.number().min(0)
	})
});

// Import/Export data schema
export const ImportExportDataSchema = z.object({
	version: z.string(),
	type: z.enum(['dashboard', 'layout', 'widget']),
	timestamp: z.number(),
	data: z.union([DashboardConfigSchema, DashboardLayoutSchema, WidgetConfigSchema]),
	metadata: z.object({
		source: z.string(),
		author: z.string().optional(),
		description: z.string().optional()
	})
});

// Layout template schema
export const LayoutTemplateSchema = z.object({
	id: z.string(),
	name: z.string().min(1).max(200),
	description: z.string().max(1000),
	category: z.enum(['performance', 'gaming', 'server', 'minimal', 'custom']),
	thumbnail: z.string().optional(),
	widgets: z.array(WidgetConfigSchema),
	grid: GridConfigSchema,
	popularity: z.number().min(0).max(100),
	tags: z.array(z.string())
});

// Dashboard preferences schema
export const DashboardPreferencesSchema = z.object({
	autoSave: z.boolean(),
	refreshInterval: z.number().min(100).max(60000),
	showTooltips: z.boolean(),
	enableAnimations: z.boolean(),
	compactMode: z.boolean(),
	alertSettings: z.object({
		enableDesktopNotifications: z.boolean(),
		enableSounds: z.boolean(),
		soundVolume: z.number().min(0).max(1),
		alertHistory: z.number().min(1).max(365)
	}),
	performance: z.object({
		maxWidgets: z.number().min(1).max(100),
		reducedMotion: z.boolean(),
		lowPowerMode: z.boolean()
	})
});

// Dashboard action schema
export const DashboardActionSchema = z.object({
	type: z.enum(['ADD_WIDGET', 'REMOVE_WIDGET', 'UPDATE_WIDGET', 'MOVE_WIDGET', 'RESIZE_WIDGET', 'CLEAR_ALL']),
	payload: z.any(),
	timestamp: z.number(),
	userId: z.string().optional()
});

// Dashboard history schema
export const DashboardHistorySchema = z.object({
	actions: z.array(DashboardActionSchema),
	currentIndex: z.number().min(-1),
	maxHistory: z.number().min(1).max(1000)
});

// Form schemas for UI validation
export const DashboardFormSchema = z.object({
	name: z.string().min(1).max(200),
	description: z.string().max(1000),
	theme: z.string(),
	gridCols: z.number().min(1).max(100),
	gridCellSize: z.number().min(16).max(128),
	gridGap: z.number().min(0).max(32),
	autoSave: z.boolean(),
	refreshInterval: z.number().min(100).max(60000),
	enableAnimations: z.boolean()
});

export const GridSettingsFormSchema = z.object({
	cols: z.number().min(1).max(100),
	cellSize: z.number().min(16).max(128),
	gap: z.number().min(0).max(32),
	showGrid: z.boolean(),
	snapToGrid: z.boolean()
});

export const ExportOptionsFormSchema = z.object({
	includeWidgets: z.boolean(),
	includeLayout: z.boolean(),
	includeTheme: z.boolean(),
	includePreferences: z.boolean(),
	format: z.enum(['json', 'compressed']),
	author: z.string().max(100).optional(),
	description: z.string().max(500).optional()
});

export const ImportOptionsFormSchema = z.object({
	mergeStrategy: z.enum(['replace', 'merge', 'append']),
	preserveIds: z.boolean(),
	validateBeforeImport: z.boolean(),
	backupBeforeImport: z.boolean()
});

// Layout optimization schema
export const LayoutOptimizationSchema = z.object({
	optimizeOverlaps: z.boolean(),
	minimizeSpace: z.boolean(),
	groupRelated: z.boolean(),
	preserveOrder: z.boolean(),
	respectMinSizes: z.boolean(),
	maintainAspectRatio: z.boolean()
});

// Collision detection schema
export const CollisionDetectionSchema = z.object({
	enableCollisionDetection: z.boolean(),
	allowOverlap: z.boolean(),
	snapTolerance: z.number().min(0).max(32),
	pushOthers: z.boolean(),
	compactOnDrag: z.boolean()
});

// Performance monitoring schema
export const PerformanceConfigSchema = z.object({
	enableMonitoring: z.boolean(),
	sampleRate: z.number().min(100).max(10000),
	maxSamples: z.number().min(10).max(1000),
	alertThresholds: z.object({
		fps: z.number().min(1).max(120),
		memory: z.number().min(1),
		renderTime: z.number().min(1)
	})
});

// Validation helper functions
export function validateDashboardConfig(config: unknown) {
	return DashboardConfigSchema.safeParse(config);
}

export function validateDashboardForm(form: unknown) {
	return DashboardFormSchema.safeParse(form);
}

export function validateImportData(data: unknown) {
	return ImportExportDataSchema.safeParse(data);
}

export function validateLayoutTemplate(template: unknown) {
	return LayoutTemplateSchema.safeParse(template);
}

export function validateGridSettings(settings: unknown) {
	return GridSettingsFormSchema.safeParse(settings);
}

// Type exports
export type DashboardConfigInput = z.infer<typeof DashboardConfigSchema>;
export type DashboardFormInput = z.infer<typeof DashboardFormSchema>;
export type DashboardLayoutInput = z.infer<typeof DashboardLayoutSchema>;
export type GridConfigInput = z.infer<typeof GridConfigSchema>;
export type ImportExportDataInput = z.infer<typeof ImportExportDataSchema>;
export type LayoutTemplateInput = z.infer<typeof LayoutTemplateSchema>;
export type DashboardPreferencesInput = z.infer<typeof DashboardPreferencesSchema>;
export type GridSettingsFormInput = z.infer<typeof GridSettingsFormSchema>;
export type ExportOptionsFormInput = z.infer<typeof ExportOptionsFormSchema>;
export type ImportOptionsFormInput = z.infer<typeof ImportOptionsFormSchema>;