'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PickupAvailability, AvailableDate } from '@/lib/types';

interface PickupCalendarProps {
  originZip: string;
  availabilityData: PickupAvailability;
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  excludeDates?: Date[];
  minSelectableDate?: Date;
  maxSelectableDate?: Date;
  className?: string;
}

/**
 * PickupCalendar Component
 * 
 * Interactive calendar widget for pickup date selection:
 * - 3-week availability window display
 * - Visual availability indicators (green/yellow/gray)
 * - Business day filtering with holiday exclusions
 * - Mobile-optimized touch targets (44px minimum)
 * - Accessibility compliance with keyboard navigation
 */
export function PickupCalendar({
  originZip,
  availabilityData,
  selectedDate,
  onDateSelect,
  excludeDates = [],
  minSelectableDate,
  maxSelectableDate,
  className
}: PickupCalendarProps) {
  console.log('📅 [PICKUP-CALENDAR] Rendering calendar with availability data');

  const [currentMonth, setCurrentMonth] = useState(() => {
    // Start with the first available date's month or current month
    if (availabilityData.availableDates.length > 0) {
      return new Date(availabilityData.availableDates[0].date);
    }
    return new Date();
  });

  // Convert availability data to lookup map for performance
  const availabilityMap = useMemo(() => {
    const map = new Map<string, AvailableDate>();
    availabilityData.availableDates.forEach(dateData => {
      map.set(dateData.date, dateData);
    });
    return map;
  }, [availabilityData.availableDates]);

  // Get days for current month view
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Starting day of week (0 = Sunday)
    const startingDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  }, [currentMonth]);

  // Check if a date is selectable
  const isDateSelectable = useCallback((date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    const availableDate = availabilityMap.get(dateStr);
    
    // Must be in availability data
    if (!availableDate) return false;
    
    // Check min/max bounds
    if (minSelectableDate && date < minSelectableDate) return false;
    if (maxSelectableDate && date > maxSelectableDate) return false;
    
    // Check exclude list
    if (excludeDates.some(excludeDate => 
      excludeDate.toDateString() === date.toDateString()
    )) return false;
    
    // Must have at least one available time slot
    return availableDate.timeSlots.some(slot => slot.availability === 'available');
  }, [availabilityMap, minSelectableDate, maxSelectableDate, excludeDates]);

  // Get availability status for a date
  const getDateAvailability = useCallback((date: Date): 'available' | 'limited' | 'unavailable' => {
    const dateStr = date.toISOString().split('T')[0];
    const availableDate = availabilityMap.get(dateStr);
    
    if (!availableDate) return 'unavailable';
    
    const availableSlots = availableDate.timeSlots.filter(slot => slot.availability === 'available');
    const limitedSlots = availableDate.timeSlots.filter(slot => slot.availability === 'limited');
    
    if (availableSlots.length > 0) return 'available';
    if (limitedSlots.length > 0) return 'limited';
    return 'unavailable';
  }, [availabilityMap]);

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    if (isDateSelectable(date)) {
      console.log('📅 [PICKUP-CALENDAR] Date selected:', date.toISOString());
      onDateSelect(date);
    }
  }, [isDateSelectable, onDateSelect]);

  // Navigate to previous month
  const navigateToPreviousMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  }, []);

  // Navigate to next month
  const navigateToNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  }, []);

  // Format month/year for display
  const monthYearDisplay = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Check if we can navigate to previous/next month
  const canNavigatePrevious = useMemo(() => {
    if (!minSelectableDate) return true;
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return prevMonth >= minSelectableDate;
  }, [currentMonth, minSelectableDate]);

  const canNavigateNext = useMemo(() => {
    if (!maxSelectableDate) return true;
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth <= maxSelectableDate;
  }, [currentMonth, maxSelectableDate]);

  return (
    <div className={cn('bg-white rounded-lg border border-gray-200', className)} data-testid="pickup-calendar">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <Button
          variant="outline"
          size="sm"
          onClick={navigateToPreviousMonth}
          disabled={!canNavigatePrevious}
          className="h-8 w-8 p-0"
          data-testid="calendar-prev-month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900" data-testid="calendar-month-year">{monthYearDisplay}</h3>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={navigateToNextMonth}
          disabled={!canNavigateNext}
          className="h-8 w-8 p-0"
          data-testid="calendar-next-month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Body */}
      <div className="p-4">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-11" />;
            }

            const isSelected = selectedDate && 
              date.getFullYear() === selectedDate.getFullYear() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getDate() === selectedDate.getDate();

            const isToday = new Date().toDateString() === date.toDateString();
            const isSelectable = isDateSelectable(date);
            const availability = getDateAvailability(date);

            return (
              <Button
                key={index}
                variant={isSelected ? "default" : "ghost"}
                size="sm"
                disabled={!isSelectable}
                onClick={() => handleDateSelect(date)}
                data-availability={availability}
                className={cn(
                  "h-11 w-full p-0 font-normal text-sm relative",
                  isToday && !isSelected && "ring-2 ring-blue-200",
                  isSelected && "bg-blue-600 text-white hover:bg-blue-700",
                  !isSelectable && "text-gray-300 cursor-not-allowed",
                  isSelectable && !isSelected && {
                    "hover:bg-green-50 border-green-200": availability === 'available',
                    "hover:bg-yellow-50 border-yellow-200": availability === 'limited',
                    "hover:bg-gray-50": availability === 'unavailable'
                  }
                )}
              >
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <span>{date.getDate()}</span>
                  {isSelectable && (
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full mt-0.5",
                      availability === 'available' && "bg-green-500",
                      availability === 'limited' && "bg-yellow-500",
                      availability === 'unavailable' && "bg-gray-400"
                    )} />
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span>Limited</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              <span>Unavailable</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Badge variant="outline" className="text-xs" data-testid="service-area-badge">
              {availabilityData.serviceArea?.zone || originZip}
            </Badge>
          </div>
        </div>
      </div>

      {/* Cutoff Time Notice */}
      {availabilityData.cutoffTime && (
        <div className="px-4 pb-4">
          <div className="flex items-center space-x-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
            <AlertCircle className="h-3 w-3 text-blue-500" />
            <span>
              Orders placed after {availabilityData.cutoffTime} will be processed the next business day
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
