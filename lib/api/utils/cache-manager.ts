import { ApiError, ErrorCodes } from './api-error';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  etag: string;
  compressed?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  evictions: number;
}

export class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private stats: CacheStats = { hits: 0, misses: 0, size: 0, evictions: 0 };
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 100, defaultTTL: number = 24 * 60 * 60 * 1000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    
    // Periodic cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Store data in cache with TTL and ETag
   */
  set<T>(key: string, data: T, ttl?: number, compress: boolean = false): void {
    try {
      const expiry = Date.now() + (ttl || this.defaultTTL);
      const etag = this.generateETag(data);
      
      // Check if we need to evict entries
      if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
        this.evictLRU();
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiry,
        etag,
        compressed: compress
      };

      this.cache.set(key, entry);
      this.stats.size = this.cache.size;
      
      console.log(`[Cache] Set key: ${key}, expiry: ${new Date(expiry).toISOString()}, etag: ${etag}`);
    } catch (error) {
      console.error('[Cache] Error setting cache entry:', error);
      throw new ApiError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        'Failed to store data in cache',
        { key, error: error instanceof Error ? error.message : 'Unknown error' },
        500
      );
    }
  }

  /**
   * Retrieve data from cache
   */
  get<T>(key: string): { data: T; etag: string } | null {
    try {
      const entry = this.cache.get(key);
      
      if (!entry) {
        this.stats.misses++;
        console.log(`[Cache] Miss for key: ${key}`);
        return null;
      }

      if (Date.now() > entry.expiry) {
        this.cache.delete(key);
        this.stats.misses++;
        this.stats.size = this.cache.size;
        console.log(`[Cache] Expired key: ${key}`);
        return null;
      }

      this.stats.hits++;
      
      // Update timestamp for LRU
      entry.timestamp = Date.now();
      
      console.log(`[Cache] Hit for key: ${key}, etag: ${entry.etag}`);
      return { data: entry.data, etag: entry.etag };
    } catch (error) {
      console.error('[Cache] Error retrieving cache entry:', error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Check if data has changed using ETag
   */
  hasChanged(key: string, clientETag?: string): boolean {
    if (!clientETag) return true;
    
    const entry = this.cache.get(key);
    if (!entry || Date.now() > entry.expiry) {
      return true;
    }
    
    const hasChanged = entry.etag !== clientETag;
    console.log(`[Cache] ETag check for ${key}: ${hasChanged ? 'changed' : 'unchanged'}`);
    return hasChanged;
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
      console.log(`[Cache] Invalidated key: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, size: 0, evictions: 0 };
    console.log('[Cache] Cleared all entries');
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }

  /**
   * Generate ETag for data
   */
  private generateETag(data: any): string {
    const content = JSON.stringify(data);
    const hash = this.simpleHash(content);
    return `"${hash}"`;
  }

  /**
   * Simple hash function for ETag generation
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
      console.log(`[Cache] Evicted LRU key: ${oldestKey}`);
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.stats.size = this.cache.size;
      console.log(`[Cache] Cleanup removed ${cleanedCount} expired entries`);
    }
  }

  /**
   * Get cache key for form configuration
   */
  static getFormConfigKey(locale?: string, version?: string): string {
    const parts = ['form-config'];
    if (locale) parts.push(locale);
    if (version) parts.push(version);
    return parts.join(':');
  }

  /**
   * Check memory usage (approximate)
   */
  getMemoryUsage(): { entries: number; estimatedBytes: number } {
    let estimatedBytes = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      // Rough estimation: key + JSON serialized data
      estimatedBytes += key.length * 2; // UTF-16 characters
      estimatedBytes += JSON.stringify(entry.data).length * 2;
      estimatedBytes += 100; // Overhead for metadata
    }

    return {
      entries: this.cache.size,
      estimatedBytes
    };
  }
}

// Global cache instance
export const globalCache = new CacheManager(200, 24 * 60 * 60 * 1000); // 200 entries, 24 hour TTL

// Request deduplication manager
export class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<any>> = new Map();

  /**
   * Deduplicate concurrent requests
   */
  async deduplicate<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      console.log(`[RequestDedup] Deduplicating request: ${key}`);
      return pending;
    }

    // Start new request
    const request = requestFn().finally(() => {
      // Clean up after request completes
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, request);
    console.log(`[RequestDedup] Started new request: ${key}`);
    
    return request;
  }

  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear();
    console.log('[RequestDedup] Cleared all pending requests');
  }

  /**
   * Get stats about pending requests
   */
  getStats(): { pendingCount: number; pendingKeys: string[] } {
    return {
      pendingCount: this.pendingRequests.size,
      pendingKeys: Array.from(this.pendingRequests.keys())
    };
  }
}

// Global request deduplicator
export const globalDeduplicator = new RequestDeduplicator();