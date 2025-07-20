import { useState, useEffect, useCallback, useRef } from 'react';
import { FormConfig } from '@/lib/api/schemas/form-config-schemas';

interface UseFormConfigOptions {
  sections?: string[];
  locale?: string;
  version?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseFormConfigReturn {
  data: FormConfig | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isStale: boolean;
  refresh: () => Promise<void>;
  clearCache: () => void;
}

interface CachedFormConfig {
  data: FormConfig;
  timestamp: number;
  etag: string;
  expires: number;
}

const CACHE_KEY = 'form-config-cache';
const DEFAULT_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * React hook for loading and caching form configuration data
 * 
 * Features:
 * - Automatic caching with localStorage persistence
 * - ETag-based conditional requests
 * - Request deduplication
 * - Background refresh capability
 * - TypeScript type safety
 * - Error handling and retry logic
 * 
 * @example
 * ```tsx
 * function ShippingForm() {
 *   const { data: config, loading, error, refresh } = useFormConfig({
 *     sections: ['packageTypes', 'countries', 'validation'],
 *     locale: 'en-US'
 *   });
 * 
 *   if (loading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} onRetry={refresh} />;
 *   if (!config) return null;
 * 
 *   return (
 *     <form>
 *       <PackageTypeSelect options={config.packageTypes} />
 *       <CountrySelect countries={config.countries} />
 *     </form>
 *   );
 * }
 * ```
 */
export function useFormConfig(options: UseFormConfigOptions = {}): UseFormConfigReturn {
  const {
    sections,
    locale = 'en-US',
    version,
    autoRefresh = false,
    refreshInterval = 30 * 60 * 1000 // 30 minutes
  } = options;

  const [data, setData] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Generate cache key for current options
   */
  const getCacheKey = useCallback(() => {
    const parts = [CACHE_KEY];
    if (sections?.length) parts.push(`sections:${sections.sort().join(',')}`);
    if (locale !== 'en-US') parts.push(`locale:${locale}`);
    if (version) parts.push(`version:${version}`);
    return parts.join('|');
  }, [sections, locale, version]);

  /**
   * Load cached data from localStorage
   */
  const loadFromCache = useCallback((): CachedFormConfig | null => {
    try {
      const cacheKey = getCacheKey();
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const parsedCache: CachedFormConfig = JSON.parse(cached);
      
      // Check if cache is expired
      if (Date.now() > parsedCache.expires) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return parsedCache;
    } catch (error) {
      console.warn('[FormConfig] Failed to load from cache:', error);
      return null;
    }
  }, [getCacheKey]);

  /**
   * Save data to localStorage cache
   */
  const saveToCache = useCallback((data: FormConfig, etag: string) => {
    try {
      const cacheKey = getCacheKey();
      const cached: CachedFormConfig = {
        data,
        timestamp: Date.now(),
        etag,
        expires: Date.now() + DEFAULT_CACHE_TTL
      };
      localStorage.setItem(cacheKey, JSON.stringify(cached));
    } catch (error) {
      console.warn('[FormConfig] Failed to save to cache:', error);
    }
  }, [getCacheKey]);

  /**
   * Clear cache for current configuration
   */
  const clearCache = useCallback(() => {
    try {
      const cacheKey = getCacheKey();
      localStorage.removeItem(cacheKey);
      console.log('[FormConfig] Cache cleared for key:', cacheKey);
    } catch (error) {
      console.warn('[FormConfig] Failed to clear cache:', error);
    }
  }, [getCacheKey]);

  /**
   * Build API URL with query parameters
   */
  const buildApiUrl = useCallback(() => {
    const url = new URL('/api/form-config', window.location.origin);
    if (sections?.length) {
      url.searchParams.set('sections', sections.join(','));
    }
    if (locale !== 'en-US') {
      url.searchParams.set('locale', locale);
    }
    if (version) {
      url.searchParams.set('version', version);
    }
    return url.toString();
  }, [sections, locale, version]);

  /**
   * Fetch form configuration from API
   */
  const fetchFormConfig = useCallback(async (useCache: boolean = true): Promise<void> => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      setError(null);
      if (!data) setLoading(true);

      // Try to use cached data if available
      let cachedData: CachedFormConfig | null = null;
      if (useCache) {
        cachedData = loadFromCache();
        if (cachedData) {
          setData(cachedData.data);
          setLastUpdated(new Date(cachedData.timestamp));
          setLoading(false);
          
          // Check if data is getting stale (older than 1 hour)
          const oneHourAgo = Date.now() - (60 * 60 * 1000);
          setIsStale(cachedData.timestamp < oneHourAgo);
        }
      }

      const apiUrl = buildApiUrl();
      const headers: HeadersInit = {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      };

      // Add If-None-Match header for conditional requests
      if (cachedData?.etag) {
        headers['If-None-Match'] = cachedData.etag;
      }

      console.log('[FormConfig] Fetching configuration from:', apiUrl, { 
        hasCache: !!cachedData,
        etag: cachedData?.etag
      });

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers,
        signal
      });

