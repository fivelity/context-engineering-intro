/**
 * Complete Drag & Drop System Integration
 * Combines all drag/drop functionality with grid system
 */

import React, { useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWidgetGrid, useTheme } from '@hooks';
import { DragDropProvider, DraggableWidget } from './DragDropProvider';
import { EnhancedDraggableWidget } from './DragDropEnhanced';
import { WidgetRenderer } from './widgets/WidgetRenderer';
import { WidgetConfig } from '@types';

interface DragDropSystemProps {
  widgets: WidgetConfig[];
  editMode: boolean;
  onWidgetUpdate: (id: string, updates: Partial<WidgetConfig>) => void;
  onWidgetRemove: (id: string) => void;
  onWidgetSelect: (id: string, multiSelect?: boolean) => void;
}

export const DragDropSystem: React.FC<DragDropSystemProps> = ({
  widgets,
  editMode,
  onWidgetUpdate,
  onWidgetRemove,
  onWidgetSelect
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [dragMode, setDragMode] = useState<'simple' | 'enhanced'>('enhanced');
  const { currentTheme } = useTheme();
  
  const {
    gridSize,
    selectedWidgetIds,
    updateWidgetPosition,
    updateWidgetSize
  } = useWidgetGrid();

  const handleDragStart = useCallback((widget: WidgetConfig) => {
    onWidgetSelect(widget.id);
  }, [onWidgetSelect]);

  const handleDragEnd = useCallback(() => {
    // Drag end logic is handled in individual draggable components
  }, []);

  const renderDraggableWidget = useCallback((widget: WidgetConfig) => {
    const DraggableComponent = dragMode === 'enhanced' 
      ? EnhancedDraggableWidget 
      : DraggableWidget;

    return (
      <DraggableComponent
        key={widget.id}
        widget={widget}
        disabled={!editMode}
        onDragStart={() => handleDragStart(widget)}
        onDragEnd={handleDragEnd}
        magneticSnap={true}
        collisionAvoidance={true}
        multiSelect={true}
        onSnapToPosition={(position) => {
          updateWidgetPosition(widget.id, position);
        }}
        onCollision={(collidingWidgets) => {
          console.log('Collision detected with:', collidingWidgets);
        }}
      >
        <WidgetRenderer
          widget={widget}
          sensorData={{}} // Will be provided by sensor store
          isSelected={selectedWidgetIds.includes(widget.id)}
          isEditing={editMode}
          enableResize={editMode}
          theme={currentTheme}
          onUpdate={(updates) => onWidgetUpdate(widget.id, updates)}
          onRemove={() => onWidgetRemove(widget.id)}
          onDuplicate={() => {
            // Handle duplication
            const duplicatedWidget = {
              ...widget,
              id: `${widget.id}-copy-${Date.now()}`,
              position: {
                x: widget.position.x + gridSize,
                y: widget.position.y + gridSize
              },
              title: `${widget.title} (Copy)`
            };
            // This would trigger adding a new widget
          }}
        />
      </DraggableComponent>
    );
  }, [
    dragMode,
    editMode,
    selectedWidgetIds,
    currentTheme,
    gridSize,
    handleDragStart,
    handleDragEnd,
    updateWidgetPosition,
    onWidgetUpdate,
    onWidgetRemove,
    onWidgetSelect
  ]);

  return (
    <DragDropProvider gridSize={gridSize} snapToGrid={true}>
      <div
        ref={gridRef}
        className="drag-drop-system"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Drag mode toggle for development */}
        {process.env.NODE_ENV === 'development' && (
          <div
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1000,
              display: 'flex',
              gap: 8,
              padding: '4px 8px',
              backgroundColor: `${currentTheme.colors.surface}E6`,
              borderRadius: 4,
              border: `1px solid ${currentTheme.colors.border}`
            }}
          >
            <button
              onClick={() => setDragMode('simple')}
              style={{
                padding: '4px 8px',
                backgroundColor: dragMode === 'simple' ? currentTheme.colors.primary : 'transparent',
                color: dragMode === 'simple' ? currentTheme.colors.background : currentTheme.colors.text,
                border: 'none',
                borderRadius: 2,
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Simple
            </button>
            <button
              onClick={() => setDragMode('enhanced')}
              style={{
                padding: '4px 8px',
                backgroundColor: dragMode === 'enhanced' ? currentTheme.colors.primary : 'transparent',
                color: dragMode === 'enhanced' ? currentTheme.colors.background : currentTheme.colors.text,
                border: 'none',
                borderRadius: 2,
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              Enhanced
            </button>
          </div>
        )}

        {/* Widget containers */}
        <AnimatePresence mode="popLayout">
          {widgets.map(renderDraggableWidget)}
        </AnimatePresence>

        {/* Drop zones indicator */}
        {editMode && (
          <motion.div
            className="drop-zones"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                ${currentTheme.colors.primary}10 10px,
                ${currentTheme.colors.primary}10 20px
              )`,
              pointerEvents: 'none',
              zIndex: 0
            }}
          />
        )}
      </div>
    </DragDropProvider>
  );
};

export default DragDropSystem;