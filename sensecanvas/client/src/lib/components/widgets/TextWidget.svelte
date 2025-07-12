<!--
SenseCanvas Text Widget Component
Customizable text display widget with formatting options and icon support.
-->

<script lang="ts">
  import type { WidgetConfig } from '../../types/widgets.js';

  interface Props {
    config: WidgetConfig;
    widgetValue: number;
    alertLevel: string;
    alertColor: string;
    isEditMode?: boolean;
    isSelected?: boolean;
  }

  let { 
    config, 
    widgetValue, 
    alertLevel, 
    alertColor,
    isEditMode = false,
    isSelected = false 
  }: Props = $props();

  // ✅ Using Svelte 5 runes for text widget state
  let isAnimating = $state(false);
  let lastValue = $state(widgetValue);

  // ✅ Derived values for text configuration
  let textConfig = $derived(() => config.textConfig || {
    format: '{value}{unit}',
    fontSize: 24,
    fontWeight: 'bold',
    alignment: 'center',
    showIcon: true,
    iconPosition: 'left',
    iconSize: 32
  });

  let displayText = $derived(() => {
    const format = textConfig().format;
    const unit = config.gaugeConfig?.unit || '%';
    
    return format
      .replace('{value}', widgetValue.toFixed(1))
      .replace('{unit}', unit)
      .replace('{sensor}', config.sensorType.toUpperCase())
      .replace('{title}', config.title);
  });

  let textStyles = $derived(() => {
    const styles = [
      `font-size: ${textConfig().fontSize}px`,
      `font-weight: ${textConfig().fontWeight}`,
      `text-align: ${textConfig().alignment}`,
      `color: ${alertLevel !== 'normal' ? alertColor : config.style.colors[0] || '#22d3ee'}`
    ];
    
    if (config.style.fontFamily) {
      styles.push(`font-family: ${config.style.fontFamily}`);
    }
    
    return styles.join('; ');
  });

  let containerClasses = $derived(() => {
    const classes = ['text-display'];
    classes.push(`align-${textConfig().alignment}`);
    classes.push(`icon-${textConfig().iconPosition}`);
    if (isAnimating) classes.push('animating');
    if (alertLevel !== 'normal') classes.push(`alert-${alertLevel}`);
    return classes.join(' ');
  });

  let iconName = $derived(() => {
    switch (config.sensorType) {
      case 'cpu': return '🖥️';
      case 'gpu': return '🎮';
      case 'memory': return '💾';
      case 'storage': return '💿';
      case 'network': return '🌐';
      default: return '📊';
    }
  });

  // ✅ Using $effect for value change animation
  $effect(() => {
    if (widgetValue !== lastValue) {
      isAnimating = true;
      lastValue = widgetValue;
      
      setTimeout(() => {
        isAnimating = false;
      }, 500);
    }
  });

  function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  function formatFrequency(freq: number): string {
    if (freq === 0) return 'N/A';
    if (freq >= 1000) return `${(freq / 1000).toFixed(2)} GHz`;
    return `${freq.toFixed(0)} MHz`;
  }

  function formatTemperature(temp: number): string {
    return temp > 0 ? `${temp.toFixed(1)}°C` : 'N/A';
  }

  function getAdvancedDisplayText(): string {
    const sensor = config.sensorType;
    const format = textConfig().format;
    
    // Advanced formatting for specific sensors
    if (format.includes('{advanced}')) {
      switch (sensor) {
        case 'cpu':
          return `CPU: ${widgetValue.toFixed(1)}%`;
        case 'memory':
          return `RAM: ${widgetValue.toFixed(1)}%`;
        case 'gpu':
          return `GPU: ${widgetValue.toFixed(1)}%`;
        case 'storage':
          return `Storage: ${widgetValue.toFixed(1)}%`;
        case 'network':
          return `Network: ${widgetValue.toFixed(1)} Mbps`;
        default:
          return displayText();
      }
    }
    
    return displayText();
  }
</script>

