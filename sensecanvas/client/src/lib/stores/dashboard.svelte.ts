/**
 * SenseCanvas Dashboard Store
 * Svelte 5 runes-based store for managing dashboard layout, widgets, and edit mode.
 */

import { createWidget } from '../components/widgets/index.js';
import type { WidgetConfig } from '../types/widgets.js';

interface GridConfig {
  cols: number;
  rows: number;
  cellSize: number;
  gap: number;
}

interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: WidgetConfig[];
  gridConfig: GridConfig;
  theme: string;
  backgroundImage?: string;
  backgroundColor?: string;
  createdAt: number;
  updatedAt: number;
  version: string;
  isPublic: boolean;
}

// ✅ Using Svelte 5 runes for dashboard state
let widgets = $state<WidgetConfig[]>([]);
let selectedWidgetId = $state<string | null>(null);
let isEditMode = $state(false);
let gridConfig = $state<GridConfig>({
  cols: 20,
  rows: 15,
  cellSize: 60,
  gap: 10
});
let dashboardConfig = $state<Partial<DashboardLayout>>({
  id: 'default-dashboard',
  name: 'My Dashboard',
  description: 'Custom hardware monitoring dashboard',
  theme: 'default',
  backgroundColor: '#0f172a',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  version: '1.0.0',
  isPublic: false
});
let draggedWidget = $state<string | null>(null);
let clipboard = $state<WidgetConfig | null>(null);
let snapToGrid = $state(true);
let showGrid = $state(true);
let zoomLevel = $state(1.0);

// ✅ Derived computed values
let gridBounds = $derived(() => ({
  x: 0,
  y: 0,
  width: gridConfig.cols * (gridConfig.cellSize + gridConfig.gap),
  height: gridConfig.rows * (gridConfig.cellSize + gridConfig.gap)
}));

let selectedWidget = $derived(() => 
  widgets.find(w => w.id === selectedWidgetId) || null
);

let widgetPositions = $derived(() => {
  const positions = new Map<string, { x: number; y: number; width: number; height: number }>();
  widgets.forEach(widget => {
    positions.set(widget.id, {
      x: widget.position.x,
      y: widget.position.y,
      width: widget.size.width,
      height: widget.size.height
    });
  });
  return positions;
});

let hasCollisions = $derived(() => {
  return checkForCollisions();
});

let dashboardStats = $derived(() => ({
  totalWidgets: widgets.length,
  selectedCount: widgets.filter(w => w.isSelected).length,
  alertWidgets: widgets.filter(w => w.alerts.enabled).length,
  occupiedCells: calculateOccupiedCells(),
  gridUtilization: (calculateOccupiedCells() / (gridConfig.cols * gridConfig.rows)) * 100
}));

let canvasSize = $derived(() => ({
  width: gridBounds().width * zoomLevel,
  height: gridBounds().height * zoomLevel
}));

/**
 * Dashboard actions and methods
 */
