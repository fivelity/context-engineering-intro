<script lang="ts">
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

	// Sensor data binding
	let sensorValue = $derived(() => {
		if (!config.sensorPath) return 0;
		return sensorStore.getSensorValue(config.sensorPath);
	});

	// Configuration options
	let showLabels = $derived(chartParams?.showLabels ?? true);
	let showPercentage = $derived(chartParams?.showPercentage ?? true);
	let animationDuration = $derived(chartParams?.animationDuration || 400);
	let maxValue = $derived(chartParams?.maxValue || 100);
	let minValue = $derived(chartParams?.minValue || 0);

	// Historical data for trend indication
	let sensorHistory = $derived(() => {
		return sensorStore.getHistoryForSensor(config.sensorPath, 5);
	});

	// Calculate percentage
	let percentage = $derived(() => {
		const value = sensorValue();
		const range = maxValue - minValue;
		return Math.min(100, Math.max(0, ((value - minValue) / range) * 100));
	});

	// Calculate trend
	let trend = $derived(() => {
		if (sensorHistory.length < 2) return 'stable';
		
		const recent = sensorHistory.slice(-2);
		const diff = recent[1].value - recent[0].value;
		const threshold = 1; // Minimum change to consider significant
		
		if (Math.abs(diff) < threshold) return 'stable';
		return diff > 0 ? 'up' : 'down';
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

	// Dynamic color based on value and thresholds
	let meterColor = $derived(() => {
		const value = sensorValue();
		const colors = appearance.colors;
		
		if (value >= colorThresholds.high) {
			return colors[2] || '#ef4444'; // Red for high/critical
		} else if (value >= colorThresholds.medium) {
			return colors[1] || '#f97316'; // Orange for medium
		} else {
			return colors[0] || '#22c55e'; // Green for low/good
		}
	});

	// Background color for meter track
	let trackColor = $derived(() => {
		return 'rgba(var(--color-surface-400) / 0.2)';
	});

	// Unit display
	let unit = $derived(() => {
		const sensorType = config.sensorPath.split('.')[1];
		switch (sensorType) {
			case 'temperature': return '°C';
			case 'usage': return '%';
			case 'frequency': return 'MHz';
			case 'voltage': return 'V';
			case 'fanSpeed': return 'RPM';
			case 'available': return 'GB';
			case 'total': return 'GB';
			default: return '%';
		}
	});

	// Format display value
	let displayValue = $derived(() => {
		const value = sensorValue();
		
		if (unit === 'MHz' && value > 1000) {
			return `${(value / 1000).toFixed(1)} GHz`;
		} else if (unit === 'GB') {
			return `${value.toFixed(1)} ${unit}`;
		} else if (unit === 'RPM') {
			return `${Math.round(value)} ${unit}`;
		} else {
			return `${Math.round(value)}${unit}`;
		}
	});

	// Meter style classes
	let meterClass = $derived(() => {
		const value = sensorValue();
		return getSensorClass(value, colorThresholds, 'meter-value');
	});

	// Trend icon
	let trendIcon = $derived(() => {
		switch (trend) {
			case 'up': return '↗️';
			case 'down': return '↘️';
			default: return '→';
		}
	});

	// Accessibility label
	let ariaLabel = $derived(() => {
		return `${config.title}: ${displayValue()}, ${percentage().toFixed(1)}% of maximum, trend ${trend}`;
	});

	// Connection status
	let isConnected = $derived(sensorStore.isConnected);
	let connectionStatus = $derived(sensorStore.status);

	// Meter segments (for segmented display)
	let segments = $derived(chartParams?.segments || 0); // 0 = smooth, >0 = segmented
	let segmentData = $derived(() => {
		if (segments <= 0) return [];
		
		return Array.from({ length: segments }, (_, i) => {
			const segmentPercentage = ((i + 1) / segments) * 100;
			const isActive = segmentPercentage <= percentage();
			return { index: i, percentage: segmentPercentage, isActive };
		});
	});
</script>

<div 
	class="meter-widget"
	class:dragging={isDragging}
	class:resizing={isResizing}
	class:disconnected={!isConnected}
	role="progressbar"
	aria-valuenow={sensorValue()}
	aria-valuemin={minValue}
	aria-valuemax={maxValue}
	aria-label={ariaLabel}
>
	{#if isConnected}
		<div class="meter-content">
			<!-- Header with value and trend -->
			{#if showLabels}
				<div class="meter-header">
					<div class="meter-value-display">
						<span 
							class={cls('meter-value-text', meterClass)}
							style:color={meterColor}
							style:font-size="{appearance.typography.fontSize}px"
							style:font-weight={appearance.typography.fontWeight}
						>
							{displayValue}
						</span>
						
						{#if showPercentage}
							<span class="meter-percentage">
								({percentage().toFixed(1)}%)
							</span>
						{/if}
					</div>
					
					<!-- Trend indicator -->
					{#if sensorHistory.length > 1}
						<div class="trend-indicator" title="Trend: {trend}">
							{trendIcon}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Meter bar -->
			<div class="meter-container">
				{#if segments > 0}
					<!-- Segmented meter -->
					<div class="meter-track segmented">
						{#each segmentData as segment}
							<div 
								class="meter-segment"
								class:active={segment.isActive}
								style:background-color={segment.isActive ? meterColor : trackColor}
								style:transition="background-color {animationDuration}ms ease"
							></div>
						{/each}
					</div>
				{:else}
					<!-- Smooth meter -->
					<div 
						class="meter-track smooth"
						style:background-color={trackColor}
					>
						<div 
							class="meter-fill"
							style:width="{percentage()}%"
							style:background-color={meterColor}
							style:transition="width {animationDuration}ms ease, background-color {animationDuration}ms ease"
						></div>
					</div>
				{/if}

				<!-- Threshold markers -->
				{#if showLabels && segments <= 0}
					<div class="threshold-markers">
						<!-- Low threshold -->
						<div 
							class="threshold-marker low"
							style:left="{(colorThresholds.low / maxValue) * 100}%"
							title="Low threshold: {colorThresholds.low}{unit}"
						></div>
						
						<!-- Medium threshold -->
						<div 
							class="threshold-marker medium"
							style:left="{(colorThresholds.medium / maxValue) * 100}%"
							title="Medium threshold: {colorThresholds.medium}{unit}"
						></div>
						
						<!-- High threshold -->
						<div 
							class="threshold-marker high"
							style:left="{(colorThresholds.high / maxValue) * 100}%"
							title="High threshold: {colorThresholds.high}{unit}"
						></div>
					</div>
				{/if}
			</div>

			<!-- Footer with min/max values -->
			{#if showLabels}
				<div class="meter-footer">
					<span class="meter-min">{minValue}{unit}</span>
					<span class="meter-max">{maxValue}{unit}</span>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Connection status -->
		<div class="meter-disconnected">
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
	{/if}

	<!-- Alert indicators -->
	{#if config.alerts.some(alert => alert.enabled && alert.triggered)}
		<div class="alert-indicator" aria-label="Alert active">
			🚨
		</div>
	{/if}
</div>

<style>
	.meter-widget {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		transition: all 0.2s ease;
	}

	.meter-widget.dragging {
		opacity: 0.8;
	}

	.meter-widget.resizing {
		border: 2px dashed var(--theme-accent-primary);
	}

	.meter-content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 0.75rem;
		gap: 0.5rem;
	}

	.meter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.25rem;
	}

	.meter-value-display {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
	}

	.meter-value-text {
		font-family: var(--theme-font-mono, 'JetBrains Mono', monospace);
		font-weight: 700;
		line-height: 1;
		transition: all 0.3s ease;
	}

	.meter-percentage {
		font-size: 0.875rem;
		color: var(--theme-text-secondary);
		font-family: var(--theme-font-mono, monospace);
	}

	.trend-indicator {
		font-size: 1rem;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.meter-widget:hover .trend-indicator {
		opacity: 1;
	}

	.meter-container {
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
		min-height: 24px;
	}

	.meter-track {
		width: 100%;
		border-radius: 12px;
		overflow: hidden;
		position: relative;
	}

	.meter-track.smooth {
		height: 24px;
		position: relative;
	}

	.meter-track.segmented {
		height: 16px;
		display: flex;
		gap: 2px;
	}

	.meter-fill {
		height: 100%;
		border-radius: inherit;
		transition: width 0.4s ease, background-color 0.3s ease;
		position: relative;
	}

	.meter-segment {
		flex: 1;
		height: 100%;
		border-radius: 2px;
		transition: background-color 0.3s ease;
	}

	.threshold-markers {
		position: absolute;
		top: -4px;
		left: 0;
		right: 0;
		height: calc(100% + 8px);
		pointer-events: none;
	}

	.threshold-marker {
		position: absolute;
		width: 2px;
		height: 100%;
		background: var(--theme-border-primary);
		opacity: 0.6;
		transition: opacity 0.2s ease;
	}

	.threshold-marker.low {
		background: var(--sensor-performance-low);
	}

	.threshold-marker.medium {
		background: var(--sensor-thermal-medium);
	}

	.threshold-marker.high {
		background: var(--sensor-thermal-high);
	}

	.meter-container:hover .threshold-marker {
		opacity: 0.8;
	}

	.meter-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.75rem;
		color: var(--theme-text-secondary);
		margin-top: 0.25rem;
	}

	.meter-min,
	.meter-max {
		font-family: var(--theme-font-mono, monospace);
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		background: var(--theme-bg-secondary);
	}

	.meter-disconnected {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--theme-text-secondary);
		text-align: center;
	}

	.disconnected-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
		opacity: 0.7;
	}

	.disconnected-text {
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

	/* Sensor value color classes */
	:global(.meter-value-low) {
		color: var(--sensor-thermal-low);
	}

	:global(.meter-value-medium) {
		color: var(--sensor-thermal-medium);
	}

	:global(.meter-value-high) {
		color: var(--sensor-thermal-high);
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.meter-content {
			padding: 0.5rem;
			gap: 0.375rem;
		}

		.meter-value-text {
			font-size: 1rem !important;
		}

		.meter-percentage {
			font-size: 0.75rem;
		}

		.meter-track.smooth {
			height: 20px;
		}

		.meter-track.segmented {
			height: 14px;
		}

		.meter-footer {
			font-size: 0.7rem;
		}

		.trend-indicator {
			font-size: 0.875rem;
		}

		.disconnected-icon {
			font-size: 1.5rem;
		}

		.disconnected-text {
			font-size: 0.75rem;
		}
	}

	/* Accessibility */
	@media (prefers-reduced-motion: reduce) {
		.meter-widget,
		.meter-fill,
		.meter-segment,
		.meter-value-text,
		.trend-indicator,
		.threshold-marker {
			transition: none;
			animation: none;
		}

		.alert-indicator {
			animation: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.meter-widget.resizing {
			border-width: 3px;
		}

		.meter-track {
			border: 2px solid var(--theme-border-primary);
		}

		.meter-value-text {
			font-weight: 900;
		}

		.threshold-marker {
			width: 3px;
			opacity: 1;
		}
	}
</style>