<div class="text-widget">
  <div class={containerClasses}>
    <!-- Icon -->
    {#if textConfig().showIcon}
      <div 
        class="text-icon"
        style="font-size: {textConfig().iconSize}px"
      >
        {iconName}
      </div>
    {/if}
    
    <!-- Main text display -->
    <div 
      class="text-content"
      style={textStyles()}
    >
      {getAdvancedDisplayText()}
    </div>
    
    <!-- Secondary info -->
    {#if !isEditMode}
      <div class="text-secondary">
        <div class="secondary-info">
          {config.sensorType.charAt(0).toUpperCase() + config.sensorType.slice(1)} Monitor
        </div>
        
        {#if alertLevel !== 'normal'}
          <div class="alert-status {alertLevel}">
            {alertLevel === 'critical' ? '🚨' : '⚠️'} {alertLevel.toUpperCase()}
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Format preview (edit mode only) -->
  {#if isEditMode}
    <div class="format-preview">
      <div class="preview-title">Format Preview</div>
      <div class="preview-examples">
        <div class="preview-item">
          <code>{textConfig().format}</code>
        </div>
        <div class="preview-item">
          Variables: {'{value}'}, {'{unit}'}, {'{sensor}'}, {'{title}'}
        </div>
      </div>
    </div>
  {/if}

  <!-- Value trend indicator -->
  <div class="trend-indicator">
    {#if widgetValue > lastValue}
      <div class="trend-arrow up">↗️</div>
    {:else if widgetValue < lastValue}
      <div class="trend-arrow down">↘️</div>
    {:else}
      <div class="trend-arrow stable">➡️</div>
    {/if}
  </div>
</div>

<style>
  .text-widget {
    @apply w-full h-full flex flex-col justify-center relative;
    font-family: 'Orbitron', monospace;
  }

  .text-display {
    @apply flex items-center gap-3;
  }

  .text-display.align-left {
    @apply justify-start;
  }

  .text-display.align-center {
    @apply justify-center;
  }

  .text-display.align-right {
    @apply justify-end;
  }

  .text-display.icon-left {
    @apply flex-row;
  }

  .text-display.icon-right {
    @apply flex-row-reverse;
  }

  .text-display.icon-top {
    @apply flex-col;
  }

  .text-display.icon-bottom {
    @apply flex-col-reverse;
  }

  .text-icon {
    @apply flex items-center justify-center;
    filter: drop-shadow(0 0 4px currentColor);
  }

  .text-content {
    @apply font-bold;
    text-shadow: 0 0 10px currentColor;
    transition: all 0.3s ease;
  }

  .text-display.animating .text-content {
    transform: scale(1.1);
    filter: brightness(1.2);
  }

  .text-secondary {
    @apply absolute bottom-2 left-2 right-2 flex justify-between items-end;
  }

  .secondary-info {
    @apply text-xs text-gray-400;
  }

  .alert-status {
    @apply text-xs font-bold px-2 py-1 rounded;
  }

  .alert-status.warning {
    @apply bg-yellow-500/20 text-yellow-400;
  }

  .alert-status.critical {
    @apply bg-red-500/20 text-red-400;
    animation: critical-pulse 1s ease-in-out infinite;
  }

  .format-preview {
    @apply absolute top-2 left-2 right-2 bg-black/70 backdrop-blur-sm rounded p-2;
    @apply opacity-0 hover:opacity-100 transition-opacity;
  }

  .preview-title {
    @apply text-xs font-bold text-cyan-400 mb-1;
  }

  .preview-examples {
    @apply space-y-1;
  }

  .preview-item {
    @apply text-xs text-gray-300;
  }

  .preview-item code {
    @apply bg-gray-800 px-1 rounded font-mono;
  }

  .trend-indicator {
    @apply absolute top-2 right-2;
  }

  .trend-arrow {
    @apply text-sm opacity-70;
    transition: opacity 0.3s ease;
  }

  .trend-arrow.up {
    @apply text-green-400;
  }

  .trend-arrow.down {
    @apply text-red-400;
  }

  .trend-arrow.stable {
    @apply text-gray-400;
  }

  /* Alert states */
  .text-display.alert-warning .text-content {
    color: #f59e0b !important;
    text-shadow: 0 0 10px #f59e0b;
  }

  .text-display.alert-critical .text-content {
    color: #ef4444 !important;
    text-shadow: 0 0 15px #ef4444;
    animation: critical-text-pulse 1s ease-in-out infinite;
  }

  @keyframes critical-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes critical-text-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.8; }
  }
</style>