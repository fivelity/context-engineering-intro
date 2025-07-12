<!--
SenseCanvas Gauge Widget Component
Circular gauge widget using LayerChart@next for Svelte 5 compatibility.
-->

<script lang="ts">
  import { Arc, Svg } from 'layerchart';
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

  // ✅ Using Svelte 5 runes for gauge state
  let animatedValue = $state(0);
  let isAnimating = $state(false);

  // ✅ Derived values for gauge configuration
  let gaugeConfig = $derived(() => config.gaugeConfig || {
    minValue: 0,
    maxValue: 100,
    startAngle: -135,
    endAngle: 135,
    arcWidth: 10,
    showValue: true,
    showLabel: true,
    showTicks: true,
    tickInterval: 20,
    unit: '%'
  });

  let normalizedValue = $derived(() => {
    const min = gaugeConfig().minValue;
    const max = gaugeConfig().maxValue;
    return Math.max(0, Math.min(100, ((widgetValue - min) / (max - min)) * 100));
  });

  let displayValue = $derived(() => {
    if (isEditMode && !config.gaugeConfig?.showValue) {
      return '-- ';
    }
    return widgetValue.toFixed(1);
  });

  let arcColor = $derived(() => {
    if (alertLevel !== 'normal') return alertColor;
    
    // Gradient based on value
    if (normalizedValue() >= 80) return config.style.colors[1] || '#ef4444';
    if (normalizedValue() >= 60) return config.style.colors[2] || '#f59e0b';
    return config.style.colors[0] || '#22d3ee';
  });

  let tickMarks = $derived(() => {
    const ticks = [];
    const { minValue, maxValue, tickInterval } = gaugeConfig();
    
    for (let value = minValue; value <= maxValue; value += tickInterval) {
      const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
      const angle = gaugeConfig().startAngle + (percentage / 100) * (gaugeConfig().endAngle - gaugeConfig().startAngle);
      
      ticks.push({
        value,
        angle,
        percentage
      });
    }
    
    return ticks;
  });

  // ✅ Using $effect for value animation
  $effect(() => {
    if (!isAnimating) {
      isAnimating = true;
      const startValue = animatedValue;
      const targetValue = normalizedValue();
      const duration = 800; // ms
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        animatedValue = startValue + (targetValue - startValue) * eased;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          isAnimating = false;
        }
      };
      
      requestAnimationFrame(animate);
    }
  });

  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  }

  function createArcPath(centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  }
</script>

