// SenseCanvas: AI Widget Generator Example
// Demonstrates Google Genkit integration for AI-powered widget and layout generation

import { genkit } from '@genkit/core';
import { defineSchema } from '@genkit/core/schema';
import { gemini15Pro } from '@genkit/vertexai';
import { z } from 'zod';

// Types for AI generation
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

// Schema for AI generation requests
const WidgetGenerationRequestSchema = defineSchema({
  name: 'WidgetGenerationRequest',
  schema: z.object({
    prompt: z.string().min(10).max(500),
    context: z.object({
      sensorType: z.enum(['cpu', 'gpu', 'memory', 'storage', 'network']).optional(),
      widgetType: z.enum(['gauge', 'graph', 'text', 'multi-sensor']).optional(),
      theme: z.enum(['default', 'cyberpunk', 'gaming', 'minimal', 'rgb']).optional(),
      style: z.string().optional(),
      existingWidgets: z.array(z.any()).optional(),
      screenSize: z.object({
        width: z.number(),
        height: z.number()
      }).optional(),
      userPreferences: z.record(z.any()).optional()
    }).optional()
  })
});

// AI Widget Generator Class
export class AiWidgetGenerator {
  private initialized = false;
  private rateLimiter = new Map<string, number>();
  private cache = new Map<string, AiGenerationResult>();
  private readonly cacheTimeout = 300000; // 5 minutes

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Initialize Genkit with Gemini Pro
      await genkit.initialize({
        models: [gemini15Pro],
        plugins: [],
        enableDevMode: process.env.NODE_ENV === 'development'
      });
      
