<!--
SenseCanvas Widget Preview Component
Live preview of widget configuration with mock data for visualization.
-->

<script lang="ts">
  import type { WidgetConfig } from '../../types/widgets.js';

  interface Props {
    config: WidgetConfig | Partial<WidgetConfig>;
  }

  let { config }: Props = $props();

  // ✅ Using Svelte 5 runes for preview state
  let mockData = $state({
    cpu: { usage: 65, temperature: 72, frequency: 3.8 },
    gpu: { usage: 45, temperature: 68, memory: 7.2, frequency: 1850 },
    memory: { usage: 78, available: 5.6, total: 16 },
    storage: { usage: 45, read: 150, write: 95 },
    network: { upload: 2.5, download: 15.3 }
  });

  let animationFrame = $state(0);

  // ✅ Derived widget style
  let widgetStyle = $derived(() => {
    const baseStyle = {
      width: `${config.size?.width || 200}px`,
      height: `${config.size?.height || 200}px`,
      opacity: config.style?.opacity || 1,
      borderRadius: `${config.style?.borderRadius || 8}px`,
      fontFamily: config.style?.fontFamily || 'Orbitron, monospace'
    };

    // Apply theme-specific styling
    const theme = config.style?.theme || 'default';
    const colors = config.style?.colors || ['#22d3ee', '#ef4444', '#f59e0b'];
    
    switch (theme) {
      case 'cyberpunk':
        return {
          ...baseStyle,
          background: `linear-gradient(135deg, ${colors[0]}20, ${colors[1] || colors[0]}20)`,
          border: `2px solid ${colors[0]}`,
          boxShadow: `0 0 20px ${colors[0]}40`
        };
      case 'gaming':
        return {
          ...baseStyle,
          background: `linear-gradient(45deg, ${colors[0]}15, ${colors[1] || colors[0]}15)`,
          border: `1px solid ${colors[0]}`,
          boxShadow: `0 4px 12px ${colors[0]}30`
        };
      case 'minimal':
        return {
          ...baseStyle,
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          color: '#1f2937'
        };
      case 'rgb':
        return {
          ...baseStyle,
          background: `linear-gradient(90deg, ${colors.join(', ')})`,
          border: '2px solid transparent',
          backgroundClip: 'padding-box'
        };
      default:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #1f2937, #374151)',
          border: `1px solid ${colors[0]}`,
          color: '#f9fafb'
        };
    }
  });

  let sensorData = $derived(() => {
    const sensor = config.sensorType || 'cpu';
    return mockData[sensor];
  });

  let primaryValue = $derived(() => {
    if (!sensorData) return 0;
    return sensorData.usage || sensorData.temperature || 0;
  });

  let alertStatus = $derived(() => {
    if (!config.alerts?.enabled) return 'normal';
    
    const value = primaryValue;
    const { warning, critical } = config.alerts.thresholds || { warning: 75, critical: 90 };
    
    if (value >= critical) return 'critical';
    if (value >= warning) return 'warning';
    return 'normal';
  });

  // ✅ Using $effect for animation
  $effect(() => {
    const interval = setInterval(() => {
      animationFrame = (animationFrame + 1) % 360;
      
      // Simulate changing sensor values
      const variation = Math.sin(animationFrame * 0.1) * 10;
      mockData.cpu.usage = Math.max(30, Math.min(90, 65 + variation));
      mockData.gpu.usage = Math.max(20, Math.min(80, 45 + variation * 0.7));
      mockData.memory.usage = Math.max(50, Math.min(95, 78 + variation * 0.5));
    }, 100);

    return () => clearInterval(interval);
  });

  // Gauge arc calculation
  function calculateGaugeArc(value: number, gaugeConfig: any) {
    const { minValue = 0, maxValue = 100, startAngle = -135, endAngle = 135 } = gaugeConfig || {};
    const normalizedValue = Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue)));
    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + (totalAngle * normalizedValue);
    
    return {
      startAngle,
      endAngle: currentAngle,
      totalAngle,
      normalizedValue
    };
  }

  // Generate gauge SVG path
  function generateGaugePath(value: number, gaugeConfig: any) {
    const { startAngle = -135, endAngle = 135, arcWidth = 10 } = gaugeConfig || {};
    const arc = calculateGaugeArc(value, gaugeConfig);
    
    const centerX = 50;
    const centerY = 50;
    const radius = 40;
    const innerRadius = radius - arcWidth;
    
    const startRad = (arc.startAngle * Math.PI) / 180;
    const endRad = (arc.endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);
    const x3 = centerX + innerRadius * Math.cos(endRad);
    const y3 = centerY + innerRadius * Math.sin(endRad);
    const x4 = centerX + innerRadius * Math.cos(startRad);
    const y4 = centerY + innerRadius * Math.sin(startRad);
    
    const largeArc = Math.abs(arc.endAngle - arc.startAngle) > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4} Z`;
  }

  // Generate mock graph data
  function generateGraphData(points = 20) {
    const data = [];
    const baseValue = primaryValue;
    
    for (let i = 0; i < points; i++) {
      const variation = Math.sin((i + animationFrame * 0.1) * 0.5) * 15;
      data.push({
        x: i,
        y: Math.max(0, Math.min(100, baseValue + variation))
      });
    }
    
    return data;
  }

  // Generate SVG path for graph
  function generateGraphPath(data: any[]) {
    if (data.length === 0) return '';
    
    const width = 100;
    const height = 60;
    const padding = 10;
    
    const xScale = (width - padding * 2) / (data.length - 1);
    const yScale = (height - padding * 2) / 100;
    
    let path = `M ${padding} ${height - padding - (data[0].y * yScale)}`;
    
    for (let i = 1; i < data.length; i++) {
      const x = padding + (i * xScale);
      const y = height - padding - (data[i].y * yScale);
      path += ` L ${x} ${y}`;
    }
    
    return path;
  }

  function formatValue(value: number, unit?: string): string {
    const formatted = Math.round(value * 10) / 10;
    return unit ? `${formatted}${unit}` : `${formatted}`;
  }

  function getAlertColor(status: string): string {
    switch (status) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#10b981';
    }
  }
</script>

<div class="widget-preview">
  <div class="preview-container" style={Object.entries(widgetStyle).map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`).join('; ')}>
    <!-- Gauge Widget Preview -->
    {#if config.type === 'gauge'}
      <div class="gauge-widget">
        <div class="gauge-container">
          <svg viewBox="0 0 100 100" class="gauge-svg">
            <!-- Background arc -->
            <path 
              d={generateGaugePath(100, config.gaugeConfig)}
              fill="currentColor"
              opacity="0.1"
            />
            <!-- Value arc -->
            <path 
              d={generateGaugePath(primaryValue, config.gaugeConfig)}
              fill={getAlertColor(alertStatus)}
              class="gauge-arc"
            />
            <!-- Center circle -->
            <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.2" />
          </svg>
          
          {#if config.gaugeConfig?.showValue}
            <div class="gauge-value">
              <span class="value-number">{formatValue(primaryValue)}</span>
              {#if config.gaugeConfig?.unit}
                <span class="value-unit">{config.gaugeConfig.unit}</span>
              {/if}
            </div>
          {/if}
        </div>
        
        {#if config.gaugeConfig?.showLabel || config.title}
          <div class="widget-title">{config.title || 'Gauge Widget'}</div>
        {/if}
      </div>
    {/if}

    <!-- Graph Widget Preview -->
    {#if config.type === 'graph'}
      <div class="graph-widget">
        {#if config.title}
          <div class="widget-title">{config.title}</div>
        {/if}
        
        <div class="graph-container">
          <svg viewBox="0 0 100 70" class="graph-svg">
            <!-- Grid lines -->
            {#if config.graphConfig?.showGrid}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" stroke-width="0.3" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100" height="70" fill="url(#grid)" />
            {/if}
            
            <!-- Graph line -->
            <path 
              d={generateGraphPath(generateGraphData())}
              fill="none" 
              stroke={config.style?.colors?.[0] || '#22d3ee'} 
              stroke-width="2"
              class="graph-line"
            />
            
            <!-- Fill area -->
            {#if config.graphConfig?.fillArea}
              <path 
                d={generateGraphPath(generateGraphData()) + ' L 90 60 L 10 60 Z'}
                fill={config.style?.colors?.[0] || '#22d3ee'} 
                opacity="0.2"
              />
            {/if}
          </svg>
          
          <div class="graph-value">
            {formatValue(primaryValue)}{config.graphConfig?.unit || '%'}
          </div>
        </div>
      </div>
    {/if}

    <!-- Text Widget Preview -->
    {#if config.type === 'text'}
      <div class="text-widget">
        {#if config.title}
          <div class="widget-title">{config.title}</div>
        {/if}
        
        <div 
          class="text-content"
          style={`
            font-size: ${config.textConfig?.fontSize || 16}px;
            font-weight: ${config.textConfig?.fontWeight || 'normal'};
            text-align: ${config.textConfig?.alignment || 'center'};
          `}
        >
          {#if config.textConfig?.showIcon}
            <span class="text-icon">{['🖥️', '🎮', '🧠', '💾', '🌐'][['cpu', 'gpu', 'memory', 'storage', 'network'].indexOf(config.sensorType || 'cpu')]}</span>
          {/if}
          
          <span class="text-value">
            {config.textConfig?.format?.replace('{value}', formatValue(primaryValue)) || formatValue(primaryValue)}
          </span>
        </div>
      </div>
    {/if}

    <!-- Multi-Sensor Widget Preview -->
    {#if config.type === 'multi-sensor'}
      <div class="multi-sensor-widget">
        {#if config.title}
          <div class="widget-title">{config.title}</div>
        {/if}
        
        <div class="multi-sensor-container" class:grid-layout={config.multiSensorConfig?.layout === 'grid'}>
          {#each (config.multiSensorConfig?.sensors || ['cpu', 'gpu', 'memory']) as sensor}
            <div class="sensor-item">
              <div class="sensor-label">
                <span class="sensor-icon">{['🖥️', '🎮', '🧠'][['cpu', 'gpu', 'memory'].indexOf(sensor)]}</span>
                {#if config.multiSensorConfig?.showLabels !== false}
                  <span class="sensor-name">{sensor.toUpperCase()}</span>
                {/if}
              </div>
              
              {#if config.multiSensorConfig?.showValues !== false}
                <div class="sensor-value">
                  <span class="value-number">{formatValue(mockData[sensor]?.usage || 0)}</span>
                  <span class="value-unit">%</span>
                </div>
              {/if}
              
              <div class="sensor-bar">
                <div 
                  class="sensor-bar-fill"
                  style={`
                    width: ${mockData[sensor]?.usage || 0}%;
                    background-color: ${config.style?.colors?.[['cpu', 'gpu', 'memory'].indexOf(sensor)] || '#22d3ee'};
                  `}
                ></div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Alert Indicators -->
    {#if config.alerts?.enabled && alertStatus !== 'normal'}
      <div class="alert-indicator" class:flash={config.alerts.flashWidget}>
        <span class="alert-icon">
          {alertStatus === 'critical' ? '🔴' : '🟡'}
        </span>
      </div>
    {/if}

    <!-- Preview Overlay -->
    <div class="preview-overlay">
      <div class="preview-badge">Preview</div>
    </div>
  </div>

  <!-- Preview Info -->
  <div class="preview-info">
    <div class="info-item">
      <span class="info-label">Type:</span>
      <span class="info-value">{config.type || 'gauge'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Sensor:</span>
      <span class="info-value">{config.sensorType || 'cpu'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Theme:</span>
      <span class="info-value">{config.style?.theme || 'default'}</span>
    </div>
    <div class="info-item">
      <span class="info-label">Size:</span>
      <span class="info-value">{config.size?.width || 200} × {config.size?.height || 200}</span>
    </div>
  </div>
</div>

<style>
  .widget-preview {
    @apply h-full flex flex-col bg-gray-900/50 rounded-lg overflow-hidden;
  }

  .preview-container {
    @apply flex-1 relative m-4 rounded-lg overflow-hidden;
    @apply flex items-center justify-center;
    min-height: 200px;
    transition: all 0.3s ease;
  }

  .preview-overlay {
    @apply absolute top-2 right-2;
  }

  .preview-badge {
    @apply px-2 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded;
    @apply text-xs text-cyan-400 font-medium;
  }

  .alert-indicator {
    @apply absolute top-2 left-2 text-lg;
  }

  .alert-indicator.flash {
    animation: flash 1s ease-in-out infinite alternate;
  }

  /* Widget-specific styles */
  .gauge-widget,
  .graph-widget,
  .text-widget,
  .multi-sensor-widget {
    @apply w-full h-full flex flex-col items-center justify-center;
    @apply text-gray-100;
  }

  .widget-title {
    @apply text-sm font-bold mb-2 text-center;
    @apply text-gray-300;
  }

  /* Gauge styles */
  .gauge-container {
    @apply relative;
  }

  .gauge-svg {
    @apply w-32 h-32;
  }

  .gauge-arc {
    transition: d 0.3s ease;
  }

  .gauge-value {
    @apply absolute inset-0 flex flex-col items-center justify-center;
  }

  .value-number {
    @apply text-xl font-bold;
  }

  .value-unit {
    @apply text-sm opacity-75;
  }

  /* Graph styles */
  .graph-container {
    @apply relative w-full flex-1;
  }

  .graph-svg {
    @apply w-full h-24;
  }

  .graph-line {
    transition: stroke 0.3s ease;
  }

  .graph-value {
    @apply absolute bottom-2 right-2 text-sm font-bold;
    @apply bg-gray-900/80 px-2 py-1 rounded;
  }

  /* Text styles */
  .text-content {
    @apply flex items-center gap-2;
  }

  .text-icon {
    @apply text-2xl;
  }

  .text-value {
    @apply font-bold;
  }

  /* Multi-sensor styles */
  .multi-sensor-container {
    @apply w-full space-y-2;
  }

  .multi-sensor-container.grid-layout {
    @apply grid grid-cols-2 gap-2 space-y-0;
  }

  .sensor-item {
    @apply flex flex-col gap-1;
  }

  .sensor-label {
    @apply flex items-center gap-1;
  }

  .sensor-icon {
    @apply text-sm;
  }

  .sensor-name {
    @apply text-xs font-medium;
  }

  .sensor-value {
    @apply flex items-baseline gap-1;
  }

  .sensor-value .value-number {
    @apply text-sm font-bold;
  }

  .sensor-value .value-unit {
    @apply text-xs opacity-75;
  }

  .sensor-bar {
    @apply w-full h-1 bg-gray-700 rounded-full overflow-hidden;
  }

  .sensor-bar-fill {
    @apply h-full transition-all duration-300;
  }

  /* Preview info */
  .preview-info {
    @apply p-3 bg-gray-800/30 border-t border-gray-700;
    @apply grid grid-cols-2 gap-2 text-xs;
  }

  .info-item {
    @apply flex justify-between;
  }

  .info-label {
    @apply text-gray-400;
  }

  .info-value {
    @apply text-gray-300 font-medium;
  }

  /* Animations */
  @keyframes flash {
    0% { opacity: 1; }
    100% { opacity: 0.5; }
  }

  /* Mobile responsiveness */
  @media (max-width: 768px) {
    .gauge-svg {
      @apply w-24 h-24;
    }

    .value-number {
      @apply text-lg;
    }

    .graph-svg {
      @apply h-16;
    }

    .preview-info {
      @apply grid-cols-1;
    }
  }
</style>