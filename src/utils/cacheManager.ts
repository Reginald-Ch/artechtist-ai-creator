// Cache Manager for better performance
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Set data in cache with TTL
  set(key: string, data: any, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  // Get data from cache
  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if cache item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Remove specific cache entry
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }

  // Get cache size
  size(): number {
    return this.cache.size;
  }

  // Clean expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let expired = 0;
    let valid = 0;

    for (const [, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        expired++;
      } else {
        valid++;
      }
    }

    return {
      total: this.cache.size,
      valid,
      expired,
      hitRate: valid / (valid + expired) || 0
    };
  }
}

// Hook for React components
export const useCache = () => {
  const cacheManager = CacheManager.getInstance();

  const setCache = (key: string, data: any, ttl?: number) => {
    cacheManager.set(key, data, ttl);
  };

  const getCache = (key: string) => {
    return cacheManager.get(key);
  };

  const hasCache = (key: string) => {
    return cacheManager.has(key);
  };

  const deleteCache = (key: string) => {
    return cacheManager.delete(key);
  };

  const clearCache = () => {
    cacheManager.clear();
  };

  const getCacheStats = () => {
    return cacheManager.getStats();
  };

  return {
    setCache,
    getCache,
    hasCache,
    deleteCache,
    clearCache,
    getCacheStats
  };
};

// API Cache wrapper
export const withCache = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl?: number
) => {
  return async (...args: T): Promise<R> => {
    const cache = CacheManager.getInstance();
    const key = keyGenerator(...args);
    
    // Check cache first
    const cachedResult = cache.get(key);
    if (cachedResult !== null) {
      return cachedResult;
    }

    // Execute function and cache result
    const result = await fn(...args);
    cache.set(key, result, ttl);
    
    return result;
  };
};