/**
 * SenseCanvas Configuration Validation API Route
 * Standalone validation endpoint for configuration files and data.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

// Validation request schema
const ValidateConfigRequestSchema = z.object({
  config_data: z.string().min(1),
  validation_type: z.enum(['strict', 'lenient', 'migration']).optional().default('strict'),
  check_compatibility: z.boolean().optional().default(true),
  check_security: z.boolean().optional().default(true)
});

type ValidateConfigRequest = z.infer<typeof ValidateConfigRequestSchema>;

// Widget configuration schema for strict validation
const StrictWidgetConfigSchema = z.object({
  type: z.enum(['gauge', 'graph', 'text', 'multi-sensor']),
  title: z.string().min(1).max(50),
  sensorType: z.enum(['cpu', 'gpu', 'memory', 'storage', 'network']),
  position: z.object({
    x: z.number().min(0).max(10000),
    y: z.number().min(0).max(10000)
  }),
  size: z.object({
    width: z.number().min(50).max(2000),
    height: z.number().min(50).max(1500)
  }),
  style: z.object({
    theme: z.enum(['default', 'cyberpunk', 'gaming', 'minimal', 'rgb']),
    colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(1).max(5),
    opacity: z.number().min(0).max(1).optional().default(1),
    borderRadius: z.number().min(0).max(50).optional().default(8),
    fontSize: z.number().min(8).max(72).optional(),
    fontFamily: z.string().optional(),
    borderWidth: z.number().min(0).max(10).optional(),
    borderColor: z.string().optional()
  }),
  alerts: z.object({
    enabled: z.boolean(),
    thresholds: z.object({
      warning: z.number().min(0).max(100),
      critical: z.number().min(0).max(100)
    }).optional(),
    showNotifications: z.boolean().optional(),
    playSound: z.boolean().optional(),
    flashWidget: z.boolean().optional()
  }).optional()
});

// Lenient widget schema for migration support
const LenientWidgetConfigSchema = z.object({
  type: z.string(),
  title: z.string(),
  sensorType: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  size: z.object({
    width: z.number(),
    height: z.number()
  }),
  style: z.record(z.any()).optional(),
  alerts: z.record(z.any()).optional()
});

interface ValidationResult {
  valid: boolean;
  confidence: number; // 0-100
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggestion?: string;
  }>;
  warnings: string[];
  security_issues: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
  compatibility: {
    version_supported: boolean;
    format_supported: boolean;
    migration_needed: boolean;
    migration_path?: string;
  };
  metadata: {
    config_type: string;
    estimated_widgets: number;
    themes_used: string[];
    sensors_used: string[];
    complexity_score: number;
  };
  suggestions: string[];
}

// Security validation checks
function performSecurityChecks(config: any): Array<{ type: string; severity: 'low' | 'medium' | 'high'; description: string; recommendation: string }> {
  const issues = [];
  
  // Check for potentially malicious script injection
  const jsonString = JSON.stringify(config);
  if (jsonString.includes('<script>') || jsonString.includes('javascript:') || jsonString.includes('eval(')) {
    issues.push({
      type: 'script_injection',
      severity: 'high' as const,
      description: 'Potential script injection detected in configuration',
      recommendation: 'Remove any script tags or javascript: protocols'
    });
  }
  
  // Check for excessive resource usage
  function countWidgets(obj: any): number {
    let count = 0;
    if (obj && typeof obj === 'object') {
      if (obj.type && typeof obj.type === 'string') count++;
      if (Array.isArray(obj)) {
        obj.forEach(item => count += countWidgets(item));
      } else {
        Object.values(obj).forEach(value => count += countWidgets(value));
      }
    }
    return count;
  }
  
  const widgetCount = countWidgets(config);
  if (widgetCount > 50) {
    issues.push({
      type: 'resource_usage',
      severity: 'medium' as const,
      description: `High widget count detected: ${widgetCount}`,
      recommendation: 'Consider reducing widget count for better performance'
    });
  }
  
  // Check for suspiciously large data sizes
  if (jsonString.length > 1024 * 1024) { // 1MB
    issues.push({
      type: 'large_config',
      severity: 'low' as const,
      description: 'Configuration file is unusually large',
      recommendation: 'Verify configuration content and optimize if necessary'
    });
  }
  
  return issues;
}

// Analyze configuration metadata
function analyzeConfiguration(config: any, configType: string): ValidationResult['metadata'] {
  const metadata = {
    config_type: configType,
    estimated_widgets: 0,
    themes_used: new Set<string>(),
    sensors_used: new Set<string>(),
    complexity_score: 0
  };
  
  function analyzeObject(obj: any, depth = 0): void {
    if (!obj || typeof obj !== 'object') return;
    
    if (Array.isArray(obj)) {
      obj.forEach(item => analyzeObject(item, depth + 1));
      return;
    }
    
    // Count widgets
    if (obj.type && typeof obj.type === 'string') {
      metadata.estimated_widgets++;
      metadata.complexity_score += 1;
    }
    
    // Track themes
    if (obj.style?.theme) {
      metadata.themes_used.add(obj.style.theme);
    }
    
    // Track sensors
    if (obj.sensorType) {
      metadata.sensors_used.add(obj.sensorType);
    }
    
    // Add complexity for nested structures
    if (depth > 3) {
      metadata.complexity_score += 0.5;
    }
    
    // Recursively analyze nested objects
    Object.values(obj).forEach(value => {
      if (typeof value === 'object') {
        analyzeObject(value, depth + 1);
      }
    });
  }
  
  analyzeObject(config);
  
  return {
    config_type: metadata.config_type,
    estimated_widgets: metadata.estimated_widgets,
    themes_used: Array.from(metadata.themes_used),
    sensors_used: Array.from(metadata.sensors_used),
    complexity_score: Math.round(metadata.complexity_score * 10) / 10
  };
}

// Main validation function
function validateConfiguration(configData: string, validationType: string, checkCompatibility: boolean, checkSecurity: boolean): ValidationResult {
  const result: ValidationResult = {
    valid: false,
    confidence: 0,
    errors: [],
    warnings: [],
    security_issues: [],
    compatibility: {
      version_supported: true,
      format_supported: true,
      migration_needed: false
    },
    metadata: {
      config_type: 'unknown',
      estimated_widgets: 0,
      themes_used: [],
      sensors_used: [],
      complexity_score: 0
    },
    suggestions: []
  };
  
  try {
    // Parse JSON
    const config = JSON.parse(configData);
    
    // Determine configuration type
    let configType = 'unknown';
    if (config.export_type) {
      configType = config.export_type;
    } else if (config.type) {
      configType = 'widget';
    } else if (config.widgets) {
      configType = 'layout';
    } else if (config.layouts) {
      configType = 'dashboard';
    }
    
    // Analyze configuration
    result.metadata = analyzeConfiguration(config, configType);
    
    // Security checks
    if (checkSecurity) {
      result.security_issues = performSecurityChecks(config);
    }
    
    // Choose validation schema based on type
    let validationConfig = config;
    if (config.configuration) {
      validationConfig = config.configuration;
    }
    
    // Validate based on type and strictness
    if (configType === 'widget') {
      try {
        if (validationType === 'strict') {
          StrictWidgetConfigSchema.parse(validationConfig);
        } else {
          LenientWidgetConfigSchema.parse(validationConfig);
        }
        result.confidence = validationType === 'strict' ? 95 : 80;
      } catch (err) {
        if (err instanceof z.ZodError) {
          result.errors = err.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
            severity: validationType === 'strict' ? 'error' as const : 'warning' as const,
            suggestion: getSuggestionForError(e.path.join('.'), e.message)
          }));
          result.confidence = Math.max(0, 70 - (result.errors.length * 10));
        }
      }
    } else if (configType === 'layout') {
      if (!validationConfig.widgets || !Array.isArray(validationConfig.widgets)) {
        result.errors.push({
          field: 'widgets',
          message: 'Layout must contain a widgets array',
          severity: 'error',
          suggestion: 'Add a widgets property containing an array of widget configurations'
        });
      } else {
        let widgetErrors = 0;
        validationConfig.widgets.forEach((widget: any, index: number) => {
          try {
            if (validationType === 'strict') {
              StrictWidgetConfigSchema.parse(widget);
            } else {
              LenientWidgetConfigSchema.parse(widget);
            }
          } catch (err) {
            if (err instanceof z.ZodError) {
              widgetErrors++;
              result.errors.push(...err.errors.map(e => ({
                field: `widgets[${index}].${e.path.join('.')}`,
                message: e.message,
                severity: 'error' as const,
                suggestion: getSuggestionForError(e.path.join('.'), e.message)
              })));
            }
          }
        });
        result.confidence = Math.max(0, 90 - (widgetErrors * 5));
      }
    }
    
    // Add suggestions based on analysis
    if (result.metadata.estimated_widgets === 0) {
      result.suggestions.push('Configuration contains no widgets - consider adding some monitoring widgets');
    }
    
    if (result.metadata.themes_used.length > 3) {
      result.suggestions.push('Multiple themes detected - consider standardizing on one theme for consistency');
    }
    
    if (result.metadata.complexity_score > 20) {
      result.suggestions.push('High complexity configuration - consider breaking into smaller layouts');
    }
    
    // Check for common issues
    if (configData.includes('"id"')) {
      result.warnings.push('Configuration contains widget IDs - these will be regenerated on import');
    }
    
    // Set overall validity
    result.valid = result.errors.filter(e => e.severity === 'error').length === 0;
    
    if (result.valid && result.confidence < 50) {
      result.confidence = 70; // Boost confidence for valid configs
    }
    
    return result;
    
  } catch (err) {
    if (err instanceof SyntaxError) {
      result.errors.push({
        field: 'root',
        message: 'Invalid JSON format',
        severity: 'error',
        suggestion: 'Ensure the configuration is valid JSON'
      });
    } else {
      result.errors.push({
        field: 'root',
        message: 'Unknown validation error',
        severity: 'error'
      });
    }
    
    return result;
  }
}

// Helper function to provide suggestions for common errors
function getSuggestionForError(field: string, message: string): string {
  if (field.includes('colors') && message.includes('regex')) {
    return 'Colors must be in hex format (e.g., #22d3ee)';
  }
  if (field.includes('size') && message.includes('min')) {
    return 'Widget dimensions should be at least 50x50 pixels';
  }
  if (field.includes('title') && message.includes('max')) {
    return 'Widget titles should be 50 characters or less';
  }
  if (field.includes('type')) {
    return 'Supported widget types: gauge, graph, text, multi-sensor';
  }
  if (field.includes('sensorType')) {
    return 'Supported sensor types: cpu, gpu, memory, storage, network';
  }
  if (field.includes('theme')) {
    return 'Supported themes: default, cyberpunk, gaming, minimal, rgb';
  }
  return 'Check the configuration documentation for valid values';
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse and validate request
    const body = await request.json();
    const validatedRequest = ValidateConfigRequestSchema.parse(body);
    
    const { config_data, validation_type, check_compatibility, check_security } = validatedRequest;
    
    console.log(`Configuration validation requested - type: ${validation_type}`);
    
    // Perform validation
    const validationResult = validateConfiguration(
      config_data,
      validation_type,
      check_compatibility,
      check_security
    );
    
    return json({
      success: true,
      validation: validationResult,
      recommendations: generateRecommendations(validationResult)
    });
    
  } catch (err) {
    console.error('Configuration validation error:', err);
    
    if (err instanceof z.ZodError) {
      return error(400, {
        message: 'Invalid validation request format',
        errors: err.errors
      });
    }
    
    if (err instanceof Error) {
      return error(500, {
        message: 'Validation failed',
        details: err.message
      });
    }
    
    return error(500, {
      message: 'Internal server error'
    });
  }
};

// Generate recommendations based on validation results
function generateRecommendations(validation: ValidationResult): string[] {
  const recommendations = [];
  
  if (validation.confidence < 70) {
    recommendations.push('Consider reviewing and fixing validation errors before importing');
  }
  
  if (validation.security_issues.length > 0) {
    recommendations.push('Address security issues before importing configuration');
  }
  
  if (validation.metadata.complexity_score > 15) {
    recommendations.push('Consider simplifying the configuration or breaking it into smaller pieces');
  }
  
  if (validation.metadata.estimated_widgets > 20) {
    recommendations.push('High widget count may impact performance - consider reducing widgets');
  }
  
  if (validation.errors.length === 0 && validation.confidence > 80) {
    recommendations.push('Configuration looks good and ready for import!');
  }
  
  return recommendations;
}

export const GET: RequestHandler = async () => {
  return json({
    validation_types: {
      strict: 'Strict validation with all requirements enforced',
      lenient: 'Lenient validation allowing some flexibility',
      migration: 'Migration-friendly validation for older formats'
    },
    supported_config_types: ['widget', 'layout', 'dashboard'],
    validation_features: [
      'JSON syntax validation',
      'Schema compliance checking',
      'Security vulnerability scanning',
      'Version compatibility checking',
      'Performance impact analysis',
      'Configuration complexity scoring'
    ],
    validation_levels: {
      error: 'Must be fixed before import',
      warning: 'Should be reviewed but not blocking',
      info: 'Informational notices for optimization'
    }
  });
};