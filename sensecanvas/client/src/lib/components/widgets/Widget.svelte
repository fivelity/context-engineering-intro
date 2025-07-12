<!--
SenseCanvas Master Widget Component
Dynamic widget renderer that selects the appropriate widget type based on configuration.
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import BaseWidget from './BaseWidget.svelte';
  import GaugeWidget from './GaugeWidget.svelte';
  import GraphWidget from './GraphWidget.svelte';
  import TextWidget from './TextWidget.svelte';
  import MultiSensorWidget from './MultiSensorWidget.svelte';
  import type { WidgetConfig } from '../../types/widgets.js';

  interface Props {
    config: WidgetConfig;
    isEditMode?: boolean;
    isSelected?: boolean;
    gridBounds?: { x: number; y: number; width: number; height: number };
  }

  let { 
    config, 
    isEditMode = false, 
    isSelected = false,
    gridBounds = { x: 0, y: 0, width: 1920, height: 1080 }
  }: Props = $props();

  const dispatch = createEventDispatcher<{
    positionChanged: { id: string; x: number; y: number };
    sizeChanged: { id: string; width: number; height: number };
    selected: string;
    configChanged: WidgetConfig;
    delete: string;
  }>();

  // ✅ Using Svelte 5 runes for widget state
  let widgetComponent = $state<any>(null);
  let isLoading = $state(false);
  let loadError = $state<string | null>(null);

  // ✅ Derived widget component selection
  let WidgetComponent = $derived(() => {
    switch (config.type) {
      case 'gauge':
        return GaugeWidget;
      case 'graph':
        return GraphWidget;
      case 'text':
        return TextWidget;
      case 'multi-sensor':
        return MultiSensorWidget;
      default:
        return null;
    }
  });

  // ✅ Widget validation
  let isValidConfig = $derived(() => {
    // Basic validation
    if (!config.id || !config.type || !config.title) return false;
    
    // Type-specific validation
    switch (config.type) {
      case 'gauge':
        return config.gaugeConfig !== undefined;
      case 'graph':
        return config.graphConfig !== undefined;
      case 'text':
        return config.textConfig !== undefined;
      case 'multi-sensor':
        return config.multiSensorConfig !== undefined;
      default:
        return false;
    }
  });

  // Forward events from BaseWidget
  function handlePositionChanged(event: CustomEvent<{ x: number; y: number }>) {
    dispatch('positionChanged', {
      id: config.id,
      x: event.detail.x,
      y: event.detail.y
    });
  }

  function handleSizeChanged(event: CustomEvent<{ width: number; height: number }>) {
    dispatch('sizeChanged', {
      id: config.id,
      width: event.detail.width,
      height: event.detail.height
    });
  }

  function handleSelected(event: CustomEvent<string>) {
    dispatch('selected', event.detail);
  }

  function handleDelete(event: CustomEvent<string>) {
    dispatch('delete', event.detail);
  }

  function handleConfigChanged(event: CustomEvent<WidgetConfig>) {
    dispatch('configChanged', event.detail);
  }

  // Widget error recovery
  function handleWidgetError(error: Error) {
    console.error(`Widget ${config.id} error:`, error);
    loadError = error.message;
  }

  // Widget performance monitoring
  function trackWidgetPerformance() {
    if (typeof performance !== 'undefined') {
      performance.mark(`widget-${config.id}-render-start`);
      
      // Track render completion
      setTimeout(() => {
        performance.mark(`widget-${config.id}-render-end`);
        performance.measure(
          `widget-${config.id}-render`,
          `widget-${config.id}-render-start`,
          `widget-${config.id}-render-end`
        );
      }, 0);
    }
  }

  // ✅ Using $effect for performance tracking
  $effect(() => {
    if (isEditMode) {
      trackWidgetPerformance();
    }
  });
</script>

