/**
 * UI Components exports
 * Centralized exports for all dashboard UI components
 */

export { default as GridBackground } from './GridBackground';
export { default as WidgetFrame } from './WidgetFrame';
export { default as ResizeHandles } from './ResizeHandles';
export { default as DragPreview } from './DragPreview';
export { default as SelectionBox } from './SelectionBox';
export { default as GridToolbar } from './GridToolbar';
export { default as WidgetToolbar } from './WidgetToolbar';

// Re-export with descriptive aliases
export {
  GridBackground as DashboardBackground,
  WidgetFrame as SciFiFrame,
  ResizeHandles as InteractiveResizeHandles,
  DragPreview as DragGhost,
  SelectionBox as AreaSelector,
  GridToolbar as DashboardToolbar,
  WidgetToolbar as WidgetActionMenu
};