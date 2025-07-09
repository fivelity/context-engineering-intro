import type { WidgetPreset, WidgetConfig } from '$types/widget.js';

/**
 * Widget Presets - Default widget configurations for common sensor types
 * 
 * This module provides:
 * - Default widget configurations for common sensors
 * - Preset templates organized by category
 * - Import/export utilities for sharing presets
 */

// Performance monitoring presets
const performancePresets: WidgetPreset[] = [
	{
		id: 'cpu-usage-gauge',
		name: 'CPU Usage Gauge',
		description: 'Arc gauge showing CPU utilization percentage',
		category: 'performance',
		config: {
			type: 'gauge',
			title: 'CPU Usage',
			sensorPath: 'cpu.usage',
			appearance: {
				colors: ['#22c55e', '#f59e0b', '#ef4444'],
				typography: {
					fontSize: 18,
					fontWeight: 'semibold',
					color: '#1f2937'
				},
				borders: {
					thickness: 2,
					style: 'solid',
					radius: 12
				},
				chartParams: {
					segments: 60,
					startAngle: 0,
					endAngle: 270,
					showLabels: true,
					animationDuration: 750
				}
			},
			alerts: [
				{
					id: 'cpu-high',
					name: 'High CPU Usage',
					sensorPath: 'cpu.usage',
					operator: 'gt',
					threshold: 80,
					unit: '%',
					enabled: true,
					triggered: false,
					notificationEnabled: true,
					severity: 'high'
				}
			],
			size: { w: 4, h: 4 },
			minSize: { w: 3, h: 3 },
			maxSize: { w: 6, h: 6 }
		},
		tags: ['cpu', 'performance', 'gauge', 'usage']
	},
	{
		id: 'memory-usage-meter',
		name: 'Memory Usage Meter',
		description: 'Horizontal bar showing RAM utilization',
		category: 'performance',
		config: {
			type: 'meter',
			title: 'Memory Usage',
			sensorPath: 'memory.usage',
			appearance: {
				colors: ['#06b6d4', '#f59e0b', '#ef4444'],
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
					barThickness: 12,
					showLabels: true,
					animationDuration: 300
				}
			},
			alerts: [
				{
					id: 'memory-high',
					name: 'High Memory Usage',
					sensorPath: 'memory.usage',
					operator: 'gt',
					threshold: 90,
					unit: '%',
					enabled: true,
					triggered: false,
					notificationEnabled: true,
					severity: 'high'
				}
			],
			size: { w: 4, h: 2 },
			minSize: { w: 3, h: 1 },
			maxSize: { w: 6, h: 3 }
		},
		tags: ['memory', 'ram', 'performance', 'meter', 'usage']
	},
	{
		id: 'gpu-usage-simple',
		name: 'GPU Usage Simple',
		description: 'Minimal GPU utilization display',
		category: 'performance',
		config: {
			type: 'simple',
			title: 'GPU Usage',
			sensorPath: 'gpu.usage',
			appearance: {
				colors: ['#8b5cf6'],
				typography: {
					fontSize: 28,
					fontWeight: 'bold',
					color: '#8b5cf6'
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
			},
			size: { w: 3, h: 2 },
			minSize: { w: 2, h: 1 },
			maxSize: { w: 4, h: 3 }
		},
		tags: ['gpu', 'performance', 'simple', 'usage']
	},
	{
		id: 'cpu-frequency-graph',
		name: 'CPU Frequency Graph',
		description: 'Time series graph of CPU clock speed',
		category: 'performance',
		config: {
			type: 'graph',
			title: 'CPU Frequency',
			sensorPath: 'cpu.frequency',
			appearance: {
				colors: ['#3b82f6', '#06b6d4'],
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
			},
			size: { w: 6, h: 4 },
			minSize: { w: 4, h: 3 },
			maxSize: { w: 8, h: 6 }
		},
		tags: ['cpu', 'frequency', 'clock', 'performance', 'graph']
	}
];

