<!--
SenseCanvas Base Widget Component
Foundation widget component with NeoDrag@next {@attach draggable()}, Cosmic UI styling, and alert system.
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { draggable } from '@neodrag/svelte';
  import type { WidgetConfig } from '../../types/widgets.js';
  import { hardwareStore } from '../../stores/hardware.svelte.js';

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
    positionChanged: { x: number; y: number };
    sizeChanged: { width: number; height: number };
    selected: string;
    configChanged: WidgetConfig;
    delete: string;
  }>();

  // ✅ Using Svelte 5 runes for widget state
  let widgetElement = $state<HTMLElement>();
  let isDragging = $state(false);
  let isResizing = $state(false);
  let isHovered = $state(false);

  // ✅ Derived values for widget state
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

  let alertColor = $derived(() => {
    switch (alertLevel()) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return config.style.colors[0] || '#22d3ee';
    }
  });

  let widgetClasses = $derived(() => {
    const classes = ['widget-base', `theme-${config.style.theme}`];
    if (isSelected) classes.push('selected');
    if (isDragging) classes.push('dragging');
    if (isResizing) classes.push('resizing');
    if (isHovered) classes.push('hovered');
    if (alertLevel() !== 'normal') classes.push(`alert-${alertLevel()}`);
    return classes.join(' ');
  });

  let widgetStyles = $derived(() => {
    const styles = [
      `width: ${config.size.width}px`,
      `height: ${config.size.height}px`,
      `opacity: ${config.style.opacity}`,
      `border-radius: ${config.style.borderRadius}px`,
      `z-index: ${config.zIndex || 1}`
    ];

    if (config.style.borderWidth) {
      styles.push(`border: ${config.style.borderWidth}px solid ${config.style.borderColor || '#374151'}`);
    }

    if (config.style.shadowEnabled) {
      styles.push(`box-shadow: 0 0 ${config.style.shadowBlur}px ${config.style.shadowColor || '#000000'}`);
    }

    if (config.style.gradientEnabled && config.style.colors.length >= 2) {
      const direction = config.style.gradientDirection === 'vertical' ? 'to bottom' : 
                       config.style.gradientDirection === 'radial' ? 'radial-gradient(circle,' :
                       'to right';
      const gradient = config.style.gradientDirection === 'radial' ? 
        `radial-gradient(circle, ${config.style.colors.join(', ')})` :
        `linear-gradient(${direction}, ${config.style.colors.join(', ')})`;
      styles.push(`background: ${gradient}`);
    }

    return styles.join('; ');
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
  }));

  // ✅ Using $effect for alert notifications
  $effect(() => {
    if (alertLevel() === 'critical' && config.alerts.showNotifications) {
      showNotification();
    }
  });

  // ✅ Using $effect for widget flashing
  $effect(() => {
    if (alertLevel() !== 'normal' && config.alerts.flashWidget) {
      const element = widgetElement;
      if (element) {
        element.classList.add('alert-flash');
        setTimeout(() => element?.classList.remove('alert-flash'), 1000);
      }
    }
  });

  function handleDragStart() {
    isDragging = true;
    dispatch('selected', config.id);
  }

  function handleDrag({ offsetX, offsetY }: { offsetX: number; offsetY: number }) {
    // Snap to grid (20px intervals)
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

  function handleResize(direction: 'nw' | 'ne' | 'sw' | 'se') {
    if (!isEditMode) return;
    
    isResizing = true;
    // Resize logic would be implemented here
    // For now, we'll emit a placeholder event
    dispatch('sizeChanged', config.size);
  }

  function showNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(`${config.title} Alert`, {
        body: `${config.sensorType.toUpperCase()} at ${widgetValue().toFixed(1)}%`,
        icon: '/icons/alert.svg',
        badge: '/icons/widget.svg'
      });
    }
  }

  function playAlertSound() {
    if (config.alerts.playSound && alertLevel() !== 'normal') {
      // Play alert sound (implementation would depend on audio files)
      const audio = new Audio('/sounds/alert.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors (user interaction required)
      });
    }
  }
</script>

<!-- Widget container with draggable behavior -->
<div
  bind:this={widgetElement}
  class={widgetClasses}
  style={widgetStyles}
  use:draggable={dragOptions}
  onclick={handleSelect}
  onmouseenter={() => isHovered = true}
  onmouseleave={() => isHovered = false}
  role="button"
  tabindex="0"
  aria-label={`${config.title} widget`}
