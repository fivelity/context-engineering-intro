/**
 * DashboardGrid.tsx - React 19+ Dashboard Grid Example
 * 
 * Demonstrates:
 * - TanStack Virtual for high-performance widget virtualization
 * - CSS Grid layout with responsive positioning
 * - React 19 concurrent features with automatic batching
 * - Cosmic UI integration for sci-fi theming
 * - Framer Motion animations for smooth interactions
 * - Grid snapping and collision detection
 */

import React, { useRef, useMemo, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion, AnimatePresence } from 'framer-motion';
import { useLayoutStore } from '../stores/layoutStore';
import { useCosmicTheme } from '../hooks/useCosmicTheme';
import { DraggableWidget } from './DraggableWidget';
import type { WidgetConfig, Position, Size } from '../types/widget';

interface DashboardGridProps {
  editMode?: boolean;
  className?: string;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  editMode = false,
  className = ''
}) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const { theme } = useCosmicTheme();
  
  // Zustand store for widget management
  const {
    widgets,
    gridSize,
    updateWidgetPosition,
    updateWidgetSize,
    removeWidget,
    isValidPosition
  } = useLayoutStore();

  // Calculate grid properties
  const gridConfig = useMemo(() => ({
    columns: Math.floor((parentRef.current?.clientWidth || 1200) / gridSize),
    rows: Math.ceil(widgets.length / Math.floor((parentRef.current?.clientWidth || 1200) / gridSize)),
    cellSize: gridSize
  }), [gridSize, widgets.length]);

  // TanStack Virtual for performance with many widgets
  const virtualizer = useVirtualizer({
    count: widgets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback((index: number) => {
      // Estimate height based on widget type and size
      const widget = widgets[index];
      return widget?.size?.h * gridSize || 200;
    }, [widgets, gridSize]),
    overscan: 5, // Render extra items for smooth scrolling
  });

  // Grid snapping utility
  const snapToGrid = useCallback((position: Position): Position => {
    return {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
  }, [gridSize]);

  // Collision detection
  const checkCollision = useCallback((
    widget: WidgetConfig,
    newPosition: Position,
    newSize?: Size
  ): boolean => {
    const size = newSize || widget.size;
    
    return widgets.some(otherWidget => {
      if (otherWidget.id === widget.id) return false;
      
      const otherRight = otherWidget.position.x + (otherWidget.size.w * gridSize);
      const otherBottom = otherWidget.position.y + (otherWidget.size.h * gridSize);
      const newRight = newPosition.x + (size.w * gridSize);
      const newBottom = newPosition.y + (size.h * gridSize);
      
      return !(
        newPosition.x >= otherRight ||
        newRight <= otherWidget.position.x ||
        newPosition.y >= otherBottom ||
        newBottom <= otherWidget.position.y
      );
    });
  }, [widgets, gridSize]);

  // Handle widget drag
  const handleWidgetDrag = useCallback((
    widget: WidgetConfig,
    position: Position
  ) => {
    const snappedPosition = snapToGrid(position);
    
    // Check for collisions and boundaries
    if (!checkCollision(widget, snappedPosition) && 
        isValidPosition(snappedPosition, widget.size)) {
      // React 19's automatic batching handles multiple updates efficiently
      updateWidgetPosition(widget.id, snappedPosition);
    }
  }, [snapToGrid, checkCollision, isValidPosition, updateWidgetPosition]);

  // Handle widget resize
  const handleWidgetResize = useCallback((
    widget: WidgetConfig,
    size: Size
  ) => {
    // Ensure minimum size constraints
    const constrainedSize = {
      w: Math.max(size.w, widget.minSize?.w || 1),
      h: Math.max(size.h, widget.minSize?.h || 1)
    };

    if (!checkCollision(widget, widget.position, constrainedSize)) {
      updateWidgetSize(widget.id, constrainedSize);
    }
  }, [checkCollision, updateWidgetSize]);

  // Cosmic UI theme variables
  const cosmicThemeVars = useMemo(() => ({
    '--cosmic-primary': theme.colors.primary,
    '--cosmic-secondary': theme.colors.secondary,
    '--cosmic-accent': theme.colors.accent,
    '--cosmic-background': theme.colors.background,
    '--cosmic-surface': theme.colors.surface,
    '--cosmic-grid-glow': theme.effects.glow ? theme.colors.primary + '40' : 'transparent',
  }), [theme]);

  return (
    <div
      ref={parentRef}
      className={`dashboard-grid cosmic-grid ${className}`}
      style={cosmicThemeVars as React.CSSProperties}
      data-edit-mode={editMode}
    >
      {/* Grid Overlay (visible in edit mode) */}
      {editMode && (
        <motion.div
          className="grid-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(
                to right, 
                var(--cosmic-grid-glow) 1px, 
                transparent 1px
              ),
              linear-gradient(
                to bottom, 
                var(--cosmic-grid-glow) 1px, 
                transparent 1px
              )
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}

      {/* Virtualized Widget Container */}
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        <AnimatePresence mode="popLayout">
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const widget = widgets[virtualItem.index];
            
            if (!widget) return null;

            return (
              <motion.div
                key={widget.id}
                layoutId={widget.id}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: `translateY(${virtualItem.start}px)`,
                  zIndex: 2,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{
                  type: "spring",
                  damping: 20,
                  stiffness: 300
                }}
              >
                <DraggableWidget
                  widget={widget}
                  editMode={editMode}
                  onDrag={(position) => handleWidgetDrag(widget, position)}
                  onResize={(size) => handleWidgetResize(widget, size)}
                  onRemove={() => removeWidget(widget.id)}
                  gridSize={gridSize}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Cosmic UI Background Effects */}
      {theme.effects.particles && (
        <div className="cosmic-particles" aria-hidden="true">
          {/* Particle system implementation */}
        </div>
      )}
      
      {theme.effects.scanlines && (
        <div 
          className="cosmic-scanlines" 
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              ${theme.colors.primary}08 2px,
              ${theme.colors.primary}08 4px
            )`,
            pointerEvents: 'none',
            zIndex: 10
          }}
        />
      )}
    </div>
  );
};

// CSS-in-JS styles for Cosmic UI integration
const cosmicGridStyles = `
  .cosmic-grid {
    background: radial-gradient(
      circle at 50% 50%,
      var(--cosmic-primary)10 0%,
      transparent 50%
    );
    border-radius: 8px;
    position: relative;
    overflow: auto;
    min-height: 100vh;
  }

  .cosmic-grid[data-edit-mode="true"] {
    border: 2px solid var(--cosmic-accent);
    box-shadow: 
      0 0 20px var(--cosmic-accent)40,
      inset 0 0 20px var(--cosmic-background)80;
  }

  .cosmic-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="1" fill="white" opacity="0.5"/><circle cx="80" cy="40" r="0.5" fill="white" opacity="0.3"/><circle cx="40" cy="70" r="0.8" fill="white" opacity="0.4"/></svg>') repeat;
    animation: particle-float 20s linear infinite;
  }

  @keyframes particle-float {
    0% { transform: translateY(0px); }
    100% { transform: translateY(-100px); }
  }

  .dashboard-grid::-webkit-scrollbar {
    width: 8px;
  }

  .dashboard-grid::-webkit-scrollbar-track {
    background: var(--cosmic-surface);
    border-radius: 4px;
  }

  .dashboard-grid::-webkit-scrollbar-thumb {
    background: var(--cosmic-accent);
    border-radius: 4px;
    box-shadow: 0 0 10px var(--cosmic-accent)60;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = cosmicGridStyles;
  document.head.appendChild(styleSheet);
}

export default DashboardGrid; 