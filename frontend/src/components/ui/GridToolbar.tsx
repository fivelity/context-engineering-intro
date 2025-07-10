/**
 * GridToolbar - Dashboard editing toolbar with controls
 * Provides editing tools, stats, and quick actions
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@hooks';

interface GridStats {
  totalWidgets: number;
  selectedWidgets: number;
  gridUtilization: number;
  averageWidgetSize: number;
}

interface GridToolbarProps {
  editMode: boolean;
  selectedCount: number;
  totalWidgets: number;
  gridStats: GridStats;
  isConnected: boolean;
  onEditModeToggle?: () => void;
  onAutoArrange?: () => void;
  onAddWidget?: () => void;
  onDeleteSelected?: () => void;
  onDuplicateSelected?: () => void;
  onClearSelection?: () => void;
  onExportLayout?: () => void;
  onImportLayout?: () => void;
  className?: string;
}

export const GridToolbar: React.FC<GridToolbarProps> = memo(({
  editMode,
  selectedCount,
  totalWidgets,
  gridStats,
  isConnected,
  onEditModeToggle,
  onAutoArrange,
  onAddWidget,
  onDeleteSelected,
  onDuplicateSelected,
  onClearSelection,
  onExportLayout,
  onImportLayout,
  className = ''
}) => {
  const { currentTheme } = useTheme();

  // Animation variants
  const toolbarVariants = {
    hidden: { y: -60, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const buttonVariants = {
    idle: { scale: 1 },
    hover: { 
      scale: 1.05,
      boxShadow: `0 0 8px ${currentTheme.colors.primary}40`,
      transition: { duration: 0.1 }
    },
    tap: { scale: 0.95 }
  };

  const iconButton = (
    icon: string, 
    label: string, 
    onClick?: () => void, 
    disabled = false,
    variant: 'primary' | 'secondary' | 'danger' = 'secondary'
  ) => {
    const getButtonColor = () => {
      switch (variant) {
        case 'primary': return currentTheme.colors.primary;
        case 'danger': return currentTheme.colors.danger;
        default: return currentTheme.colors.secondary;
      }
    };

    return (
      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover={!disabled ? "hover" : undefined}
        whileTap={!disabled ? "tap" : undefined}
        onClick={onClick}
        disabled={disabled}
        title={label}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          backgroundColor: disabled ? `${currentTheme.colors.muted}30` : `${getButtonColor()}20`,
          border: `1px solid ${disabled ? currentTheme.colors.muted : getButtonColor()}`,
          borderRadius: 6,
          color: disabled ? currentTheme.colors.muted : getButtonColor(),
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease'
        }}
      >
        {icon}
      </motion.button>
    );
  };

  const textButton = (
    text: string, 
    onClick?: () => void, 
    disabled = false,
    variant: 'primary' | 'secondary' | 'danger' = 'secondary'
  ) => {
    const getButtonColor = () => {
      switch (variant) {
        case 'primary': return currentTheme.colors.primary;
        case 'danger': return currentTheme.colors.danger;
        default: return currentTheme.colors.secondary;
      }
    };

    return (
      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover={!disabled ? "hover" : undefined}
        whileTap={!disabled ? "tap" : undefined}
        onClick={onClick}
        disabled={disabled}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: disabled ? `${currentTheme.colors.muted}30` : `${getButtonColor()}20`,
          border: `1px solid ${disabled ? currentTheme.colors.muted : getButtonColor()}`,
          borderRadius: 6,
          color: disabled ? currentTheme.colors.muted : getButtonColor(),
          cursor: disabled ? 'not-allowed' : 'pointer',
          fontSize: '12px',
          fontWeight: 600,
          transition: 'all 0.2s ease'
        }}
      >
        {text}
      </motion.button>
    );
  };

  const statBadge = (label: string, value: string | number, color = currentTheme.colors.textSecondary) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '4px 8px',
        borderRadius: 4,
        backgroundColor: `${currentTheme.colors.surface}60`,
        border: `1px solid ${currentTheme.colors.border}30`
      }}
    >
      <div style={{ fontSize: '10px', color: currentTheme.colors.textSecondary }}>
        {label}
      </div>
      <div style={{ fontSize: '12px', fontWeight: 'bold', color }}>
        {value}
      </div>
    </div>
  );

  return (
    <motion.div
      className={`grid-toolbar ${className}`}
      variants={toolbarVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 16px',
        backgroundColor: `${currentTheme.colors.surface}95`,
        border: `1px solid ${currentTheme.colors.border}`,
        borderRadius: 8,
        backdropFilter: 'blur(10px)',
        boxShadow: `0 4px 12px ${currentTheme.colors.background}40`,
        zIndex: 100
      }}
    >
      {/* Edit mode toggle */}
      <motion.button
        variants={buttonVariants}
        initial="idle"
        whileHover="hover"
        whileTap="tap"
        onClick={onEditModeToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px',
          backgroundColor: editMode ? currentTheme.colors.primary : `${currentTheme.colors.secondary}20`,
          border: `1px solid ${editMode ? currentTheme.colors.primary : currentTheme.colors.secondary}`,
          borderRadius: 6,
          color: editMode ? currentTheme.colors.background : currentTheme.colors.secondary,
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 600,
          gap: 8
        }}
      >
        <span>{editMode ? '✓' : '✎'}</span>
        {editMode ? 'Exit Edit' : 'Edit Mode'}
      </motion.button>

      {/* Divider */}
      <div 
        style={{ 
          width: 1, 
          height: 24, 
          backgroundColor: currentTheme.colors.border 
        }} 
      />

      {/* Edit tools (shown only in edit mode) */}
      {editMode && (
        <>
          {iconButton('＋', 'Add Widget', onAddWidget, false, 'primary')}
          {iconButton('⚡', 'Auto Arrange', onAutoArrange)}
          {iconButton('📤', 'Export Layout', onExportLayout)}
          {iconButton('📥', 'Import Layout', onImportLayout)}
          
          {/* Selection tools (shown only when widgets are selected) */}
          {selectedCount > 0 && (
            <>
              <div 
                style={{ 
                  width: 1, 
                  height: 24, 
                  backgroundColor: currentTheme.colors.border 
                }} 
              />
              {iconButton('📋', 'Duplicate Selected', onDuplicateSelected)}
              {iconButton('🗑', 'Delete Selected', onDeleteSelected, false, 'danger')}
              {iconButton('✖', 'Clear Selection', onClearSelection)}
            </>
          )}
        </>
      )}

      {/* Connection status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isConnected ? currentTheme.colors.success : currentTheme.colors.danger,
            boxShadow: `0 0 8px ${isConnected ? currentTheme.colors.success : currentTheme.colors.danger}`
          }}
        />
        <span style={{ fontSize: '12px', color: currentTheme.colors.textSecondary }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8 }}>
        {statBadge('Widgets', totalWidgets)}
        {selectedCount > 0 && statBadge('Selected', selectedCount, currentTheme.colors.primary)}
        {statBadge('Usage', `${Math.round(gridStats.gridUtilization * 100)}%`)}
      </div>
    </motion.div>
  );
});

GridToolbar.displayName = 'GridToolbar';

export default GridToolbar;