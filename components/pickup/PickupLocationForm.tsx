'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LocationTypeSelector } from './LocationTypeSelector';
import { AccessRequirementsSelector } from './AccessRequirementsSelector';
import { EquipmentAssessment } from './EquipmentAssessment';
import { 
  LocationType, 
  LocationInfo, 
  Address, 
  PackageInfo, 
  ValidationError, 
  FeeCalculation,
  ContactInfo
} from '@/lib/types';
import { AlertCircle, CheckCircle, MapPin } from 'lucide-react';

console.log('📍 [PICKUP-LOCATION-FORM] Component module loaded');

interface PickupLocationFormProps {
  pickupAddress: Address;
  packageInfo: PackageInfo;
  locationInfo?: LocationInfo;
  onLocationInfoChange: (locationInfo: LocationInfo) => void;
  onValidation?: (isValid: boolean, errors: ValidationError[]) => void;
  className?: string;
}

export function PickupLocationForm({
  pickupAddress,
  packageInfo,
  locationInfo,
  onLocationInfoChange,
  onValidation,
  className = ''
}: PickupLocationFormProps) {
  console.log('📍 [PICKUP-LOCATION-FORM] Rendering with locationInfo:', locationInfo);

  const [validationErrors, setValidationErrors] = React.useState<ValidationError[]>([]);
  const [additionalFees, setAdditionalFees] = React.useState<FeeCalculation[]>([]);
  const [isValid, setIsValid] = React.useState(false);

  // Initialize default location info if not provided
  const currentLocationInfo = locationInfo || {
    type: 'ground-level' as LocationType,
    accessRequirements: [],
    availableEquipment: [],
    dockNumber: '',
    gateCode: '',
    specialInstructions: '',
    description: ''
  };

  // Validation state tracking
  const [locationTypeValid, setLocationTypeValid] = React.useState(false);
  const [locationTypeErrors, setLocationTypeErrors] = React.useState<ValidationError[]>([]);

  // Handle location type selection
  const handleLocationTypeChange = (type: LocationType) => {
    console.log('📍 [PICKUP-LOCATION-FORM] Location type changed:', type);
    
    const updatedInfo: LocationInfo = {
      ...currentLocationInfo,
      type,
      // Clear type-specific fields when type changes
      dockNumber: type === 'loading-dock' ? currentLocationInfo.dockNumber : undefined,
      description: type === 'other' ? currentLocationInfo.description : undefined
    };
    
    onLocationInfoChange(updatedInfo);
  };

  // Handle dock number change
  const handleDockNumberChange = (dockNumber: string) => {
    console.log('📍 [PICKUP-LOCATION-FORM] Dock number changed:', dockNumber);
    
    const updatedInfo: LocationInfo = {
      ...currentLocationInfo,
      dockNumber
    };
    
    onLocationInfoChange(updatedInfo);
  };

  // Handle description change
  const handleDescriptionChange = (description: string) => {
    console.log('📍 [PICKUP-LOCATION-FORM] Description changed:', description);
    
    const updatedInfo: LocationInfo = {
      ...currentLocationInfo,
      description
    };
    
    onLocationInfoChange(updatedInfo);
  };

  // Handle access requirements change
  const handleAccessRequirementsChange = (requirements: string[]) => {
    console.log('📍 [PICKUP-LOCATION-FORM] Access requirements changed:', requirements);
    
    const updatedInfo: LocationInfo = {
      ...currentLocationInfo,
      accessRequirements: requirements
    };
    
    onLocationInfoChange(updatedInfo);
  };

  // Handle gate code change
  const handleGateCodeChange = (gateCode: string) => {
    console.log('📍 [PICKUP-LOCATION-FORM] Gate code changed');
    
    const updatedInfo: LocationInfo = {
      ...currentLocationInfo,
      gateCode
    };
    
    onLocationInfoChange(updatedInfo);
  };

  // Handle security contact change
  const handleSecurityContactChange = (securityContact: ContactInfo) => {
    console.log('📍 [PICKUP-LOCATION-FORM] Security contact changed');
    
    const updatedInfo: LocationInfo = {
      ...currentLocationInfo,
      securityContact
    };
    
    onLocationInfoChange(updatedInfo);
  };

  // Handle special instructions change
  const handleSpecialInstructionsChange = (instructions: string) => {
    console.log('📍 [PICKUP-LOCATION-FORM] Special instructions changed');
    
    const updatedInfo: LocationInfo = {
      ...currentLocationInfo,
      specialInstructions: instructions
    };
    
    onLocationInfoChange(updatedInfo);
  };

  // Handle equipment change
  const handleEquipmentChange = (equipment: string[]) => {
    console.log('📍 [PICKUP-LOCATION-FORM] Equipment changed:', equipment);
    
    const updatedInfo: LocationInfo = {
      ...currentLocationInfo,
      availableEquipment: equipment
    };
    
    onLocationInfoChange(updatedInfo);
  };

  // Handle location type validation
  const handleLocationTypeValidation = (valid: boolean, errors: ValidationError[]) => {
    setLocationTypeValid(valid);
    setLocationTypeErrors(errors);
  };

  // Handle fee updates from child components
  const handleAccessFeeUpdate = (fees: FeeCalculation[]) => {
    setAdditionalFees(prevFees => {
      // Remove existing access fees and add new ones
      const nonAccessFees = prevFees.filter(fee => !fee.id.startsWith('access-'));
      const accessFees = fees.map(fee => ({ ...fee, id: `access-${fee.id}` }));
      return [...nonAccessFees, ...accessFees];
    });
  };

  const handleEquipmentFeeUpdate = (fees: FeeCalculation[]) => {
    setAdditionalFees(prevFees => {
      // Remove existing equipment fees and add new ones
      const nonEquipmentFees = prevFees.filter(fee => !fee.id.startsWith('equipment-'));
      const equipmentFees = fees.map(fee => ({ ...fee, id: `equipment-${fee.id}` }));
      return [...nonEquipmentFees, ...equipmentFees];
    });
  };

  // Overall validation
  React.useEffect(() => {
    const allErrors = [...locationTypeErrors];
    const overallValid = locationTypeValid && allErrors.length === 0;
    
    setValidationErrors(allErrors);
    setIsValid(overallValid);
    
    onValidation?.(overallValid, allErrors);
  }, [locationTypeValid, locationTypeErrors, onValidation]);

  const totalAdditionalFees = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className={`space-y-8 ${className}`} data-testid="pickup-location-form">
      {/* Form Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <MapPin className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            Pickup Location Details
          </h2>
        </div>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Help us prepare for a successful pickup by providing detailed location information, 
          access requirements, and available equipment. This ensures our drivers arrive prepared 
          and authorized for your specific location.
        </p>
      </div>

      {/* Validation Summary */}
      {validationErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Please complete the following:</strong>
            <ul className="mt-2 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  • {error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Fee Summary */}
      {totalAdditionalFees > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Additional Fees: ${totalAdditionalFees.toFixed(2)}</strong>
            <div className="mt-2 space-y-1">
              {additionalFees.map((fee, index) => (
                <div key={index} className="text-sm flex justify-between">
                  <span>{fee.label}</span>
                  <span>+${fee.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Location Type Selection */}
      <Card className="p-6">
        <LocationTypeSelector
          selectedType={currentLocationInfo.type}
          onTypeSelect={handleLocationTypeChange}
          addressInfo={pickupAddress}
          availableTypes={[
            {
              value: 'loading-dock',
              label: 'Loading Dock',
              description: 'Commercial facility with dedicated loading dock access',
              requiresDockNumber: true,
              pricingImpact: 'none'
            },
            {
              value: 'ground-level',
              label: 'Ground Level / No Dock',
              description: 'Standard ground-level pickup at commercial location',
              pricingImpact: 'none'
            },
            {
              value: 'residential',
              label: 'Residential Address',
              description: 'Residential location (residential delivery rates apply)',
              pricingImpact: 'residential-surcharge'
            },
            {
              value: 'storage-facility',
              label: 'Storage Facility',
              description: 'Warehouse or self-storage environment',
              pricingImpact: 'none'
            },
            {
              value: 'construction-site',
              label: 'Construction Site',
              description: 'Temporary or active construction zone',
              pricingImpact: 'special-handling'
            },
            {
              value: 'other',
              label: 'Other',
              description: 'Requires detailed description',
              pricingImpact: 'special-handling'
            }
          ]}
          onValidation={handleLocationTypeValidation}
          dockNumber={currentLocationInfo.dockNumber}
          onDockNumberChange={handleDockNumberChange}
          description={currentLocationInfo.description}
          onDescriptionChange={handleDescriptionChange}
        />
      </Card>

      {/* Access Requirements */}
      <Card className="p-6">
        <AccessRequirementsSelector
          selectedRequirements={currentLocationInfo.accessRequirements}
          onRequirementsChange={handleAccessRequirementsChange}
          locationType={currentLocationInfo.type}
          packageInfo={packageInfo}
          onFeeUpdate={handleAccessFeeUpdate}
          gateCode={currentLocationInfo.gateCode}
          onGateCodeChange={handleGateCodeChange}
          securityContact={currentLocationInfo.securityContact}
          onSecurityContactChange={handleSecurityContactChange}
          specialInstructions={currentLocationInfo.specialInstructions}
          onSpecialInstructionsChange={handleSpecialInstructionsChange}
        />
      </Card>

      {/* Equipment Assessment */}
      <Card className="p-6">
        <EquipmentAssessment
          selectedEquipment={currentLocationInfo.availableEquipment}
          onEquipmentChange={handleEquipmentChange}
          packageInfo={packageInfo}
          onFeeUpdate={handleEquipmentFeeUpdate}
        />
      </Card>

      {/* Completion Status */}
      {isValid && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Location details complete!</strong> Your pickup location information has been 
            configured and our drivers will be prepared with the right equipment and authorization.
            {totalAdditionalFees > 0 && (
              <span className="block mt-1">
                Total additional fees: ${totalAdditionalFees.toFixed(2)}
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Information */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Debug Information
          </h4>
          <div className="text-xs text-gray-600 space-y-1">
            <p><strong>Location Type:</strong> {currentLocationInfo.type}</p>
            <p><strong>Access Requirements:</strong> {currentLocationInfo.accessRequirements.join(', ') || 'None'}</p>
            <p><strong>Available Equipment:</strong> {currentLocationInfo.availableEquipment.join(', ') || 'None'}</p>
            <p><strong>Validation Status:</strong> {isValid ? 'Valid' : 'Invalid'}</p>
            <p><strong>Additional Fees:</strong> ${totalAdditionalFees.toFixed(2)}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
