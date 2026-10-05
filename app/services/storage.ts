/**
 * LocalStorage wrapper with SSR fallback and in-memory cache.
 * Keeps prototype state persistent across browser reloads.
 */

const memoryStore = new Map<string, string>();

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') {
      const memVal = memoryStore.get(key);
      return memVal ? (JSON.parse(memVal) as T) : fallback;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : fallback;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    const serialized = JSON.stringify(value);
    if (typeof window === 'undefined') {
      memoryStore.set(key, serialized);
      return;
    }

    try {
      window.localStorage.setItem(key, serialized);
    } catch (err) {
      console.warn(`[storage] Could not persist key "${key}":`, err);
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') {
      memoryStore.delete(key);
      return;
    }

    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
