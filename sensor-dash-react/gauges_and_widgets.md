# Gauges and Widgets Documentation

## Overview

This implementation provides a comprehensive suite of futuristic, gamer-style gauges and widgets for displaying PC sensor data from LibreHardwareMonitor. The system features multiple gauge types and multi-gauge widg, extensive customization options, and immersive visual effects.

## ✨ Features

### 🎮 Gauge Types

1.  **Arc Gauge** (`ArcGauge.svelte`)
    - Circular arc segments with customizable angles
    - Smooth animations and gradient support
    - Corner brackets and center dot decorations
    - RGB theme with dynamic color gradients
    - Responsive sizing with container queries

2.  **Speedometer Gauge** (`SpeedometerGauge.svelte`)
    - Traditional speedometer with futuristic styling
    - Animated needle with glow effects
    - Tick marks with value labels
    - Zone-based coloring (normal/warning/danger)
    - Digital display with scanning animation

3.  **Radial Gauge** (`RadialGauge.svelte`)
    - Multi-ring design for multiple metrics
    - Concentric circles with individual theming
    - Scanning effect and corner indicators
    - Average calculation for multiple values
    - Pulse animation for high values

### 🎨 Visual Themes

- **Gaming**: Classic green (#00ff88) with orange warnings
- **RGB**: Multi-color gradients with hue shifting
- **Neon**: Bright cyan (#00ffff) with magenta accents
- **Cyberpunk**: Purple (#7c3aed) with gold highlights
- **Minimal**: Clean blue design for professional environments

### ⚙️ Customization System

#### Global Settings Store (`gaugeSettings.ts`)
- Per-widget customization persistence
- Local storage for settings retention
- Import/export functionality
- Theme copying between widgets
- Global defaults management

#### Customizable Properties
- **Appearance**: Theme, colors, size, thickness
- **Animation**: Smooth transitions, pulse effects, glow
- **Behavior**: Value ranges, warning thresholds
- **Layout**: Arc angles, label visibility

## Multi-Widgets: A group of widgets that follow a chosen layout pattern selectable as presets.
### 🖥️ Enhanced "Preassembled" Multi-Widgets :


#### Futuristic 'CPU Essentials Multi-Widget (`FuturisticCpuWidget.svelte`)
- Primary gauge (selectable type)
- Secondary metrics display
- Individual core usage mini-gauges
- Temperature monitoring with color coding
- Integrated settings panel

#### Futuristic 'GPU Essentials' Multi-Widget (`FuturisticGpuWidget.svelte`)
- GPU usage and temperature monitoring
- VRAM usage with detailed breakdown
- Multi-GPU support with index selection
- Fan speed and power consumption
- Memory statistics display

## 🔧 Technical Implementation

### LayerChart Integration
```typescript
import { Chart, Arc, Circle, Line } from 'layerchart';
import { scaleLinear } from 'd3-scale';
```

All gauges utilize LayerChart's powerful SVG components:
- **Arc**: For gauge segments and backgrounds
- **Circle**: For center elements and decorations
- **Line**: For needles and tick marks
- **Chart**: Container with data binding

### Animation System
```typescript
import { tweened } from 'svelte/motion';
import { cubicOut } from 'svelte/easing';

const animatedValue = tweened(0, {
  duration: 800,
  easing: cubicOut
});
```

Smooth value transitions with configurable duration and easing functions.

### Color Management
```typescript
$: getGaugeColor = () => {
  if (value >= dangerThreshold) return '#ff0040';
  if (value >= warningThreshold) return '#ff8c00';
  
  switch (theme) {
    case 'gaming': return '#00ff88';
    case 'rgb': return `hsl(${240 + (120 * normalizedValue)}, 80%, 60%)`;
    // ...
  }
};
```

Dynamic color calculation based on thresholds and themes.

## 📱 Responsive Design

### Container Queries
```css
@container (max-width: 150px) {
  .value-number { font-size: 1.2rem; }
}

@container (min-width: 250px) {
  .value-number { font-size: 2.2rem; }
}
```

Automatic scaling based on widget container size.

### Grid Adaptability
- Flexible grid layouts
- Minimum/maximum size constraints
- Automatic font size adjustments
- Touch-friendly controls

## 🎨 Visual Effects

### Glow Effects
```css
filter: drop-shadow(0 0 20px ${baseColor}40);
text-shadow: 0 0 15px ${baseColor}80;
```

Dynamic glow based on gauge color and theme.

### Pulse Animation
```css
@keyframes pulse-glow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.9; transform: scale(1.02); }
}
```

Subtle pulsing for high-value indicators.

### Scanning Effects
```css
.scan-effect {
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(0, 255, 136, 0.3) 35deg,
    transparent 70deg
  );
  animation: rotate-scan 4s linear infinite;
}
```

Rotating scan lines for sci-fi aesthetic.

## 🔩 Configuration Options

### Per-Widget Settings
```typescript
interface WidgetGaugeSettings {
  theme: 'gaming' | 'rgb' | 'neon' | 'cyber' | 'minimal';
  size: number;
  thickness: number;
  animated: boolean;
  glowEffect: boolean;
  pulseAnimation: boolean;
  showValue: boolean;
  showLabel: boolean;
  gradientStops: string[];
  customColors: {
    background?: string;
    foreground?: string;
    text?: string;
  } | null;
  warningThreshold: number;
  dangerThreshold: number;
  startAngle: number;
  endAngle: number;
  gaugeType: 'arc' | 'ring' | 'speedometer' | 'linear' | 'radial';
}
```

### Usage Example
```svelte
<ArcGauge
  value={cpuUsage}
  label="CPU Usage"
  unit="%"
  size={200}
  theme="gaming"
  animated={true}
  glowEffect={true}
  pulseAnimation={true}
  thickness={20}
  warningThreshold={70}
  dangerThreshold={90}
/>
```

## 🎯 Performance Optimizations

### Efficient Updates
- Reactive value calculations
- Minimal DOM manipulation
- SVG path optimization
- Animation frame management

### Memory Management
- Settings persistence in localStorage
- Automatic cleanup on component destroy
- Efficient store subscriptions

## 🎮 Gaming-Specific Features

### RGB Color Cycling
```typescript
case 'rgb':
  return `hsl(${240 + (120 * normalizedValue)}, 80%, 60%)`;
```

Dynamic hue shifting based on values.

### Corner Brackets
```css
.corner-bracket {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid currentColor;
  opacity: 0.6;
}
```

Sci-fi style corner decorations.

### Digital Displays
- Monospace fonts (Orbitron, JetBrains Mono)
- Scan line effects
- Glowing text and borders
- Retro-futuristic styling

## 🔄 Integration Guide

### Adding New Gauges
1. Create component in `widgets/` directory
2. Import LayerChart components
3. Implement settings integration
4. Add to widget selection system

### Custom Themes
```typescript
export const CUSTOM_THEME: GaugeTheme = {
  id: 'custom',
  name: 'Custom Theme',
  primary: '#your-color',
  secondary: '#warning-color',
  background: '#bg-color',
  text: '#text-color',
  glowColor: '#glow-color'
};
```

### Widget Integration
```svelte
<!-- In dashboard widget -->
<script>
  import { getWidgetGaugeSettings } from '$lib/stores/gaugeSettings';
  $: settings = $getWidgetGaugeSettings(widgetId);
</script>

{#if settings.gaugeType === 'arc'}
  <ArcGauge {...gaugeProps} />
{:else if settings.gaugeType === 'radial'}
  <RadialGauge {...gaugeProps} />
{/if}
```

## 📊 Data Integration

### Hardware Metrics Support
- CPU: Usage, temperature, frequency, power, cores
- GPU: Usage, temperature, VRAM, power, fan speed
- Memory: Usage, available, total
- Storage: Usage, temperature, speed
- Network: Throughput, packets

### Real-time Updates
```typescript
// Automatic updates via WebSocket
$: if ($cpuMetrics) {
  updateGaugeValue($cpuMetrics.usage);
}
```

## 🎪 Demo Features

### Interactive Settings Panel
- Live preview of changes
- Reset to defaults
- Theme switching
- Size adjustment
- Animation toggles

### Multi-Gauge Widgets
- Primary gauge selection
- Secondary metric displays
- Mini gauge arrays
- Integrated information panels

## 🚀 Future Enhancements

### Planned Features
- Linear bar gauges
- Histogram displays
- 3D depth effects
- Audio reactive elements
- Custom shader effects
- Particle systems

### Advanced Customization
- Color picker integration
- Custom angle presets
- Animation timing controls
- Effect intensity sliders
- Theme builder interface

## 📝 Usage Notes

### Performance Tips
- Disable animations on low-end devices
- Use minimal themes for better performance
- Limit concurrent animations
- Consider gauge count per widget

### Accessibility
- High contrast mode support
- Screen reader compatible
- Keyboard navigation
- Reduced motion options

### Browser Compatibility
- Modern browsers with SVG support
- CSS container queries (optional)
- ES2020+ features
- WebSocket support for live data

---

This documentation covers the complete futuristic gauge system implementation. The gauges provide an immersive, customizable experience perfect for gaming setups and enthusiast monitoring dashboards.

## Next Steps

- Complete the widget library with all planned widget types
- Implement widget configuration panel
- Add dashboard tabs functionality