      this.initialized = true;
      console.log('AI Widget Generator initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AI Widget Generator:', error);
      throw error;
    }
  }

  async generateWidget(
    prompt: string,
    context: AiGenerationContext = {}
  ): Promise<AiGenerationResult> {
    if (!this.initialized) {
      throw new Error('AI Widget Generator not initialized');
    }

    // Check rate limiting
    const clientId = context.userPreferences?.userId || 'anonymous';
    if (this.isRateLimited(clientId)) {
      return {
        success: false,
        error: 'Rate limit exceeded. Please wait before generating another widget.'
      };
    }

    // Check cache
    const cacheKey = this.getCacheKey(prompt, context);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached;
    }

    try {
      // Build comprehensive prompt with context
      const fullPrompt = this.buildWidgetPrompt(prompt, context);
      
      // Generate widget configuration using Genkit
      const result = await genkit.generate({
        model: gemini15Pro,
        prompt: fullPrompt,
        config: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 1000
        }
      });

      // Parse and validate the generated configuration
      const parsedConfig = this.parseWidgetConfig(result.text());
      
      // Validate against SenseCanvas schemas
      const validatedConfig = await this.validateAndEnhanceConfig(parsedConfig, context);

      const aiResult: AiGenerationResult = {
        success: true,
        config: validatedConfig,
        confidence: this.calculateConfidence(parsedConfig),
        suggestions: this.generateSuggestions(parsedConfig, context)
      };

      // Cache the result
      this.cache.set(cacheKey, { ...aiResult, timestamp: Date.now() });
      
      // Update rate limiting
      this.updateRateLimit(clientId);
      
      return aiResult;

    } catch (error) {
      console.error('Widget generation failed:', error);
      return {
        success: false,
        error: `Generation failed: ${error.message}`,
        confidence: 0
      };
    }
  }

  async generateLayout(
    prompt: string,
    context: AiGenerationContext = {}
  ): Promise<AiGenerationResult> {
    if (!this.initialized) {
      throw new Error('AI Widget Generator not initialized');
    }

    try {
      // Build layout-specific prompt
      const fullPrompt = this.buildLayoutPrompt(prompt, context);
      
      // Generate layout configurations
      const result = await genkit.generate({
        model: gemini15Pro,
        prompt: fullPrompt,
        config: {
          temperature: 0.8,
          topP: 0.95,
          maxOutputTokens: 1500
        }
      });

      // Parse layout suggestions
      const layouts = this.parseLayoutSuggestions(result.text());
      
      // Validate layouts
      const validatedLayouts = await Promise.all(
        layouts.map(layout => this.validateLayout(layout, context))
      );

      return {
        success: true,
        layouts: validatedLayouts,
        confidence: this.calculateLayoutConfidence(validatedLayouts),
        suggestions: this.generateLayoutSuggestions(validatedLayouts, context)
      };

    } catch (error) {
      console.error('Layout generation failed:', error);
      return {
        success: false,
        error: `Layout generation failed: ${error.message}`,
        confidence: 0
      };
    }
  }

  private buildWidgetPrompt(prompt: string, context: AiGenerationContext): string {
    const contextInfo = this.formatContext(context);
    
    return `
You are an expert UI designer creating hardware monitoring widgets for SenseCanvas, a futuristic PC monitoring dashboard.

User Request: "${prompt}"

Context:
${contextInfo}

Requirements:
1. Generate a complete widget configuration in JSON format
2. Use Cosmic UI styling for sci-fi aesthetics
3. Include LayerChart configuration for data visualization
4. Ensure the widget is visually appealing and functional
5. Follow SenseCanvas widget schema specifications

Widget Configuration Schema:
{
  "type": "gauge" | "graph" | "text" | "multi-sensor",
  "title": "string",
  "sensorType": "cpu" | "gpu" | "memory" | "storage" | "network",
  "size": { "width": number, "height": number },
  "style": {
    "theme": "default" | "cyberpunk" | "gaming" | "minimal" | "rgb",
    "colors": ["#hexcolor", ...],
    "opacity": number(0-1),
    "borderRadius": number,
    "gradientEnabled": boolean,
    "gradientDirection": "horizontal" | "vertical" | "radial"
  },
  "alerts": {
    "enabled": boolean,
    "thresholds": {
      "warning": number,
      "critical": number
    }
  },
  "gaugeConfig": {
    "minValue": number,
    "maxValue": number,
    "startAngle": number,
    "endAngle": number,
    "arcWidth": number,
    "showValue": boolean,
    "showLabel": boolean,
    "unit": string
  }
}

Generate a complete, valid widget configuration:
`;
  }

  private buildLayoutPrompt(prompt: string, context: AiGenerationContext): string {
    const contextInfo = this.formatContext(context);
    
    return `
You are an expert dashboard designer creating optimal layouts for SenseCanvas hardware monitoring dashboards.

User Request: "${prompt}"

Context:
${contextInfo}

Requirements:
1. Generate 3-5 different layout suggestions
2. Consider widget relationships and grouping
3. Optimize for visual hierarchy and user workflow
4. Use grid-based positioning with snap alignment
5. Ensure responsive design principles

Layout Schema:
{
  "name": "string",
  "description": "string",
  "widgets": [
    {
      "id": "string",
      "position": { "x": number, "y": number },
      "size": { "width": number, "height": number },
      "zIndex": number
    }
  ],
  "gridSize": {
    "cols": number,
    "rows": number,
    "cellSize": number
  },
  "theme": "default" | "cyberpunk" | "gaming" | "minimal" | "rgb"
}

Generate multiple layout options:
`;
  }

  private formatContext(context: AiGenerationContext): string {
    const parts = [];
    
    if (context.sensorType) {
      parts.push(`- Primary sensor: ${context.sensorType}`);
    }
    
    if (context.widgetType) {
      parts.push(`- Widget type: ${context.widgetType}`);
    }
    
    if (context.theme) {
      parts.push(`- Theme: ${context.theme}`);
    }
    
    if (context.style) {
      parts.push(`- Style preferences: ${context.style}`);
    }
    
    if (context.existingWidgets && context.existingWidgets.length > 0) {
      parts.push(`- Existing widgets: ${context.existingWidgets.length} widgets on dashboard`);
    }
    
    if (context.screenSize) {
      parts.push(`- Screen size: ${context.screenSize.width}x${context.screenSize.height}`);
    }
    
    return parts.length > 0 ? parts.join('\n') : '- No specific context provided';
  }

  private parseWidgetConfig(text: string): any {
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Failed to parse widget config:', error);
      throw new Error('Invalid widget configuration generated');
    }
  }

  private parseLayoutSuggestions(text: string): any[] {
    try {
      // Extract multiple JSON objects or arrays
      const jsonMatches = text.match(/\{[\s\S]*?\}|\[[\s\S]*?\]/g);
      if (!jsonMatches) {
        throw new Error('No valid JSON found in layout response');
      }
      
      return jsonMatches.map(match => JSON.parse(match));
    } catch (error) {
      console.error('Failed to parse layout suggestions:', error);
      throw new Error('Invalid layout configuration generated');
    }
  }

  private async validateAndEnhanceConfig(config: any, context: AiGenerationContext): Promise<any> {
    // Add missing required fields
    const enhancedConfig = {
      ...config,
      id: `ai-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
      tags: ['ai-generated'],
      author: 'AI Assistant'
    };

    // Apply context-specific enhancements
    if (context.theme && !enhancedConfig.style?.theme) {
      enhancedConfig.style = { ...enhancedConfig.style, theme: context.theme };
    }

    if (context.sensorType && !enhancedConfig.sensorType) {
      enhancedConfig.sensorType = context.sensorType;
    }

    // Validate color schemes
    if (enhancedConfig.style?.colors) {
      enhancedConfig.style.colors = enhancedConfig.style.colors.filter(
        (color: string) => /^#[0-9A-Fa-f]{6}$/.test(color)
      );
    }

    return enhancedConfig;
  }

  private async validateLayout(layout: any, context: AiGenerationContext): Promise<any> {
    // Ensure layout has required fields
    const validatedLayout = {
      ...layout,
      id: `ai-layout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: '1.0.0',
      author: 'AI Assistant',
      tags: ['ai-generated']
    };

    // Validate widget positions
    if (validatedLayout.widgets) {
      validatedLayout.widgets = validatedLayout.widgets.map((widget: any) => ({
        ...widget,
        position: {
          x: Math.max(0, Math.min(widget.position?.x || 0, 2000)),
          y: Math.max(0, Math.min(widget.position?.y || 0, 2000))
        },
        size: {
          width: Math.max(100, Math.min(widget.size?.width || 200, 800)),
          height: Math.max(100, Math.min(widget.size?.height || 200, 600))
        }
      }));
    }

    return validatedLayout;
  }

  private calculateConfidence(config: any): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence for complete configurations
    if (config.title && config.type && config.sensorType) confidence += 0.2;
    if (config.style && config.style.colors && config.style.colors.length > 0) confidence += 0.1;
    if (config.alerts && typeof config.alerts.enabled === 'boolean') confidence += 0.1;
    
    // Type-specific confidence
    if (config.type === 'gauge' && config.gaugeConfig) confidence += 0.1;
    if (config.type === 'graph' && config.graphConfig) confidence += 0.1;
    
    return Math.min(confidence, 1.0);
  }

  private calculateLayoutConfidence(layouts: any[]): number {
    if (layouts.length === 0) return 0;
    
    const avgConfidence = layouts.reduce((acc, layout) => {
      let confidence = 0.5;
      if (layout.widgets && layout.widgets.length > 0) confidence += 0.2;
      if (layout.gridSize) confidence += 0.1;
      if (layout.theme) confidence += 0.1;
      return acc + confidence;
    }, 0) / layouts.length;
    
    return Math.min(avgConfidence, 1.0);
  }

  private generateSuggestions(config: any, context: AiGenerationContext): string[] {
    const suggestions = [];
    
    if (config.type === 'gauge' && !config.gaugeConfig?.showTicks) {
      suggestions.push('Consider enabling tick marks for better readability');
    }
    
    if (config.alerts && !config.alerts.enabled) {
      suggestions.push('Enable alerts for critical hardware monitoring');
    }
    
    if (config.style && config.style.colors && config.style.colors.length === 1) {
      suggestions.push('Add gradient colors for more visual appeal');
    }
    
    return suggestions;
  }

  private generateLayoutSuggestions(layouts: any[], context: AiGenerationContext): string[] {
    const suggestions = [];
    
    if (layouts.length > 0) {
      suggestions.push('Try the first layout for optimal performance monitoring');
      suggestions.push('Consider the cyberpunk theme for gaming aesthetics');
      suggestions.push('Use compact layout for multi-monitor setups');
    }
    
    return suggestions;
  }

  private isRateLimited(clientId: string): boolean {
    const now = Date.now();
    const lastRequest = this.rateLimiter.get(clientId);
    
    if (!lastRequest) return false;
    
    // Allow 1 request per 10 seconds
    return now - lastRequest < 10000;
  }

  private updateRateLimit(clientId: string): void {
    this.rateLimiter.set(clientId, Date.now());
  }

  private getCacheKey(prompt: string, context: AiGenerationContext): string {
    return `${prompt}-${JSON.stringify(context)}`;
  }

  // Public API methods for SvelteKit integration
  static async generateWidgetEndpoint(request: Request): Promise<Response> {
    try {
      const { prompt, context } = await request.json();
      
      const generator = new AiWidgetGenerator();
      const result = await generator.generateWidget(prompt, context);
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  static async generateLayoutEndpoint(request: Request): Promise<Response> {
    try {
      const { prompt, context } = await request.json();
      
      const generator = new AiWidgetGenerator();
      const result = await generator.generateLayout(prompt, context);
      
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}

// Export for SvelteKit API routes
export { AiWidgetGenerator }; 