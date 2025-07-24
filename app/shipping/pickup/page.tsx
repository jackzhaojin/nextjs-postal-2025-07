'use client';

import React, { useState } from 'react';
import { PickupCalendarInterface } from '@/components/pickup/PickupCalendarInterface';
import { PickupLocationForm } from '@/components/pickup/PickupLocationForm';
import { PickupContactForm } from '@/components/pickup/PickupContactForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, CheckCircle, Clock, MapPin, Calendar, User } from 'lucide-react';
import { useShipmentDetailsForm } from '@/hooks/useShipmentDetailsForm';
import { LocationInfo, ValidationError, PickupContactInfo, PickupInstructionSet } from '@/lib/types';
import Link from 'next/link';

/**
 * Step 4: Pickup Scheduling Page
 * 
 * Features:
 * - Interactive pickup calendar interface (Task 7.1)
 * - Pickup location and requirements form (Task 7.2) 
 * - Pickup contact and instructions form (Task 7.3)
 * - Tabbed interface for better organization
 * - Real-time availability data
 * - Integration with form state management
 * - Mobile-responsive design
 * - Progress tracking
 */
export default function PickupPage() {
  console.log('🗓️ [PICKUP-PAGE] Rendering pickup scheduling page');

  const { shipmentDetails, updatePickupDetails } = useShipmentDetailsForm();
  
  const [activeTab, setActiveTab] = useState('location');
  const [locationValid, setLocationValid] = useState(false);
  const [locationErrors, setLocationErrors] = useState<ValidationError[]>([]);
  const [contactValid, setContactValid] = useState(false);
  const [contactErrors, setContactErrors] = useState<ValidationError[]>([]);

  // Handle location info updates
  const handleLocationInfoChange = async (locationInfo: LocationInfo) => {
    console.log('📍 [PICKUP-PAGE] Location info changed:', locationInfo);
    
    try {
      await updatePickupDetails({
        locationInfo
      });
    } catch (error) {
      console.error('❌ [PICKUP-PAGE] Failed to update location info:', error);
    }
  };

  // Handle location validation
  const handleLocationValidation = (isValid: boolean, errors: ValidationError[]) => {
    console.log('📍 [PICKUP-PAGE] Location validation:', { isValid, errorCount: errors.length });
    setLocationValid(isValid);
    setLocationErrors(errors);
  };

  // Handle contact and instructions data updates (Task 7.3)
  const handleContactDataUpdate = async (data: {
    primaryContact: PickupContactInfo;
    backupContact?: PickupContactInfo;
    instructions: PickupInstructionSet;
    equipmentRequirements: any;
  }) => {
    console.log('👤 [PICKUP-PAGE] Contact data updated:', data);
    
    try {
      await updatePickupDetails({
        primaryContact: data.primaryContact,
        backupContact: data.backupContact,
        instructionSet: data.instructions,
        equipmentRequirements: data.equipmentRequirements
      });
    } catch (error) {
      console.error('❌ [PICKUP-PAGE] Failed to update contact data:', error);
    }
  };

  // Handle contact validation
  const handleContactValidation = (isValid: boolean, errors: ValidationError[]) => {
    console.log('👤 [PICKUP-PAGE] Contact validation:', { isValid, errorCount: errors.length });
    setContactValid(isValid);
    setContactErrors(errors);
  };

  // Check if we have required data
  const hasOriginAddress = shipmentDetails?.origin;
  const hasPackageInfo = shipmentDetails?.package;

  if (!hasOriginAddress || !hasPackageInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 max-w-md text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Missing Required Information
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Please complete the shipment details and package information before scheduling pickup.
          </p>
          <Link href="/shipping">
            <Button>Return to Shipment Details</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Schedule Pickup</h1>
              <p className="mt-1 text-sm text-gray-600">
                Configure pickup location details and select your preferred date and time
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                Step 4 of 6
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="py-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: '66.7%' }}
                data-testid="progress-bar"
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Details</span>
              <span>Pricing</span>
              <span>Payment</span>
              <span className="font-medium text-blue-600">Pickup</span>
              <span>Review</span>
              <span>Confirm</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-lg p-1 bg-gray-100">
            <button
              onClick={() => setActiveTab('location')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'location'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-location"
            >
              <MapPin className="h-4 w-4" />
              <span>Location Details</span>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'schedule'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-schedule"
            >
              <Calendar className="h-4 w-4" />
              <span>Date & Time</span>
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'contact'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              data-testid="tab-contact"
            >
              <User className="h-4 w-4" />
              <span>Contact & Instructions</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'location' && (
          <div className="space-y-6">
            <PickupLocationForm
              pickupAddress={shipmentDetails.origin}
              packageInfo={shipmentDetails.package}
              locationInfo={shipmentDetails.pickupDetails?.locationInfo}
              onLocationInfoChange={handleLocationInfoChange}
              onValidation={handleLocationValidation}
            />
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Calendar Interface - Main Content */}
            <div className="lg:col-span-3">
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    Select Pickup Date and Time
                  </h2>
                  <p className="text-sm text-gray-600">
                    Choose your preferred pickup date and time slot. All times are in your local timezone.
                  </p>
                </div>

                <PickupCalendarInterface />
              </Card>
            </div>

            {/* Sidebar - Pickup Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Pickup Guidelines */}
              <Card className="p-4" data-testid="pickup-guidelines">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Pickup Guidelines
                </h3>
                <div className="space-y-3 text-xs text-gray-600">
                  <div className="flex items-start space-x-2">
                    <Clock className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Minimum 3 business days advance notice required</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Clock className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Same-day cutoff: 3:00 PM for next business day pickup</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Clock className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Evening pickups (5-7 PM) include $25 premium fee</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <Clock className="h-3 w-3 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>Weekend pickups include $50 premium fee (where available)</span>
                  </div>
                </div>
              </Card>

              {/* Service Areas */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Service Areas
                </h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Metropolitan</span>
                    <span className="text-green-600 font-medium">Full Service</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Standard</span>
                    <span className="text-green-600 font-medium">Full Service</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Limited</span>
                    <span className="text-yellow-600 font-medium">Reduced Hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Remote</span>
                    <span className="text-yellow-600 font-medium">Limited Days</span>
                  </div>
                </div>
              </Card>

              {/* Time Slots Info */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Available Time Slots
                </h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Morning (8 AM - 12 PM)</span>
                    <span className="text-gray-900 font-medium">Standard Rate</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Afternoon (12 PM - 5 PM)</span>
                    <span className="text-gray-900 font-medium">Standard Rate</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Evening (5 PM - 7 PM)</span>
                    <span className="text-orange-600 font-medium">+$25 Fee</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Task 7.3: Contact & Instructions Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <PickupContactForm
              primaryContact={shipmentDetails.pickupDetails?.primaryContact}
              backupContact={shipmentDetails.pickupDetails?.backupContact}
              instructions={shipmentDetails.pickupDetails?.instructionSet}
              equipmentRequirements={shipmentDetails.pickupDetails?.equipmentRequirements}
              locationType={shipmentDetails.pickupDetails?.locationInfo?.type || 'ground-level'}
              packageInfo={shipmentDetails.package}
              onDataUpdate={handleContactDataUpdate}
              validationErrors={contactErrors}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link href="/shipping/payment">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Payment</span>
            </Button>
          </Link>
          
          <Link href="/shipping/review">
            <Button className="flex items-center space-x-2">
              <span>Continue to Review</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
