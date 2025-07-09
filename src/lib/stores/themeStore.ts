// Theme management store (Svelte 5)
import { browser } from '$app/environment';
import type { Theme, ThemeConfig } from '$lib/types/theme.js';

// Theme state
let currentTheme = $state<Theme>('dark');
let autoTheme = $state<boolean>(true);
let themeConfig = $state<ThemeConfig>({
	colorScheme: 'system',
	sensorColors: {
		temperature: ['#22c55e', '#f59e0b', '#ef4444'],
		usage: ['#3b82f6', '#8b5cf6', '#ec4899'],
		voltage: ['#06b6d4', '#0891b2', '#0e7490'],
		fan: ['#84cc16', '#65a30d', '#4d7c0f']
	},
	customColors: {
		primary: '#3b82f6',
		secondary: '#10b981',
		accent: '#f59e0b',
		warning: '#f97316',
		error: '#ef4444',
		success: '#22c55e'
	},
	fontSize: 'base',
	fontFamily: 'system',
	borderRadius: 'medium',
	animations: true
});

// Theme presets
const themePresets = {
	system: {
		name: 'System',
		description: 'Follow system theme preference',
		colorScheme: 'system' as const
	},
	light: {
		name: 'Light',
		description: 'Light theme optimized for daytime use',
		colorScheme: 'light' as const
	},
	dark: {
		name: 'Dark',
		description: 'Dark theme optimized for nighttime use',
		colorScheme: 'dark' as const
	},
	highContrast: {
		name: 'High Contrast',
		description: 'High contrast theme for accessibility',
		colorScheme: 'dark' as const,
		customColors: {
			primary: '#ffffff',
			secondary: '#ffffff',
			accent: '#ffffff',
			warning: '#ffff00',
			error: '#ff0000',
			success: '#00ff00'
		}
	}
};

// Storage keys
const THEME_STORAGE_KEY = 'sensecanvas_theme';
const THEME_CONFIG_STORAGE_KEY = 'sensecanvas_theme_config';

