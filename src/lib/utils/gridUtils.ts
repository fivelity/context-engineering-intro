// Grid calculation utilities for dashboard layout
import type { GridPosition, GridConfig } from '$types/widget.js';

export interface GridBounds {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

export interface CollisionResult {
	hasCollision: boolean;
	collidingWidgets: string[];
	suggestedPosition?: GridPosition;
}

/**
 * Convert pixel coordinates to grid coordinates
 */
export function pixelToGrid(
	pixelX: number,
	pixelY: number,
	cellSize: number,
	gap: number = 0
): { x: number; y: number } {
	const effectiveCellSize = cellSize + gap;
	return {
		x: Math.round(pixelX / effectiveCellSize),
		y: Math.round(pixelY / effectiveCellSize)
	};
}

/**
 * Convert grid coordinates to pixel coordinates
 */
export function gridToPixel(
	gridX: number,
	gridY: number,
	cellSize: number,
	gap: number = 0
): { x: number; y: number } {
	const effectiveCellSize = cellSize + gap;
	return {
		x: gridX * effectiveCellSize,
		y: gridY * effectiveCellSize
	};
}

/**
 * Snap position to grid
 */
export function snapToGrid(
	position: GridPosition,
	cellSize: number,
	gap: number = 0
): GridPosition {
	const snapped = pixelToGrid(position.x, position.y, cellSize, gap);
	return {
		...position,
		x: snapped.x,
		y: snapped.y
	};
}

/**
 * Calculate widget bounds in grid coordinates
 */
export function getWidgetBounds(position: GridPosition): GridBounds {
	return {
		minX: position.x,
		minY: position.y,
		maxX: position.x + position.w,
		maxY: position.y + position.h
	};
}

/**
 * Check if two widgets overlap
 */
export function checkOverlap(pos1: GridPosition, pos2: GridPosition): boolean {
	const bounds1 = getWidgetBounds(pos1);
	const bounds2 = getWidgetBounds(pos2);

	return !(
		bounds1.maxX <= bounds2.minX ||
		bounds2.maxX <= bounds1.minX ||
		bounds1.maxY <= bounds2.minY ||
		bounds2.maxY <= bounds1.minY
	);
}

/**
 * Find all widgets that collide with a given position
 */
export function findCollisions(
	position: GridPosition,
	widgets: Map<string, GridPosition>,
	excludeId?: string
): string[] {
	const collisions: string[] = [];

	for (const [id, widgetPos] of widgets) {
		if (id === excludeId) continue;
		if (checkOverlap(position, widgetPos)) {
			collisions.push(id);
		}
	}

	return collisions;
}

/**
 * Check if position is within grid bounds
 */
export function isWithinBounds(
	position: GridPosition,
	gridConfig: GridConfig
): boolean {
	const bounds = calculateGridBounds(gridConfig);
	const widgetBounds = getWidgetBounds(position);

	return (
		widgetBounds.minX >= 0 &&
		widgetBounds.minY >= 0 &&
		widgetBounds.maxX <= bounds.maxX &&
		widgetBounds.maxY <= bounds.maxY
	);
}

/**
 * Calculate grid bounds based on configuration
 */
export function calculateGridBounds(gridConfig: GridConfig): GridBounds {
	const maxX = gridConfig.cols;
	const maxY = Math.floor(gridConfig.bounds.height / (gridConfig.cellSize + gridConfig.gap));

	return {
		minX: 0,
		minY: 0,
		maxX,
		maxY
	};
}

/**
 * Constrain position to grid bounds
 */
export function constrainToBounds(
	position: GridPosition,
	gridConfig: GridConfig
): GridPosition {
	const bounds = calculateGridBounds(gridConfig);
	
	return {
		x: Math.max(0, Math.min(position.x, bounds.maxX - position.w)),
		y: Math.max(0, Math.min(position.y, bounds.maxY - position.h)),
		w: Math.min(position.w, bounds.maxX),
		h: Math.min(position.h, bounds.maxY)
	};
}

/**
 * Find next available position for a widget
 */
export function findAvailablePosition(
	size: { w: number; h: number },
	widgets: Map<string, GridPosition>,
	gridConfig: GridConfig
): GridPosition | null {
	const bounds = calculateGridBounds(gridConfig);

	// Try positions from top-left, row by row
	for (let y = 0; y <= bounds.maxY - size.h; y++) {
		for (let x = 0; x <= bounds.maxX - size.w; x++) {
			const testPosition: GridPosition = { x, y, w: size.w, h: size.h };
			
			if (findCollisions(testPosition, widgets).length === 0) {
				return testPosition;
			}
		}
	}

	return null; // No available position found
}

/**
 * Compact layout by moving widgets up
 */
export function compactLayout(
	widgets: Map<string, GridPosition>,
	gridConfig: GridConfig
): Map<string, GridPosition> {
	const compacted = new Map<string, GridPosition>();
	
	// Sort widgets by Y position, then X position
	const sortedWidgets = Array.from(widgets.entries()).sort((a, b) => {
		const [, posA] = a;
		const [, posB] = b;
		return posA.y - posB.y || posA.x - posB.x;
	});

	for (const [id, position] of sortedWidgets) {
		let newPosition = { ...position };
		
		// Try to move widget up as much as possible
		while (newPosition.y > 0) {
			const testPosition = { ...newPosition, y: newPosition.y - 1 };
			
			if (findCollisions(testPosition, compacted).length === 0) {
				newPosition = testPosition;
			} else {
				break;
			}
		}
		
		compacted.set(id, newPosition);
	}

	return compacted;
}

/**
 * Auto-arrange widgets in a grid pattern
 */
export function autoArrangeWidgets(
	widgets: Map<string, GridPosition>,
	gridConfig: GridConfig
): Map<string, GridPosition> {
	const arranged = new Map<string, GridPosition>();
	const bounds = calculateGridBounds(gridConfig);
	
	// Sort widgets by size (larger first) for better packing
	const sortedWidgets = Array.from(widgets.entries()).sort((a, b) => {
		const [, posA] = a;
		const [, posB] = b;
		return (posB.w * posB.h) - (posA.w * posA.h);
	});

	let currentX = 0;
	let currentY = 0;
	let rowHeight = 0;

	for (const [id, position] of sortedWidgets) {
		// Check if widget fits in current row
		if (currentX + position.w > bounds.maxX) {
			// Move to next row
			currentX = 0;
			currentY += rowHeight;
			rowHeight = 0;
		}

		// Place widget
		const newPosition: GridPosition = {
			x: currentX,
			y: currentY,
			w: position.w,
			h: position.h
		};

		arranged.set(id, newPosition);

		// Update position for next widget
		currentX += position.w;
		rowHeight = Math.max(rowHeight, position.h);
	}

	return arranged;
}

/**
 * Calculate grid statistics
 */
export function calculateGridStats(
	widgets: Map<string, GridPosition>,
	gridConfig: GridConfig
) {
	const bounds = calculateGridBounds(gridConfig);
	const totalCells = bounds.maxX * bounds.maxY;
	
	let usedCells = 0;
	let maxY = 0;
	
	for (const position of widgets.values()) {
		usedCells += position.w * position.h;
		maxY = Math.max(maxY, position.y + position.h);
	}

	const efficiency = totalCells > 0 ? (usedCells / totalCells) * 100 : 0;
	const density = widgets.size > 0 ? usedCells / widgets.size : 0;

	return {
		totalWidgets: widgets.size,
		totalCells,
		usedCells,
		efficiency: Math.round(efficiency * 100) / 100,
		density: Math.round(density * 100) / 100,
		maxY,
		averageWidgetSize: density
	};
}

/**
 * Generate CSS Grid template
 */
export function generateGridTemplate(gridConfig: GridConfig): string {
	return `repeat(${gridConfig.cols}, ${gridConfig.cellSize}px)`;
}

/**
 * Convert widget position to CSS Grid styles
 */
export function getWidgetGridStyles(position: GridPosition) {
	return {
		gridColumn: `${position.x + 1} / ${position.x + position.w + 1}`,
		gridRow: `${position.y + 1} / ${position.y + position.h + 1}`
	};
}

/**
 * Validate widget position
 */
export function validatePosition(
	position: GridPosition,
	widgets: Map<string, GridPosition>,
	gridConfig: GridConfig,
	widgetId?: string
): {
	valid: boolean;
	errors: string[];
	warnings: string[];
} {
	const errors: string[] = [];
	const warnings: string[] = [];

	// Check minimum size
	if (position.w < 1) errors.push('Widget width must be at least 1');
	if (position.h < 1) errors.push('Widget height must be at least 1');

	// Check bounds
	if (!isWithinBounds(position, gridConfig)) {
		errors.push('Widget extends beyond grid boundaries');
	}

	// Check collisions
	const collisions = findCollisions(position, widgets, widgetId);
	if (collisions.length > 0) {
		errors.push(`Widget collides with: ${collisions.join(', ')}`);
	}

	// Check efficiency warnings
	const area = position.w * position.h;
	if (area > 50) {
		warnings.push('Large widget may impact performance');
	}

	return {
		valid: errors.length === 0,
		errors,
		warnings
	};
}