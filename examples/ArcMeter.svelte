<!--
  ArcMeter.svelte
  
  Example implementation of an arc gauge using LayerChart
  Demonstrates:
  - LayerChart Arc component usage
  - Theme-aware gauge styling
  - Real-time value updates with animations
  - Customizable appearance and thresholds
  - Gaming/futuristic styling effects
-->

<script lang="ts">
  // Note: This is an example - actual imports would be from SvelteKit project
  // import { Chart, Arc, Circle, Text } from 'layerchart';
  // import { tweened } from 'svelte/motion';
  // import { cubicOut } from 'svelte/easing';
  
  interface GaugeConfig {
    min: number;
    max: number;
    warningThreshold: number;
    criticalThreshold: number;
    unit: string;
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
      unit: "%"
    },
    size = 200,
    theme = "dark",
    animated = true,
    showValue = true,
    showLabel = true,
    glowEffect = true
  }: {
    value?: number;
    label?: string;
    config?: GaugeConfig;
    size?: number;
    theme?: string;
    animated?: boolean;
    showValue?: boolean;
    showLabel?: boolean;
    glowEffect?: boolean;
  } = $props();

  // Animated value for smooth transitions
  // const animatedValue = tweened(0, { duration: 800, easing: cubicOut });
  let displayValue = $state(0);
  
  // Update animated value when value prop changes
  $effect(() => {
    if (animated) {
      // Simulate smooth animation
      const startValue = displayValue;
      const targetValue = value;
      const duration = 800;
      const startTime = performance.now();
      
      function animate(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Cubic ease-out function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        displayValue = startValue + (targetValue - startValue) * easeOut;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      }
      
      requestAnimationFrame(animate);
    } else {
      displayValue = value;
    }
  });
  
  // Calculate normalized value (0-1)
  let normalizedValue = $derived(() => {
    const clamped = Math.max(config.min, Math.min(config.max, displayValue));
    return (clamped - config.min) / (config.max - config.min);
  });
  
  // Calculate gauge colors based on value and theme
  let gaugeColors = $derived(() => {
    const normalized = normalizedValue();
    const warningNorm = (config.warningThreshold - config.min) / (config.max - config.min);
    const criticalNorm = (config.criticalThreshold - config.min) / (config.max - config.min);
    
    if (normalized >= criticalNorm) {
      return theme === 'rgb' ? '#ff0066' : '#ff4444';
    } else if (normalized >= warningNorm) {
      return theme === 'rgb' ? '#ffaa00' : '#ffa500';
    } else {
      switch (theme) {
        case 'gaming': return '#00ff88';
        case 'rgb': return '#00ff66';
        case 'dark': return '#00ffff';
        default: return '#0066cc';
      }
    }
  });
  
  // Theme-based background colors
  let backgroundColors = $derived(() => {
    switch (theme) {
      case 'gaming': return '#001d3d20';
      case 'rgb': return '#16172240';
      case 'dark': return '#1a1a1a40';
      default: return '#f8f9fa40';
    }
  });
  
  // Arc configuration
  let arcConfig = $derived(() => {
    const startAngle = -225; // Start from bottom-left
    const endAngle = 45;     // End at bottom-right
    const totalAngle = endAngle - startAngle;
    const valueAngle = startAngle + (totalAngle * normalizedValue());
    
    return {
      startAngle,
      endAngle: valueAngle,
      innerRadius: size * 0.25,
      outerRadius: size * 0.35,
      padAngle: 0.02
    };
  });
  
  // Generate tick marks
  let tickMarks = $derived(() => {
    const marks = [];
    const tickCount = 5;
    const startAngle = -225;
    const endAngle = 45;
    const totalAngle = endAngle - startAngle;
    
    for (let i = 0; i <= tickCount; i++) {
      const progress = i / tickCount;
      const angle = startAngle + (totalAngle * progress);
      const tickValue = config.min + ((config.max - config.min) * progress);
      
      marks.push({
        angle: (angle * Math.PI) / 180,
        value: Math.round(tickValue),
        isMain: i % 2 === 0
      });
    }
    
    return marks;
  });
  
  // Glow effect filter
  let glowFilter = $derived(() => {
    if (!glowEffect) return '';
    const color = gaugeColors();
    return `drop-shadow(0 0 10px ${color}40) drop-shadow(0 0 20px ${color}20)`;
  });
</script>

<div 
  class="arc-meter" 
  class:glow-effect={glowEffect}
  style={`width: ${size}px; height: ${size}px;`}
  data-theme={theme}
