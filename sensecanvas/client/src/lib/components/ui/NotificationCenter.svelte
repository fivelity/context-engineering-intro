<!--
SenseCanvas Notification Center Component
Displays alert notifications with auto-dismiss and actions
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message?: string;
    duration?: number;
    actions?: Array<{
      label: string;
      action: () => void;
    }>;
    timestamp: number;
  }

  interface Props {
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    maxNotifications?: number;
  }

  let {
    position = 'top-right',
    maxNotifications = 5
  }: Props = $props();

  const dispatch = createEventDispatcher<{
    dismiss: string;
    action: { notificationId: string; actionIndex: number };
  }>();

  // ✅ Using Svelte 5 runes for notification state
  let notifications = $state<Notification[]>([]);
  let timers = $state<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  };

  // Icon paths for notification types
  const icons = {
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
  };

  // Type colors
  const typeColors = {
    info: 'bg-info border-info text-info',
    success: 'bg-success border-success text-success',
    warning: 'bg-warning border-warning text-warning',
    error: 'bg-error border-error text-error'
  };

  // ✅ Derived visible notifications
  let visibleNotifications = $derived(
    notifications.slice(0, maxNotifications)
  );

  // Add notification
  export function addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      duration: notification.duration ?? 5000
    };

    notifications = [newNotification, ...notifications];

    // Set auto-dismiss timer if duration is specified
    if (newNotification.duration && newNotification.duration > 0) {
      const timer = setTimeout(() => {
        dismissNotification(id);
      }, newNotification.duration);

      timers.set(id, timer);
    }

    return id;
  }

  // Dismiss notification
  export function dismissNotification(id: string) {
    notifications = notifications.filter(n => n.id !== id);
    
    // Clear timer if exists
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.delete(id);
    }

    dispatch('dismiss', id);
  }

  // Dismiss all notifications
  export function dismissAll() {
    notifications = [];
    
    // Clear all timers
    timers.forEach(timer => clearTimeout(timer));
    timers.clear();
  }

  // Handle notification action
  function handleAction(notification: Notification, actionIndex: number) {
    const action = notification.actions?.[actionIndex];
    if (action) {
      action.action();
      dispatch('action', { notificationId: notification.id, actionIndex });
    }
  }

  // ✅ Cleanup timers on unmount
  $effect(() => {
    return () => {
      timers.forEach(timer => clearTimeout(timer));
      timers.clear();
    };
  });
</script>

<div class="notification-container {positionClasses[position]}">
  {#each visibleNotifications as notification (notification.id)}
    <div 
      class="notification {typeColors[notification.type]}"
      role="alert"
      aria-live={notification.type === 'error' ? 'assertive' : 'polite'}
    >
      <div class="notification-icon">
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d={icons[notification.type]}
          />
        </svg>
      </div>

      <div class="notification-content">
        <h4 class="notification-title">{notification.title}</h4>
        {#if notification.message}
          <p class="notification-message">{notification.message}</p>
        {/if}
        
        {#if notification.actions && notification.actions.length > 0}
          <div class="notification-actions">
            {#each notification.actions as action, index}
              <button
                type="button"
                class="notification-action"
                onclick={() => handleAction(notification, index)}
              >
                {action.label}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <button
        type="button"
        class="notification-close"
        onclick={() => dismissNotification(notification.id)}
        aria-label="Dismiss notification"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  {/each}
</div>

<style>
  .notification-container {
    position: fixed;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 24rem;
    width: 100%;
    pointer-events: none;
  }

  .notification {
    position: relative;
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid;
    animation: slide-in-from-top-2 0.3s ease-out;
    pointer-events: auto;
  }

  .notification-icon {
    flex-shrink: 0;
  }

  .notification-content {
    flex: 1;
    min-width: 0;
  }

  .notification-title {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--color-text);
  }

  .notification-message {
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: var(--color-textSecondary);
  }

  .notification-actions {
    margin-top: 0.75rem;
    display: flex;
    gap: 0.5rem;
  }

  .notification-action {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    font-weight: 500;
    border-radius: 0.375rem;
    background-color: rgba(var(--color-primary), 0.1);
    color: var(--color-primary);
    transition: background-color 0.2s ease;
    border: none;
    cursor: pointer;
  }

  .notification-action:hover {
    background-color: rgba(var(--color-primary), 0.2);
  }

  .notification-action:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary);
  }

  .notification-close {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    padding: 0.25rem;
    border-radius: 0.375rem;
    color: var(--color-textSecondary);
    transition: color 0.2s ease, background-color 0.2s ease;
    border: none;
    cursor: pointer;
  }

  .notification-close:hover {
    color: var(--color-text);
    background-color: var(--color-surface);
  }

  .notification-close:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--color-primary);
  }

  /* Animation utilities */
  @keyframes slide-in-from-top-2 {
    from {
      transform: translateY(-0.5rem);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-in {
    animation-fill-mode: both;
  }

  .slide-in-from-top-2 {
    animation-name: slide-in-from-top-2;
  }

  /* Type-specific colors using CSS custom properties */
  .bg-info {
    background-color: var(--color-info);
  }

  .border-info {
    border-color: var(--color-info);
  }

  .text-info {
    color: var(--color-info);
  }

  .bg-success {
    background-color: var(--color-success);
  }

  .border-success {
    border-color: var(--color-success);
  }

  .text-success {
    color: var(--color-success);
  }

  .bg-warning {
    background-color: var(--color-warning);
  }

  .border-warning {
    border-color: var(--color-warning);
  }

  .text-warning {
    color: var(--color-warning);
  }

  .bg-error {
    background-color: var(--color-error);
  }

  .border-error {
    border-color: var(--color-error);
  }

  .text-error {
    color: var(--color-error);
  }
</style>