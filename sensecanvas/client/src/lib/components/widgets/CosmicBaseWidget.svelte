<!--
SenseCanvas Cosmic Base Widget Component
Base widget using Cosmic UI Frame component with SVG shapes
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { draggable } from '@neodrag/svelte';
  import { Frame } from '../cosmic-ui';
  import type { WidgetConfig } from '../../types/widgets.js';
  import { hardwareStore } from '../../stores/hardware.svelte.js';
  import { themeStore } from '../../stores/theme.svelte.js';

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
    gridBounds = { x: 0, y: 0, width: 1920, height: 1080 },
    children
  }: Props & { children: any } = $props();

  const dispatch = createEventDispatcher<{
    positionChanged: { x: number; y: number };
    sizeChanged: { width: number; height: number };
    selected: string;
    configChanged: WidgetConfig;
    delete: string;
  }>();

  // Widget state using Svelte 5 runes
  let widgetElement = $state<HTMLElement>();
  let isDragging = $state(false);
  let isHovered = $state(false);

  // Derived values
  let widgetValue = $derived(() => {
    if (!hardwareStore.metrics) return 0;
    return hardwareStore.getMetricValue(`${config.sensorType}.usage`) || 0;
  });

  let alertLevel = $derived(() => {
    if (!config.alerts.enabled) return 'normal';
    const value = widgetValue();
    if (value >= config.alerts.thresholds.critical) return 'critical';
    if (value >= config.alerts.thresholds.warning) return 'warning';
    return 'normal';
  });

  // Get frame variant based on theme
  let frameVariant = $derived(
    themeStore.currentTheme.id === 'cyberpunk' ? 'cyberpunk' :
    themeStore.currentTheme.id === 'gaming' ? 'hexagon' :
    themeStore.currentTheme.id === 'minimal' ? 'sharp' :
    themeStore.currentTheme.id === 'rgb' ? 'octagon' :
    'default'
  );

  // Get colors based on alert level and theme
  let borderColor = $derived(() => {
    switch (alertLevel()) {
      case 'critical': return 'var(--color-neon-red)';
      case 'warning': return 'var(--color-cyber-orange)';
      default: return config.style.colors[0] || 'var(--color-cyber-blue)';
    }
  });

  let glowIntensity = $derived(() => {
    if (alertLevel() === 'critical') return 1.5;
    if (alertLevel() === 'warning') return 1;
    if (isSelected) return 0.8;
    if (isHovered) return 0.6;
    return 0.3;
  });

  // Widget positioning styles
  let positionStyles = $derived(() => {
    return {
      position: 'absolute',
      left: `${config.position.x}px`,
      top: `${config.position.y}px`,
      width: `${config.size.width}px`,
      height: `${config.size.height}px`,
      zIndex: config.zIndex || 1
    };
  });

  // NeoDrag configuration
  let dragOptions = $derived(() => ({
    disabled: !isEditMode,
    bounds: isEditMode ? gridBounds : undefined,
    grid: isEditMode ? [20, 20] : undefined,
    position: { x: config.position.x, y: config.position.y },
    onDrag: handleDrag,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd
  } as any));

  // Effects for alerts
  $effect(() => {
    if (alertLevel() === 'critical' && config.alerts.showNotifications) {
      showNotification();
    }
  });

  function handleDragStart() {
    isDragging = true;
    dispatch('selected', config.id);
  }

  function handleDrag({ offsetX, offsetY }: { offsetX: number; offsetY: number }) {
    const snappedX = Math.round(offsetX / 20) * 20;
    const snappedY = Math.round(offsetY / 20) * 20;
    dispatch('positionChanged', { x: snappedX, y: snappedY });
  }

  function handleDragEnd() {
    isDragging = false;
  }

  function handleSelect() {
    if (isEditMode) {
      dispatch('selected', config.id);
    }
  }

  function handleDelete() {
    if (isEditMode && isSelected) {
      dispatch('delete', config.id);
    }
  }

  function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${config.title} Alert`, {
        body: `${config.sensorType.toUpperCase()} at ${widgetValue().toFixed(1)}%`,
        icon: '/icons/alert.svg',
        tag: `alert-${config.id}`,
        type: 'error',
        title: `${config.title} Alert`,
        message: `${config.sensorType.toUpperCase()} at ${widgetValue().toFixed(1)}%`
      });
    }
  }
</script>

<!-- Widget with Cosmic UI Frame -->
<div
  bind:this={widgetElement}
  class="cosmic-widget"
  class:dragging={isDragging}
  class:selected={isSelected}
  style={Object.entries(positionStyles()).map(([k, v]) => `${k}: ${v}`).join('; ')}
  use:draggable={dragOptions()}
  onclick={handleSelect}
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
  role="button"
  tabindex="0"
  aria-label={`${config.title} widget`}
>
  <Frame
    className="widget-frame"
    enableBackdropBlur={true}
  >
    <!-- Widget header -->
    {#if isEditMode || isHovered}
      <div class="widget-header">
        <h3 class="widget-title">{config.title}</h3>
        
        {#if isEditMode}
          <button 
            class="delete-btn"
            onclick={handleDelete}
            aria-label="Delete widget"
          >
            ×
          </button>
        {/if}
      </div>
    {/if}

    <!-- Widget content -->
    <div class="widget-content">
      {@render children?.()}
    </div>

    <!-- Alert badge -->
    {#if alertLevel() !== 'normal'}
      <div class="alert-badge {alertLevel()}">
        <span class="alert-pulse"></span>
      </div>
    {/if}
  </Frame>

  <!-- Selection controls -->
  {#if isEditMode && isSelected}
    <div class="selection-controls">
      <div class="resize-handle top-left"></div>
      <div class="resize-handle top-right"></div>
      <div class="resize-handle bottom-left"></div>
      <div class="resize-handle bottom-right"></div>
    </div>
  {/if}
</div>

<style>
  .cosmic-widget {
    position: absolute;
    transition: transform 0.2s ease;
    cursor: pointer;
  }

  .cosmic-widget.dragging {
    cursor: grabbing;
    transform: rotate(1deg) scale(1.02);
  }

  .cosmic-widget.selected {
    z-index: 100 !important;
  }

  .widget-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--color-dark-accent);
  }

  .widget-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-cyber-blue);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  .delete-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-neon-red);
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.25rem;
    line-height: 1;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .delete-btn:hover {
    background: var(--color-cyber-pink);
    transform: scale(1.1);
  }

  .widget-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100px;
  }

  .alert-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    z-index: 10;
  }

  .alert-badge.warning {
    background: var(--color-cyber-orange);
  }

  .alert-badge.critical {
    background: var(--color-neon-red);
  }

  .alert-pulse {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: inherit;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { 
      transform: scale(1); 
      opacity: 1; 
    }
    50% { 
      transform: scale(1.5); 
      opacity: 0.5; 
    }
  }

  .selection-controls {
    position: absolute;
    inset: -4px;
    pointer-events: none;
  }

  .resize-handle {
    position: absolute;
    width: 8px;
    height: 8px;
    background: var(--color-cyber-blue);
    border: 2px solid var(--color-dark-bg);
    border-radius: 2px;
    pointer-events: auto;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .resize-handle:hover {
    background: var(--color-cyber-green);
    transform: scale(1.5);
  }

  .resize-handle.top-left {
    top: 0;
    left: 0;
    cursor: nw-resize;
  }

  .resize-handle.top-right {
    top: 0;
    right: 0;
    cursor: ne-resize;
  }

  .resize-handle.bottom-left {
    bottom: 0;
    left: 0;
    cursor: sw-resize;
  }

  .resize-handle.bottom-right {
    bottom: 0;
    right: 0;
    cursor: se-resize;
  }
</style> 