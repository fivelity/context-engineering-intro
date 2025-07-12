/**
 * SenseCanvas AI Layout Generation API Route
 * Handles dashboard layout generation requests with multiple widgets.
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { z } from 'zod';

// Request validation schema
const GenerateLayoutRequestSchema = z.object({
  prompt: z.string().min(10).max(1000),
  context: z.object({
    user_id: z.string().optional().default('anonymous'),
    timestamp: z.number().optional(),
    user_preferences: z.record(z.any()).optional().default({}),
    session_id: z.string().optional(),
    dashboard_size: z.object({
      width: z.number().optional().default(1200),
      height: z.number().optional().default(800)
    }).optional().default({})
  }).optional().default({})
});

type GenerateLayoutRequest = z.infer<typeof GenerateLayoutRequestSchema>;

// Rate limiting storage (shared with widget generation)
const rateLimitStore = new Map<string, {
  requests: number;
  windowStart: number;
  lastRequest: number;
}>();

const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5; // Lower limit for layout generation

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

async function callBackendAI(request: GenerateLayoutRequest): Promise<any> {
  const backendUrl = process.env.VITE_API_BASE_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${backendUrl}/api/ai/generate-layout`, {
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
    console.error('Backend AI layout call failed:', err);
    
    // Fallback to mock generation for development
    return generateMockLayout(request);
  }
}

function generateMockLayout(request: GenerateLayoutRequest): any {
  const { prompt, context } = request;
  const timestamp = Date.now();
  const dashboardSize = context.dashboard_size || { width: 1200, height: 800 };
  
  // Parse prompt to understand layout requirements
  const promptLower = prompt.toLowerCase();
  
  // Determine layout type
  let layoutType = 'overview';
  if (promptLower.includes('gaming') || promptLower.includes('performance')) {
    layoutType = 'gaming';
  } else if (promptLower.includes('minimal') || promptLower.includes('simple')) {
    layoutType = 'minimal';
  } else if (promptLower.includes('detailed') || promptLower.includes('comprehensive')) {
    layoutType = 'detailed';
  } else if (promptLower.includes('temperature') || promptLower.includes('thermal')) {
    layoutType = 'thermal';
  }
  
  // Determine theme
  let theme = 'default';
  if (promptLower.includes('cyberpunk') || promptLower.includes('neon')) {
    theme = 'cyberpunk';
  } else if (promptLower.includes('gaming') || promptLower.includes('rgb')) {
    theme = 'gaming';
  } else if (promptLower.includes('minimal') || promptLower.includes('clean')) {
    theme = 'minimal';
  }
  
  // Generate widgets based on layout type
  const widgets = [];
  let idCounter = 0;
  
  function createWidget(type: string, title: string, sensorType: string, position: { x: number; y: number }, size: { width: number; height: number }, additionalConfig: any = {}) {
    const baseColors = {
      cyberpunk: ['#a855f7', '#ec4899', '#06b6d4'],
      gaming: ['#22c55e', '#eab308', '#dc2626'],
      minimal: ['#6b7280', '#f59e0b', '#ef4444'],
      default: ['#22d3ee', '#ef4444', '#f59e0b']
    };
    
    const widget = {
      id: `widget-${timestamp}-${++idCounter}`,
      type,
      title,
      sensorType,
      position,
      size,
      style: {
        theme,
        colors: baseColors[theme] || baseColors.default,
        opacity: 1,
        borderRadius: theme === 'gaming' ? 16 : theme === 'minimal' ? 4 : 8,
        fontSize: 14,
        fontFamily: 'Orbitron, monospace',
        borderWidth: 1,
        borderColor: '#374151',
        shadowEnabled: theme === 'cyberpunk',
        shadowColor: baseColors[theme]?.[0] || '#22d3ee',
        shadowBlur: 10,
        gradientEnabled: false,
        gradientDirection: 'horizontal'
      },
      alerts: {
        enabled: true,
        thresholds: {
          warning: sensorType === 'cpu' && title.includes('Temperature') ? 75 : 80,
          critical: sensorType === 'cpu' && title.includes('Temperature') ? 85 : 95
        },
        showNotifications: true,
        playSound: false,
        flashWidget: true
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      version: '1.0.0',
      tags: [theme, sensorType, type, layoutType],
      isSelected: false,
      isResizing: false,
      isDragging: false,
      zIndex: 1,
      ...additionalConfig
    };
    
    // Add type-specific configuration
    if (type === 'gauge') {
      widget.gaugeConfig = {
        minValue: title.includes('Temperature') ? 20 : 0,
        maxValue: title.includes('Temperature') ? 100 : 100,
        startAngle: -135,
        endAngle: 135,
        arcWidth: theme === 'gaming' ? 15 : 10,
        showValue: true,
        showLabel: true,
        showTicks: true,
        tickInterval: 20,
        unit: title.includes('Temperature') ? '°C' : '%'
      };
    } else if (type === 'graph') {
      widget.graphConfig = {
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
    } else if (type === 'text') {
      widget.textConfig = {
        format: title.includes('Usage') ? '{value}%' : '{value}',
        fontSize: 18,
        fontWeight: 'bold',
        alignment: 'center',
        showIcon: true,
        iconPosition: 'left',
        iconSize: 24
      };
    } else if (type === 'multi-sensor') {
      widget.multiSensorConfig = {
        sensors: additionalConfig.sensors || ['cpu', 'gpu', 'memory'],
        layout: 'grid',
        showLabels: true,
        showValues: true,
        compactMode: false
      };
    }
    
    return widget;
  }
  
  // Generate layout-specific widgets
  switch (layoutType) {
    case 'gaming':
      widgets.push(
        createWidget('gauge', 'CPU Usage', 'cpu', { x: 50, y: 50 }, { width: 200, height: 200 }),
        createWidget('gauge', 'GPU Usage', 'gpu', { x: 300, y: 50 }, { width: 200, height: 200 }),
        createWidget('graph', 'CPU Temperature', 'cpu', { x: 550, y: 50 }, { width: 400, height: 200 }),
        createWidget('text', 'GPU Memory', 'gpu', { x: 50, y: 300 }, { width: 180, height: 80 }),
        createWidget('text', 'RAM Usage', 'memory', { x: 270, y: 300 }, { width: 180, height: 80 }),
        createWidget('multi-sensor', 'System Overview', 'cpu', { x: 500, y: 300 }, { width: 400, height: 250 }, {
          sensors: ['cpu', 'gpu', 'memory']
        })
      );
      break;
      
    case 'thermal':
      widgets.push(
        createWidget('gauge', 'CPU Temperature', 'cpu', { x: 50, y: 50 }, { width: 220, height: 220 }),
        createWidget('gauge', 'GPU Temperature', 'gpu', { x: 320, y: 50 }, { width: 220, height: 220 }),
        createWidget('graph', 'Thermal History', 'cpu', { x: 590, y: 50 }, { width: 500, height: 220 }),
        createWidget('text', 'CPU Frequency', 'cpu', { x: 50, y: 320 }, { width: 200, height: 100 }),
        createWidget('text', 'GPU Frequency', 'gpu', { x: 300, y: 320 }, { width: 200, height: 100 }),
        createWidget('multi-sensor', 'All Temperatures', 'cpu', { x: 550, y: 320 }, { width: 400, height: 200 }, {
          sensors: ['cpu', 'gpu']
        })
      );
      break;
      
    case 'minimal':
      widgets.push(
        createWidget('text', 'CPU', 'cpu', { x: 100, y: 100 }, { width: 150, height: 60 }),
        createWidget('text', 'GPU', 'gpu', { x: 300, y: 100 }, { width: 150, height: 60 }),
        createWidget('text', 'Memory', 'memory', { x: 500, y: 100 }, { width: 150, height: 60 }),
        createWidget('graph', 'System Load', 'cpu', { x: 100, y: 200 }, { width: 600, height: 150 })
      );
      break;
      
    case 'detailed':
      widgets.push(
        createWidget('gauge', 'CPU Usage', 'cpu', { x: 50, y: 50 }, { width: 180, height: 180 }),
        createWidget('gauge', 'CPU Temperature', 'cpu', { x: 250, y: 50 }, { width: 180, height: 180 }),
        createWidget('gauge', 'GPU Usage', 'gpu', { x: 450, y: 50 }, { width: 180, height: 180 }),
        createWidget('gauge', 'GPU Temperature', 'gpu', { x: 650, y: 50 }, { width: 180, height: 180 }),
        createWidget('text', 'RAM Usage', 'memory', { x: 50, y: 250 }, { width: 150, height: 70 }),
        createWidget('text', 'VRAM Usage', 'gpu', { x: 220, y: 250 }, { width: 150, height: 70 }),
        createWidget('text', 'Storage', 'storage', { x: 390, y: 250 }, { width: 150, height: 70 }),
        createWidget('text', 'Network', 'network', { x: 560, y: 250 }, { width: 150, height: 70 }),
        createWidget('graph', 'Performance History', 'cpu', { x: 50, y: 340 }, { width: 400, height: 180 }),
        createWidget('multi-sensor', 'Quick Stats', 'cpu', { x: 470, y: 340 }, { width: 300, height: 180 }, {
          sensors: ['cpu', 'gpu', 'memory', 'storage']
        })
      );
      break;
      
    default: // overview
      widgets.push(
        createWidget('gauge', 'CPU Usage', 'cpu', { x: 50, y: 50 }, { width: 200, height: 200 }),
        createWidget('gauge', 'GPU Usage', 'gpu', { x: 300, y: 50 }, { width: 200, height: 200 }),
        createWidget('text', 'Memory Usage', 'memory', { x: 550, y: 50 }, { width: 200, height: 100 }),
        createWidget('graph', 'CPU History', 'cpu', { x: 50, y: 300 }, { width: 450, height: 200 }),
        createWidget('multi-sensor', 'System Status', 'cpu', { x: 550, y: 200 }, { width: 300, height: 300 }, {
          sensors: ['cpu', 'gpu', 'memory']
        })
      );
  }
  
  // Generate layout name and description
  const layoutNames = {
    gaming: 'Gaming Performance Dashboard',
    thermal: 'Thermal Monitoring Layout',
    minimal: 'Minimal System Monitor',
    detailed: 'Comprehensive System Dashboard',
    overview: 'System Overview Layout'
  };
  
  const layoutDescriptions = {
    gaming: 'Optimized for gaming with performance metrics and GPU monitoring',
    thermal: 'Focused on temperature monitoring and thermal management', 
    minimal: 'Clean, simple layout with essential metrics only',
    detailed: 'Comprehensive monitoring with all system components',
    overview: 'Balanced overview of system performance and health'
  };
  
  return {
    layout: {
      id: `layout-${timestamp}`,
      name: layoutNames[layoutType] || 'Custom Layout',
      description: layoutDescriptions[layoutType] || 'AI-generated custom layout',
      theme,
      widgets,
      metadata: {
        generated_at: timestamp,
        layout_type: layoutType,
        widget_count: widgets.length,
        dashboard_size: dashboardSize,
        ai_generated: true,
        version: '1.0.0'
      }
    },
    confidence: 0.85,
    reasoning: `Generated ${layoutType} layout with ${widgets.length} widgets optimized for ${theme} theme based on your requirements.`,
    alternatives: [
      {
        layout_type: layoutType === 'gaming' ? 'overview' : 'gaming',
        description: 'Alternative gaming-focused layout'
      },
      {
        layout_type: 'minimal',
        description: 'Simplified version with fewer widgets'
      }
    ],
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
    const validatedRequest = GenerateLayoutRequestSchema.parse(body);
    
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
    
    console.log(`AI layout generation request from ${userId}: "${validatedRequest.prompt}"`);
    
    // Call backend AI service
    const result = await callBackendAI(validatedRequest);
    
    console.log(`AI layout generated successfully for ${userId}`);
    
    return json(result);
    
  } catch (err) {
    console.error('AI layout generation error:', err);
    
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
        message: 'Layout generation failed',
        details: err.message
      });
    }
    
    return error(500, {
      message: 'Internal server error'
    });
  }
};

export const GET: RequestHandler = async ({ url, getClientAddress }) => {
  // Get available layout types and templates
  const templates = [
    {
      id: 'gaming',
      name: 'Gaming Performance',
      description: 'Optimized for gaming with GPU and performance metrics',
      widget_count: 6,
      recommended_for: ['gaming', 'performance monitoring', 'gpu intensive tasks']
    },
    {
      id: 'thermal',
      name: 'Thermal Monitoring',
      description: 'Temperature-focused layout for thermal management',
      widget_count: 6,
      recommended_for: ['overclocking', 'thermal monitoring', 'cooling optimization']
    },
    {
      id: 'minimal',
      name: 'Minimal Monitor',
      description: 'Clean layout with essential metrics only',
      widget_count: 4,
      recommended_for: ['minimal setups', 'low resource usage', 'clean aesthetics']
    },
    {
      id: 'detailed',
      name: 'Comprehensive Dashboard',
      description: 'Complete system monitoring with all components',
      widget_count: 10,
      recommended_for: ['system administration', 'detailed monitoring', 'troubleshooting']
    },
    {
      id: 'overview',
      name: 'System Overview',
      description: 'Balanced layout for general system monitoring',
      widget_count: 5,
      recommended_for: ['general use', 'balanced monitoring', 'everyday users']
    }
  ];
  
  return json({
    templates,
    supported_themes: ['default', 'cyberpunk', 'gaming', 'minimal', 'rgb'],
    max_widgets_per_layout: 15,
    generation_guidelines: [
      'Specify the type of monitoring you need (gaming, thermal, minimal, etc.)',
      'Mention preferred themes (cyberpunk, gaming, minimal)',
      'Include specific sensors or metrics you want to monitor',
      'Describe your use case (streaming, overclocking, general use)',
      'Mention screen size constraints if applicable'
    ]
  });
};