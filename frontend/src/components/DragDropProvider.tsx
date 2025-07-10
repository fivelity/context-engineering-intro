/**
 * DragDropProvider - Enhanced drag and drop system with Framer Motion
 * Provides smooth animations and gesture handling for widget interactions
 */

import React, { createContext, useContext, useRef, useState, useCallback } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useWidgetGrid, useTheme } from '@hooks';
import { WidgetConfig, Position, Size } from '@types';

interface DragDropContextType {
  dragConstraints: React.RefObject<HTMLDivElement>;
  isDragging: boolean;
  draggedWidget: WidgetConfig | null;
  startDrag: (widget: WidgetConfig, event: React.PointerEvent) => void;
  endDrag: () => void;
  dragPosition: Position;
  snapToGrid: boolean;
}

const DragDropContext = createContext<DragDropContextType | null>(null);

export const useDragDrop = () => {
  const context = useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within DragDropProvider');
  }
  return context;
};

interface DragDropProviderProps {
  children: React.ReactNode;
  gridSize: number;
  snapToGrid?: boolean;
}

export const DragDropProvider: React.FC<DragDropProviderProps> = ({
  children,
  gridSize,
  snapToGrid = true
}) => {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<WidgetConfig | null>(null);
  const [dragPosition, setDragPosition] = useState<Position>({ x: 0, y: 0 });

  const { currentTheme } = useTheme();
  const {
    updateWidgetPosition,
    isValidPosition,
    snapToGrid: snapPositionToGrid
  } = useWidgetGrid();

  const startDrag = useCallback((widget: WidgetConfig, event: React.PointerEvent) => {
    setIsDragging(true);
    setDraggedWidget(widget);
    setDragPosition(widget.position);
    
    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  }, []);

  const endDrag = useCallback(() => {
    if (draggedWidget) {
      const finalPosition = snapToGrid ? snapPositionToGrid(dragPosition) : dragPosition;
      
      // Validate position before applying
      if (isValidPosition(finalPosition, draggedWidget.size, draggedWidget.id)) {
        updateWidgetPosition(draggedWidget.id, finalPosition);
      }
    }

    setIsDragging(false);
    setDraggedWidget(null);
    
    // Restore text selection
    document.body.style.userSelect = '';
  }, [draggedWidget, dragPosition, snapToGrid, snapPositionToGrid, isValidPosition, updateWidgetPosition]);

  const contextValue: DragDropContextType = {
    dragConstraints: constraintsRef,
    isDragging,
    draggedWidget,
    startDrag,
    endDrag,
    dragPosition,
    snapToGrid
  };

  return (
    <DragDropContext.Provider value={contextValue}>
      <div 
        ref={constraintsRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {children}
      </div>
    </DragDropContext.Provider>
  );
};

/**
 * DraggableWidget - Individual draggable widget component
 */
interface DraggableWidgetProps {
  widget: WidgetConfig;
  children: React.ReactNode;
  disabled?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  widget,
  children,
  disabled = false,
  onDragStart,
  onDragEnd
}) => {
  const { dragConstraints, snapToGrid, isDragging, draggedWidget } = useDragDrop();
  const { currentTheme } = useTheme();
  const { gridSize, isValidPosition, snapToGrid: snapPositionToGrid } = useWidgetGrid();

  const x = useMotionValue(widget.position.x);
  const y = useMotionValue(widget.position.y);
  
  // Transform motion values for snap-to-grid
  const snapX = useTransform(x, (value) => 
    snapToGrid ? Math.round(value / gridSize) * gridSize : value
  );
  const snapY = useTransform(y, (value) => 
    snapToGrid ? Math.round(value / gridSize) * gridSize : value
  );

  const isBeingDragged = draggedWidget?.id === widget.id;

  const handleDragStart = useCallback(() => {
    onDragStart?.();
  }, [onDragStart]);

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newPosition = {
      x: info.point.x,
      y: info.point.y
    };

    // Visual feedback for valid/invalid positions
    const isValid = isValidPosition(newPosition, widget.size, widget.id);
    
    // Update cursor based on validity
    document.body.style.cursor = isValid ? 'grabbing' : 'not-allowed';
  }, [widget, isValidPosition]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const finalPosition = {
      x: snapX.get(),
      y: snapY.get()
    };

    // Reset cursor
    document.body.style.cursor = '';
    
    onDragEnd?.();
  }, [snapX, snapY, onDragEnd]);

  const dragVariants = {
    idle: {
      scale: 1,
      zIndex: 1,
      boxShadow: `0 0 0 0 ${currentTheme.colors.primary}00`,
    },
    dragging: {
      scale: 1.05,
      zIndex: 1000,
      boxShadow: `0 8px 25px ${currentTheme.colors.primary}40`,
      rotate: [0, 1, -1, 0],
      transition: {
        rotate: {
          duration: 0.2,
          repeat: Infinity,
          repeatType: 'reverse'
        }
      }
    },
    hover: {
      scale: 1.02,
      boxShadow: `0 4px 15px ${currentTheme.colors.primary}20`,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      drag={!disabled}
      dragConstraints={dragConstraints}
      dragElastic={0.1}
      dragMomentum={false}
      whileDrag="dragging"
      whileHover={!isBeingDragged ? "hover" : undefined}
      variants={dragVariants}
      initial="idle"
      animate={isBeingDragged ? "dragging" : "idle"}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{
        x: snapToGrid ? snapX : x,
        y: snapToGrid ? snapY : y,
        width: widget.size.w * gridSize,
        height: widget.size.h * gridSize,
        position: 'absolute',
        cursor: disabled ? 'default' : 'grab'
      }}
      className={`
        draggable-widget
        ${disabled ? 'drag-disabled' : ''}
        ${isBeingDragged ? 'being-dragged' : ''}
      `}
    >
      {children}
      
      {/* Drag handle overlay for better grab area */}
      {!disabled && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 32,
            background: 'transparent',
            cursor: 'grab',
            zIndex: 10
          }}
          className="drag-handle"
        />
      )}
    </motion.div>
  );
};

export default DragDropProvider;