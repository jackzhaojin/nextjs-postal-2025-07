'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AddressInput } from '@/components/forms/AddressInput';
import { useShipmentDetailsForm } from '@/hooks/useShipmentDetailsForm-enhanced';
import { Address, ShipmentDetails } from '@/lib/types';

interface Task44DemoProps {
  className?: string;
}

/**
 * Demo component showcasing Task 4.4 Advanced Form State Management features
 */
export function Task44Demo({ className }: Task44DemoProps) {
  console.log('Task44Demo: Initializing advanced form state management demo');

  // Use the enhanced form hook with all features enabled
  const {
    shipmentDetails,
    validation,
    autoSave,
    progress,
    updateOrigin,
    updateDestination,
    updatePackage,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateAll,
    isDirty,
    isLoading,
    save,
    reset,
    forceSync,
    resolveConflict,
    canNavigateNext,
    getValidationSummary
  } = useShipmentDetailsForm(undefined, {
    autoSave: true,
    autoSaveDelay: 2000,
    validateOnChange: true,
    validateOnBlur: true,
    enableConflictResolution: true,
    storageKey: 'task44DemoShipmentDetails'
  });

  // Local state for demo controls
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [simulateConflict, setSimulateConflict] = useState(false);

  console.log('Task44Demo: Current state:', {
    isDirty,
    isValid: validation.isValid,
    progress: progress.percentage,
    autoSaveState: autoSave
  });

  // Simulate conflict for testing
  const handleSimulateConflict = () => {
    console.log('Task44Demo: Simulating conflict');
    
    if (typeof window !== 'undefined') {
      const conflictData = {
        ...shipmentDetails,
        origin: {
          ...shipmentDetails.origin,
          address: '999 Conflict Street'
        }
      };
      
      localStorage.setItem('task44DemoShipmentDetails', JSON.stringify(conflictData));
      localStorage.setItem('task44DemoShipmentDetails_instance', 'different-instance');
      setSimulateConflict(true);
    }
  };

  // Get validation summary for display
  const validationSummary = getValidationSummary();

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Advanced Form State Management - Task 4.4</CardTitle>
          <p className="text-muted-foreground">
            Real-time validation, auto-save, conflict resolution, and progress tracking
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Form State Indicators */}
          <div className="flex flex-wrap gap-4 p-4 bg-muted/50 rounded-lg">
            <Badge variant={isDirty ? 'destructive' : 'secondary'}>
              {isDirty ? 'Unsaved Changes' : 'Saved'}
            </Badge>
            
            <Badge variant={validation.isValid ? 'default' : 'destructive'}>
              {validation.isValid ? 'Valid' : 'Invalid'}
            </Badge>
            
            {autoSave.isAutoSaving && (
              <Badge variant="outline">Saving...</Badge>
            )}
            
            {autoSave.lastAutoSave && !autoSave.isAutoSaving && (
              <Badge variant="secondary">
                Auto-saved at {autoSave.lastAutoSave.toLocaleTimeString()}
              </Badge>
            )}
            
            {autoSave.conflictDetected && (
              <Badge variant="destructive">Conflict Detected</Badge>
            )}
          </div>

          {/* Progress Tracking */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Progress:</Label>
              <span data-testid="progress-percentage" className="text-sm font-medium">
                {progress.percentage}%
              </span>
            </div>
            <Progress value={progress.percentage} className="w-full" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{progress.completedFields}/{progress.totalFields} fields completed</span>
              <span>
                Required fields: {progress.requiredFieldsComplete ? 'Complete' : 'Incomplete'}
              </span>
            </div>
          </div>

          <Separator />

          {/* Origin Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Origin Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin-address">Origin Address</Label>
                <Input
                  id="origin-address"
                  value={shipmentDetails.origin.address}
                  onChange={(e) => updateOrigin({ address: e.target.value })}
                  onBlur={() => setFieldTouched('origin.address')}
                  className={validation.errors['origin.address'] ? 'border-destructive' : ''}
                />
                {validation.errors['origin.address'] && (
                  <p className="text-sm text-destructive">{validation.errors['origin.address']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin-city">Origin City</Label>
                <Input
                  id="origin-city"
                  value={shipmentDetails.origin.city}
                  onChange={(e) => updateOrigin({ city: e.target.value })}
                  onBlur={() => setFieldTouched('origin.city')}
                  className={validation.errors['origin.city'] ? 'border-destructive' : ''}
                />
                {validation.errors['origin.city'] && (
                  <p className="text-sm text-destructive">{validation.errors['origin.city']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin-state">Origin State</Label>
                <Input
                  id="origin-state"
                  value={shipmentDetails.origin.state}
                  onChange={(e) => updateOrigin({ state: e.target.value })}
                  onBlur={() => setFieldTouched('origin.state')}
                  className={validation.errors['origin.state'] ? 'border-destructive' : ''}
                />
                {validation.errors['origin.state'] && (
                  <p className="text-sm text-destructive">{validation.errors['origin.state']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin-zip">Origin ZIP</Label>
                <Input
                  id="origin-zip"
                  value={shipmentDetails.origin.zip}
                  onChange={(e) => updateOrigin({ zip: e.target.value })}
                  onBlur={() => setFieldTouched('origin.zip')}
                  className={validation.errors['origin.zip'] ? 'border-destructive' : ''}
                />
                {validation.errors['origin.zip'] && (
                  <p className="text-sm text-destructive">{validation.errors['origin.zip']}</p>
                )}
              </div>
            </div>

            {/* Origin Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin-contact-name">Contact Name</Label>
                <Input
                  id="origin-contact-name"
                  value={shipmentDetails.origin.contactInfo.name}
                  onChange={(e) => updateOrigin({ 
                    contactInfo: { ...shipmentDetails.origin.contactInfo, name: e.target.value }
                  })}
                  onBlur={() => setFieldTouched('origin.contactInfo.name')}
                  className={validation.errors['origin.contactInfo.name'] ? 'border-destructive' : ''}
                />
                {validation.errors['origin.contactInfo.name'] && (
                  <p className="text-sm text-destructive">{validation.errors['origin.contactInfo.name']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin-contact-phone">Contact Phone</Label>
                <Input
                  id="origin-contact-phone"
                  value={shipmentDetails.origin.contactInfo.phone}
                  onChange={(e) => updateOrigin({ 
                    contactInfo: { ...shipmentDetails.origin.contactInfo, phone: e.target.value }
                  })}
                  onBlur={() => setFieldTouched('origin.contactInfo.phone')}
                  className={validation.errors['origin.contactInfo.phone'] ? 'border-destructive' : ''}
                />
                {validation.errors['origin.contactInfo.phone'] && (
                  <p className="text-sm text-destructive">{validation.errors['origin.contactInfo.phone']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="origin-contact-email">Contact Email</Label>
                <Input
                  id="origin-contact-email"
                  type="email"
                  value={shipmentDetails.origin.contactInfo.email}
                  onChange={(e) => updateOrigin({ 
                    contactInfo: { ...shipmentDetails.origin.contactInfo, email: e.target.value }
                  })}
                  onBlur={() => setFieldTouched('origin.contactInfo.email')}
                  className={validation.errors['origin.contactInfo.email'] ? 'border-destructive' : ''}
                />
                {validation.errors['origin.contactInfo.email'] && (
                  <p className="text-sm text-destructive">{validation.errors['origin.contactInfo.email']}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Destination Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Destination Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destination-address">Destination Address</Label>
                <Input
                  id="destination-address"
                  value={shipmentDetails.destination.address}
                  onChange={(e) => updateDestination({ address: e.target.value })}
                  onBlur={() => setFieldTouched('destination.address')}
                  className={validation.errors['destination.address'] ? 'border-destructive' : ''}
                />
                {validation.errors['destination.address'] && (
                  <p className="text-sm text-destructive">{validation.errors['destination.address']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination-city">Destination City</Label>
                <Input
                  id="destination-city"
                  value={shipmentDetails.destination.city}
                  onChange={(e) => updateDestination({ city: e.target.value })}
                  onBlur={() => setFieldTouched('destination.city')}
                  className={validation.errors['destination.city'] ? 'border-destructive' : ''}
                />
                {validation.errors['destination.city'] && (
                  <p className="text-sm text-destructive">{validation.errors['destination.city']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination-state">Destination State</Label>
                <Input
                  id="destination-state"
                  value={shipmentDetails.destination.state}
                  onChange={(e) => updateDestination({ state: e.target.value })}
                  onBlur={() => setFieldTouched('destination.state')}
                  className={validation.errors['destination.state'] ? 'border-destructive' : ''}
                />
                {validation.errors['destination.state'] && (
                  <p className="text-sm text-destructive">{validation.errors['destination.state']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination-zip">Destination ZIP</Label>
                <Input
                  id="destination-zip"
                  value={shipmentDetails.destination.zip}
                  onChange={(e) => updateDestination({ zip: e.target.value })}
                  onBlur={() => setFieldTouched('destination.zip')}
                  className={validation.errors['destination.zip'] ? 'border-destructive' : ''}
                />
                {validation.errors['destination.zip'] && (
                  <p className="text-sm text-destructive">{validation.errors['destination.zip']}</p>
                )}
              </div>
            </div>

            {/* Destination Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destination-contact-name">Contact Name</Label>
                <Input
                  id="destination-contact-name"
                  value={shipmentDetails.destination.contactInfo.name}
                  onChange={(e) => updateDestination({ 
                    contactInfo: { ...shipmentDetails.destination.contactInfo, name: e.target.value }
                  })}
                  onBlur={() => setFieldTouched('destination.contactInfo.name')}
                  className={validation.errors['destination.contactInfo.name'] ? 'border-destructive' : ''}
                />
                {validation.errors['destination.contactInfo.name'] && (
                  <p className="text-sm text-destructive">{validation.errors['destination.contactInfo.name']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination-contact-phone">Contact Phone</Label>
                <Input
                  id="destination-contact-phone"
                  value={shipmentDetails.destination.contactInfo.phone}
                  onChange={(e) => updateDestination({ 
                    contactInfo: { ...shipmentDetails.destination.contactInfo, phone: e.target.value }
                  })}
                  onBlur={() => setFieldTouched('destination.contactInfo.phone')}
                  className={validation.errors['destination.contactInfo.phone'] ? 'border-destructive' : ''}
                />
                {validation.errors['destination.contactInfo.phone'] && (
                  <p className="text-sm text-destructive">{validation.errors['destination.contactInfo.phone']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination-contact-email">Contact Email</Label>
                <Input
                  id="destination-contact-email"
                  type="email"
                  value={shipmentDetails.destination.contactInfo.email}
                  onChange={(e) => updateDestination({ 
                    contactInfo: { ...shipmentDetails.destination.contactInfo, email: e.target.value }
                  })}
                  onBlur={() => setFieldTouched('destination.contactInfo.email')}
                  className={validation.errors['destination.contactInfo.email'] ? 'border-destructive' : ''}
                />
                {validation.errors['destination.contactInfo.email'] && (
                  <p className="text-sm text-destructive">{validation.errors['destination.contactInfo.email']}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Package Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Package Information</h3>
            
            {/* Package Type Selection */}
            <div className="space-y-2">
              <Label>Package Type</Label>
              <div className="flex flex-wrap gap-2">
                {['Small Box', 'Medium Box', 'Large Box', 'Envelope'].map((type) => (
                  <Button
                    key={type}
                    variant={shipmentDetails.package.type === type.toLowerCase().replace(' ', '') ? 'default' : 'outline'}
                    onClick={() => updatePackage({ type: type.toLowerCase().replace(' ', '') as any })}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="package-weight">Weight (lbs)</Label>
                <Input
                  id="package-weight"
                  type="number"
                  value={shipmentDetails.package.weight.value}
                  onChange={(e) => updatePackage({ 
                    weight: { ...shipmentDetails.package.weight, value: parseFloat(e.target.value) || 0 }
                  })}
                  onBlur={() => setFieldTouched('package.weight.value')}
                  className={validation.errors['package.weight.value'] ? 'border-destructive' : ''}
                />
                {validation.errors['package.weight.value'] && (
                  <p className="text-sm text-destructive">{validation.errors['package.weight.value']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-length">Length (in)</Label>
                <Input
                  id="package-length"
                  type="number"
                  value={shipmentDetails.package.dimensions.length}
                  onChange={(e) => updatePackage({ 
                    dimensions: { ...shipmentDetails.package.dimensions, length: parseFloat(e.target.value) || 0 }
                  })}
                  onBlur={() => setFieldTouched('package.dimensions.length')}
                  className={validation.errors['package.dimensions.length'] ? 'border-destructive' : ''}
                />
                {validation.errors['package.dimensions.length'] && (
                  <p className="text-sm text-destructive">{validation.errors['package.dimensions.length']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-width">Width (in)</Label>
                <Input
                  id="package-width"
                  type="number"
                  value={shipmentDetails.package.dimensions.width}
                  onChange={(e) => updatePackage({ 
                    dimensions: { ...shipmentDetails.package.dimensions, width: parseFloat(e.target.value) || 0 }
                  })}
                  onBlur={() => setFieldTouched('package.dimensions.width')}
                  className={validation.errors['package.dimensions.width'] ? 'border-destructive' : ''}
                />
                {validation.errors['package.dimensions.width'] && (
                  <p className="text-sm text-destructive">{validation.errors['package.dimensions.width']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-height">Height (in)</Label>
                <Input
                  id="package-height"
                  type="number"
                  value={shipmentDetails.package.dimensions.height}
                  onChange={(e) => updatePackage({ 
                    dimensions: { ...shipmentDetails.package.dimensions, height: parseFloat(e.target.value) || 0 }
                  })}
                  onBlur={() => setFieldTouched('package.dimensions.height')}
                  className={validation.errors['package.dimensions.height'] ? 'border-destructive' : ''}
                />
                {validation.errors['package.dimensions.height'] && (
                  <p className="text-sm text-destructive">{validation.errors['package.dimensions.height']}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="package-value">Declared Value ($)</Label>
                <Input
                  id="package-value"
                  type="number"
                  value={shipmentDetails.package.declaredValue}
                  onChange={(e) => updatePackage({ declaredValue: parseFloat(e.target.value) || 0 })}
                  onBlur={() => setFieldTouched('package.declaredValue')}
                  className={validation.errors['package.declaredValue'] ? 'border-destructive' : ''}
                />
                {validation.errors['package.declaredValue'] && (
                  <p className="text-sm text-destructive">{validation.errors['package.declaredValue']}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="package-contents">Contents Description</Label>
                <Input
                  id="package-contents"
                  value={shipmentDetails.package.contents}
                  onChange={(e) => updatePackage({ contents: e.target.value })}
                  onBlur={() => setFieldTouched('package.contents')}
                  className={validation.errors['package.contents'] ? 'border-destructive' : ''}
                />
                {validation.errors['package.contents'] && (
                  <p className="text-sm text-destructive">{validation.errors['package.contents']}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Cross-field Validation Errors */}
          {Object.keys(validation.errors).some(key => key.includes('_')) && (
            <Alert>
              <AlertDescription>
                <strong>Business Rule Violations:</strong>
                <ul className="list-disc list-inside mt-2">
                  {Object.entries(validation.errors)
                    .filter(([key]) => key.includes('_'))
                    .map(([key, error]) => (
                      <li key={key}>{error}</li>
                    ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Auto-save Error */}
          {autoSave.autoSaveError && (
            <Alert>
              <AlertDescription>
                <strong>Auto-save Error:</strong> {autoSave.autoSaveError}
              </AlertDescription>
            </Alert>
          )}

          {/* Conflict Resolution */}
          {autoSave.conflictDetected && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <strong>Conflict detected:</strong> Another tab has modified this data.
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => resolveConflict('local')}>
                      Keep Local Changes
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => resolveConflict('remote')}>
                      Use Remote Changes
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => resolveConflict('merge')}>
                      Merge Changes
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Validation Summary */}
          {showValidationSummary && (validationSummary.errors.length > 0 || validationSummary.warnings.length > 0) && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  {validationSummary.errors.length > 0 && (
                    <div>
                      <strong>Validation Errors:</strong>
                      <ul className="list-disc list-inside">
                        {validationSummary.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {validationSummary.warnings.length > 0 && (
                    <div>
                      <strong>Warnings:</strong>
                      <ul className="list-disc list-inside">
                        {validationSummary.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Form Actions */}
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => validateAll()}
              variant="outline"
            >
              Validate All
            </Button>
            
            <Button 
              onClick={() => setShowValidationSummary(!showValidationSummary)}
              variant="outline"
            >
              {showValidationSummary ? 'Hide' : 'Show'} Validation Summary
            </Button>
            
            <Button 
              onClick={handleSimulateConflict}
              variant="outline"
            >
              Simulate Conflict
            </Button>
            
            <Button 
              onClick={forceSync}
              variant="outline"
              disabled={isLoading}
            >
              Force Sync
            </Button>
            
            <Button 
              onClick={save}
              disabled={isLoading || !validation.isValid}
            >
              Manual Save
            </Button>
            
            <Button 
              onClick={reset}
              variant="destructive"
              disabled={isLoading}
            >
              Reset Form
            </Button>
            
            <Button 
              disabled={!canNavigateNext()}
              variant="default"
            >
              Next Step
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
