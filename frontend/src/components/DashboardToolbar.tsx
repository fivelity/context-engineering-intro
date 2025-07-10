/**
 * DashboardToolbar - Main dashboard toolbar with controls and status
 * Sci-fi themed with animations and comprehensive functionality
 */

import React, { memo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSciFiTheme } from './sci-fi/SciFiThemeProvider';
import SciFiThemeToggle from './sci-fi/SciFiThemeToggle';
import SciFiFrame from './sci-fi/SciFiFrame';
import { useWidgetStore } from '@stores/widgetStore';
import { ConnectionStatus } from '@types';

interface DashboardToolbarProps {
  onCreateWidget: () => void;
  connectionStatus: ConnectionStatus;
  selectedCount: number;
  totalWidgets: number;
}

interface ToolbarButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

const ToolbarButton: React.FC<ToolbarButtonProps> = memo(({
  onClick,
  icon,
  label,
  active = false,
  disabled = false,
  variant = 'secondary'
}) => {
  const { currentTheme } = useSciFiTheme();
  
  const getVariantColor = () => {
    switch (variant) {
      case 'primary': return currentTheme.colors.primary;
      case 'success': return currentTheme.colors.success;
      case 'warning': return currentTheme.colors.warning;
      case 'danger': return currentTheme.colors.danger;
      default: return currentTheme.colors.textSecondary;
    }
  };

  const variantColor = getVariantColor();

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.05, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        border: `1px solid ${active ? variantColor : currentTheme.colors.border}`,
        borderRadius: currentTheme.effects.borderRadius,
        backgroundColor: active 
          ? `${variantColor}20` 
          : disabled 
            ? `${currentTheme.colors.muted}10`
            : 'transparent',
        color: disabled ? currentTheme.colors.muted : currentTheme.colors.text,
        fontSize: '13px',
        fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: active ? `0 0 12px ${variantColor}40` : 'none',
        opacity: disabled ? 0.5 : 1
      }}
    >
      <span style={{ 
        fontSize: '16px',
        color: active ? variantColor : 'inherit'
      }}>
        {icon}
      </span>
      <span>{label}</span>
    </motion.button>
  );
});

ToolbarButton.displayName = 'ToolbarButton';

export const DashboardToolbar: React.FC<DashboardToolbarProps> = memo(({
  onCreateWidget,
  connectionStatus,
  selectedCount,
  totalWidgets
}) => {
  const { currentTheme } = useSciFiTheme();
  const { 
    layoutMode, 
    setLayoutMode, 
    clearSelection, 
    deleteSelected,
    exportLayout,
    importLayout,
    resetLayout
  } = useWidgetStore();
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleLayoutModeToggle = () => {
    setLayoutMode(layoutMode === 'view' ? 'edit' : 'view');
    if (layoutMode === 'edit') {
      clearSelection();
    }
  };

  const handleExportLayout = async () => {
    try {
      const layout = exportLayout();
      const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-layout-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting layout:', error);
    }
  };

  const handleImportLayout = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const layout = JSON.parse(text);
          importLayout(layout);
        } catch (error) {
          console.error('Error importing layout:', error);
        }
      }
    };
    input.click();
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return '🟢';
      case 'connecting': return '🟡';
      case 'error': return '🔴';
      default: return '⚪';
    }
  };

  const getConnectionLabel = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Disconnected';
      default: return 'Unknown';
    }
  };

  const toolbarVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  const advancedVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { 
      opacity: 1, 
      height: 'auto',
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  };

  return (
    <motion.div
      variants={toolbarVariants}
      initial="hidden"
      animate="visible"
    >
      <SciFiFrame
        frameType="angular"
        cornerCuts={[0, 0, 8, 8]}
        style={{
          backgroundColor: `${currentTheme.colors.surface}95`,
          backdropFilter: 'blur(8px)',
          borderBottom: `1px solid ${currentTheme.colors.border}`,
          padding: '12px 20px'
        }}
      >
        {/* Main Toolbar Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          {/* Left Section - Primary Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              marginRight: '8px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: currentTheme.colors.primary,
                borderRadius: '50%',
                boxShadow: `0 0 8px ${currentTheme.colors.primary}`
              }} />
              <h1 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 700,
                color: currentTheme.colors.text,
                marginLeft: '8px'
              }}>
                SenseCanvas
              </h1>
            </div>

            <div style={{
              width: '1px',
              height: '24px',
              backgroundColor: currentTheme.colors.border,
              margin: '0 8px'
            }} />

            <ToolbarButton
              onClick={onCreateWidget}
              icon="+"
              label="Add Widget"
              variant="primary"
            />

            <ToolbarButton
              onClick={handleLayoutModeToggle}
              icon={layoutMode === 'edit' ? '👁️' : '✏️'}
              label={layoutMode === 'edit' ? 'View Mode' : 'Edit Mode'}
              active={layoutMode === 'edit'}
              variant={layoutMode === 'edit' ? 'warning' : 'secondary'}
            />

            {selectedCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', gap: '8px' }}
              >
                <ToolbarButton
                  onClick={deleteSelected}
                  icon="🗑️"
                  label={`Delete (${selectedCount})`}
                  variant="danger"
                />
                
                <ToolbarButton
                  onClick={clearSelection}
                  icon="✖️"
                  label="Clear Selection"
                  variant="secondary"
                />
              </motion.div>
            )}
          </div>

          {/* Center Section - Status Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: '12px',
            color: currentTheme.colors.textSecondary
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{getConnectionIcon()}</span>
              <span>{getConnectionLabel()}</span>
            </div>
            
            <div>
              {totalWidgets} widgets
              {selectedCount > 0 && ` (${selectedCount} selected)`}
            </div>
          </div>

          {/* Right Section - Theme & Advanced Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ToolbarButton
              onClick={() => setShowAdvanced(!showAdvanced)}
              icon="⚙️"
              label="Tools"
              active={showAdvanced}
            />

            <div style={{
              width: '1px',
              height: '24px',
              backgroundColor: currentTheme.colors.border,
              margin: '0 8px'
            }} />

            <SciFiThemeToggle compact showLabels={false} />
          </div>
        </div>

        {/* Advanced Tools Row */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              variants={advancedVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={{
                borderTop: `1px solid ${currentTheme.colors.border}`,
                paddingTop: '12px',
                marginTop: '12px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <ToolbarButton
                    onClick={handleExportLayout}
                    icon="💾"
                    label="Export Layout"
                    disabled={totalWidgets === 0}
                  />
                  
                  <ToolbarButton
                    onClick={handleImportLayout}
                    icon="📁"
                    label="Import Layout"
                  />
                  
                  <ToolbarButton
                    onClick={resetLayout}
                    icon="🔄"
                    label="Reset Layout"
                    variant="warning"
                    disabled={totalWidgets === 0}
                  />
                </div>

                <div style={{
                  fontSize: '11px',
                  color: currentTheme.colors.textSecondary,
                  textAlign: 'right'
                }}>
                  <div>React 19+ • TanStack • Zustand</div>
                  <div>Real-time PC Sensor Dashboard</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SciFiFrame>
    </motion.div>
  );
});

DashboardToolbar.displayName = 'DashboardToolbar';
export default DashboardToolbar;