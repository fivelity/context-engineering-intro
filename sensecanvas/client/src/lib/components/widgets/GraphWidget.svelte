<!--
SenseCanvas Graph Widget Component
Time-series graph widget using LayerChart@next with real-time data visualization.
-->

<script lang="ts">
  import { Chart, Svg, Area, Line, LinearGradient, Axis, Tooltip } from 'layerchart';
  import { scaleTime, scaleLinear } from 'd3-scale';
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

  interface DataPoint {
    timestamp: Date;
    value: number;
    alert?: string;
  }

  // ✅ Using Svelte 5 runes for graph state
  let dataPoints = $state<DataPoint[]>([]);
  let isCollecting = $state(true);
  let hoveredPoint = $state<DataPoint | null>(null);

  // ✅ Derived values for graph configuration
  let graphConfig = $derived(() => config.graphConfig || {
    timeRange: 60, // minutes
    maxDataPoints: 100,
    showGrid: true,
    showAxes: true,
    lineWidth: 2,
    fillArea: true,
    smoothing: true,
    yAxisMin: 0,
    yAxisMax: 100
  });

  let timeRange = $derived(() => graphConfig().timeRange * 60 * 1000); // Convert to milliseconds
  let now = $derived(() => new Date());
  let startTime = $derived(() => new Date(now().getTime() - timeRange()));

  let filteredData = $derived(() => {
    const cutoff = startTime();
    return dataPoints.filter(point => point.timestamp >= cutoff);
  });

  let xScale = $derived(() => scaleTime()
    .domain([startTime(), now()])
    .range([0, 100]));

  let yScale = $derived(() => scaleLinear()
    .domain([graphConfig().yAxisMin || 0, graphConfig().yAxisMax || 100])
    .range([100, 0]));

  let lineColor = $derived(() => {
    if (alertLevel !== 'normal') return alertColor;
    return config.style.colors[0] || '#22d3ee';
  });

  let areaGradient = $derived(() => {
    const color = lineColor();
    return {
      id: `gradient-${config.id}`,
      stops: [
        { offset: '0%', color: color, opacity: 0.6 },
        { offset: '100%', color: color, opacity: 0.1 }
      ]
    };
  });

  // ✅ Using $effect for data collection
  $effect(() => {
    if (!isCollecting || isEditMode) return;

    const interval = setInterval(() => {
      const newPoint: DataPoint = {
        timestamp: new Date(),
        value: widgetValue,
        alert: alertLevel !== 'normal' ? alertLevel : undefined
      };

      // Add new point and limit data points
      dataPoints = [...dataPoints, newPoint].slice(-graphConfig().maxDataPoints);
    }, 1000); // Collect every second

    return () => clearInterval(interval);
  });

  // ✅ Using $effect for data cleanup
  $effect(() => {
    // Clean up old data points beyond time range
    const cutoff = startTime();
    dataPoints = dataPoints.filter(point => point.timestamp >= cutoff);
  });

  // Generate sample data for edit mode
  function generateSampleData(): DataPoint[] {
    const points: DataPoint[] = [];
    const currentTime = new Date();
    const interval = timeRange() / 50; // 50 sample points
    
    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(currentTime.getTime() - (50 - i) * interval);
      const baseValue = 30 + Math.sin(i * 0.2) * 20 + Math.random() * 10;
      const value = Math.max(0, Math.min(100, baseValue));
      
      points.push({
        timestamp,
        value,
        alert: value > 80 ? 'critical' : value > 60 ? 'warning' : undefined
      });
    }
    
    return points;
  }

  // Initialize with sample data in edit mode
  $effect(() => {
    if (isEditMode && dataPoints.length === 0) {
      dataPoints = generateSampleData();
    }
  });

  function formatTimestamp(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function formatValue(value: number): string {
    return `${value.toFixed(1)}${graphConfig().unit || '%'}`;
  }

  function handlePointHover(point: DataPoint | null) {
    hoveredPoint = point;
  }

  function toggleDataCollection() {
    isCollecting = !isCollecting;
  }

  function clearData() {
    dataPoints = [];
  }
</script>

<div class="graph-widget">
  <!-- Graph Container -->
  <div class="graph-container">
    {#if filteredData.length > 0}
      <Chart
        data={filteredData}
        x={d => xScale(d.timestamp)}
        y={d => yScale(d.value)}
        xScale={xScale}
        yScale={yScale}
        padding={{ top: 10, right: 20, bottom: 30, left: 40 }}
      >
        <Svg>
          <!-- Gradient definition -->
          <LinearGradient
            id={areaGradient().id}
            stops={areaGradient().stops}
            direction="vertical"
          />
          
          <!-- Grid lines -->
          {#if graphConfig().showGrid}
            <Axis placement="left" grid={{ style: 'stroke: #374151; stroke-dasharray: 2,2; opacity: 0.5' }} />
            <Axis placement="bottom" grid={{ style: 'stroke: #374151; stroke-dasharray: 2,2; opacity: 0.5' }} />
          {/if}
          
          <!-- Area fill -->
          {#if graphConfig().fillArea}
            <Area
              fill={`url(#${areaGradient().id})`}
              curve={graphConfig().smoothing ? 'curveMonotoneX' : 'curveLinear'}
            />
          {/if}
          
          <!-- Line -->
          <Line
            stroke={lineColor()}
            strokeWidth={graphConfig().lineWidth}
            curve={graphConfig().smoothing ? 'curveMonotoneX' : 'curveLinear'}
            class="graph-line"
          />
          
          <!-- Alert threshold lines -->
          {#if config.alerts.enabled}
            <line
              x1="0"
              y1={yScale(config.alerts.thresholds.warning)}
              x2="100"
              y2={yScale(config.alerts.thresholds.warning)}
              stroke="#f59e0b"
              stroke-width="1"
              stroke-dasharray="4,4"
              opacity="0.7"
            />
            <line
              x1="0"
              y1={yScale(config.alerts.thresholds.critical)}
              x2="100"
              y2={yScale(config.alerts.thresholds.critical)}
              stroke="#ef4444"
              stroke-width="1"
              stroke-dasharray="4,4"
              opacity="0.7"
            />
          {/if}
          
          <!-- Axes -->
          {#if graphConfig().showAxes}
            <Axis 
              placement="left" 
              tickFormat={d => `${d}${graphConfig().unit || '%'}`}
              style="stroke: #6b7280; font-size: 10px; font-family: 'Orbitron', monospace;"
            />
            <Axis 
              placement="bottom" 
              tickFormat={d => formatTimestamp(d)}
              style="stroke: #6b7280; font-size: 10px; font-family: 'Orbitron', monospace;"
            />
          {/if}
        </Svg>
        
        <!-- Interactive tooltip -->
        <Tooltip
          let:data
          on:hover={e => handlePointHover(e.detail)}
        >
          {#if hoveredPoint}
            <div class="graph-tooltip">
              <div class="tooltip-time">{formatTimestamp(hoveredPoint.timestamp)}</div>
              <div class="tooltip-value">{formatValue(hoveredPoint.value)}</div>
              {#if hoveredPoint.alert}
                <div class="tooltip-alert {hoveredPoint.alert}">
                  {hoveredPoint.alert.toUpperCase()}
                </div>
              {/if}
            </div>
          {/if}
        </Tooltip>
      </Chart>
    {:else}
      <div class="no-data">
        <div class="no-data-icon">📊</div>
        <div class="no-data-text">
          {isEditMode ? 'Sample Data' : 'Collecting data...'}
        </div>
      </div>
    {/if}
  </div>

  <!-- Graph Controls -->
  {#if isEditMode || isSelected}
    <div class="graph-controls">
      <div class="control-group">
        <button 
          class="control-btn"
          class:active={isCollecting}
          onclick={toggleDataCollection}
        >
          {isCollecting ? '⏸️' : '▶️'}
        </button>
        
        <button 
          class="control-btn"
          onclick={clearData}
        >
          🗑️
        </button>
      </div>
      
      <div class="graph-stats">
        <span class="stat-item">
          {filteredData.length} points
        </span>
        <span class="stat-item">
          {graphConfig().timeRange}m range
        </span>
      </div>
    </div>
  {/if}

  <!-- Current value display -->
  <div class="current-value">
    <div class="value-number" style="color: {lineColor()}">
      {formatValue(widgetValue)}
    </div>
    <div class="value-label">
      {config.sensorType.toUpperCase()} Current
    </div>
  </div>

  <!-- Alert indicator -->
  {#if alertLevel !== 'normal'}
    <div class="alert-indicator {alertLevel}">
      <div class="alert-icon">
        {alertLevel === 'critical' ? '🚨' : '⚠️'}
      </div>
      <div class="alert-text">
        {alertLevel.toUpperCase()}
      </div>
    </div>
  {/if}
</div>

<style>
  .graph-widget {
    @apply w-full h-full flex flex-col relative;
  }

  .graph-container {
    @apply flex-1 relative overflow-hidden;
  }

  :global(.graph-line) {
    filter: drop-shadow(0 0 2px currentColor);
  }

  .no-data {
    @apply w-full h-full flex flex-col items-center justify-center text-gray-400;
  }

  .no-data-icon {
    @apply text-3xl mb-2;
  }

  .no-data-text {
    @apply text-sm font-medium;
  }

  .graph-tooltip {
    @apply bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm;
    @apply shadow-lg backdrop-blur-sm;
  }

  .tooltip-time {
    @apply text-gray-400 text-xs;
  }

  .tooltip-value {
    @apply text-white font-bold text-lg;
  }

  .tooltip-alert {
    @apply text-xs font-bold px-2 py-1 rounded mt-1 inline-block;
  }

  .tooltip-alert.warning {
    @apply bg-yellow-500/20 text-yellow-400;
  }

  .tooltip-alert.critical {
    @apply bg-red-500/20 text-red-400;
  }

  .graph-controls {
    @apply absolute top-2 right-2 flex items-center gap-2;
    @apply bg-black/50 backdrop-blur-sm rounded-lg p-2;
  }

  .control-group {
    @apply flex gap-1;
  }

  .control-btn {
    @apply w-6 h-6 flex items-center justify-center rounded text-xs;
    @apply bg-gray-700 hover:bg-gray-600 transition-colors;
  }

  .control-btn.active {
    @apply bg-cyan-500 text-white;
  }

  .graph-stats {
    @apply flex gap-2 text-xs text-gray-400;
  }

  .stat-item {
    @apply whitespace-nowrap;
  }

  .current-value {
    @apply absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-lg p-2;
  }

  .value-number {
    @apply text-lg font-bold;
    font-family: 'Orbitron', monospace;
  }

  .value-label {
    @apply text-xs text-gray-400;
    font-family: 'Orbitron', monospace;
  }

  .alert-indicator {
    @apply absolute top-2 left-2 flex items-center gap-1;
    @apply px-2 py-1 rounded-lg text-xs font-bold;
  }

  .alert-indicator.warning {
    @apply bg-yellow-500/20 text-yellow-400 border border-yellow-400/30;
  }

  .alert-indicator.critical {
    @apply bg-red-500/20 text-red-400 border border-red-400/30;
    animation: critical-pulse 1s ease-in-out infinite;
  }

  .alert-icon {
    @apply text-sm;
  }

  @keyframes critical-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
</style>