name: "SvelteKit Modular Dashboard with Draggable Widgets"
description: |

## Purpose
Build a fully extensible, theme-aware SvelteKit dashboard with drag-and-drop widgets, grid snapping, and persistent layouts. This PRP provides comprehensive context for implementing a production-ready modular dashboard system.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Create a fully functional SvelteKit modular dashboard that allows users to drag, resize, snap, and persist widgets with theme-aware styling. The dashboard should support pluggable widget architecture and provide a smooth user experience with proper SSR handling.

## Why
- **Business value**: Provides a flexible, reusable dashboard framework for displaying interactive data visualizations
- **Integration**: Demonstrates advanced SvelteKit patterns with modern drag-and-drop and charting libraries
- **Problems solved**: Eliminates need for custom dashboard implementations across projects; provides theme-aware, responsive, and persistent widget layouts

## What
A SvelteKit application featuring:
- Dynamic grid layouts with snap-to-grid positioning
- Draggable and resizable chart widgets (ArcMeters, radial gauges, bar charts)
- Persistent widget positions & sizes (localStorage with pluggable backend support)
- Theme-aware widgets supporting light/dark/custom themes via Skeleton/Tailwind
- Pluggable architecture for registering new widget types
- Responsive design with proper SSR hydration

### Success Criteria
- [ ] Widgets can be dragged and dropped with grid snapping
- [ ] Widget positions and sizes persist across browser sessions
- [ ] Theme switching works dynamically across all widgets
- [ ] ArcMeter widgets render correctly with LayerChart
- [ ] No SSR hydration issues with drag/drop functionality
- [ ] Widget registry allows adding new widget types
- [ ] Responsive design works on mobile and desktop
- [ ] All tests pass and code meets quality standards

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- url: https://svelte.dev/docs/kit/routing
  why: SvelteKit routing patterns, layout structure, and file-based routing conventions
  
- url: https://www.neodrag.dev/docs/svelte
  why: NeoDrag position API, grid snapping, events system, and drag persistence patterns
  
- url: https://tailwindcss.com/docs/theme
  why: Tailwind theming system, CSS custom properties, dark/light theme implementation
  
- url: https://www.skeleton.dev/docs/theming
  why: Skeleton theming integration with Tailwind, CSS variable tokens
  
- url: https://www.layerchart.com/docs/components/Arc
  why: LayerChart Arc component for creating arc meters and radial visualizations
  
- url: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  why: localStorage best practices, SSR considerations, error handling
  
- file: examples/ArcMeter.svelte
  why: Pattern for LayerChart Arc component with SpringValue and theme integration
  
- file: examples/DashboardGrid.svelte
  why: CSS Grid layout pattern with dynamic columns and cell sizing
  
- file: examples/DraggableWidget.svelte
  why: NeoDrag integration with position tracking and store persistence
  
- file: examples/layoutStore.ts
  why: Svelte store pattern for layout persistence with localStorage
  
- file: examples/ThemeConfig.js
  why: Theme switching implementation with CSS custom properties
