import type { WidgetConfig, WidgetPreset, WidgetRegistration } from '$types/widget.js';
import { validateWidgetConfig, type WidgetRegistrationInput } from '$schemas/widgetConfig.js';

/**
 * Widget Store - Manages widget registry, presets, and persistence
 * 
 * This store handles:
 * - Widget creation and deletion
 * - Preset management (save/load/delete)
 * - JSON-based persistence (localStorage/IndexedDB)
 * - Widget registry for different types
 */

// Widget store state using Svelte 5 runes
let widgets = $state<Map<string, WidgetConfig>>(new Map());
let presets = $state<Map<string, WidgetPreset>>(new Map());
let registrations = $state<Map<string, WidgetRegistration>>(new Map());

// Storage keys
const STORAGE_KEYS = {
	WIDGETS: 'sensecanvas_widgets',
	PRESETS: 'sensecanvas_presets',
	REGISTRATIONS: 'sensecanvas_registrations'
};

// Initialize store
function initializeStore() {
	loadFromStorage();
	registerDefaultWidgets();
}

// Storage functions
function loadFromStorage() {
	try {
		// Load widgets
		const savedWidgets = localStorage.getItem(STORAGE_KEYS.WIDGETS);
		if (savedWidgets) {
			const parsedWidgets = JSON.parse(savedWidgets);
			widgets = new Map(Object.entries(parsedWidgets));
		}

		// Load presets
		const savedPresets = localStorage.getItem(STORAGE_KEYS.PRESETS);
		if (savedPresets) {
			const parsedPresets = JSON.parse(savedPresets);
			presets = new Map(Object.entries(parsedPresets));
		}

		// Load registrations
		const savedRegistrations = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
		if (savedRegistrations) {
			const parsedRegistrations = JSON.parse(savedRegistrations);
			registrations = new Map(Object.entries(parsedRegistrations));
		}
	} catch (error) {
		console.error('Failed to load widget store from storage:', error);
	}
}

function saveToStorage() {
	try {
		// Save widgets
		const widgetsObject = Object.fromEntries(widgets);
		localStorage.setItem(STORAGE_KEYS.WIDGETS, JSON.stringify(widgetsObject));

		// Save presets
		const presetsObject = Object.fromEntries(presets);
		localStorage.setItem(STORAGE_KEYS.PRESETS, JSON.stringify(presetsObject));

		// Save registrations
		const registrationsObject = Object.fromEntries(registrations);
		localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrationsObject));
	} catch (error) {
		console.error('Failed to save widget store to storage:', error);
	}
}

