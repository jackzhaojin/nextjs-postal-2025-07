'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Truck, 
  Building2, 
  Home, 
  Warehouse, 
  HardHat, 
  HelpCircle,
  CheckCircle 
} from 'lucide-react';
import { LocationType, LocationTypeOption, Address, ValidationError } from '@/lib/types';

console.log('📍 [LOCATION-TYPE-SELECTOR] Component module loaded');

interface LocationTypeSelectorProps {
  selectedType?: LocationType;
  onTypeSelect: (type: LocationType) => void;
  addressInfo: Address;
  availableTypes: LocationTypeOption[];
  onValidation?: (isValid: boolean, errors: ValidationError[]) => void;
  className?: string;
  dockNumber?: string;
  onDockNumberChange?: (dockNumber: string) => void;
  description?: string;
  onDescriptionChange?: (description: string) => void;
}

const locationTypeIcons: Record<LocationType, React.ComponentType<any>> = {
  'loading-dock': Truck,
  'ground-level': Building2,
  'residential': Home,
  'storage-facility': Warehouse,
  'construction-site': HardHat,
  'other': HelpCircle,
};

const defaultLocationTypes: LocationTypeOption[] = [
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
];

export function LocationTypeSelector({
  selectedType,
  onTypeSelect,
  addressInfo,
  availableTypes = defaultLocationTypes,
  onValidation,
  className = '',
  dockNumber = '',
  onDockNumberChange,
  description = '',
  onDescriptionChange
}: LocationTypeSelectorProps) {
  console.log('📍 [LOCATION-TYPE-SELECTOR] Rendering with selectedType:', selectedType);

  // Smart default suggestion based on address info
  const suggestedType = React.useMemo(() => {
    if (addressInfo.isResidential) return 'residential';
    if (addressInfo.locationType === 'warehouse') return 'storage-facility';
    if (addressInfo.locationType === 'industrial') return 'loading-dock';
    return 'ground-level';
  }, [addressInfo]);

  React.useEffect(() => {
    console.log('📍 [LOCATION-TYPE-SELECTOR] Smart default suggestion:', suggestedType);
  }, [suggestedType]);

  // Validation
  React.useEffect(() => {
    const errors: ValidationError[] = [];
    let isValid = true;

    if (!selectedType) {
      errors.push({
        field: 'locationType',
        message: 'Please select a location type',
        code: 'REQUIRED'
      });
      isValid = false;
    }

    if (selectedType === 'loading-dock' && !dockNumber?.trim()) {
      errors.push({
        field: 'dockNumber',
        message: 'Dock number is required for loading dock locations',
        code: 'REQUIRED'
      });
      isValid = false;
    }

    if (selectedType === 'other' && !description?.trim()) {
      errors.push({
        field: 'locationDescription',
        message: 'Description is required for other location types',
        code: 'REQUIRED'
      });
      isValid = false;
    }

    if (description && description.length > 200) {
      errors.push({
        field: 'locationDescription',
        message: 'Description must be 200 characters or less',
        code: 'MAX_LENGTH'
      });
      isValid = false;
    }

    onValidation?.(isValid, errors);
  }, [selectedType, dockNumber, description, onValidation]);

  const handleTypeSelect = (type: LocationType) => {
    console.log('📍 [LOCATION-TYPE-SELECTOR] Type selected:', type);
    onTypeSelect(type);
  };

  const getLocationTypeOption = (type: LocationType) => {
    return availableTypes.find(option => option.value === type) || defaultLocationTypes.find(option => option.value === type);
  };

  const selectedOption = selectedType ? getLocationTypeOption(selectedType) : null;

  return (
    <div className={`space-y-6 ${className}`} data-testid="location-type-selector">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Pickup Location Type
        </h3>
        <p className="text-sm text-gray-600">
          Select the type of location for package pickup. This helps us provide accurate pricing and send the right equipment.
        </p>
        {suggestedType && !selectedType && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">💡 Suggestion:</span> Based on your address, we recommend selecting "{getLocationTypeOption(suggestedType)?.label}"
            </p>
          </div>
        )}
      </div>

      {/* Location Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableTypes.map((option) => {
          const IconComponent = locationTypeIcons[option.value];
          const isSelected = selectedType === option.value;
          const isSuggested = suggestedType === option.value && !selectedType;

          return (
            <Card
              key={option.value}
              className={`relative cursor-pointer transition-all duration-200 hover:border-blue-300 hover:shadow-md ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : isSuggested
                    ? 'border-blue-300 bg-blue-25'
                    : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => handleTypeSelect(option.value)}
              data-testid={`location-type-${option.value}`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </h4>
                      {isSelected && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                      {isSuggested && !isSelected && (
                        <Badge variant="secondary" className="text-xs">
                          Suggested
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {option.description}
                    </p>
                    {option.pricingImpact === 'residential-surcharge' && (
                      <Badge variant="outline" className="mt-2 text-xs bg-orange-50 text-orange-700 border-orange-200">
                        Residential rates apply
                      </Badge>
                    )}
                    {option.pricingImpact === 'special-handling' && (
                      <Badge variant="outline" className="mt-2 text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                        May require special handling
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Conditional Fields */}
      {selectedType === 'loading-dock' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg" data-testid="dock-number-input">
          <div>
            <Label htmlFor="dock-number" className="text-sm font-medium text-gray-900">
              Dock Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dock-number"
              type="text"
              value={dockNumber}
              onChange={(e) => onDockNumberChange?.(e.target.value)}
              placeholder="e.g., Dock 5, Bay A-3"
              className="mt-1"
              data-testid="dock-number-field"
            />
            <p className="text-xs text-gray-600 mt-1">
              Specify the dock number or bay designation for pickup
            </p>
          </div>
        </div>
      )}

      {selectedType === 'other' && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg" data-testid="location-description-input">
          <div>
            <Label htmlFor="location-description" className="text-sm font-medium text-gray-900">
              Location Description <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location-description"
              type="text"
              value={description}
              onChange={(e) => onDescriptionChange?.(e.target.value)}
              placeholder="Describe the pickup location in detail..."
              maxLength={200}
              className="mt-1"
              data-testid="location-description-field"
            />
            <p className="text-xs text-gray-600 mt-1">
              {description.length}/200 characters - Please provide specific details about the location
            </p>
          </div>
        </div>
      )}

      {/* Address Confirmation */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Pickup Address Confirmation
        </h4>
        <div className="text-sm text-blue-800">
          <p>{addressInfo.address}</p>
          {addressInfo.suite && <p>Suite: {addressInfo.suite}</p>}
          <p>{addressInfo.city}, {addressInfo.state} {addressInfo.zip}</p>
        </div>
        <p className="text-xs text-blue-700 mt-2">
          This address was entered in Step 1. To modify, please return to the Shipment Details step.
        </p>
      </div>
    </div>
  );
}
