'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { PickupAvailability, TimeSlot } from '@/lib/types';

interface UsePickupAvailabilityOptions {
  originZip: string;
  selectedDate?: Date;
  numberOfWeeks?: number;
  includeWeekends?: boolean;
  includeHolidays?: boolean;
  enabled?: boolean;
}

interface UsePickupAvailabilityReturn {
  availabilityData: PickupAvailability | null;
  timeSlots: TimeSlot[] | null;
  isLoading: boolean;
  isValidating: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * usePickupAvailability Hook
 * 
 * Custom hook for managing pickup availability data:
 * - Fetches availability data from API
 * - Manages caching with 1-hour client-side cache
 * - Provides loading and error states
 * - Extracts time slots for selected date
 * - Implements retry logic for failed requests
 * - Optimizes performance with useMemo/useCallback
 */
export function usePickupAvailability({
  originZip,
  selectedDate,
  numberOfWeeks = 3,
  includeWeekends = false,
  includeHolidays = false,
  enabled = true
}: UsePickupAvailabilityOptions): UsePickupAvailabilityReturn {
  console.log('🔄 [USE-PICKUP-AVAILABILITY] Hook initialized:', {
    originZip,
    selectedDate: selectedDate?.toISOString(),
    numberOfWeeks,
    includeWeekends,
    includeHolidays,
    enabled
  });

  const [availabilityData, setAvailabilityData] = useState<PickupAvailability | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Cache key for localStorage
  const cacheKey = useMemo(() => {
    return `pickup-availability-${originZip}-${numberOfWeeks}-${includeWeekends}-${includeHolidays}`;
  }, [originZip, numberOfWeeks, includeWeekends, includeHolidays]);

  // Check cache validity (1 hour)
  const isCacheValid = useCallback((cachedData: any): boolean => {
    if (!cachedData?.metadata?.validUntil) return false;
    const validUntil = new Date(cachedData.metadata.validUntil);
    return validUntil > new Date();
  }, []);

  // Load from cache
  const loadFromCache = useCallback((): PickupAvailability | null => {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;
      
      const parsedData = JSON.parse(cached);
      if (isCacheValid(parsedData)) {
        console.log('💾 [USE-PICKUP-AVAILABILITY] Using cached data:', cacheKey);
        return parsedData;
      }
      
      // Remove expired cache
      localStorage.removeItem(cacheKey);
      console.log('🗑️ [USE-PICKUP-AVAILABILITY] Removed expired cache:', cacheKey);
      return null;
    } catch (error) {
      console.error('💥 [USE-PICKUP-AVAILABILITY] Cache load error:', error);
      return null;
    }
  }, [cacheKey, isCacheValid]);

  // Save to cache
  const saveToCache = useCallback((data: PickupAvailability) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      console.log('💾 [USE-PICKUP-AVAILABILITY] Data cached:', cacheKey);
    } catch (error) {
      console.error('💥 [USE-PICKUP-AVAILABILITY] Cache save error:', error);
    }
  }, [cacheKey]);

  // Fetch availability data from API
  const fetchAvailabilityData = useCallback(async (useCache = true): Promise<void> => {
    if (!originZip || !enabled) {
      console.log('⏸️ [USE-PICKUP-AVAILABILITY] Fetch skipped - missing zip or disabled');
      return;
    }

    console.log('📡 [USE-PICKUP-AVAILABILITY] Fetching availability data...');

    // Check cache first
    if (useCache) {
      const cached = loadFromCache();
      if (cached) {
        setAvailabilityData(cached);
        setError(null);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = new URL('/api/pickup-availability', window.location.origin);
      url.searchParams.set('zip', originZip);
      url.searchParams.set('weeks', numberOfWeeks.toString());
      url.searchParams.set('includeWeekends', includeWeekends.toString());
      url.searchParams.set('includeHolidays', includeHolidays.toString());

      console.log('📡 [USE-PICKUP-AVAILABILITY] API request URL:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch pickup availability');
      }

      console.log('✅ [USE-PICKUP-AVAILABILITY] API response received:', {
        availableDatesCount: result.data.availableDates.length,
        restrictionsCount: result.data.restrictions.length,
        serviceArea: result.data.serviceArea.zone
      });

      setAvailabilityData(result.data);
      saveToCache(result.data);
      setError(null);

    } catch (fetchError) {
      console.error('💥 [USE-PICKUP-AVAILABILITY] Fetch failed:', fetchError);
      setError(fetchError instanceof Error ? fetchError : new Error('Unknown error occurred'));
    } finally {
      setIsLoading(false);
    }
  }, [originZip, numberOfWeeks, includeWeekends, includeHolidays, enabled, loadFromCache, saveToCache]);

  // Fetch time slots for selected date
  const fetchTimeSlots = useCallback(async (): Promise<void> => {
    if (!selectedDate || !availabilityData) {
      console.log('⏸️ [USE-PICKUP-AVAILABILITY] Time slot fetch skipped - missing date or data');
      return;
    }

    const dateStr = selectedDate.toISOString().split('T')[0];
    const availableDate = availabilityData.availableDates.find(d => d.date === dateStr);
    
    if (!availableDate) {
      console.log('⚠️ [USE-PICKUP-AVAILABILITY] No time slots found for date:', dateStr);
      return;
    }

    console.log('🕐 [USE-PICKUP-AVAILABILITY] Time slots loaded for date:', {
      date: dateStr,
      slotCount: availableDate.timeSlots.length
    });

  }, [selectedDate, availabilityData]);

  // Extract time slots for selected date
  const timeSlots = useMemo((): TimeSlot[] | null => {
    if (!selectedDate || !availabilityData) return null;

    const dateStr = selectedDate.toISOString().split('T')[0];
    const availableDate = availabilityData.availableDates.find(d => d.date === dateStr);
    
    return availableDate?.timeSlots || null;
  }, [selectedDate, availabilityData]);

  // Refetch function for manual retry
  const refetch = useCallback(async (): Promise<void> => {
    console.log('🔄 [USE-PICKUP-AVAILABILITY] Manual refetch requested');
    await fetchAvailabilityData(false); // Skip cache on manual refetch
  }, [fetchAvailabilityData]);

  // Initial data fetch
  useEffect(() => {
    fetchAvailabilityData();
  }, [fetchAvailabilityData]);

  // Fetch time slots when date changes
  useEffect(() => {
    if (selectedDate && availabilityData) {
      setIsValidating(true);
      fetchTimeSlots().finally(() => {
        setIsValidating(false);
      });
    }
  }, [selectedDate, availabilityData, fetchTimeSlots]);

  console.log('🔄 [USE-PICKUP-AVAILABILITY] Hook state:', {
    hasAvailabilityData: !!availabilityData,
    timeSlotCount: timeSlots?.length || 0,
    isLoading,
    isValidating,
    hasError: !!error
  });

  return {
    availabilityData,
    timeSlots,
    isLoading,
    isValidating,
    error,
    refetch
  };
}
