// See https://svelte.dev/docs/kit/types#app
// for information about these interfaces

declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
  
  // Environment variables
  interface ImportMetaEnv {
    readonly VITE_WEBSOCKET_URL: string;
    readonly VITE_API_BASE_URL: string;
    readonly VITE_GENKIT_API_KEY?: string;
    readonly VITE_ENV: string;
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  
  // Global constants from Vite define
  declare const __WEBSOCKET_URL__: string;
  declare const __API_BASE_URL__: string;
  
  // WebSocket types
  interface WebSocketMessage {
    type: 'hardware_metrics' | 'alerts' | 'connection_established' | 'subscription_confirmed' | 'ping' | 'pong' | 'error';
    timestamp: string;
    data?: any;
    client_id?: string;
    subscription_type?: string;
    message?: string;
    alerts?: any[];
  }
  
  // Hardware metrics types (synced with server)
  interface HardwareMetrics {
    timestamp: number;
    cpu: CpuMetrics;
    gpu: GpuMetrics;
    memory: MemoryMetrics;
    storage: StorageMetrics[];
    network: NetworkMetrics;
    system: SystemMetrics;
  }
  
  interface CpuMetrics {
    usage: number;
    temperature: number;
    cores: CoreMetric[];
    frequency: number;
    power: number;
  }
  
  interface CoreMetric {
    id: number;
    usage: number;
    temperature: number;
  }
  
  interface GpuMetrics {
    usage: number;
    temperature: number;
    memory: {
      used: number;
      total: number;
      usage: number;
    };
    frequency: {
      core: number;
      memory: number;
    };
    power: number;
    fanSpeed: number;
  }
  
  interface MemoryMetrics {
    usage: number;
    used: number;
    total: number;
    available: number;
    speed: number;
  }
  
  interface StorageMetrics {
    usage: number;
    used: number;
    total: number;
    temperature: number;
    health: string;
  }
  
  interface NetworkMetrics {
    bytesReceived: number;
    bytesSent: number;
    packetsReceived: number;
    packetsSent: number;
    speed: number;
  }
  
  interface SystemMetrics {
    uptime: number;
    processes: number;
    temperature: number;
  }
  
  // AI Generation types
  interface AiGenerationContext {
    sensorType?: string;
    widgetType?: string;
    theme?: string;
    style?: string;
    existingWidgets?: any[];
    screenSize?: { width: number; height: number };
    userPreferences?: Record<string, any>;
  }
  
  interface AiGenerationResult {
    success: boolean;
    config?: any;
    layouts?: any[];
    error?: string;
    confidence?: number;
    suggestions?: string[];
  }
  
  // Notification types
  interface NotificationOptions {
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    persistent?: boolean;
    actions?: NotificationAction[];
  }
  
  interface NotificationAction {
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }
  
  // Theme types
  type ThemeMode = 'default' | 'cyberpunk' | 'gaming' | 'minimal' | 'rgb';
  
  interface ThemeConfig {
    mode: ThemeMode;
    customColors?: Record<string, string>;
    fontSize?: 'sm' | 'md' | 'lg';
    animations?: boolean;
    effects?: boolean;
  }
  
  // Dashboard state types
  interface DashboardState {
    isEditMode: boolean;
    selectedWidgetId: string | null;
    gridSize: {
      cols: number;
      rows: number;
      cellSize: number;
    };
    theme: ThemeMode;
    showGrid: boolean;
    snapToGrid: boolean;
  }
  
  // Widget configuration export/import types
  interface WidgetExportData {
    version: string;
    exportedAt: number;
    exportedBy?: string;
    widgets: any[];
    layout?: any;
  }
  
  interface ConfigImportOptions {
    preserveIds?: boolean;
    replaceExisting?: boolean;
    validateCompatibility?: boolean;
  }
}

export {};