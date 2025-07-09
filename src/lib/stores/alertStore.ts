// Alert system store (Svelte 5)
import { browser } from '$app/environment';
import { sensorStore } from './sensorStore.js';
import { notifications } from '$lib/utils/notifications.js';
import type { AlertCondition, Alert, AlertHistory } from '$lib/types/widget.js';

// Alert state
let alertConditions = $state<AlertCondition[]>([]);
let alertHistory = $state<Alert[]>([]);
let isEnabled = $state<boolean>(true);
let soundEnabled = $state<boolean>(true);
let notificationPermission = $state<NotificationPermission>('default');

// Storage keys
const STORAGE_KEY = 'sensecanvas_alerts';
const SETTINGS_KEY = 'sensecanvas_alert_settings';

// Alert checking
let isChecking = $state<boolean>(false);

export const alertStore = {
	// Getters
	get conditions() { return alertConditions; },
	get history() { return alertHistory; },
	get isEnabled() { return isEnabled; },
	get soundEnabled() { return soundEnabled; },
	get notificationPermission() { return notificationPermission; },
	get isChecking() { return isChecking; },

	// Condition management
	addCondition(condition: Omit<AlertCondition, 'id' | 'createdAt'>): AlertCondition {
		const newCondition: AlertCondition = {
			...condition,
			id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			createdAt: Date.now(),
			triggered: false,
			lastTriggered: null
		};

		alertConditions = [...alertConditions, newCondition];
		this.saveConditions();
		return newCondition;
	},

	updateCondition(id: string, updates: Partial<AlertCondition>): boolean {
		const index = alertConditions.findIndex(c => c.id === id);
		if (index === -1) return false;

		alertConditions[index] = {
			...alertConditions[index],
			...updates,
			id // Prevent ID from being changed
		};

		this.saveConditions();
		return true;
	},

	removeCondition(id: string): boolean {
		const initialLength = alertConditions.length;
		alertConditions = alertConditions.filter(c => c.id !== id);
		
		if (alertConditions.length < initialLength) {
			this.saveConditions();
			return true;
		}
		return false;
	},

	toggleCondition(id: string): boolean {
		const condition = alertConditions.find(c => c.id === id);
		if (!condition) return false;

		condition.enabled = !condition.enabled;
		this.saveConditions();
		return true;
	},

	// Alert checking
	startChecking() {
		if (isChecking) return;
		
		isChecking = true;
		this.checkAlerts();
	},

	stopChecking() {
		isChecking = false;
	},

	checkAlerts() {
		if (!isEnabled || !isChecking) return;

		$effect(() => {
			const currentData = sensorStore.data;
			const now = Date.now();
			
			alertConditions.forEach(condition => {
				if (!condition.enabled) return;

				const value = this.getSensorValue(currentData, condition.sensorPath);
				const shouldAlert = this.evaluateCondition(value, condition);
				
				// Check if enough time has passed since last trigger (prevent spam)
				const cooldownPassed = !condition.lastTriggered || 
					(now - condition.lastTriggered) > (condition.cooldown || 30000);

				if (shouldAlert && !condition.triggered && cooldownPassed) {
					this.triggerAlert(condition, value);
				} else if (!shouldAlert && condition.triggered) {
					// Reset trigger state when condition is no longer met
					condition.triggered = false;
					this.saveConditions();
				}
			});
		});
	},

	evaluateCondition(value: number, condition: AlertCondition): boolean {
		switch (condition.operator) {
			case 'greater':
				return value > condition.threshold;
			case 'less':
				return value < condition.threshold;
			case 'equal':
				return Math.abs(value - condition.threshold) < 0.01;
			case 'not_equal':
				return Math.abs(value - condition.threshold) >= 0.01;
			case 'greater_equal':
				return value >= condition.threshold;
			case 'less_equal':
				return value <= condition.threshold;
			default:
				return false;
		}
	},

	getSensorValue(data: any, path: string): number {
		const parts = path.split('.');
		let value: any = data;
		
		for (const part of parts) {
			if (value && typeof value === 'object' && part in value) {
				value = value[part];
			} else {
				return 0;
			}
		}
		
		return typeof value === 'number' ? value : 0;
	},

	async triggerAlert(condition: AlertCondition, value: number) {
		const now = Date.now();
		
		// Update condition state
		condition.triggered = true;
		condition.lastTriggered = now;
		
		// Create alert record
		const alert: Alert = {
			id: `alert-${now}-${Math.random().toString(36).substr(2, 9)}`,
			conditionId: condition.id,
			conditionName: condition.name,
			sensorPath: condition.sensorPath,
			value,
			threshold: condition.threshold,
			operator: condition.operator,
			severity: condition.severity,
			timestamp: now,
			acknowledged: false
		};

		// Add to history
		alertHistory = [alert, ...alertHistory.slice(0, 99)]; // Keep last 100 alerts
		
		// Show notification
		if (browser && notificationPermission === 'granted') {
			const title = `SenseCanvas Alert: ${condition.name}`;
			const body = `${condition.sensorPath} is ${value}${this.getUnit(condition.sensorPath)} (threshold: ${condition.threshold})`;
			
			notifications.show({
				title,
				body,
				icon: '/favicon.png',
				tag: condition.id,
				data: { alertId: alert.id }
			});
		}

		// Play sound if enabled
		if (soundEnabled && browser) {
			this.playAlertSound(condition.severity);
		}

		// Save state
		this.saveConditions();
		this.saveHistory();
	},

	getUnit(sensorPath: string): string {
		const pathParts = sensorPath.split('.');
		if (pathParts.length < 2) return '';
		
		const sensorType = pathParts[1];
		const unitMap: Record<string, string> = {
			temperature: '°C',
			usage: '%',
			frequency: 'MHz',
			voltage: 'V',
			fanSpeed: 'RPM',
			readSpeed: 'MB/s',
			writeSpeed: 'MB/s',
			available: 'GB',
			total: 'GB'
		};
		
		return unitMap[sensorType] || '';
	},

	playAlertSound(severity: 'info' | 'warning' | 'critical') {
		if (!browser) return;
		
		// Create audio context for alert sounds
		const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();
		
		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);
		
		// Different tones for different severities
		const frequencies = {
			info: 800,
			warning: 1000,
			critical: 1200
		};
		
		oscillator.frequency.value = frequencies[severity];
		oscillator.type = 'sine';
		
		gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
		
		oscillator.start();
		oscillator.stop(audioContext.currentTime + 0.5);
	},

	// History management
	acknowledgeAlert(alertId: string): boolean {
		const alert = alertHistory.find(a => a.id === alertId);
		if (!alert) return false;

		alert.acknowledged = true;
		this.saveHistory();
		return true;
	},

	clearHistory(): void {
		alertHistory = [];
		this.saveHistory();
	},

	getUnacknowledgedAlerts(): Alert[] {
		return alertHistory.filter(a => !a.acknowledged);
	},

	// Settings
	setEnabled(enabled: boolean): void {
		isEnabled = enabled;
		this.saveSettings();
		
		if (enabled) {
			this.startChecking();
		} else {
			this.stopChecking();
		}
	},

	setSoundEnabled(enabled: boolean): void {
		soundEnabled = enabled;
		this.saveSettings();
	},

	async requestNotificationPermission(): Promise<NotificationPermission> {
		if (!browser) return 'denied';
		
		if ('Notification' in window) {
			const permission = await Notification.requestPermission();
			notificationPermission = permission;
			this.saveSettings();
			return permission;
		}
		
		return 'denied';
	},

	// Persistence
	saveConditions(): void {
		if (!browser) return;
		
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(alertConditions));
		} catch (error) {
			console.error('Failed to save alert conditions:', error);
		}
	},

	saveHistory(): void {
		if (!browser) return;
		
		try {
			localStorage.setItem(`${STORAGE_KEY}_history`, JSON.stringify(alertHistory));
		} catch (error) {
			console.error('Failed to save alert history:', error);
		}
	},

	saveSettings(): void {
		if (!browser) return;
		
		try {
			const settings = {
				isEnabled,
				soundEnabled,
				notificationPermission
			};
			localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
		} catch (error) {
			console.error('Failed to save alert settings:', error);
		}
	},

	loadConditions(): void {
		if (!browser) return;
		
		try {
			const stored = localStorage.getItem(STORAGE_KEY);
			if (stored) {
				alertConditions = JSON.parse(stored);
			}
		} catch (error) {
			console.error('Failed to load alert conditions:', error);
		}
	},

	loadHistory(): void {
		if (!browser) return;
		
		try {
			const stored = localStorage.getItem(`${STORAGE_KEY}_history`);
			if (stored) {
				alertHistory = JSON.parse(stored);
			}
		} catch (error) {
			console.error('Failed to load alert history:', error);
		}
	},

	loadSettings(): void {
		if (!browser) return;
		
		try {
			const stored = localStorage.getItem(SETTINGS_KEY);
			if (stored) {
				const settings = JSON.parse(stored);
				isEnabled = settings.isEnabled ?? true;
				soundEnabled = settings.soundEnabled ?? true;
				notificationPermission = settings.notificationPermission ?? 'default';
			}
		} catch (error) {
			console.error('Failed to load alert settings:', error);
		}
	},

	// Initialize
	init(): void {
		if (!browser) return;
		
		this.loadConditions();
		this.loadHistory();
		this.loadSettings();
		
		// Check notification permission
		if ('Notification' in window) {
			notificationPermission = Notification.permission;
		}
		
		// Start checking if enabled
		if (isEnabled) {
			this.startChecking();
		}
	},

	// Testing
	testAlert(conditionId: string): void {
		const condition = alertConditions.find(c => c.id === conditionId);
		if (!condition) return;
		
		// Trigger a test alert
		this.triggerAlert(condition, condition.threshold + 1);
	}
};

// Initialize store
if (browser) {
	alertStore.init();
}