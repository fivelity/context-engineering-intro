// Theme system types
export interface Theme {
	name: string;
	displayName: string;
	type: 'light' | 'dark' | 'auto';
	colors: ThemeColors;
	typography: ThemeTypography;
	spacing: ThemeSpacing;
	borderRadius: ThemeBorderRadius;
	shadows: ThemeShadows;
	animations: ThemeAnimations;
}

export interface ThemeColors {
	// Primary colors
	primary: {
		50: string;
		100: string;
		200: string;
		300: string;
		400: string;
		500: string;
		600: string;
		700: string;
		800: string;
		900: string;
	};
	
	// Secondary colors
	secondary: {
		50: string;
		100: string;
		200: string;
		300: string;
		400: string;
		500: string;
		600: string;
		700: string;
		800: string;
		900: string;
	};
	
	// Surface colors
	surface: {
		50: string;
		100: string;
		200: string;
		300: string;
		400: string;
		500: string;
		600: string;
		700: string;
		800: string;
		900: string;
	};
	
	// Sensor-specific colors
	thermal: {
		low: string;
		medium: string;
		high: string;
		critical: string;
	};
	
	performance: {
		low: string;
		medium: string;
		high: string;
		optimal: string;
	};
	
	// Status colors
	success: string;
	warning: string;
	error: string;
	info: string;
	
	// Text colors
	text: {
		primary: string;
		secondary: string;
		tertiary: string;
		inverse: string;
	};
	
	// Border colors
	border: {
		light: string;
		medium: string;
		heavy: string;
	};
}

export interface ThemeTypography {
	fontFamily: {
		sans: string[];
		mono: string[];
		display: string[];
	};
	
	fontSize: {
		xs: string;
		sm: string;
		base: string;
		lg: string;
		xl: string;
		'2xl': string;
		'3xl': string;
		'4xl': string;
	};
	
	fontWeight: {
		light: number;
		normal: number;
		medium: number;
		semibold: number;
		bold: number;
	};
	
	lineHeight: {
		tight: number;
		normal: number;
		relaxed: number;
	};
}

export interface ThemeSpacing {
	xs: string;
	sm: string;
	md: string;
	lg: string;
	xl: string;
	'2xl': string;
	'3xl': string;
	'4xl': string;
}

export interface ThemeBorderRadius {
	none: string;
	sm: string;
	md: string;
	lg: string;
	xl: string;
	full: string;
}

export interface ThemeShadows {
	sm: string;
	md: string;
	lg: string;
	xl: string;
	'2xl': string;
	inner: string;
}

export interface ThemeAnimations {
	duration: {
		fast: string;
		normal: string;
		slow: string;
	};
	
	easing: {
		linear: string;
		ease: string;
		'ease-in': string;
		'ease-out': string;
		'ease-in-out': string;
	};
}

export interface ThemePreferences {
	selectedTheme: string;
	autoTheme: boolean;
	systemTheme: boolean;
	customThemes: CustomTheme[];
	preferences: {
		highContrast: boolean;
		reduceMotion: boolean;
		largeText: boolean;
		colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
	};
}

export interface CustomTheme extends Theme {
	id: string;
	createdAt: number;
	updatedAt: number;
	author?: string;
	description?: string;
	tags: string[];
	isPublic: boolean;
}

export interface ThemeExport {
	version: string;
	theme: CustomTheme;
	timestamp: number;
	metadata: {
		source: string;
		author?: string;
		description?: string;
	};
}

// Predefined themes
export const SKELETON_THEME: Theme = {
	name: 'skeleton',
	displayName: 'Skeleton',
	type: 'light',
	colors: {
		primary: {
			50: '#fef7ff',
			100: '#fdeeff',
			200: '#fbd5ff',
			300: '#f7aaff',
			400: '#f074ff',
			500: '#e534ff',
			600: '#d014ff',
			700: '#b300e0',
			800: '#9200b7',
			900: '#780095'
		},
		secondary: {
			50: '#f0fdff',
			100: '#ccf7fe',
			200: '#9aeffc',
			300: '#58e1f8',
			400: '#0ec9f0',
			500: '#00aed6',
			600: '#058bb5',
			700: '#0c6f92',
			800: '#135877',
			900: '#164965'
		},
		surface: {
			50: '#f8fafc',
			100: '#f1f5f9',
			200: '#e2e8f0',
			300: '#cbd5e1',
			400: '#94a3b8',
			500: '#64748b',
			600: '#475569',
			700: '#334155',
			800: '#1e293b',
			900: '#0f172a'
		},
		thermal: {
			low: '#22c55e',
			medium: '#eab308',
			high: '#f97316',
			critical: '#ef4444'
		},
		performance: {
			low: '#06b6d4',
			medium: '#3b82f6',
			high: '#8b5cf6',
			optimal: '#10b981'
		},
		success: '#22c55e',
		warning: '#eab308',
		error: '#ef4444',
		info: '#3b82f6',
		text: {
			primary: '#0f172a',
			secondary: '#64748b',
			tertiary: '#94a3b8',
			inverse: '#f8fafc'
		},
		border: {
			light: '#e2e8f0',
			medium: '#cbd5e1',
			heavy: '#94a3b8'
		}
	},
	typography: {
		fontFamily: {
			sans: ['Inter', 'system-ui', 'sans-serif'],
			mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
			display: ['Inter', 'system-ui', 'sans-serif']
		},
		fontSize: {
			xs: '0.75rem',
			sm: '0.875rem',
			base: '1rem',
			lg: '1.125rem',
			xl: '1.25rem',
			'2xl': '1.5rem',
			'3xl': '1.875rem',
			'4xl': '2.25rem'
		},
		fontWeight: {
			light: 300,
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700
		},
		lineHeight: {
			tight: 1.25,
			normal: 1.5,
			relaxed: 1.75
		}
	},
	spacing: {
		xs: '0.25rem',
		sm: '0.5rem',
		md: '1rem',
		lg: '1.5rem',
		xl: '2rem',
		'2xl': '3rem',
		'3xl': '4rem',
		'4xl': '6rem'
	},
	borderRadius: {
		none: '0px',
		sm: '0.25rem',
		md: '0.375rem',
		lg: '0.5rem',
		xl: '0.75rem',
		full: '9999px'
	},
	shadows: {
		sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
		md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
		lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
		xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
		'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
		inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
	},
	animations: {
		duration: {
			fast: '150ms',
			normal: '250ms',
			slow: '500ms'
		},
		easing: {
			linear: 'linear',
			ease: 'ease',
			'ease-in': 'ease-in',
			'ease-out': 'ease-out',
			'ease-in-out': 'ease-in-out'
		}
	}
};

// Theme constants
export const THEME_TYPES = {
	LIGHT: 'light' as const,
	DARK: 'dark' as const,
	AUTO: 'auto' as const
};

export const COLOR_BLIND_MODES = {
	NONE: 'none' as const,
	PROTANOPIA: 'protanopia' as const,
	DEUTERANOPIA: 'deuteranopia' as const,
	TRITANOPIA: 'tritanopia' as const
};

export type ThemeType = keyof typeof THEME_TYPES;
export type ColorBlindMode = keyof typeof COLOR_BLIND_MODES;