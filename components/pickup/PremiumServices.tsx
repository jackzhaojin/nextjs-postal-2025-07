'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Star, 
  Calendar as CalendarIcon, 
  Clock, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Crown,
  Zap,
  Phone,
  MapPin,
  Info
} from 'lucide-react';
import { 
  PremiumServiceOptions, 
  PremiumService, 
  CustomService, 
  TimeSlot,
  ValidationError 
} from '@/lib/types';

interface PremiumServicesProps {
  services?: PremiumServiceOptions;
  onServicesUpdate: (services: PremiumServiceOptions) => void;
  pickupDate?: string;
  serviceArea: 'full' | 'limited' | 'major-cities';
  onValidation?: (isValid: boolean, errors: ValidationError[]) => void;
  className?: string;
}

/**
 * PremiumServices Component
 * 
 * Manages premium service options for pickup scheduling:
 * - Weekend pickup with additional fees
 * - Holiday pickup availability and pricing
 * - After-hours pickup scheduling
 * - Special arrangement requests
 * - Dynamic availability based on service area
 * - Transparent pricing with fee breakdown
 * - Custom scheduling options
 */
export function PremiumServices({
  services,
  onServicesUpdate,
  pickupDate,
  serviceArea,
  onValidation,
  className = ''
}: PremiumServicesProps) {
  console.log('⭐ [PREMIUM-SERVICES] Rendering premium services component');

  // Default premium service options
  const defaultServices: PremiumServiceOptions = {
    weekendPickup: {
      available: serviceArea !== 'limited',
      additionalFee: 50,
      conditions: ['Subject to carrier availability', 'Limited time slots', 'Advance booking required'],
      timeSlots: [
        { id: 'sat-morning', display: 'Saturday Morning', startTime: '09:00', endTime: '12:00', availability: 'available', additionalFee: 0 },
        { id: 'sat-afternoon', display: 'Saturday Afternoon', startTime: '13:00', endTime: '16:00', availability: 'limited', additionalFee: 25 }
      ],
      advanceBookingRequired: 48, // hours
      serviceArea: serviceArea
    },
    holidayPickup: {
      available: serviceArea === 'full',
      additionalFee: 100,
      conditions: ['Very limited availability', 'Premium pricing applies', 'Major holidays excluded'],
      timeSlots: [
        { id: 'holiday-morning', display: 'Holiday Morning', startTime: '10:00', endTime: '14:00', availability: 'limited', additionalFee: 0 }
      ],
      advanceBookingRequired: 72, // hours
      serviceArea: serviceArea
    },
    afterHoursPickup: {
      available: true,
      additionalFee: 75,
      conditions: ['After 6 PM or before 8 AM', 'Custom arrangement required', 'Additional security measures'],
      timeSlots: [
        { id: 'early-morning', display: 'Early Morning', startTime: '06:00', endTime: '08:00', availability: 'available', additionalFee: 0 },
        { id: 'evening', display: 'Evening', startTime: '18:00', endTime: '20:00', availability: 'available', additionalFee: 0 },
        { id: 'night', display: 'Night', startTime: '20:00', endTime: '22:00', availability: 'limited', additionalFee: 50 }
      ],
      advanceBookingRequired: 24, // hours
      serviceArea: serviceArea
    },
    specialArrangements: []
  };

  const [currentServices, setCurrentServices] = useState<PremiumServiceOptions>(
    services || defaultServices
  );
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    pickupDate ? new Date(pickupDate) : undefined
  );
  const [customRequestText, setCustomRequestText] = useState('');

  // Update services when prop changes
  useEffect(() => {
    if (services) {
      console.log('⭐ [PREMIUM-SERVICES] Updating services from props');
      setCurrentServices(services);
    }
  }, [services]);

  // Validation logic
  const validateServices = useCallback((servicesConfig: PremiumServiceOptions): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Validate special arrangements
    servicesConfig.specialArrangements.forEach((arrangement, index) => {
      if (!arrangement.description.trim()) {
        errors.push({
          field: `specialArrangements[${index}].description`,
          message: `Special arrangement #${index + 1} requires a description`,
          code: 'ARRANGEMENT_DESCRIPTION_REQUIRED'
        });
      }
    });

    // Check if selected date is weekend and weekend service is not available
    if (selectedDate) {
      const dayOfWeek = selectedDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
      
      if (isWeekend && !servicesConfig.weekendPickup.available) {
        errors.push({
          field: 'weekendPickup',
          message: 'Weekend pickup not available in your service area',
          code: 'WEEKEND_NOT_AVAILABLE'
        });
      }
    }

    return errors;
  }, [selectedDate]);

  // Update services and validate
  const updateServices = useCallback((newServices: PremiumServiceOptions) => {
    console.log('⭐ [PREMIUM-SERVICES] Updating services:', newServices);
    
    setCurrentServices(newServices);
    const errors = validateServices(newServices);
    setValidationErrors(errors);
    
    if (onValidation) {
      onValidation(errors.length === 0, errors);
    }
    
    onServicesUpdate(newServices);
  }, [onServicesUpdate, validateServices, onValidation]);

  // Toggle premium service
  const togglePremiumService = useCallback((serviceType: keyof PremiumServiceOptions) => {
    if (serviceType === 'specialArrangements') return; // Can't toggle special arrangements
    
    const service = currentServices[serviceType] as PremiumService;
    updateServices({
      ...currentServices,
      [serviceType]: {
        ...service,
        available: !service.available
      }
    });
  }, [currentServices, updateServices]);

  // Add special arrangement
  const addSpecialArrangement = useCallback(() => {
    if (!customRequestText.trim()) return;
    
    const newArrangement: CustomService = {
      id: `custom-${Date.now()}`,
      description: customRequestText.trim(),
      available: true,
      estimatedFee: 0,
      requiresApproval: true,
      contactRequired: true,
      specialConditions: ['Subject to carrier approval', 'Pricing determined case-by-case']
    };

    updateServices({
      ...currentServices,
      specialArrangements: [...currentServices.specialArrangements, newArrangement]
    });

    setCustomRequestText('');
  }, [currentServices, updateServices, customRequestText]);

  // Remove special arrangement
  const removeSpecialArrangement = useCallback((arrangementId: string) => {
    updateServices({
      ...currentServices,
      specialArrangements: currentServices.specialArrangements.filter(arr => arr.id !== arrangementId)
    });
  }, [currentServices, updateServices]);

  // Calculate total additional fees
  const calculateTotalFees = useCallback(() => {
    let total = 0;
    
    if (currentServices.weekendPickup.available) {
      total += currentServices.weekendPickup.additionalFee;
    }
    
    if (currentServices.holidayPickup.available) {
      total += currentServices.holidayPickup.additionalFee;
    }
    
    if (currentServices.afterHoursPickup.available) {
      total += currentServices.afterHoursPickup.additionalFee;
    }
    
    return total;
  }, [currentServices]);

  // Check if date is weekend
  const isWeekendDate = (date: Date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  // Check if date is holiday
  const isHolidayDate = (date: Date) => {
    // Simplified holiday check - in real implementation, use proper holiday calendar
    const holidays = [
      '2025-01-01', // New Year
      '2025-07-04', // Independence Day
      '2025-12-25'  // Christmas
    ];
    const dateStr = date.toISOString().split('T')[0];
    return holidays.includes(dateStr);
  };

  // Get service availability badge
  const getAvailabilityBadge = (service: PremiumService) => {
    if (!service.available) {
      return <Badge variant="destructive">Not Available</Badge>;
    }
    
    switch (service.serviceArea) {
      case 'full':
        return <Badge variant="default">Available</Badge>;
      case 'limited':
        return <Badge variant="secondary">Limited</Badge>;
      case 'major-cities':
        return <Badge variant="outline">Major Cities Only</Badge>;
      default:
        return <Badge variant="default">Available</Badge>;
    }
  };

  // Get error for field
  const getFieldError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Service Area Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Service Area: {serviceArea}</h4>
              <p className="text-sm text-blue-800">
                {serviceArea === 'full' && 'Full premium service availability in your area'}
                {serviceArea === 'limited' && 'Limited premium service availability - some options may not be available'}
                {serviceArea === 'major-cities' && 'Premium services available for major cities only'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekend Pickup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Weekend Pickup
            </div>
            <div className="flex items-center gap-2">
              {getAvailabilityBadge(currentServices.weekendPickup)}
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                +${currentServices.weekendPickup.additionalFee}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={currentServices.weekendPickup.available}
              onCheckedChange={() => togglePremiumService('weekendPickup')}
              disabled={serviceArea === 'limited'}
            />
            <div>
              <Label className="font-medium">Enable Saturday pickup</Label>
              <p className="text-sm text-gray-600">
                Schedule pickup on Saturdays with additional fee
              </p>
            </div>
          </div>

          {currentServices.weekendPickup.available && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium mb-2 block">Available Time Slots</Label>
                  <div className="space-y-2">
                    {currentServices.weekendPickup.timeSlots.map(slot => (
                      <div key={slot.id} className="border rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{slot.display}</div>
                          <div className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={slot.availability === 'available' ? 'default' : 'secondary'}
                          >
                            {slot.availability}
                          </Badge>
                          {(slot.additionalFee ?? 0) > 0 && (
                            <Badge variant="outline">+${slot.additionalFee}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="font-medium mb-2 block">Conditions</Label>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {currentServices.weekendPickup.conditions.map((condition, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        {condition}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Advance Booking Required</span>
                    </div>
                    <p className="text-sm text-amber-700 mt-1">
                      Must be booked at least {currentServices.weekendPickup.advanceBookingRequired} hours in advance
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Holiday Pickup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-purple-600" />
              Holiday Pickup
            </div>
            <div className="flex items-center gap-2">
              {getAvailabilityBadge(currentServices.holidayPickup)}
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                +${currentServices.holidayPickup.additionalFee}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={currentServices.holidayPickup.available}
              onCheckedChange={() => togglePremiumService('holidayPickup')}
              disabled={serviceArea !== 'full'}
            />
            <div>
              <Label className="font-medium">Enable holiday pickup</Label>
              <p className="text-sm text-gray-600">
                Schedule pickup on select holidays (very limited availability)
              </p>
            </div>
          </div>

          {currentServices.holidayPickup.available && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium mb-2 block">Available Time Slots</Label>
                <div className="space-y-2">
                  {currentServices.holidayPickup.timeSlots.map(slot => (
                    <div key={slot.id} className="border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{slot.display}</div>
                        <div className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</div>
                      </div>
                      <Badge variant="secondary">{slot.availability}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-medium mb-2 block">Important Notes</Label>
                <ul className="text-sm text-gray-600 space-y-1">
                  {currentServices.holidayPickup.conditions.map((condition, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      {condition}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Premium Service</span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">
                    {currentServices.holidayPickup.advanceBookingRequired} hour advance booking required
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* After Hours Pickup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-600" />
              After Hours Pickup
            </div>
            <div className="flex items-center gap-2">
              {getAvailabilityBadge(currentServices.afterHoursPickup)}
              <Badge variant="outline" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                +${currentServices.afterHoursPickup.additionalFee}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={currentServices.afterHoursPickup.available}
              onCheckedChange={() => togglePremiumService('afterHoursPickup')}
            />
            <div>
              <Label className="font-medium">Enable after hours pickup</Label>
              <p className="text-sm text-gray-600">
                Schedule pickup outside normal business hours (6 AM - 6 PM)
              </p>
            </div>
          </div>

          {currentServices.afterHoursPickup.available && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="font-medium mb-2 block">Available Time Slots</Label>
                <div className="space-y-2">
                  {currentServices.afterHoursPickup.timeSlots.map(slot => (
                    <div key={slot.id} className="border rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{slot.display}</div>
                        <div className="text-sm text-gray-600">{slot.startTime} - {slot.endTime}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={slot.availability === 'available' ? 'default' : 'secondary'}
                        >
                          {slot.availability}
                        </Badge>
                        {(slot.additionalFee ?? 0) > 0 && (
                          <Badge variant="outline">+${slot.additionalFee}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="font-medium mb-2 block">Requirements</Label>
                <ul className="text-sm text-gray-600 space-y-1">
                  {currentServices.afterHoursPickup.conditions.map((condition, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-gray-400 mt-1">•</span>
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Special Arrangements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-600" />
            Special Arrangements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="font-medium">Custom Pickup Requirements</Label>
            <p className="text-sm text-gray-600 mb-3">
              Describe any special pickup arrangements or requirements not covered by standard options
            </p>
            <div className="flex gap-2">
              <Textarea
                value={customRequestText}
                onChange={(e) => setCustomRequestText(e.target.value)}
                placeholder="Describe your special arrangement needs (e.g., specific equipment, unusual timing, security requirements)..."
                rows={3}
                className="flex-1"
              />
              <Button
                onClick={addSpecialArrangement}
                disabled={!customRequestText.trim()}
                className="self-start"
              >
                Add Request
              </Button>
            </div>
          </div>

          {currentServices.specialArrangements.length > 0 && (
            <div>
              <Label className="font-medium mb-3 block">Current Special Arrangements</Label>
              <div className="space-y-3">
                {currentServices.specialArrangements.map((arrangement, index) => (
                  <div key={arrangement.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{arrangement.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {arrangement.requiresApproval && (
                            <Badge variant="outline">Requires Approval</Badge>
                          )}
                          {arrangement.contactRequired && (
                            <Badge variant="outline">Contact Required</Badge>
                          )}
                          <Badge variant="secondary">
                            {arrangement.estimatedFee > 0 ? `Est. $${arrangement.estimatedFee}` : 'Pricing TBD'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSpecialArrangement(arrangement.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                    {arrangement.specialConditions.length > 0 && (
                      <div className="text-sm text-gray-600">
                        <p className="font-medium mb-1">Conditions:</p>
                        <ul className="space-y-1">
                          {arrangement.specialConditions.map((condition, condIndex) => (
                            <li key={condIndex} className="flex items-start gap-2">
                              <span className="text-gray-400 mt-1">•</span>
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Summary */}
      {calculateTotalFees() > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <DollarSign className="h-5 w-5" />
              Premium Service Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentServices.weekendPickup.available && (
                <div className="flex justify-between items-center">
                  <span>Weekend Pickup</span>
                  <span className="font-medium">+${currentServices.weekendPickup.additionalFee}</span>
                </div>
              )}
              {currentServices.holidayPickup.available && (
                <div className="flex justify-between items-center">
                  <span>Holiday Pickup</span>
                  <span className="font-medium">+${currentServices.holidayPickup.additionalFee}</span>
                </div>
              )}
              {currentServices.afterHoursPickup.available && (
                <div className="flex justify-between items-center">
                  <span>After Hours Pickup</span>
                  <span className="font-medium">+${currentServices.afterHoursPickup.additionalFee}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between items-center font-semibold text-green-800">
                <span>Total Additional Fees</span>
                <span>+${calculateTotalFees()}</span>
              </div>
            </div>
            <p className="text-sm text-green-700 mt-3">
              These fees will be added to your total shipping cost and are subject to final carrier approval.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Validation Summary */}
      {validationErrors.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900 mb-2">Please address the following issues:</h4>
                <ul className="space-y-1 text-sm text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
