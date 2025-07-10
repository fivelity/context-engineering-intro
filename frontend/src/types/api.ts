/**
 * API types for backend communication and data structures
 */

import { SensorData, WebSocketMessage } from './sensor';
import { DashboardLayout, WidgetConfig } from './widget';
import { SciFiThemeId } from './sci-fi';

// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
  requestId?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

// Pagination for list responses
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// API endpoints and their request/response types

// Sensor API
export interface GetSensorsResponse extends ApiResponse<SensorData> {}

export interface GetSensorHistoryRequest {
  sensorPath: string;
  startTime: number;
  endTime: number;
  resolution?: 'second' | 'minute' | 'hour' | 'day';
  aggregation?: 'avg' | 'min' | 'max' | 'sum';
}

export interface SensorHistoryPoint {
  timestamp: number;
  value: number;
  min?: number;
  max?: number;
  count?: number;
}

export interface GetSensorHistoryResponse extends ApiResponse<SensorHistoryPoint[]> {}

// Hardware info API
export interface HardwareInfo {
  cpu: {
    name: string;
    manufacturer: string;
    cores: number;
    threads: number;
    baseFrequency: number;
    maxFrequency: number;
    architecture: string;
  };
  gpu: Array<{
    name: string;
    manufacturer: string;
    memory: number;
    driverVersion: string;
    computeCapability?: string;
  }>;
  memory: {
    total: number;
    type: string;
    speed: number;
    slots: number;
    manufacturer?: string;
  };
  motherboard: {
    name: string;
    manufacturer: string;
    version: string;
    biosVersion: string;
  };
  storage: Array<{
    name: string;
    type: 'HDD' | 'SSD' | 'NVME';
    capacity: number;
    interface: string;
    manufacturer?: string;
  }>;
  system: {
    os: string;
    version: string;
    architecture: string;
    uptime: number;
  };
}

export interface GetHardwareInfoResponse extends ApiResponse<HardwareInfo> {}

// Layout API
export interface SaveLayoutRequest {
  layout: DashboardLayout;
  overwrite?: boolean;
}

export interface SaveLayoutResponse extends ApiResponse<{ id: string }> {}

export interface GetLayoutsResponse extends PaginatedResponse<DashboardLayout> {}

export interface GetLayoutRequest {
  id: string;
}

export interface GetLayoutResponse extends ApiResponse<DashboardLayout> {}

export interface DeleteLayoutRequest {
  id: string;
}

export interface DeleteLayoutResponse extends ApiResponse<{ deleted: boolean }> {}

// Widget presets API
export interface WidgetPreset {
  id: string;
  name: string;
  description: string;
  category: string;
  widgetType: string;
  config: Partial<WidgetConfig>;
  thumbnail?: string;
  tags: string[];
  popularity: number;
  author?: string;
  created: number;
  modified: number;
}

export interface GetWidgetPresetsResponse extends PaginatedResponse<WidgetPreset> {}

export interface SaveWidgetPresetRequest {
  preset: Omit<WidgetPreset, 'id' | 'created' | 'modified' | 'popularity'>;
}

export interface SaveWidgetPresetResponse extends ApiResponse<{ id: string }> {}

// AI Layout suggestions API
export interface AILayoutRequest {
  currentLayout: DashboardLayout;
  preferences: {
    priority: 'performance' | 'aesthetics' | 'functionality';
    theme: SciFiThemeId;
    density: 'compact' | 'spacious' | 'balanced';
    focusAreas: string[];
    constraints: {
      maxWidgets?: number;
      minWidgetSize?: { w: number; h: number };
      screenSize: { width: number; height: number };
    };
  };
  context: {
    sensorTypes: string[];
    hardwareInfo: Partial<HardwareInfo>;
    userPreferences: Record<string, any>;
  };
}

export interface AILayoutSuggestion {
  id: string;
  name: string;
  description: string;
  reasoning: string;
  confidence: number;
  layout: DashboardLayout;
  metrics: {
    efficiency: number;
    aesthetics: number;
    functionality: number;
    performance: number;
  };
  preview?: string; // Base64 encoded preview image
  tags: string[];
}

export interface GetAILayoutSuggestionsResponse extends ApiResponse<AILayoutSuggestion[]> {}

export interface ApplyAILayoutRequest {
  suggestionId: string;
  modifications?: Partial<DashboardLayout>;
}

export interface ApplyAILayoutResponse extends ApiResponse<DashboardLayout> {}

// Settings API
export interface UserSettings {
  theme: SciFiThemeId;
  dashboard: {
    autoSave: boolean;
    autoSaveInterval: number;
    snapToGrid: boolean;
    showGrid: boolean;
    gridSize: number;
    maxWidgets: number;
  };
  notifications: {
    enabled: boolean;
    desktop: boolean;
    email: boolean;
    webhook?: string;
  };
  performance: {
    animationsEnabled: boolean;
    virtualizationEnabled: boolean;
    updateInterval: number;
    maxHistoryPoints: number;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    usageData: boolean;
  };
}

export interface GetUserSettingsResponse extends ApiResponse<UserSettings> {}

export interface SaveUserSettingsRequest {
  settings: Partial<UserSettings>;
}