```

### Current Codebase tree
```bash
.
├── examples/
│   ├── ArcMeter.svelte           # LayerChart Arc component example
│   ├── DashboardGrid.svelte      # CSS Grid layout example
│   ├── DraggableWidget.svelte    # NeoDrag integration example
│   ├── ThemeConfig.js           # Theme switching example
│   └── layoutStore.ts           # Layout persistence store
├── PRPs/
│   ├── templates/
│   │   └── prp_base.md
│   └── EXAMPLE_multi_agent_prp.md
├── CLAUDE.md                    # Project instructions
├── INITIAL.md                   # Feature requirements
└── README.md
```

### Desired Codebase tree with files to be added
```bash
.
├── src/
│   ├── app.d.ts                 # TypeScript declarations
│   ├── app.html                 # HTML template
│   ├── routes/
│   │   ├── +layout.svelte       # Root layout with theme provider
│   │   ├── +page.svelte         # Main dashboard page
│   │   └── dashboard/
│   │       ├── +page.svelte     # Dashboard route
│   │       └── +layout.svelte   # Dashboard-specific layout
│   ├── lib/
│   │   ├── components/
│   │   │   ├── Dashboard.svelte          # Main dashboard container
│   │   │   ├── DashboardGrid.svelte      # Grid layout component
│   │   │   ├── DraggableWidget.svelte    # Base draggable widget
│   │   │   ├── ThemeToggle.svelte        # Theme switching component
│   │   │   └── widgets/
│   │   │       ├── ArcMeter.svelte       # Arc meter widget
│   │   │       ├── BarChart.svelte       # Bar chart widget
│   │   │       └── WidgetRegistry.svelte # Widget registration system
│   │   ├── stores/
│   │   │   ├── layoutStore.ts           # Layout persistence store
│   │   │   ├── themeStore.ts            # Theme management store
│   │   │   └── widgetStore.ts           # Widget data store
│   │   ├── utils/
│   │   │   ├── classnames.ts            # Utility for conditional classes
│   │   │   ├── gridUtils.ts             # Grid calculation utilities
│   │   │   └── persistence.ts           # Abstract persistence layer
│   │   └── types/
│   │       ├── dashboard.ts             # Dashboard-related types
│   │       └── widget.ts                # Widget-related types
│   ├── styles/
│   │   └── app.css                      # Global styles and themes
├── static/
│   └── favicon.png
├── tests/
│   ├── dashboard.test.ts               # Dashboard component tests
│   ├── layoutStore.test.ts             # Layout store tests
│   ├── widgets.test.ts                 # Widget tests
│   └── theme.test.ts                   # Theme switching tests
├── package.json
├── svelte.config.js
├── tailwind.config.js
├── tsconfig.json
├── vitest.config.ts
└── playwright.config.ts
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: NeoDrag must be wrapped in onMount to avoid SSR issues
// Example: Drag functionality only works client-side
import { onMount } from 'svelte';
import { draggable } from '@neodrag/svelte';

// CRITICAL: localStorage access must be guarded for SSR
// Example: Check typeof localStorage !== 'undefined' before accessing
const isClient = typeof localStorage !== 'undefined';

// CRITICAL: LayerChart Arc component requires proper SVG context
// Example: Arc must be wrapped in Chart > Layer components
import { Chart, Layer, Arc } from 'layerchart';

// CRITICAL: Tailwind/Skeleton theme variables must be applied to :root
// Example: Use CSS custom properties for theme-aware styling
const applyTheme = (theme) => {
  document.documentElement.style.setProperty('--theme-color', theme.color);
};

// CRITICAL: NeoDrag grid snapping requires [x, y] array format
// Example: grid: [32, 32] for 32px grid snapping
// Never set grid to [0, 0] - this breaks dragging entirely

// CRITICAL: Svelte reactive statements needed for theme changes
// Example: Use $: for reactive theme application
$: if (currentTheme) applyTheme(currentTheme);

// CRITICAL: Widget resize needs proper w/h span calculations
// Example: Translate pixel dimensions to grid units
const getGridSpan = (pixels, cellSize) => Math.ceil(pixels / cellSize);
```

## Implementation Blueprint

### Data models and structure

```typescript
// types/widget.ts - Core widget type system
interface Widget {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config: Record<string, any>;
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
}

interface WidgetRegistration {
  id: string;
  name: string;
  component: ComponentType;
  defaultConfig: Record<string, any>;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
}

// types/dashboard.ts - Dashboard configuration
interface DashboardConfig {
  cols: number;
  cellSize: number;
  gap: number;
  widgets: Widget[];
}

interface GridPosition {
  x: number;
  y: number;
  w: number;
  h: number;
}

// types/theme.ts - Theme system
interface Theme {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
  };
  dark: boolean;
}
```

### List of tasks to be completed

```yaml
Task 1: Setup SvelteKit Project Structure
CREATE src/app.html:
  - PATTERN: Standard SvelteKit HTML template
  - Include theme CSS variables in :root
  - Add proper meta tags and viewport

CREATE svelte.config.js:
  - PATTERN: Standard SvelteKit config with adapter
  - Configure Vite for development
  - Add proper TypeScript support

CREATE tailwind.config.js:
  - PATTERN: Extend Tailwind with Skeleton theme
  - Configure CSS custom properties
  - Add dark mode support

Task 2: Create Core Type Definitions
CREATE src/lib/types/widget.ts:
  - PATTERN: Use TypeScript interfaces for type safety
  - Define Widget, WidgetRegistration, and related types
  - Export all types for use across application

CREATE src/lib/types/dashboard.ts:
  - PATTERN: Dashboard configuration types
  - Grid position and layout types
  - Export types for components

Task 3: Implement Layout Persistence Store
CREATE src/lib/stores/layoutStore.ts:
  - PATTERN: Mirror examples/layoutStore.ts structure
  - Use Svelte writable store with localStorage persistence
  - Add SSR-safe localStorage access with typeof checks
  - Implement setWidget, getWidget, and clearLayout methods

