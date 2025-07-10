/**
 * Notification Service - Desktop notifications and alert system
 * Handles Web Notifications API integration with sensor alerts
 */

import { SensorPath } from '../types/sensor';
import { formatSensorValue } from '../stores/sensorStore';

export interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  priority?: 'low' | 'normal' | 'high';
  requireInteraction?: boolean;
  silent?: boolean;
  vibrate?: number[];
  actions?: NotificationAction[];
  data?: any;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface SensorAlert {
  id: string;
  sensorPath: SensorPath;
  value: number;
  threshold: number;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: number;
  acknowledged: boolean;
}

export type NotificationPermission = 'granted' | 'denied' | 'default';

class NotificationService {
  private permission: NotificationPermission = 'default';
  private notifications: Map<string, Notification> = new Map();
  private alerts: Map<string, SensorAlert> = new Map();
  private soundEnabled = true;
  private vibrationEnabled = true;
  private isInitialized = false;

  // Sound files for different alert types
  private sounds = {
    warning: '/sounds/warning.wav',
    critical: '/sounds/critical.wav',
    info: '/sounds/info.wav'
  };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if ('Notification' in window) {
      this.permission = Notification.permission as NotificationPermission;
      
      // Request permission if not granted
      if (this.permission === 'default') {
        this.permission = await Notification.requestPermission() as NotificationPermission;
      }
      
      this.isInitialized = true;
      
      // Load user preferences
      this.loadPreferences();
      
      // Setup service worker for persistent notifications
      this.setupServiceWorker();
    } else {
      console.warn('Web Notifications API not supported');
    }
  }

  private loadPreferences() {
    try {
      const prefs = localStorage.getItem('notification-preferences');
      if (prefs) {
        const parsed = JSON.parse(prefs);
        this.soundEnabled = parsed.soundEnabled ?? true;
        this.vibrationEnabled = parsed.vibrationEnabled ?? true;
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }
  }

  private savePreferences() {
    try {
      const prefs = {
        soundEnabled: this.soundEnabled,
        vibrationEnabled: this.vibrationEnabled
      };
      localStorage.setItem('notification-preferences', JSON.stringify(prefs));
    } catch (error) {
      console.warn('Failed to save notification preferences:', error);
    }
  }

  private async setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        console.log('Service Worker ready for notifications:', registration);
      } catch (error) {
        console.warn('Service Worker not available:', error);
      }
    }
  }

  /**
   * Show a desktop notification
   */
  async show(config: NotificationConfig): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error('Notifications not available');
    }

    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const notification = new Notification(config.title, {
        body: config.body,
        icon: config.icon || '/icons/notification-icon.png',
        badge: config.badge || '/icons/badge.png',
        tag: config.tag || id,
        requireInteraction: config.requireInteraction || false,
        silent: config.silent || false,
        // vibrate: this.vibrationEnabled ? (config.vibrate || [200, 100, 200]) : undefined, // Not supported in all browsers
        // actions: config.actions || [], // Not supported in all browsers
        data: config.data || {}
      });

      // Handle notification events
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        this.handleNotificationClick(id, config);
      };

      notification.onerror = (error) => {
        console.error('Notification error:', error);
        this.notifications.delete(id);
      };

      notification.onclose = () => {
        this.notifications.delete(id);
      };

      this.notifications.set(id, notification);

      // Play sound if enabled
      if (this.soundEnabled && !config.silent) {
        this.playSound(config.priority || 'normal');
      }

      return id;
    } catch (error) {
      console.error('Failed to show notification:', error);
      throw error;
    }
  }

  /**
   * Show sensor alert notification
   */
  async showSensorAlert(
    sensorPath: SensorPath,
    value: number,
    threshold: number,
    type: 'warning' | 'critical' = 'warning'
  ): Promise<string> {
    const alert: SensorAlert = {
      id: `alert-${sensorPath}-${Date.now()}`,
      sensorPath,
      value,
      threshold,
      type,
      message: this.formatAlertMessage(sensorPath, value, threshold, type),
      timestamp: Date.now(),
      acknowledged: false
    };

    this.alerts.set(alert.id, alert);

    const config: NotificationConfig = {
      title: `Sensor Alert: ${type.toUpperCase()}`,
      body: alert.message,
      icon: this.getAlertIcon(type),
      tag: `sensor-alert-${sensorPath}`,
      priority: type === 'critical' ? 'high' : 'normal',
      requireInteraction: type === 'critical',
      actions: [
        {
          action: 'acknowledge',
          title: 'Acknowledge',
          icon: '/icons/check.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/icons/dismiss.png'
        }
      ],
      data: {
        alertId: alert.id,
        sensorPath,
        type
      }
    };

    const notificationId = await this.show(config);
    
    // Store alert-notification mapping
    alert.id = notificationId;
    this.alerts.set(notificationId, alert);

    return notificationId;
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      this.alerts.set(alertId, alert);
      this.closeNotification(alertId);
      return true;
    }
    return false;
  }

  /**
   * Close a notification
   */
  closeNotification(id: string): boolean {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.close();
      this.notifications.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Close all notifications
   */
  closeAll(): void {
    this.notifications.forEach((notification) => {
      notification.close();
    });
    this.notifications.clear();
  }

  /**
   * Get all active alerts
   */
  getAlerts(): SensorAlert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get unacknowledged alerts
   */
  getUnacknowledgedAlerts(): SensorAlert[] {
    return Array.from(this.alerts.values()).filter(alert => !alert.acknowledged);
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    const toDelete: string[] = [];

    this.alerts.forEach((alert, id) => {
      if (now - alert.timestamp > maxAge) {
        toDelete.push(id);
      }
    });

    toDelete.forEach(id => {
      this.alerts.delete(id);
      this.closeNotification(id);
    });
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      this.permission = await Notification.requestPermission() as NotificationPermission;
      return this.permission;
    }
    return 'denied';
  }

  /**
   * Check if notifications are available
   */
  isAvailable(): boolean {
    return this.isInitialized && this.permission === 'granted';
  }

  /**
   * Get current permission status
   */
  getPermission(): NotificationPermission {
    return this.permission;
  }

  /**
   * Enable/disable sound
   */
  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
    this.savePreferences();
  }

  /**
   * Enable/disable vibration
   */
  setVibrationEnabled(enabled: boolean): void {
    this.vibrationEnabled = enabled;
    this.savePreferences();
  }

  /**
   * Test notification
   */
  async testNotification(): Promise<void> {
    await this.show({
      title: 'SenseCanvas Test',
      body: 'Desktop notifications are working correctly!',
      icon: '/icons/test-icon.png',
      tag: 'test-notification'
    });
  }

  private formatAlertMessage(
    sensorPath: SensorPath,
    value: number,
    threshold: number,
    type: 'warning' | 'critical'
  ): string {
    const formattedValue = formatSensorValue(sensorPath, value);
    const formattedThreshold = formatSensorValue(sensorPath, threshold);
    
    const sensorName = this.getSensorDisplayName(sensorPath);
    
    switch (type) {
      case 'critical':
        return `${sensorName} is critically high: ${formattedValue} (threshold: ${formattedThreshold})`;
      case 'warning':
        return `${sensorName} is above warning level: ${formattedValue} (threshold: ${formattedThreshold})`;
      default:
        return `${sensorName}: ${formattedValue}`;
    }
  }

  private getSensorDisplayName(sensorPath: SensorPath): string {
    const parts = sensorPath.split('.');
    const component = parts[0] || 'Unknown';
    const property = parts[parts.length - 1] || 'Unknown';
    
    const componentNames: Record<string, string> = {
      cpu: 'CPU',
      gpu: 'GPU',
      memory: 'Memory',
      storage: 'Storage',
      fans: 'Fan',
      voltages: 'Voltage',
      motherboard: 'Motherboard',
      network: 'Network'
    };
    
    const propertyNames: Record<string, string> = {
      usage: 'Usage',
      temperature: 'Temperature',
      frequency: 'Frequency',
      voltage: 'Voltage',
      power: 'Power',
      rpm: 'RPM',
      percentage: 'Speed'
    };
    
    return `${componentNames[component] || component} ${propertyNames[property] || property}`;
  }

  private getAlertIcon(type: 'warning' | 'critical' | 'info'): string {
    const icons = {
      warning: '/icons/warning.png',
      critical: '/icons/critical.png',
      info: '/icons/info.png'
    };
    return icons[type] || icons.info;
  }

  private playSound(priority: string): void {
    if (!this.soundEnabled) return;

    try {
      const soundFile = priority === 'high' ? this.sounds.critical : this.sounds.warning;
      const audio = new Audio(soundFile);
      audio.volume = 0.3;
      audio.play().catch(error => {
        console.warn('Failed to play notification sound:', error);
      });
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  private handleNotificationClick(id: string, config: NotificationConfig): void {
    const alert = this.alerts.get(id);
    
    if (alert) {
      // Handle sensor alert click
      this.acknowledgeAlert(id);
      
      // Navigate to sensor in dashboard
      const event = new CustomEvent('sensor-alert-clicked', {
        detail: {
          sensorPath: alert.sensorPath,
          alertId: id
        }
      });
      window.dispatchEvent(event);
    }
    
    // Custom click handler
    if (config.data?.onClick) {
      config.data.onClick(id, config);
    }
  }

  /**
   * Get notification statistics
   */
  getStats() {
    const alerts = Array.from(this.alerts.values());
    return {
      total: alerts.length,
      acknowledged: alerts.filter(a => a.acknowledged).length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
      byType: {
        warning: alerts.filter(a => a.type === 'warning').length,
        critical: alerts.filter(a => a.type === 'critical').length,
        info: alerts.filter(a => a.type === 'info').length
      },
      active: this.notifications.size
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;