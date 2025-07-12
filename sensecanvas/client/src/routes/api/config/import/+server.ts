/**
 * SenseCanvas Configuration Import API Route
 * Handles importing dashboard configurations with validation and compatibility checking.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

// Import request validation schema
const ImportConfigRequestSchema = z.object({
  config_data: z.string().min(1), // JSON string of the configuration
  options: z.object({
    validate_only: z.boolean().optional().default(false),
    merge_mode: z.enum(['replace', 'merge', 'append']).optional().default('replace'),
    generate_new_ids: z.boolean().optional().default(true),
    update_timestamps: z.boolean().optional().default(true),
    compatibility_check: z.boolean().optional().default(true)
  }).optional().default({})
});

type ImportConfigRequest = z.infer<typeof ImportConfigRequestSchema>;

// Expected import format schema
const ImportedConfigSchema = z.object({
  format_version: z.string(),
  export_type: z.enum(['widget', 'layout', 'dashboard']),
  timestamp: z.number(),
  metadata: z.object({
    name: z.string(),
    description: z.string().optional(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    version: z.string(),
    created_at: z.number(),
    exported_at: z.number(),
    sensecanvas_version: z.string()
  }),
  configuration: z.record(z.any()),
  checksum: z.string()
});

// Widget configuration schema for validation
const WidgetConfigSchema = z.object({
  type: z.enum(['gauge', 'graph', 'text', 'multi-sensor']),
  title: z.string().min(1).max(50),
  sensorType: z.enum(['cpu', 'gpu', 'memory', 'storage', 'network']),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0)
  }),
  size: z.object({
    width: z.number().min(100),
    height: z.number().min(100)
  }),
  style: z.object({
    theme: z.enum(['default', 'cyberpunk', 'gaming', 'minimal', 'rgb']),
    colors: z.array(z.string()),
    opacity: z.number().min(0).max(1).optional(),
    borderRadius: z.number().min(0).optional()
  }),
  alerts: z.object({
    enabled: z.boolean(),
    thresholds: z.object({
      warning: z.number().min(0).max(100),
      critical: z.number().min(0).max(100)
    }).optional()
  }).optional()
});

interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  compatibility: {
    format_supported: boolean;
    version_compatible: boolean;
    migration_needed: boolean;
    migration_notes: string[];
  };
  processed_config?: any;
}

// Generate checksum for data integrity validation
function generateChecksum(data: any): string {
  const jsonString = JSON.stringify(data, Object.keys(data).sort());
  let hash = 0;
  for (let i = 0; i < jsonString.length; i++) {
    const char = jsonString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

// Validate format version compatibility
function validateFormatVersion(version: string): { compatible: boolean; migration_needed: boolean; notes: string[] } {
  const currentVersion = '1.0.0';
  const supportedVersions = ['1.0.0'];
  
  if (supportedVersions.includes(version)) {
    return {
      compatible: true,
      migration_needed: false,
      notes: []
    };
  }
  
  // Handle version migration logic
  const migrationNotes = [];
  let migrationNeeded = false;
  
  if (version < '1.0.0') {
    migrationNeeded = true;
    migrationNotes.push('Legacy format detected - automatic migration will be applied');
    migrationNotes.push('Widget IDs will be regenerated');
    migrationNotes.push('Some styling properties may be updated to current format');
  }
  
  return {
    compatible: true, // We'll try to migrate
    migration_needed: migrationNeeded,
    notes: migrationNotes
  };
}

// Validate SenseCanvas version compatibility
function validateSenseCanvasVersion(version: string): boolean {
  const currentVersion = '1.0.0';
  const supportedVersions = ['1.0.0'];
  
  // Simple version check - in production, implement proper semver comparison
  return supportedVersions.includes(version) || version <= currentVersion;
}

// Validate widget configuration
function validateWidgetConfig(config: any): { valid: boolean; errors: string[] } {
  try {
    WidgetConfigSchema.parse(config);
    return { valid: true, errors: [] };
  } catch (err) {
    if (err instanceof z.ZodError) {
      return {
        valid: false,
        errors: err.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    return {
      valid: false,
      errors: ['Unknown validation error']
    };
  }
}

// Process and migrate configuration
function processConfiguration(config: any, type: string, options: any): any {
  const processed = JSON.parse(JSON.stringify(config));
  
  // Generate new IDs if requested
  if (options.generate_new_ids) {
    if (type === 'widget') {
      processed.id = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    } else if (type === 'layout' && processed.widgets) {
      processed.widgets.forEach((widget: any) => {
        widget.id = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      });
    } else if (type === 'dashboard' && processed.layouts) {
      processed.layouts.forEach((layout: any) => {
        if (layout.widgets) {
          layout.widgets.forEach((widget: any) => {
            widget.id = `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          });
        }
      });
    }
  }
  
  // Update timestamps if requested
  if (options.update_timestamps) {
    const now = Date.now();
    processed.updatedAt = now;
    
    if (type === 'layout' && processed.widgets) {
      processed.widgets.forEach((widget: any) => {
        widget.updatedAt = now;
      });
    } else if (type === 'dashboard' && processed.layouts) {
      processed.layouts.forEach((layout: any) => {
        if (layout.widgets) {
          layout.widgets.forEach((widget: any) => {
            widget.updatedAt = now;
          });
        }
      });
    }
  }
  
  // Add missing default properties
  if (type === 'widget') {
    processed.isSelected = false;
    processed.isResizing = false;
    processed.isDragging = false;
    processed.zIndex = 1;
    processed.version = processed.version || '1.0.0';
    processed.tags = processed.tags || [];
  }
  
  return processed;
}

// Main validation function
function validateImportedConfig(configData: string, options: any): ImportValidationResult {
  const result: ImportValidationResult = {
    valid: false,
    errors: [],
    warnings: [],
    compatibility: {
      format_supported: false,
      version_compatible: false,
      migration_needed: false,
      migration_notes: []
    }
  };
  
  try {
    // Parse JSON
    const importedData = JSON.parse(configData);
    
    // Validate against import schema
    const validatedImport = ImportedConfigSchema.parse(importedData);
    
    // Validate checksum
    const expectedChecksum = generateChecksum(validatedImport.configuration);
    if (expectedChecksum !== validatedImport.checksum) {
      result.warnings.push('Checksum mismatch detected - configuration may have been modified');
    }
    
    // Check format version compatibility
    const formatCheck = validateFormatVersion(validatedImport.format_version);
    result.compatibility.format_supported = formatCheck.compatible;
    result.compatibility.migration_needed = formatCheck.migration_needed;
    result.compatibility.migration_notes = formatCheck.notes;
    
    // Check SenseCanvas version compatibility
    result.compatibility.version_compatible = validateSenseCanvasVersion(
      validatedImport.metadata.sensecanvas_version
    );
    
    if (!result.compatibility.version_compatible) {
      result.errors.push(
        `Incompatible SenseCanvas version: ${validatedImport.metadata.sensecanvas_version}`
      );
      return result;
    }
    
    // Validate configuration based on type
    const { export_type, configuration } = validatedImport;
    
    if (export_type === 'widget') {
      const widgetValidation = validateWidgetConfig(configuration);
      if (!widgetValidation.valid) {
        result.errors.push(...widgetValidation.errors);
        return result;
      }
    } else if (export_type === 'layout') {
      if (!configuration.widgets || !Array.isArray(configuration.widgets)) {
        result.errors.push('Layout must contain a widgets array');
        return result;
      }
      
      for (const widget of configuration.widgets) {
        const widgetValidation = validateWidgetConfig(widget);
        if (!widgetValidation.valid) {
          result.errors.push(...widgetValidation.errors.map(e => `Widget: ${e}`));
        }
      }
    } else if (export_type === 'dashboard') {
      if (!configuration.layouts || !Array.isArray(configuration.layouts)) {
        result.errors.push('Dashboard must contain a layouts array');
        return result;
      }
      
      for (const layout of configuration.layouts) {
        if (!layout.widgets || !Array.isArray(layout.widgets)) {
          result.errors.push('Each layout must contain a widgets array');
          continue;
        }
        
        for (const widget of layout.widgets) {
          const widgetValidation = validateWidgetConfig(widget);
          if (!widgetValidation.valid) {
            result.errors.push(...widgetValidation.errors.map(e => `Layout widget: ${e}`));
          }
        }
      }
    }
    
    // If we made it here without errors, process the configuration
    if (result.errors.length === 0) {
      result.processed_config = processConfiguration(configuration, export_type, options);
      result.valid = true;
    }
    
    return result;
    
  } catch (err) {
    if (err instanceof SyntaxError) {
      result.errors.push('Invalid JSON format');
    } else if (err instanceof z.ZodError) {
      result.errors.push('Invalid configuration structure');
      result.errors.push(...err.errors.map(e => `${e.path.join('.')}: ${e.message}`));
    } else {
      result.errors.push('Unknown validation error');
    }
    
    return result;
  }
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse and validate request
    const body = await request.json();
    const validatedRequest = ImportConfigRequestSchema.parse(body);
    
    const { config_data, options } = validatedRequest;
    
    console.log(`Configuration import requested - validate_only: ${options.validate_only}`);
    
    // Validate the imported configuration
    const validation = validateImportedConfig(config_data, options);
    
    if (!validation.valid) {
      return error(400, {
        message: 'Configuration validation failed',
        errors: validation.errors,
        warnings: validation.warnings,
        compatibility: validation.compatibility
      });
    }
    
    // If validation only, return validation results
    if (options.validate_only) {
      return json({
        success: true,
        message: 'Configuration is valid',
        validation_result: {
          valid: validation.valid,
          warnings: validation.warnings,
          compatibility: validation.compatibility
        },
        preview: validation.processed_config
      });
    }
    
    // For actual import, return the processed configuration
    console.log(`Configuration imported successfully`);
    
    return json({
      success: true,
      message: 'Configuration imported successfully',
      imported_config: validation.processed_config,
      metadata: JSON.parse(config_data).metadata,
      validation_result: {
        valid: validation.valid,
        warnings: validation.warnings,
        compatibility: validation.compatibility
      }
    });
    
  } catch (err) {
    console.error('Configuration import error:', err);
    
    if (err instanceof z.ZodError) {
      return error(400, {
        message: 'Invalid import request format',
        errors: err.errors
      });
    }
    
    if (err instanceof Error) {
      return error(500, {
        message: 'Import failed',
        details: err.message
      });
    }
    
    return error(500, {
      message: 'Internal server error'
    });
  }
};

export const GET: RequestHandler = async () => {
  // Return import capabilities and supported formats
  return json({
    supported_formats: ['json'],
    supported_types: ['widget', 'layout', 'dashboard'],
    supported_versions: ['1.0.0'],
    current_version: '1.0.0',
    import_options: {
      validate_only: {
        description: 'Only validate configuration without importing',
        default: false
      },
      merge_mode: {
        description: 'How to handle conflicts with existing configurations',
        options: ['replace', 'merge', 'append'],
        default: 'replace'
      },
      generate_new_ids: {
        description: 'Generate new unique IDs for imported items',
        default: true
      },
      update_timestamps: {
        description: 'Update timestamps to current time',
        default: true
      },
      compatibility_check: {
        description: 'Perform version compatibility checking',
        default: true
      }
    },
    import_guidelines: [
      'Always validate configurations before importing',
      'Use generate_new_ids: true to avoid ID conflicts',
      'Check compatibility warnings for potential issues',
      'Backup existing configurations before importing',
      'Test imported widgets in a safe environment first'
    ]
  });
};