// Register default widget types
function registerDefaultWidgets() {
	const defaultRegistrations: WidgetRegistrationInput[] = [
		{
			id: 'gauge',
			name: 'Gauge Widget',
			description: 'Circular or arc gauge for displaying single sensor values',
			component: 'GaugeWidget',
			defaultConfig: {
				type: 'gauge',
				appearance: {
					colors: ['#22c55e', '#f59e0b', '#ef4444'],
					typography: {
						fontSize: 16,
						fontWeight: 'normal',
						color: '#1f2937'
					},
					borders: {
						thickness: 1,
						style: 'solid',
						radius: 8
					},
					chartParams: {
						segments: 60,
						startAngle: 0,
						endAngle: 270,
						showLabels: true,
						animationDuration: 750
					}
				}
			},
			defaultSize: { w: 4, h: 4 },
			minSize: { w: 3, h: 3 },
			maxSize: { w: 6, h: 6 },
			category: 'performance',
			icon: 'gauge'
		},
		{
			id: 'graph',
			name: 'Graph Widget',
			description: 'Line, area, or bar chart for time series data',
			component: 'GraphWidget',
			defaultConfig: {
				type: 'graph',
				appearance: {
					colors: ['#3b82f6', '#06b6d4', '#10b981'],
					typography: {
						fontSize: 14,
						fontWeight: 'normal',
						color: '#1f2937'
					},
					borders: {
						thickness: 1,
						style: 'solid',
						radius: 8
					},
					chartParams: {
						strokeWidth: 2,
						showLabels: true,
						tickCount: 5,
						animationDuration: 500
					}
				}
			},
			defaultSize: { w: 6, h: 4 },
			minSize: { w: 4, h: 3 },
			maxSize: { w: 8, h: 6 },
			category: 'performance',
			icon: 'line-chart'
		},
		{
			id: 'simple',
			name: 'Simple Widget',
			description: 'Minimal single-value display',
			component: 'SimpleWidget',
			defaultConfig: {
				type: 'simple',
				appearance: {
					colors: ['#6b7280'],
					typography: {
						fontSize: 24,
						fontWeight: 'bold',
						color: '#1f2937'
					},
					borders: {
						thickness: 1,
						style: 'solid',
						radius: 8
					},
					chartParams: {
						showLabels: true,
						animationDuration: 250
					}
				}
			},
			defaultSize: { w: 3, h: 2 },
			minSize: { w: 2, h: 1 },
			maxSize: { w: 4, h: 3 },
			category: 'performance',
			icon: 'hash'
		},
		{
			id: 'meter',
			name: 'Meter Widget',
			description: 'Horizontal progress bar for usage metrics',
			component: 'MeterWidget',
			defaultConfig: {
				type: 'meter',
				appearance: {
					colors: ['#22c55e', '#f59e0b', '#ef4444'],
					typography: {
						fontSize: 14,
						fontWeight: 'medium',
						color: '#1f2937'
					},
					borders: {
						thickness: 1,
						style: 'solid',
						radius: 8
					},
					chartParams: {
						barThickness: 8,
						showLabels: true,
						animationDuration: 300
					}
				}
			},
			defaultSize: { w: 4, h: 2 },
			minSize: { w: 3, h: 1 },
			maxSize: { w: 6, h: 3 },
			category: 'performance',
			icon: 'bar-chart'
		},
		{
			id: 'multi-resource',
			name: 'Multi-Resource Widget',
			description: 'Aggregate view of multiple sensors',
			component: 'MultiResourceWidget',
			defaultConfig: {
				type: 'multi-resource',
				appearance: {
					colors: ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'],
					typography: {
						fontSize: 12,
						fontWeight: 'normal',
						color: '#1f2937'
					},
					borders: {
						thickness: 1,
						style: 'solid',
						radius: 8
					},
					chartParams: {
						showLabels: true,
						tickCount: 4,
						animationDuration: 400
					}
				}
			},
			defaultSize: { w: 6, h: 4 },
			minSize: { w: 4, h: 3 },
			maxSize: { w: 8, h: 6 },
			category: 'performance',
			icon: 'layout-grid'
		}
	];

	// Register each default widget type
	defaultRegistrations.forEach(registration => {
		if (!registrations.has(registration.id)) {
			registrations.set(registration.id, registration as WidgetRegistration);
		}
	});

	saveToStorage();
}

