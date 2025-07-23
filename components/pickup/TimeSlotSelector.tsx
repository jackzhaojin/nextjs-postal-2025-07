'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Users, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimeSlot } from '@/lib/types';

interface TimeSlotSelectorProps {
  selectedDate: Date;
  timeSlots: TimeSlot[];
  selectedTimeSlot?: TimeSlot;
  onTimeSlotSelect: (timeSlot: TimeSlot) => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * TimeSlotSelector Component
 * 
 * Displays and manages time slot selection:
 * - Three-tier time window system (Morning/Afternoon/Evening)
 * - Real-time availability and capacity indicators
 * - Fee transparency with premium charges
 * - Responsive card-based layout
 * - Mobile-optimized touch targets
 */
export function TimeSlotSelector({
  selectedDate,
  timeSlots,
  selectedTimeSlot,
  onTimeSlotSelect,
  isLoading = false,
  className
}: TimeSlotSelectorProps) {
  console.log('🕐 [TIME-SLOT-SELECTOR] Rendering time slots:', {
    date: selectedDate.toISOString(),
    slotCount: timeSlots.length,
    selectedSlotId: selectedTimeSlot?.id,
    isLoading
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAvailabilityColor = (availability: TimeSlot['availability']) => {
    switch (availability) {
      case 'available':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'limited':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unavailable':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getAvailabilityIcon = (availability: TimeSlot['availability']) => {
    switch (availability) {
      case 'available':
        return <Clock className="h-4 w-4 text-green-600" />;
      case 'limited':
        return <Users className="h-4 w-4 text-yellow-600" />;
      case 'unavailable':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAvailabilityText = (availability: TimeSlot['availability']) => {
    switch (availability) {
      case 'available':
        return 'Available';
      case 'limited':
        return 'Limited Availability';
      case 'unavailable':
        return 'Unavailable';
      default:
        return 'Unknown';
    }
  };

  const getCapacityText = (availability: TimeSlot['availability']) => {
    switch (availability) {
      case 'available':
        return 'Full capacity - immediate booking confirmation';
      case 'limited':
        return 'Reduced capacity - potential scheduling delays';
      case 'unavailable':
        return 'No pickup service or fully booked';
      default:
        return 'Status unknown';
    }
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (timeSlots.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">
          No time slots available for {formatDate(selectedDate)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Please select a different date
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)} data-testid="time-slot-selector">
      <div className="text-sm text-gray-600 mb-4">
        Available time slots for <strong>{formatDate(selectedDate)}</strong>
      </div>

      {timeSlots.map((timeSlot) => {
        const isSelected = selectedTimeSlot?.id === timeSlot.id;
        const isSelectable = timeSlot.availability !== 'unavailable';
        const hasFee = timeSlot.additionalFee && timeSlot.additionalFee > 0;

        return (
          <Card
            key={timeSlot.id}
            data-slot-id={timeSlot.id}
            className={cn(
              'p-4 cursor-pointer transition-all duration-200 border-2',
              isSelected && 'border-blue-500 bg-blue-50',
              !isSelected && isSelectable && 'hover:border-gray-300 hover:shadow-sm',
              !isSelectable && 'opacity-60 cursor-not-allowed',
              getAvailabilityColor(timeSlot.availability)
            )}
            onClick={() => isSelectable && onTimeSlotSelect(timeSlot)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                {/* Time Slot Header */}
                <div className="flex items-center space-x-3">
                  {getAvailabilityIcon(timeSlot.availability)}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {timeSlot.display}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {timeSlot.startTime} - {timeSlot.endTime}
                    </p>
                  </div>
                  {hasFee && (
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>+${timeSlot.additionalFee?.toFixed(2)}</span>
                    </Badge>
                  )}
                </div>

                {/* Availability Status */}
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={timeSlot.availability === 'available' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {getAvailabilityText(timeSlot.availability)}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {getCapacityText(timeSlot.availability)}
                  </span>
                </div>

                {/* Premium Fee Notice */}
                {hasFee && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-3 w-3" />
                      <span>
                        Premium time slot - Additional ${timeSlot.additionalFee?.toFixed(2)} fee applies
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Selection Button */}
              <div className="ml-4">
                <Button
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  disabled={!isSelectable}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isSelectable) {
                      onTimeSlotSelect(timeSlot);
                    }
                  }}
                  className={cn(
                    "min-w-[80px]",
                    isSelected && "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </Button>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Time Slot Information */}
      <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-xs text-blue-800">
          <h5 className="font-semibold mb-2">Time Slot Information:</h5>
          <ul className="space-y-1">
            <li>• Morning (8 AM - 12 PM): Standard rate, most popular</li>
            <li>• Afternoon (12 PM - 5 PM): Standard rate, good availability</li>
            <li>• Evening (5 PM - 7 PM): Premium rate (+$25), limited availability</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
