import type { WidgetConfig, GridConfig } from './widget.js';

// Dashboard configuration types
export interface DashboardConfig {
	id: string;
	name: string;
	description: string;
	grid: GridConfig;
	widgets: WidgetConfig[];
	theme: string;
	createdAt: number;
	updatedAt: number;
	version: string;
}

export interface DashboardLayout {
	[widgetId: string]: {
		x: number;
		y: number;
		w: number;
		h: number;
	};
}

export interface DashboardState {
	isEditing: boolean;
	selectedWidget: string | null;
	draggedWidget: string | null;
	showGrid: boolean;
	snapToGrid: boolean;
	zoom: number;
	viewMode: 'desktop' | 'tablet' | 'mobile';
}

export interface DashboardMetrics {
	totalWidgets: number;
	activeAlerts: number;
	connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
	lastUpdate: number;
	performance: {
		fps: number;
		memory: number;
		renderTime: number;
	};
}

export interface ImportExportData {
	version: string;
	type: 'dashboard' | 'layout' | 'widget';
	timestamp: number;
	data: DashboardConfig | DashboardLayout | WidgetConfig;
	metadata: {
		source: string;
		author?: string;
		description?: string;
	};
}

export interface LayoutTemplate {
	id: string;
	name: string;
	description: string;
	category: 'performance' | 'gaming' | 'server' | 'minimal' | 'custom';
	thumbnail?: string;
	widgets: WidgetConfig[];
	grid: GridConfig;
	popularity: number;
	tags: string[];
}

// Dashboard preferences
export interface DashboardPreferences {
	autoSave: boolean;
	refreshInterval: number;
	showTooltips: boolean;
	enableAnimations: boolean;
	compactMode: boolean;
	alertSettings: {
		enableDesktopNotifications: boolean;
		enableSounds: boolean;
		soundVolume: number;
		alertHistory: number; // days to keep
	};
	performance: {
		maxWidgets: number;
		reducedMotion: boolean;
		lowPowerMode: boolean;
	};
}

// Dashboard actions
export interface DashboardAction {
	type: 'ADD_WIDGET' | 'REMOVE_WIDGET' | 'UPDATE_WIDGET' | 'MOVE_WIDGET' | 'RESIZE_WIDGET' | 'CLEAR_ALL';
	payload: any;
	timestamp: number;
	userId?: string;
}

export interface DashboardHistory {
	actions: DashboardAction[];
	currentIndex: number;
	maxHistory: number;
}

// Constants
export const DEFAULT_GRID_CONFIG: GridConfig = {
	cols: 24,
	cellSize: 32,
	gap: 8,
	bounds: {
		width: 1920,
		height: 1080
	}
};

export const DEFAULT_DASHBOARD_PREFERENCES: DashboardPreferences = {
	autoSave: true,
	refreshInterval: 1000,
	showTooltips: true,
	enableAnimations: true,
	compactMode: false,
	alertSettings: {
		enableDesktopNotifications: true,
		enableSounds: false,
		soundVolume: 0.5,
		alertHistory: 7
	},
	performance: {
		maxWidgets: 50,
		reducedMotion: false,
		lowPowerMode: false
	}
};

export const DASHBOARD_CATEGORIES = {
	PERFORMANCE: 'performance' as const,
	GAMING: 'gaming' as const,
	SERVER: 'server' as const,
	MINIMAL: 'minimal' as const,
	CUSTOM: 'custom' as const
};

export type DashboardCategory = keyof typeof DASHBOARD_CATEGORIES;