// Thermal monitoring presets
const thermalPresets: WidgetPreset[] = [
	{
		id: 'cpu-temp-gauge',
		name: 'CPU Temperature Gauge',
		description: 'Gauge showing CPU temperature with thermal zones',
		category: 'thermal',
		config: {
			type: 'gauge',
			title: 'CPU Temperature',
			sensorPath: 'cpu.temperature',
			appearance: {
				colors: ['#10b981', '#f59e0b', '#ef4444'],
				typography: {
					fontSize: 16,
					fontWeight: 'semibold',
					color: '#1f2937'
				},
				borders: {
					thickness: 2,
					style: 'solid',
					radius: 12
				},
				chartParams: {
					segments: 50,
					startAngle: 45,
					endAngle: 315,
					showLabels: true,
					animationDuration: 1000
				}
			},
			alerts: [
				{
					id: 'cpu-temp-high',
					name: 'High CPU Temperature',
					sensorPath: 'cpu.temperature',
					operator: 'gt',
					threshold: 80,
					unit: '°C',
					enabled: true,
					triggered: false,
					notificationEnabled: true,
					severity: 'high'
				},
				{
					id: 'cpu-temp-critical',
					name: 'Critical CPU Temperature',
					sensorPath: 'cpu.temperature',
					operator: 'gt',
					threshold: 95,
					unit: '°C',
					enabled: true,
					triggered: false,
					notificationEnabled: true,
					severity: 'critical'
				}
			],
			size: { w: 4, h: 4 },
			minSize: { w: 3, h: 3 },
			maxSize: { w: 6, h: 6 }
		},
		tags: ['cpu', 'temperature', 'thermal', 'gauge', 'cooling']
	},
	{
		id: 'gpu-temp-simple',
		name: 'GPU Temperature Simple',
		description: 'Simple GPU temperature display',
		category: 'thermal',
		config: {
			type: 'simple',
			title: 'GPU Temperature',
			sensorPath: 'gpu.temperature',
			appearance: {
				colors: ['#ef4444'],
				typography: {
					fontSize: 24,
					fontWeight: 'bold',
					color: '#ef4444'
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
			},
			alerts: [
				{
					id: 'gpu-temp-high',
					name: 'High GPU Temperature',
					sensorPath: 'gpu.temperature',
					operator: 'gt',
					threshold: 85,
					unit: '°C',
					enabled: true,
					triggered: false,
					notificationEnabled: true,
					severity: 'high'
				}
			],
			size: { w: 3, h: 2 },
			minSize: { w: 2, h: 1 },
			maxSize: { w: 4, h: 3 }
		},
		tags: ['gpu', 'temperature', 'thermal', 'simple', 'cooling']
	},
	{
		id: 'thermal-overview',
		name: 'Thermal Overview',
		description: 'Multi-resource view of all temperature sensors',
		category: 'thermal',
		config: {
			type: 'multi-resource',
			title: 'System Temperatures',
			sensorPath: 'cpu.temperature,gpu.temperature,storage.temperature,motherboard.temperature',
			appearance: {
				colors: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
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
			},
			size: { w: 6, h: 4 },
			minSize: { w: 4, h: 3 },
			maxSize: { w: 8, h: 6 }
		},
		tags: ['thermal', 'temperature', 'overview', 'multi-resource', 'system']
	}
];

// Storage monitoring presets
const storagePresets: WidgetPreset[] = [
	{
		id: 'storage-usage-meter',
		name: 'Storage Usage Meter',
		description: 'Horizontal bar showing disk space utilization',
		category: 'storage',
		config: {
			type: 'meter',
			title: 'Storage Usage',
			sensorPath: 'storage.usage',
			appearance: {
				colors: ['#10b981', '#f59e0b', '#ef4444'],
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
					barThickness: 10,
					showLabels: true,
					animationDuration: 300
				}
			},
			alerts: [
				{
					id: 'storage-full',
					name: 'Storage Nearly Full',
					sensorPath: 'storage.usage',
					operator: 'gt',
					threshold: 85,
					unit: '%',
					enabled: true,
					triggered: false,
					notificationEnabled: true,
					severity: 'medium'
				}
			],
			size: { w: 4, h: 2 },
			minSize: { w: 3, h: 1 },
			maxSize: { w: 6, h: 3 }
		},
		tags: ['storage', 'disk', 'usage', 'meter', 'space']
	},
	{
		id: 'storage-temp-simple',
		name: 'Storage Temperature',
		description: 'Simple disk temperature display',
		category: 'storage',
		config: {
			type: 'simple',
			title: 'SSD Temperature',
			sensorPath: 'storage.temperature',
			appearance: {
				colors: ['#06b6d4'],
				typography: {
					fontSize: 20,
					fontWeight: 'semibold',
					color: '#06b6d4'
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
			},
			size: { w: 3, h: 2 },
			minSize: { w: 2, h: 1 },
			maxSize: { w: 4, h: 3 }
		},
		tags: ['storage', 'temperature', 'ssd', 'simple', 'thermal']
	}
];

// Power monitoring presets
const powerPresets: WidgetPreset[] = [
	{
		id: 'cpu-voltage-simple',
		name: 'CPU Voltage',
		description: 'Simple CPU voltage display',
		category: 'power',
		config: {
			type: 'simple',
			title: 'CPU Voltage',
			sensorPath: 'cpu.voltage',
			appearance: {
				colors: ['#8b5cf6'],
				typography: {
					fontSize: 18,
					fontWeight: 'semibold',
					color: '#8b5cf6'
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
			},
			size: { w: 3, h: 2 },
			minSize: { w: 2, h: 1 },
			maxSize: { w: 4, h: 3 }
		},
		tags: ['cpu', 'voltage', 'power', 'simple', 'electrical']
	},
	{
		id: 'gpu-fan-speed',
		name: 'GPU Fan Speed',
		description: 'GPU cooling fan RPM display',
		category: 'power',
		config: {
			type: 'gauge',
			title: 'GPU Fan Speed',
			sensorPath: 'gpu.fanSpeed',
			appearance: {
				colors: ['#06b6d4', '#3b82f6'],
				typography: {
					fontSize: 16,
					fontWeight: 'medium',
					color: '#1f2937'
				},
				borders: {
					thickness: 1,
					style: 'solid',
					radius: 8
				},
				chartParams: {
					segments: 40,
					startAngle: 0,
					endAngle: 360,
					showLabels: true,
					animationDuration: 600
				}
			},
			size: { w: 4, h: 4 },
			minSize: { w: 3, h: 3 },
			maxSize: { w: 6, h: 6 }
		},
		tags: ['gpu', 'fan', 'cooling', 'rpm', 'gauge']
	}
];

// System overview presets
const systemPresets: WidgetPreset[] = [
	{
		id: 'system-overview',
		name: 'System Overview',
		description: 'Multi-resource dashboard showing key system metrics',
		category: 'custom',
		config: {
			type: 'multi-resource',
			title: 'System Overview',
			sensorPath: 'cpu.usage,memory.usage,gpu.usage,storage.usage',
			appearance: {
				colors: ['#22c55e', '#06b6d4', '#8b5cf6', '#f59e0b'],
				typography: {
					fontSize: 14,
					fontWeight: 'medium',
					color: '#1f2937'
				},
				borders: {
					thickness: 1,
					style: 'solid',
					radius: 12
				},
				chartParams: {
					showLabels: true,
					tickCount: 5,
					animationDuration: 500
				}
			},
			size: { w: 8, h: 6 },
			minSize: { w: 6, h: 4 },
			maxSize: { w: 8, h: 8 }
		},
		tags: ['system', 'overview', 'dashboard', 'multi-resource', 'comprehensive']
	},
	{
		id: 'performance-compact',
		name: 'Performance Compact',
		description: 'Compact view of CPU and GPU performance',
		category: 'custom',
		config: {
			type: 'multi-resource',
			title: 'Performance',
			sensorPath: 'cpu.usage,gpu.usage',
			appearance: {
				colors: ['#22c55e', '#8b5cf6'],
				typography: {
					fontSize: 16,
					fontWeight: 'semibold',
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
			},
			size: { w: 4, h: 3 },
			minSize: { w: 3, h: 2 },
			maxSize: { w: 6, h: 4 }
		},
		tags: ['performance', 'compact', 'cpu', 'gpu', 'dual']
	}
];

// Combine all presets
export const defaultPresets: WidgetPreset[] = [
	...performancePresets,
	...thermalPresets,
	...storagePresets,
	...powerPresets,
	...systemPresets
];

// Preset categories
export const presetCategories = [
	{ id: 'performance', name: 'Performance', icon: 'activity' },
	{ id: 'thermal', name: 'Thermal', icon: 'thermometer' },
	{ id: 'storage', name: 'Storage', icon: 'hard-drive' },
	{ id: 'power', name: 'Power', icon: 'zap' },
	{ id: 'custom', name: 'Custom', icon: 'settings' }
];

// Utility functions
export function getPresetsByCategory(category: string): WidgetPreset[] {
	return defaultPresets.filter(preset => preset.category === category);
}

export function getPresetById(id: string): WidgetPreset | undefined {
	return defaultPresets.find(preset => preset.id === id);
}

export function searchPresets(query: string): WidgetPreset[] {
	const lowerQuery = query.toLowerCase();
	return defaultPresets.filter(preset =>
		preset.name.toLowerCase().includes(lowerQuery) ||
		preset.description.toLowerCase().includes(lowerQuery) ||
		preset.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
	);
}

export function getPresetsByTags(tags: string[]): WidgetPreset[] {
	return defaultPresets.filter(preset =>
		tags.some(tag => preset.tags.includes(tag.toLowerCase()))
	);
}

// Export individual preset for sharing
export function exportPreset(preset: WidgetPreset): string {
	return JSON.stringify({
		preset,
		exportedAt: Date.now(),
		version: '1.0'
	}, null, 2);
}

// Import individual preset
export function importPreset(jsonData: string): { success: boolean; preset?: WidgetPreset; error?: string } {
	try {
		const data = JSON.parse(jsonData);
		
		if (!data.preset) {
			return { success: false, error: 'Invalid preset data format' };
		}

		// Validate preset structure
		const preset = data.preset as WidgetPreset;
		if (!preset.id || !preset.name || !preset.config) {
			return { success: false, error: 'Invalid preset format - missing required fields' };
		}

		// Generate new ID to avoid conflicts
		const newPreset: WidgetPreset = {
			...preset,
			id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
		};

		return { success: true, preset: newPreset };
	} catch (error) {
		return { success: false, error: `Failed to parse preset data: ${error instanceof Error ? error.message : 'Unknown error'}` };
	}
}

// Create preset from widget configuration
export function createPresetFromWidget(widget: WidgetConfig, name: string, description: string): WidgetPreset {
	return {
		id: `preset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		name,
		description,
		category: widget.type,
		config: {
			type: widget.type,
			title: widget.title,
			sensorPath: widget.sensorPath,
			appearance: widget.appearance,
			alerts: widget.alerts,
			size: widget.size,
			minSize: widget.minSize,
			maxSize: widget.maxSize
		},
		tags: [widget.type, 'custom']
	};
}

// Apply preset to widget
export function applyPresetToWidget(preset: WidgetPreset, widget: WidgetConfig): WidgetConfig {
	return {
		...widget,
		...preset.config,
		id: widget.id, // Keep original ID
		position: widget.position, // Keep original position
		createdAt: widget.createdAt, // Keep original creation time
		updatedAt: Date.now()
	};
}