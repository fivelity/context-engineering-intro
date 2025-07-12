<!--
SenseCanvas Notification Center Component
Displays alert notifications with auto-dismiss and actions
-->

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export interface Notification {
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
  let visibleNotifications = $derived(() => 
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
                on:click={() => handleAction(notification, index)}
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
        on:click={() => dismissNotification(notification.id)}
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
    @apply fixed z-50;
    @apply flex flex-col gap-4;
    @apply max-w-sm w-full;
    pointer-events: none;
  }

  .notification {
    @apply relative flex gap-3 p-4;
    @apply rounded-lg shadow-lg;
    @apply bg-opacity-10 border;
    @apply animate-in slide-in-from-top-2 duration-300;
    pointer-events: auto;
  }

  .notification-icon {
    @apply flex-shrink-0;
  }

  .notification-content {
    @apply flex-1 min-w-0;
  }

  .notification-title {
    @apply font-semibold text-sm;
    @apply text-text;
  }

  .notification-message {
    @apply mt-1 text-sm;
    @apply text-text-secondary;
  }

  .notification-actions {
    @apply mt-3 flex gap-2;
  }

  .notification-action {
    @apply px-3 py-1 text-sm font-medium;
    @apply rounded-md;
    @apply bg-primary bg-opacity-10 text-primary;
    @apply hover:bg-opacity-20 transition-colors;
    @apply focus:outline-none focus:ring-2 focus:ring-primary;
  }

  .notification-close {
    @apply absolute top-2 right-2;
    @apply p-1 rounded-md;
    @apply text-text-secondary hover:text-text;
    @apply hover:bg-surface transition-colors;
    @apply focus:outline-none focus:ring-2 focus:ring-primary;
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