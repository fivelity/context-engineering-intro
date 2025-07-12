/**
 * Google Genkit Integration for AI Widget Generation
 * This example demonstrates how to integrate Genkit for AI-powered widget creation
 * with context-aware prompts and streaming responses.
 */

import { genkit } from '@genkit/core';
import { gemini15Pro, gemini15Flash } from '@genkit/googleai';
import type { 
  AIGenerationRequest, 
  AIGenerationResponse, 
  CompleteWidget,
  SensorData 
} from './widget-schemas';

// Initialize Genkit with AI models
const ai = genkit({
  plugins: [
    // Configure Google AI models
    gemini15Pro(),
    gemini15Flash()
  ],
  enableTracingAndMetrics: true
});

// Widget generation flow using Genkit
export const generateWidgetFlow = ai.defineFlow({
  name: 'generateWidget',
  inputSchema: 'AIGenerationRequest',
  outputSchema: 'AIGenerationResponse'
}, async (request: AIGenerationRequest): Promise<AIGenerationResponse> => {
  const startTime = performance.now();
  
  try {
    // Build context-aware system prompt
    const systemPrompt = buildSystemPrompt(request.context);
    
    // Build user prompt with specific requirements
    const userPrompt = buildUserPrompt(request);
    
    // Generate widget configurations using selected model
    const response = await ai.generate({
      model: request.options.model === 'gemini-1.5-flash' ? gemini15Flash : gemini15Pro,
      prompt: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      config: {
        temperature: request.options.creativity,
        maxOutputTokens: 2048,
        candidateCount: request.options.maxVariations
      }
    });
    
    // Parse and validate generated widget configurations
    const variations = await parseGeneratedWidgets(response, request);
    
    const processingTime = performance.now() - startTime;
    
    return {
      success: true,
      variations,
      metadata: {
        processingTime,
        model: request.options.model,
        tokensUsed: response.usage?.totalTokens || 0
      }
    };
    
  } catch (error) {
    console.error('AI widget generation failed:', error);
    
    return {
      success: false,
      variations: [],
      metadata: {
        processingTime: performance.now() - startTime,
        model: request.options.model,
        tokensUsed: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

// Build context-aware system prompt
function buildSystemPrompt(context: AIGenerationRequest['context']): string {
  const { availableSensors, currentTheme, dashboardState } = context;
  
  return `You are an expert UI designer and developer specializing in hardware monitoring dashboards. 
Your task is to generate widget configurations for a sci-fi themed dashboard called SenseCanvas.

CONTEXT:
- Available sensors: ${availableSensors.join(', ')}
- Current theme: ${currentTheme}
- Existing widgets: ${dashboardState.widgets.length}
- Screen dimensions: ${dashboardState.screenSize.width}x${dashboardState.screenSize.height}

DESIGN PRINCIPLES:
- Use sci-fi, futuristic aesthetics with Cosmic UI components
- Prioritize real-time data visualization and clear readability
- Support customization and personalization
- Maintain consistency with the current theme

WIDGET TYPES:
1. Gauge: Circular, arc, or linear progress displays for single metrics
2. Graph: Line, area, or bar charts for historical data trends
3. Simple: Clean, minimalist displays with optional icons
4. Meter: Horizontal/vertical progress bars for percentages
5. Multi-resource: Combined displays for related sensors

OUTPUT FORMAT:
Generate widget configurations as JSON objects with the following structure:
- title: Descriptive name for the widget
- displayType: One of 'gauge', 'graph', 'simple', 'meter', 'multi-resource'
- orientation: 'vertical' or 'horizontal'
- sensors: Array of sensor IDs to monitor
- style: Detailed styling configuration including colors, thickness, icons
- alerts: Optional threshold-based alerting configuration

STYLING GUIDELINES:
- Use hex colors that complement the ${currentTheme} theme
- For gaming theme: Use green (#00ff88) and orange (#ff6b35) accents
- For RGB theme: Use rainbow gradients and animated colors
- For cyberpunk theme: Use purple (#9d4edd) and gold (#ffd60a)
- For neon theme: Use bright cyan (#00ffff) and magenta (#ff00ff)
- For minimal theme: Use clean blues (#0066cc) and grays

COSMIC UI INTEGRATION:
- All widgets use Cosmic UI Frame components with appropriate glow effects
- Support custom SVG paths for advanced styling
- Enable sci-fi animations and effects where appropriate

Respond only with valid JSON widget configurations.`;
}

// Build user prompt with specific requirements
function buildUserPrompt(request: AIGenerationRequest): string {
  const { prompt, options } = request;
  
  let enhancedPrompt = `User Request: "${prompt}"\n\n`;
  
  enhancedPrompt += `Requirements:
- Generate ${options.maxVariations} different widget variations
- Use creativity level ${options.creativity} (0 = conservative, 1 = very creative)
- ${options.includeCustomSvg ? 'Include custom SVG elements where appropriate' : 'Use standard styling only'}

Additional Context:
- Focus on usability and immediate visual feedback
- Ensure generated widgets work well with real-time data updates
- Consider alert thresholds for critical metrics like temperature and usage
- Make widgets suitable for both casual users and power users

Generate widget configurations that best fulfill this request while following the design principles and technical constraints outlined in the system prompt.`;

  return enhancedPrompt;
}

// Parse and validate generated widget configurations
async function parseGeneratedWidgets(
  response: any, 
  request: AIGenerationRequest
): Promise<AIGenerationResponse['variations']> {
  const variations: AIGenerationResponse['variations'] = [];
  
  // Extract JSON from AI response (handling potential markdown formatting)
  const jsonMatches = response.text().match(/```(?:json)?\n?([\s\S]*?)\n?```/g) || 
                     [response.text()];
  
  for (let i = 0; i < jsonMatches.length && i < request.options.maxVariations; i++) {
    try {
      const jsonText = jsonMatches[i].replace(/```(?:json)?\n?/g, '').replace(/\n?```/g, '');
      const config = JSON.parse(jsonText);
      
      // Validate and enhance the configuration
      const enhancedConfig = await enhanceWidgetConfig(config, request);
      
      variations.push({
        id: crypto.randomUUID(),
        config: enhancedConfig,
        confidence: calculateConfidence(config, request),
        reasoning: generateReasoning(config, request),
        customSvg: config.customSvg
      });
      
    } catch (error) {
      console.warn(`Failed to parse widget variation ${i + 1}:`, error);
      
      // Generate fallback configuration
      const fallbackConfig = generateFallbackWidget(request);
      variations.push({
        id: crypto.randomUUID(),
        config: fallbackConfig,
        confidence: 0.3,
        reasoning: "AI generation failed, using fallback configuration",
        customSvg: undefined
      });
    }
  }
  
  return variations;
}

// Enhance and validate widget configuration
async function enhanceWidgetConfig(
  config: any, 
  request: AIGenerationRequest
): Promise<CompleteWidget['style'] & CompleteWidget> {
  // Ensure required fields are present
  const enhanced = {
    title: config.title || 'Generated Widget',
    displayType: config.displayType || 'gauge',
    orientation: config.orientation || 'vertical',
    sensors: Array.isArray(config.sensors) ? config.sensors : [request.context.availableSensors[0]],
    theme: request.context.currentTheme,
    
    style: {
      appearance: {
        style: config.style?.appearance?.style || 'circular',
        primaryColor: config.style?.appearance?.primaryColor || getThemeColor(request.context.currentTheme),
        secondaryColor: config.style?.appearance?.secondaryColor,
        gradientColors: config.style?.appearance?.gradientColors,
        thickness: Math.max(1, Math.min(20, config.style?.appearance?.thickness || 4)),
        width: Math.max(1, Math.min(20, config.style?.appearance?.width || 2)),
        startAngle: config.style?.appearance?.startAngle,
        endAngle: config.style?.appearance?.endAngle,
        tickCount: config.style?.appearance?.tickCount
      },
      icon: config.style?.icon ? {
        show: config.style.icon.show !== false,
        name: config.style.icon.name || 'cpu',
        size: Math.max(12, Math.min(64, config.style.icon.size || 24)),
        color: config.style.icon.color || getThemeColor(request.context.currentTheme),
        thickness: Math.max(1, Math.min(8, config.style.icon.thickness || 2))
      } : undefined,
      typography: {
        showValue: config.style?.typography?.showValue !== false,
        showLabel: config.style?.typography?.showLabel !== false,
        valueColor: config.style?.typography?.valueColor || '#ffffff',
        labelColor: config.style?.typography?.labelColor || getThemeColor(request.context.currentTheme),
        unitOverride: config.style?.typography?.unitOverride
      },
      border: config.style?.border?.enabled ? {
        enabled: true,
        style: config.style.border.style || 'solid',
        color: config.style.border.color || getThemeColor(request.context.currentTheme),
        width: Math.max(1, Math.min(8, config.style.border.width || 1))
      } : undefined,
      cosmicFrame: {
        type: config.style?.cosmicFrame?.type || 'basic',
        glowEffect: config.style?.cosmicFrame?.glowEffect !== false,
        animationSpeed: Math.max(0, Math.min(10, config.style?.cosmicFrame?.animationSpeed || 5)),
        customSvgPath: config.style?.cosmicFrame?.customSvgPath
      }
    },
    
    alerts: {
      enabled: config.alerts?.enabled || false,
      thresholds: Array.isArray(config.alerts?.thresholds) 
        ? config.alerts.thresholds.map((threshold: any, index: number) => ({
            id: crypto.randomUUID(),
            value: threshold.value || 80,
            operator: threshold.operator || '>',
            color: threshold.color || '#ff4444',
            message: threshold.message || `Threshold ${index + 1} exceeded`,
            priority: threshold.priority || 'medium',
            sound: threshold.sound || false,
            persist: threshold.persist || false
          }))
        : []
    }
  };
  
  return enhanced;
}

// Calculate confidence score for generated configuration
function calculateConfidence(config: any, request: AIGenerationRequest): number {
  let confidence = 0.5; // Base confidence
  
  // Boost confidence for complete configurations
  if (config.title && config.displayType && config.sensors) confidence += 0.2;
  
  // Boost confidence for valid styling
  if (config.style?.appearance?.primaryColor?.match(/^#[0-9A-Fa-f]{6}$/)) confidence += 0.1;
  
  // Boost confidence for appropriate sensor selection
  if (Array.isArray(config.sensors) && 
      config.sensors.every((s: string) => request.context.availableSensors.includes(s))) {
    confidence += 0.1;
  }
  
  // Boost confidence for theme-appropriate colors
  if (isThemeAppropriate(config, request.context.currentTheme)) confidence += 0.1;
  
  return Math.min(1.0, confidence);
}

// Generate reasoning for the configuration choice
function generateReasoning(config: any, request: AIGenerationRequest): string {
  const displayType = config.displayType || 'gauge';
  const theme = request.context.currentTheme;
  const sensorCount = Array.isArray(config.sensors) ? config.sensors.length : 1;
  
  let reasoning = `Generated ${displayType} widget for ${theme} theme`;
  
  if (sensorCount > 1) {
    reasoning += ` with ${sensorCount} sensors`;
  }
  
  if (config.style?.appearance?.primaryColor) {
    reasoning += ` using ${config.style.appearance.primaryColor} as primary color`;
  }
  
  if (config.alerts?.enabled) {
    reasoning += ` with alerting enabled`;
  }
  
  return reasoning;
}

// Generate fallback widget configuration
function generateFallbackWidget(request: AIGenerationRequest): CompleteWidget {
  return {
    title: 'Basic Monitor',
    displayType: 'gauge',
    orientation: 'vertical',
    sensors: [request.context.availableSensors[0] || 'cpu-usage'],
    theme: request.context.currentTheme,
    
    style: {
      appearance: {
        style: 'circular',
        primaryColor: getThemeColor(request.context.currentTheme),
        thickness: 4,
        width: 2
      },
      typography: {
        showValue: true,
        showLabel: true,
        valueColor: '#ffffff',
        labelColor: getThemeColor(request.context.currentTheme)
      }
    },
    
    alerts: {
      enabled: false,
      thresholds: []
    }
  };
}

// Get appropriate color for theme
function getThemeColor(theme: string): string {
  const themeColors: Record<string, string> = {
    gaming: '#00ff88',
    rgb: '#ff6b35',
    neon: '#00ffff',
    cyberpunk: '#9d4edd',
    minimal: '#0066cc'
  };
  
  return themeColors[theme] || '#00ff88';
}

// Check if configuration is appropriate for theme
function isThemeAppropriate(config: any, theme: string): boolean {
  const color = config.style?.appearance?.primaryColor;
  if (!color) return false;
  
  const themeColor = getThemeColor(theme);
  
  // Simple color similarity check
  return color.toLowerCase() === themeColor.toLowerCase() ||
         config.style?.appearance?.gradientColors?.includes(themeColor);
}

// Streaming response handler for real-time feedback
export async function generateWidgetStreaming(
  request: AIGenerationRequest,
  onProgress: (chunk: string) => void
): Promise<AIGenerationResponse> {
  try {
    const systemPrompt = buildSystemPrompt(request.context);
    const userPrompt = buildUserPrompt(request);
    
    const stream = await ai.generateStream({
      model: request.options.model === 'gemini-1.5-flash' ? gemini15Flash : gemini15Pro,
      prompt: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      config: {
        temperature: request.options.creativity,
        maxOutputTokens: 2048
      }
    });
    
    let fullResponse = '';
    
    for await (const chunk of stream) {
      const text = chunk.text();
      fullResponse += text;
      onProgress(text);
    }
    
    // Parse final response
    const variations = await parseGeneratedWidgets({ text: () => fullResponse }, request);
    
    return {
      success: true,
      variations,
      metadata: {
        processingTime: 0, // Streaming doesn't provide timing
        model: request.options.model,
        tokensUsed: 0 // Not available during streaming
      }
    };
    
  } catch (error) {
    return {
      success: false,
      variations: [],
      metadata: {
        processingTime: 0,
        model: request.options.model,
        tokensUsed: 0
      },
      error: error instanceof Error ? error.message : 'Streaming failed'
    };
  }
}

// Rate limiting for AI requests
class AIRateLimiter {
  private requests: number[] = [];
  private readonly maxRequests: number;
  private readonly timeWindow: number;
  
  constructor(maxRequests = 10, timeWindowMs = 60000) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }
  
  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    
    // Remove old requests outside time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
  
  getTimeUntilReset(): number {
    if (this.requests.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requests);
    return Math.max(0, this.timeWindow - (Date.now() - oldestRequest));
  }
}

export const aiRateLimiter = new AIRateLimiter();

// Wrapper function with rate limiting
export async function generateWidget(request: AIGenerationRequest): Promise<AIGenerationResponse> {
  if (!(await aiRateLimiter.checkLimit())) {
    const resetTime = aiRateLimiter.getTimeUntilReset();
    
    return {
      success: false,
      variations: [],
      metadata: {
        processingTime: 0,
        model: request.options.model,
        tokensUsed: 0
      },
      error: `Rate limit exceeded. Try again in ${Math.ceil(resetTime / 1000)} seconds.`
    };
  }
  
  return generateWidgetFlow(request);
} 