>
  <!-- Widget header (only visible in edit mode or when hovered) -->
  {#if isEditMode || isHovered}
    <div class="widget-header">
      <div class="widget-title">
        {config.title}
      </div>
      
      {#if isEditMode}
        <div class="widget-controls">
          <button 
            class="control-btn delete-btn"
            onclick={handleDelete}
            aria-label="Delete widget"
          >
            ×
          </button>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Widget content slot -->
  <div class="widget-content">
    <slot 
      {config}
      {widgetValue}
      {alertLevel}
      {alertColor}
      {isEditMode}
      {isSelected}
    />
  </div>

  <!-- Alert indicator -->
  {#if alertLevel() !== 'normal'}
    <div class="alert-indicator {alertLevel()}">
      <div class="alert-pulse"></div>
    </div>
  {/if}

  <!-- Resize handles (only in edit mode and when selected) -->
  {#if isEditMode && isSelected}
    <div class="resize-handles">
      <div 
        class="resize-handle nw" 
        onclick={() => handleResize('nw')}
        aria-label="Resize northwest"
      ></div>
      <div 
        class="resize-handle ne" 
        onclick={() => handleResize('ne')}
        aria-label="Resize northeast"
      ></div>
      <div 
        class="resize-handle sw" 
        onclick={() => handleResize('sw')}
        aria-label="Resize southwest"
      ></div>
      <div 
        class="resize-handle se" 
        onclick={() => handleResize('se')}
        aria-label="Resize southeast"
      ></div>
    </div>
  {/if}

  <!-- Selection outline -->
  {#if isSelected && isEditMode}
    <div class="selection-outline"></div>
  {/if}
</div>

<style>
  .widget-base {
    @apply absolute bg-gray-900 border border-gray-700 rounded-lg overflow-hidden;
    @apply transition-all duration-200 ease-in-out;
    position: absolute;
    font-family: 'Orbitron', monospace;
  }

  .widget-base.hovered {
    @apply border-cyan-400/50;
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
  }

  .widget-base.selected {
    @apply border-cyan-400;
    box-shadow: 0 0 15px rgba(34, 211, 238, 0.5);
  }

  .widget-base.dragging {
    @apply cursor-grabbing;
    transform: rotate(2deg);
  }

  .widget-base.resizing {
    @apply border-yellow-400;
  }

  /* Theme variations */
  .theme-cyberpunk {
    @apply bg-purple-900 border-purple-400;
    background: linear-gradient(135deg, #581c87 0%, #7c3aed 100%);
  }

  .theme-gaming {
    @apply bg-green-900 border-green-400;
    background: linear-gradient(135deg, #14532d 0%, #22c55e 100%);
  }

  .theme-minimal {
    @apply bg-white border-gray-300 text-gray-900;
  }

  .theme-rgb {
    background: linear-gradient(45deg, #ff0000, #00ff00, #0000ff, #ff0000);
    background-size: 400% 400%;
    animation: rgb-shift 3s ease-in-out infinite;
  }

  /* Alert states */
  .alert-warning {
    @apply border-yellow-400;
    box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
  }

  .alert-critical {
    @apply border-red-400;
    box-shadow: 0 0 15px rgba(239, 68, 68, 0.7);
  }

  .alert-flash {
    animation: alert-flash 0.5s ease-in-out 2;
  }

  .widget-header {
    @apply absolute top-0 left-0 right-0 bg-black/50 text-white p-2 flex justify-between items-center;
    @apply transition-opacity duration-200;
    backdrop-filter: blur(4px);
    z-index: 10;
  }

  .widget-title {
    @apply text-xs font-medium truncate;
  }

  .widget-controls {
    @apply flex gap-1;
  }

  .control-btn {
    @apply w-6 h-6 flex items-center justify-center rounded text-xs;
    @apply hover:bg-white/20 transition-colors;
  }

  .delete-btn {
    @apply text-red-400 hover:text-red-300;
  }

  .widget-content {
    @apply w-full h-full p-4 flex flex-col items-center justify-center;
    position: relative;
  }

  .alert-indicator {
    @apply absolute top-2 right-2 w-3 h-3 rounded-full;
    z-index: 5;
  }

  .alert-indicator.warning {
    @apply bg-yellow-400;
  }

  .alert-indicator.critical {
    @apply bg-red-400;
  }

  .alert-pulse {
    @apply w-full h-full rounded-full;
    animation: alert-pulse 1s ease-in-out infinite;
  }

  .resize-handles {
    @apply absolute inset-0 pointer-events-none;
  }

  .resize-handle {
    @apply absolute w-3 h-3 bg-cyan-400 border border-cyan-300 rounded-sm;
    @apply pointer-events-auto cursor-pointer hover:bg-cyan-300;
  }

  .resize-handle.nw {
    @apply -top-1 -left-1;
    cursor: nw-resize;
  }

  .resize-handle.ne {
    @apply -top-1 -right-1;
    cursor: ne-resize;
  }

  .resize-handle.sw {
    @apply -bottom-1 -left-1;
    cursor: sw-resize;
  }

  .resize-handle.se {
    @apply -bottom-1 -right-1;
    cursor: se-resize;
  }

  .selection-outline {
    @apply absolute inset-0 border-2 border-cyan-400 rounded-lg pointer-events-none;
    border-style: dashed;
    animation: selection-pulse 2s ease-in-out infinite;
  }

  /* Animations */
  @keyframes rgb-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  @keyframes alert-flash {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes alert-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.5); opacity: 0.5; }
  }

  @keyframes selection-pulse {
    0%, 100% { border-color: #22d3ee; }
    50% { border-color: #06b6d4; }
  }
</style>