'use client';

import React, { useState, useCallback } from 'react';
import { Address, ContactInfo } from '@/lib/types';
import { AddressInput } from '@/components/forms/AddressInput';
import { useShipmentDetailsForm } from '@/hooks/useShipmentDetailsForm';

// Default values for the form
const defaultContactInfo: ContactInfo = {
  name: '',
  phone: '',
  email: '',
  company: '',
  extension: ''
};

const defaultAddress: Address = {
  address: '',
  suite: '',
  city: '',
  state: '',
  zip: '',
  country: 'USA',
  isResidential: false,
  locationType: 'commercial',
  locationDescription: '',
  contactInfo: defaultContactInfo
};

export default function ShipmentDetailsPage() {
  console.log('ShipmentDetailsPage: Rendering');

  // Initialize form state
  const {
    shipmentDetails,
    validation,
    updateOrigin,
    updateDestination,
    progress,
    isDirty,
    isLoading
  } = useShipmentDetailsForm();

  console.log('ShipmentDetailsPage: Form state - isDirty:', isDirty, 'progress:', progress.percentage);

  const handleOriginChange = useCallback((address: Address) => {
    console.log('ShipmentDetailsPage: Origin address changed:', address);
    updateOrigin(address);
  }, [updateOrigin]);

  const handleDestinationChange = useCallback((address: Address) => {
    console.log('ShipmentDetailsPage: Destination address changed:', address);
    updateDestination(address);
  }, [updateDestination]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shipment Details
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Enter your package information and pickup/delivery addresses to get started.
          </p>
          
          {/* Progress Indicator */}
          <div className="mt-4 bg-white rounded-full p-1 max-w-md mx-auto">
            <div className="flex items-center">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                {progress.percentage}%
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Origin Address Section */}
          <AddressInput
            value={shipmentDetails.origin || defaultAddress}
            onChange={handleOriginChange}
            label="Pickup Address (Origin)"
            errors={Object.fromEntries(
              Object.entries(validation.errors)
                .filter(([key]) => key.startsWith('origin.'))
                .map(([key, value]) => [key.replace('origin.', ''), value])
            )}
            required={true}
            showContactInfo={true}
            type="origin"
          />

          {/* Destination Address Section */}
          <AddressInput
            value={shipmentDetails.destination || defaultAddress}
            onChange={handleDestinationChange}
            label="Delivery Address (Destination)"
            errors={Object.fromEntries(
              Object.entries(validation.errors)
                .filter(([key]) => key.startsWith('destination.'))
                .map(([key, value]) => [key.replace('destination.', ''), value])
            )}
            required={true}
            showContactInfo={true}
            type="destination"
          />

          {/* Cross-field Validation Errors */}
          {validation.errors['addresses.different'] && (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-800 font-medium">
                    {validation.errors['addresses.different']}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Status */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {progress.requiredFieldsComplete ? (
                  <>
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="ml-2 text-green-700 font-medium">
                      All required fields completed
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="ml-2 text-gray-600">
                      Please complete all required fields to continue
                    </span>
                  </>
                )}
              </div>
              
              {isDirty && isLoading && (
                <div className="flex items-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm">Saving...</span>
                </div>
              )}
            </div>
          </div>

          {/* Validation Warnings */}
          {Object.keys(validation.warnings).length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-3xl p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-yellow-800 font-medium mb-2">
                    Please review the following:
                  </h3>
                  <ul className="text-yellow-700 space-y-1">
                    {Object.entries(validation.warnings).map(([key, warning]) => (
                      <li key={key} className="text-sm">• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
