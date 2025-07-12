<!--
SenseCanvas Widget Library Tab Component
Preset widget library with categorized templates and search functionality.
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { createWidget, getWidgetIcon, getWidgetDescription } from '../widgets/index.js';
  import type { WidgetConfig } from '../../types/widgets.js';

  interface Props {
    onSelection: (widget: WidgetConfig) => void;
  }

  let { onSelection }: Props = $props();

  const dispatch = createEventDispatcher();

  // ✅ Using Svelte 5 runes for library state
  let searchTerm = $state('');
  let selectedCategory = $state<string>('all');
  let selectedWidget = $state<string | null>(null);

  // Predefined widget library
  const widgetLibrary = [
    // CPU Widgets
    {
      id: 'cpu-gauge-classic',
      name: 'CPU Gauge Classic',
      description: 'Classic circular gauge for CPU usage monitoring',
      category: 'CPU',
      tags: ['cpu', 'gauge', 'classic'],
      thumbnail: '🖥️',
      config: createWidget('gauge', {
        title: 'CPU Usage',
        sensorType: 'cpu',
        style: {
          theme: 'default',
          colors: ['#22d3ee', '#f59e0b', '#ef4444'],
          borderRadius: 12
        },
        gaugeConfig: {
          minValue: 0,
          maxValue: 100,
          startAngle: -135,
          endAngle: 135,
          arcWidth: 12,
          showValue: true,
          showLabel: true,
          showTicks: true,
          tickInterval: 25,
          unit: '%'
        }
      })
    },
    {
      id: 'cpu-temp-gauge',
      name: 'CPU Temperature Gauge',
      description: 'Temperature monitoring with alert thresholds',
      category: 'CPU',
      tags: ['cpu', 'temperature', 'gauge'],
      thumbnail: '🌡️',
      config: createWidget('gauge', {
        title: 'CPU Temperature',
        sensorType: 'cpu',
        style: {
          theme: 'default',
          colors: ['#10b981', '#f59e0b', '#ef4444'],
          borderRadius: 8
        },
        alerts: {
          enabled: true,
          thresholds: {
            warning: 75,
            critical: 85
          }
        },
        gaugeConfig: {
          minValue: 20,
          maxValue: 100,
          startAngle: -90,
          endAngle: 90,
          arcWidth: 8,
          unit: '°C'
        }
      })
    },
    {
      id: 'cpu-graph-timeline',
      name: 'CPU Usage Timeline',
      description: 'Real-time CPU usage graph with history',
      category: 'CPU',
      tags: ['cpu', 'graph', 'timeline'],
      thumbnail: '📈',
      config: createWidget('graph', {
        title: 'CPU Usage Over Time',
        sensorType: 'cpu',
        size: { width: 400, height: 200 },
        style: {
          theme: 'default',
          colors: ['#22d3ee', '#ef4444']
        },
        graphConfig: {
          timeRange: 60,
          maxDataPoints: 120,
          showGrid: true,
          showAxes: true,
          lineWidth: 2,
          fillArea: true,
          smoothing: true,
          yAxisMin: 0,
          yAxisMax: 100
        }
      })
    },

    // GPU Widgets
    {
      id: 'gpu-gauge-gaming',
      name: 'GPU Gaming Gauge',
      description: 'Gaming-themed GPU usage monitor',
      category: 'GPU',
      tags: ['gpu', 'gaming', 'gauge'],
      thumbnail: '🎮',
      config: createWidget('gauge', {
        title: 'GPU Load',
        sensorType: 'gpu',
        style: {
          theme: 'gaming',
          colors: ['#22c55e', '#eab308', '#dc2626'],
          borderRadius: 16
        },
        alerts: {
          enabled: true,
          thresholds: {
            warning: 80,
            critical: 95
          }
        },
        gaugeConfig: {
          minValue: 0,
          maxValue: 100,
          startAngle: -120,
          endAngle: 120,
          arcWidth: 15,
          showValue: true,
          showLabel: true,
          unit: '%'
        }
      })
    },
    {
      id: 'gpu-vram-text',
      name: 'GPU VRAM Display',
      description: 'Text display for GPU memory usage',
      category: 'GPU',
      tags: ['gpu', 'memory', 'text'],
      thumbnail: '💾',
      config: createWidget('text', {
        title: 'VRAM Usage',
        sensorType: 'gpu',
        size: { width: 180, height: 80 },
        style: {
          theme: 'gaming',
          colors: ['#a855f7']
        },
        textConfig: {
          format: '{value} GB / {total} GB',
          fontSize: 18,
          fontWeight: 'bold',
          alignment: 'center',
          showIcon: true,
          iconPosition: 'left',
          iconSize: 24
        }
      })
    },

    // Memory Widgets
    {
      id: 'memory-gauge-minimal',
      name: 'Memory Usage Minimal',
      description: 'Clean minimal design for memory monitoring',
      category: 'Memory',
      tags: ['memory', 'minimal', 'gauge'],
      thumbnail: '🧠',
      config: createWidget('gauge', {
        title: 'RAM Usage',
        sensorType: 'memory',
        style: {
          theme: 'minimal',
          colors: ['#6b7280', '#f59e0b', '#ef4444'],
          borderRadius: 4
        },
        gaugeConfig: {
          minValue: 0,
          maxValue: 100,
          startAngle: -180,
          endAngle: 0,
          arcWidth: 6,
          showValue: true,
          showLabel: false,
          showTicks: false,
          unit: '%'
        }
      })
    },

    // Multi-Sensor Widgets
    {
      id: 'system-overview-grid',
      name: 'System Overview Grid',
      description: 'Comprehensive system monitoring in grid layout',
      category: 'System',
      tags: ['multi-sensor', 'overview', 'grid'],
      thumbnail: '📊',
      config: createWidget('multi-sensor', {
        title: 'System Overview',
        sensorType: 'cpu',
        size: { width: 300, height: 250 },
        style: {
          theme: 'cyberpunk',
          colors: ['#a855f7', '#ec4899', '#06b6d4']
        },
        multiSensorConfig: {
          sensors: ['cpu', 'gpu', 'memory'],
          layout: 'grid',
          showLabels: true,
          showValues: true,
          compactMode: false
        }
      })
    },
    {
      id: 'temps-radial',
      name: 'Temperature Radial',
      description: 'Radial temperature display for all components',
      category: 'System',
      tags: ['temperature', 'radial', 'multi-sensor'],
      thumbnail: '🌡️',
      config: createWidget('multi-sensor', {
        title: 'System Temperatures',
        sensorType: 'cpu',
        size: { width: 250, height: 250 },
        style: {
          theme: 'rgb',
          colors: ['#ff0000', '#ff8800', '#ffff00']
        },
        multiSensorConfig: {
          sensors: ['cpu', 'gpu'],
          layout: 'radial',
          showLabels: true,
          showValues: true,
          compactMode: false
        }
      })
    }
  ];

  // ✅ Derived filtered widgets
  let filteredWidgets = $derived(() => {
    let filtered = widgetLibrary;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(widget => widget.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(widget =>
        widget.name.toLowerCase().includes(search) ||
        widget.description.toLowerCase().includes(search) ||
        widget.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    return filtered;
  });

  let categories = $derived(() => {
    const cats = ['all', ...new Set(widgetLibrary.map(w => w.category))];
    return cats;
  });

  function handleWidgetSelect(widget: any) {
    selectedWidget = widget.id;
    onSelection(widget.config as WidgetConfig);
  }

  function handleKeyPress(event: KeyboardEvent, widget: any) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleWidgetSelect(widget);
    }
  }
