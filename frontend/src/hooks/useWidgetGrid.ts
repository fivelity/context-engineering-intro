/**
 * Hook for managing widget grid layout with drag/drop and virtualization
 * Optimized for React 19+ with Framer Motion and TanStack Virtual integration
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useLayoutStore } from '@stores/layoutStore';
import { 
  WidgetConfig, 
  Position, 
  Size, 
  DashboardLayout,
  createWidgetId,
  checkCollision,
  calculateGridPosition
} from '@types';

interface WidgetGridOptions {
  containerWidth?: number;
  containerHeight?: number;
  enableVirtualization?: boolean;
  enableDragDrop?: boolean;
  enableResize?: boolean;
  minWidgetSize?: Size;
  maxWidgetSize?: Size;
  gridGap?: number;
  overscan?: number;
}

interface DragState {
  isDragging: boolean;
  draggedWidget: WidgetConfig | null;
  dragOffset: Position;
  dropTarget: Position | null;
  previewPosition: Position | null;
}

interface ResizeState {
  isResizing: boolean;
  resizedWidget: WidgetConfig | null;
  resizeHandle: 'se' | 'sw' | 'ne' | 'nw' | 'n' | 's' | 'e' | 'w' | null;
  originalSize: Size;
  previewSize: Size | null;
}

export const useWidgetGrid = (options: WidgetGridOptions = {}) => {
  const {
    containerWidth = 1200,
    containerHeight = 800,
    enableVirtualization = true,
    enableDragDrop = true,
    enableResize = true,
    minWidgetSize = { w: 2, h: 2 },
    maxWidgetSize = { w: 12, h: 8 },
    gridGap = 4,
    overscan = 2
  } = options;

  // Zustand store for layout management
  const {
    widgets,
    gridSize,
    editMode,
    selectedWidgetIds,
    isDragging,
    isResizing,
    dragPreview,
    snapToGrid,
    addWidget,
    removeWidget,
    updateWidget,
    updateWidgetPosition,
    updateWidgetSize,
    selectWidget,
    selectWidgets,
    clearSelection,
    setDragging,
    setResizing,
    setDragPreview,
    checkWidgetCollision,
    getOverlappingWidgets,
    isValidPosition,
    findEmptyPosition,
    snapToGrid: snapPositionToGrid
  } = useLayoutStore();

  // Local state for drag and resize operations
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedWidget: null,
    dragOffset: { x: 0, y: 0 },
    dropTarget: null,
    previewPosition: null
  });

  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    resizedWidget: null,
    resizeHandle: null,
    originalSize: { w: 0, h: 0 },
    previewSize: null
  });

  // Refs for grid container and mouse tracking
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePositionRef = useRef<Position>({ x: 0, y: 0 });

  // Calculate grid dimensions based on container size
  const gridConfig = useMemo(() => {
    const cols = Math.floor(containerWidth / gridSize);
    const rows = Math.floor(containerHeight / gridSize);
    
    return {
      cols,
      rows,
      cellWidth: gridSize,
      cellHeight: gridSize,
      totalWidth: cols * gridSize,
      totalHeight: rows * gridSize
    };
  }, [containerWidth, containerHeight, gridSize]);

  // Calculate widget layout for virtualization
  const widgetLayout = useMemo(() => {
    return widgets.map(widget => ({
      widget,
      x: widget.position.x,
      y: widget.position.y,
      width: widget.size.w * gridSize,
      height: widget.size.h * gridSize,
      gridX: Math.floor(widget.position.x / gridSize),
      gridY: Math.floor(widget.position.y / gridSize),
      isSelected: selectedWidgetIds.includes(widget.id),
      zIndex: selectedWidgetIds.includes(widget.id) ? 100 : 1
    }));
  }, [widgets, gridSize, selectedWidgetIds]);

  // Virtual scrolling for large grids (optional optimization)
  const rowVirtualizer = useVirtualizer({
    count: gridConfig.rows,
    getScrollElement: () => containerRef.current,
    estimateSize: () => gridSize,
    overscan,
    enabled: enableVirtualization && widgets.length > 50
  });

  const colVirtualizer = useVirtualizer({
    count: gridConfig.cols,
    getScrollElement: () => containerRef.current,
    estimateSize: () => gridSize,
    overscan,
    horizontal: true,
    enabled: enableVirtualization && widgets.length > 50
  });

  // Convert screen coordinates to grid position
  const screenToGrid = useCallback((screenPos: Position): Position => {
    if (!containerRef.current) return screenPos;
    
    const rect = containerRef.current.getBoundingClientRect();
    const gridPos = {
      x: screenPos.x - rect.left,
      y: screenPos.y - rect.top
    };
    
    return snapToGrid ? snapPositionToGrid(gridPos) : gridPos;
  }, [snapToGrid, snapPositionToGrid]);

  // Convert grid position to screen coordinates
  const gridToScreen = useCallback((gridPos: Position): Position => {
    if (!containerRef.current) return gridPos;
    
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: gridPos.x + rect.left,
      y: gridPos.y + rect.top
    };
  }, []);

  // Start dragging a widget
  const startDrag = useCallback((widget: WidgetConfig, mousePos: Position) => {
    if (!enableDragDrop || !editMode) return;

    const gridPos = screenToGrid(mousePos);
    const offset = {
      x: gridPos.x - widget.position.x,
      y: gridPos.y - widget.position.y
    };

    setDragState({
      isDragging: true,
      draggedWidget: widget,
      dragOffset: offset,
      dropTarget: null,
      previewPosition: widget.position
    });

    setDragging(true, widget.id);
    selectWidget(widget.id);
  }, [enableDragDrop, editMode, screenToGrid, setDragging, selectWidget]);

  // Update drag position
  const updateDrag = useCallback((mousePos: Position) => {
    if (!dragState.isDragging || !dragState.draggedWidget) return;

    const gridPos = screenToGrid(mousePos);
    const newPosition = {
      x: gridPos.x - dragState.dragOffset.x,
      y: gridPos.y - dragState.dragOffset.y
    };

    // Validate position bounds
    const boundedPosition = {
      x: Math.max(0, Math.min(newPosition.x, gridConfig.totalWidth - dragState.draggedWidget.size.w * gridSize)),
      y: Math.max(0, Math.min(newPosition.y, gridConfig.totalHeight - dragState.draggedWidget.size.h * gridSize))
    };

    setDragState(prev => ({
      ...prev,
      previewPosition: boundedPosition,
      dropTarget: boundedPosition
    }));

    setDragPreview({
      position: boundedPosition,
      size: dragState.draggedWidget.size
    });

    mousePositionRef.current = mousePos;
  }, [dragState, screenToGrid, gridConfig, gridSize, setDragPreview]);

  // End dragging
  const endDrag = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedWidget || !dragState.dropTarget) {
      setDragState({
        isDragging: false,
        draggedWidget: null,
        dragOffset: { x: 0, y: 0 },
        dropTarget: null,
        previewPosition: null
      });
      setDragging(false);
      setDragPreview(null);
      return;
    }

    const widget = dragState.draggedWidget;
    const newPosition = dragState.dropTarget;

    // Check if position is valid (no collisions)
    if (isValidPosition(newPosition, widget.size, widget.id)) {
      updateWidgetPosition(widget.id, newPosition);
    }

    setDragState({
      isDragging: false,
      draggedWidget: null,
      dragOffset: { x: 0, y: 0 },
      dropTarget: null,
      previewPosition: null
    });

    setDragging(false);
    setDragPreview(null);
  }, [dragState, isValidPosition, updateWidgetPosition, setDragging, setDragPreview]);

  // Start resizing a widget
  const startResize = useCallback((widget: WidgetConfig, handle: ResizeState['resizeHandle']) => {
    if (!enableResize || !editMode) return;

    setResizeState({
      isResizing: true,
      resizedWidget: widget,
      resizeHandle: handle,
      originalSize: widget.size,
      previewSize: widget.size
    });

    setResizing(true, widget.id);
    selectWidget(widget.id);
  }, [enableResize, editMode, setResizing, selectWidget]);

  // Update resize
  const updateResize = useCallback((mousePos: Position, startMousePos: Position) => {
    if (!resizeState.isResizing || !resizeState.resizedWidget) return;

    const widget = resizeState.resizedWidget;
    const handle = resizeState.resizeHandle;
    const delta = {
      x: mousePos.x - startMousePos.x,
      y: mousePos.y - startMousePos.y
    };

    // Convert pixel delta to grid units
    const gridDelta = {
      x: Math.round(delta.x / gridSize),
      y: Math.round(delta.y / gridSize)
    };

    let newSize = { ...resizeState.originalSize };

    // Apply resize based on handle
    switch (handle) {
      case 'se': // Southeast
        newSize.w += gridDelta.x;
        newSize.h += gridDelta.y;
        break;
      case 'sw': // Southwest
        newSize.w -= gridDelta.x;
        newSize.h += gridDelta.y;
        break;
      case 'ne': // Northeast
        newSize.w += gridDelta.x;
        newSize.h -= gridDelta.y;
        break;
      case 'nw': // Northwest
        newSize.w -= gridDelta.x;
        newSize.h -= gridDelta.y;
        break;
      case 'e': // East
        newSize.w += gridDelta.x;
        break;
      case 'w': // West
        newSize.w -= gridDelta.x;
        break;
      case 'n': // North
        newSize.h -= gridDelta.y;
        break;
      case 's': // South
        newSize.h += gridDelta.y;
        break;
    }

    // Apply constraints
    newSize.w = Math.max(minWidgetSize.w, Math.min(maxWidgetSize.w, newSize.w));
    newSize.h = Math.max(minWidgetSize.h, Math.min(maxWidgetSize.h, newSize.h));

    // Apply widget-specific constraints
    if (widget.minSize) {
      newSize.w = Math.max(widget.minSize.w, newSize.w);
      newSize.h = Math.max(widget.minSize.h, newSize.h);
    }
    if (widget.maxSize) {
      newSize.w = Math.min(widget.maxSize.w, newSize.w);
      newSize.h = Math.min(widget.maxSize.h, newSize.h);
    }

    setResizeState(prev => ({
      ...prev,
      previewSize: newSize
    }));
  }, [resizeState, gridSize, minWidgetSize, maxWidgetSize]);

  // End resizing
  const endResize = useCallback(() => {
    if (!resizeState.isResizing || !resizeState.resizedWidget || !resizeState.previewSize) {
      setResizeState({
        isResizing: false,
        resizedWidget: null,
        resizeHandle: null,
        originalSize: { w: 0, h: 0 },
        previewSize: null
      });
      setResizing(false);
      return;
    }

    const widget = resizeState.resizedWidget;
    const newSize = resizeState.previewSize;

    // Check if new size would cause collisions
    if (!checkWidgetCollision(widget, widget.position, newSize)) {
      updateWidgetSize(widget.id, newSize);
    }

    setResizeState({
      isResizing: false,
      resizedWidget: null,
      resizeHandle: null,
      originalSize: { w: 0, h: 0 },
      previewSize: null
    });

    setResizing(false);
  }, [resizeState, checkWidgetCollision, updateWidgetSize, setResizing]);

  // Add widget at position
  const addWidgetAtPosition = useCallback((
    widgetData: Omit<WidgetConfig, 'id' | 'created' | 'modified'>,
    position?: Position
  ) => {
    const targetPosition = position || findEmptyPosition(widgetData.size);
    const widgetWithPosition = {
      ...widgetData,
      position: targetPosition
    };
    
    return addWidget(widgetWithPosition);
  }, [addWidget, findEmptyPosition]);

  // Auto-arrange widgets to minimize overlaps
  const autoArrange = useCallback(() => {
    const arrangedWidgets = [...widgets];
    
    // Sort by size (larger widgets first) then by creation time
    arrangedWidgets.sort((a, b) => {
      const sizeA = a.size.w * a.size.h;
      const sizeB = b.size.w * b.size.h;
      if (sizeA !== sizeB) return sizeB - sizeA;
      return a.created - b.created;
    });

    let currentY = 0;
    let currentRowHeight = 0;
    let currentX = 0;

    arrangedWidgets.forEach(widget => {
      // Try to place widget in current row
      if (currentX + widget.size.w * gridSize <= gridConfig.totalWidth) {
        updateWidgetPosition(widget.id, { x: currentX, y: currentY });
        currentX += widget.size.w * gridSize + gridGap;
        currentRowHeight = Math.max(currentRowHeight, widget.size.h * gridSize);
      } else {
        // Move to next row
        currentY += currentRowHeight + gridGap;
        currentX = 0;
        currentRowHeight = widget.size.h * gridSize;
        updateWidgetPosition(widget.id, { x: currentX, y: currentY });
        currentX += widget.size.w * gridSize + gridGap;
      }
    });
  }, [widgets, gridConfig, gridSize, gridGap, updateWidgetPosition]);

  // Get widgets in viewport (for virtualization)
  const getVisibleWidgets = useCallback(() => {
    if (!enableVirtualization) return widgetLayout;

    const visibleRows = rowVirtualizer.getVirtualItems();
    const visibleCols = colVirtualizer.getVirtualItems();
    
    if (visibleRows.length === 0 || visibleCols.length === 0) return widgetLayout;

    const minRow = visibleRows[0].index;
    const maxRow = visibleRows[visibleRows.length - 1].index;
    const minCol = visibleCols[0].index;
    const maxCol = visibleCols[visibleCols.length - 1].index;

    return widgetLayout.filter(item => {
      const widgetMinRow = item.gridY;
      const widgetMaxRow = item.gridY + item.widget.size.h - 1;
      const widgetMinCol = item.gridX;
      const widgetMaxCol = item.gridX + item.widget.size.w - 1;

      return (
        widgetMaxRow >= minRow &&
        widgetMinRow <= maxRow &&
        widgetMaxCol >= minCol &&
        widgetMinCol <= maxCol
      );
    });
  }, [enableVirtualization, widgetLayout, rowVirtualizer, colVirtualizer]);

  return {
    // Grid configuration
    gridConfig,
    containerRef,
    
    // Widget layout
    widgets: widgetLayout,
    visibleWidgets: getVisibleWidgets(),
    
    // Virtualization
    rowVirtualizer: enableVirtualization ? rowVirtualizer : null,
    colVirtualizer: enableVirtualization ? colVirtualizer : null,
    
    // Interaction state
    dragState,
    resizeState,
    isDragging,
    isResizing,
    editMode,
    selectedWidgetIds,
    
    // Drag and drop
    startDrag,
    updateDrag,
    endDrag,
    
    // Resize
    startResize,
    updateResize,
    endResize,
    
    // Widget management
    addWidget: addWidgetAtPosition,
    removeWidget,
    updateWidget,
    selectWidget,
    selectWidgets,
    clearSelection,
    
    // Layout utilities
    screenToGrid,
    gridToScreen,
    autoArrange,
    isValidPosition,
    checkCollision: checkWidgetCollision,
    getOverlappingWidgets,
    
    // Grid utilities
    snapToGrid: snapPositionToGrid,
    findEmptyPosition,
    
    // Statistics
    stats: {
      totalWidgets: widgets.length,
      selectedWidgets: selectedWidgetIds.length,
      gridUtilization: (widgets.reduce((acc, w) => acc + (w.size.w * w.size.h), 0)) / (gridConfig.cols * gridConfig.rows),
      averageWidgetSize: widgets.length > 0 
        ? widgets.reduce((acc, w) => acc + (w.size.w * w.size.h), 0) / widgets.length 
        : 0
    }
  };
};

export default useWidgetGrid;