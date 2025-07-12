<!--
SenseCanvas Multi-Sensor Widget Component
Displays multiple hardware sensors in grid, list, or radial layouts.
-->

<script lang="ts">
  import type { WidgetConfig } from '../../types/widgets.js';
  import { hardwareStore } from '../../stores/hardware.svelte.js';

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

  interface SensorData {
    type: string;
    value: number;
    unit: string;
    icon: string;
    color: string;
    alert?: string;
    label: string;
  }

  // ✅ Using Svelte 5 runes for multi-sensor state
  let selectedSensor = $state<string | null>(null);
  let animationStagger = $state(0);

  // ✅ Derived values for multi-sensor configuration
  let multiConfig = $derived(() => config.multiSensorConfig || {
    sensors: ['cpu', 'gpu', 'memory'],
    layout: 'grid',
    showLabels: true,
    showValues: true,
    compactMode: false
  });

  let sensorData = $derived(() => {
    const sensors: SensorData[] = [];
    const metrics = hardwareStore.metrics;
    
    if (!metrics) {
      // Return sample data for edit mode
      return multiConfig().sensors.map((sensorType, index) => ({
        type: sensorType,
        value: 45 + (index * 15) + Math.random() * 20,
        unit: '%',
        icon: getSensorIcon(sensorType),
        color: config.style.colors[index % config.style.colors.length] || '#22d3ee',
        label: sensorType.toUpperCase(),
        alert: undefined
      }));
    }

    multiConfig().sensors.forEach((sensorType, index) => {
      let value = 0;
      let unit = '%';
      let alert: string | undefined;

      switch (sensorType) {
        case 'cpu':
          value = metrics.cpu?.usage || 0;
          if (config.alerts.enabled) {
            if (value >= config.alerts.thresholds.critical) alert = 'critical';
            else if (value >= config.alerts.thresholds.warning) alert = 'warning';
          }
          break;
        case 'gpu':
          value = metrics.gpu?.usage || 0;
          if (config.alerts.enabled) {
            if (value >= config.alerts.thresholds.critical) alert = 'critical';
            else if (value >= config.alerts.thresholds.warning) alert = 'warning';
          }
          break;
        case 'memory':
          value = metrics.memory?.usage || 0;
          if (config.alerts.enabled) {
            if (value >= config.alerts.thresholds.critical) alert = 'critical';
            else if (value >= config.alerts.thresholds.warning) alert = 'warning';
          }
          break;
        case 'storage':
          value = metrics.storage?.[0]?.usage || 0;
          break;
        case 'network':
          value = metrics.network?.speed || 0;
          unit = 'Mbps';
          break;
      }

      sensors.push({
        type: sensorType,
        value,
        unit,
        icon: getSensorIcon(sensorType),
        color: config.style.colors[index % config.style.colors.length] || '#22d3ee',
        label: sensorType.toUpperCase(),
        alert
      });
    });

    return sensors;
  });

  let layoutClasses = $derived(() => {
    const classes = ['multi-sensor-container'];
    classes.push(`layout-${multiConfig().layout}`);
    if (multiConfig().compactMode) classes.push('compact');
    return classes.join(' ');
  });

  let maxAlertLevel = $derived(() => {
    const alerts = sensorData().map(s => s.alert).filter(Boolean);
    if (alerts.includes('critical')) return 'critical';
    if (alerts.includes('warning')) return 'warning';
    return 'normal';
  });

  // ✅ Using $effect for staggered animations
  $effect(() => {
    const interval = setInterval(() => {
      animationStagger = (animationStagger + 1) % sensorData().length;
    }, 200);

    return () => clearInterval(interval);
  });

  function getSensorIcon(sensorType: string): string {
    switch (sensorType) {
      case 'cpu': return '🖥️';
      case 'gpu': return '🎮';
      case 'memory': return '💾';
      case 'storage': return '💿';
      case 'network': return '🌐';
      default: return '📊';
    }
  }

  function getSensorColor(sensor: SensorData): string {
    if (sensor.alert === 'critical') return '#ef4444';
    if (sensor.alert === 'warning') return '#f59e0b';
    return sensor.color;
  }

  function handleSensorSelect(sensorType: string) {
    selectedSensor = selectedSensor === sensorType ? null : sensorType;
  }

  function getRadialPosition(index: number, total: number): { x: number; y: number } {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    const radius = 40;
    const centerX = 50;
    const centerY = 50;
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }

  function formatValue(value: number): string {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
    return value.toFixed(1);
  }
