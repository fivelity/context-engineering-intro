// Desktop notification helper
import { browser } from '$app/environment';

export interface NotificationOptions {
	title: string;
	body: string;
	icon?: string;
	tag?: string;
	data?: any;
	requireInteraction?: boolean;
	silent?: boolean;
}

export const notifications = {
	// Check if notifications are supported
	get isSupported(): boolean {
		return browser && 'Notification' in window;
	},

	// Check current permission status
	get permission(): NotificationPermission {
		if (!this.isSupported) return 'denied';
		return Notification.permission;
	},

	// Request permission from user
	async requestPermission(): Promise<NotificationPermission> {
		if (!this.isSupported) return 'denied';
		
		try {
			const permission = await Notification.requestPermission();
			return permission;
		} catch (error) {
			console.error('Failed to request notification permission:', error);
			return 'denied';
		}
	},

	// Show a notification
	async show(options: NotificationOptions): Promise<Notification | null> {
		if (!this.isSupported) {
			console.warn('Notifications not supported');
			return null;
		}

		// Request permission if not already granted
		if (this.permission === 'default') {
			const permission = await this.requestPermission();
			if (permission !== 'granted') {
				console.warn('Notification permission not granted');
				return null;
			}
		}

		if (this.permission !== 'granted') {
			console.warn('Notification permission denied');
			return null;
		}

		try {
			const notification = new Notification(options.title, {
				body: options.body,
				icon: options.icon || '/favicon.png',
				tag: options.tag,
				data: options.data,
				requireInteraction: options.requireInteraction || false,
				silent: options.silent || false
			});

			// Auto-close after 5 seconds unless requireInteraction is true
			if (!options.requireInteraction) {
				setTimeout(() => {
					notification.close();
				}, 5000);
			}

			return notification;
		} catch (error) {
			console.error('Failed to show notification:', error);
			return null;
		}
	},

	// Show a success notification
	async showSuccess(message: string, title: string = 'Success'): Promise<Notification | null> {
		return this.show({
			title,
			body: message,
			icon: '/favicon.png',
			tag: 'success'
		});
	},

	// Show an error notification
	async showError(message: string, title: string = 'Error'): Promise<Notification | null> {
		return this.show({
			title,
			body: message,
			icon: '/favicon.png',
			tag: 'error',
			requireInteraction: true
		});
	},

	// Show a warning notification
	async showWarning(message: string, title: string = 'Warning'): Promise<Notification | null> {
		return this.show({
			title,
			body: message,
			icon: '/favicon.png',
			tag: 'warning'
		});
	},

	// Show an info notification
	async showInfo(message: string, title: string = 'Info'): Promise<Notification | null> {
		return this.show({
			title,
			body: message,
			icon: '/favicon.png',
			tag: 'info'
		});
	},

	// Show a sensor alert notification
	async showSensorAlert(sensorPath: string, value: number, threshold: number, unit: string = ''): Promise<Notification | null> {
		const title = 'SenseCanvas Alert';
		const body = `${sensorPath} is ${value}${unit} (threshold: ${threshold}${unit})`;
		
		return this.show({
			title,
			body,
			icon: '/favicon.png',
			tag: `alert-${sensorPath}`,
			data: { sensorPath, value, threshold, unit },
			requireInteraction: true
		});
	},

	// Close all notifications with a specific tag
	closeByTag(tag: string): void {
		// Note: There's no direct way to close notifications by tag
		// This would require tracking notifications manually
		console.info(`Closing notifications with tag: ${tag}`);
	},

	// Check if user has denied notifications and show fallback
	showFallback(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
		if (this.permission === 'granted') return;

		// Show browser alert as fallback
		if (browser) {
			const typeEmoji = {
				success: '✅',
				error: '❌',
				warning: '⚠️',
				info: 'ℹ️'
			};
			
			alert(`${typeEmoji[type]} ${message}`);
		}
	},

	// Test notification functionality
	async test(): Promise<boolean> {
		try {
			const notification = await this.show({
				title: 'SenseCanvas Test',
				body: 'This is a test notification to verify the notification system is working.',
				tag: 'test'
			});
			
			return notification !== null;
		} catch (error) {
			console.error('Notification test failed:', error);
			return false;
		}
	}
};

// Export individual functions for convenience
export const {
	requestPermission,
	show,
	showSuccess,
	showError,
	showWarning,
	showInfo,
	showSensorAlert,
	test
} = notifications;