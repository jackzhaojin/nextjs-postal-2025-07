'use client';

import React, { useState, useCallback, Suspense } from 'react';
import { Address, ContactInfo } from '@/lib/types';
import { AddressInput } from '@/components/forms/AddressInput';
import { useShipmentDetailsForm } from '@/hooks/useShipmentDetailsForm';
import { PackageSummary } from '@/components/ui/PackageSummary';
import { ContextualHelp } from '@/components/ui/ContextualHelp';
import { ProgressiveDisclosureProvider, DisclosureSection, ModeToggle } from '@/components/ui/ProgressiveDisclosure';
import { PerformanceProvider, PerformanceMonitor, useComponentPerformance } from '@/components/ui/PerformanceOptimizer';
import { AnalyticsProvider, AnalyticsDashboard, useFieldAnalytics } from '@/components/ui/UserAnalytics';

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

function ShipmentDetailsContent() {
  console.log('ShipmentDetailsContent: Rendering');
  
  const { renderCount } = useComponentPerformance('ShipmentDetailsContent');

  // Initialize form state
  const {
    shipmentDetails,
    validation,
    updateOrigin,
    updateDestination,
    updatePackage,
    progress,
    isDirty,
    isLoading
  } = useShipmentDetailsForm();

  // Analytics for origin address
  const originAnalytics = useFieldAnalytics('origin-address');
  const destinationAnalytics = useFieldAnalytics('destination-address');

  console.log('ShipmentDetailsContent: Form state - isDirty:', isDirty, 'progress:', progress.percentage, 'renders:', renderCount);

  const handleOriginChange = useCallback((address: Address) => {
    console.log('ShipmentDetailsContent: Origin address changed:', address);
    updateOrigin(address);
    originAnalytics.handleChange(address);
  }, [updateOrigin, originAnalytics]);

  const handleDestinationChange = useCallback((address: Address) => {
    console.log('ShipmentDetailsContent: Destination address changed:', address);
    updateDestination(address);
    destinationAnalytics.handleChange(address);
  }, [updateDestination, destinationAnalytics]);

  const handleHelpUsed = useCallback((fieldId: string, helpId: string) => {
    console.log('ShipmentDetailsContent: Help used:', fieldId, helpId);
    if (fieldId === 'origin-address') {
      originAnalytics.handleHelpUsed(helpId);
    } else if (fieldId === 'destination-address') {
      destinationAnalytics.handleHelpUsed(helpId);
    }
  }, [originAnalytics, destinationAnalytics]);

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
              <ModeToggle compact={true} data-testid="mode-toggle" />
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
          {/* Origin Address Section */}
          <DisclosureSection
            title="Pickup Address (Origin)"
            level="basic"
            fieldId="origin-section"
            className="bg-white rounded-3xl p-6 shadow-sm"
          >
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
                  onFocus={originAnalytics.handleFocus}
                  onBlur={originAnalytics.handleBlur}
                />
              </div>
              <ContextualHelp
                fieldId="origin-address"
                fieldLabel="Origin Address"
                onHelpUsed={handleHelpUsed}
                data-testid="help-origin-address"
              />
            </div>
          </DisclosureSection>

          {/* Destination Address Section */}
          <DisclosureSection
            title="Delivery Address (Destination)"
            level="basic"
            fieldId="destination-section"
            className="bg-white rounded-3xl p-6 shadow-sm"
          >
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
                  onFocus={destinationAnalytics.handleFocus}
                  onBlur={destinationAnalytics.handleBlur}
                />
              </div>
              <ContextualHelp
                fieldId="destination-address"
                fieldLabel="Destination Address"
                onHelpUsed={handleHelpUsed}
                data-testid="help-destination-address"
              />
            </div>
          </DisclosureSection>

          {/* Package Information Section */}
          <DisclosureSection
            title="Package Information"
            level="basic"
            fieldId="package-section"
            className="bg-white rounded-3xl p-6 shadow-sm"
          >
            <div className="space-y-6">
              {/* Basic Package Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (lbs)
                    <ContextualHelp
                      fieldId="package-weight"
                      fieldLabel="Package Weight"
                      onHelpUsed={handleHelpUsed}
                      size="sm"
                      className="ml-1"
                      data-testid="help-package-weight"
                    />
                  </label>
                  <input
                    type="number"
                    name="package.weight.value"
                    step="0.1"
                    min="0.1"
                    placeholder="Enter weight"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={shipmentDetails.package?.weight?.value || ''}
                    onChange={(e) => updatePackage({
                      weight: { ...shipmentDetails.package?.weight, value: parseFloat(e.target.value) || 0 }
                    })}
                    data-testid="package-weight-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Declared Value ($)
                    <ContextualHelp
                      fieldId="declared-value"
                      fieldLabel="Declared Value"
                      onHelpUsed={handleHelpUsed}
                      size="sm"
                      className="ml-1"
                    />
                  </label>
                  <input
                    type="number"
                    name="package.declaredValue"
                    step="1"
                    min="1"
                    placeholder="Enter value"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={shipmentDetails.package?.declaredValue || ''}
                    onChange={(e) => updatePackage({
                      declaredValue: parseFloat(e.target.value) || 0
                    })}
                  />
                </div>
              </div>

              {/* Dimensions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dimensions (L × W × H in inches)
                  <ContextualHelp
                    fieldId="package-dimensions"
                    fieldLabel="Package Dimensions"
                    onHelpUsed={handleHelpUsed}
                    size="sm"
                    className="ml-1"
                  />
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    name="package.dimensions.length"
                    placeholder="Length"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={shipmentDetails.package?.dimensions?.length || ''}
                    onChange={(e) => updatePackage({
                      dimensions: { 
                        ...shipmentDetails.package?.dimensions, 
                        length: parseFloat(e.target.value) || 0 
                      }
                    })}
                  />
                  <input
                    type="number"
                    name="package.dimensions.width"
                    placeholder="Width"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={shipmentDetails.package?.dimensions?.width || ''}
                    onChange={(e) => updatePackage({
                      dimensions: { 
                        ...shipmentDetails.package?.dimensions, 
                        width: parseFloat(e.target.value) || 0 
                      }
                    })}
                  />
                  <input
                    type="number"
                    name="package.dimensions.height"
                    placeholder="Height"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={shipmentDetails.package?.dimensions?.height || ''}
                    onChange={(e) => updatePackage({
                      dimensions: { 
                        ...shipmentDetails.package?.dimensions, 
                        height: parseFloat(e.target.value) || 0 
                      }
                    })}
                  />
                </div>
              </div>
            </div>
          </DisclosureSection>

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

          {/* Analytics Dashboard */}
          <DisclosureSection
            title="Usage Analytics"
            level="expert"
            fieldId="analytics-section"
            defaultExpanded={false}
          >
            <AnalyticsDashboard 
              showFieldDetails={true} 
              showExportButton={false}
              data-testid="analytics-dashboard"
            />
          </DisclosureSection>

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

export default function ShipmentDetailsPage() {
  console.log('ShipmentDetailsPage: Initializing with providers');
  
  return (
    <AnalyticsProvider enabled={true}>
      <PerformanceProvider enableMonitoring={true}>
        <ProgressiveDisclosureProvider initialMode="basic" initialUserLevel="beginner">
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
        </ProgressiveDisclosureProvider>
      </PerformanceProvider>
    </AnalyticsProvider>
  );
}
