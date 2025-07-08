// Utility for conditional class name generation
export type ClassValue = string | number | boolean | undefined | null | ClassValue[] | Record<string, any>;

/**
 * Conditionally joins class names together
 * Similar to the popular 'clsx' library
 */
export function cls(...inputs: ClassValue[]): string {
	const classes: string[] = [];

	for (const input of inputs) {
		if (!input) continue;

		if (typeof input === 'string' || typeof input === 'number') {
			classes.push(String(input));
		} else if (Array.isArray(input)) {
			const nested = cls(...input);
			if (nested) classes.push(nested);
		} else if (typeof input === 'object') {
			for (const [key, value] of Object.entries(input)) {
				if (value) classes.push(key);
			}
		}
	}

	return classes.join(' ');
}

/**
 * Creates a class name for sensor values based on thresholds
 */
export function getSensorClass(
	value: number, 
	thresholds: { low: number; medium: number; high: number },
	prefix: string = 'sensor-value'
): string {
	let severity = 'low';
	
	if (value >= thresholds.high) {
		severity = 'high';
	} else if (value >= thresholds.medium) {
		severity = 'medium';
	}
	
	return `${prefix} ${prefix}-${severity}`;
}

/**
 * Creates theme-aware class names
 */
export function getThemeClass(
	baseClass: string,
	theme: 'light' | 'dark' | 'auto' = 'auto'
): string {
	if (theme === 'auto') {
		return `${baseClass} ${baseClass}-light dark:${baseClass}-dark`;
	}
	
	return `${baseClass} ${baseClass}-${theme}`;
}

/**
 * Creates responsive class names
 */
export function getResponsiveClass(
	baseClass: string,
	breakpoints: {
		sm?: string;
		md?: string;
		lg?: string;
		xl?: string;
	} = {}
): string {
	const classes = [baseClass];
	
	for (const [breakpoint, className] of Object.entries(breakpoints)) {
		if (className) {
			classes.push(`${breakpoint}:${className}`);
		}
	}
	
	return classes.join(' ');
}

/**
 * Creates state-based class names for widgets
 */
export function getWidgetStateClass(
	baseClass: string,
	state: {
		selected?: boolean;
		dragging?: boolean;
		resizing?: boolean;
		error?: boolean;
		loading?: boolean;
		readonly?: boolean;
	}
): string {
	return cls(baseClass, {
		[`${baseClass}--selected`]: state.selected,
		[`${baseClass}--dragging`]: state.dragging,
		[`${baseClass}--resizing`]: state.resizing,
		[`${baseClass}--error`]: state.error,
		[`${baseClass}--loading`]: state.loading,
		[`${baseClass}--readonly`]: state.readonly
	});
}

// Export as default for convenience
export default cls;