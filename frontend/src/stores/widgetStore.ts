/**
 * Widget store for managing widget registry and presets
 * Handles widget creation, deletion, and preset management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WidgetConfig, WidgetPreset, WidgetType } from '@types/widget';

interface WidgetState {
  widgets: WidgetConfig[];
  presets: WidgetPreset[];
  selectedWidget: string | null;
  
  // Widget management
  addWidget: (widget: WidgetConfig) => void;
  updateWidget: (id: string, updates: Partial<WidgetConfig>) => void;
  removeWidget: (id: string) => void;
  selectWidget: (id: string | null) => void;
  
  // Preset management
  addPreset: (preset: WidgetPreset) => void;
  removePreset: (id: string) => void;
  applyPreset: (presetId: string, position: { x: number; y: number }) => WidgetConfig | null;
  
  // Utility methods
  getWidget: (id: string) => WidgetConfig | undefined;
  getWidgetsByType: (type: WidgetType) => WidgetConfig[];
  duplicateWidget: (id: string) => void;
  exportWidgets: () => string;
  importWidgets: (data: string) => boolean;
}

const DEFAULT_PRESETS: WidgetPreset[] = [
  {
    id: 'cpu-usage-gauge',
    name: 'CPU Usage Gauge',
    type: 'gauge',
    description: 'Real-time CPU usage gauge',
    config: {
      sensorPath: 'cpu.usage',
      size: { w: 4, h: 4 },
      minSize: { w: 3, h: 3 },
      theme: 'cyberpunk',
      title: 'CPU Usage',
      gaugeConfig: {
        min: 0,
        max: 100,
        unit: '%',
        showValue: true,
        showMinMax: false,
        thickness: 8,
        showTicks: true,
        tickCount: 5,
        gradient: true,
        glowEffect: true
      }
    },
    thumbnail: '',
    tags: ['cpu', 'performance', 'gauge'],
    created: Date.now()
  },
  {
    id: 'gpu-temp-simple',
    name: 'GPU Temperature',
    type: 'simple',
    description: 'Simple GPU temperature display',
    config: {
      sensorPath: 'gpu.0.temperature',
      size: { w: 3, h: 2 },
      minSize: { w: 2, h: 1 },
      theme: 'neon',
      title: 'GPU Temp',
      simpleConfig: {
        fontSize: 'auto',
        unit: '°C',
        precision: 1,
        showIcon: true,
        displayMode: 'large'
      }
    },
    thumbnail: '',
    tags: ['gpu', 'temperature', 'simple'],
    created: Date.now()
  }
];

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set, get) => ({
      widgets: [],
      presets: DEFAULT_PRESETS,
      selectedWidget: null,

      addWidget: (widget) => {
        set((state) => ({
          widgets: [...state.widgets, widget]
        }));
      },

      updateWidget: (id, updates) => {
        set((state) => ({
          widgets: state.widgets.map((widget) =>
            widget.id === id ? { ...widget, ...updates, modified: Date.now() } : widget
          )
        }));
      },

      removeWidget: (id) => {
        set((state) => ({
          widgets: state.widgets.filter((widget) => widget.id !== id),
          selectedWidget: state.selectedWidget === id ? null : state.selectedWidget
        }));
      },

      selectWidget: (id) => {
        set({ selectedWidget: id });
      },

      addPreset: (preset) => {
        set((state) => ({
          presets: [...state.presets, preset]
        }));
      },

      removePreset: (id) => {
        set((state) => ({
          presets: state.presets.filter((preset) => preset.id !== id)
        }));
      },

      applyPreset: (presetId, position) => {
        const preset = get().presets.find(p => p.id === presetId);
        if (!preset) return null;

        const widget: WidgetConfig = {
          id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: preset.type,
          title: preset.config.title,
          sensorPath: preset.config.sensorPath,
          position,
          size: preset.config.size,
          minSize: preset.config.minSize,
          theme: preset.config.theme,
          alerts: [],
          created: Date.now(),
          modified: Date.now(),
          ...preset.config
        };

        get().addWidget(widget);
        return widget;
      },

      getWidget: (id) => {
        return get().widgets.find((widget) => widget.id === id);
      },

      getWidgetsByType: (type) => {
        return get().widgets.filter((widget) => widget.type === type);
      },

      duplicateWidget: (id) => {
        const widget = get().getWidget(id);
        if (!widget) return;

        const duplicated: WidgetConfig = {
          ...widget,
          id: `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: `${widget.title} (Copy)`,
          position: {
            x: widget.position.x + 1,
            y: widget.position.y + 1
          },
          created: Date.now(),
          modified: Date.now()
        };

        get().addWidget(duplicated);
      },

      exportWidgets: () => {
        const { widgets } = get();
        return JSON.stringify({
          version: '1.0.0',
          timestamp: Date.now(),
          widgets
        }, null, 2);
      },

      importWidgets: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.widgets || !Array.isArray(parsed.widgets)) {
            return false;
          }

          // Validate widget structure
          const validWidgets = parsed.widgets.filter((widget: any) => 
            widget.id && widget.type && widget.sensorPath && widget.position && widget.size
          );

          if (validWidgets.length === 0) {
            return false;
          }

          set((state) => ({
            widgets: [...state.widgets, ...validWidgets]
          }));

          return true;
        } catch (error) {
          console.error('Failed to import widgets:', error);
          return false;
        }
      }
    }),
    {
      name: 'widget-store',
      version: 1
    }
  )
);

export default useWidgetStore;