>
  <!-- SVG Container (LayerChart would replace this structure) -->
  <svg 
    width={size} 
    height={size} 
    viewBox={`0 0 ${size} ${size}`}
    class="gauge-svg"
    style={`filter: ${glowFilter()}`}
  >
    <!-- Background arc -->
    <path
      d={`M ${size/4} ${size*0.75} A ${size*0.3} ${size*0.3} 0 1 1 ${size*0.75} ${size*0.75}`}
      fill="none"
      stroke={backgroundColors()}
      stroke-width={size * 0.08}
      stroke-linecap="round"
      class="background-arc"
    />
    
    <!-- Value arc -->
    <path
      d={`M ${size/4} ${size*0.75} A ${size*0.3} ${size*0.3} 0 ${normalizedValue() > 0.5 ? 1 : 0} 1 ${size*0.75} ${size*0.75}`}
      fill="none"
      stroke={gaugeColors()}
      stroke-width={size * 0.08}
      stroke-linecap="round"
      stroke-dasharray={`${normalizedValue() * 100} 100`}
      class="value-arc"
    />
    
    <!-- Tick marks -->
    {#each tickMarks() as tick}
      <g transform={`translate(${size/2}, ${size/2}) rotate(${tick.angle * 180 / Math.PI})`}>
        <line
          x1={size * 0.35}
          y1="0"
          x2={size * (tick.isMain ? 0.42 : 0.39)}
          y2="0"
          stroke={theme === 'dark' ? '#666' : '#999'}
          stroke-width={tick.isMain ? 2 : 1}
          stroke-linecap="round"
        />
        {#if tick.isMain}
          <text
            x={size * 0.45}
            y="0"
            text-anchor="middle"
            dominant-baseline="middle"
            fill={theme === 'dark' ? '#ccc' : '#666'}
            font-size={size * 0.08}
            font-family="monospace"
          >
            {tick.value}
          </text>
        {/if}
      </g>
    {/each}
    
    <!-- Center value display -->
    {#if showValue}
      <text
        x={size/2}
        y={size/2 - 10}
        text-anchor="middle"
        dominant-baseline="middle"
        fill={gaugeColors()}
        font-size={size * 0.15}
        font-weight="bold"
        font-family="monospace"
        class="value-text"
      >
        {Math.round(displayValue)}
      </text>
      
      <text
        x={size/2}
        y={size/2 + 15}
        text-anchor="middle"
        dominant-baseline="middle"
        fill={theme === 'dark' ? '#999' : '#666'}
        font-size={size * 0.08}
        font-family="monospace"
        class="unit-text"
      >
        {config.unit}
      </text>
    {/if}
    
    <!-- Label -->
    {#if showLabel}
      <text
        x={size/2}
        y={size * 0.85}
        text-anchor="middle"
        dominant-baseline="middle"
        fill={theme === 'dark' ? '#ccc' : '#666'}
        font-size={size * 0.1}
        font-weight="500"
        class="label-text"
      >
        {label}
      </text>
    {/if}
  </svg>
  
  <!-- Gaming-style corner brackets -->
  {#if theme === 'gaming' || theme === 'rgb'}
    <div class="corner-brackets">
      <div class="bracket top-left"></div>
      <div class="bracket top-right"></div>
      <div class="bracket bottom-left"></div>
      <div class="bracket bottom-right"></div>
    </div>
  {/if}
  
  <!-- Pulse effect for high values -->
  {#if normalizedValue() > 0.8 && animated}
    <div class="pulse-overlay" style={`background: radial-gradient(circle, ${gaugeColors()}20 0%, transparent 70%);`}></div>
  {/if}
</div>

<style>
  .arc-meter {
    @apply relative flex items-center justify-center;
    position: relative;
  }
  
  .gauge-svg {
    @apply w-full h-full;
    transition: filter 0.3s ease-in-out;
  }
  
  .background-arc {
    opacity: 0.3;
  }
  
  .value-arc {
    transition: all 0.5s ease-in-out;
  }
  
  .value-text {
    text-shadow: 0 0 10px currentColor;
  }
  
  /* Corner brackets for gaming themes */
  .corner-brackets {
    @apply absolute inset-0 pointer-events-none;
  }
  
  .bracket {
    @apply absolute w-4 h-4 border-current;
    opacity: 0.6;
  }
  
  .bracket.top-left {
    @apply top-2 left-2 border-t-2 border-l-2;
  }
  
  .bracket.top-right {
    @apply top-2 right-2 border-t-2 border-r-2;
  }
  
  .bracket.bottom-left {
    @apply bottom-2 left-2 border-b-2 border-l-2;
  }
  
  .bracket.bottom-right {
    @apply bottom-2 right-2 border-b-2 border-r-2;
  }
  
  /* Pulse overlay for high values */
  .pulse-overlay {
    @apply absolute inset-0 rounded-full pointer-events-none;
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.1); }
  }
  
  /* Theme-specific styling */
  [data-theme="gaming"] .arc-meter {
    color: #00ff88;
  }
  
  [data-theme="rgb"] .arc-meter {
    color: #00ff66;
    background: radial-gradient(circle, rgba(255, 0, 102, 0.1) 0%, transparent 50%);
  }
  
  [data-theme="dark"] .arc-meter {
    color: #00ffff;
  }
  
  /* Glow effect enhancement */
  .arc-meter.glow-effect .value-text {
    filter: drop-shadow(0 0 5px currentColor);
  }
  
  .arc-meter.glow-effect .bracket {
    filter: drop-shadow(0 0 3px currentColor);
  }
  
  /* Animation for value changes */
  .value-arc {
    animation: arc-draw 1s ease-out;
  }
  
  @keyframes arc-draw {
    from { stroke-dasharray: 0 100; }
    to { stroke-dasharray: var(--final-dasharray, 50) 100; }
  }
  
  /* Responsive adjustments */
  @media (max-width: 768px) {
    .bracket {
      @apply w-3 h-3;
    }
  }
  
  /* High contrast mode */
  @media (prefers-contrast: high) {
    .background-arc {
      opacity: 0.6;
    }
    
    .value-text {
      text-shadow: none;
      font-weight: 900;
    }
  }
  
  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .value-arc,
    .pulse-overlay {
      animation: none;
      transition: none;
    }
  }
</style> 