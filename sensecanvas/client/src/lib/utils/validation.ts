/**
 * SenseCanvas Validation Utilities
 * Client-side validation helpers and error formatting
 */

import { z } from 'zod';
import type { WidgetConfig, DashboardLayout } from '../types/widgets.js';
import { WidgetConfigSchema, DashboardLayoutSchema } from '../types/widgets.js';

export interface ValidationResult<T = any> {
  valid: boolean;
  data?: T;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

/**
 * Validate widget configuration
 */
export function validateWidgetConfig(config: unknown): ValidationResult<WidgetConfig> {
  try {
    const result = WidgetConfigSchema.safeParse(config);
    
    if (result.success) {
      return { valid: true, data: result.data };
    }
    
    const errors: ValidationError[] = result.error.issues.map((issue: z.ZodIssue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
      severity: 'error' as const
    }));
    
    return { valid: false, errors };
  } catch (error) {
    return {
      valid: false,
      errors: [{
        field: 'unknown',
        message: 'Validation failed',
        code: 'UNKNOWN_ERROR',
        severity: 'error'
      }]
    };
  }
}

/**
 * Validate dashboard layout
 */
export function validateDashboardLayout(layout: unknown): ValidationResult<DashboardLayout> {
  try {
    const result = DashboardLayoutSchema.safeParse(layout);
    
    if (result.success) {
      return { valid: true, data: result.data };
    }
    
    const errors: ValidationError[] = result.error.issues.map((issue: z.ZodIssue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
      severity: 'error' as const
    }));
    
    return { valid: false, errors };
  } catch (error) {
    return {
      valid: false,
      errors: [{
        field: 'unknown',
        message: 'Validation failed',
        code: 'UNKNOWN_ERROR',
        severity: 'error'
      }]
    };
  }
}

/**
 * Validate email address
 */
export function validateEmail(email: string): boolean {
  const schema = z.string().email();
  return schema.safeParse(email).success;
}

/**
 * Validate URL
 */
export function validateUrl(url: string): boolean {
  const schema = z.string().url();
  return schema.safeParse(url).success;
}

/**
 * Validate hex color
 */
export function validateHexColor(color: string): boolean {
  const schema = z.string().regex(/^#[0-9A-Fa-f]{6}$/);
  return schema.safeParse(color).success;
}

/**
 * Validate number range
 */
export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate string length
 */
export function validateLength(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors
    .map(error => `${error.field}: ${error.message}`)
    .join('\n');
}

/**
 * Group validation errors by field
 */
export function groupErrorsByField(errors: ValidationError[]): Record<string, ValidationError[]> {
  return errors.reduce((acc, error) => {
    if (!acc[error.field]) {
      acc[error.field] = [];
    }
    acc[error.field].push(error);
    return acc;
  }, {} as Record<string, ValidationError[]>);
}

/**
 * Check if a value is a valid JSON string
 */
export function isValidJson(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate widget position within bounds
 */
export function validateWidgetPosition(
  widget: { position: { x: number; y: number }; size: { width: number; height: number } },
  bounds: { width: number; height: number }
): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (widget.position.x < 0) {
    errors.push({
      field: 'position.x',
      message: 'X position cannot be negative',
      code: 'NEGATIVE_POSITION',
      severity: 'error'
    });
  }
  
  if (widget.position.y < 0) {
    errors.push({
      field: 'position.y',
      message: 'Y position cannot be negative',
      code: 'NEGATIVE_POSITION',
      severity: 'error'
    });
  }
  
  if (widget.position.x + widget.size.width > bounds.width) {
    errors.push({
      field: 'position.x',
      message: 'Widget extends beyond right boundary',
      code: 'OUT_OF_BOUNDS',
      severity: 'warning'
    });
  }
  
  if (widget.position.y + widget.size.height > bounds.height) {
    errors.push({
      field: 'position.y',
      message: 'Widget extends beyond bottom boundary',
      code: 'OUT_OF_BOUNDS',
      severity: 'warning'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Validate widget size constraints
 */
export function validateWidgetSize(
  size: { width: number; height: number },
  constraints: { minWidth: number; minHeight: number; maxWidth: number; maxHeight: number }
): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (size.width < constraints.minWidth) {
    errors.push({
      field: 'size.width',
      message: `Width must be at least ${constraints.minWidth}px`,
      code: 'TOO_SMALL',
      severity: 'error'
    });
  }
  
  if (size.height < constraints.minHeight) {
    errors.push({
      field: 'size.height',
      message: `Height must be at least ${constraints.minHeight}px`,
      code: 'TOO_SMALL',
      severity: 'error'
    });
  }
  
  if (size.width > constraints.maxWidth) {
    errors.push({
      field: 'size.width',
      message: `Width cannot exceed ${constraints.maxWidth}px`,
      code: 'TOO_LARGE',
      severity: 'error'
    });
  }
  
  if (size.height > constraints.maxHeight) {
    errors.push({
      field: 'size.height',
      message: `Height cannot exceed ${constraints.maxHeight}px`,
      code: 'TOO_LARGE',
      severity: 'error'
    });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

/**
 * Create a debounced validator
 */
export function createDebouncedValidator<T>(
  validator: (value: T) => ValidationResult<T>,
  delay: number = 300
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (value: T): Promise<ValidationResult<T>> => {
    return new Promise((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      
      timeoutId = setTimeout(() => {
        resolve(validator(value));
      }, delay);
    });
  };
}

/**
 * Compose multiple validators
 */
export function composeValidators<T>(
  ...validators: Array<(value: T) => ValidationResult<T>>
): (value: T) => ValidationResult<T> {
  return (value: T) => {
    const allErrors: ValidationError[] = [];
    let valid = true;
    
    for (const validator of validators) {
      const result = validator(value);
      if (!result.valid) {
        valid = false;
        if (result.errors) {
          allErrors.push(...result.errors);
        }
      }
    }
    
    return {
      valid,
      data: valid ? value : undefined,
      errors: allErrors.length > 0 ? allErrors : undefined
    };
  };
}