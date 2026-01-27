// Local cache utility for offline editing support

interface CacheItem<T> {
  data: T;
  timestamp: number;
  isDirty: boolean; // Has unsaved changes
  syncAttempts: number;
}

class LocalCache<T extends { id: number | string }> {
  private storageKey: string;
  private syncInterval: number;
  private syncTimer: NodeJS.Timeout | null = null;
  private syncCallback: ((items: T[]) => Promise<void>) | null = null;

  constructor(storageKey: string, syncInterval: number = 10000) {
    this.storageKey = storageKey;
    this.syncInterval = syncInterval;
  }

  // Initialize cache from localStorage
  private getCache(): Map<string | number, CacheItem<T>> {
    if (typeof window === 'undefined') return new Map();
    
    try {
      const cached = localStorage.getItem(this.storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        return new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
    return new Map();
  }

  // Save cache to localStorage
  private saveCache(cache: Map<string | number, CacheItem<T>>): void {
    if (typeof window === 'undefined') return;
    
    try {
      const obj = Object.fromEntries(cache);
      localStorage.setItem(this.storageKey, JSON.stringify(obj));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  // Get all items from cache
  getAll(): T[] {
    const cache = this.getCache();
    return Array.from(cache.values()).map(item => item.data);
  }

  // Get single item from cache
  get(id: string | number): T | null {
    const cache = this.getCache();
    const item = cache.get(id);
    return item ? item.data : null;
  }

  // Update item in cache (marks as dirty)
  set(item: T, isDirty: boolean = true): void {
    const cache = this.getCache();
    const existing = cache.get(item.id);
    
    cache.set(item.id, {
      data: item,
      timestamp: Date.now(),
      isDirty,
      syncAttempts: existing?.syncAttempts || 0,
    });
    
    this.saveCache(cache);
  }

  // Update multiple items
  setMany(items: T[], isDirty: boolean = true): void {
    const cache = this.getCache();
    
    items.forEach(item => {
      const existing = cache.get(item.id);
      cache.set(item.id, {
        data: item,
        timestamp: Date.now(),
        isDirty,
        syncAttempts: existing?.syncAttempts || 0,
      });
    });
    
    this.saveCache(cache);
  }

  // Remove item from cache
  remove(id: string | number): void {
    const cache = this.getCache();
    cache.delete(id);
    this.saveCache(cache);
  }

  // Get all dirty (unsaved) items
  getDirtyItems(): T[] {
    const cache = this.getCache();
    return Array.from(cache.values())
      .filter(item => item.isDirty)
      .map(item => item.data);
  }

  // Mark item as synced (clean)
  markAsSynced(id: string | number): void {
    const cache = this.getCache();
    const item = cache.get(id);
    
    if (item) {
      item.isDirty = false;
      item.syncAttempts = 0;
      cache.set(id, item);
      this.saveCache(cache);
    }
  }

  // Mark item sync as failed (increment attempts)
  markSyncFailed(id: string | number): void {
    const cache = this.getCache();
    const item = cache.get(id);
    
    if (item) {
      item.syncAttempts += 1;
      cache.set(id, item);
      this.saveCache(cache);
    }
  }

  // Clear all cache
  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }

  // Start auto-sync
  startAutoSync(syncCallback: (items: T[]) => Promise<void>): void {
    this.syncCallback = syncCallback;
    
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    this.syncTimer = setInterval(() => {
      this.syncDirtyItems();
    }, this.syncInterval);
  }

  // Stop auto-sync
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  // Manually trigger sync
  async syncDirtyItems(): Promise<void> {
    if (!this.syncCallback) return;

    const dirtyItems = this.getDirtyItems();
    if (dirtyItems.length === 0) return;

    console.log(`[LocalCache] Syncing ${dirtyItems.length} dirty items...`);

    try {
      await this.syncCallback(dirtyItems);
      
      // Mark all as synced
      dirtyItems.forEach(item => {
        this.markAsSynced(item.id);
      });
      
      console.log(`[LocalCache] Successfully synced ${dirtyItems.length} items`);
    } catch (error) {
      console.error('[LocalCache] Sync failed:', error);
      
      // Mark sync attempts
      dirtyItems.forEach(item => {
        this.markSyncFailed(item.id);
      });
    }
  }

  // Get sync status
  getSyncStatus(): { total: number; dirty: number; synced: number } {
    const cache = this.getCache();
    const items = Array.from(cache.values());
    
    return {
      total: items.length,
      dirty: items.filter(item => item.isDirty).length,
      synced: items.filter(item => !item.isDirty).length,
    };
  }
}

export default LocalCache;
