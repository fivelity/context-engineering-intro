# SenseCanvas Examples

This directory contains code examples and patterns for implementing the SenseCanvas sensor dashboard. The examples demonstrate both **Svelte** and **React 19+** implementations to help with the conversion and understanding of patterns.

## 🔄 Conversion Guide: Svelte → React 19+

The examples show how to convert from Svelte patterns to modern React 19+ patterns:

### State Management Conversion
- **Svelte 5**: `$state()`, `$derived()`, `$effect()` 
- **React 19+**: `useState`, `useMemo`, `useEffect` + custom hooks + Zustand stores

### Real-time Data Conversion  
- **Svelte**: Direct WebSocket in component with stores
- **React 19+**: Custom `useWebSocket` hook + TanStack Query + Zustand stores

### Animation/Interaction Conversion
- **Svelte**: NeoDrag for dragging + transitions
- **React 19+**: Framer Motion for animations + drag gestures

### UI Framework Conversion
- **Svelte**: LayerChart + Svelte-UX
- **React 19+**: Cosmic UI + custom Chart.js integration + TailwindCSS

## 📁 File Structure

### React 19+ Examples (✨ New)
- `DashboardGrid.tsx` - React grid with TanStack Virtual and CSS Grid
- `DraggableWidget.tsx` - React widget with Framer Motion drag/drop  
- `useWebSocket.ts` - Custom hook for WebSocket connections
- `useSensorData.ts` - TanStack Query hook for sensor data
- `layoutStore.ts` - Zustand store with persistence
- `ThemeProvider.tsx` - React context for Cosmic UI themes

### Svelte Examples (Original - for reference)
- `DashboardGrid.svelte` - CSS Grid layout for widget containers
- `DraggableWidget.svelte` - NeoDrag integration with position tracking
- `CosmicFrame.svelte` - Cosmic UI frame component example
- `CosmicSensorGauge.svelte` - Custom sensor gauge with LayerChart
- `ArcMeter.svelte` - Arc gauge component with theming
- `layoutStore.ts` - Svelte store for layout persistence
- `ThemeConfig.js` - Theme switching with CSS custom properties

### Already Converted
- `CosmicSensorGauge.tsx` - **React implementation** of Cosmic UI sensor gauge

## 🎯 Key Patterns Demonstrated

### 1. Real-time Data Flow
**Svelte Pattern:**
```javascript
// Component subscribes to store
$: sensorData = $sensorStore.data;
```

**React 19+ Pattern:**
```typescript
// Custom hook with TanStack Query
const { data: sensorData } = useSensorData();
```

### 2. State Management
**Svelte Pattern:**
```javascript
// Svelte 5 runes
let widgets = $state([]);
```

**React 19+ Pattern:**
```typescript
// Zustand store
const widgets = useLayoutStore(state => state.widgets);
```

### 3. Drag & Drop
**Svelte Pattern:**
```svelte
<div use:draggable={{ position }}>
```

**React 19+ Pattern:**
```tsx
<motion.div drag onDragEnd={handleDragEnd}>
```

### 4. Theme Integration
**Svelte Pattern:**
```javascript
// CSS custom properties
document.documentElement.style.setProperty('--color-primary', color);
```

**React 19+ Pattern:**
```tsx
// React context + CSS custom properties
const { theme, setTheme } = useCosmicTheme();
```

## 🔧 Implementation Notes

### Performance Considerations
- **Svelte**: Reactive statements and stores
- **React 19+**: TanStack Virtual for large grids, automatic batching, useTransition

### WebSocket Handling
- **Svelte**: Cleanup in `onDestroy`
- **React 19+**: Cleanup in `useEffect` return function

### Form Handling
- **Svelte**: Two-way binding with `bind:`
- **React 19+**: React Hook Form + Zod validation

### AI Integration
- **Both**: Google Genkit for layout suggestions
- **React specific**: Integration with React context and state management

## 📚 Usage

Each example includes:
1. **Implementation code** - Complete working component/hook
2. **TypeScript interfaces** - Proper type definitions
3. **Integration notes** - How to use with other parts
4. **Performance tips** - Optimization strategies
5. **Testing patterns** - Unit test examples

Refer to these examples when implementing the SenseCanvas React 19+ dashboard to ensure consistent patterns and best practices. 