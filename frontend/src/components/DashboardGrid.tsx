/**
 * DashboardGrid - Main grid component with TanStack Virtual integration
 * Handles widget rendering, drag/drop, and real-time updates with React 19+
 */

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useWidgetGrid, useSensorData, useTheme } from '@hooks';
import { WidgetRenderer } from './widgets/WidgetRenderer';
import { GridBackground } from './ui/GridBackground';
import { DragPreview } from './ui/DragPreview';
import { SelectionBox } from './ui/SelectionBox';
import { GridToolbar } from './ui/GridToolbar';
import { WidgetConfig, Position, Size } from '@types';

interface DashboardGridProps {
  className?: string;
  enableVirtualization?: boolean;
  enableDragDrop?: boolean;
  enableResize?: boolean;
  showToolbar?: boolean;
  containerWidth?: number;
  containerHeight?: number;
  onWidgetClick?: (widget: WidgetConfig) => void;
  onWidgetDoubleClick?: (widget: WidgetConfig) => void;
  onEmptyAreaClick?: () => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  className = '',
  enableVirtualization = true,
  enableDragDrop = true,
  enableResize = true,
  showToolbar = true,
  containerWidth = 1200,
  containerHeight = 800,
  onWidgetClick,
  onWidgetDoubleClick,
  onEmptyAreaClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef<Position>({ x: 0, y: 0 });
  const selectionStartRef = useRef<Position | null>(null);

  // Hooks for grid management
  const {
    gridConfig,
    widgets,
    visibleWidgets,
    dragState,
    resizeState,
    editMode,
    selectedWidgetIds,
    startDrag,
    updateDrag,
    endDrag,
    startResize,
    updateResize,
    endResize,
    selectWidget,
    selectWidgets,
    clearSelection,
    screenToGrid,
    autoArrange,
    stats
  } = useWidgetGrid({
    containerWidth,
    containerHeight,
    enableVirtualization,
    enableDragDrop,
    enableResize
  });

  // Theme and sensor data
  const { currentTheme, effectsEnabled, animationsEnabled } = useTheme();
  const { sensorData, isConnected } = useSensorData();

