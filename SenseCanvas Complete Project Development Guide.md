---
date created: Saturday, July 12th 2025, 2:16:45 am
date modified: Saturday, July 12th 2025, 2:29:29 am
---
# SenseCanvas: Complete Project Development Guide

As an expert software engineer with a fullstack background and a passion for crafting elegant, user-centric interfaces, I'm excited to present this comprehensive development guide for SenseCanvas—a futuristic, real-time PC hardware monitoring dashboard. SenseCanvas is designed to deliver an overwhelmingly positive user experience for tech enthusiasts and PC gamers, blending sci-fi aesthetics with deep customization, AI-powered intelligence, and seamless performance. Drawing from my experience building high-performance web apps, I'll guide you through every aspect, emphasizing efficient yet elegant implementations that avoid common pitfalls. This guide includes high-level overviews, step-by-step setups with code snippets, deep insights into integrations, and proactive advice on error avoidance—ensuring you build a stunning, unique dashboard that users will rave about.

## Project Overview

### Scope and Goals
SenseCanvas is a modern, cross-platform dashboard for monitoring PC hardware sensors in real-time, with a laser focus on personalization and immersive UX. It transforms raw metrics (CPU/GPU usage, temperatures, fan speeds, etc.) into visually captivating widgets, empowering users to create shareable, themed setups—like a cyberpunk command center for gamers or a minimalist pro rig for enthusiasts.

**Key Goals**:
- **Real-Time Monitoring**: Stream hardware data with low latency, supporting advanced Windows sensors and fallbacks for other OS.
- **Immense Customization**: Drag-and-drop widgets, AI-generated layouts/widgets/SVGs, themes (Gaming, RGB, etc.), and JSON import/export for community sharing.
- **Unique UX Flow**: Intuitive edit mode with live previews, alerts, and AI assistance for effortless personalization—resulting in "wow" moments like generating a custom gauge from a prompt.
- **Performance and Elegance**: Smooth reactivity (Svelte 5 runes), stunning SVG visuals (Cosmic UI + LayerChart), and robust backend (FastAPI WebSockets).
- **Scope Limitations**: Primarily Windows-optimized; no mobile app (yet); focuses on monitoring, not control.

The project fosters a community where users share JSON configs, turning SenseCanvas into a hub for creative hardware enthusiasts.

### Technologies Stack
SenseCanvas uses a battle-tested stack for efficiency and innovation. Versions emphasize "latest" where stable (as of July 11, 2025), with specifics for compatibility.

**Frontend**:
- **SvelteKit 2+ / Svelte 5+**: Reactive framework with runes for state management. Docs: https://kit.svelte.dev/ (SvelteKit), https://svelte.dev/docs/svelte (Svelte core, including runes at https://svelte.dev/docs/svelte/what-are-runes and migration guide at https://svelte.dev/docs/svelte/v5-migration-guide). Blog intro: https://svelte.dev/blog/runes. GitHub: https://github.com/sveltejs/svelte.
- **TailwindCSS 4+**: Utility-first CSS for rapid, themeable styling. Released Jan 2025. Docs/Install: https://tailwindcss.com/blog/tailwindcss-v4, https://tailwindcss.com/docs (Vite guide). GitHub: https://github.com/tailwindlabs/tailwindcss.
- **TypeScript 5+**: Type-safe JS (current: 5.9 beta, stable 5.8.3; upcoming 6.0 with breaking changes). Docs: https://www.typescriptlang.org/docs/, Release notes: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-8.html. GitHub: https://github.com/microsoft/typescript/releases.
- **Cosmic UI (latest)**: SVG-first sci-fi component library for futuristic aesthetics. Docs: https://www.cosmic-ui.com/docs (main sections: Getting Started, Components like Frame/Chart, Customization with SVG methods; Install: `npm i cosmic-ui`; Svelte integration: Import components and extend via slots/props for custom SVGs). GitHub: Not explicitly found, but related to sci-fi UI patterns.
- **LayerChart@next**: Svelte 5-compatible composable charts (e.g., Arc for gauges). Docs: https://next.layerchart.com/getting-started, Changelog: https://www.layerchart.com/changelog (Svelte 5 perf notes). GitHub: https://github.com/techniq/layerchart (releases: https://github.com/techniq/layerchart/releases).
- **@neodrag/svelte@next**: Draggable/resizable directives (v3+ as of Jan 2025). Docs: https://next.neodrag.dev/docs/svelte. GitHub: https://github.com/PuruVJ/neodrag (releases: https://github.com/PuruVJ/neodrag/releases, blog: https://www.puruvj.dev/blog/whats-up-with-neodrag-v3).
- **Zod (latest)**: Schema validation for configs/forms. Docs: https://zod.dev/. GitHub: https://github.com/colinhacks/zod.

