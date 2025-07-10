/**
 * Components exports
 * Centralized exports for all React components
 */

// Main dashboard components
export { default as DashboardGrid } from './DashboardGrid';

// Widget components (will be implemented in next task)
export { default as WidgetRenderer } from './widgets/WidgetRenderer';

// UI components
export * from './ui';

// Re-export commonly used components
export {
  DashboardGrid as Dashboard,
  WidgetRenderer as Widget
};