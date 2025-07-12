/**
 * SenseCanvas AI Widget Generation API Route
 * Handles widget generation requests with rate limiting and validation.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

// Request validation schema
const GenerateWidgetRequestSchema = z.object({
  prompt: z.string().min(10).max(500),
  context: z.object({
    user_id: z.string().optional().default('anonymous'),
    timestamp: z.number().optional(),
    user_preferences: z.record(z.any()).optional().default({}),
    session_id: z.string().optional(),
    existing_widgets: z.array(z.record(z.any())).optional().default([])
  }).optional().default({})
});

type GenerateWidgetRequest = z.infer<typeof GenerateWidgetRequestSchema>;

// Rate limiting storage (in production, use Redis or database)
const rateLimitStore = new Map<string, {
  requests: number;
  windowStart: number;
  lastRequest: number;
}>();

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(userId: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const userLimit = rateLimitStore.get(userId);

  if (!userLimit) {
    rateLimitStore.set(userId, {
      requests: 1,
      windowStart: now,
      lastRequest: now
    });
    return { allowed: true };
  }

  // Reset window if expired
  if (now - userLimit.windowStart > RATE_LIMIT_WINDOW) {
    userLimit.windowStart = now;
    userLimit.requests = 1;
    userLimit.lastRequest = now;
    return { allowed: true };
  }

  // Check if within limits
  if (userLimit.requests >= MAX_REQUESTS_PER_WINDOW) {
    const resetTime = userLimit.windowStart + RATE_LIMIT_WINDOW;
    return { allowed: false, resetTime };
  }

  userLimit.requests++;
  userLimit.lastRequest = now;
  return { allowed: true };
}

async function callBackendAI(request: GenerateWidgetRequest): Promise<any> {
  const backendUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${backendUrl}/api/ai/generate-widget`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Backend error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error('Backend AI call failed:', err);
    
    // Fallback to mock generation for development
    return generateMockWidget(request);
  }
}

function generateMockWidget(request: GenerateWidgetRequest): any {
  const { prompt, context } = request;
  const timestamp = Date.now();
  
  // Simple mock widget generation based on prompt keywords
  const promptLower = prompt.toLowerCase();
  
  // Determine widget type
  let widgetType = 'gauge';
  if (promptLower.includes('graph') || promptLower.includes('chart') || promptLower.includes('timeline')) {
    widgetType = 'graph';
  } else if (promptLower.includes('text') || promptLower.includes('display')) {
    widgetType = 'text';
  } else if (promptLower.includes('multi') || promptLower.includes('system') || promptLower.includes('overview')) {
    widgetType = 'multi-sensor';
  }
  
  // Determine sensor type
  let sensorType = 'cpu';
  if (promptLower.includes('gpu') || promptLower.includes('graphics')) {
    sensorType = 'gpu';
  } else if (promptLower.includes('memory') || promptLower.includes('ram')) {
    sensorType = 'memory';
  } else if (promptLower.includes('storage') || promptLower.includes('disk')) {
    sensorType = 'storage';
  } else if (promptLower.includes('network')) {
    sensorType = 'network';
  }
  
  // Determine theme
  let theme = 'default';
  let colors = ['#22d3ee', '#ef4444', '#f59e0b'];
  
  if (promptLower.includes('gaming') || promptLower.includes('rgb')) {
    theme = 'gaming';
    colors = ['#22c55e', '#eab308', '#dc2626'];
  } else if (promptLower.includes('cyberpunk') || promptLower.includes('neon')) {
    theme = 'cyberpunk';
    colors = ['#a855f7', '#ec4899', '#06b6d4'];
  } else if (promptLower.includes('minimal') || promptLower.includes('clean')) {
    theme = 'minimal';
    colors = ['#6b7280', '#f59e0b', '#ef4444'];
  }
  
  // Extract colors from prompt
  if (promptLower.includes('red')) colors[0] = '#ef4444';
  if (promptLower.includes('green')) colors[0] = '#22c55e';
  if (promptLower.includes('blue')) colors[0] = '#3b82f6';
  if (promptLower.includes('purple')) colors[0] = '#a855f7';
  if (promptLower.includes('yellow')) colors[0] = '#eab308';
  
  // Generate title
  const titleMap = {
    cpu: 'CPU',
    gpu: 'GPU',
    memory: 'Memory',
    storage: 'Storage',
    network: 'Network'
  };
  
  let title = `${titleMap[sensorType]} Monitor`;
  if (promptLower.includes('temperature')) {
    title = `${titleMap[sensorType]} Temperature`;
  } else if (promptLower.includes('usage') || promptLower.includes('load')) {
    title = `${titleMap[sensorType]} Usage`;
  }
  
  // Base configuration
  const baseConfig = {
    id: `widget-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
    type: widgetType,
    title,
    sensorType,
    position: { x: 0, y: 0 },
    size: widgetType === 'graph' ? { width: 400, height: 200 } : 
          widgetType === 'text' ? { width: 180, height: 80 } :
          widgetType === 'multi-sensor' ? { width: 300, height: 250 } :
          { width: 200, height: 200 },
    style: {
      theme,
      colors,
      opacity: 1,
      borderRadius: theme === 'gaming' ? 16 : theme === 'minimal' ? 4 : 8,
      fontSize: 14,
      fontFamily: 'Orbitron, monospace',
      borderWidth: 1,
      borderColor: '#374151',
      shadowEnabled: theme === 'cyberpunk',
      shadowColor: colors[0],
      shadowBlur: 10,
      gradientEnabled: theme === 'rgb',
      gradientDirection: 'horizontal'
    },
    alerts: {
      enabled: promptLower.includes('alert') || promptLower.includes('warning') || promptLower.includes('threshold'),
      thresholds: {
        warning: 75,
        critical: 90
      },
      showNotifications: true,
      playSound: false,
      flashWidget: true
    },
    createdAt: timestamp,
    updatedAt: timestamp,
    version: '1.0.0',
    tags: [theme, sensorType, widgetType],
    isSelected: false,
    isResizing: false,
    isDragging: false,
    zIndex: 1
  };
  
  // Add type-specific configuration
  if (widgetType === 'gauge') {
    baseConfig.gaugeConfig = {
      minValue: 0,
      maxValue: 100,
      startAngle: -135,
      endAngle: 135,
      arcWidth: theme === 'gaming' ? 15 : 10,
      showValue: true,
      showLabel: true,
      showTicks: true,
      tickInterval: 20,
      unit: sensorType === 'cpu' && promptLower.includes('temperature') ? '°C' : '%'
    };
  } else if (widgetType === 'graph') {
    baseConfig.graphConfig = {
      timeRange: 60,
      maxDataPoints: 120,
      showGrid: true,
      showAxes: true,
      lineWidth: 2,
      fillArea: true,
      smoothing: true,
      yAxisMin: 0,
      yAxisMax: 100
    };
  } else if (widgetType === 'text') {
    baseConfig.textConfig = {
      format: '{value}%',
      fontSize: 18,
      fontWeight: 'bold',
      alignment: 'center',
      showIcon: true,
      iconPosition: 'left',
      iconSize: 24
    };
  } else if (widgetType === 'multi-sensor') {
    baseConfig.multiSensorConfig = {
      sensors: ['cpu', 'gpu', 'memory'],
      layout: 'grid',
      showLabels: true,
      showValues: true,
      compactMode: false
    };
  }
  
  return {
    widget: baseConfig,
    confidence: 0.8,
    reasoning: `Generated ${widgetType} widget for ${sensorType} monitoring with ${theme} theme based on your request.`,
    alternatives: [],
    metadata: {
      generation_time: timestamp,
      prompt_length: prompt.length,
      mock_generation: true
    }
  };
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  try {
    // Parse and validate request
    const body = await request.json();
    const validatedRequest = GenerateWidgetRequestSchema.parse(body);
    
    // Get user identifier (use IP as fallback)
    const userId = validatedRequest.context.user_id || getClientAddress();
    
    // Check rate limiting
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      return error(429, {
        message: `Rate limit exceeded. Try again in ${Math.ceil((rateLimit.resetTime! - Date.now()) / 1000)} seconds.`,
        resetTime: rateLimit.resetTime
      });
    }
    
    // Add timestamp to context
    validatedRequest.context.timestamp = Date.now();
    validatedRequest.context.user_id = userId;
    
    console.log(`AI widget generation request from ${userId}: "${validatedRequest.prompt}"`);
    
    // Call backend AI service
    const result = await callBackendAI(validatedRequest);
    
    console.log(`AI widget generated successfully for ${userId}`);
    
    return json(result);
    
  } catch (err) {
    console.error('AI generation error:', err);
    
    if (err instanceof z.ZodError) {
      return error(400, {
        message: 'Invalid request format',
        errors: err.errors
      });
    }
    
    if (err instanceof Error) {
      if (err.message.includes('Rate limit')) {
        return error(429, { message: err.message });
      }
      
      return error(500, {
        message: 'Widget generation failed',
        details: err.message
      });
    }
    
    return error(500, {
      message: 'Internal server error'
    });
  }
};

export const GET: RequestHandler = async ({ url, getClientAddress }) => {
  // Get rate limit status
  const userId = url.searchParams.get('user_id') || getClientAddress();
  const userLimit = rateLimitStore.get(userId);
  
  if (!userLimit) {
    return json({
      requests_remaining: MAX_REQUESTS_PER_WINDOW,
      window_reset_time: null,
      is_limited: false
    });
  }
  
  const now = Date.now();
  const windowExpired = now - userLimit.windowStart > RATE_LIMIT_WINDOW;
  
  if (windowExpired) {
    return json({
      requests_remaining: MAX_REQUESTS_PER_WINDOW,
      window_reset_time: null,
      is_limited: false
    });
  }
  
  const requestsRemaining = Math.max(0, MAX_REQUESTS_PER_WINDOW - userLimit.requests);
  const isLimited = requestsRemaining <= 0;
  const resetTime = userLimit.windowStart + RATE_LIMIT_WINDOW;
  
  return json({
    requests_remaining: requestsRemaining,
    window_reset_time: resetTime,
    is_limited: isLimited
  });
};