</script>

<div class="library-tab">
  <!-- Search and Filter -->
  <div class="library-header">
    <div class="search-section">
      <div class="search-input-wrapper">
        <span class="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search widgets..."
          bind:value={searchTerm}
          class="search-input"
        />
      </div>
      
      <select bind:value={selectedCategory} class="category-filter">
        {#each categories as category}
          <option value={category}>
            {category === 'all' ? 'All Categories' : category}
          </option>
        {/each}
      </select>
    </div>

    <div class="library-stats">
      <span class="stat-item">
        {filteredWidgets.length} widget{filteredWidgets.length !== 1 ? 's' : ''}
      </span>
    </div>
  </div>

  <!-- Widget Grid -->
  <div class="widget-grid">
    {#each filteredWidgets as widget (widget.id)}
      <div 
        class="widget-card"
        class:selected={selectedWidget === widget.id}
        onclick={() => handleWidgetSelect(widget)}
        onkeypress={(e) => handleKeyPress(e, widget)}
        role="button"
        tabindex="0"
        aria-label={`Select ${widget.name} widget`}
      >
        <div class="widget-thumbnail">
          <span class="thumbnail-icon">{widget.thumbnail}</span>
          <div class="widget-type-badge">{widget.config.type}</div>
        </div>
        
        <div class="widget-info">
          <h4 class="widget-name">{widget.name}</h4>
          <p class="widget-description">{widget.description}</p>
          
          <div class="widget-tags">
            {#each widget.tags.slice(0, 3) as tag}
              <span class="tag">{tag}</span>
            {/each}
          </div>
        </div>
        
        <div class="widget-actions">
          <button 
            class="preview-btn"
            onclick={(e) => {
              e.stopPropagation();
              // Trigger preview functionality
            }}
            title="Preview widget"
          >
            👁️
          </button>
          <button 
            class="select-btn"
            onclick={(e) => {
              e.stopPropagation();
              handleWidgetSelect(widget);
            }}
            title="Select widget"
          >
            ✓
          </button>
        </div>
      </div>
    {/each}
  </div>

  <!-- Empty State -->
  {#if filteredWidgets.length === 0}
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <h3 class="empty-title">No widgets found</h3>
      <p class="empty-description">
        {#if searchTerm}
          No widgets match your search "{searchTerm}". Try a different search term.
        {:else}
          No widgets available in the "{selectedCategory}" category.
        {/if}
      </p>
      <button 
        class="clear-filters-btn"
        onclick={() => {
          searchTerm = '';
          selectedCategory = 'all';
        }}
      >
        Clear Filters
      </button>
    </div>
  {/if}

  <!-- Quick Actions -->
  <div class="quick-actions">
    <button class="quick-action-btn">
      <span class="action-icon">⭐</span>
      Popular
    </button>
    <button class="quick-action-btn">
      <span class="action-icon">🆕</span>
      Recent
    </button>
    <button class="quick-action-btn">
      <span class="action-icon">🎨</span>
      Themes
    </button>
  </div>
</div>

<style>
  .library-tab {
    @apply flex flex-col h-full;
  }

  .library-header {
    @apply p-4 border-b border-gray-700 space-y-3;
  }

  .search-section {
    @apply flex gap-3;
  }

  .search-input-wrapper {
    @apply flex-1 relative;
  }

  .search-icon {
    @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400;
  }

  .search-input {
    @apply w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg;
    @apply text-white placeholder-gray-400 focus:border-cyan-400 focus:outline-none;
  }

  .category-filter {
    @apply px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg;
    @apply text-white focus:border-cyan-400 focus:outline-none;
  }

  .library-stats {
    @apply flex justify-between items-center text-sm text-gray-400;
  }

  .widget-grid {
    @apply flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto;
  }

  .widget-card {
    @apply bg-gray-800 border border-gray-600 rounded-lg p-4;
    @apply hover:border-cyan-400/50 hover:bg-gray-700/50 transition-all duration-200;
    @apply cursor-pointer relative;
  }

  .widget-card.selected {
    @apply border-cyan-400 bg-cyan-900/20;
    box-shadow: 0 0 15px rgba(34, 211, 238, 0.3);
  }

  .widget-thumbnail {
    @apply flex items-center justify-between mb-3;
  }

  .thumbnail-icon {
    @apply text-3xl;
  }

  .widget-type-badge {
    @apply px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs text-cyan-400;
  }

  .widget-info {
    @apply space-y-2;
  }

  .widget-name {
    @apply font-bold text-white text-sm;
  }

  .widget-description {
    @apply text-xs text-gray-400 leading-relaxed;
  }

  .widget-tags {
    @apply flex flex-wrap gap-1;
  }

  .tag {
    @apply px-2 py-1 bg-gray-700 rounded text-xs text-gray-300;
  }

  .widget-actions {
    @apply absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity;
  }

  .widget-card:hover .widget-actions {
    @apply opacity-100;
  }

  .preview-btn,
  .select-btn {
    @apply w-6 h-6 bg-gray-700 border border-gray-600 rounded text-xs;
    @apply hover:bg-gray-600 transition-colors;
  }

  .select-btn {
    @apply bg-cyan-500/20 border-cyan-400/50 text-cyan-400;
    @apply hover:bg-cyan-500/30;
  }

  .empty-state {
    @apply flex flex-col items-center justify-center py-12 text-center;
  }

  .empty-icon {
    @apply text-4xl mb-4 opacity-50;
  }

  .empty-title {
    @apply text-lg font-bold text-gray-300 mb-2;
  }

  .empty-description {
    @apply text-sm text-gray-400 mb-4 max-w-xs;
  }

  .clear-filters-btn {
    @apply px-4 py-2 bg-cyan-500/20 border border-cyan-400/30 rounded-lg;
    @apply text-cyan-400 hover:bg-cyan-500/30 transition-colors;
  }

  .quick-actions {
    @apply p-4 border-t border-gray-700 flex gap-2;
  }

  .quick-action-btn {
    @apply flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg;
    @apply hover:bg-gray-700 transition-colors text-sm;
  }

  .action-icon {
    @apply text-lg;
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .widget-grid {
      @apply grid-cols-1;
    }

    .search-section {
      @apply flex-col;
    }

    .quick-actions {
      @apply flex-wrap;
    }

    .widget-actions {
      @apply opacity-100;
    }
  }
</style>