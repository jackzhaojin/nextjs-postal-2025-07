'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { Address, ContactInfo } from '@/lib/types';
import { AddressInput } from '@/components/forms/AddressInput';
import { useShipmentDetailsFormWithPresets } from '@/hooks/useShipmentDetailsFormWithPresets';
import { PackageSummary } from '@/components/ui/PackageSummary';
import { ContextualHelp } from '@/components/ui/ContextualHelp';
import { PerformanceProvider, PerformanceMonitor, useComponentPerformance } from '@/components/ui/PerformanceOptimizer';
import { PackageTypeSelector } from '@/components/forms/PackageTypeSelector';
import { WeightInput } from '@/components/forms/WeightInput';
import { DimensionsInput } from '@/components/forms/DimensionsInput';
import { DeclaredValueInput } from '@/components/forms/DeclaredValueInput';
import { SpecialHandlingSelector } from '@/components/forms/SpecialHandlingSelector';
import { PresetSelector } from '@/components/forms/PresetSelector';

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
  country: 'US',
  isResidential: false,
  locationType: 'commercial',
  locationDescription: '',
  contactInfo: defaultContactInfo
};

function ShipmentDetailsContent() {
  console.log('ShipmentDetailsContent: Rendering');

  // Initialize form state with preset support
  const {
    shipmentDetails,
    validation,
    updateOrigin,
    updateDestination,
    updatePackage,
    progress,
    isDirty,
    isLoading,
    presetState,
    applyPreset,
    clearPreset
  } = useShipmentDetailsFormWithPresets();

  console.log('ShipmentDetailsContent: Form state - isDirty:', isDirty, 'progress:', progress.percentage);

  const handleOriginChange = useCallback((address: Address) => {
    console.log('ShipmentDetailsContent: Origin address changed:', address);
    updateOrigin(address);
  }, [updateOrigin]);

  const handleDestinationChange = useCallback((address: Address) => {
    console.log('ShipmentDetailsContent: Destination address changed:', address);
    updateDestination(address);
  }, [updateDestination]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Shipment Details
            </h1>
            <div className="flex items-center gap-4">
              <PerformanceMonitor compact={true} data-testid="performance-monitor" />
            </div>
          </div>
          
          <p className="text-gray-600 max-w-2xl mx-auto mb-4">
            Enter your package information and pickup/delivery addresses to get started.
          </p>
          
          {/* Progress Indicator */}
          <div className="bg-white rounded-full p-1 max-w-md mx-auto" data-testid="progress-indicator">
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
          {/* Preset Selection Section */}
          <PresetSelector
            selectedPresetId={presetState.selectedPresetId}
            onPresetSelect={(preset) => {
              if (preset) {
                console.log('ShipmentDetailsContent: Applying preset:', preset.name);
                applyPreset(preset);
              } else {
                console.log('ShipmentDetailsContent: Clearing preset');
                clearPreset();
              }
            }}
            isModified={presetState.isModified}
            modifiedFields={presetState.modifiedFields}
            className="bg-white rounded-3xl shadow-sm"
          />

          {/* Origin Address Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Address (Origin)</h3>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <AddressInput
                  value={shipmentDetails.origin || defaultAddress}
                  onChange={handleOriginChange}
                  label=""
                  errors={Object.fromEntries(
                    Object.entries(validation.errors)
                      .filter(([key]) => key.startsWith('origin.'))
                      .map(([key, value]) => [key.replace('origin.', ''), value])
                  )}
                  required={true}
                  showContactInfo={true}
                  type="origin"
                />
              </div>
              <ContextualHelp
                fieldId="origin-address"
                fieldLabel="Origin Address"
                data-testid="help-origin-address"
              />
            </div>
          </div>

          {/* Destination Address Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Address (Destination)</h3>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <AddressInput
                  value={shipmentDetails.destination || defaultAddress}
                  onChange={handleDestinationChange}
                  label=""
                  errors={Object.fromEntries(
                    Object.entries(validation.errors)
                      .filter(([key]) => key.startsWith('destination.'))
                      .map(([key, value]) => [key.replace('destination.', ''), value])
                  )}
                  required={true}
                  showContactInfo={true}
                  type="destination"
                />
              </div>
              <ContextualHelp
                fieldId="destination-address"
                fieldLabel="Destination Address"
                data-testid="help-destination-address"
              />
            </div>
          </div>

          {/* Package Information Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Package Information</h3>
            <div className="space-y-6">
              {/* Package Type Selector */}
              <div>
                <PackageTypeSelector
                  value={shipmentDetails.package?.type || null}
                  onChange={(type) => updatePackage({ type })}
                  className="mb-6"
                />
              </div>

              {/* Weight Input */}
              <div>
                <WeightInput
                  value={shipmentDetails.package?.weight || { value: 0, unit: 'lbs' }}
                  onChange={(weight) => updatePackage({ weight })}
                  packageType={shipmentDetails.package?.type || null}
                  showBillingWeight={true}
                  dimensionalWeight={
                    shipmentDetails.package?.dimensions 
                      ? (shipmentDetails.package.dimensions.length * 
                         shipmentDetails.package.dimensions.width * 
                         shipmentDetails.package.dimensions.height) / 166
                      : 0
                  }
                  className="mb-6"
                />
              </div>

              {/* Dimensions Input */}
              <div>
                <DimensionsInput
                  value={shipmentDetails.package?.dimensions || { length: 0, width: 0, height: 0, unit: 'in' }}
                  onChange={(dimensions) => updatePackage({ dimensions })}
                  packageType={shipmentDetails.package?.type || null}
                  actualWeight={shipmentDetails.package?.weight?.value || 0}
                  showVolume={true}
                  showDimensionalWeight={true}
                  className="mb-6"
                />
              </div>

              {/* Declared Value Input */}
              <div>
                <DeclaredValueInput
                  value={shipmentDetails.package?.declaredValue || 0}
                  currency={shipmentDetails.package?.currency || 'USD'}
                  onValueChange={(value) => updatePackage({ declaredValue: value })}
                  onCurrencyChange={(currency) => updatePackage({ currency })}
                  packageType={shipmentDetails.package?.type || null}
                  showInsurance={true}
                  showCurrencySelector={true}
                  className="mb-6"
                />
              </div>

              {/* Special Handling Selector */}
              <div>
                <SpecialHandlingSelector
                  value={shipmentDetails.package?.specialHandling || []}
                  onChange={(specialHandling) => updatePackage({ specialHandling })}
                  packageWeight={shipmentDetails.package?.weight?.value || 0}
                  packageType={shipmentDetails.package?.type || 'medium'}
                  showFees={true}
                  showCompatibility={true}
                  className="mb-6"
                />
              </div>
            </div>
          </div>

          {/* Package Summary */}
          {shipmentDetails.package && (
            <PackageSummary
              packageInfo={shipmentDetails.package}
              shipmentDetails={shipmentDetails}
              showOptimizations={true}
              showCostImpact={true}
              data-testid="package-summary"
            />
          )}

          {/* Cross-field Validation Errors */}
          {(validation.errors['origin.address_destination.address'] || validation.errors['origin.zip_destination.zip']) && (
            <div className="bg-red-50 border border-red-200 rounded-3xl p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-800 font-medium">
                    {validation.errors['origin.address_destination.address'] || validation.errors['origin.zip_destination.zip']}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Status */}
          <div className="bg-white rounded-3xl p-6 shadow-sm" data-testid="form-status">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {progress.requiredFieldsComplete ? (
                  <>
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="ml-2 text-green-700 font-medium" data-testid="validation-status">
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
                    <span className="ml-2 text-gray-600" data-testid="validation-status">
                      Please complete all required fields to continue
                    </span>
                  </>
                )}
              </div>
              
              {isDirty && isLoading && (
                <div className="flex items-center text-blue-600" data-testid="auto-save-status">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm">Auto-saving...</span>
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

          {/* Navigation Actions */}
          <div className="bg-white rounded-3xl p-6 shadow-sm" data-testid="navigation-actions">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="flex-1">
                {progress.canAdvanceToNextStep ? (
                  <div className="flex items-center text-green-600">
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Ready to get quotes</span>
                  </div>
                ) : (
                  <div className="flex items-center text-gray-500">
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>Complete all required fields to continue</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log('ShipmentDetailsPage: Resetting form');
                    if (window.confirm('Are you sure you want to start over? All entered information will be lost.')) {
                      localStorage.removeItem('currentShipmentDetails');
                      window.location.reload();
                    }
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-colors font-medium"
                  data-testid="start-over-button"
                >
                  Start Over
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    console.log('ShipmentDetailsPage: Navigating to pricing, canAdvance:', progress.canAdvanceToNextStep);
                    console.log('ShipmentDetailsPage: Validation state:', validation);
                    console.log('ShipmentDetailsPage: Shipment details:', shipmentDetails);
                    
                    if (progress.canAdvanceToNextStep) {
                      // Update transaction status before navigation
                      const updatedTransaction = {
                        ...shipmentDetails,
                        status: 'pricing' as const
                      };
                      
                      try {
                        localStorage.setItem('currentShippingTransaction', JSON.stringify({
                          id: Date.now().toString(),
                          shipmentDetails: shipmentDetails,
                          status: 'pricing'
                        }));
                        console.log('ShipmentDetailsPage: Saved transaction to localStorage');
                        
                        window.location.href = '/shipping/pricing';
                      } catch (error) {
                        console.error('ShipmentDetailsPage: Error saving transaction:', error);
                        alert('Error saving shipment details. Please try again.');
                      }
                    } else {
                      console.log('ShipmentDetailsPage: Cannot advance - validation failed');
                    }
                  }}
                  disabled={!progress.canAdvanceToNextStep || isLoading}
                  className={`px-8 py-3 rounded-2xl font-medium transition-all duration-200 ${
                    progress.canAdvanceToNextStep && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  data-testid="get-quotes-button"
                >
                  {isLoading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Get Quotes
                      <svg className="h-5 w-5 ml-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ShipmentDetailsPage() {
  console.log('ShipmentDetailsPage: Initializing with providers');
  
  return (
    <PerformanceProvider enableMonitoring={true}>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading shipping form...</p>
          </div>
        </div>
      }>
        <ShipmentDetailsContent />
      </Suspense>
    </PerformanceProvider>
  );
}
