// Layout persistence store (Svelte 5)
import type { WidgetConfig, GridPosition, GridConfig } from '$types/widget.js';
import type { DashboardLayout, DashboardConfig } from '$types/dashboard.js';
import { 
	findAvailablePosition, 
	validatePosition, 
	compactLayout,
	autoArrangeWidgets 
} from '$utils/gridUtils.js';

// Svelte 5 state for layout management
let widgets = $state<Map<string, WidgetConfig>>(new Map());
let layout = $state<DashboardLayout>({});
let gridConfig = $state<GridConfig>({
	cols: 24,
	cellSize: 32,
	gap: 8,
	bounds: {
		width: 1920,
		height: 1080
	}
});

let isDirty = $state<boolean>(false);
let lastSaved = $state<number>(0);
let autoSave = $state<boolean>(true);
let isLoading = $state<boolean>(false);

// Storage key for localStorage
const STORAGE_KEY = 'sensecanvas-layout';
const CONFIG_STORAGE_KEY = 'sensecanvas-config';

export const layoutStore = {
	// Getters for reactive data
	get widgets() { return Array.from(widgets.values()); },
	get layout() { return layout; },
	get gridConfig() { return gridConfig; },
	get isDirty() { return isDirty; },
	get lastSaved() { return lastSaved; },
	get autoSave() { return autoSave; },
	get isLoading() { return isLoading; },
	get widgetCount() { return widgets.size; },
	get gridSize() { return gridConfig; },

	// Initialize store
	init() {
		if (typeof localStorage !== 'undefined') {
			this.loadFromStorage();
		}
	},

	// Widget management
	addWidget(widget: WidgetConfig): boolean {
		try {
			// Find available position if not specified
			if (!widget.position || (widget.position.x === 0 && widget.position.y === 0)) {
				const availablePos = findAvailablePosition(
					widget.size,
					new Map(Array.from(widgets.values()).map(w => [w.id, w.position])),
					gridConfig
				);
				
				if (availablePos) {
					widget.position = availablePos;
				} else {
					console.warn('No available position found for widget');
					return false;
				}
			}

			// Validate position
			const validation = validatePosition(
				widget.position,
				new Map(Array.from(widgets.values()).map(w => [w.id, w.position])),
				gridConfig,
				widget.id
			);

			if (!validation.valid) {
				console.error('Invalid widget position:', validation.errors);
				return false;
			}

			// Add widget
			widgets.set(widget.id, widget);
			layout[widget.id] = widget.position;
			
			this.markDirty();
			return true;
		} catch (error) {
			console.error('Error adding widget:', error);
			return false;
		}
	},

	removeWidget(widgetId: string): boolean {
		try {
			const removed = widgets.delete(widgetId);
			delete layout[widgetId];
			
			if (removed) {
				this.markDirty();
			}
			
			return removed;
		} catch (error) {
			console.error('Error removing widget:', error);
			return false;
		}
	},

	updateWidget(widgetId: string, updates: Partial<WidgetConfig>): boolean {
		try {
			const widget = widgets.get(widgetId);
			if (!widget) return false;

			const updatedWidget = { ...widget, ...updates, updatedAt: Date.now() };
			
			// If position changed, validate it
			if (updates.position) {
				const validation = validatePosition(
					updates.position,
					new Map(Array.from(widgets.values()).map(w => [w.id, w.position])),
					gridConfig,
					widgetId
				);

				if (!validation.valid) {
					console.error('Invalid widget position:', validation.errors);
					return false;
				}

				layout[widgetId] = updates.position;
			}

			widgets.set(widgetId, updatedWidget);
			this.markDirty();
			return true;
		} catch (error) {
			console.error('Error updating widget:', error);
			return false;
		}
	},

	moveWidget(widgetId: string, position: GridPosition): boolean {
		try {
			const widget = widgets.get(widgetId);
			if (!widget) return false;

			// Validate new position
			const validation = validatePosition(
				position,
				new Map(Array.from(widgets.values()).map(w => [w.id, w.position])),
				gridConfig,
				widgetId
			);

			if (!validation.valid) {
				console.error('Invalid move position:', validation.errors);
				return false;
			}

			// Update widget position
			widget.position = position;
			layout[widgetId] = position;
			
			widgets.set(widgetId, { ...widget, updatedAt: Date.now() });
			this.markDirty();
			return true;
		} catch (error) {
			console.error('Error moving widget:', error);
			return false;
		}
	},

	resizeWidget(widgetId: string, size: { w: number; h: number }): boolean {
		try {
			const widget = widgets.get(widgetId);
			if (!widget) return false;

			const newPosition = { ...widget.position, ...size };

			// Check constraints
			if (size.w < widget.minSize.w || size.h < widget.minSize.h) {
				console.error('Size below minimum constraints');
				return false;
			}

			if (size.w > widget.maxSize.w || size.h > widget.maxSize.h) {
				console.error('Size above maximum constraints');
				return false;
			}

			// Validate new position
			const validation = validatePosition(
				newPosition,
				new Map(Array.from(widgets.values()).map(w => [w.id, w.position])),
				gridConfig,
				widgetId
			);

			if (!validation.valid) {
				console.error('Invalid resize position:', validation.errors);
				return false;
			}

			// Update widget size
			widget.position = newPosition;
			widget.size = size;
			layout[widgetId] = newPosition;
			
			widgets.set(widgetId, { ...widget, updatedAt: Date.now() });
			this.markDirty();
			return true;
		} catch (error) {
			console.error('Error resizing widget:', error);
			return false;
		}
	},

	// Layout operations
	compactLayout(): void {
		try {
			const widgetPositions = new Map(
				Array.from(widgets.values()).map(w => [w.id, w.position])
			);
			
			const compacted = compactLayout(widgetPositions, gridConfig);
			
			// Update all widget positions
			for (const [widgetId, position] of compacted) {
				const widget = widgets.get(widgetId);
				if (widget) {
					widget.position = position;
					layout[widgetId] = position;
					widgets.set(widgetId, { ...widget, updatedAt: Date.now() });
				}
			}
			
			this.markDirty();
		} catch (error) {
			console.error('Error compacting layout:', error);
		}
	},

	autoArrangeWidgets(): void {
		try {
			const widgetPositions = new Map(
				Array.from(widgets.values()).map(w => [w.id, w.position])
			);
			
			const arranged = autoArrangeWidgets(widgetPositions, gridConfig);
			
			// Update all widget positions
			for (const [widgetId, position] of arranged) {
				const widget = widgets.get(widgetId);
				if (widget) {
					widget.position = position;
					layout[widgetId] = position;
					widgets.set(widgetId, { ...widget, updatedAt: Date.now() });
				}
			}
			
			this.markDirty();
		} catch (error) {
			console.error('Error auto-arranging widgets:', error);
		}
	},

	clearLayout(): void {
		widgets.clear();
		layout = {};
		this.markDirty();
	},

	// Grid configuration
	updateGridConfig(newConfig: Partial<GridConfig>): void {
		gridConfig = { ...gridConfig, ...newConfig };
		this.markDirty();
		this.saveGridConfig();
	},

	// Persistence
	markDirty(): void {
		isDirty = true;
		if (autoSave) {
			this.debouncedSave();
		}
	},

	debouncedSave: (() => {
		let timeout: number | null = null;
		return () => {
			if (timeout) clearTimeout(timeout);
			timeout = window.setTimeout(() => {
				this.saveToStorage();
			}, 1000);
		};
	})(),

	saveToStorage(): void {
		if (typeof localStorage === 'undefined') return;

		try {
			const dashboardConfig: DashboardConfig = {
				id: 'default',
				name: 'My Dashboard',
				description: 'Default SenseCanvas dashboard',
				grid: gridConfig,
				widgets: Array.from(widgets.values()),
				theme: 'skeleton',
				createdAt: Date.now(),
				updatedAt: Date.now(),
				version: '1.0.0'
			};

			localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboardConfig));
			isDirty = false;
			lastSaved = Date.now();
			
			console.log('Layout saved to localStorage');
		} catch (error) {
			console.error('Error saving layout:', error);
		}
	},

	loadFromStorage(): void {
		if (typeof localStorage === 'undefined') return;

		try {
			isLoading = true;
			
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				const dashboardConfig: DashboardConfig = JSON.parse(stored);
				
				// Load widgets
				widgets.clear();
				layout = {};
				
				for (const widget of dashboardConfig.widgets) {
					widgets.set(widget.id, widget);
					layout[widget.id] = widget.position;
				}
				
				// Load grid config
				if (dashboardConfig.grid) {
					gridConfig = dashboardConfig.grid;
				}
				
				isDirty = false;
				lastSaved = dashboardConfig.updatedAt || Date.now();
				
				console.log(`Loaded ${widgets.size} widgets from localStorage`);
			}
		} catch (error) {
			console.error('Error loading layout:', error);
		} finally {
			isLoading = false;
		}
	},

	saveGridConfig(): void {
		if (typeof localStorage === 'undefined') return;

		try {
			localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(gridConfig));
		} catch (error) {
			console.error('Error saving grid config:', error);
		}
	},

	// Import/Export
	exportLayout(): DashboardConfig {
		return {
			id: 'exported',
			name: 'Exported Dashboard',
			description: 'Exported from SenseCanvas',
			grid: gridConfig,
			widgets: Array.from(widgets.values()),
			theme: 'skeleton',
			createdAt: Date.now(),
			updatedAt: Date.now(),
			version: '1.0.0'
		};
	},

	importLayout(dashboardConfig: DashboardConfig): boolean {
		try {
			// Clear current layout
			widgets.clear();
			layout = {};
			
			// Import widgets
			for (const widget of dashboardConfig.widgets) {
				widgets.set(widget.id, widget);
				layout[widget.id] = widget.position;
			}
			
			// Import grid config
			if (dashboardConfig.grid) {
				gridConfig = dashboardConfig.grid;
			}
			
			this.markDirty();
			console.log(`Imported ${widgets.size} widgets`);
			return true;
		} catch (error) {
			console.error('Error importing layout:', error);
			return false;
		}
	},

	// Utility methods
	getWidget(widgetId: string): WidgetConfig | undefined {
		return widgets.get(widgetId);
	},

	hasWidget(widgetId: string): boolean {
		return widgets.has(widgetId);
	},

	getWidgetsByType(type: string): WidgetConfig[] {
		return Array.from(widgets.values()).filter(w => w.type === type);
	},

	getLayoutStats() {
		const widgetPositions = new Map(
			Array.from(widgets.values()).map(w => [w.id, w.position])
		);
		
		return {
			widgetCount: widgets.size,
			lastSaved,
			isDirty,
			autoSave,
			gridConfig: { ...gridConfig }
		};
	},

	// Settings
	setAutoSave(enabled: boolean): void {
		autoSave = enabled;
		if (enabled && isDirty) {
			this.saveToStorage();
		}
	},

	forceSave(): void {
		this.saveToStorage();
	},

	// Additional methods for Dashboard component
	loadLayout(): void {
		this.loadFromStorage();
	},

	saveLayout(): void {
		this.saveToStorage();
	},

	resetLayout(): void {
		this.clearLayout();
	},

	initializeDefaultLayout(): void {
		// Create default widgets if none exist
		if (widgets.size === 0) {
			const defaultWidgets = [
				{
					id: 'cpu-usage',
					type: 'gauge',
					title: 'CPU Usage',
					sensorPath: 'cpu.usage',
					position: { x: 0, y: 0 },
					size: { w: 200, h: 200 },
					appearance: {
						colors: ['#22c55e', '#f59e0b', '#ef4444'],
						typography: { fontSize: 16, fontWeight: '500', color: '#374151' },
						borders: { thickness: 1, style: 'solid', radius: 8 },
						chartParams: { segments: 60, startAngle: 0, endAngle: 270 }
					},
					alerts: [],
					minSize: { w: 150, h: 150 },
					maxSize: { w: 400, h: 400 }
				},
				{
					id: 'cpu-temp',
					type: 'gauge',
					title: 'CPU Temperature',
					sensorPath: 'cpu.temperature',
					position: { x: 220, y: 0 },
					size: { w: 200, h: 200 },
					appearance: {
						colors: ['#22c55e', '#f59e0b', '#ef4444'],
						typography: { fontSize: 16, fontWeight: '500', color: '#374151' },
						borders: { thickness: 1, style: 'solid', radius: 8 },
						chartParams: { segments: 60, startAngle: 0, endAngle: 270 }
					},
					alerts: [],
					minSize: { w: 150, h: 150 },
					maxSize: { w: 400, h: 400 }
				},
				{
					id: 'memory-usage',
					type: 'meter',
					title: 'Memory Usage',
					sensorPath: 'memory.usage',
					position: { x: 0, y: 220 },
					size: { w: 300, h: 100 },
					appearance: {
						colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
						typography: { fontSize: 14, fontWeight: '500', color: '#374151' },
						borders: { thickness: 1, style: 'solid', radius: 8 },
						chartParams: { barThickness: 20 }
					},
					alerts: [],
					minSize: { w: 200, h: 80 },
					maxSize: { w: 500, h: 150 }
				}
			];

			for (const widget of defaultWidgets) {
				widgets.set(widget.id, widget as WidgetConfig);
				layout[widget.id] = widget.position;
			}

			this.markDirty();
		}
	},

	loadPreset(presetId: string): void {
		// Load predefined layouts
		const presets: Record<string, WidgetConfig[]> = {
			default: [
				{
					id: 'cpu-usage',
					type: 'gauge',
					title: 'CPU Usage',
					sensorPath: 'cpu.usage',
					position: { x: 0, y: 0 },
					size: { w: 200, h: 200 },
					appearance: {
						colors: ['#22c55e', '#f59e0b', '#ef4444'],
						typography: { fontSize: 16, fontWeight: '500', color: '#374151' },
						borders: { thickness: 1, style: 'solid', radius: 8 },
						chartParams: { segments: 60, startAngle: 0, endAngle: 270 }
					},
					alerts: [],
					minSize: { w: 150, h: 150 },
					maxSize: { w: 400, h: 400 }
				}
			],
			performance: [
				{
					id: 'cpu-perf',
					type: 'multi-resource',
					title: 'System Performance',
					sensorPath: 'cpu.usage',
					position: { x: 0, y: 0 },
					size: { w: 400, h: 300 },
					appearance: {
						colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
						typography: { fontSize: 14, fontWeight: '500', color: '#374151' },
						borders: { thickness: 1, style: 'solid', radius: 8 },
						chartParams: {}
					},
					alerts: [],
					minSize: { w: 300, h: 200 },
					maxSize: { w: 600, h: 500 }
				}
			],
			thermal: [
				{
					id: 'thermal-overview',
					type: 'graph',
					title: 'Thermal Overview',
					sensorPath: 'cpu.temperature',
					position: { x: 0, y: 0 },
					size: { w: 500, h: 300 },
					appearance: {
						colors: ['#22c55e', '#f59e0b', '#ef4444'],
						typography: { fontSize: 14, fontWeight: '500', color: '#374151' },
						borders: { thickness: 1, style: 'solid', radius: 8 },
						chartParams: { strokeWidth: 2 }
					},
					alerts: [],
					minSize: { w: 300, h: 200 },
					maxSize: { w: 800, h: 500 }
				}
			],
			compact: [
				{
					id: 'compact-cpu',
					type: 'simple',
					title: 'CPU',
					sensorPath: 'cpu.usage',
					position: { x: 0, y: 0 },
					size: { w: 100, h: 60 },
					appearance: {
						colors: ['#22c55e', '#f59e0b', '#ef4444'],
						typography: { fontSize: 12, fontWeight: '500', color: '#374151' },
						borders: { thickness: 1, style: 'solid', radius: 4 },
						chartParams: {}
					},
					alerts: [],
					minSize: { w: 80, h: 40 },
					maxSize: { w: 150, h: 100 }
				}
			]
		};

		const preset = presets[presetId];
		if (preset) {
			widgets.clear();
			layout = {};

			for (const widget of preset) {
				widgets.set(widget.id, widget);
				layout[widget.id] = widget.position;
			}

			this.markDirty();
		}
	}
};