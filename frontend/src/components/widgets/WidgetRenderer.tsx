/**
 * WidgetRenderer - Universal widget rendering component
 * Dynamically renders different widget types with consistent styling and interactions
 */

import React, { memo, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { WidgetConfig, SensorData, SciFiTheme } from '@types';
import { ResizeHandles } from '../ui/ResizeHandles';
import { WidgetFrame } from '../ui/WidgetFrame';
import { WidgetToolbar } from '../ui/WidgetToolbar';

// Widget type imports (will be created in next step)
import { GaugeWidget } from './GaugeWidget';
import { GraphWidget } from './GraphWidget';
import { SimpleWidget } from './SimpleWidget';
import { MeterWidget } from './MeterWidget';
import { MultiResourceWidget } from './MultiResourceWidget';

interface WidgetRendererProps {
  widget: WidgetConfig;
  sensorData: SensorData;
  isSelected?: boolean;
  isEditing?: boolean;
  enableResize?: boolean;
  theme: SciFiTheme;
  onUpdate?: (updates: Partial<WidgetConfig>) => void;
  onRemove?: () => void;
  onDuplicate?: () => void;
  onConfigure?: () => void;
  onResizeStart?: (handle: string) => void;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = memo(({
  widget,
  sensorData,
  isSelected = false,
  isEditing = false,
  enableResize = false,
  theme,
  onUpdate,
  onRemove,
  onDuplicate,
  onConfigure,
  onResizeStart
}) => {
  // Animation variants
  const widgetVariants = {
    idle: {
      scale: 1,
      boxShadow: `0 0 0 0 ${theme.colors.primary}30`,
    },
    selected: {
      scale: 1.02,
      boxShadow: `0 0 20px 2px ${theme.colors.primary}80`,
      transition: { duration: 0.2 }
    },
    hover: {
      scale: 1.01,
      boxShadow: `0 0 15px 1px ${theme.colors.primary}40`,
      transition: { duration: 0.15 }
    }
  };

  // Get sensor value for the widget
  const sensorValue = useMemo(() => {
    if (!widget.sensorPath || !sensorData) return null;
    
    try {
      const pathParts = widget.sensorPath.split('.');
      let current: any = sensorData;
      
      for (const part of pathParts) {
        if (current === null || current === undefined) return null;
        
        // Handle array indices
        if (!isNaN(Number(part))) {
          const index = Number(part);
          if (Array.isArray(current) && index < current.length) {
            current = current[index];
          } else {
            return null;
          }
        } else {
          current = current[part];
        }
      }
      
      return typeof current === 'number' ? current : null;
    } catch (error) {
      console.warn(`Failed to get sensor value for path: ${widget.sensorPath}`, error);
      return null;
    }
  }, [widget.sensorPath, sensorData]);

  // Render the appropriate widget component
  const renderWidgetContent = useCallback(() => {
    const commonProps = {
      widget,
      sensorData,
      sensorValue,
      theme,
      onUpdate
    };

    switch (widget.type) {
      case 'gauge':
        return <GaugeWidget {...commonProps} />;
      case 'graph':
        return <GraphWidget {...commonProps} />;
      case 'simple':
        return <SimpleWidget {...commonProps} />;
      case 'meter':
        return <MeterWidget {...commonProps} />;
      case 'multi-resource':
        return <MultiResourceWidget {...commonProps} />;
      default:
        return (
          <div className="unknown-widget">
            <div className="error-message">
              Unknown widget type: {widget.type}
            </div>
          </div>
        );
    }
  }, [widget, sensorData, sensorValue, theme, onUpdate]);

  // Handle widget toolbar actions
  const handleToolbarAction = useCallback((action: string) => {
    switch (action) {
      case 'configure':
        onConfigure?.();
        break;
      case 'duplicate':
        onDuplicate?.();
        break;
      case 'remove':
        onRemove?.();
        break;
    }
  }, [onConfigure, onDuplicate, onRemove]);

  // Calculate widget status
  const widgetStatus = useMemo(() => {
    if (!widget.sensorPath) return 'configured';
    if (sensorValue === null) return 'no-data';
    
    // Check alerts
    if (widget.alerts && widget.alerts.length > 0) {
      for (const alert of widget.alerts) {
        if (sensorValue !== null) {
          const condition = alert.condition;
          const threshold = alert.threshold;
          
          switch (condition) {
            case 'greater_than':
              if (sensorValue > threshold) return alert.severity;
              break;
            case 'less_than':
              if (sensorValue < threshold) return alert.severity;
              break;
            case 'equals':
              if (sensorValue === threshold) return alert.severity;
              break;
            case 'not_equals':
              if (sensorValue !== threshold) return alert.severity;
              break;
          }
        }
      }
    }
    
    return 'normal';
  }, [widget.sensorPath, widget.alerts, sensorValue]);

  // Get status color
  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'critical':
        return theme.colors.danger;
      case 'warning':
        return theme.colors.warning;
      case 'no-data':
        return theme.colors.muted;
      case 'configured':
        return theme.colors.secondary;
      default:
        return theme.colors.success;
    }
  }, [theme.colors]);

  return (
    <motion.div
      className={`
        widget-renderer
        widget-${widget.type}
        status-${widgetStatus}
        ${isSelected ? 'selected' : ''}
        ${isEditing ? 'editing' : ''}
      `}
      variants={widgetVariants}
      initial="idle"
      animate={isSelected ? 'selected' : 'idle'}
      whileHover={!isSelected ? 'hover' : undefined}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        borderRadius: theme.effects?.borderRadius || 8,
        overflow: 'hidden'
      }}
    >
      {/* Widget frame with sci-fi styling */}
      <WidgetFrame
        theme={theme}
        status={widgetStatus}
        statusColor={getStatusColor(widgetStatus)}
        isSelected={isSelected}
        title={widget.title}
        subtitle={widget.sensorPath}
      >
        {/* Widget content */}
        <div className="widget-content">
          {renderWidgetContent()}
        </div>

        {/* Widget overlay for editing mode */}
        {isEditing && isSelected && (
          <motion.div
            className="widget-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `${theme.colors.primary}10`,
              border: `2px solid ${theme.colors.primary}`,
              borderRadius: theme.effects?.borderRadius || 8,
              pointerEvents: 'none',
              zIndex: 10
            }}
          />
        )}

        {/* Widget toolbar for editing */}
        {isEditing && isSelected && (
          <WidgetToolbar
            position="top-right"
            theme={theme}
            onAction={handleToolbarAction}
            actions={['configure', 'duplicate', 'remove']}
          />
        )}

        {/* Resize handles */}
        {enableResize && isSelected && (
          <ResizeHandles
            theme={theme}
            onResizeStart={onResizeStart}
            minSize={widget.minSize}
            maxSize={widget.maxSize}
          />
        )}

        {/* Status indicator */}
        <div
          className="status-indicator"
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: getStatusColor(widgetStatus),
            boxShadow: `0 0 8px ${getStatusColor(widgetStatus)}`,
            zIndex: 20
          }}
        />

        {/* Loading overlay */}
        {sensorValue === null && widget.sensorPath && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `${theme.colors.background}CC`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 15
            }}
          >
            <div className="loading-spinner">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: 24,
                  height: 24,
                  border: `2px solid ${theme.colors.primary}`,
                  borderTop: '2px solid transparent',
                  borderRadius: '50%'
                }}
              />
            </div>
          </motion.div>
        )}

        {/* Error overlay */}
        {widgetStatus === 'critical' && (
          <motion.div
            className="error-overlay"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `${theme.colors.danger}20`,
              border: `1px solid ${theme.colors.danger}`,
              borderRadius: theme.effects?.borderRadius || 8,
              pointerEvents: 'none',
              zIndex: 12
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: theme.colors.danger,
                fontSize: '24px',
                fontWeight: 'bold'
              }}
            >
              ⚠
            </div>
          </motion.div>
        )}
      </WidgetFrame>
    </motion.div>
  );
});

WidgetRenderer.displayName = 'WidgetRenderer';

export default WidgetRenderer;