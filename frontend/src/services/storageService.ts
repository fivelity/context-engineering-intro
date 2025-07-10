/**
 * Storage Service - Import/export functionality for layouts and widgets
 * Handles JSON serialization, file operations, and data validation
 */

import { DashboardLayout, WidgetConfig } from '../types/widget';
import { SensorData } from '../types/sensor';

export interface ExportData {
  version: string;
  exported: number;
  type: 'layout' | 'widget' | 'settings' | 'full-backup';
  data: any;
  metadata: {
    application: string;
    version: string;
    platform: string;
    timestamp: number;
  };
}

export interface ImportResult {
  success: boolean;
  message: string;
  data?: any;
  warnings?: string[];
  errors?: string[];
}

export interface BackupOptions {
  includeLayouts?: boolean;
  includeWidgets?: boolean;
  includeSettings?: boolean;
  includeSensorData?: boolean;
  compression?: boolean;
}

class StorageService {
  private readonly currentVersion = '1.0.0';
  private readonly applicationName = 'SenseCanvas';

  /**
   * Export dashboard layout to JSON
   */
  exportLayout(layout: DashboardLayout): string {
    const exportData: ExportData = {
      version: this.currentVersion,
      exported: Date.now(),
      type: 'layout',
      data: layout,
      metadata: {
        application: this.applicationName,
        version: this.currentVersion,
        platform: this.getPlatformInfo(),
        timestamp: Date.now()
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export multiple layouts
   */
  exportLayouts(layouts: DashboardLayout[]): string {
    const exportData: ExportData = {
      version: this.currentVersion,
      exported: Date.now(),
      type: 'layout',
      data: layouts,
      metadata: {
        application: this.applicationName,
        version: this.currentVersion,
        platform: this.getPlatformInfo(),
        timestamp: Date.now()
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export single widget configuration
   */
  exportWidget(widget: WidgetConfig): string {
    const exportData: ExportData = {
      version: this.currentVersion,
      exported: Date.now(),
      type: 'widget',
      data: widget,
      metadata: {
        application: this.applicationName,
        version: this.currentVersion,
        platform: this.getPlatformInfo(),
        timestamp: Date.now()
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export multiple widgets
   */
  exportWidgets(widgets: WidgetConfig[]): string {
    const exportData: ExportData = {
      version: this.currentVersion,
      exported: Date.now(),
      type: 'widget',
      data: widgets,
      metadata: {
        application: this.applicationName,
        version: this.currentVersion,
        platform: this.getPlatformInfo(),
        timestamp: Date.now()
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export application settings
   */
  exportSettings(settings: Record<string, any>): string {
    const exportData: ExportData = {
      version: this.currentVersion,
      exported: Date.now(),
      type: 'settings',
      data: settings,
      metadata: {
        application: this.applicationName,
        version: this.currentVersion,
        platform: this.getPlatformInfo(),
        timestamp: Date.now()
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Create full backup of all data
   */
  createFullBackup(options: BackupOptions = {}): string {
    const {
      includeLayouts = true,
      includeWidgets = true,
      includeSettings = true,
      includeSensorData = false
    } = options;

    const backupData: any = {};

    if (includeLayouts) {
      backupData.layouts = this.getStoredLayouts();
    }

    if (includeWidgets) {
      backupData.widgets = this.getStoredWidgets();
    }

    if (includeSettings) {
      backupData.settings = this.getStoredSettings();
    }

    if (includeSensorData) {
      backupData.sensorData = this.getStoredSensorData();
    }

    const exportData: ExportData = {
      version: this.currentVersion,
      exported: Date.now(),
      type: 'full-backup',
      data: backupData,
      metadata: {
        application: this.applicationName,
        version: this.currentVersion,
        platform: this.getPlatformInfo(),
        timestamp: Date.now()
      }
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import layout from JSON
   */
  importLayout(jsonData: string): ImportResult {
    try {
      const exportData: ExportData = JSON.parse(jsonData);
      const validationResult = this.validateImportData(exportData, 'layout');
      
      if (!validationResult.success) {
        return validationResult;
      }

      // Handle different data formats
      let layouts: DashboardLayout[];
      if (Array.isArray(exportData.data)) {
        layouts = exportData.data;
      } else {
        layouts = [exportData.data];
      }

      // Validate each layout
      const validatedLayouts = layouts.map(layout => this.validateLayout(layout));
      const validLayouts = validatedLayouts.filter(result => result.layout);

      if (validLayouts.length === 0) {
        return {
          success: false,
          message: 'No valid layouts found in import data',
          errors: validatedLayouts.map(r => r.error).filter((error): error is string => !!error)
        };
      }

      return {
        success: true,
        message: `Successfully imported ${validLayouts.length} layout(s)`,
        data: validLayouts.map(r => r.layout),
        warnings: validatedLayouts.map(r => r.warning).filter((warning): warning is string => !!warning)
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to parse import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Import widget from JSON
   */
  importWidget(jsonData: string): ImportResult {
    try {
      const exportData: ExportData = JSON.parse(jsonData);
      const validationResult = this.validateImportData(exportData, 'widget');
      
      if (!validationResult.success) {
        return validationResult;
      }

      // Handle different data formats
      let widgets: WidgetConfig[];
      if (Array.isArray(exportData.data)) {
        widgets = exportData.data;
      } else {
        widgets = [exportData.data];
      }

      // Validate each widget
      const validatedWidgets = widgets.map(widget => this.validateWidget(widget));
      const validWidgets = validatedWidgets.filter(result => result.widget);

      if (validWidgets.length === 0) {
        return {
          success: false,
          message: 'No valid widgets found in import data',
          errors: validatedWidgets.map(r => r.error).filter((error): error is string => !!error)
        };
      }

      return {
        success: true,
        message: `Successfully imported ${validWidgets.length} widget(s)`,
        data: validWidgets.map(r => r.widget),
        warnings: validatedWidgets.map(r => r.warning).filter((warning): warning is string => !!warning)
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to parse import data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Restore from full backup
   */
  restoreFromBackup(jsonData: string): ImportResult {
    try {
      const exportData: ExportData = JSON.parse(jsonData);
      const validationResult = this.validateImportData(exportData, 'full-backup');
      
      if (!validationResult.success) {
        return validationResult;
      }

      const backupData = exportData.data;
      const warnings: string[] = [];
      const errors: string[] = [];

      // Restore layouts
      if (backupData.layouts) {
        try {
          const layoutResult = this.importLayout(JSON.stringify({
            ...exportData,
            type: 'layout',
            data: backupData.layouts
          }));
          if (layoutResult.warnings) warnings.push(...layoutResult.warnings);
          if (layoutResult.errors) errors.push(...layoutResult.errors);
        } catch (error) {
          errors.push(`Failed to restore layouts: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Restore widgets
      if (backupData.widgets) {
        try {
          const widgetResult = this.importWidget(JSON.stringify({
            ...exportData,
            type: 'widget',
            data: backupData.widgets
          }));
          if (widgetResult.warnings) warnings.push(...widgetResult.warnings);
          if (widgetResult.errors) errors.push(...widgetResult.errors);
        } catch (error) {
          errors.push(`Failed to restore widgets: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Restore settings
      if (backupData.settings) {
        try {
          this.restoreSettings(backupData.settings);
        } catch (error) {
          errors.push(`Failed to restore settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        message: errors.length === 0 
          ? 'Successfully restored from backup' 
          : `Backup restored with ${errors.length} error(s)`,
        warnings,
        errors
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to restore from backup: ${error instanceof Error ? error.message : 'Unknown error'}`,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Download data as file
   */
  downloadAsFile(data: string, filename: string, mimeType: string = 'application/json'): void {
    try {
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      throw new Error('Failed to download file');
    }
  }

  /**
   * Read file content
   */
  readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          resolve(content);
        } else {
          reject(new Error('Failed to read file content'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Generate filename with timestamp
   */
  generateFilename(prefix: string, extension: string = 'json'): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}_${timestamp}.${extension}`;
  }

  private validateImportData(data: ExportData, expectedType: string): ImportResult {
    if (!data.version || !data.type || !data.data) {
      return {
        success: false,
        message: 'Invalid import data format',
        errors: ['Missing required fields: version, type, or data']
      };
    }

    if (data.type !== expectedType) {
      return {
        success: false,
        message: `Invalid data type: expected ${expectedType}, got ${data.type}`,
        errors: [`Data type mismatch: expected ${expectedType}, got ${data.type}`]
      };
    }

    if (!this.isVersionCompatible(data.version)) {
      return {
        success: false,
        message: `Incompatible version: ${data.version}`,
        errors: [`Version ${data.version} is not compatible with current version ${this.currentVersion}`]
      };
    }

    return { success: true, message: 'Valid import data' };
  }

  private validateLayout(layout: any): { layout?: DashboardLayout; error?: string; warning?: string } {
    try {
      if (!layout.id || !layout.metadata || !Array.isArray(layout.widgets)) {
        return { error: 'Invalid layout structure' };
      }

      // Validate widgets
      const validWidgets = layout.widgets.filter((widget: any) => {
        const result = this.validateWidget(widget);
        return result.widget;
      });

      if (validWidgets.length !== layout.widgets.length) {
        return {
          layout: { ...layout, widgets: validWidgets },
          warning: `${layout.widgets.length - validWidgets.length} invalid widgets were removed`
        };
      }

      return { layout };
    } catch (error) {
      return { error: `Layout validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  private validateWidget(widget: any): { widget?: WidgetConfig; error?: string; warning?: string } {
    try {
      if (!widget.id || !widget.type || !widget.position || !widget.size) {
        return { error: 'Invalid widget structure' };
      }

      // Validate position and size
      if (typeof widget.position.x !== 'number' || typeof widget.position.y !== 'number') {
        return { error: 'Invalid widget position' };
      }

      if (typeof widget.size.w !== 'number' || typeof widget.size.h !== 'number') {
        return { error: 'Invalid widget size' };
      }

      // Generate new ID to avoid conflicts
      const validatedWidget = {
        ...widget,
        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        modified: Date.now()
      };

      return { widget: validatedWidget };
    } catch (error) {
      return { error: `Widget validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  private isVersionCompatible(version: string): boolean {
    // Simple version compatibility check
    const [major] = version.split('.').map(Number);
    const [currentMajor] = this.currentVersion.split('.').map(Number);
    
    return major === currentMajor;
  }

  private getPlatformInfo(): string {
    return `${navigator.platform} ${navigator.userAgent}`;
  }

  private getStoredLayouts(): DashboardLayout[] {
    try {
      const stored = localStorage.getItem('sensecanvas-layout');
      if (stored) {
        const data = JSON.parse(stored);
        return data.savedLayouts || [];
      }
    } catch (error) {
      console.warn('Failed to get stored layouts:', error);
    }
    return [];
  }

  private getStoredWidgets(): WidgetConfig[] {
    try {
      const stored = localStorage.getItem('sensecanvas-widgets');
      if (stored) {
        const data = JSON.parse(stored);
        return data.widgets || [];
      }
    } catch (error) {
      console.warn('Failed to get stored widgets:', error);
    }
    return [];
  }

  private getStoredSettings(): Record<string, any> {
    try {
      const settings: Record<string, any> = {};
      
      // Collect all SenseCanvas-related settings
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('sensecanvas-')) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              settings[key] = JSON.parse(value);
            } catch {
              settings[key] = value;
            }
          }
        }
      }
      
      return settings;
    } catch (error) {
      console.warn('Failed to get stored settings:', error);
      return {};
    }
  }

  private getStoredSensorData(): SensorData | null {
    try {
      const stored = localStorage.getItem('sensecanvas-sensor-data');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to get stored sensor data:', error);
    }
    return null;
  }

  private restoreSettings(settings: Record<string, any>): void {
    Object.entries(settings).forEach(([key, value]) => {
      try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);
      } catch (error) {
        console.warn(`Failed to restore setting ${key}:`, error);
      }
    });
  }
}

// Export singleton instance
export const storageService = new StorageService();
export default storageService;