**Backend**:
- **FastAPI (latest)**: Python API framework with WebSockets. Docs: https://fastapi.tiangolo.com/. GitHub: https://github.com/tiangolo/fastapi.
- **Pydantic v2.11+**: Data validation/models. Docs: https://docs.pydantic.dev/latest/. GitHub: https://github.com/pydantic/pydantic.
- **PyHardwareMonitor 1.0.0**: Thin Python wrapper for hardware sensors. Install: `pip install HardwareMonitor`. GitHub: https://github.com/snip3rnick/PyHardwareMonitor.
- **LibreHardwareMonitorLib.dll (latest)**: .NET library for deep monitoring. GitHub: https://github.com/LibreHardwareMonitor/LibreHardwareMonitor.
- **pythonnet (latest)**: Python-.NET interop for DLL access. Docs: http://pythonnet.github.io/. GitHub: https://github.com/pythonnet/pythonnet.
- **psutil (latest)**: Cross-platform fallback.

**AI and Other**:
- **Google Genkit (latest)**: AI framework for layouts/widgets/SVGs. Docs: https://firebase.google.com/docs/genkit (overview), https://firebase.google.com/docs/genkit/get-started (JS guide), https://firebase.google.com/docs/genkit/models (content generation). GitHub: Integrated with Firebase (no direct repo; see Vertex AI).
- **WebSockets**: Built-in FastAPI/Svelte.
- **Notification API**: Browser-native for alerts.

### Project Structure
```
SenseCanvas/
├── client/                  # Frontend (SvelteKit)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/  # DashboardGrid, WidgetConfigurator, ThemeToggle
│   │   │   │   └── widgets/ # GaugeWidget (extends Cosmic UI + LayerChart)
│   │   │   ├── utils/       # sensorClient.ts, aiSuggestions.ts, notifications.ts
│   │   │   ├── types/       # sensor.ts, widget.ts, ai.ts
│   │   │   └── schemas/     # Zod schemas for configs
│   │   ├── routes/          # +page.svelte (dashboard), api/ for AI/sensors
│   │   └── styles/          # app.css (Tailwind + Cosmic vars)
│   ├── static/              # Assets
│   └── package.json         # Dependencies: layerchart@next, etc.
├── server/                  # Backend (FastAPI)
│   ├── src/
│   │   ├── api/             # Routers (AI, config)
│   │   ├── services/        # Hardware polling
│   │   ├── models/          # Pydantic HardwareMetrics
│   │   └── main.py          # Entry with WebSockets
│   ├── scripts/             # setup_hardware_monitor.py
│   ├── LibreHardwareMonitorLib.dll
│   ├── requirements.txt     # HardwareMonitor, etc.
│   └── .env
├── docs/                    # This guide, etc.
└── README.md
```

Layout: Grid-based (CSS Grid + NeoDrag for drag/resize). Styling: Tailwind utilities + Cosmic UI SVGs for borders/frames. UI/UX Flow: Toolbar for add/edit/AI; modal Configurator with tabs (Library, AI Generate, Create Custom) and live preview; dashboard edit mode with snapping/collisions.

## Project Setup Steps