{#if !isValidConfig}
  <!-- Invalid Configuration Display -->
  <BaseWidget 
    {config} 
    {isEditMode} 
    {isSelected} 
    {gridBounds}
    on:positionChanged={handlePositionChanged}
    on:sizeChanged={handleSizeChanged}
    on:selected={handleSelected}
    on:delete={handleDelete}
    on:configChanged={handleConfigChanged}
  >
    <div class="widget-error">
      <div class="error-icon">⚠️</div>
      <div class="error-title">Invalid Configuration</div>
      <div class="error-message">
        Widget configuration is missing required fields for type: {config.type}
      </div>
      {#if isEditMode}
        <div class="error-details">
          <div class="detail-item">ID: {config.id || 'Missing'}</div>
          <div class="detail-item">Type: {config.type || 'Missing'}</div>
          <div class="detail-item">Title: {config.title || 'Missing'}</div>
        </div>
      {/if}
    </div>
  </BaseWidget>

{:else if loadError}
  <!-- Load Error Display -->
  <BaseWidget 
    {config} 
    {isEditMode} 
    {isSelected} 
    {gridBounds}
    on:positionChanged={handlePositionChanged}
    on:sizeChanged={handleSizeChanged}
    on:selected={handleSelected}
    on:delete={handleDelete}
    on:configChanged={handleConfigChanged}
  >
    <div class="widget-error">
      <div class="error-icon">❌</div>
      <div class="error-title">Widget Load Error</div>
      <div class="error-message">{loadError}</div>
      <button 
        class="retry-btn"
        onclick={() => loadError = null}
      >
        Retry
      </button>
    </div>
  </BaseWidget>

{:else if isLoading}
  <!-- Loading State -->
  <BaseWidget 
    {config} 
    {isEditMode} 
    {isSelected} 
    {gridBounds}
    on:positionChanged={handlePositionChanged}
    on:sizeChanged={handleSizeChanged}
    on:selected={handleSelected}
    on:delete={handleDelete}
    on:configChanged={handleConfigChanged}
  >
    <div class="widget-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading {config.type} widget...</div>
    </div>
  </BaseWidget>

{:else if WidgetComponent}
  <!-- Render Specific Widget Type -->
  <BaseWidget 
    {config} 
    {isEditMode} 
    {isSelected} 
    {gridBounds}
    on:positionChanged={handlePositionChanged}
    on:sizeChanged={handleSizeChanged}
    on:selected={handleSelected}
    on:delete={handleDelete}
    on:configChanged={handleConfigChanged}
    let:widgetValue
    let:alertLevel
    let:alertColor
  >
    <svelte:component 
      this={WidgetComponent()}
      {config}
      widgetValue={widgetValue()}
      alertLevel={alertLevel()}
      alertColor={alertColor()}
      {isEditMode}
      {isSelected}
    />
  </BaseWidget>

{:else}
  <!-- Unsupported Widget Type -->
  <BaseWidget 
    {config} 
    {isEditMode} 
    {isSelected} 
    {gridBounds}
    on:positionChanged={handlePositionChanged}
    on:sizeChanged={handleSizeChanged}
    on:selected={handleSelected}
    on:delete={handleDelete}
    on:configChanged={handleConfigChanged}
  >
    <div class="widget-error">
      <div class="error-icon">🚫</div>
      <div class="error-title">Unsupported Widget</div>
      <div class="error-message">
        Widget type "{config.type}" is not supported
      </div>
      <div class="supported-types">
        Supported types: gauge, graph, text, multi-sensor
      </div>
    </div>
  </BaseWidget>
{/if}

<style>
  .widget-error {
    @apply flex flex-col items-center justify-center text-center p-4 h-full;
    font-family: 'Orbitron', monospace;
  }

  .error-icon {
    @apply text-3xl mb-2;
  }

  .error-title {
    @apply text-lg font-bold text-red-400 mb-2;
  }

  .error-message {
    @apply text-sm text-gray-300 mb-3;
  }

  .error-details {
    @apply text-xs text-gray-400 space-y-1;
  }

  .detail-item {
    @apply bg-gray-800 px-2 py-1 rounded;
  }

  .supported-types {
    @apply text-xs text-gray-400 mt-2 italic;
  }

  .retry-btn {
    @apply px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded;
    @apply text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors;
  }

  .widget-loading {
    @apply flex flex-col items-center justify-center text-center p-4 h-full;
    font-family: 'Orbitron', monospace;
  }

  .loading-spinner {
    @apply w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mb-3;
  }

  .loading-text {
    @apply text-sm text-gray-400;
  }
</style>