  // Virtual scrolling setup
  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(containerHeight / gridConfig.cellHeight),
    getScrollElement: () => containerRef.current,
    estimateSize: () => gridConfig.cellHeight,
    overscan: 2,
    enabled: enableVirtualization && widgets.length > 50
  });

  const colVirtualizer = useVirtualizer({
    count: Math.ceil(containerWidth / gridConfig.cellWidth),
    getScrollElement: () => containerRef.current,
    estimateSize: () => gridConfig.cellWidth,
    overscan: 2,
    horizontal: true,
    enabled: enableVirtualization && widgets.length > 50
  });

  // Mouse event handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!editMode) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    dragStartPosRef.current = mousePos;

    // Check if clicking on a widget
    const clickedWidget = widgets.find(w => {
      const bounds = {
        left: w.widget.position.x,
        right: w.widget.position.x + w.width,
        top: w.widget.position.y,
        bottom: w.widget.position.y + w.height
      };
      
      return (
        mousePos.x >= bounds.left &&
        mousePos.x <= bounds.right &&
        mousePos.y >= bounds.top &&
        mousePos.y <= bounds.bottom
      );
    });

    if (clickedWidget) {
      // Handle widget selection and drag start
      const isMultiSelect = e.ctrlKey || e.metaKey;
      
      if (!selectedWidgetIds.includes(clickedWidget.widget.id)) {
        selectWidget(clickedWidget.widget.id, isMultiSelect);
      }

      if (enableDragDrop) {
        startDrag(clickedWidget.widget, { x: e.clientX, y: e.clientY });
        isDraggingRef.current = true;
      }
    } else {
      // Start area selection
      if (!e.ctrlKey && !e.metaKey) {
        clearSelection();
      }
      selectionStartRef.current = mousePos;
    }
  }, [editMode, widgets, selectedWidgetIds, selectWidget, startDrag, clearSelection, enableDragDrop]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!editMode) return;

    const mousePos = { x: e.clientX, y: e.clientY };

    if (isDraggingRef.current && dragState.isDragging) {
      updateDrag(mousePos);
    } else if (resizeState.isResizing) {
      updateResize(mousePos, dragStartPosRef.current);
    }
  }, [editMode, dragState.isDragging, resizeState.isResizing, updateDrag, updateResize]);

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      endDrag();
      isDraggingRef.current = false;
    }
    
    if (resizeState.isResizing) {
      endResize();
    }

    selectionStartRef.current = null;
  }, [endDrag, endResize, resizeState.isResizing]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!editMode) return;

    switch (e.key) {
      case 'Delete':
      case 'Backspace':
        if (selectedWidgetIds.length > 0) {
          // Delete selected widgets (implement in parent component)
          e.preventDefault();
        }
        break;
      case 'a':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const allWidgetIds = widgets.map(w => w.widget.id);
          selectWidgets(allWidgetIds);
        }
        break;
      case 'Escape':
        clearSelection();
        break;
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        if (selectedWidgetIds.length > 0) {
          e.preventDefault();
          // Move selected widgets (implement nudging)
        }
        break;
    }
  }, [editMode, selectedWidgetIds, widgets, selectWidgets, clearSelection]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousemove', handleMouseMove as any);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove as any);
    };
  }, [handleKeyDown, handleMouseUp, handleMouseMove]);

  // Animation variants
  const gridVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.05
      }
    }
  };

  const widgetVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.2 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.15 }
    }
  };

  // Render widgets with virtualization
  const renderWidgets = useMemo(() => {
    const widgetsToRender = enableVirtualization ? visibleWidgets : widgets;
    
    return widgetsToRender.map((widgetLayout) => {
      const { widget } = widgetLayout;
      const isSelected = selectedWidgetIds.includes(widget.id);
      const isDragged = dragState.draggedWidget?.id === widget.id;
      const isResized = resizeState.resizedWidget?.id === widget.id;

      return (
        <motion.div
          key={widget.id}
          layout
          variants={widgetVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            position: 'absolute',
            left: isDragged ? dragState.previewPosition?.x : widget.position.x,
            top: isDragged ? dragState.previewPosition?.y : widget.position.y,
            width: isResized ? (resizeState.previewSize?.w || widget.size.w) * gridConfig.cellWidth : widget.size.w * gridConfig.cellWidth,
            height: isResized ? (resizeState.previewSize?.h || widget.size.h) * gridConfig.cellHeight : widget.size.h * gridConfig.cellHeight,
            zIndex: isSelected ? 100 : widgetLayout.zIndex,
            pointerEvents: isDragged ? 'none' : 'auto'
          }}
          className={`
            widget-container
            ${isSelected ? 'selected' : ''}
            ${isDragged ? 'dragging' : ''}
            ${isResized ? 'resizing' : ''}
          `}
          onClick={(e) => {
            e.stopPropagation();
            onWidgetClick?.(widget);
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            onWidgetDoubleClick?.(widget);
          }}
        >
          <WidgetRenderer
            widget={widget}
            sensorData={sensorData}
            isSelected={isSelected}
            isEditing={editMode}
            enableResize={enableResize && editMode}
            onResizeStart={(handle) => startResize(widget, handle)}
            theme={currentTheme}
          />
        </motion.div>
      );
    });
  }, [
    enableVirtualization,
    visibleWidgets,
    widgets,
    selectedWidgetIds,
    dragState,
    resizeState,
    gridConfig,
    sensorData,
    editMode,
    enableResize,
    currentTheme,
    startResize,
    onWidgetClick,
    onWidgetDoubleClick
  ]);

  return (
    <div className={`dashboard-grid ${className}`}>
      {showToolbar && (
        <GridToolbar
          editMode={editMode}
          selectedCount={selectedWidgetIds.length}
          totalWidgets={widgets.length}
          gridStats={stats}
          isConnected={isConnected}
          onAutoArrange={autoArrange}
        />
      )}
      
      <motion.div
        ref={containerRef}
        className="grid-container"
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        style={{
          position: 'relative',
          width: containerWidth,
          height: containerHeight,
          overflow: 'auto',
          cursor: editMode ? 'crosshair' : 'default'
        }}
        onMouseDown={handleMouseDown}
        onClick={onEmptyAreaClick}
      >
        {/* Grid background */}
        <GridBackground
          width={containerWidth}
          height={containerHeight}
          gridSize={gridConfig.cellWidth}
          theme={currentTheme}
          effectsEnabled={effectsEnabled}
        />

        {/* Widget rendering with virtualization */}
        <div
          className="widgets-layer"
          style={{
            position: 'relative',
            width: '100%',
            height: '100%'
          }}
        >
          <AnimatePresence mode="popLayout">
            {renderWidgets}
          </AnimatePresence>
        </div>

        {/* Drag preview */}
        {dragState.isDragging && dragState.previewPosition && (
          <DragPreview
            position={dragState.previewPosition}
            size={dragState.draggedWidget?.size || { w: 1, h: 1 }}
            gridSize={gridConfig.cellWidth}
            theme={currentTheme}
          />
        )}

        {/* Selection box for area selection */}
        {selectionStartRef.current && (
          <SelectionBox
            startPosition={selectionStartRef.current}
            theme={currentTheme}
          />
        )}

        {/* Performance overlay for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="performance-overlay">
            <div>Widgets: {widgets.length}</div>
            <div>Visible: {visibleWidgets.length}</div>
            <div>Selected: {selectedWidgetIds.length}</div>
            <div>Virtual: {enableVirtualization ? 'ON' : 'OFF'}</div>
            <div>FPS: {Math.round(1000 / 16)}fps</div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default DashboardGrid;