// Widget management functions
function createWidget(config: Partial<WidgetConfig>): WidgetConfig {
	const id = config.id || `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	const now = Date.now();
	
	const registration = registrations.get(config.type || 'gauge');
	const defaultConfig = registration?.defaultConfig || {};
	
	const widget: WidgetConfig = {
		id,
		type: config.type || 'gauge',
		position: config.position || { x: 0, y: 0 },
		size: config.size || registration?.defaultSize || { w: 4, h: 3 },
		title: config.title || 'New Widget',
		sensorPath: config.sensorPath || 'cpu.usage',
		appearance: {
			colors: config.appearance?.colors || defaultConfig.appearance?.colors || ['#22c55e'],
			typography: {
				fontSize: config.appearance?.typography?.fontSize || defaultConfig.appearance?.typography?.fontSize || 16,
				fontWeight: config.appearance?.typography?.fontWeight || defaultConfig.appearance?.typography?.fontWeight || 'normal',
				color: config.appearance?.typography?.color || defaultConfig.appearance?.typography?.color || '#1f2937'
			},
			borders: {
				thickness: config.appearance?.borders?.thickness || defaultConfig.appearance?.borders?.thickness || 1,
				style: config.appearance?.borders?.style || defaultConfig.appearance?.borders?.style || 'solid',
				radius: config.appearance?.borders?.radius || defaultConfig.appearance?.borders?.radius || 8
			},
			chartParams: {
				...defaultConfig.appearance?.chartParams,
				...config.appearance?.chartParams
			}
		},
		alerts: config.alerts || [],
		minSize: config.minSize || registration?.minSize || { w: 2, h: 2 },
		maxSize: config.maxSize || registration?.maxSize || { w: 8, h: 6 },
		createdAt: config.createdAt || now,
		updatedAt: now
	};

	// Validate the widget configuration
	const validation = validateWidgetConfig(widget);
	if (!validation.success) {
		throw new Error(`Invalid widget configuration: ${validation.error.message}`);
	}

	widgets.set(id, widget);
	saveToStorage();
	return widget;
}

function updateWidget(id: string, updates: Partial<WidgetConfig>): WidgetConfig | null {
	const widget = widgets.get(id);
	if (!widget) return null;

	const updatedWidget: WidgetConfig = {
		...widget,
		...updates,
		id, // Ensure ID cannot be changed
		updatedAt: Date.now()
	};

	// Validate the updated widget configuration
	const validation = validateWidgetConfig(updatedWidget);
	if (!validation.success) {
		throw new Error(`Invalid widget configuration: ${validation.error.message}`);
	}

	widgets.set(id, updatedWidget);
	saveToStorage();
	return updatedWidget;
}

function deleteWidget(id: string): boolean {
	const success = widgets.delete(id);
	if (success) {
		saveToStorage();
	}
	return success;
}

function getWidget(id: string): WidgetConfig | null {
	return widgets.get(id) || null;
}

function getAllWidgets(): WidgetConfig[] {
	return Array.from(widgets.values());
}

// Preset management functions
function savePreset(name: string, description: string, config: Partial<WidgetConfig>, tags: string[] = []): WidgetPreset {
	const id = `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	const preset: WidgetPreset = {
		id,
		name,
		description,
		category: config.type || 'custom',
		config,
		tags
	};

	presets.set(id, preset);
	saveToStorage();
	return preset;
}

function loadPreset(id: string): WidgetPreset | null {
	return presets.get(id) || null;
}

function deletePreset(id: string): boolean {
	const success = presets.delete(id);
	if (success) {
		saveToStorage();
	}
	return success;
}

function getAllPresets(): WidgetPreset[] {
	return Array.from(presets.values());
}

function getPresetsByCategory(category: string): WidgetPreset[] {
	return Array.from(presets.values()).filter(preset => preset.category === category);
}

function getPresetsByTags(tags: string[]): WidgetPreset[] {
	return Array.from(presets.values()).filter(preset => 
		tags.some(tag => preset.tags.includes(tag))
	);
}

// Registration management functions
function registerWidget(registration: WidgetRegistration): void {
	registrations.set(registration.id, registration);
	saveToStorage();
}

function getRegistration(id: string): WidgetRegistration | null {
	return registrations.get(id) || null;
}

function getAllRegistrations(): WidgetRegistration[] {
	return Array.from(registrations.values());
}

function getRegistrationsByCategory(category: string): WidgetRegistration[] {
	return Array.from(registrations.values()).filter(reg => reg.category === category);
}

// Import/Export functions
function exportWidgets(): string {
	return JSON.stringify({
		widgets: Object.fromEntries(widgets),
		presets: Object.fromEntries(presets),
		registrations: Object.fromEntries(registrations),
		exportedAt: Date.now(),
		version: '1.0'
	}, null, 2);
}