      // Handle 304 Not Modified - data hasn't changed
      if (response.status === 304) {
        console.log('[FormConfig] Data not modified, using cached version');
        setIsStale(false);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `API request failed: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || 'Invalid response format');
      }

      const newETag = response.headers.get('ETag') || '';
      
      console.log('[FormConfig] Configuration loaded successfully:', {
        dataSize: JSON.stringify(result.data).length,
        etag: newETag,
        cached: response.headers.get('X-Cache') === 'HIT',
        processingTime: response.headers.get('X-Processing-Time')
      });

      // Update state
      setData(result.data);
      setLastUpdated(new Date());
      setIsStale(false);
      
      // Save to cache
      if (newETag) {
        saveToCache(result.data, newETag);
      }

    } catch (error) {
      // Ignore aborted requests
      if (signal.aborted) return;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[FormConfig] Failed to fetch configuration:', errorMessage);
      setError(errorMessage);
      
      // If we have cached data and this is a network error, use stale data
      if (!data) {
        const cachedData = loadFromCache();
        if (cachedData) {
          console.log('[FormConfig] Using stale cached data due to network error');
          setData(cachedData.data);
          setLastUpdated(new Date(cachedData.timestamp));
          setIsStale(true);
        }
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [data, buildApiUrl, loadFromCache, saveToCache]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchFormConfig(false);
  }, [fetchFormConfig]);

  /**
   * Setup auto-refresh if enabled
   */
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshTimeoutRef.current = setInterval(() => {
        fetchFormConfig(true);
      }, refreshInterval);

      return () => {
        if (refreshTimeoutRef.current) {
          clearInterval(refreshTimeoutRef.current);
          refreshTimeoutRef.current = null;
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchFormConfig]);

  /**
   * Initial load and cleanup
   */
  useEffect(() => {
    fetchFormConfig(true);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, [fetchFormConfig]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    isStale,
    refresh,
    clearCache
  };
}

/**
 * Hook for accessing specific sections of form configuration
 */
export function useFormConfigSection<K extends keyof FormConfig>(
  section: K,
  options: Omit<UseFormConfigOptions, 'sections'> = {}
): UseFormConfigReturn & { sectionData: FormConfig[K] | null } {
  const result = useFormConfig({
    ...options,
    sections: [section]
  });

  return {
    ...result,
    sectionData: result.data?.[section] || null
  };
}

/**
 * Hook for package types specifically
 */
export function usePackageTypes(options: Omit<UseFormConfigOptions, 'sections'> = {}) {
  return useFormConfigSection('packageTypes', options);
}

/**
 * Hook for countries specifically
 */
export function useCountries(options: Omit<UseFormConfigOptions, 'sections'> = {}) {
  return useFormConfigSection('countries', options);
}

/**
 * Hook for validation rules specifically
 */
export function useValidationRules(options: Omit<UseFormConfigOptions, 'sections'> = {}) {
  return useFormConfigSection('validation', options);
}

/**
 * Hook for special handling options specifically
 */
export function useSpecialHandling(options: Omit<UseFormConfigOptions, 'sections'> = {}) {
  return useFormConfigSection('specialHandling', options);
}
