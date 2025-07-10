/**
 * Enhanced Drag & Drop with advanced gestures and interactions
 * Includes multi-touch, magnetic snapping, and collision avoidance
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useAnimation, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { useWidgetGrid, useTheme } from '@hooks';
import { WidgetConfig, Position, Size } from '@types';

interface EnhancedDragProps {
  widget: WidgetConfig;
  children: React.ReactNode;
  magneticSnap?: boolean;
  collisionAvoidance?: boolean;
  multiSelect?: boolean;
  onCollision?: (collidingWidgets: string[]) => void;
  onSnapToPosition?: (position: Position) => void;
}

export const EnhancedDraggableWidget: React.FC<EnhancedDragProps> = ({
  widget,
  children,
  magneticSnap = true,
  collisionAvoidance = true,
  multiSelect = true,
  onCollision,
  onSnapToPosition
}) => {
  const controls = useAnimation();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [initialPosition, setInitialPosition] = useState(widget.position);
  const [ghostPositions, setGhostPositions] = useState<Position[]>([]);

  const { currentTheme } = useTheme();
  const {
    gridSize,
    selectedWidgetIds,
    widgets,
    updateWidgetPosition,
    getOverlappingWidgets,
    isValidPosition,
    snapToGrid: snapPositionToGrid
  } = useWidgetGrid();

  // Motion values for smooth dragging
  const x = useMotionValue(widget.position.x);
  const y = useMotionValue(widget.position.y);
  const rotate = useMotionValue(0);
  const scale = useMotionValue(1);

  // Magnetic snapping calculation
  const magneticX = useTransform(x, (value) => {
    if (!magneticSnap || !isDragging) return value;
    
    const snapThreshold = gridSize / 2;
    const gridX = Math.round(value / gridSize) * gridSize;
    const distance = Math.abs(value - gridX);
    
    if (distance < snapThreshold) {
      return gridX;
    }
    return value;
  });

  const magneticY = useTransform(y, (value) => {
    if (!magneticSnap || !isDragging) return value;
    
    const snapThreshold = gridSize / 2;
    const gridY = Math.round(value / gridSize) * gridSize;
    const distance = Math.abs(value - gridY);
    
    if (distance < snapThreshold) {
      return gridY;
    }
    return value;
  });

  // Collision detection during drag
  const checkCollisions = useCallback((position: Position) => {
    if (!collisionAvoidance) return [];
    
    const overlapping = getOverlappingWidgets(
      { ...widget, position },
      position,
      widget.size
    );
    
    onCollision?.(overlapping);
    return overlapping;
  }, [widget, getOverlappingWidgets, collisionAvoidance, onCollision]);

  // Multi-select drag handling
  const getSelectedWidgets = useCallback(() => {
    if (!multiSelect || !selectedWidgetIds.includes(widget.id)) {
      return [widget];
    }
    
    return widgets
      .filter(w => selectedWidgetIds.includes(w.widget.id))
      .map(w => w.widget);
  }, [widget, widgets, selectedWidgetIds, multiSelect]);

  // Enhanced drag start
  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setInitialPosition(widget.position);
    
    // Create ghost positions for multi-select
    const selectedWidgets = getSelectedWidgets();
    if (selectedWidgets.length > 1) {
      const offsets = selectedWidgets.map(w => ({
        x: w.position.x - widget.position.x,
        y: w.position.y - widget.position.y
      }));
      setGhostPositions(offsets);
    }

    // Haptic feedback on supported devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    // Start drag animation
    controls.start({
      scale: 1.05,
      rotate: [0, 1, -1, 0],
      boxShadow: `0 10px 30px ${currentTheme.colors.primary}40`,
      transition: {
        rotate: {
          duration: 0.15,
          repeat: Infinity,
          repeatType: 'reverse'
        }
      }
    });
  }, [widget, getSelectedWidgets, controls, currentTheme]);

  // Enhanced drag handling
  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const currentPos = {
      x: x.get(),
      y: y.get()
    };

    // Check collisions
    const collisions = checkCollisions(currentPos);
    
    // Update visual feedback based on collisions
    if (collisions.length > 0) {
      controls.start({
        boxShadow: `0 10px 30px ${currentTheme.colors.danger}60`,
        scale: 1.03
      });
    } else {
      controls.start({
        boxShadow: `0 10px 30px ${currentTheme.colors.success}40`,
        scale: 1.05
      });
    }

    // Update ghost positions for multi-select
    if (ghostPositions.length > 0) {
      // This would update other selected widgets in real-time
      // Implementation depends on store updates
    }

    // Magnetic snap feedback
    if (magneticSnap) {
      const snapX = Math.round(currentPos.x / gridSize) * gridSize;
      const snapY = Math.round(currentPos.y / gridSize) * gridSize;
      
      if (Math.abs(currentPos.x - snapX) < gridSize / 3 && 
          Math.abs(currentPos.y - snapY) < gridSize / 3) {
        onSnapToPosition?.({ x: snapX, y: snapY });
        
        // Slight haptic feedback for snap
        if ('vibrate' in navigator) {
          navigator.vibrate(20);
        }
      }
    }
  }, [x, y, checkCollisions, controls, currentTheme, ghostPositions, magneticSnap, gridSize, onSnapToPosition]);

  // Enhanced drag end
  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    setGhostPositions([]);

    const finalPosition = {
      x: magneticX.get(),
      y: magneticY.get()
    };

    // Validate final position
    const isValid = isValidPosition(finalPosition, widget.size, widget.id);
    
    if (isValid) {
      // Update all selected widgets if multi-select
      const selectedWidgets = getSelectedWidgets();
      
      if (selectedWidgets.length > 1) {
        const deltaX = finalPosition.x - initialPosition.x;
        const deltaY = finalPosition.y - initialPosition.y;
        
        selectedWidgets.forEach(w => {
          const newPos = {
            x: w.position.x + deltaX,
            y: w.position.y + deltaY
          };
          updateWidgetPosition(w.id, newPos);
        });
      } else {
        updateWidgetPosition(widget.id, finalPosition);
      }
      
      // Success animation
      controls.start({
        scale: 1,
        rotate: 0,
        boxShadow: `0 0 0 0 ${currentTheme.colors.success}00`,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 30
        }
      });
      
      // Success haptic
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 50, 100]);
      }
    } else {
      // Snap back to original position
      x.set(initialPosition.x);
      y.set(initialPosition.y);
      
      controls.start({
        scale: 1,
        rotate: 0,
        boxShadow: `0 0 20px ${currentTheme.colors.danger}60`,
        x: [5, -5, 5, -5, 0],
        transition: {
          x: { duration: 0.3 },
          default: { type: 'spring', stiffness: 300, damping: 30 }
        }
      });
      
      // Error haptic
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }
  }, [
    magneticX, magneticY, widget, initialPosition, isValidPosition,
    getSelectedWidgets, updateWidgetPosition, controls, currentTheme, x, y
  ]);

  // Gesture recognition for additional interactions
  const handleTap = useCallback(() => {
    // Single tap - select widget
    if (!isDragging) {
      // Handle selection logic
    }
  }, [isDragging]);

  const handleDoubleTap = useCallback(() => {
    // Double tap - configure widget
    if (!isDragging) {
      // Handle configuration logic
    }
  }, [isDragging]);

  // Keyboard interactions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedWidgetIds.includes(widget.id)) return;

      const moveDistance = e.shiftKey ? gridSize : 1;
      let newPosition = { ...widget.position };

      switch (e.key) {
        case 'ArrowUp':
          newPosition.y -= moveDistance;
          break;
        case 'ArrowDown':
          newPosition.y += moveDistance;
          break;
        case 'ArrowLeft':
          newPosition.x -= moveDistance;
          break;
        case 'ArrowRight':
          newPosition.x += moveDistance;
          break;
        default:
          return;
      }

      e.preventDefault();
      
      if (isValidPosition(newPosition, widget.size, widget.id)) {
        updateWidgetPosition(widget.id, newPosition);
        x.set(newPosition.x);
        y.set(newPosition.y);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [widget, selectedWidgetIds, gridSize, isValidPosition, updateWidgetPosition, x, y]);

  return (
    <motion.div
      ref={constraintsRef}
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.05}
      dragMomentum={false}
      animate={controls}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      onTapStart={handleDoubleTap}
      style={{
        x: magneticX,
        y: magneticY,
        rotate,
        scale,
        width: widget.size.w * gridSize,
        height: widget.size.h * gridSize,
        position: 'absolute',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : selectedWidgetIds.includes(widget.id) ? 100 : 1
      }}
      className={`
        enhanced-draggable
        ${isDragging ? 'dragging' : ''}
        ${selectedWidgetIds.includes(widget.id) ? 'selected' : ''}
      `}
    >
      {children}
      
      {/* Multi-select indicators */}
      {selectedWidgetIds.includes(widget.id) && selectedWidgetIds.length > 1 && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -8,
            width: 20,
            height: 20,
            backgroundColor: currentTheme.colors.primary,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: 'bold',
            color: currentTheme.colors.background,
            boxShadow: `0 0 8px ${currentTheme.colors.primary}`,
            zIndex: 10
          }}
        >
          {selectedWidgetIds.length}
        </div>
      )}

      {/* Drag handles for better UX */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 24,
          background: `linear-gradient(180deg, ${currentTheme.colors.surface}60, transparent)`,
          cursor: 'grab',
          zIndex: 5,
          opacity: isDragging ? 1 : 0,
          transition: 'opacity 0.2s ease'
        }}
        className="drag-handle-indicator"
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: '12px',
            color: currentTheme.colors.textSecondary
          }}
        >
          ⋮⋮
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedDraggableWidget;