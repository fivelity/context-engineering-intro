/**
 * SenseCanvas Configuration Export API Route
 * Handles exporting dashboard configurations and widgets with metadata.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

// Export request validation schema
const ExportConfigRequestSchema = z.object({
  type: z.enum(['widget', 'layout', 'dashboard']),
  data: z.record(z.any()),
  metadata: z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    author: z.string().max(50).optional(),
    tags: z.array(z.string()).optional().default([]),
    version: z.string().optional().default('1.0.0'),
    created_at: z.number().optional()
  }).optional().default({})
});

type ExportConfigRequest = z.infer<typeof ExportConfigRequestSchema>;

// Export response format
interface ExportConfigResponse {
  success: boolean;
  export_data: {
    format_version: string;
    export_type: string;
    timestamp: number;
    metadata: {
      name: string;
      description?: string;
      author?: string;
      tags: string[];
      version: string;
      created_at: number;
      exported_at: number;
      sensecanvas_version: string;
    };
    configuration: any;
    checksum: string;
  };
  download_filename: string;
}

// Generate checksum for data integrity
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

// Validate widget configuration
function validateWidgetConfig(config: any): boolean {
  const requiredFields = ['id', 'type', 'title', 'sensorType', 'position', 'size', 'style'];
  return requiredFields.every(field => field in config);
}

// Validate layout configuration
function validateLayoutConfig(config: any): boolean {
  return (
    config &&
    typeof config.name === 'string' &&
    Array.isArray(config.widgets) &&
    config.widgets.every(validateWidgetConfig)
  );
}

// Validate dashboard configuration
function validateDashboardConfig(config: any): boolean {
  return (
    config &&
    typeof config.name === 'string' &&
    Array.isArray(config.layouts) &&
    config.layouts.every(validateLayoutConfig)
  );
}

// Sanitize configuration data
function sanitizeConfig(config: any, type: string): any {
  const sanitized = JSON.parse(JSON.stringify(config));
  
  // Remove sensitive or runtime-only fields
  const sensitiveFields = ['id', 'createdAt', 'updatedAt'];
  
  function removeSensitiveFields(obj: any): any {
    if (Array.isArray(obj)) {
      return obj.map(removeSensitiveFields);
    } else if (obj && typeof obj === 'object') {
      const cleaned = { ...obj };
      sensitiveFields.forEach(field => {
        if (field in cleaned) {
          delete cleaned[field];
        }
      });
      
      // Recursively clean nested objects
      Object.keys(cleaned).forEach(key => {
        if (typeof cleaned[key] === 'object') {
          cleaned[key] = removeSensitiveFields(cleaned[key]);
        }
      });
      
      return cleaned;
    }
    return obj;
  }
  
  if (type === 'widget') {
    // For single widget, keep structure but remove sensitive fields
    return removeSensitiveFields(sanitized);
  } else if (type === 'layout') {
    // For layout, clean all widgets
    if (sanitized.widgets) {
      sanitized.widgets = sanitized.widgets.map(removeSensitiveFields);
    }
    return sanitized;
  } else if (type === 'dashboard') {
    // For dashboard, clean all layouts and widgets
    if (sanitized.layouts) {
      sanitized.layouts = sanitized.layouts.map((layout: any) => {
        if (layout.widgets) {
          layout.widgets = layout.widgets.map(removeSensitiveFields);
        }
        return layout;
      });
    }
    return sanitized;
  }
  
  return sanitized;
}

// Generate filename for download
function generateFilename(type: string, name: string): string {
  const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
  const timestamp = new Date().toISOString().split('T')[0];
  return `sensecanvas_${type}_${sanitizedName}_${timestamp}.json`;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse and validate request
    const body = await request.json();
    const validatedRequest = ExportConfigRequestSchema.parse(body);
    
    const { type, data, metadata } = validatedRequest;
    
    // Validate configuration data based on type
    let isValid = false;
    switch (type) {
      case 'widget':
        isValid = validateWidgetConfig(data);
        break;
      case 'layout':
        isValid = validateLayoutConfig(data);
        break;
      case 'dashboard':
        isValid = validateDashboardConfig(data);
        break;
    }
    
    if (!isValid) {
      return error(400, {
        message: `Invalid ${type} configuration`,
        details: `The provided ${type} configuration does not meet the required structure.`
      });
    }
    
    // Sanitize configuration data
    const sanitizedConfig = sanitizeConfig(data, type);
    
    // Prepare export metadata
    const exportMetadata = {
      name: metadata.name || `Exported ${type}`,
      description: metadata.description,
      author: metadata.author,
      tags: metadata.tags || [],
      version: metadata.version || '1.0.0',
      created_at: metadata.created_at || Date.now(),
      exported_at: Date.now(),
      sensecanvas_version: '1.0.0'
    };
    
    // Create export data structure
    const exportData = {
      format_version: '1.0.0',
      export_type: type,
      timestamp: Date.now(),
      metadata: exportMetadata,
      configuration: sanitizedConfig,
      checksum: generateChecksum(sanitizedConfig)
    };
    
    // Generate download filename
    const filename = generateFilename(type, exportMetadata.name);
    
    console.log(`Configuration exported: ${type} - ${exportMetadata.name}`);
    
    const response: ExportConfigResponse = {
      success: true,
      export_data: exportData,
      download_filename: filename
    };
    
    return json(response);
    
  } catch (err) {
    console.error('Configuration export error:', err);
    
    if (err instanceof z.ZodError) {
      return error(400, {
        message: 'Invalid export request format',
        errors: err.errors
      });
    }
    
    if (err instanceof Error) {
      return error(500, {
        message: 'Export failed',
        details: err.message
      });
    }
    
    return error(500, {
      message: 'Internal server error'
    });
  }
};

export const GET: RequestHandler = async ({ url }) => {
  // Get export templates and formats
  const templates = [
    {
      id: 'widget_template',
      name: 'Widget Template',
      description: 'Basic widget configuration template',
      type: 'widget',
      example: {
        type: 'gauge',
        title: 'CPU Usage',
        sensorType: 'cpu',
        position: { x: 100, y: 100 },
        size: { width: 200, height: 200 },
        style: {
          theme: 'default',
          colors: ['#22d3ee', '#ef4444'],
          borderRadius: 8
        },
        alerts: {
          enabled: true,
          thresholds: { warning: 75, critical: 90 }
        }
      }
    },
    {
      id: 'layout_template',
      name: 'Layout Template',
      description: 'Basic layout configuration template',
      type: 'layout',
      example: {
        name: 'System Overview',
        description: 'Basic system monitoring layout',
        theme: 'default',
        widgets: []
      }
    },
    {
      id: 'dashboard_template',
      name: 'Dashboard Template',
      description: 'Complete dashboard configuration template',
      type: 'dashboard',
      example: {
        name: 'My Dashboard',
        description: 'Custom dashboard configuration',
        layouts: [],
        settings: {
          theme: 'default',
          autoSave: true,
          polling_interval: 1000
        }
      }
    }
  ];
  
  return json({
    supported_formats: ['json'],
    supported_types: ['widget', 'layout', 'dashboard'],
    format_version: '1.0.0',
    templates,
    export_guidelines: [
      'Exported configurations include metadata for compatibility checking',
      'Widget IDs and timestamps are automatically sanitized',
      'Configurations can be shared between SenseCanvas instances',
      'Always verify imported configurations before applying',
      'Use descriptive names and tags for better organization'
    ]
  });
};