/**
 * MultiResourceWidget - Display multiple sensor readings in a unified view
 * Perfect for showing CPU cores, GPU stats, or system overview
 */

import React, { memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WidgetConfig, SensorData, SciFiTheme, MultiResourceWidgetConfig } from '@types';

interface MultiResourceWidgetProps {
  widget: MultiResourceWidgetConfig;
  sensorData: SensorData;
  sensorValue: number | null;
  theme: SciFiTheme;
  onUpdate?: (updates: Partial<MultiResourceWidgetConfig>) => void;
}

interface ResourceItem {
  id: string;
  label: string;
  value: number | null;
  unit: string;
  path: string;
  color?: string;
  status: 'normal' | 'warning' | 'critical' | 'offline';
}

export const MultiResourceWidget: React.FC<MultiResourceWidgetProps> = memo(({
  widget,
  sensorData,
  sensorValue,
  theme,
  onUpdate
}) => {
  const {
    config: {
      displayMode = 'grid',
      showLabels = true,
      showValues = true,
      showBars = true,
      compactMode = false,
      maxItems = 8,
      sortBy = 'name',
      sortDirection = 'asc',
      colorCoding = true,
      animationDelay = 50,
      barHeight = 4,
      itemSpacing = 8
    },
    resources = [],
    unit = '%'
  } = widget;

  // Process and sort resource data
  const processedResources = useMemo(() => {
    const items: ResourceItem[] = resources.map(resource => {
      // Extract value from sensor data using path
      let value: number | null = null;
      try {
        const pathParts = resource.sensorPath.split('.');
        let current: any = sensorData;
        
        for (const part of pathParts) {
          if (current === null || current === undefined) break;
          
          if (!isNaN(Number(part))) {
            const index = Number(part);
            if (Array.isArray(current) && index < current.length) {
              current = current[index];
            } else {
              current = null;
              break;
            }
          } else {
            current = current[part];
          }
        }
        
        value = typeof current === 'number' ? current : null;
      } catch (error) {
        console.warn(`Failed to get value for path: ${resource.sensorPath}`, error);
      }

      // Determine status based on value and thresholds
      let status: ResourceItem['status'] = 'offline';
      if (value !== null) {
        if (resource.criticalThreshold && value >= resource.criticalThreshold) {
          status = 'critical';
        } else if (resource.warningThreshold && value >= resource.warningThreshold) {
          status = 'warning';
        } else {
          status = 'normal';
        }
      }

      return {
        id: resource.id,
        label: resource.label,
        value,
        unit: resource.unit || unit,
        path: resource.sensorPath,
        color: resource.color,
        status
      };
    });

    // Sort items
    const sortedItems = [...items].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.label.localeCompare(b.label);
          break;
        case 'value':
          const aVal = a.value ?? -1;
          const bVal = b.value ?? -1;
          comparison = aVal - bVal;
          break;
        case 'status':
          const statusOrder = { critical: 0, warning: 1, normal: 2, offline: 3 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });

    return sortedItems.slice(0, maxItems);
  }, [sensorData, resources, unit, sortBy, sortDirection, maxItems]);

  // Get status color
  const getStatusColor = (status: ResourceItem['status'], customColor?: string) => {
    if (customColor && colorCoding) return customColor;
    
    switch (status) {
      case 'critical':
        return theme.colors.danger;
      case 'warning':
        return theme.colors.warning;
      case 'normal':
        return theme.colors.success;
      case 'offline':
      default:
        return theme.colors.muted;
    }
  };

  // Calculate percentage for bar display
  const getPercentage = (value: number | null, resource: any) => {
    if (value === null) return 0;
    
    const min = resource.minValue || 0;
    const max = resource.maxValue || 100;
    
    return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  };

  // Render single resource item
  const renderResourceItem = (resource: ResourceItem, index: number) => {
    const statusColor = getStatusColor(resource.status, resource.color);
    const percentage = getPercentage(resource.value, resources.find(r => r.id === resource.id));
    
    return (
      <motion.div
        key={resource.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ 
          duration: 0.3, 
          delay: index * animationDelay / 1000,
          ease: 'easeOut'
        }}
        className="resource-item"
        style={{
          display: 'flex',
          flexDirection: compactMode ? 'row' : 'column',
          alignItems: compactMode ? 'center' : 'stretch',
          justifyContent: 'space-between',
          padding: compactMode ? '4px 8px' : '8px 12px',
          backgroundColor: `${theme.colors.surface}40`,
          border: `1px solid ${theme.colors.border}30`,
          borderRadius: 6,
          marginBottom: itemSpacing,
          transition: 'all 0.2s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Status indicator */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 3,
            backgroundColor: statusColor,
            boxShadow: `0 0 6px ${statusColor}`
          }}
        />

        {/* Label */}
        {showLabels && (
          <div
            style={{
              fontSize: compactMode ? '11px' : '12px',
              color: theme.colors.text,
              fontWeight: 500,
              marginBottom: compactMode ? 0 : 4,
              marginLeft: 8,
              flex: compactMode ? 1 : 'none'
            }}
          >
            {resource.label}
          </div>
        )}

        {/* Value */}
        {showValues && (
          <div
            style={{
              fontSize: compactMode ? '12px' : '14px',
              fontWeight: 'bold',
              color: statusColor,
              fontFamily: 'monospace',
              marginLeft: compactMode ? 8 : 8,
              textAlign: compactMode ? 'right' : 'left'
            }}
          >
            {resource.value !== null ? `${resource.value.toFixed(1)}${resource.unit}` : '--'}
          </div>
        )}

        {/* Progress bar */}
        {showBars && resource.value !== null && (
          <div
            style={{
              marginTop: compactMode ? 0 : 6,
              marginLeft: compactMode ? 8 : 8,
              height: barHeight,
              backgroundColor: `${theme.colors.border}30`,
              borderRadius: barHeight / 2,
              overflow: 'hidden',
              flex: compactMode ? 2 : 'none',
              position: 'relative'
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              style={{
                height: '100%',
                backgroundColor: statusColor,
                borderRadius: barHeight / 2,
                boxShadow: `0 0 4px ${statusColor}40`
              }}
            />
          </div>
        )}

        {/* Hover glow effect */}
        <motion.div
          className="hover-glow"
          whileHover={{
            opacity: 0.1,
            scale: 1.02
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle, ${statusColor}, transparent 70%)`,
            opacity: 0,
            pointerEvents: 'none',
            borderRadius: 6
          }}
        />
      </motion.div>
    );
  };

  // Render grid layout
  const renderGridLayout = () => {
    const columns = Math.ceil(Math.sqrt(processedResources.length));
    
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: itemSpacing,
          height: '100%'
        }}
      >
        <AnimatePresence mode="popLayout">
          {processedResources.map((resource, index) => renderResourceItem(resource, index))}
        </AnimatePresence>
      </div>
    );
  };

  // Render list layout
  const renderListLayout = () => {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          height: '100%',
          overflowY: 'auto'
        }}
      >
        <AnimatePresence mode="popLayout">
          {processedResources.map((resource, index) => renderResourceItem(resource, index))}
        </AnimatePresence>
      </div>
    );
  };

  // Summary statistics
  const summaryStats = useMemo(() => {
    const onlineResources = processedResources.filter(r => r.value !== null);
    const criticalCount = processedResources.filter(r => r.status === 'critical').length;
    const warningCount = processedResources.filter(r => r.status === 'warning').length;
    const averageValue = onlineResources.length > 0 
      ? onlineResources.reduce((sum, r) => sum + (r.value || 0), 0) / onlineResources.length 
      : 0;

    return {
      total: processedResources.length,
      online: onlineResources.length,
      critical: criticalCount,
      warning: warningCount,
      average: averageValue
    };
  }, [processedResources]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      className="multi-resource-widget"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        width: '100%',
        height: '100%',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}
    >
      {/* Header with summary */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 12px',
          backgroundColor: `${theme.colors.surface}60`,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: 6
        }}
      >
        <div style={{ fontSize: '12px', color: theme.colors.text, fontWeight: 600 }}>
          {widget.title} ({summaryStats.online}/{summaryStats.total})
        </div>
        
        <div style={{ display: 'flex', gap: 8, fontSize: '10px' }}>
          {summaryStats.critical > 0 && (
            <span style={{ color: theme.colors.danger }}>
              ⚠ {summaryStats.critical}
            </span>
          )}
          {summaryStats.warning > 0 && (
            <span style={{ color: theme.colors.warning }}>
              ⚡ {summaryStats.warning}
            </span>
          )}
          <span style={{ color: theme.colors.textSecondary }}>
            Avg: {summaryStats.average.toFixed(1)}{unit}
          </span>
        </div>
      </motion.div>

      {/* Resource items */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {displayMode === 'grid' ? renderGridLayout() : renderListLayout()}
      </div>

      {/* No data state */}
      {processedResources.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: theme.colors.textSecondary,
            fontSize: '14px',
            textAlign: 'center'
          }}
        >
          No resources configured
        </motion.div>
      )}
    </motion.div>
  );
});

MultiResourceWidget.displayName = 'MultiResourceWidget';

export default MultiResourceWidget;