# SenseCanvas: The Hyper-Customizable PC Sensor Dashboard

![SenseCanvas Screenshot](https://placehold.co/800x450.png?text=SenseCanvas+UI)

SenseCanvas is a modern, real-time, and deeply customizable dashboard for monitoring your PC's hardware sensors. Built with **SvelteKit**, **Svelte 5**, and **Genkit**, it provides a visually rich and intuitive interface that puts you in complete control of how you view your system’s data.

## ✨ Core Features

- **Real-Time Sensor Monitoring**: Connect to a FastAPI or Node backend to stream live sensor data (CPU, GPU, RAM, fans, storage) into reactive Svelte stores.
- **Dynamic Widget Grid**: Powered by a draggable/resizable grid layout (e.g. `NeoDrag`, `svelte-grid`), with full lifecycle hooks for state persistence.
- **AI-Powered Layout Suggestions**: Integrate Genkit to provide intelligent widget arrangement using prompts and context from current dashboard state.
- **Extensive Widget Library**: Browse configurable widget presets or craft your own using a visual editor powered by Svelte actions.
- **Import & Export**:
  - Save entire layouts as `.json` with widget configs and settings.
  - Share/export individual widgets for reuse across dashboards.
- **Light & Dark Themes**: Theme toggling via app-level SvelteKit `themeStore`, scoped Tailwind classes, or CSS variables.

---

## 🛠️ Deep Customization

SenseCanvas was designed for radical personalization. The **Widget Configurator** empowers you to tweak every detail.

### Widget Types

- `Gauge`: Circular, arc (speedometer), or linear styles
- `Graph`: Area, bar, or line charts (use `LayerChart` SVG toggle for performance)
- `Simple`: Minimal single-value display
- `Meter`: Compact horizontal bars for usage metrics
- `Multi-Resource`: Aggregate view across multiple sensors

### Visual & Style Options

Configurable via reactive form inputs bound with `bind:value` and `zod` schema validation:

- Typography: Font size, color, label toggles
- Colors: Color pickers bound to each visual element
- Borders: Adjustable thickness, style, and radius
- Chart Parameters:
  - `barThickness`, `strokeWidth`, `startAngle`, `endAngle`, `tickCount`

### Grid & Layout Settings

- Adjustable column/row settings using local layout store
- Grid overlay toggle + grid snap mode
- Background via inline style or Tailwind class bindings

### Alerts

- Add alert conditions with reactive thresholds
- Trigger desktop notifications using `Notification` API and change widget states via reactive stores

---

## 🚀 Getting Started

1. **Explore the Toolbar**:
   - Use buttons to switch layouts, open import/export modal, access AI layout suggestions, and tweak global settings
2. **Add a Widget**:
   - Click '+' (plus icon) to open configurator modal
   - Choose a preset or define one from scratch
   - Customize via tabs and add to dashboard using `addWidget()` action
3. **Edit a Widget**:
   - Right-click a widget → opens pre-filled configurator
   - Save edits and persist to layout store
4. **Save Presets**:
   - Create and save to widget registry (JSON-based local store or IndexedDB)

---

## 💻 Technology Stack

| Layer | Tech |
|-------|------|
| Framework | [SvelteKit](https://kit.svelte.dev) (Svelte 5, File-Based Routing) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| UI | [Tailwind CSS](https://tailwindcss.com/), [Skeleton UI](https://www.skeleton.dev/) |
| AI/Gen | [Google Genkit](https://firebase.google.com/docs/genkit) |
| Charts | [LayerChart](https://layerchart.dev), optional fallback to [Chart.js](https://www.chartjs.org/) |
| Icons | [Lucide Svelte](https://www.npmjs.com/package/lucide-svelte) |
| Forms | Native Svelte forms + [zod](https://zod.dev/) for validation |