// AI Layout Suggestions utility
import type { AILayoutRequest, LayoutSuggestion } from '$lib/types/ai.js';
import type { WidgetConfig } from '$lib/types/widget.js';

// Mock AI layout suggestions (would be replaced with real Genkit integration)
export async function generateLayoutSuggestions(
	request: AILayoutRequest
): Promise<LayoutSuggestion[]> {
	// Simulate AI processing delay
	await new Promise(resolve => setTimeout(resolve, 1000));
	
	const suggestions: LayoutSuggestion[] = [];
	
	// Performance-focused layout
	suggestions.push({
		id: 'performance-focus',
		name: 'Performance Focus',
		description: 'Layout optimized for monitoring system performance with CPU, GPU, and memory widgets prominently displayed.',
		reasoning: 'This layout prioritizes performance metrics by placing CPU and GPU widgets in the top row for immediate visibility, with memory and storage metrics below for comprehensive system monitoring.',
		confidence: 0.85,
		widgets: arrangePerformanceLayout(request.currentWidgets, request.dashboardSize)
	});
	
	// Thermal monitoring layout
	suggestions.push({
		id: 'thermal-monitoring',
		name: 'Thermal Monitoring',
		description: 'Layout designed for temperature monitoring with thermal widgets grouped together.',
		reasoning: 'Groups all temperature-related sensors together for easier thermal monitoring and comparison. Larger widgets for critical thermal sensors and smaller ones for secondary measurements.',
		confidence: 0.78,
		widgets: arrangeThermalLayout(request.currentWidgets, request.dashboardSize)
	});
	
	// Compact overview layout
	suggestions.push({
		id: 'compact-overview',
		name: 'Compact Overview',
		description: 'Space-efficient layout suitable for smaller screens or as a dashboard overview.',
		reasoning: 'Maximizes information density while maintaining readability. Perfect for dashboard overviews or when screen space is limited.',
		confidence: 0.72,
		widgets: arrangeCompactLayout(request.currentWidgets, request.dashboardSize)
	});
	
	// Density-based layout
	if (request.preferences.density === 'spacious') {
		suggestions.push({
			id: 'spacious-layout',
			name: 'Spacious Layout',
			description: 'Layout with generous spacing for comfortable viewing.',
			reasoning: 'Provides ample whitespace between widgets for reduced visual clutter and easier focus on individual metrics.',
			confidence: 0.80,
			widgets: arrangeSpaciousLayout(request.currentWidgets, request.dashboardSize)
		});
	} else if (request.preferences.density === 'compact') {
		suggestions.push({
			id: 'ultra-compact',
			name: 'Ultra Compact',
			description: 'Maximum information density for power users.',
			reasoning: 'Fits the maximum number of widgets on screen while maintaining usability. Ideal for power users who need to monitor many metrics simultaneously.',
			confidence: 0.75,
			widgets: arrangeUltraCompactLayout(request.currentWidgets, request.dashboardSize)
		});
	}
	
	return suggestions;
}

// Layout arrangement functions
function arrangePerformanceLayout(widgets: WidgetConfig[], dashboardSize: { width: number; height: number }): WidgetConfig[] {
	const arranged = [...widgets];
	const cols = Math.floor(dashboardSize.width / 250);
	
	// Sort by priority: CPU, GPU, Memory, Storage, Others
	const priorityOrder = ['cpu', 'gpu', 'memory', 'storage'];
	arranged.sort((a, b) => {
		const aType = a.sensorPath.split('.')[0];
		const bType = b.sensorPath.split('.')[0];
		const aPriority = priorityOrder.indexOf(aType);
		const bPriority = priorityOrder.indexOf(bType);
		
		if (aPriority === -1 && bPriority === -1) return 0;
		if (aPriority === -1) return 1;
		if (bPriority === -1) return -1;
		return aPriority - bPriority;
	});
	
	// Arrange in grid with performance metrics first
	return arranged.map((widget, index) => ({
		...widget,
		position: {
			x: (index % cols) * 250,
			y: Math.floor(index / cols) * 200
		},
		size: {
			w: 200,
			h: 180
		}
	}));
}

