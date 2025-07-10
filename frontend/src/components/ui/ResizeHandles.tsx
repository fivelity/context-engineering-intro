/**
 * ResizeHandles - Interactive resize handles for widgets
 * Provides corner and edge handles with visual feedback
 */

import React, { memo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { SciFiTheme, Size } from '@types';

interface ResizeHandlesProps {
  theme: SciFiTheme;
  onResizeStart?: (handle: string) => void;
  minSize?: Size;
  maxSize?: Size;
  showEdgeHandles?: boolean;
  handleSize?: number;
}

export const ResizeHandles: React.FC<ResizeHandlesProps> = memo(({
  theme,
  onResizeStart,
  minSize,
  maxSize,
  showEdgeHandles = true,
  handleSize = 8
}) => {
  const handleMouseDown = useCallback((handle: string) => {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onResizeStart?.(handle);
    };
  }, [onResizeStart]);

  // Handle variants for animations
  const handleVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.3,
      boxShadow: `0 0 8px ${theme.colors.primary}`,
      transition: { duration: 0.1 }
    }
  };

  // Common handle styles
  const baseHandleStyle = {
    position: 'absolute' as const,
    width: handleSize,
    height: handleSize,
    backgroundColor: theme.colors.primary,
    border: `1px solid ${theme.colors.background}`,
    borderRadius: 2,
    cursor: 'pointer',
    zIndex: 30,
    boxShadow: `0 0 4px ${theme.colors.primary}50`
  };

  // Corner handles
  const cornerHandles = [
    { 
      handle: 'nw', 
      style: { top: -handleSize/2, left: -handleSize/2 }, 
      cursor: 'nw-resize' 
    },
    { 
      handle: 'ne', 
      style: { top: -handleSize/2, right: -handleSize/2 }, 
      cursor: 'ne-resize' 
    },
    { 
      handle: 'sw', 
      style: { bottom: -handleSize/2, left: -handleSize/2 }, 
      cursor: 'sw-resize' 
    },
    { 
      handle: 'se', 
      style: { bottom: -handleSize/2, right: -handleSize/2 }, 
      cursor: 'se-resize' 
    }
  ];

  // Edge handles
  const edgeHandles = [
    { 
      handle: 'n', 
      style: { 
        top: -handleSize/2, 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: handleSize * 2,
        height: handleSize / 2
      }, 
      cursor: 'n-resize' 
    },
    { 
      handle: 's', 
      style: { 
        bottom: -handleSize/2, 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: handleSize * 2,
        height: handleSize / 2
      }, 
      cursor: 's-resize' 
    },
    { 
      handle: 'w', 
      style: { 
        left: -handleSize/2, 
        top: '50%', 
        transform: 'translateY(-50%)',
        width: handleSize / 2,
        height: handleSize * 2
      }, 
      cursor: 'w-resize' 
    },
    { 
      handle: 'e', 
      style: { 
        right: -handleSize/2, 
        top: '50%', 
        transform: 'translateY(-50%)',
        width: handleSize / 2,
        height: handleSize * 2
      }, 
      cursor: 'e-resize' 
    }
  ];

  const allHandles = [...cornerHandles, ...(showEdgeHandles ? edgeHandles : [])];

  return (
    <div className="resize-handles">
      {allHandles.map(({ handle, style, cursor }) => (
        <motion.div
          key={handle}
          className={`resize-handle resize-handle-${handle}`}
          variants={handleVariants}
          initial="hidden"
          animate="visible"
          whileHover="hover"
          style={{
            ...baseHandleStyle,
            ...style,
            cursor
          }}
          onMouseDown={handleMouseDown(handle)}
        >
          {/* Handle decoration for better visibility */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 2,
              height: 2,
              backgroundColor: theme.colors.background,
              borderRadius: '50%'
            }}
          />
        </motion.div>
      ))}

      {/* Resize indicator lines */}
      <div className="resize-indicators">
        {/* Corner indicator lines */}
        {cornerHandles.map(({ handle, style }) => (
          <div key={`indicator-${handle}`}>
            {/* Horizontal line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              style={{
                position: 'absolute',
                width: 12,
                height: 1,
                backgroundColor: theme.colors.primary,
                opacity: 0.6,
                ...((handle === 'nw' || handle === 'ne') && { top: 0 }),
                ...((handle === 'sw' || handle === 'se') && { bottom: 0 }),
                ...((handle === 'nw' || handle === 'sw') && { left: 0 }),
                ...((handle === 'ne' || handle === 'se') && { right: 0 })
              }}
            />
            {/* Vertical line */}
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              style={{
                position: 'absolute',
                width: 1,
                height: 12,
                backgroundColor: theme.colors.primary,
                opacity: 0.6,
                ...((handle === 'nw' || handle === 'ne') && { top: 0 }),
                ...((handle === 'sw' || handle === 'se') && { bottom: 0 }),
                ...((handle === 'nw' || handle === 'sw') && { left: 0 }),
                ...((handle === 'ne' || handle === 'se') && { right: 0 })
              }}
            />
          </div>
        ))}
      </div>

      {/* Size constraints indicator */}
      {(minSize || maxSize) && (
        <motion.div
          className="size-constraints-tooltip"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{
            position: 'absolute',
            bottom: -30,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '4px 8px',
            backgroundColor: `${theme.colors.surface}E6`,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: 4,
            fontSize: '10px',
            color: theme.colors.textSecondary,
            whiteSpace: 'nowrap',
            zIndex: 40,
            backdropFilter: 'blur(4px)'
          }}
        >
          {minSize && `Min: ${minSize.w}×${minSize.h}`}
          {minSize && maxSize && ' • '}
          {maxSize && `Max: ${maxSize.w}×${maxSize.h}`}
        </motion.div>
      )}

      {/* Active resize overlay */}
      <div
        className="resize-overlay"
        style={{
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          border: `2px dashed ${theme.colors.primary}50`,
          borderRadius: 6,
          pointerEvents: 'none',
          zIndex: 25
        }}
      />
    </div>
  );
});

ResizeHandles.displayName = 'ResizeHandles';

export default ResizeHandles;