</script>

<div class="multi-sensor-widget">
  <!-- Layout Container -->
  <div class={layoutClasses}>
    {#each sensorData() as sensor, index}
      {@const position = multiConfig().layout === 'radial' ? getRadialPosition(index, sensorData().length) : null}
      
      <div 
        class="sensor-item"
        class:selected={selectedSensor === sensor.type}
        class:has-alert={sensor.alert}
        class:animate={animationStagger === index}
        style={position ? `position: absolute; left: ${position.x}%; top: ${position.y}%; transform: translate(-50%, -50%);` : ''}
        onclick={() => handleSensorSelect(sensor.type)}
        role="button"
        tabindex="0"
        aria-label={`${sensor.label} sensor: ${sensor.value}${sensor.unit}`}
      >
        <!-- Sensor Icon -->
        <div 
          class="sensor-icon"
          style="color: {getSensorColor(sensor)}"
        >
          {sensor.icon}
        </div>
        
        <!-- Sensor Value -->
        {#if multiConfig().showValues}
          <div 
            class="sensor-value"
            style="color: {getSensorColor(sensor)}"
          >
            {formatValue(sensor.value)}
            {#if !multiConfig().compactMode}
              <span class="sensor-unit">{sensor.unit}</span>
            {/if}
          </div>
        {/if}
        
        <!-- Sensor Label -->
        {#if multiConfig().showLabels && !multiConfig().compactMode}
          <div class="sensor-label">
            {sensor.label}
          </div>
        {/if}
        
        <!-- Alert Indicator -->
        {#if sensor.alert}
          <div class="sensor-alert {sensor.alert}">
            {sensor.alert === 'critical' ? '🚨' : '⚠️'}
          </div>
        {/if}
        
        <!-- Value Bar (for compact grid mode) -->
        {#if multiConfig().compactMode && multiConfig().layout === 'grid'}
          <div class="value-bar">
            <div 
              class="value-fill"
              style="width: {sensor.value}%; background: {getSensorColor(sensor)}"
            ></div>
          </div>
        {/if}
      </div>
    {/each}
    
    <!-- Center info for radial layout -->
    {#if multiConfig().layout === 'radial'}
      <div class="radial-center">
        <div class="center-title">{config.title}</div>
        <div class="center-status {maxAlertLevel()}">
          {maxAlertLevel() === 'normal' ? '✅' : maxAlertLevel() === 'warning' ? '⚠️' : '🚨'}
        </div>
      </div>
    {/if}
  </div>

  <!-- Selected Sensor Details -->
  {#if selectedSensor}
    {@const selected = sensorData().find(s => s.type === selectedSensor)}
    {#if selected}
      <div class="sensor-details">
        <div class="details-header">
          <span class="details-icon">{selected.icon}</span>
          <span class="details-title">{selected.label}</span>
        </div>
        <div class="details-value" style="color: {getSensorColor(selected)}">
          {selected.value.toFixed(2)}{selected.unit}
        </div>
        {#if selected.alert}
          <div class="details-alert {selected.alert}">
            {selected.alert.toUpperCase()} THRESHOLD EXCEEDED
          </div>
        {/if}
      </div>
    {/if}
  {/if}

  <!-- Overall Status -->
  <div class="overall-status">
    <div class="status-indicator {maxAlertLevel()}">
      {maxAlertLevel() === 'normal' ? 'ALL NORMAL' : 
       maxAlertLevel() === 'warning' ? 'WARNING' : 'CRITICAL'}
    </div>
    <div class="sensor-count">
      {sensorData().length} sensors
    </div>
  </div>

  <!-- Edit Mode Info -->
  {#if isEditMode}
    <div class="edit-info">
      <div class="edit-title">Multi-Sensor Configuration</div>
      <div class="edit-details">
        <div>Layout: {multiConfig().layout}</div>
        <div>Sensors: {multiConfig().sensors.join(', ')}</div>
        <div>Compact: {multiConfig().compactMode ? 'Yes' : 'No'}</div>
      </div>
    </div>
  {/if}
</div>

<style>
  .multi-sensor-widget {
    @apply w-full h-full relative;
    font-family: 'Orbitron', monospace;
  }

  .multi-sensor-container {
    @apply w-full h-full p-2;
  }

  .layout-grid {
    @apply grid gap-2;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  }

  .layout-list {
    @apply flex flex-col gap-2;
  }

  .layout-radial {
    @apply relative;
    height: 100%;
  }

  .layout-grid.compact {
    grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  }

  .sensor-item {
    @apply bg-gray-800/50 border border-gray-600 rounded-lg p-2;
    @apply flex flex-col items-center justify-center gap-1;
    @apply hover:bg-gray-700/50 transition-all duration-200;
    @apply cursor-pointer;
    min-height: 60px;
  }

  .layout-list .sensor-item {
    @apply flex-row justify-between px-3;
    min-height: 40px;
  }

  .layout-radial .sensor-item {
    @apply w-12 h-12 p-1;
    min-height: auto;
  }

  .compact .sensor-item {
    @apply p-1 gap-0;
    min-height: 50px;
  }

  .sensor-item.selected {
    @apply border-cyan-400 bg-cyan-900/20;
    box-shadow: 0 0 10px rgba(34, 211, 238, 0.3);
  }

  .sensor-item.has-alert {
    @apply border-yellow-400;
  }

  .sensor-item.has-alert .sensor-alert.critical {
    @apply border-red-400;
  }

  .sensor-item.animate {
    animation: sensor-pulse 0.5s ease-in-out;
  }

  .sensor-icon {
    @apply text-lg;
    filter: drop-shadow(0 0 4px currentColor);
  }

  .layout-radial .sensor-icon {
    @apply text-sm;
  }

  .compact .sensor-icon {
    @apply text-base;
  }

  .sensor-value {
    @apply font-bold text-sm;
    text-shadow: 0 0 6px currentColor;
  }

  .layout-list .sensor-value {
    @apply text-lg;
  }

  .sensor-unit {
    @apply text-xs opacity-75 ml-0.5;
  }

  .sensor-label {
    @apply text-xs text-gray-400 font-medium;
  }

  .sensor-alert {
    @apply absolute -top-1 -right-1 text-xs;
  }

  .value-bar {
    @apply w-full h-1 bg-gray-700 rounded-full overflow-hidden mt-1;
  }

  .value-fill {
    @apply h-full transition-all duration-300;
  }

  .radial-center {
    @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
    @apply text-center;
  }

  .center-title {
    @apply text-sm font-bold text-gray-300;
  }

  .center-status {
    @apply text-lg mt-1;
  }

  .center-status.warning {
    color: #f59e0b;
  }

  .center-status.critical {
    color: #ef4444;
    animation: critical-pulse 1s ease-in-out infinite;
  }

  .sensor-details {
    @apply absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm;
    @apply border border-gray-600 rounded-lg p-3;
  }

  .details-header {
    @apply flex items-center gap-2 mb-1;
  }

  .details-icon {
    @apply text-lg;
  }

  .details-title {
    @apply font-bold text-gray-300;
  }

  .details-value {
    @apply text-xl font-bold mb-1;
  }

  .details-alert {
    @apply text-xs font-bold px-2 py-1 rounded;
  }

  .details-alert.warning {
    @apply bg-yellow-500/20 text-yellow-400;
  }

  .details-alert.critical {
    @apply bg-red-500/20 text-red-400;
  }

  .overall-status {
    @apply absolute top-2 right-2 text-right;
  }

  .status-indicator {
    @apply text-xs font-bold px-2 py-1 rounded;
  }

  .status-indicator.normal {
    @apply bg-green-500/20 text-green-400;
  }

  .status-indicator.warning {
    @apply bg-yellow-500/20 text-yellow-400;
  }

  .status-indicator.critical {
    @apply bg-red-500/20 text-red-400;
  }

  .sensor-count {
    @apply text-xs text-gray-400 mt-1;
  }

  .edit-info {
    @apply absolute top-2 left-2 bg-black/70 backdrop-blur-sm;
    @apply border border-gray-600 rounded-lg p-2;
    @apply opacity-0 hover:opacity-100 transition-opacity;
  }

  .edit-title {
    @apply text-xs font-bold text-cyan-400 mb-1;
  }

  .edit-details {
    @apply text-xs text-gray-300 space-y-0.5;
  }

  @keyframes sensor-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes critical-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
</style>