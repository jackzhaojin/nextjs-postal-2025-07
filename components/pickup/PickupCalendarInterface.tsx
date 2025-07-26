'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PickupCalendar } from './PickupCalendar';
import { TimeSlotSelector } from './TimeSlotSelector';
import { usePickupAvailability } from '@/hooks/usePickupAvailability';
import { useShipmentDetailsForm } from '@/hooks/useShipmentDetailsForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle, Calendar, Clock, DollarSign } from 'lucide-react';
import type { TimeSlot, PickupDetails } from '@/lib/types';
import { ShippingTransactionManager } from '@/lib/localStorage';

/**
 * Main Pickup Calendar Interface Component
 * 
 * Orchestrates the entire pickup scheduling experience:
 * - Calendar date selection
 * - Time slot selection
 * - API integration for availability
 * - Form state management
 * - Error handling and loading states
 * - Fee calculation and display
 */
export function PickupCalendarInterface() {
  console.log('🗓️ [PICKUP-CALENDAR-INTERFACE] Rendering pickup calendar interface');

  const { shipmentDetails, updatePickupDetails, validation } = useShipmentDetailsForm();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | undefined>();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Extract origin ZIP for availability API
  const originZip = shipmentDetails?.origin?.zip || '';
  
  const {
    availabilityData,
    timeSlots,
    isLoading,
    error,
    refetch,
    isValidating
  } = usePickupAvailability({
    originZip,
    selectedDate,
    enabled: !!originZip
  });

  console.log('🗓️ [PICKUP-CALENDAR-INTERFACE] Current state:', {
    originZip,
    selectedDate: selectedDate?.toISOString(),
    selectedTimeSlot: selectedTimeSlot?.id,
    hasAvailabilityData: !!availabilityData,
    timeSlotCount: timeSlots?.length || 0,
    isLoading,
    error: error?.message
  });

  // Handle date selection
  const handleDateSelect = useCallback((date: Date) => {
    console.log('📅 [PICKUP-CALENDAR-INTERFACE] Date selected:', date.toISOString());
    setSelectedDate(date);
    setSelectedTimeSlot(undefined); // Reset time slot when date changes
  }, []);

  // Handle time slot selection
  const handleTimeSlotSelect = useCallback((timeSlot: TimeSlot) => {
    console.log('🕐 [PICKUP-CALENDAR-INTERFACE] Time slot selected:', {
      id: timeSlot.id,
      display: timeSlot.display,
      additionalFee: timeSlot.additionalFee
    });
    setSelectedTimeSlot(timeSlot);
  }, []);

  // Confirm pickup selection
  const handleConfirmPickup = useCallback(async () => {
    if (!selectedDate || !selectedTimeSlot) {
      console.warn('⚠️ [PICKUP-CALENDAR-INTERFACE] Cannot confirm - missing date or time slot');
      return;
    }

    setIsConfirming(true);
    console.log('✅ [PICKUP-CALENDAR-INTERFACE] Confirming pickup selection');

    try {
      const pickupDetails: Partial<PickupDetails> = {
        date: selectedDate.toISOString().split('T')[0],
        timeSlot: selectedTimeSlot,
        instructions: '',
        contactPerson: shipmentDetails?.origin?.contactInfo?.name || '',
        phone: shipmentDetails?.origin?.contactInfo?.phone || '',
        readyTime: selectedTimeSlot.startTime,
        authorizedPersonnel: [shipmentDetails?.origin?.contactInfo?.name || ''].filter(Boolean),
        accessInstructions: {
          securityRequired: false,
          appointmentRequired: false,
          limitedParking: false,
          forkliftAvailable: false,
          liftgateRequired: false,
          parkingInstructions: '',
          packageLocation: '',
          driverInstructions: ''
        },
        equipmentRequirements: {
          dolly: false,
          applianceDolly: false,
          furniturePads: false,
          straps: false,
          palletJack: false,
          twoPersonTeam: false,
          loadingAssistance: 'customer'
        },
        notificationPreferences: {
          emailReminder24h: true,
          smsReminder2h: true,
          callReminder30m: false,
          driverEnRoute: true,
          pickupCompletion: true,
          transitUpdates: true,
          pickupReminders: [
            {
              type: 'pickup-24h',
              enabled: true,
              timing: 1440,
              channels: ['email'],
              customMessage: ''
            },
            {
              type: 'pickup-2h',
              enabled: true,
              timing: 120,
              channels: ['sms'],
              customMessage: ''
            }
          ],
          realTimeUpdates: [
            {
              type: 'driver-enroute',
              enabled: true,
              channels: ['sms', 'email'],
              frequency: 'immediate'
            },
            {
              type: 'pickup-completion',
              enabled: true,
              channels: ['email'],
              frequency: 'immediate'
            }
          ],
          communicationChannels: [
            {
              channel: 'email',
              primary: true,
              businessHoursOnly: false,
              contactInfo: '',
              fallbackOrder: 1
            }
          ],
          escalationProcedures: [],
          businessHoursOnly: false
        }
      };

      await updatePickupDetails(pickupDetails);
      
      // Also save to shipping transaction for review page compatibility
      try {
        const existingTransaction = ShippingTransactionManager.load();
        if (existingTransaction.success && existingTransaction.data) {
          const updatedTransaction = {
            ...existingTransaction.data,
            pickupDetails: pickupDetails,
            shipmentDetails: {
              ...existingTransaction.data.shipmentDetails,
              ...shipmentDetails
            }
          };
          
          const saveResult = ShippingTransactionManager.save(updatedTransaction);
          if (saveResult.success) {
            console.log('✅ [PICKUP-CALENDAR-INTERFACE] Also saved to shipping transaction');
          } else {
            console.warn('⚠️ [PICKUP-CALENDAR-INTERFACE] Failed to save to shipping transaction:', saveResult.error);
          }
        }
      } catch (transactionError) {
        console.warn('⚠️ [PICKUP-CALENDAR-INTERFACE] Failed to update shipping transaction:', transactionError);
      }
      
      setIsConfirmed(true);
      console.log('✅ [PICKUP-CALENDAR-INTERFACE] Pickup confirmed successfully');
      
      // Reset confirmed state after 3 seconds to allow for re-selection if needed
      setTimeout(() => {
        setIsConfirmed(false);
      }, 3000);
    } catch (error) {
      console.error('💥 [PICKUP-CALENDAR-INTERFACE] Failed to confirm pickup:', error);
    } finally {
      setIsConfirming(false);
    }
  }, [selectedDate, selectedTimeSlot, shipmentDetails, updatePickupDetails]);

  // Calculate total additional fees
  const additionalFee = selectedTimeSlot?.additionalFee || 0;

  if (!originZip) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please complete the shipment details first to view pickup availability.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load pickup availability: {error.message}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="mt-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-2 text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading pickup availability...</span>
          </div>
        </div>
      )}

      {/* Calendar Selection */}
      {!isLoading && availabilityData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Date Selection */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span>Select Pickup Date</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Choose from available business days in the next 3 weeks
              </p>
            </div>
            
            <PickupCalendar
              originZip={originZip}
              availabilityData={availabilityData}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              className="w-full"
            />

            {/* Service Area Info */}
            {availabilityData.serviceArea && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    availabilityData.serviceArea.coverage === 'full' ? 'default' :
                    availabilityData.serviceArea.coverage === 'limited' ? 'secondary' : 'outline'
                  }>
                    {availabilityData.serviceArea.zone}
                  </Badge>
                  <span className="text-sm text-gray-600">Service Area</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {availabilityData.serviceArea.description}
                </p>
              </div>
            )}
          </div>

          {/* Time Slot Selection */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>Select Time Slot</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedDate 
                  ? `Available time slots for ${selectedDate.toLocaleDateString()}`
                  : 'Select a date first to see available time slots'
                }
              </p>
            </div>

            {selectedDate && isValidating && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading time slots...</span>
                </div>
              </div>
            )}

            {selectedDate && !isValidating && (
              <TimeSlotSelector
                selectedDate={selectedDate}
                timeSlots={timeSlots || []}
                selectedTimeSlot={selectedTimeSlot}
                onTimeSlotSelect={handleTimeSlotSelect}
                isLoading={isValidating}
                className="w-full"
              />
            )}

            {!selectedDate && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Select a date to view available time slots</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selection Summary & Confirmation */}
      {selectedDate && selectedTimeSlot && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="text-lg font-semibold text-green-900">Pickup Scheduled</h4>
              </div>
              
              <div className="space-y-1 text-sm text-green-800">
                <p>
                  <strong>Date:</strong> {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p>
                  <strong>Time:</strong> {selectedTimeSlot.display} 
                  ({selectedTimeSlot.startTime} - {selectedTimeSlot.endTime})
                </p>
                {additionalFee > 0 && (
                  <p className="flex items-center space-x-1">
                    <DollarSign className="h-3 w-3" />
                    <strong>Additional Fee:</strong> 
                    <span>${additionalFee.toFixed(2)}</span>
                  </p>
                )}
              </div>
            </div>

            <Button 
              onClick={handleConfirmPickup}
              disabled={isConfirming}
              className={`ml-4 ${isConfirmed ? 'bg-green-600 hover:bg-green-700' : ''}`}
            >
              {isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Confirming...
                </>
              ) : isConfirmed ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Pickup Confirmed!
                </>
              ) : (
                'Confirm Pickup'
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Restrictions & Guidelines */}
      {availabilityData?.restrictions && availabilityData.restrictions.length > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Service Restrictions:</p>
              <ul className="text-sm space-y-1">
                {availabilityData.restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="text-orange-500">•</span>
                    <span>{restriction.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
