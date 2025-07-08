// Widget configuration types
export interface WidgetConfig {
	id: string;
	type: 'gauge' | 'graph' | 'simple' | 'meter' | 'multi-resource';
	position: { x: number; y: number };
	size: { w: number; h: number };
	title: string;
	sensorPath: string; // e.g., 'cpu.usage'
	appearance: WidgetAppearance;
	alerts: AlertCondition[];
	minSize: { w: number; h: number };
	maxSize: { w: number; h: number };
	createdAt: number;
	updatedAt: number;
}

export interface WidgetAppearance {
	colors: string[];
	typography: {
		fontSize: number;
		fontWeight: string;
		color: string;
	};
	borders: {
		thickness: number;
		style: string;
		radius: number;
	};
	chartParams: {
		barThickness?: number;
		strokeWidth?: number;
		startAngle?: number;
		endAngle?: number;
		tickCount?: number;
		segments?: number;
		showLabels?: boolean;
		animationDuration?: number;
	};
}

export interface AlertCondition {
	id: string;
	name: string;
	sensorPath: string;
	operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
	threshold: number;
	unit: string;
	enabled: boolean;
	triggered: boolean;
	lastTriggered?: number;
	notificationEnabled: boolean;
	severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Alert {
	id: string;
	condition: string;
	value: number;
	timestamp: number;
	acknowledged: boolean;
	severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface WidgetRegistration {
	id: string;
	name: string;
	description: string;
	component: string; // Component import path
	defaultConfig: Partial<WidgetConfig>;
	defaultSize: { w: number; h: number };
	minSize?: { w: number; h: number };
	maxSize?: { w: number; h: number };
	category: 'performance' | 'thermal' | 'power' | 'storage' | 'custom';
	icon: string;
}

export interface WidgetPreset {
	id: string;
	name: string;
	description: string;
	category: string;
	config: Partial<WidgetConfig>;
	tags: string[];
}

export interface GridPosition {
	x: number;
	y: number;
	w: number;
	h: number;
}

export interface GridConfig {
	cols: number;
	cellSize: number;
	gap: number;
	bounds: {
		width: number;
		height: number;
	};
}

// Widget type constants
export const WIDGET_TYPES = {
	GAUGE: 'gauge' as const,
	GRAPH: 'graph' as const,
	SIMPLE: 'simple' as const,
	METER: 'meter' as const,
	MULTI_RESOURCE: 'multi-resource' as const
};

export const WIDGET_CATEGORIES = {
	PERFORMANCE: 'performance' as const,
	THERMAL: 'thermal' as const,
	POWER: 'power' as const,
	STORAGE: 'storage' as const,
	CUSTOM: 'custom' as const
};

export const ALERT_SEVERITIES = {
	LOW: 'low' as const,
	MEDIUM: 'medium' as const,
	HIGH: 'high' as const,
	CRITICAL: 'critical' as const
};

export type WidgetType = keyof typeof WIDGET_TYPES;
export type WidgetCategory = keyof typeof WIDGET_CATEGORIES;
export type AlertSeverity = keyof typeof ALERT_SEVERITIES;