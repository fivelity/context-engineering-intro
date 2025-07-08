## FEATURE: SvelteKit Modular Dashboard

Fully extensible, theme-aware frontend dashboard in SvelteKit that lets users drag, resize, snap, and persist widgets built with LayerChart and NeoDrag. The dashboard will support:

- Dynamic grid layouts with snap-to-grid positioning  
- Persisted widget positions & sizes (localStorage on client, pluggable backend)  
- Theme‐aware widgets (light/dark/custom themes via Skeleton/Tailwind tokens)  
- Resizable and draggable chart widgets (ArcMeters, radial gauges, bar charts)  
- Pluggable architecture so new widget types can register themselves  

### EXAMPLES

Place reusable component patterns in `examples/` for Claude to mimic:

- **examples/ArcMeter.svelte**  
  - Self-contained Svelte wrapper around LayerChart’s `Arc` + `SpringValue` + `Text`  
  - Demonstrates segment math, dynamic class bindings, center labels  

- **examples/DashboardGrid.svelte**  
  - Grid container using CSS Grid (`grid-template-columns: repeat({cols}, {cellSize}px)`)  
  - Reads `cols` and `cellSize` from Svelte context to show grid generation  

- **examples/DraggableWidget.svelte**  
  - NeoDrag `draggable` with `position`, `grid`, and `events` Compartments  
  - Subscribes to a `layoutStore` and updates on `onDragEnd` for persistence  

- **examples/layoutStore.ts**  
  - Svelte writable store that hydrates from `localStorage` and saves widget layouts  
  - API: `setWidget(id, { x, y, w, h })`  

- **examples/ThemeConfig.js**  
  - Tailwind/Skeleton CSS-variable tokens for light, dark, and custom themes  
  - Illustrates how to switch themes at runtime and propagate to widget classes  

### DOCUMENTATION

Link to all relevant guides and API references so Claude can fetch behavior and edge-cases:

- SvelteKit Routing & Layouts  
  - https://kit.svelte.dev/docs/routing  
  - https://kit.svelte.dev/docs/load  

- Tailwind + Skeleton Theming  
  - https://tailwindcss.com/docs/theme  
  - https://www.skeleton.dev/docs/theming  

- NeoDrag Svelte Plugin  
  - https://github.com/neodrag/svelte#position  
  - https://github.com/neodrag/svelte#grid  

- LayerChart Components  
  - https://layerchart.dev/docs/Arc  
  - https://layerchart.dev/docs/Text  
  - https://layerchart.dev/docs/TransformContext  

- Browser Storage & Persistence  
  - MDN `localStorage` best practices: https://developer.mozilla.org/localStorage  
  - Optional IndexedDB strategy: https://developer.mozilla.org/indexedDB  

### OTHER CONSIDERATIONS

Capture important “gotchas,” non-functional requirements, and validation needs:

- **SSR & Hydration**:  
  - Disable NeoDrag on server side; wrap drag code in `onMount`  
  - Ensure `layoutStore` doesn’t reference `window` until client  

- **Reactivity & Stores**:  
  - Use Svelte’s `$:` reactive statements for theme and layout changes  
  - Debounce or throttle store writes to avoid perf spikes on rapid dragging  

- **Performance**:  
  - Virtualize large numbers of widgets or charts (only render visible panels)  
  - Use Canvas fallback for complex charts to reduce SVG DOM nodes  

- **Accessibility**:  
  - Provide `aria-label` or `<title>` tags on all SVG charts  
  - Keyboard support for moving/resizing widgets (e.g., arrow keys + modifiers)  

- **Resizing Logic**:  
  - Store `w`/`h` spans as grid units and translate into `grid-column`/`grid-row`  
  - Define min/max spans to avoid zero-width or overflow  

- **Theming Edge Cases**:  
  - Dark/light switch must rebind all chart color classes dynamically  
  - Ensure color-blind-friendly palettes and high-contrast modes  

- **Testing Requirements**:  
  - Unit tests for `layoutStore` operations, theme toggles, and segment math  
  - E2E tests (Playwright) to verify drag-and-snap behavior and persistence  
  - Visual regression tests for chart rendering under different themes  

- **Plugin Architecture**:  
  - Define a `WidgetRegistry` API so future widgets can register:  
    ```ts
    WidgetRegistry.register({
      id: 'customGauge',
      component: CustomGauge,
      defaultConfig: { segments: 10, threshold: 80 },
    });
    ```  
  - Claude should scaffold registry code and update DashboardGrid to render registered widgets  

- **Future Backend Integration**:  
  - Abstract persistence layer behind an interface so layouts can be saved server-side  
  - Stub out fetch/save methods in PRP for eventual user account support  