CREATE src/lib/stores/themeStore.ts:
  - PATTERN: Svelte store for theme management
  - Persist theme selection to localStorage
  - Provide theme switching functions
  - Apply CSS custom properties to document root

Task 4: Create Grid Layout System
CREATE src/lib/components/DashboardGrid.svelte:
  - PATTERN: Mirror examples/DashboardGrid.svelte
  - Use CSS Grid with dynamic columns and cell sizing
  - Support responsive breakpoints
  - Provide grid context to child components

CREATE src/lib/utils/gridUtils.ts:
  - PATTERN: Utility functions for grid calculations
  - Convert pixels to grid units and vice versa
  - Handle grid snapping and collision detection
  - Validate grid boundaries

Task 5: Implement Draggable Widget System
CREATE src/lib/components/DraggableWidget.svelte:
  - PATTERN: Mirror examples/DraggableWidget.svelte structure
  - Use NeoDrag with position, grid, and events compartments
  - Wrap drag initialization in onMount for SSR safety
  - Connect to layoutStore for position persistence
  - Add resize handles and logic

CREATE src/lib/utils/persistence.ts:
  - PATTERN: Abstract persistence layer interface
  - Implement localStorage adapter
  - Stub out server-side persistence methods
  - Handle errors and fallbacks gracefully

Task 6: Create Theme System
CREATE src/lib/components/ThemeToggle.svelte:
  - PATTERN: Theme switching component
  - Use themeStore for state management
  - Provide light/dark/auto theme options
  - Apply theme changes to CSS custom properties

CREATE src/styles/app.css:
  - PATTERN: Global styles with theme CSS variables
  - Define light and dark theme color schemes
  - Include Skeleton and Tailwind base styles
  - Add widget-specific styling

Task 7: Implement Widget Components
CREATE src/lib/components/widgets/ArcMeter.svelte:
  - PATTERN: Mirror examples/ArcMeter.svelte exactly
  - Use LayerChart Chart, Layer, Arc, and Text components
  - Implement SpringValue for smooth animations
  - Add theme-aware color classes
  - Support configurable segments and thresholds

CREATE src/lib/components/widgets/BarChart.svelte:
  - PATTERN: LayerChart Bar component pattern
  - Create simple bar chart with configurable data
  - Theme-aware coloring and styling
  - Responsive design for widget resizing

Task 8: Create Widget Registry System
CREATE src/lib/components/widgets/WidgetRegistry.svelte:
  - PATTERN: Registry pattern for pluggable widgets
  - Implement widget registration and lookup
  - Support dynamic widget creation
  - Export registry for use in dashboard

CREATE src/lib/stores/widgetStore.ts:
  - PATTERN: Svelte store for widget data management
  - Handle widget creation, deletion, and updates
  - Connect to layoutStore for positioning
  - Support widget configuration persistence

Task 9: Build Main Dashboard Component
CREATE src/lib/components/Dashboard.svelte:
  - PATTERN: Main dashboard container component
  - Integrate DashboardGrid with DraggableWidget
  - Handle widget creation and deletion
  - Connect to all stores (layout, theme, widget)
  - Implement widget toolbar and controls

CREATE src/routes/+layout.svelte:
  - PATTERN: Root layout with theme provider
  - Initialize theme and layout stores
  - Provide global styles and context
  - Handle SSR hydration properly

Task 10: Create Dashboard Routes
CREATE src/routes/+page.svelte:
  - PATTERN: Main dashboard page
  - Import and use Dashboard component
  - Handle initial widget setup
  - Provide user interface for widget management

CREATE src/routes/dashboard/+page.svelte:
  - PATTERN: Dedicated dashboard route
  - Alternative entry point for dashboard
  - Include navigation and controls
  - Handle deep linking and state

Task 11: Add Comprehensive Tests
CREATE tests/layoutStore.test.ts:
  - PATTERN: Test localStorage persistence
  - Test SSR-safe behavior
  - Test widget position updates
  - Mock localStorage for testing

CREATE tests/dashboard.test.ts:
  - PATTERN: Component testing with @testing-library/svelte
  - Test drag and drop functionality
  - Test theme switching
  - Test widget creation and deletion

CREATE tests/theme.test.ts:
  - PATTERN: Theme store and switching tests
  - Test CSS custom property application
  - Test theme persistence
  - Test responsive theme changes

