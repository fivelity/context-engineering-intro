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

	// Multi-resource configuration
	let sensorPaths = $derived(config.sensorPaths || [config.sensorPath].filter(Boolean));
	let displayMode = $derived(chartParams?.displayMode || 'list'); // 'list', 'grid', 'compact'
	let showLabels = $derived(chartParams?.showLabels ?? true);
	let showValues = $derived(chartParams?.showValues ?? true);
	let showBars = $derived(chartParams?.showBars ?? true);
	let animationDuration = $derived(chartParams?.animationDuration || 300);

	// Sensor data for all paths
	let sensorData = $derived(() => {
		return sensorPaths.map(path => {
			const value = sensorStore.getSensorValue(path);
			const history = sensorStore.getHistoryForSensor(path, 5);
			
			// Extract sensor info from path
			const pathParts = path.split('.');
			const hardwareType = pathParts[0] || 'unknown';
			const sensorType = pathParts[1] || 'unknown';
			const sensorName = pathParts[2] || path;

			// Calculate trend
			let trend = 'stable';
			if (history.length >= 2) {
				const recent = history.slice(-2);
				const diff = recent[1].value - recent[0].value;
				const threshold = 1;
				if (Math.abs(diff) > threshold) {
					trend = diff > 0 ? 'up' : 'down';
				}
			}

			return {
				path,
				value,
				history,
				trend,
				hardwareType,
				sensorType,
				sensorName,
				unit: getUnitForSensorType(sensorType),
				displayValue: formatValue(value, sensorType),
				thresholds: getThresholdsForSensorType(sensorType),
				color: getColorForValue(value, sensorType)
			};
		});
	});

	// Aggregate statistics
	let aggregateStats = $derived(() => {
		if (sensorData.length === 0) return { min: 0, max: 0, avg: 0, total: 0 };
		
		const values = sensorData.map(s => s.value);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
		const total = values.reduce((sum, val) => sum + val, 0);
		
		return { min, max, avg, total };
	});

	// Connection status
	let isConnected = $derived(sensorStore.isConnected);
	let connectionStatus = $derived(sensorStore.status);

	// Helper functions
	function getUnitForSensorType(sensorType: string): string {
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
	}

	function getThresholdsForSensorType(sensorType: string) {
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
	}

	function formatValue(value: number, sensorType: string): string {
		const unit = getUnitForSensorType(sensorType);
		
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

	function getColorForValue(value: number, sensorType: string): string {
		const thresholds = getThresholdsForSensorType(sensorType);
		const colors = appearance.colors;
		
		if (value >= thresholds.high) {
			return colors[2] || '#ef4444'; // Red for high/critical
		} else if (value >= thresholds.medium) {
			return colors[1] || '#f97316'; // Orange for medium
		} else {
			return colors[0] || '#22c55e'; // Green for low/good
		}
	}

	function getTrendIcon(trend: string): string {
		switch (trend) {
			case 'up': return '↗️';
			case 'down': return '↘️';
			default: return '→';
		}
	}

	function getPercentage(value: number, thresholds: any): number {
		// Calculate percentage based on thresholds for visual representation
		const max = thresholds.high * 1.2; // Add some headroom
		return Math.min(100, Math.max(0, (value / max) * 100));
	}

	// Accessibility label
	let ariaLabel = $derived(() => {
		const sensorCount = sensorData.length;
		const avgValue = aggregateStats.avg;
		return `${config.title}: ${sensorCount} sensors, average ${avgValue.toFixed(1)}`;
	});

	// Group sensors by hardware type
	let groupedSensors = $derived(() => {
		const groups: Record<string, typeof sensorData> = {};
		sensorData.forEach(sensor => {
			if (!groups[sensor.hardwareType]) {
				groups[sensor.hardwareType] = [];
			}
			groups[sensor.hardwareType].push(sensor);
		});
		return groups;
	});
</script>

<div 
	class="multi-resource-widget"
	class:dragging={isDragging}
	class:resizing={isResizing}
	class:disconnected={!isConnected}
	class:mode-list={displayMode === 'list'}
	class:mode-grid={displayMode === 'grid'}
	class:mode-compact={displayMode === 'compact'}
	role="region"
	aria-label={ariaLabel}
>
	{#if isConnected}
		<div class="multi-resource-content">
			<!-- Header with aggregate stats -->
			{#if showLabels && sensorData.length > 1}
				<div class="aggregate-header">
					<div class="aggregate-stats">
						<div class="stat-item">
							<span class="stat-label">Avg:</span>
							<span class="stat-value">{aggregateStats.avg.toFixed(1)}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Min:</span>
							<span class="stat-value min">{aggregateStats.min.toFixed(1)}</span>
						</div>
						<div class="stat-item">
							<span class="stat-label">Max:</span>
							<span class="stat-value max">{aggregateStats.max.toFixed(1)}</span>
						</div>
					</div>
				</div>
			{/if}

			<!-- Sensor list/grid -->
			<div class="sensors-container">
				{#if displayMode === 'compact'}
					<!-- Compact view: grouped by hardware type -->
					{#each Object.entries(groupedSensors) as [hardwareType, sensors]}
						<div class="hardware-group">
							<h4 class="hardware-title">{hardwareType.toUpperCase()}</h4>
							<div class="compact-sensors">
								{#each sensors as sensor}
									<div 
										class="sensor-compact"
										title="{sensor.sensorName}: {sensor.displayValue}, trend {sensor.trend}"
									>
										<div 
											class="sensor-indicator"
											style:background-color={sensor.color}
											style:transition="background-color {animationDuration}ms ease"
										></div>
										{#if showLabels}
											<span class="sensor-name">{sensor.sensorName}</span>
										{/if}
										{#if showValues}
											<span class="sensor-value" style:color={sensor.color}>
												{sensor.displayValue}
											</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				{:else}
					<!-- List or Grid view -->
					<div class="sensors-list">
						{#each sensorData as sensor}
							<div class="sensor-item">
								<!-- Sensor info -->
								<div class="sensor-info">
									{#if showLabels}
										<div class="sensor-name-row">
											<span class="sensor-name">{sensor.sensorName}</span>
											<span class="sensor-type">{sensor.hardwareType}</span>
										</div>
									{/if}
									
									{#if showValues}
										<div class="sensor-value-row">
											<span 
												class="sensor-value"
												style:color={sensor.color}
												style:font-size="{Math.max(12, appearance.typography.fontSize * 0.9)}px"
												style:font-weight={appearance.typography.fontWeight}
											>
												{sensor.displayValue}
											</span>
											
											<!-- Trend indicator -->
											<span class="trend-icon" title="Trend: {sensor.trend}">
												{getTrendIcon(sensor.trend)}
											</span>
										</div>
									{/if}
								</div>

								<!-- Visual indicator -->
								{#if showBars}
									<div class="sensor-bar-container">
										<div 
											class="sensor-bar-track"
											style:background-color="rgba(var(--color-surface-400) / 0.2)"
										>
											<div 
												class="sensor-bar-fill"
												style:width="{getPercentage(sensor.value, sensor.thresholds)}%"
												style:background-color={sensor.color}
												style:transition="width {animationDuration}ms ease, background-color {animationDuration}ms ease"
											></div>
										</div>
									</div>
								{:else}
									<div class="sensor-status-dot">
										<div 
											class="status-dot"
											style:background-color={sensor.color}
											style:transition="background-color {animationDuration}ms ease"
										></div>
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Footer with sensor count -->
			{#if showLabels}
				<div class="resource-footer">
					<span class="sensor-count">{sensorData.length} sensors</span>
					<span class="last-update">
						{sensorStore.lastUpdate ? new Date(sensorStore.lastUpdate).toLocaleTimeString() : '--:--:--'}
					</span>
				</div>
			{/if}
		</div>
	{:else}
		<!-- Connection status -->
		<div class="multi-resource-disconnected">
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
	.multi-resource-widget {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: transparent;
		transition: all 0.2s ease;
	}

	.multi-resource-widget.dragging {
		opacity: 0.8;
	}

	.multi-resource-widget.resizing {
		border: 2px dashed var(--theme-accent-primary);
	}

	.multi-resource-content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 0.75rem;
		gap: 0.5rem;
		overflow: hidden;
	}

	.aggregate-header {
		flex-shrink: 0;
		border-bottom: 1px solid var(--theme-border-primary);
		padding-bottom: 0.5rem;
	}

	.aggregate-stats {
		display: flex;
		gap: 1rem;
		justify-content: space-around;
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--theme-text-secondary);
		font-weight: 500;
	}

	.stat-value {
		font-size: 0.875rem;
		color: var(--theme-text-primary);
		font-family: var(--theme-font-mono, monospace);
		font-weight: 600;
	}

	.stat-value.min {
		color: var(--sensor-performance-low);
	}

	.stat-value.max {
		color: var(--sensor-thermal-high);
	}

	.sensors-container {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.sensors-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.mode-grid .sensors-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.5rem;
	}

	.sensor-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.5rem;
		background: var(--theme-bg-secondary);
		border-radius: 0.375rem;
		transition: all 0.2s ease;
	}

	.sensor-item:hover {
		background: var(--theme-bg-primary);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.sensor-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		min-width: 0;
	}

	.sensor-name-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.sensor-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--theme-text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.sensor-type {
		font-size: 0.75rem;
		color: var(--theme-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.025em;
		flex-shrink: 0;
	}

	.sensor-value-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.sensor-value {
		font-family: var(--theme-font-mono, monospace);
		font-weight: 600;
		transition: color 0.3s ease;
	}

	.trend-icon {
		font-size: 0.875rem;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}

	.sensor-item:hover .trend-icon {
		opacity: 1;
	}

	.sensor-bar-container {
		width: 60px;
		flex-shrink: 0;
	}

	.sensor-bar-track {
		width: 100%;
		height: 8px;
		border-radius: 4px;
		overflow: hidden;
		position: relative;
	}

	.sensor-bar-fill {
		height: 100%;
		border-radius: inherit;
		transition: width 0.3s ease, background-color 0.3s ease;
	}

	.sensor-status-dot {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		flex-shrink: 0;
	}

	.status-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		transition: background-color 0.3s ease;
	}

	/* Compact mode styles */
	.hardware-group {
		margin-bottom: 1rem;
	}

	.hardware-title {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--theme-text-secondary);
		margin: 0 0 0.5rem 0;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.compact-sensors {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
	}

	.sensor-compact {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		background: var(--theme-bg-secondary);
		border-radius: 0.25rem;
		font-size: 0.75rem;
		transition: all 0.2s ease;
	}

	.sensor-compact:hover {
		background: var(--theme-bg-primary);
		transform: scale(1.02);
	}

	.sensor-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.resource-footer {
		flex-shrink: 0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.75rem;
		color: var(--theme-text-secondary);
		padding-top: 0.5rem;
		border-top: 1px solid var(--theme-border-primary);
	}

	.sensor-count {
		font-weight: 500;
	}

	.last-update {
		font-family: var(--theme-font-mono, monospace);
		opacity: 0.8;
	}

	.multi-resource-disconnected {
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

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.multi-resource-content {
			padding: 0.5rem;
			gap: 0.375rem;
		}

		.aggregate-stats {
			gap: 0.5rem;
		}

		.mode-grid .sensors-list {
			grid-template-columns: 1fr;
		}

		.sensor-item {
			padding: 0.375rem;
			gap: 0.5rem;
		}

		.sensor-name {
			font-size: 0.8rem;
		}

		.sensor-value {
			font-size: 0.8rem;
		}

		.sensor-bar-container {
			width: 40px;
		}

		.compact-sensors {
			gap: 0.25rem;
		}

		.sensor-compact {
			padding: 0.2rem 0.375rem;
			font-size: 0.7rem;
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
		.multi-resource-widget,
		.sensor-item,
		.sensor-compact,
		.sensor-bar-fill,
		.sensor-indicator,
		.status-dot,
		.trend-icon {
			transition: none;
			animation: none;
		}

		.alert-indicator {
			animation: none;
		}

		.sensor-compact:hover {
			transform: none;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.multi-resource-widget.resizing {
			border-width: 3px;
		}

		.sensor-item {
			border: 1px solid var(--theme-border-primary);
		}

		.sensor-bar-track {
			border: 1px solid var(--theme-border-primary);
		}

		.sensor-value {
			font-weight: 700;
		}

		.status-dot {
			border: 2px solid var(--theme-border-primary);
		}
	}
</style>