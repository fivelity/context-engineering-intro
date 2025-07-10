<!--
  CosmicSensorGauge.svelte
  
  Custom sensor gauge extending Cosmic UI aesthetic
  Demonstrates:
  - Cosmic UI Frame integration with sensor data
  - Custom SVG gauge design with sci-fi styling
  - LayerChart Arc component with Cosmic UI frames
  - Real-time value updates with smooth animations
  - Gaming-inspired visual effects and glows
-->

<script lang="ts">
  import CosmicFrame from './CosmicFrame.svelte';
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';
  
  interface SensorConfig {
    min: number;
    max: number;
    warningThreshold: number;
    criticalThreshold: number;
    unit: string;
    icon?: string;
  }

  // Props
  let { 
    value = 0,
    label = "Sensor",
    config = {
      min: 0,
      max: 100,
      warningThreshold: 70,
      criticalThreshold: 90,
      unit: "%",
      icon: "🔥"
    } as SensorConfig,
    size = 200,
    showFrame = true,
    glowEffect = true
  }: {
    value: number;
    label: string;
    config?: SensorConfig;
    size?: number;
    showFrame?: boolean;
    glowEffect?: boolean;
  } = $props();

  // Animated value for smooth transitions
  const animatedValue = tweened(0, {
    duration: 800,
    easing: cubicOut
  });

  // Update animated value when prop changes
  $effect(() => {
    animatedValue.set(value);
  });

  // Gauge calculations
  const normalizedValue = $derived(
    Math.max(0, Math.min(100, ((value - config.min) / (config.max - config.min)) * 100))
  );
  
  const angle = $derived((normalizedValue / 100) * 270 - 135); // 270° arc starting from -135°
  const radius = $derived(size * 0.35);
  const centerX = $derived(size / 2);
  const centerY = $derived(size / 2);

  // Status-based colors
  const statusColor = $derived(() => {
    if (value >= config.criticalThreshold) return 'var(--color-accent)'; // Red
    if (value >= config.warningThreshold) return 'orange';
    return 'var(--color-success)'; // Green
  });

  // Cosmic UI frame paths for gauge container
  const gaugeFramePaths = [
    {
      show: true,
      style: {
        strokeWidth: "2",
        stroke: "var(--color-frame-1-stroke)",
        fill: "var(--color-frame-1-fill)"
      },
      path: [
        ["M", "15", "15"],
        ["L", "85%", "15"], 
        ["L", "100% - 15", "30"],
        ["L", "100% - 15", "85%"],
        ["L", "85%", "100% - 15"],
        ["L", "15", "100% - 15"],
        ["L", "15", "15"]
      ]
    },
    {
      show: showFrame,
      style: {
        strokeWidth: "1",
        stroke: statusColor,
        fill: "transparent"
      },
      path: [
        ["M", "10", "10"],
        ["L", "90%", "10"],
        ["L", "100% - 10", "25"],
        ["L", "100% - 10", "90%"],
        ["L", "90%", "100% - 10"],
        ["L", "10", "100% - 10"],
        ["L", "10", "10"]
      ]
    }
  ];

  // Generate arc path for gauge
  function createArcPath(startAngle: number, endAngle: number, radius: number, cx: number, cy: number): string {
    const start = {
      x: cx + radius * Math.cos((startAngle * Math.PI) / 180),
      y: cy + radius * Math.sin((startAngle * Math.PI) / 180)
    };
    const end = {
      x: cx + radius * Math.cos((endAngle * Math.PI) / 180),
      y: cy + radius * Math.sin((endAngle * Math.PI) / 180)
    };
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  }

  const backgroundArc = $derived(createArcPath(-135, 135, radius, centerX, centerY));
  const valueArc = $derived(createArcPath(-135, angle, radius, centerX, centerY));
</script>

<!-- Sensor Gauge Container -->
<div 
  class="relative inline-block"
  style="width: {size}px; height: {size}px;"
>
  <!-- Cosmic UI Frame -->
  {#if showFrame}
    <CosmicFrame 
      paths={gaugeFramePaths}
      className={glowEffect ? "drop-shadow-xl" : ""}
      style="filter: {glowEffect ? `drop-shadow(0 0 20px ${statusColor}40)` : 'none'}"
    />
  {/if}

  <!-- Gauge SVG -->
  <div class="absolute inset-4 flex items-center justify-center">
    <svg 
      width={size - 32} 
      height={size - 32} 
      viewBox="0 0 {size} {size}"
      class="overflow-visible"
    >
      <!-- Background Arc -->
      <path 
        d={backgroundArc}
        stroke="rgba(255, 255, 255, 0.1)"
        stroke-width="8"
        fill="none"
        stroke-linecap="round"
      />
      
      <!-- Value Arc -->
      <path 
        d={valueArc}
        stroke={statusColor}
        stroke-width="8"
        fill="none"
        stroke-linecap="round"
        class="transition-all duration-800 ease-out"
        style="filter: {glowEffect ? `drop-shadow(0 0 8px ${statusColor})` : 'none'}"
      />
      
      <!-- Center Circle -->
      <circle
        cx={centerX}
        cy={centerY}
        r="12"
        fill="var(--color-background)"
        stroke={statusColor}
        stroke-width="2"
      />
      
      <!-- Value Text -->
      <text
        x={centerX}
        y={centerY - 10}
        text-anchor="middle"
        fill="var(--color-foreground)"
        font-size="18"
        font-weight="bold"
        font-family="monospace"
      >
        {Math.round($animatedValue)}
      </text>
      
      <!-- Unit Text -->
      <text
        x={centerX}
        y={centerY + 8}
        text-anchor="middle"
        fill="var(--color-foreground)"
        font-size="10"
        opacity="0.7"
        font-family="monospace"
      >
        {config.unit}
      </text>
    </svg>
  </div>

  <!-- Label -->
  <div class="absolute bottom-2 left-0 right-0 text-center">
    <div class="text-xs font-medium text-white/80 flex items-center justify-center gap-1">
      {#if config.icon}
        <span>{config.icon}</span>
      {/if}
      {label}
    </div>
  </div>
</div>

<style>
  /* Add glow animations for critical values */
  @keyframes pulse-glow {
    0%, 100% { filter: drop-shadow(0 0 10px currentColor); }
    50% { filter: drop-shadow(0 0 20px currentColor); }
  }
  
  .critical-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
</style> 