Task 12: E2E Testing and Validation
CREATE playwright.config.ts:
  - PATTERN: Playwright configuration for E2E tests
  - Configure test browsers and viewport
  - Set up test data and fixtures

CREATE tests/e2e/dashboard.spec.ts:
  - PATTERN: E2E tests for drag and drop
  - Test widget persistence across page reloads
  - Test theme switching functionality
  - Test responsive behavior
```

### Per task pseudocode

```typescript
// Task 3: Layout Store Implementation
// layoutStore.ts
import { writable } from 'svelte/store';
import type { Widget } from '../types/widget';

function createLayoutStore() {
  // CRITICAL: SSR-safe localStorage access
  const isClient = typeof localStorage !== 'undefined';
  const initial = isClient 
    ? JSON.parse(localStorage.getItem('dashboardLayout') || '{}')
    : {};
  
  const { subscribe, update } = writable<Record<string, Widget>>(initial);
  
  return {
    subscribe,
    setWidget(id: string, position: GridPosition) {
      update(layout => {
        layout[id] = { ...layout[id], ...position };
        // PATTERN: Debounced localStorage writes
        if (isClient) {
          localStorage.setItem('dashboardLayout', JSON.stringify(layout));
        }
        return layout;
      });
    },
    // Additional methods...
  };
}

// Task 5: Draggable Widget Implementation
// DraggableWidget.svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { draggable, type DragOptions } from '@neodrag/svelte';
  import { layoutStore } from '../stores/layoutStore';
  
  export let id: string;
  export let gridSize: [number, number] = [32, 32];
  
  let dragElement: HTMLElement;
  let position = { x: 0, y: 0 };
  
  // PATTERN: Subscribe to layout store for position
  $: if ($layoutStore[id]) {
    position = $layoutStore[id];
  }
  
  // CRITICAL: Wrap drag initialization in onMount for SSR
  onMount(() => {
    const options: DragOptions = {
      position,
      grid: gridSize,
      onDragEnd: (data) => {
        // PATTERN: Update store on drag end
        layoutStore.setWidget(id, {
          x: data.offsetX,
          y: data.offsetY,
          w: 4, // Default width
          h: 3  // Default height
        });
      }
    };
    
    // Initialize draggable
    const { destroy } = draggable(dragElement, options);
    
    return destroy;
  });
</script>

<div bind:this={dragElement} class="widget-container">
  <slot />
</div>

// Task 7: Arc Meter Widget Implementation
// ArcMeter.svelte
<script lang="ts">
  import { Chart, Layer, Arc, Text } from 'layerchart';
  import { SpringValue } from 'layerchart/animate';
  
  export let value = 50;
  export let segments = 60;
  export let successThreshold = 75;
  export let theme = 'light';
  
  // PATTERN: Theme-aware color classes
  $: successColor = theme === 'dark' ? 'fill-green-400' : 'fill-green-600';
  $: warningColor = theme === 'dark' ? 'fill-yellow-400' : 'fill-yellow-600';
  $: inactiveColor = theme === 'dark' ? 'fill-gray-600' : 'fill-gray-300';
</script>

<Chart>
  <Layer center>
    <SpringValue {value} let:value>
      {#each Array(segments) as _, i}
        {@const angle = (2 * Math.PI) / segments}
        {@const isActive = (i / segments) * 100 < value}
        {@const color = isActive 
          ? (value > successThreshold ? successColor : warningColor)
          : inactiveColor}
        <Arc
          startAngle={i * angle}
          endAngle={(i + 1) * angle}
          innerRadius={-20}
          padAngle={0.01}
          class={color}
        />
      {/each}
      <Text
        value={`${Math.round(value)}%`}
        textAnchor="middle"
        verticalAnchor="middle"
        class="text-3xl font-mono"
      />
    </SpringValue>
  </Layer>
</Chart>
```

### Integration Points
```yaml
DEPENDENCIES:
  - Add to package.json:
    - "@neodrag/svelte": "^2.0.0"
    - "layerchart": "^1.0.0"  
    - "@skeletonlabs/skeleton": "^2.0.0"
    - "tailwindcss": "^3.0.0"
    - "@tailwindcss/forms": "^0.5.0"
    - "@types/d3": "^7.0.0"

CONFIGURATION:
  - tailwind.config.js: Extend with Skeleton theme
  - svelte.config.js: Add Tailwind preprocessing
  - app.html: Include theme CSS variables in :root
  
STORES:
  - layoutStore: Widget position and size persistence
  - themeStore: Theme selection and CSS variable management
  - widgetStore: Widget data and configuration management
  
ROUTING:
  - +layout.svelte: Root layout with theme provider
  - +page.svelte: Main dashboard page
  - dashboard/+page.svelte: Dedicated dashboard route
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm run check        # SvelteKit type checking
npm run lint         # ESLint checking
npm run format       # Prettier formatting

# Expected: No errors. If errors, READ and fix.
```

### Level 2: Unit Tests
```typescript
// tests/layoutStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { layoutStore } from '../src/lib/stores/layoutStore';

describe('layoutStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should persist widget positions', () => {
    layoutStore.setWidget('widget1', { x: 100, y: 200, w: 4, h: 3 });
    const layout = get(layoutStore);
    expect(layout['widget1']).toEqual({ x: 100, y: 200, w: 4, h: 3 });
  });

  it('should handle SSR gracefully', () => {
    // Mock localStorage as undefined
    const originalLocalStorage = global.localStorage;
    delete global.localStorage;
    
    // Should not throw error
    expect(() => layoutStore.setWidget('test', { x: 0, y: 0, w: 1, h: 1 })).not.toThrow();
    
    global.localStorage = originalLocalStorage;
  });
});

