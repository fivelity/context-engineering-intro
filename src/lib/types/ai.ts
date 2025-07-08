import type { WidgetConfig } from './widget.js';

// AI layout suggestion types
export interface LayoutSuggestion {
	id: string;
	name: string;
	description: string;
	widgets: WidgetConfig[];
	reasoning: string;
	confidence: number;
	category: 'performance' | 'aesthetics' | 'functionality' | 'balanced';
	metrics: {
		efficiency: number; // 0-100
		readability: number; // 0-100
		aesthetics: number; // 0-100
		functionality: number; // 0-100
	};
	preview?: string; // Base64 encoded thumbnail
	createdAt: number;
}

export interface AILayoutRequest {
	currentWidgets: WidgetConfig[];
	dashboardSize: { width: number; height: number };
	preferences: {
		priority: 'performance' | 'aesthetics' | 'functionality' | 'balanced';
		theme: 'light' | 'dark' | 'auto';
		density: 'compact' | 'spacious' | 'balanced';
		focus: 'cpu' | 'gpu' | 'memory' | 'storage' | 'all';
	};
	constraints?: {
		maxWidgets?: number;
		fixedWidgets?: string[]; // Widget IDs that cannot be moved
		excludeWidgetTypes?: string[];
		preserveGrouping?: boolean;
	};
	context?: {
		userType: 'gamer' | 'developer' | 'server-admin' | 'enthusiast' | 'casual';
		usage: 'monitoring' | 'troubleshooting' | 'optimization' | 'presentation';
		experience: 'beginner' | 'intermediate' | 'advanced';
	};
}

export interface AILayoutResponse {
	success: boolean;
	suggestions: LayoutSuggestion[];
	metadata: {
		requestId: string;
		processingTime: number;
		model: string;
		version: string;
	};
	error?: {
		code: string;
		message: string;
		details?: any;
	};
}

export interface AIAnalysis {
	currentLayout: {
		score: number;
		strengths: string[];
		weaknesses: string[];
		recommendations: string[];
	};
	performance: {
		widgetDensity: number;
		visualHierarchy: number;
		informationFlow: number;
		userExperience: number;
	};
	optimization: {
		groupingOpportunities: Array<{
			widgets: string[];
			reason: string;
			benefit: string;
		}>;
		spacingIssues: Array<{
			area: { x: number; y: number; w: number; h: number };
			issue: string;
			solution: string;
		}>;
		redundancies: Array<{
			widgets: string[];
			type: 'duplicate' | 'overlapping' | 'unnecessary';
			suggestion: string;
		}>;
	};
}

export interface AIPreferences {
	enabled: boolean;
	autoSuggest: boolean;
	suggestionFrequency: 'never' | 'weekly' | 'daily' | 'on-change';
	preferredModel: 'gemini-pro' | 'claude-3' | 'gpt-4';
	contextSharing: {
		includeUsagePatterns: boolean;
		includePerformanceData: boolean;
		includeErrorLogs: boolean;
	};
	privacy: {
		anonymizeData: boolean;
		localProcessing: boolean;
		dataRetention: number; // days
	};
}

export interface AIFeedback {
	suggestionId: string;
	rating: 1 | 2 | 3 | 4 | 5;
	applied: boolean;
	comments?: string;
	improvements?: string[];
	timestamp: number;
}

// AI prompt templates
export interface AIPromptTemplate {
	id: string;
	name: string;
	description: string;
	template: string;
	variables: string[];
	category: 'layout' | 'optimization' | 'analysis' | 'custom';
	examples: Array<{
		input: any;
		output: any;
		description: string;
	}>;
}

// Constants
export const AI_MODELS = {
	GEMINI_PRO: 'gemini-pro' as const,
	CLAUDE_3: 'claude-3' as const,
	GPT_4: 'gpt-4' as const
};

export const AI_PRIORITIES = {
	PERFORMANCE: 'performance' as const,
	AESTHETICS: 'aesthetics' as const,
	FUNCTIONALITY: 'functionality' as const,
	BALANCED: 'balanced' as const
};

export const AI_DENSITIES = {
	COMPACT: 'compact' as const,
	SPACIOUS: 'spacious' as const,
	BALANCED: 'balanced' as const
};

export const AI_FOCUS_AREAS = {
	CPU: 'cpu' as const,
	GPU: 'gpu' as const,
	MEMORY: 'memory' as const,
	STORAGE: 'storage' as const,
	ALL: 'all' as const
};

export type AIModel = keyof typeof AI_MODELS;
export type AIPriority = keyof typeof AI_PRIORITIES;
export type AIDensity = keyof typeof AI_DENSITIES;
export type AIFocusArea = keyof typeof AI_FOCUS_AREAS;