/**
 * DragPreview - Visual preview during widget dragging
 * Shows ghost outline and position feedback
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Position, Size, SciFiTheme } from '@types';

interface DragPreviewProps {
  position: Position;
  size: Size;
  gridSize: number;
  theme: SciFiTheme;
  isValidDrop?: boolean;
}

export const DragPreview: React.FC<DragPreviewProps> = memo(({
  position,
  size,
  gridSize,
  theme,
  isValidDrop = true
}) => {
  const width = size.w * gridSize;
  const height = size.h * gridSize;
  
  const previewColor = isValidDrop ? theme.colors.success : theme.colors.danger;
  
  return (
    <motion.div
      className="drag-preview"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 0.7, 
        scale: 1,
        x: position.x,
        y: position.y
      }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      style={{
        position: 'absolute',
        width,
        height,
        border: `2px dashed ${previewColor}`,
        borderRadius: 8,
        backgroundColor: `${previewColor}20`,
        pointerEvents: 'none',
        zIndex: 1000,
        backdropFilter: 'blur(2px)'
      }}
    >
      {/* Corner indicators */}
      {[
        { className: 'top-left', style: { top: -4, left: -4 } },
        { className: 'top-right', style: { top: -4, right: -4 } },
        { className: 'bottom-left', style: { bottom: -4, left: -4 } },
        { className: 'bottom-right', style: { bottom: -4, right: -4 } }
      ].map(({ className, style }) => (
        <div
          key={className}
          className={`corner-indicator ${className}`}
          style={{
            position: 'absolute',
            width: 8,
            height: 8,
            backgroundColor: previewColor,
            borderRadius: '50%',
            boxShadow: `0 0 8px ${previewColor}`,
            ...style
          }}
        />
      ))}
      
      {/* Center cross indicator */}
      <div
        className="center-indicator"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 16,
          height: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            width: 12,
            height: 2,
            backgroundColor: previewColor,
            position: 'absolute'
          }}
        />
        <div
          style={{
            width: 2,
            height: 12,
            backgroundColor: previewColor,
            position: 'absolute'
          }}
        />
      </div>
      
      {/* Grid alignment indicators */}
      {Array.from({ length: size.w + 1 }).map((_, i) => (
        <div
          key={`v-${i}`}
          style={{
            position: 'absolute',
            left: i * gridSize,
            top: 0,
            bottom: 0,
            width: 1,
            backgroundColor: `${previewColor}40`,
            opacity: 0.5
          }}
        />
      ))}
      
      {Array.from({ length: size.h + 1 }).map((_, i) => (
        <div
          key={`h-${i}`}
          style={{
            position: 'absolute',
            top: i * gridSize,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: `${previewColor}40`,
            opacity: 0.5
          }}
        />
      ))}
    </motion.div>
  );
});

DragPreview.displayName = 'DragPreview';

export default DragPreview;