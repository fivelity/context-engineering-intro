/**
 * WidgetToolbar - Individual widget editing toolbar
 * Provides widget-specific actions and controls
 */

import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SciFiTheme } from '@types';

interface WidgetToolbarProps {
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  theme: SciFiTheme;
  actions: string[];
  onAction: (action: string) => void;
  visible?: boolean;
}

export const WidgetToolbar: React.FC<WidgetToolbarProps> = memo(({
  position,
  theme,
  actions,
  onAction,
  visible = true
}) => {
  // Position styles
  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute' as const,
      zIndex: 100
    };

    switch (position) {
      case 'top-left':
        return { ...baseStyles, top: -8, left: -8 };
      case 'top-right':
        return { ...baseStyles, top: -8, right: -8 };
      case 'bottom-left':
        return { ...baseStyles, bottom: -8, left: -8 };
      case 'bottom-right':
        return { ...baseStyles, bottom: -8, right: -8 };
      default:
        return { ...baseStyles, top: -8, right: -8 };
    }
  };

  // Action icons and labels
  const actionConfig = {
    configure: { icon: '⚙', label: 'Configure Widget' },
    duplicate: { icon: '📋', label: 'Duplicate Widget' },
    remove: { icon: '🗑', label: 'Remove Widget' },
    edit: { icon: '✎', label: 'Edit Widget' },
    info: { icon: 'ℹ', label: 'Widget Info' },
    lock: { icon: '🔒', label: 'Lock Widget' },
    unlock: { icon: '🔓', label: 'Unlock Widget' },
    resize: { icon: '↔', label: 'Resize Widget' },
    move: { icon: '✥', label: 'Move Widget' }
  };

  // Animation variants
  const toolbarVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      x: position.includes('right') ? 20 : -20,
      y: position.includes('bottom') ? 20 : -20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.2,
        staggerChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.15 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.15 }
    },
    hover: {
      scale: 1.1,
      boxShadow: `0 0 8px ${theme.colors.primary}`,
      transition: { duration: 0.1 }
    },
    tap: { scale: 0.9 }
  };

  const handleAction = (action: string) => {
    onAction(action);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="widget-toolbar"
          variants={toolbarVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={getPositionStyles()}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: position.includes('top') ? 'row' : 'row-reverse',
              gap: 4,
              padding: 4,
              backgroundColor: `${theme.colors.surface}F0`,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: 6,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 2px 8px ${theme.colors.background}60`
            }}
          >
            {actions.map((action) => {
              const config = actionConfig[action as keyof typeof actionConfig];
              if (!config) return null;

              const getActionColor = () => {
                switch (action) {
                  case 'remove':
                    return theme.colors.danger;
                  case 'configure':
                  case 'edit':
                    return theme.colors.primary;
                  default:
                    return theme.colors.secondary;
                }
              };

              return (
                <motion.button
                  key={action}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleAction(action)}
                  title={config.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    backgroundColor: `${getActionColor()}20`,
                    border: `1px solid ${getActionColor()}60`,
                    borderRadius: 4,
                    color: getActionColor(),
                    cursor: 'pointer',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {config.icon}
                </motion.button>
              );
            })}
          </div>

          {/* Connector line to widget */}
          <div
            style={{
              position: 'absolute',
              width: 2,
              height: 8,
              backgroundColor: theme.colors.border,
              ...(position === 'top-left' && { 
                bottom: -8, 
                left: 8 
              }),
              ...(position === 'top-right' && { 
                bottom: -8, 
                right: 8 
              }),
              ...(position === 'bottom-left' && { 
                top: -8, 
                left: 8 
              }),
              ...(position === 'bottom-right' && { 
                top: -8, 
                right: 8 
              })
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

WidgetToolbar.displayName = 'WidgetToolbar';

export default WidgetToolbar;