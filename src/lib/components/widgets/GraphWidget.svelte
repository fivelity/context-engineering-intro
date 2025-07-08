<script lang="ts">
	import { Chart, Svg, Tooltip, Area, Line, Bar, AxisY, AxisX } from 'layerchart';
	import { PeriodType, format } from 'layerchart/utils';
	import { scaleTime, scaleLinear } from 'd3-scale';
	import { sensorStore } from '$stores/sensorStore.js';
	import { cls, getSensorClass } from '$utils/classnames.js';
	import type { WidgetConfig } from '$types/widget.js';

	// Props
	export let widget: WidgetConfig;
	export let isDragging = false;
	export let isResizing = false;

	// Widget configuration
	let config = $derived(widget);
	let appearance = $derived(config.appearance);
	let chartParams = $derived(appearance.chartParams);

	// Chart type and configuration
	let chartType = $derived(chartParams?.chartType || 'line'); // 'line', 'area', 'bar'
	let timeRange = $derived(chartParams?.timeRange || 300); // seconds
	let showGrid = $derived(chartParams?.showGrid ?? true);
	let showLabels = $derived(chartParams?.showLabels ?? true);
	let animationDuration = $derived(chartParams?.animationDuration || 500);

	// Sensor data binding - get historical data
	let sensorHistory = $derived(() => {
		if (!config.sensorPath) return [];
		return sensorStore.getHistoryForSensor(config.sensorPath, timeRange);
	});

	// Process data for chart
	let chartData = $derived(() => {
		return sensorHistory.map(reading => ({
			timestamp: new Date(reading.timestamp),
			value: reading.value,
			unit: reading.unit
		}));
	});

	// Scales
	let xScale = $derived(() => {
		if (chartData.length === 0) return scaleTime();
		
		const extent = [
			new Date(Math.min(...chartData.map(d => d.timestamp.getTime()))),
			new Date(Math.max(...chartData.map(d => d.timestamp.getTime())))
		];
		
		return scaleTime().domain(extent);
	});

	let yScale = $derived(() => {
		if (chartData.length === 0) return scaleLinear();
		
		const values = chartData.map(d => d.value);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const padding = (max - min) * 0.1;
		
		return scaleLinear().domain([
			Math.max(0, min - padding),
			max + padding
		]);
	});

	// Color thresholds for different sensor types
	let colorThresholds = $derived(() => {
		const sensorType = config.sensorPath.split('.')[1];
		
		switch (sensorType) {
			case 'temperature':
				return { low: 50, medium: 70, high: 85 };
			case 'usage':
				return { low: 30, medium: 60, high: 85 };
			case 'voltage':
				return { low: 0.5, medium: 1.0, high: 1.5 };
			default:
				return { low: 30, medium: 60, high: 85 };
		}
	});

	// Chart color based on current value
	let chartColor = $derived(() => {
		const currentValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
		const colors = appearance.colors;
		
		if (currentValue >= colorThresholds.high) {
			return colors[2] || '#ef4444'; // Red for high/critical
		} else if (currentValue >= colorThresholds.medium) {
			return colors[1] || '#f97316'; // Orange for medium
		} else {
			return colors[0] || '#22c55e'; // Green for low/good
		}
	});

	// Unit display
	let unit = $derived(() => {
		if (chartData.length === 0) return '';
		return chartData[0].unit || '';
	});

	// Chart dimensions
	let margin = $derived(() => ({
		top: 10,
		right: 10,
		bottom: showLabels ? 40 : 10,
		left: showLabels ? 50 : 10
	}));

	// Accessibility label
	let ariaLabel = $derived(() => {
		const currentValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
		return `${config.title}: ${Math.round(currentValue)}${unit}, ${chartType} chart with ${chartData.length} data points`;
	});

	// Connection status
	let isConnected = $derived(sensorStore.isConnected);
	let connectionStatus = $derived(sensorStore.status);

	// Format functions
	function formatTime(date: Date): string {
		return format(date, PeriodType.Second, { variant: 'short' });
	}

	function formatValue(value: number): string {
		if (unit === 'MHz' && value > 1000) {
			return `${(value / 1000).toFixed(1)} GHz`;
		} else if (unit === 'GB') {
			return `${value.toFixed(1)} ${unit}`;
		} else if (unit === 'RPM') {
			return `${Math.round(value)} ${unit}`;
		} else {
			return `${Math.round(value)}${unit}`;
		}
	}

	// Statistics
	let stats = $derived(() => {
		if (chartData.length === 0) return { min: 0, max: 0, avg: 0, current: 0 };
		
		const values = chartData.map(d => d.value);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
		const current = values[values.length - 1];
		
		return { min, max, avg, current };
	});
