/**
 * SelectionBox - Area selection rectangle for multi-select
 * Provides visual feedback during area selection
 */

import React, { memo, useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Position, SciFiTheme } from '@types';

interface SelectionBoxProps {
  startPosition: Position;
  theme: SciFiTheme;
  onSelectionChange?: (bounds: { x: number; y: number; width: number; height: number }) => void;
}

export const SelectionBox: React.FC<SelectionBoxProps> = memo(({
  startPosition,
  theme,
  onSelectionChange
}) => {
  const [currentPosition, setCurrentPosition] = useState<Position>(startPosition);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate selection bounds
  const bounds = {
    x: Math.min(startPosition.x, currentPosition.x),
    y: Math.min(startPosition.y, currentPosition.y),
    width: Math.abs(currentPosition.x - startPosition.x),
    height: Math.abs(currentPosition.y - startPosition.y)
  };

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      setCurrentPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Notify parent of selection changes
  useEffect(() => {
    onSelectionChange?.(bounds);
  }, [bounds, onSelectionChange]);

  return (
    <div ref={containerRef} className="selection-box-container">
      <motion.div
        className="selection-box"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'absolute',
          left: bounds.x,
          top: bounds.y,
          width: bounds.width,
          height: bounds.height,
          border: `2px solid ${theme.colors.primary}`,
          backgroundColor: `${theme.colors.primary}20`,
          borderRadius: 4,
          pointerEvents: 'none',
          zIndex: 500,
          backdropFilter: 'blur(1px)'
        }}
      >
        {/* Corner decorations */}
        {bounds.width > 20 && bounds.height > 20 && (
          <>
            {[
              { className: 'top-left', style: { top: -2, left: -2 } },
              { className: 'top-right', style: { top: -2, right: -2 } },
              { className: 'bottom-left', style: { bottom: -2, left: -2 } },
              { className: 'bottom-right', style: { bottom: -2, right: -2 } }
            ].map(({ className, style }) => (
              <div
                key={className}
                className={`selection-corner ${className}`}
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  border: `2px solid ${theme.colors.primary}`,
                  backgroundColor: theme.colors.background,
                  ...style
                }}
              />
            ))}
          </>
        )}
        
        {/* Selection info */}
        {bounds.width > 50 && bounds.height > 30 && (
          <div
            className="selection-info"
            style={{
              position: 'absolute',
              top: 4,
              left: 4,
              fontSize: '10px',
              color: theme.colors.primary,
              backgroundColor: `${theme.colors.background}CC`,
              padding: '2px 4px',
              borderRadius: 2,
              fontWeight: 'bold'
            }}
          >
            {Math.round(bounds.width)} × {Math.round(bounds.height)}
          </div>
        )}
      </motion.div>
    </div>
  );
});

SelectionBox.displayName = 'SelectionBox';

export default SelectionBox;