function arrangeThermalLayout(widgets: WidgetConfig[], dashboardSize: { width: number; height: number }): WidgetConfig[] {
	const arranged = [...widgets];
	
	// Group temperature sensors together
	const thermalWidgets = arranged.filter(w => w.sensorPath.includes('temperature'));
	const otherWidgets = arranged.filter(w => !w.sensorPath.includes('temperature'));
	
	let currentY = 0;
	let currentX = 0;
	const results: WidgetConfig[] = [];
	
	// Place thermal widgets in top section
	thermalWidgets.forEach((widget, index) => {
		results.push({
			...widget,
			position: { x: currentX, y: currentY },
			size: { w: 220, h: 200 }
		});
		
		currentX += 240;
		if (currentX + 220 > dashboardSize.width) {
			currentX = 0;
			currentY += 220;
		}
	});
	
	// Place other widgets below
	if (thermalWidgets.length > 0) {
		currentY += 240;
		currentX = 0;
	}
	
	otherWidgets.forEach((widget, index) => {
		results.push({
			...widget,
			position: { x: currentX, y: currentY },
			size: { w: 180, h: 160 }
		});
		
		currentX += 200;
		if (currentX + 180 > dashboardSize.width) {
			currentX = 0;
			currentY += 180;
		}
	});
	
	return results;
}

function arrangeCompactLayout(widgets: WidgetConfig[], dashboardSize: { width: number; height: number }): WidgetConfig[] {
	const arranged = [...widgets];
	const cols = Math.floor(dashboardSize.width / 160);
	
	return arranged.map((widget, index) => ({
		...widget,
		position: {
			x: (index % cols) * 160,
			y: Math.floor(index / cols) * 140
		},
		size: {
			w: 150,
			h: 130
		}
	}));
}

function arrangeSpaciousLayout(widgets: WidgetConfig[], dashboardSize: { width: number; height: number }): WidgetConfig[] {
	const arranged = [...widgets];
	const cols = Math.floor(dashboardSize.width / 350);
	
	return arranged.map((widget, index) => ({
		...widget,
		position: {
			x: (index % cols) * 350,
			y: Math.floor(index / cols) * 280
		},
		size: {
			w: 300,
			h: 250
		}
	}));
}

function arrangeUltraCompactLayout(widgets: WidgetConfig[], dashboardSize: { width: number; height: number }): WidgetConfig[] {
	const arranged = [...widgets];
	const cols = Math.floor(dashboardSize.width / 120);
	
	return arranged.map((widget, index) => ({
		...widget,
		position: {
			x: (index % cols) * 120,
			y: Math.floor(index / cols) * 100
		},
		size: {
			w: 110,
			h: 90
		}
	}));
}

// Utility function to call the API endpoint
export async function fetchAILayoutSuggestions(request: AILayoutRequest): Promise<LayoutSuggestion[]> {
	try {
		const response = await fetch('/api/ai-layout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(request)
		});
		
		if (!response.ok) {
			throw new Error(`API request failed: ${response.status}`);
		}
		
		const data = await response.json();
		return data.suggestions || [];
	} catch (error) {
		console.error('Failed to fetch AI layout suggestions:', error);
		
		// Fallback to local generation if API fails
		return generateLayoutSuggestions(request);
	}
}

// Helper function to create AI layout request
export function createAILayoutRequest(
	currentWidgets: WidgetConfig[],
	dashboardSize: { width: number; height: number },
	preferences: {
		priority: 'performance' | 'aesthetics' | 'functionality';
		theme: 'light' | 'dark';
		density: 'compact' | 'spacious';
	}
): AILayoutRequest {
	return {
		currentWidgets,
		dashboardSize,
		preferences
	};
}

// Validation function for layout suggestions
export function validateLayoutSuggestion(suggestion: LayoutSuggestion): boolean {
	if (!suggestion.id || !suggestion.name || !suggestion.widgets) {
		return false;
	}
	
	// Check that all widgets have valid positions and sizes
	return suggestion.widgets.every(widget => 
		widget.position && 
		typeof widget.position.x === 'number' && 
		typeof widget.position.y === 'number' &&
		widget.size &&
		typeof widget.size.w === 'number' &&
		typeof widget.size.h === 'number'
	);
}

// Function to apply a layout suggestion
export function applyLayoutSuggestion(suggestion: LayoutSuggestion): WidgetConfig[] {
	if (!validateLayoutSuggestion(suggestion)) {
		throw new Error('Invalid layout suggestion');
	}
	
	return suggestion.widgets.map(widget => ({
		...widget,
		updatedAt: Date.now()
	}));
}