</script>

<div 
	class="graph-widget"
	class:dragging={isDragging}
	class:resizing={isResizing}
	class:disconnected={!isConnected}
	role="img"
	aria-label={ariaLabel}
>
	{#if isConnected && chartData.length > 0}
		<div class="graph-content">
			<Chart
				data={chartData}
				x={d => d.timestamp}
				y={d => d.value}
				xScale={xScale}
				yScale={yScale}
				{margin}
				tooltip={{ mode: 'bisect-x' }}
			>
				<Svg>
					{#if showGrid}
						<AxisX 
							gridlines 
							tickCount={5}
							format={formatTime}
							tickLabelProps={{ 
								class: 'graph-axis-label',
								style: `font-size: ${Math.max(10, appearance.typography.fontSize * 0.75)}px`
							}}
						/>
						<AxisY 
							gridlines 
							tickCount={5}
							format={formatValue}
							tickLabelProps={{ 
								class: 'graph-axis-label',
								style: `font-size: ${Math.max(10, appearance.typography.fontSize * 0.75)}px`
							}}
						/>
					{/if}

					{#if chartType === 'area'}
						<Area 
							fill={chartColor}
							fillOpacity={0.3}
							stroke={chartColor}
							strokeWidth={2}
							class="graph-area"
						/>
					{:else if chartType === 'bar'}
						<Bar 
							fill={chartColor}
							stroke={chartColor}
							strokeWidth={1}
							class="graph-bar"
							radius={2}
						/>
					{:else}
						<!-- Default: line chart -->
						<Line 
							stroke={chartColor}
							strokeWidth={2}
							class="graph-line"
						/>
					{/if}
				</Svg>

				<Tooltip class="graph-tooltip" let:data>
					{#if data}
						<div class="tooltip-content">
							<div class="tooltip-time">
								{formatTime(data.timestamp)}
							</div>
							<div class="tooltip-value">
								{formatValue(data.value)}
							</div>
						</div>
					{/if}
				</Tooltip>
			</Chart>

			<!-- Statistics overlay -->
			{#if showLabels}
				<div class="stats-overlay">
					<div class="stat-item">
						<span class="stat-label">Current:</span>
						<span class="stat-value current" style:color={chartColor}>
							{formatValue(stats.current)}
						</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Avg:</span>
						<span class="stat-value">{formatValue(stats.avg)}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Min:</span>
						<span class="stat-value min">{formatValue(stats.min)}</span>
					</div>
					<div class="stat-item">
						<span class="stat-label">Max:</span>
						<span class="stat-value max">{formatValue(stats.max)}</span>
					</div>
				</div>
			{/if}
		</div>
	{:else if !isConnected}
		<!-- Connection status -->
		<div class="graph-disconnected">
			<div class="disconnected-icon">
				{#if connectionStatus === 'reconnecting'}
					⟳
				{:else}
					⚠️
				{/if}
			</div>
			<div class="disconnected-text">
				{connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
			</div>
		</div>
	{:else}
		<!-- No data state -->
		<div class="graph-no-data">
			<div class="no-data-icon">📊</div>
			<div class="no-data-text">
				Waiting for data...
			</div>
		</div>
	{/if}

	<!-- Alert indicators -->
	{#if config.alerts.some(alert => alert.enabled && alert.triggered)}
		<div class="alert-indicator" aria-label="Alert active">
			🚨
		</div>
	{/if}

	<!-- Chart type indicator -->
	<div class="chart-type-indicator" title="Chart type: {chartType}">
		{#if chartType === 'area'}
			📈
		{:else if chartType === 'bar'}
			📊
		{:else}
			📉
		{/if}
	</div>
</div>

<style>
	.graph-widget {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		transition: all 0.2s ease;
	}

	.graph-widget.dragging {
		opacity: 0.8;
	}

	.graph-widget.resizing {
		border: 2px dashed var(--theme-accent-primary);
	}

	.graph-content {
		width: 100%;
		height: 100%;
		position: relative;
		padding: 0.5rem;
	}

	:global(.graph-axis-label) {
		fill: var(--theme-text-secondary);
		font-family: var(--theme-font-mono, monospace);
	}

	:global(.graph-area) {
		transition: all 0.3s ease;
	}

	:global(.graph-line) {
		fill: none;
		transition: all 0.3s ease;
	}

	:global(.graph-bar) {
		transition: all 0.3s ease;
	}

	:global(.graph-tooltip) {
		background: var(--theme-bg-primary);
		border: 1px solid var(--theme-border-primary);
		border-radius: 0.5rem;
		padding: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		z-index: 20;
	}

	.tooltip-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 100px;
	}

	.tooltip-time {
		font-size: 0.75rem;
		color: var(--theme-text-secondary);
		font-family: var(--theme-font-mono, monospace);
	}

	.tooltip-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: var(--theme-text-primary);
		font-family: var(--theme-font-mono, monospace);
	}

	.stats-overlay {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.25rem;
		background: rgba(var(--color-surface-900) / 0.8);
		padding: 0.5rem;
		border-radius: 0.375rem;
		backdrop-filter: blur(4px);
		font-size: 0.75rem;
	}

	.stat-item {
		display: flex;
		justify-content: space-between;
		gap: 0.5rem;
		align-items: center;
	}

	.stat-label {
		color: var(--theme-text-secondary);
		font-weight: 500;
	}

	.stat-value {
		color: var(--theme-text-primary);
		font-family: var(--theme-font-mono, monospace);
		font-weight: 600;
	}

	.stat-value.current {
		font-weight: 700;
	}

	.stat-value.min {
		color: var(--sensor-performance-low);
	}

	.stat-value.max {
		color: var(--sensor-thermal-high);
	}

	.graph-disconnected,
	.graph-no-data {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--theme-text-secondary);
		text-align: center;
	}

	.disconnected-icon,
	.no-data-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		opacity: 0.7;
	}

	.disconnected-text,
	.no-data-text {
		font-size: 0.875rem;
		font-weight: 500;
		opacity: 0.8;
	}

	.alert-indicator {
		position: absolute;
		top: 0.25rem;
		right: 0.25rem;
		font-size: 0.875rem;
		animation: pulse 2s infinite;
		z-index: 10;
	}

	.chart-type-indicator {
		position: absolute;
		bottom: 0.25rem;
		right: 0.25rem;
		font-size: 0.875rem;
		opacity: 0.5;
		transition: opacity 0.2s ease;
	}

	.graph-widget:hover .chart-type-indicator {
		opacity: 0.8;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.graph-content {
			padding: 0.25rem;
		}

		.stats-overlay {
			grid-template-columns: 1fr;
			gap: 0.125rem;
			padding: 0.375rem;
			font-size: 0.7rem;
		}

		.disconnected-icon,
		.no-data-icon {
			font-size: 1.5rem;
		}

		.disconnected-text,
		.no-data-text {
			font-size: 0.75rem;
		}

		:global(.graph-tooltip) {
			padding: 0.375rem;
		}

		.tooltip-time {
			font-size: 0.7rem;
		}

		.tooltip-value {
			font-size: 0.8rem;
		}
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.graph-widget,
		:global(.graph-area),
		:global(.graph-line),
		:global(.graph-bar),
		.chart-type-indicator {
			transition: none;
			animation: none;
		}

		.alert-indicator {
			animation: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.graph-widget.resizing {
			border-width: 3px;
		}

		.stats-overlay {
			background: var(--theme-bg-primary);
			border: 2px solid var(--theme-border-primary);
		}

		.stat-value {
			font-weight: 700;
		}

		:global(.graph-tooltip) {
			border-width: 2px;
		}
	}
</style>