function importWidgets(jsonData: string): { success: boolean; error?: string } {
	try {
		const data = JSON.parse(jsonData);
		
		// Validate import data structure
		if (!data.widgets || !data.presets || !data.registrations) {
			return { success: false, error: 'Invalid import data format' };
		}

		// Validate each widget
		for (const [id, widget] of Object.entries(data.widgets)) {
			const validation = validateWidgetConfig(widget);
			if (!validation.success) {
				return { success: false, error: `Invalid widget configuration for ${id}: ${validation.error.message}` };
			}
		}

		// Import data
		widgets = new Map(Object.entries(data.widgets));
		presets = new Map(Object.entries(data.presets));
		registrations = new Map(Object.entries(data.registrations));

		saveToStorage();
		return { success: true };
	} catch (error) {
		return { success: false, error: `Failed to parse import data: ${error instanceof Error ? error.message : 'Unknown error'}` };
	}
}

function exportWidget(id: string): string | null {
	const widget = widgets.get(id);
	if (!widget) return null;

	return JSON.stringify({
		widget,
		exportedAt: Date.now(),
		version: '1.0'
	}, null, 2);
}

function importWidget(jsonData: string): { success: boolean; widget?: WidgetConfig; error?: string } {
	try {
		const data = JSON.parse(jsonData);
		
		if (!data.widget) {
			return { success: false, error: 'Invalid widget data format' };
		}

		// Validate widget
		const validation = validateWidgetConfig(data.widget);
		if (!validation.success) {
			return { success: false, error: `Invalid widget configuration: ${validation.error.message}` };
		}

		// Generate new ID to avoid conflicts
		const newId = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
		const widget: WidgetConfig = {
			...data.widget,
			id: newId,
			createdAt: Date.now(),
			updatedAt: Date.now()
		};

		widgets.set(newId, widget);
		saveToStorage();
		
		return { success: true, widget };
	} catch (error) {
		return { success: false, error: `Failed to parse widget data: ${error instanceof Error ? error.message : 'Unknown error'}` };
	}
}

// Utility functions
function clearAll(): void {
	widgets.clear();
	presets.clear();
	registrations.clear();
	saveToStorage();
	registerDefaultWidgets();
}

function getWidgetCount(): number {
	return widgets.size;
}

function getPresetCount(): number {
	return presets.size;
}

function searchWidgets(query: string): WidgetConfig[] {
	const lowerQuery = query.toLowerCase();
	return Array.from(widgets.values()).filter(widget =>
		widget.title.toLowerCase().includes(lowerQuery) ||
		widget.sensorPath.toLowerCase().includes(lowerQuery) ||
		widget.type.toLowerCase().includes(lowerQuery)
	);
}

function searchPresets(query: string): WidgetPreset[] {
	const lowerQuery = query.toLowerCase();
	return Array.from(presets.values()).filter(preset =>
		preset.name.toLowerCase().includes(lowerQuery) ||
		preset.description.toLowerCase().includes(lowerQuery) ||
		preset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
	);
}

// Initialize the store
initializeStore();

// Export the widget store
export const widgetStore = {
	// State getters
	get widgets() { return Array.from(widgets.values()); },
	get presets() { return Array.from(presets.values()); },
	get registrations() { return Array.from(registrations.values()); },
	
	// Widget management
	createWidget,
	updateWidget,
	deleteWidget,
	getWidget,
	getAllWidgets,
	
	// Preset management
	savePreset,
	loadPreset,
	deletePreset,
	getAllPresets,
	getPresetsByCategory,
	getPresetsByTags,
	
	// Registration management
	registerWidget,
	getRegistration,
	getAllRegistrations,
	getRegistrationsByCategory,
	
	// Import/Export
	exportWidgets,
	importWidgets,
	exportWidget,
	importWidget,
	
	// Utility functions
	clearAll,
	getWidgetCount,
	getPresetCount,
	searchWidgets,
	searchPresets
};