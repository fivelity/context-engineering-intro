import { writable } from 'svelte/store';

function createLayoutStore() {
  const initial = typeof localStorage !== 'undefined'
    ? JSON.parse(localStorage.getItem('dashboardLayout') || '{}')
    : {};
  const { subscribe, update } = writable<Record<string, any>>(initial);

  return {
    subscribe,
    setWidget(id: string, cfg: { x: number; y: number; w?: number; h?: number }) {
      update(layout => {
        layout[id] = cfg;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('dashboardLayout', JSON.stringify(layout));
        }
        return layout;
      });
    }
  };
}

export const layoutStore = createLayoutStore();