### Prerequisites
- Node.js 18+ (https://nodejs.org/)
- Python 3.8+ (https://www.python.org/)
- pnpm (https://pnpm.io/)
- .NET Runtime 6+ (https://dotnet.microsoft.com/download/dotnet/6.0) for DLL.

### Step 1: Clone and Initialize
```bash
git clone <your-repo-url> SenseCanvas
cd SenseCanvas
```

### Step 2: Frontend Setup
```bash
cd client
pnpm install
# Key deps (add to package.json if needed):
pnpm add svelte@5+ @sveltejs/kit@2+ tailwindcss@4+ typescript@5+ cosmic-ui layerchart@next @neodrag/svelte@next zod
pnpm add -D @tailwindcss/postcss # For Tailwind v4 PostCSS plugin
```
Configure `svelte.config.js` (Svelte 5 + TS + Tailwind):
```js
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-auto';
import { defineConfig } from 'vite';
import tailwind from '@tailwindcss/postcss'; // Tailwind 4 plugin

export default defineConfig({
  plugins: [tailwind()],
  preprocess: vitePreprocess()
});
```
`tailwind.config.js` (v4 syntax):
```js
export default {
  content: ['./src/**/*.{svelte,html,js,ts}'],
  theme: { extend: { colors: { primary: '#00ff88' } } }, // Customize for themes
  plugins: [] // Add Cosmic UI vars if needed
};
```
`tsconfig.json` (TS 5+):
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "include": ["src/**/*.d.ts", "src/**/*.ts", "src/**/*.js", "src/**/*.svelte"]
}
```

### Step 3: Backend Setup
```bash
cd ../server
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt  # Include: fastapi, pydantic==2.11.*, HardwareMonitor==1.0.0, pythonnet
# Download DLL from GitHub release: https://github.com/LibreHardwareMonitor/LibreHardwareMonitor/releases
python scripts/setup_hardware_monitor.py  # Script to clr.AddReference('LibreHardwareMonitorLib.dll')
```
`.env` example:
```
PORT=8000
CORS_ORIGINS=http://localhost:5173
```

### Step 4: Run Development Servers
- Backend: `uvicorn src.main:app --reload --host 0.0.0.0 --port 8000` (Run as admin for full sensors).
- Frontend: `cd client && pnpm dev` (http://localhost:5173).

Example: Connect WebSocket in `utils/sensorClient.ts`:
```ts
let ws = $state<WebSocket | null>(null);
$effect(() => {
  ws = new WebSocket('ws://localhost:8000/ws');
  ws.onmessage = (e) => { /* Update $state sensor data */ };
  return () => ws?.close(); // Cleanup to avoid leaks
});
```

## Implementation and Integration Insights

### Frontend: Building Reactive UI with Svelte 5 Runes
Svelte 5's runes are a game-changer for reactivity—avoid Svelte 4 stores to prevent migration headaches. Example Widget (GaugeWidget.svelte):
```svelte
<script lang="ts">
  import { Chart, Arc } from 'layerchart'; // @next for Svelte 5
  import Frame from 'cosmic-ui/Frame'; // Sci-fi border
  import { draggable } from '@neodrag/svelte'; // @next

  let value = $state(0); // Reactive state
  let config = $state({ /* Zod-validated schema */ });

  $effect(() => { /* Subscribe to sensorStore, update value */ });
</script>

<Frame class="widget" use:draggable={{ grid: 10 }}> <!-- NeoDrag with snap -->
  <Chart>
    <Arc value={$derived(value)} {...config.appearance} /> <!-- LayerChart arc -->
  </Chart>
</Frame>
```
**Integration Tip**: Combine Cosmic UI <Frame> with LayerChart for themed gauges—extend SVGs via Cosmic methods (e.g., programmatic paths). Use $derived for computed styles (e.g., color based on thresholds).

**Avoiding Mistakes**: Don't mix runes with old $: labels (breaking in S5)—migrate fully (see https://svelte.dev/docs/svelte/v5-migration-guide). Fix: Test with `pnpm check`. For NeoDrag, always set bounds to prevent off-screen drags: `{ bounds: { x: 0, y: 0, width: gridWidth } }`.

### Backend: Real-Time Data with FastAPI and Hardware Monitoring
Main.py example:
```python
from fastapi import FastAPI, WebSocket
from pydantic import BaseModel  # v2.11+
from hardwaremonitor import Computer  # HardwareMonitor 1.0.0
import clr; clr.AddReference('LibreHardwareMonitorLib.dll')  # pythonnet

app = FastAPI()
class HardwareMetrics(BaseModel):  # Pydantic model
    cpu: dict  # etc.

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    computer = Computer(cpu=True, gpu=True)  # Init
    while True:
        computer.Update()  # Poll
        data = computer.ToBuiltinTypes()  # Serialize
        await websocket.send_json(data)  # Broadcast
```
**Integration Tip**: Use asyncio for non-blocking polls (interval ~1s). Fallback: `import psutil` for non-Windows.

**Avoiding Mistakes**: DLL not found? Ensure it's in cwd or add ref path—fix: `clr.AddReference(os.path.abspath('LibreHardwareMonitorLib.dll'))`. Admin privileges missing? Sensors limited—fix: Run with `Run as Administrator` or manifest. Pythonnet COM issues: Use `ToBuiltinTypes()` for JSON-safe data.

### AI Integration with Genkit
Server route (+server.js for SvelteKit API):
```js
import { genkit } from '@genkit/core'; // Latest via Firebase
export async function POST({ request }) {
  const { prompt } = await request.json();
  const result = await genkit.generate({ model: 'gemini-1.5-pro', prompt }); // Context-aware
  return json(result);
}
```
Client call in Configurator: Async $effect to fetch and parse into $state config.

**Avoiding Mistakes**: No API key? Set via Firebase env—fix: Follow https://firebase.google.com/docs/genkit/get-started. Prompt hallucinations: Add context (e.g., "Use Cosmic UI SVG for gauge")—fix: Chain refinements.

### UI/UX: Widget Configurator Flow
As per your vision: Modal with tabs (Library, AI Generate, Create Custom). Live preview via $derived. JSON export: `JSON.stringify(config)` with Zod parse on import.

**Deep Insight**: For overwhelming positivity, add undo/redo via $state snapshots. Keyboard shortcuts (Esc cancel) enhance flow.

**Common Setbacks and Fixes**:
- **Reactivity Breaks (S5 Runes)**: Forgetting $effect cleanup—fix: Always return cleanup fn.
- **Tailwind v4 Conflicts**: Old syntax errors—fix: Update to v4 color palette (https://tailwindcss.com/blog/tailwindcss-v4).
- **Hardware Access Denied**: No admin—fix: Prompt user or use psutil fallback conditionally.
- **AI Rate Limits**: Over-prompting—fix: Client-side caching of suggestions.
- **Perf with Many Widgets**: LayerChart slowdown—fix: Use Canvas fallback (`useCanvas: true`) for >20 widgets.
- **DLL Loading Fails**: pythonnet version mismatch—fix: Pin to compatible (test with code_execution tool if needed).
- **Zod Validation Errors**: Dynamic schemas—fix: Use `z.discriminatedUnion('type', [...])` for widget types.

This guide equips you to build SenseCanvas end-to-end. For expansions (e.g., community API), iterate with user feedback—let's make monitoring magical!