<div class="gauge-widget">
  <!-- SVG Gauge -->
  <div class="gauge-container">
    <Svg class="gauge-svg" viewBox="0 0 200 200">
      <!-- Background arc -->
      <Arc
        center={{ x: 100, y: 100 }}
        innerRadius={70}
        outerRadius={70 + gaugeConfig().arcWidth}
        startAngle={gaugeConfig().startAngle}
        endAngle={gaugeConfig().endAngle}
        class="gauge-background"
      />
      
      <!-- Value arc -->
      <Arc
        center={{ x: 100, y: 100 }}
        innerRadius={70}
        outerRadius={70 + gaugeConfig().arcWidth}
        startAngle={gaugeConfig().startAngle}
        endAngle={gaugeConfig().startAngle + (animatedValue / 100) * (gaugeConfig().endAngle - gaugeConfig().startAngle)}
        fill={arcColor}
        class="gauge-value"
      />
      
      <!-- Tick marks -->
      {#if gaugeConfig().showTicks}
        {#each tickMarks as tick}
          <g class="gauge-tick">
            <line
              x1={polarToCartesian(100, 100, 65, tick.angle).x}
              y1={polarToCartesian(100, 100, 65, tick.angle).y}
              x2={polarToCartesian(100, 100, 60, tick.angle).x}
              y2={polarToCartesian(100, 100, 60, tick.angle).y}
              stroke="#6b7280"
              stroke-width="1"
            />
            <text
              x={polarToCartesian(100, 100, 55, tick.angle).x}
              y={polarToCartesian(100, 100, 55, tick.angle).y}
              text-anchor="middle"
              dominant-baseline="middle"
              class="gauge-tick-label"
            >
              {tick.value}
            </text>
          </g>
        {/each}
      {/if}
      
      <!-- Center value display -->
      {#if gaugeConfig().showValue}
        <text
          x="100"
          y="100"
          text-anchor="middle"
          dominant-baseline="middle"
          class="gauge-value-text"
          fill={arcColor}
        >
          {displayValue}{gaugeConfig().unit}
        </text>
      {/if}
      
      <!-- Label -->
      {#if gaugeConfig().showLabel}
        <text
          x="100"
          y="130"
          text-anchor="middle"
          dominant-baseline="middle"
          class="gauge-label-text"
        >
          {config.sensorType.toUpperCase()}
        </text>
      {/if}
      
      <!-- Alert threshold markers -->
      {#if config.alerts.enabled}
        <!-- Warning threshold -->
        <Arc
          center={{ x: 100, y: 100 }}
          innerRadius={68}
          outerRadius={72}
          startAngle={gaugeConfig().startAngle + (config.alerts.thresholds.warning / 100) * (gaugeConfig().endAngle - gaugeConfig().startAngle) - 1}
          endAngle={gaugeConfig().startAngle + (config.alerts.thresholds.warning / 100) * (gaugeConfig().endAngle - gaugeConfig().startAngle) + 1}
          fill="#f59e0b"
          class="gauge-threshold warning"
        />
        
        <!-- Critical threshold -->
        <Arc
          center={{ x: 100, y: 100 }}
          innerRadius={68}
          outerRadius={72}
          startAngle={gaugeConfig().startAngle + (config.alerts.thresholds.critical / 100) * (gaugeConfig().endAngle - gaugeConfig().startAngle) - 1}
          endAngle={gaugeConfig().startAngle + (config.alerts.thresholds.critical / 100) * (gaugeConfig().endAngle - gaugeConfig().startAngle) + 1}
          fill="#ef4444"
          class="gauge-threshold critical"
        />
      {/if}
    </Svg>
  </div>

  <!-- Additional info -->
  <div class="gauge-info">
    {#if alertLevel !== 'normal'}
      <div class="alert-badge {alertLevel}">
        {alertLevel.toUpperCase()}
      </div>
    {/if}
    
    {#if isEditMode}
      <div class="edit-overlay">
        <div class="edit-info">
          <div>Range: {gaugeConfig().minValue} - {gaugeConfig().maxValue}</div>
          <div>Arc: {gaugeConfig().arcWidth}px</div>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .gauge-widget {
    @apply w-full h-full flex flex-col items-center justify-center relative;
  }

  .gauge-container {
    @apply flex-1 flex items-center justify-center;
    width: min(100%, 180px);
    height: min(100%, 180px);
  }

  :global(.gauge-svg) {
    @apply w-full h-full;
  }

  :global(.gauge-background) {
    fill: #374151;
    opacity: 0.3;
  }

  :global(.gauge-value) {
    transition: all 0.3s ease;
    filter: drop-shadow(0 0 4px currentColor);
  }

  .gauge-value-text {
    @apply text-lg font-bold;
    font-family: 'Orbitron', monospace;
  }

  .gauge-label-text {
    @apply text-xs font-medium fill-gray-400;
    font-family: 'Orbitron', monospace;
  }

  .gauge-tick-label {
    @apply text-xs fill-gray-500;
    font-family: 'Orbitron', monospace;
  }

  :global(.gauge-threshold) {
    opacity: 0.8;
  }

  :global(.gauge-threshold.warning) {
    filter: drop-shadow(0 0 2px #f59e0b);
  }

  :global(.gauge-threshold.critical) {
    filter: drop-shadow(0 0 2px #ef4444);
  }

  .gauge-info {
    @apply absolute bottom-2 left-2 right-2 flex justify-between items-end;
  }

  .alert-badge {
    @apply px-2 py-1 rounded text-xs font-bold;
  }

  .alert-badge.warning {
    @apply bg-yellow-500/20 text-yellow-400 border border-yellow-400/30;
  }

  .alert-badge.critical {
    @apply bg-red-500/20 text-red-400 border border-red-400/30;
    animation: critical-pulse 1s ease-in-out infinite;
  }

  .edit-overlay {
    @apply absolute inset-0 bg-black/50 flex items-center justify-center;
    @apply opacity-0 hover:opacity-100 transition-opacity;
  }

  .edit-info {
    @apply bg-gray-800 border border-gray-600 rounded p-2 text-xs;
  }

  @keyframes critical-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
</style>