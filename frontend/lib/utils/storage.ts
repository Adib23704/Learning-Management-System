export const storage = {
  get<T>(key: string): T | null {
    if (typeof window === "undefined") return null;
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },

  set(key: string, value: unknown): void {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or unavailable
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    sessionStorage.removeItem(key);
  },
};