export const dashboardStore = {
  // State getters
  get widgets() { return widgets; },
  get selectedWidgetId() { return selectedWidgetId; },
  get selectedWidget() { return selectedWidget(); },
  get isEditMode() { return isEditMode; },
  get gridConfig() { return gridConfig; },
  get dashboardConfig() { return dashboardConfig; },
  get gridBounds() { return gridBounds(); },
  get draggedWidget() { return draggedWidget; },
  get clipboard() { return clipboard; },
  get snapToGrid() { return snapToGrid; },
  get showGrid() { return showGrid; },
  get zoomLevel() { return zoomLevel; },
  get hasCollisions() { return hasCollisions(); },
  get stats() { return dashboardStats(); },
  get canvasSize() { return canvasSize(); },

  // Widget management
  addWidget(type: string, position?: { x: number; y: number }) {
    const newWidget = createWidget(type, {
      position: position || findEmptySpace(),
      zIndex: getNextZIndex()
    }) as WidgetConfig;

    widgets = [...widgets, newWidget];
    selectedWidgetId = newWidget.id;
    dashboardConfig.updatedAt = Date.now();
    return newWidget.id;
  },

  removeWidget(widgetId: string) {
    widgets = widgets.filter(w => w.id !== widgetId);
    if (selectedWidgetId === widgetId) {
      selectedWidgetId = null;
    }
    dashboardConfig.updatedAt = Date.now();
  },

  duplicateWidget(widgetId: string) {
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return null;

    const newPosition = findEmptySpace(widget.position.x + 20, widget.position.y + 20);
    const duplicated = createWidget(widget.type, {
      ...widget,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: newPosition,
      zIndex: getNextZIndex(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }) as WidgetConfig;

    widgets = [...widgets, duplicated];
    selectedWidgetId = duplicated.id;
    dashboardConfig.updatedAt = Date.now();
    return duplicated.id;
  },

  updateWidget(widgetId: string, updates: Partial<WidgetConfig>) {
    widgets = widgets.map(w => 
      w.id === widgetId 
        ? { ...w, ...updates, updatedAt: Date.now() }
        : w
    );
    dashboardConfig.updatedAt = Date.now();
  },

  updateWidgetPosition(widgetId: string, x: number, y: number) {
    const snappedPosition = snapToGrid 
      ? snapPositionToGrid(x, y)
      : { x, y };

    // Check bounds
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const bounds = gridBounds();
    const maxX = bounds.width - widget.size.width;
    const maxY = bounds.height - widget.size.height;

    const clampedPosition = {
      x: Math.max(0, Math.min(maxX, snappedPosition.x)),
      y: Math.max(0, Math.min(maxY, snappedPosition.y))
    };

    this.updateWidget(widgetId, { position: clampedPosition });
  },

  updateWidgetSize(widgetId: string, width: number, height: number) {
    const snappedSize = snapToGrid
      ? snapSizeToGrid(width, height)
      : { width, height };

    this.updateWidget(widgetId, { size: snappedSize });
  },

  selectWidget(widgetId: string | null) {
    // Clear previous selection
    widgets = widgets.map(w => ({ ...w, isSelected: false }));
    
    if (widgetId) {
      // Select new widget
      widgets = widgets.map(w => 
        w.id === widgetId 
          ? { ...w, isSelected: true, zIndex: getNextZIndex() }
          : w
      );
    }
    
    selectedWidgetId = widgetId;
  },

  // Grid and layout management
  setEditMode(enabled: boolean) {
    isEditMode = enabled;
    if (!enabled) {
      selectedWidgetId = null;
      widgets = widgets.map(w => ({ 
        ...w, 
        isSelected: false, 
        isDragging: false, 
        isResizing: false 
      }));
    }
  },

  updateGridConfig(config: Partial<GridConfig>) {
    gridConfig = { ...gridConfig, ...config };
    dashboardConfig.updatedAt = Date.now();
  },

  setSnapToGrid(enabled: boolean) {
    snapToGrid = enabled;
  },

  setShowGrid(enabled: boolean) {
    showGrid = enabled;
  },

  setZoom(level: number) {
    zoomLevel = Math.max(0.25, Math.min(2.0, level));
  },

  // Clipboard operations
  copyWidget(widgetId: string) {
    const widget = widgets.find(w => w.id === widgetId);
    if (widget) {
      clipboard = { ...widget };
    }
  },

  pasteWidget(position?: { x: number; y: number }) {
    if (!clipboard) return null;

    const pastePosition = position || findEmptySpace();
    const pasted = createWidget(clipboard.type, {
      ...clipboard,
      id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: pastePosition,
      zIndex: getNextZIndex(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    }) as WidgetConfig;

    widgets = [...widgets, pasted];
    selectedWidgetId = pasted.id;
    dashboardConfig.updatedAt = Date.now();
    return pasted.id;
  },

  // Layout operations
  alignWidgets(alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') {
    const selectedWidgets = widgets.filter(w => w.isSelected);
    if (selectedWidgets.length < 2) return;

    const bounds = getBoundingBox(selectedWidgets);
    
    widgets = widgets.map(widget => {
      if (!widget.isSelected) return widget;

      let newPosition = { ...widget.position };

      switch (alignment) {
        case 'left':
          newPosition.x = bounds.minX;
          break;
        case 'center':
          newPosition.x = bounds.centerX - widget.size.width / 2;
          break;
        case 'right':
          newPosition.x = bounds.maxX - widget.size.width;
          break;
        case 'top':
          newPosition.y = bounds.minY;
          break;
        case 'middle':
          newPosition.y = bounds.centerY - widget.size.height / 2;
          break;
        case 'bottom':
          newPosition.y = bounds.maxY - widget.size.height;
          break;
      }

      return { ...widget, position: newPosition, updatedAt: Date.now() };
    });

    dashboardConfig.updatedAt = Date.now();
  },

  distributeWidgets(direction: 'horizontal' | 'vertical') {
    const selectedWidgets = widgets.filter(w => w.isSelected);
    if (selectedWidgets.length < 3) return;

    const sorted = [...selectedWidgets].sort((a, b) => 
      direction === 'horizontal' 
        ? a.position.x - b.position.x
        : a.position.y - b.position.y
    );

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const totalSpace = direction === 'horizontal'
      ? (last.position.x + last.size.width) - first.position.x
      : (last.position.y + last.size.height) - first.position.y;

    const spacing = totalSpace / (sorted.length - 1);

    widgets = widgets.map(widget => {
      const index = sorted.findIndex(w => w.id === widget.id);
      if (index === -1) return widget;

      let newPosition = { ...widget.position };

      if (direction === 'horizontal') {
        newPosition.x = first.position.x + (index * spacing);
      } else {
        newPosition.y = first.position.y + (index * spacing);
      }

      return { ...widget, position: newPosition, updatedAt: Date.now() };
    });

    dashboardConfig.updatedAt = Date.now();
  },

  // Dashboard management
  async loadDashboard() {
    try {
      const stored = localStorage.getItem('sensecanvas-dashboard');
      if (stored) {
        const layout: DashboardLayout = JSON.parse(stored);
        widgets = layout.widgets;
        gridConfig = layout.gridConfig;
        dashboardConfig = layout;
        selectedWidgetId = null;
      }
    } catch (error) {
      console.warn('Failed to load dashboard from storage:', error);
    }
  },

  exportDashboard(): DashboardLayout {
    return {
      ...dashboardConfig,
      widgets,
      gridConfig,
      updatedAt: Date.now()
    } as DashboardLayout;
  },

  clearDashboard() {
    widgets = [];
    selectedWidgetId = null;
    dashboardConfig.updatedAt = Date.now();
  },

  // Reset to defaults
  reset() {
    widgets = [];
    selectedWidgetId = null;
    isEditMode = false;
    draggedWidget = null;
    clipboard = null;
    snapToGrid = true;
    showGrid = true;
    zoomLevel = 1.0;
    gridConfig = {
      cols: 20,
      rows: 15,
      cellSize: 60,
      gap: 10
    };
    dashboardConfig = {
      id: 'default-dashboard',
      name: 'My Dashboard',
      description: 'Custom hardware monitoring dashboard',
      theme: 'default',
      backgroundColor: '#0f172a',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
      isPublic: false
    };
  }
};

// Helper functions
function findEmptySpace(startX = 0, startY = 0): { x: number; y: number } {
  const cellSize = gridConfig.cellSize + gridConfig.gap;
  
  for (let y = startY; y < gridBounds().height - 200; y += cellSize) {
    for (let x = startX; x < gridBounds().width - 200; x += cellSize) {
      if (!isPositionOccupied(x, y, 200, 200)) {
        return snapToGrid ? snapPositionToGrid(x, y) : { x, y };
      }
    }
  }
  
  // If no space found, place at origin
  return { x: 0, y: 0 };
}

function isPositionOccupied(x: number, y: number, width: number, height: number): boolean {
  return widgets.some(widget => {
    const wx = widget.position.x;
    const wy = widget.position.y;
    const ww = widget.size.width;
    const wh = widget.size.height;
    
    return !(x + width <= wx || x >= wx + ww || y + height <= wy || y >= wy + wh);
  });
}

function snapPositionToGrid(x: number, y: number): { x: number; y: number } {
  const cellSize = gridConfig.cellSize + gridConfig.gap;
  return {
    x: Math.round(x / cellSize) * cellSize,
    y: Math.round(y / cellSize) * cellSize
  };
}

function snapSizeToGrid(width: number, height: number): { width: number; height: number } {
  const cellSize = gridConfig.cellSize + gridConfig.gap;
  return {
    width: Math.max(cellSize, Math.round(width / cellSize) * cellSize),
    height: Math.max(cellSize, Math.round(height / cellSize) * cellSize)
  };
}

function getNextZIndex(): number {
  return Math.max(1, ...widgets.map(w => w.zIndex || 1)) + 1;
}

function checkForCollisions(): boolean {
  for (let i = 0; i < widgets.length; i++) {
    for (let j = i + 1; j < widgets.length; j++) {
      if (widgetsOverlap(widgets[i], widgets[j])) {
        return true;
      }
    }
  }
  return false;
}

function widgetsOverlap(a: WidgetConfig, b: WidgetConfig): boolean {
  return !(a.position.x + a.size.width <= b.position.x ||
           a.position.x >= b.position.x + b.size.width ||
           a.position.y + a.size.height <= b.position.y ||
           a.position.y >= b.position.y + b.size.height);
}

function calculateOccupiedCells(): number {
  const cellSize = gridConfig.cellSize + gridConfig.gap;
  const occupiedCells = new Set<string>();
  
  widgets.forEach(widget => {
    const startCol = Math.floor(widget.position.x / cellSize);
    const endCol = Math.floor((widget.position.x + widget.size.width) / cellSize);
    const startRow = Math.floor(widget.position.y / cellSize);
    const endRow = Math.floor((widget.position.y + widget.size.height) / cellSize);
    
    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        occupiedCells.add(`${row}-${col}`);
      }
    }
  });
  
  return occupiedCells.size;
}

function getBoundingBox(widgets: WidgetConfig[]) {
  const positions = widgets.map(w => ({
    minX: w.position.x,
    maxX: w.position.x + w.size.width,
    minY: w.position.y,
    maxY: w.position.y + w.size.height
  }));
  
  return {
    minX: Math.min(...positions.map(p => p.minX)),
    maxX: Math.max(...positions.map(p => p.maxX)),
    minY: Math.min(...positions.map(p => p.minY)),
    maxY: Math.max(...positions.map(p => p.maxY)),
    centerX: (Math.min(...positions.map(p => p.minX)) + Math.max(...positions.map(p => p.maxX))) / 2,
    centerY: (Math.min(...positions.map(p => p.minY)) + Math.max(...positions.map(p => p.maxY))) / 2
  };
}