// React hook for using local cache with async sync

import { useEffect, useRef, useCallback } from 'react';
import LocalCache from '@/lib/localCache';

interface UseLocalCacheOptions<T> {
  storageKey: string;
  syncInterval?: number;
  onSync?: (items: T[]) => Promise<void>;
  autoSync?: boolean;
}

export function useLocalCache<T extends { id: number | string }>(
  options: UseLocalCacheOptions<T>
) {
  const { storageKey, syncInterval = 10000, onSync, autoSync = true } = options;
  const cacheRef = useRef<LocalCache<T>>();

  // Initialize cache
  if (!cacheRef.current) {
    cacheRef.current = new LocalCache<T>(storageKey, syncInterval);
  }

  const cache = cacheRef.current;

  // Start auto-sync on mount
  useEffect(() => {
    if (autoSync && onSync) {
      cache.startAutoSync(onSync);
    }

    return () => {
      cache.stopAutoSync();
    };
  }, [autoSync, onSync, cache]);

  // Update item in cache
  const updateItem = useCallback((item: T, isDirty: boolean = true) => {
    cache.set(item, isDirty);
  }, [cache]);

  // Update multiple items
  const updateItems = useCallback((items: T[], isDirty: boolean = true) => {
    cache.setMany(items, isDirty);
  }, [cache]);

  // Get all items
  const getItems = useCallback(() => {
    return cache.getAll();
  }, [cache]);

  // Get single item
  const getItem = useCallback((id: string | number) => {
    return cache.get(id);
  }, [cache]);

  // Remove item
  const removeItem = useCallback((id: string | number) => {
    cache.remove(id);
  }, [cache]);

  // Manually trigger sync
  const syncNow = useCallback(async () => {
    await cache.syncDirtyItems();
  }, [cache]);

  // Get sync status
  const getSyncStatus = useCallback(() => {
    return cache.getSyncStatus();
  }, [cache]);

  return {
    updateItem,
    updateItems,
    getItems,
    getItem,
    removeItem,
    syncNow,
    getSyncStatus,
    cache,
  };
}