export interface SaveUserSettingsResponse extends ApiResponse<UserSettings> {}

// System status API
export interface SystemStatus {
  server: {
    uptime: number;
    version: string;
    environment: 'development' | 'production';
    performance: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
    };
  };
  hardware: {
    accessible: boolean;
    adminRequired: boolean;
    sensors: {
      total: number;
      active: number;
      errors: number;
    };
  };
  websocket: {
    connected: boolean;
    clients: number;
    messagesPerSecond: number;
    latency: number;
  };
  ai: {
    available: boolean;
    provider: string;
    model: string;
    requestsToday: number;
    quotaRemaining: number;
  };
  database: {
    connected: boolean;
    size: number;
    lastBackup?: number;
  };
}

export interface GetSystemStatusResponse extends ApiResponse<SystemStatus> {}

// Export/Import API
export interface ExportDataRequest {
  includeLayouts: boolean;
  includeSettings: boolean;
  includePresets: boolean;
  includeHistory?: boolean;
  format: 'json' | 'yaml' | 'csv';
  compress?: boolean;
}

export interface ExportDataResponse extends ApiResponse<{
  downloadUrl: string;
  fileName: string;
  size: number;
  expiresAt: number;
}> {}

export interface ImportDataRequest {
  file: File;
  options: {
    mergeLayouts: boolean;
    mergeSettings: boolean;
    mergePresets: boolean;
    overwriteExisting: boolean;
  };
}

export interface ImportResult {
  success: boolean;
  imported: {
    layouts: number;
    settings: boolean;
    presets: number;
  };
  errors: string[];
  warnings: string[];
}

export interface ImportDataResponse extends ApiResponse<ImportResult> {}

// Analytics API (if enabled)
export interface AnalyticsEvent {
  event: string;
  category: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface SendAnalyticsRequest {
  events: AnalyticsEvent[];
}

export interface SendAnalyticsResponse extends ApiResponse<{ processed: number }> {}

export interface GetAnalyticsResponse extends ApiResponse<{
  dashboardUsage: {
    dailyActiveUsers: number;
    totalSessions: number;
    averageSessionDuration: number;
    mostUsedWidgets: Array<{ type: string; count: number }>;
  };
  performance: {
    averageLoadTime: number;
    errorRate: number;
    uptimePercentage: number;
  };
  features: {
    aiSuggestionsUsed: number;
    customLayoutsCreated: number;
    themesUsed: Record<string, number>;
  };
}> {}

// WebSocket specific types
export interface WebSocketConnectionConfig {
  url: string;
  protocols?: string[];
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
  timeout: number;
}

export interface WebSocketConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  reconnectAttempts: number;
  lastError?: string;
  latency: number;
  uptime: number;
}

// Batch operations for performance
export interface BatchRequest<T = any> {
  operations: Array<{
    id: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    endpoint: string;
    data?: T;
  }>;
}

export interface BatchResponse<T = any> {
  results: Array<{
    id: string;
    success: boolean;
    data?: T;
    error?: ApiError;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    duration: number;
  };
}

// Real-time subscriptions
export interface SubscriptionRequest {
  type: 'sensor_data' | 'layout_changes' | 'system_status' | 'ai_progress';
  filters?: Record<string, any>;
  interval?: number;
}

export interface SubscriptionResponse extends ApiResponse<{
  subscriptionId: string;
  expiresAt: number;
}> {}

export interface UnsubscribeRequest {
  subscriptionId: string;
}

export interface UnsubscribeResponse extends ApiResponse<{ unsubscribed: boolean }> {}

// Error codes for standardized error handling
export const API_ERROR_CODES = {
  // Client errors (4xx)
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  
  // Hardware specific errors
  HARDWARE_ACCESS_DENIED: 'HARDWARE_ACCESS_DENIED',
  SENSOR_UNAVAILABLE: 'SENSOR_UNAVAILABLE',
  DRIVER_ERROR: 'DRIVER_ERROR',
  
  // AI service errors
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  AI_QUOTA_EXCEEDED: 'AI_QUOTA_EXCEEDED',
  AI_INVALID_PROMPT: 'AI_INVALID_PROMPT',
  
  // WebSocket errors
  WEBSOCKET_CONNECTION_FAILED: 'WEBSOCKET_CONNECTION_FAILED',
  WEBSOCKET_PROTOCOL_ERROR: 'WEBSOCKET_PROTOCOL_ERROR',
  WEBSOCKET_AUTH_FAILED: 'WEBSOCKET_AUTH_FAILED',
} as const;

// Utility type for API error codes
export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];

// HTTP method types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API client configuration
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  retryDelay: number;
  headers: Record<string, string>;
  auth?: {
    type: 'bearer' | 'api-key' | 'basic';
    token: string;
  };
}

// Type guards for API responses
export function isApiError(response: any): response is ApiResponse & { success: false; error: ApiError } {
  return response && typeof response === 'object' && response.success === false && response.error;
}

export function isApiSuccess<T>(response: any): response is ApiResponse<T> & { success: true; data: T } {
  return response && typeof response === 'object' && response.success === true && response.data !== undefined;
}