export const themeStore = {
	// Getters
	get theme() { return currentTheme; },
	get config() { return themeConfig; },
	get presets() { return themePresets; },
	get isAuto() { return autoTheme; },
	get isDark() { return currentTheme === 'dark'; },
	get isLight() { return currentTheme === 'light'; },

	// Theme management
	setTheme(theme: Theme) {
		currentTheme = theme;
		autoTheme = false;
		this.applyTheme();
		this.saveTheme();
	},

	toggleTheme() {
		const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
		this.setTheme(newTheme);
	},

	setAutoTheme(enabled: boolean) {
		autoTheme = enabled;
		if (enabled) {
			this.detectSystemTheme();
		}
		this.saveTheme();
	},

	detectSystemTheme() {
		if (!browser) return;
		
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const systemTheme = mediaQuery.matches ? 'dark' : 'light';
		
		if (autoTheme) {
			currentTheme = systemTheme;
			this.applyTheme();
		}
	},

	// Theme configuration
	updateConfig(newConfig: Partial<ThemeConfig>) {
		themeConfig = { ...themeConfig, ...newConfig };
		this.applyTheme();
		this.saveConfig();
	},

	setSensorColors(sensorType: keyof ThemeConfig['sensorColors'], colors: string[]) {
		themeConfig.sensorColors[sensorType] = colors;
		this.applyTheme();
		this.saveConfig();
	},

	setCustomColor(colorKey: keyof ThemeConfig['customColors'], color: string) {
		themeConfig.customColors[colorKey] = color;
		this.applyTheme();
		this.saveConfig();
	},

	// Apply theme to DOM
	applyTheme() {
		if (!browser) return;

		const root = document.documentElement;
		
		// Set theme attribute
		root.setAttribute('data-theme', currentTheme);

		// Apply custom colors
		const colors = themeConfig.customColors;
		root.style.setProperty('--theme-primary', colors.primary);
		root.style.setProperty('--theme-secondary', colors.secondary);
		root.style.setProperty('--theme-accent', colors.accent);
		root.style.setProperty('--theme-warning', colors.warning);
		root.style.setProperty('--theme-error', colors.error);
		root.style.setProperty('--theme-success', colors.success);

		// Apply sensor colors
		const sensorColors = themeConfig.sensorColors;
		Object.entries(sensorColors).forEach(([sensorType, colors]) => {
			colors.forEach((color, index) => {
				root.style.setProperty(`--sensor-${sensorType}-${index}`, color);
			});
		});

		// Apply typography
		const fontSizes = {
			small: '0.875rem',
			base: '1rem',
			large: '1.125rem'
		};
		root.style.setProperty('--theme-font-size', fontSizes[themeConfig.fontSize]);

		// Apply border radius
		const borderRadius = {
			none: '0',
			small: '0.25rem',
			medium: '0.5rem',
			large: '0.75rem',
			full: '9999px'
		};
		root.style.setProperty('--theme-border-radius', borderRadius[themeConfig.borderRadius]);

		// Apply animations
		if (!themeConfig.animations) {
			root.style.setProperty('--theme-transition', 'none');
		} else {
			root.style.setProperty('--theme-transition', 'all 0.2s ease');
		}
	},

	// Persistence
	saveTheme() {
		if (!browser) return;
		
		const themeData = {
			theme: currentTheme,
			auto: autoTheme
		};
		
		localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeData));
	},

	saveConfig() {
		if (!browser) return;
		localStorage.setItem(THEME_CONFIG_STORAGE_KEY, JSON.stringify(themeConfig));
	},

	loadTheme() {
		if (!browser) return;

		try {
			const stored = localStorage.getItem(THEME_STORAGE_KEY);
			if (stored) {
				const { theme, auto } = JSON.parse(stored);
				currentTheme = theme;
				autoTheme = auto;
			}
		} catch (error) {
			console.error('Failed to load theme:', error);
		}

		// Load config
		try {
			const storedConfig = localStorage.getItem(THEME_CONFIG_STORAGE_KEY);
			if (storedConfig) {
				const loadedConfig = JSON.parse(storedConfig);
				themeConfig = { ...themeConfig, ...loadedConfig };
			}
		} catch (error) {
			console.error('Failed to load theme config:', error);
		}

		// Apply loaded theme
		this.applyTheme();

		// Set up system theme detection
		if (autoTheme) {
			this.detectSystemTheme();
			this.setupSystemThemeListener();
		}
	},

	setupSystemThemeListener() {
		if (!browser) return;

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', () => {
			if (autoTheme) {
				this.detectSystemTheme();
			}
		});
	},

	// Theme utilities
	getThemeColors(theme: Theme = currentTheme) {
		const colors = {
			light: {
				surface: {
					50: '#fafafa',
					100: '#f5f5f5',
					200: '#e5e5e5',
					300: '#d4d4d4',
					400: '#a3a3a3',
					500: '#737373',
					600: '#525252',
					700: '#404040',
					800: '#262626',
					900: '#171717'
				},
				text: {
					primary: '#171717',
					secondary: '#525252'
				}
			},
			dark: {
				surface: {
					50: '#171717',
					100: '#262626',
					200: '#404040',
					300: '#525252',
					400: '#737373',
					500: '#a3a3a3',
					600: '#d4d4d4',
					700: '#e5e5e5',
					800: '#f5f5f5',
					900: '#fafafa'
				},
				text: {
					primary: '#fafafa',
					secondary: '#d4d4d4'
				}
			}
		};

		return colors[theme];
	},

	getSensorColor(sensorType: keyof ThemeConfig['sensorColors'], value: number, max: number = 100) {
		const colors = themeConfig.sensorColors[sensorType];
		if (!colors || colors.length === 0) return colors[0];

		const percentage = (value / max) * 100;
		
		if (percentage < 33) return colors[0]; // Low
		if (percentage < 66) return colors[1]; // Medium
		return colors[2]; // High
	},

	// Export/Import
	exportTheme() {
		return {
			theme: currentTheme,
			auto: autoTheme,
			config: themeConfig
		};
	},

	importTheme(themeData: any) {
		try {
			if (themeData.theme) currentTheme = themeData.theme;
			if (typeof themeData.auto === 'boolean') autoTheme = themeData.auto;
			if (themeData.config) themeConfig = { ...themeConfig, ...themeData.config };
			
			this.applyTheme();
			this.saveTheme();
			this.saveConfig();
		} catch (error) {
			console.error('Failed to import theme:', error);
		}
	},

	// Reset to defaults
	resetTheme() {
		currentTheme = 'dark';
		autoTheme = true;
		themeConfig = {
			colorScheme: 'system',
			sensorColors: {
				temperature: ['#22c55e', '#f59e0b', '#ef4444'],
				usage: ['#3b82f6', '#8b5cf6', '#ec4899'],
				voltage: ['#06b6d4', '#0891b2', '#0e7490'],
				fan: ['#84cc16', '#65a30d', '#4d7c0f']
			},
			customColors: {
				primary: '#3b82f6',
				secondary: '#10b981',
				accent: '#f59e0b',
				warning: '#f97316',
				error: '#ef4444',
				success: '#22c55e'
			},
			fontSize: 'base',
			fontFamily: 'system',
			borderRadius: 'medium',
			animations: true
		};
		
		this.applyTheme();
		this.saveTheme();
		this.saveConfig();
	}
};

// Initialize theme on load
if (browser) {
	themeStore.loadTheme();
}