/**
 * AI Layout Service - Google Genkit integration for intelligent widget arrangement
 * Provides context-aware layout suggestions and optimization
 */

import { AILayoutRequest, AILayoutSuggestion, ApplyAILayoutRequest } from '../types/api';
import { DashboardLayout, WidgetConfig, Position, Size } from '../types/widget';
import { SensorData } from '../types/sensor';
import { SciFiTheme } from '../types/sci-fi';

// Mock genkit import for now - will be replaced with actual implementation
interface GenkitConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  timeout: number;
}

interface GenkitResponse {
  suggestions: AILayoutSuggestion[];
  confidence: number;
  reasoning: string;
}

class AILayoutService {
  private isInitialized = false;
  private config: GenkitConfig = {
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 2000,
    timeout: 10000
  };

  private baseUrl = '/api/ai';

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Initialize Google Genkit connection
      const response = await fetch(`${this.baseUrl}/status`);
      this.isInitialized = response.ok;
    } catch (error) {
      console.warn('AI Layout Service initialization failed:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Generate layout suggestions using AI
   */
  async generateLayoutSuggestions(request: AILayoutRequest): Promise<AILayoutSuggestion[]> {
    if (!this.isInitialized) {
      throw new Error('AI Layout Service not initialized');
    }

    try {
      // Create context-aware prompt
      const prompt = this.createLayoutPrompt(request);
      
      const response = await fetch(`${this.baseUrl}/layout-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context: request.context,
          preferences: request.preferences,
          currentLayout: request.currentLayout,
          config: this.config
        }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const result = await response.json();
      return this.validateAndEnhanceSuggestions(result.suggestions, request);
    } catch (error) {
      console.error('Failed to generate AI layout suggestions:', error);
      
      // Fallback to rule-based suggestions
      return this.generateFallbackSuggestions(request);
    }
  }

  /**
   * Apply AI layout suggestion with optional modifications
   */
  async applyLayoutSuggestion(request: ApplyAILayoutRequest): Promise<DashboardLayout> {
    try {
      const response = await fetch(`${this.baseUrl}/apply-layout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Failed to apply layout: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to apply AI layout suggestion:', error);
      throw error;
    }
  }

  /**
   * Get layout optimization suggestions for existing layout
   */
  async optimizeLayout(
    layout: DashboardLayout, 
    sensorData: SensorData,
    theme: SciFiTheme
  ): Promise<AILayoutSuggestion[]> {
    const request: AILayoutRequest = {
      currentLayout: layout,
      preferences: {
        priority: 'performance',
        theme: theme.id,
        density: 'balanced',
        focusAreas: this.identifyFocusAreas(sensorData),
        constraints: {
          screenSize: { width: 1920, height: 1080 },
          maxWidgets: 20,
          minWidgetSize: { w: 2, h: 2 }
        }
      },
      context: {
        sensorTypes: Object.keys(sensorData),
        hardwareInfo: {
          cpu: {
            name: 'CPU',
            manufacturer: 'Unknown',
            cores: sensorData.cpu.cores.length,
            threads: sensorData.cpu.cores.length,
            baseFrequency: sensorData.cpu.frequency,
            maxFrequency: sensorData.cpu.frequency,
            architecture: 'Unknown'
          },
          gpu: sensorData.gpu.map(gpu => ({
            name: gpu.name,
            manufacturer: 'Unknown',
            memory: gpu.memory.total,
            driverVersion: 'Unknown'
          })),
          memory: {
            total: sensorData.memory.total,
            type: 'Unknown',
            speed: sensorData.memory.speed,
            slots: 4
          }
        },
        userPreferences: {}
      }
    };

    return this.generateLayoutSuggestions(request);
  }

  /**
   * Create context-aware AI prompt
   */
  private createLayoutPrompt(request: AILayoutRequest): string {
    const { currentLayout, preferences, context } = request;
    
    return `
You are a UI/UX expert specializing in PC monitoring dashboards with sci-fi aesthetics.

Current Layout Analysis:
- Widgets: ${currentLayout.widgets.length}
- Theme: ${preferences.theme}
- Density preference: ${preferences.density}
- Priority: ${preferences.priority}

Available Sensors:
${context.sensorTypes.map(type => `- ${type}`).join('\n')}

Hardware Context:
- CPU cores: ${context.hardwareInfo.cpu?.cores || 'Unknown'}
- GPU count: ${context.hardwareInfo.gpu?.length || 'Unknown'}
- Memory: ${context.hardwareInfo.memory?.total || 'Unknown'}

User Preferences:
- Focus areas: ${preferences.focusAreas.join(', ')}
- Screen size: ${preferences.constraints.screenSize.width}x${preferences.constraints.screenSize.height}

Task: Generate 3 optimal layout suggestions that:
1. Maximize ${preferences.priority} based on user priority
2. Follow ${preferences.theme} sci-fi design principles
3. Optimize for ${preferences.density} information density
4. Consider hardware-specific sensor importance
5. Maintain visual hierarchy and grouping

For each suggestion, provide:
- Layout configuration (widget positions and sizes)
- Reasoning for the arrangement
- Confidence score (0-1)
- Performance/aesthetic/functionality metrics
- Unique advantages

Return suggestions in JSON format with detailed reasoning.
    `.trim();
  }

  /**
   * Validate and enhance AI suggestions
   */
  private validateAndEnhanceSuggestions(
    suggestions: AILayoutSuggestion[],
    request: AILayoutRequest
  ): AILayoutSuggestion[] {
    return suggestions.map(suggestion => {
      // Validate positions are within bounds
      const validatedLayout = this.validateLayoutBounds(
        suggestion.layout,
        request.preferences.constraints.screenSize
      );

      // Calculate actual metrics
      const metrics = this.calculateLayoutMetrics(validatedLayout, request);

      // Generate preview if needed
      const preview = this.generateLayoutPreview(validatedLayout, request.preferences.theme);

      return {
        ...suggestion,
        layout: validatedLayout,
        metrics,
        preview,
        confidence: Math.min(suggestion.confidence, this.calculateConfidence(validatedLayout))
      };
    });
  }

  /**
   * Generate fallback suggestions using rule-based logic
   */
  private generateFallbackSuggestions(request: AILayoutRequest): AILayoutSuggestion[] {
    const suggestions: AILayoutSuggestion[] = [];
    
    // Performance-focused layout
    suggestions.push({
      id: 'fallback-performance',
      name: 'Performance Focus',
      description: 'Optimized for monitoring critical performance metrics',
      reasoning: 'Places CPU and GPU widgets prominently with temperature monitoring',
      confidence: 0.7,
      layout: this.createPerformanceLayout(request),
      metrics: {
        efficiency: 0.85,
        aesthetics: 0.65,
        functionality: 0.90,
        performance: 0.95
      },
      tags: ['performance', 'monitoring', 'critical'],
      preview: ''
    });

    // Balanced aesthetic layout
    suggestions.push({
      id: 'fallback-balanced',
      name: 'Balanced Design',
      description: 'Balanced approach between functionality and aesthetics',
      reasoning: 'Symmetrical arrangement with visual hierarchy',
      confidence: 0.8,
      layout: this.createBalancedLayout(request),
      metrics: {
        efficiency: 0.75,
        aesthetics: 0.85,
        functionality: 0.80,
        performance: 0.75
      },
      tags: ['balanced', 'aesthetic', 'usable'],
      preview: ''
    });

    // Compact efficiency layout
    suggestions.push({
      id: 'fallback-compact',
      name: 'Compact Efficiency',
      description: 'Maximum information density in minimal space',
      reasoning: 'Compact widget arrangements for space efficiency',
      confidence: 0.6,
      layout: this.createCompactLayout(request),
      metrics: {
        efficiency: 0.95,
        aesthetics: 0.60,
        functionality: 0.85,
        performance: 0.70
      },
      tags: ['compact', 'efficient', 'dense'],
      preview: ''
    });

    return suggestions;
  }

  private createPerformanceLayout(request: AILayoutRequest): DashboardLayout {
    // Implementation for performance-focused layout
    return {
      ...request.currentLayout,
      widgets: request.currentLayout.widgets.map((widget, index) => ({
        ...widget,
        position: this.calculatePerformancePosition(widget, index),
        size: this.calculateOptimalSize(widget, 'performance')
      }))
    };
  }

  private createBalancedLayout(request: AILayoutRequest): DashboardLayout {
    // Implementation for balanced layout
    return {
      ...request.currentLayout,
      widgets: request.currentLayout.widgets.map((widget, index) => ({
        ...widget,
        position: this.calculateBalancedPosition(widget, index),
        size: this.calculateOptimalSize(widget, 'balanced')
      }))
    };
  }

  private createCompactLayout(request: AILayoutRequest): DashboardLayout {
    // Implementation for compact layout
    return {
      ...request.currentLayout,
      widgets: request.currentLayout.widgets.map((widget, index) => ({
        ...widget,
        position: this.calculateCompactPosition(widget, index),
        size: this.calculateOptimalSize(widget, 'compact')
      }))
    };
  }

  private calculatePerformancePosition(widget: WidgetConfig, index: number): Position {
    // Priority-based positioning for performance metrics
    const priorityOrder = ['cpu', 'gpu', 'memory', 'storage', 'network'];
    const priority = priorityOrder.findIndex(p => 
      widget.sensorPath.toLowerCase().includes(p)
    );
    
    return {
      x: (priority !== -1 ? priority : index) * 6,
      y: Math.floor(index / 3) * 4
    };
  }

  private calculateBalancedPosition(widget: WidgetConfig, index: number): Position {
    // Symmetrical grid-based positioning
    const cols = 4;
    return {
      x: (index % cols) * 6,
      y: Math.floor(index / cols) * 4
    };
  }

  private calculateCompactPosition(widget: WidgetConfig, index: number): Position {
    // Compact positioning with minimal spacing
    const cols = 6;
    return {
      x: (index % cols) * 4,
      y: Math.floor(index / cols) * 3
    };
  }

  private calculateOptimalSize(widget: WidgetConfig, mode: string): Size {
    // Determine optimal widget size based on type and mode
    const baseSize = { w: 4, h: 4 };
    
    if (mode === 'compact') {
      return { w: 3, h: 3 };
    } else if (mode === 'performance' && widget.type === 'graph') {
      return { w: 6, h: 4 };
    }
    
    return baseSize;
  }

  private validateLayoutBounds(layout: DashboardLayout, screenSize: { width: number; height: number }): DashboardLayout {
    // Ensure all widgets fit within screen bounds
    const maxCols = Math.floor(screenSize.width / 100);
    const maxRows = Math.floor(screenSize.height / 100);
    
    return {
      ...layout,
      widgets: layout.widgets.map(widget => ({
        ...widget,
        position: {
          x: Math.max(0, Math.min(widget.position.x, maxCols - widget.size.w)),
          y: Math.max(0, Math.min(widget.position.y, maxRows - widget.size.h))
        }
      }))
    };
  }

  private calculateLayoutMetrics(layout: DashboardLayout, request: AILayoutRequest) {
    // Calculate performance metrics for the layout
    const widgets = layout.widgets;
    const totalArea = widgets.reduce((sum, w) => sum + (w.size.w * w.size.h), 0);
    const screenArea = request.preferences.constraints.screenSize.width * request.preferences.constraints.screenSize.height / 10000;
    
    return {
      efficiency: Math.min(1, totalArea / screenArea),
      aesthetics: this.calculateAestheticScore(widgets),
      functionality: this.calculateFunctionalityScore(widgets),
      performance: this.calculatePerformanceScore(widgets)
    };
  }

  private calculateAestheticScore(widgets: WidgetConfig[]): number {
    // Simple aesthetic scoring based on alignment and spacing
    let score = 0.8; // Base score
    
    // Check for alignment
    const alignedX = widgets.filter(w => widgets.some(w2 => w2.id !== w.id && w2.position.x === w.position.x)).length;
    const alignedY = widgets.filter(w => widgets.some(w2 => w2.id !== w.id && w2.position.y === w.position.y)).length;
    
    score += (alignedX + alignedY) / widgets.length * 0.2;
    
    return Math.min(1, score);
  }

  private calculateFunctionalityScore(widgets: WidgetConfig[]): number {
    // Score based on widget types and sensor coverage
    const typeVariety = new Set(widgets.map(w => w.type)).size;
    const sensorVariety = new Set(widgets.map(w => w.sensorPath.split('.')[0])).size;
    
    return Math.min(1, (typeVariety + sensorVariety) / 10);
  }

  private calculatePerformanceScore(widgets: WidgetConfig[]): number {
    // Score based on performance implications
    const heavyWidgets = widgets.filter(w => w.type === 'graph' || w.type === 'multi-resource').length;
    const totalWidgets = widgets.length;
    
    return Math.max(0.3, 1 - (heavyWidgets / totalWidgets));
  }

  private calculateConfidence(layout: DashboardLayout): number {
    // Calculate confidence based on layout validity
    const widgets = layout.widgets;
    let confidence = 1.0;
    
    // Check for overlaps
    const overlaps = widgets.filter(w1 => 
      widgets.some(w2 => w2.id !== w1.id && this.checkOverlap(w1, w2))
    ).length;
    
    confidence -= overlaps / widgets.length * 0.5;
    
    return Math.max(0.1, confidence);
  }

  private checkOverlap(w1: WidgetConfig, w2: WidgetConfig): boolean {
    return !(w1.position.x + w1.size.w <= w2.position.x ||
             w2.position.x + w2.size.w <= w1.position.x ||
             w1.position.y + w1.size.h <= w2.position.y ||
             w2.position.y + w2.size.h <= w1.position.y);
  }

  private generateLayoutPreview(layout: DashboardLayout, theme: string): string {
    // Generate a simple preview representation
    // In a real implementation, this would create a thumbnail image
    return `data:image/svg+xml;base64,${btoa(this.createSVGPreview(layout, theme))}`;
  }

  private createSVGPreview(layout: DashboardLayout, theme: string): string {
    const scale = 0.1; // Scale down for preview
    const svg = `
      <svg width="200" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a1a"/>
        ${layout.widgets.map(widget => `
          <rect 
            x="${widget.position.x * scale * 10}" 
            y="${widget.position.y * scale * 10}"
            width="${widget.size.w * scale * 10}" 
            height="${widget.size.h * scale * 10}"
            fill="${this.getThemeColor(theme)}" 
            stroke="#333" 
            stroke-width="1"
            opacity="0.7"
          />
        `).join('')}
      </svg>
    `;
    
    return svg;
  }

  private getThemeColor(theme: string): string {
    const colors = {
      cyberpunk: '#00ff88',
      neon: '#ff0080',
      gaming: '#00ffff',
      corporate: '#0066cc',
      matrix: '#00ff00'
    };
    return colors[theme as keyof typeof colors] || '#00ff88';
  }

  private identifyFocusAreas(sensorData: SensorData): string[] {
    const focusAreas: string[] = [];
    
    // High CPU usage
    if (sensorData.cpu.usage > 70) focusAreas.push('cpu');
    
    // High GPU usage
    if (sensorData.gpu.some(gpu => gpu.usage > 70)) focusAreas.push('gpu');
    
    // High memory usage
    if (sensorData.memory.usage > 80) focusAreas.push('memory');
    
    // High temperatures
    if (sensorData.cpu.temperature > 75 || sensorData.gpu.some(gpu => gpu.temperature > 80)) {
      focusAreas.push('temperature');
    }
    
    return focusAreas;
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }

  /**
   * Get AI service status
   */
  async getStatus() {
    try {
      const response = await fetch(`${this.baseUrl}/status`);
      return await response.json();
    } catch (error) {
      return { available: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Export singleton instance
export const aiLayoutService = new AILayoutService();
export default aiLayoutService;