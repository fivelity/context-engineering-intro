/**
 * Widget Library exports
 * Complete sci-fi themed widget collection for SenseCanvas
 */

export { default as WidgetRenderer } from './WidgetRenderer';
export { default as GaugeWidget } from './GaugeWidget';
export { default as GraphWidget } from './GraphWidget';
export { default as SimpleWidget } from './SimpleWidget';
export { default as MeterWidget } from './MeterWidget';
export { default as MultiResourceWidget } from './MultiResourceWidget';

// Re-export with descriptive aliases
export {
  WidgetRenderer as UniversalWidgetRenderer,
  GaugeWidget as SciFiGauge,
  GraphWidget as RealtimeChart,
  SimpleWidget as ValueDisplay,
  MeterWidget as ProgressMeter,
  MultiResourceWidget as ResourceMonitor
};

// Widget type registry
export const WIDGET_TYPES = {
  gauge: 'GaugeWidget',
  graph: 'GraphWidget', 
  simple: 'SimpleWidget',
  meter: 'MeterWidget',
  'multi-resource': 'MultiResourceWidget'
} as const;

export type WidgetType = keyof typeof WIDGET_TYPES;