// tests/dashboard.test.ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Dashboard from '../src/lib/components/Dashboard.svelte';

describe('Dashboard', () => {
  it('should render dashboard grid', () => {
    render(Dashboard);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('should handle widget creation', async () => {
    const { component } = render(Dashboard);
    // Test widget creation logic
  });
});
```

```bash
# Run tests iteratively until passing:
npm test

# Run with coverage:
npm run test:coverage

# If failing: Debug specific test, fix code, re-run
```

### Level 3: Integration & E2E Testing
```bash
# Start development server
npm run dev

# Run E2E tests
npm run test:e2e

# Manual testing checklist:
# 1. Navigate to http://localhost:5173
# 2. Drag widgets around the grid
# 3. Refresh page - positions should persist
# 4. Toggle theme - colors should update
# 5. Add new widgets - they should appear
# 6. Resize widgets - they should snap to grid
```

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('widget drag and drop persistence', async ({ page }) => {
  await page.goto('/');
  
  // Drag a widget
  await page.locator('[data-testid="arc-meter-widget"]').dragTo(
    page.locator('[data-testid="dashboard-grid"]'), 
    { targetPosition: { x: 200, y: 200 } }
  );
  
  // Refresh page
  await page.reload();
  
  // Check position persisted
  const widget = page.locator('[data-testid="arc-meter-widget"]');
  await expect(widget).toHaveCSS('transform', 'translate(200px, 200px)');
});

test('theme switching', async ({ page }) => {
  await page.goto('/');
  
  // Toggle to dark theme
  await page.click('[data-testid="theme-toggle"]');
  
  // Check dark theme applied
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  
  // Check widget colors updated
  await expect(page.locator('.arc-meter')).toHaveCSS('color', 'rgb(255, 255, 255)');
});
```

## Final Validation Checklist
- [ ] All unit tests pass: `npm test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run check`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Widget drag and drop works smoothly
- [ ] Positions persist across page reloads
- [ ] Theme switching updates all widgets
- [ ] SSR works without hydration errors
- [ ] Responsive design works on mobile
- [ ] ArcMeter widgets render correctly
- [ ] Widget registry allows adding new types
- [ ] Grid snapping works properly
- [ ] No console errors in browser
- [ ] Performance is acceptable (no lag during dragging)

---

## Anti-Patterns to Avoid
- ❌ Don't access localStorage directly without SSR checks
- ❌ Don't initialize NeoDrag outside of onMount
- ❌ Don't set NeoDrag grid to [0, 0] - this breaks dragging
- ❌ Don't forget to cleanup event listeners in onDestroy
- ❌ Don't hardcode theme colors - use CSS custom properties
- ❌ Don't ignore TypeScript errors - fix them properly
- ❌ Don't skip responsive design considerations
- ❌ Don't forget to handle edge cases in grid calculations
- ❌ Don't use sync localStorage operations in reactive statements
- ❌ Don't commit node_modules or build artifacts

## Confidence Score: 8/10

High confidence due to:
- Detailed examples provided in the codebase
- Comprehensive documentation research for all key libraries
- Clear implementation patterns established
- Well-defined validation gates
- Proven technologies (SvelteKit, NeoDrag, LayerChart)

Minor uncertainty around:
- LayerChart v2 API changes (pre-release status)
- Complex grid collision detection edge cases
- Performance optimization for large numbers of widgets