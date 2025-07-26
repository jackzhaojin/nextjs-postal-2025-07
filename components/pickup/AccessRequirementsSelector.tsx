'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Key, 
  Calendar, 
  Car, 
  Truck, 
  Forklift,
  Phone,
  DollarSign,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { LocationType, PackageInfo, AccessRequirementOption, FeeCalculation, ContactInfo } from '@/lib/types';

console.log('🔐 [ACCESS-REQUIREMENTS-SELECTOR] Component module loaded');

interface AccessRequirementsSelectorProps {
  selectedRequirements: string[];
  onRequirementsChange: (requirements: string[]) => void;
  locationType: LocationType;
  packageInfo: PackageInfo;
  onFeeUpdate?: (additionalFees: FeeCalculation[]) => void;
  className?: string;
  gateCode?: string;
  onGateCodeChange?: (gateCode: string) => void;
  securityContact?: ContactInfo;
  onSecurityContactChange?: (contact: ContactInfo) => void;
  specialInstructions?: string;
  onSpecialInstructionsChange?: (instructions: string) => void;
}

const accessRequirementIcons: Record<string, React.ComponentType<any>> = {
  'driver-call': Phone,
  'security-checkin': Shield,
  'gate-code': Key,
  'appointment-required': Calendar,
  'limited-parking': Car,
  'forklift-available': Forklift,
  'liftgate-required': Truck,
};

const defaultAccessRequirements: AccessRequirementOption[] = [
  {
    id: 'driver-call',
    label: 'Driver Must Call Upon Arrival',
    description: 'Driver will call contact number before attempting pickup',
    type: 'timing',
    requiresFields: []
  },
  {
    id: 'security-checkin',
    label: 'Security Check-in Required',
    description: 'Additional time needed for security verification',
    type: 'security',
    requiresFields: ['securityContact']
  },
  {
    id: 'gate-code',
    label: 'Gate Code Required',
    description: 'Access code needed to enter facility',
    type: 'security',
    requiresFields: ['gateCode']
  },
  {
    id: 'appointment-required',
    label: 'Appointment Required',
    description: 'Pickup requires advance scheduling confirmation',
    type: 'timing'
  },
  {
    id: 'limited-parking',
    label: 'Limited Parking Available',
    description: 'Driver should be prepared for parking challenges',
    type: 'special'
  },
  {
    id: 'forklift-available',
    label: 'Forklift Available On-Site',
    description: 'Heavy package handling capability available',
    type: 'equipment'
  },
  {
    id: 'liftgate-required',
    label: 'Liftgate Service Required',
    description: 'Hydraulic lift needed for heavy packages',
    type: 'equipment',
    additionalFee: 35
  }
];

export function AccessRequirementsSelector({
  selectedRequirements,
  onRequirementsChange,
  locationType,
  packageInfo,
  onFeeUpdate,
  className = '',
  gateCode = '',
  onGateCodeChange,
  securityContact,
  onSecurityContactChange,
  specialInstructions = '',
  onSpecialInstructionsChange
}: AccessRequirementsSelectorProps) {
  console.log('🔐 [ACCESS-REQUIREMENTS-SELECTOR] Rendering with requirements:', selectedRequirements);

  // Calculate fees based on selected requirements
  const additionalFees = React.useMemo(() => {
    const fees: FeeCalculation[] = [];
    
    selectedRequirements.forEach(reqId => {
      const requirement = defaultAccessRequirements.find(req => req.id === reqId);
      if (requirement?.additionalFee) {
        fees.push({
          id: reqId,
          label: requirement.label,
          amount: requirement.additionalFee,
          reason: 'Special handling requirement'
        });
      }
    });

    // Additional fees based on package weight for liftgate
    if (selectedRequirements.includes('liftgate-required') && packageInfo.weight.value > 150) {
      const existingFee = fees.find(fee => fee.id === 'liftgate-required');
      if (existingFee) {
        existingFee.amount += 15; // Heavy package surcharge
        existingFee.reason += ' (heavy package surcharge)';
      }
    }

    return fees;
  }, [selectedRequirements, packageInfo.weight.value]);

  // Update parent with fee calculations (throttled to prevent infinite loops)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFeeUpdate?.(additionalFees);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [onFeeUpdate, additionalFees]);

  // Get requirements that need additional fields
  const requirementsNeedingFields = React.useMemo(() => {
    return selectedRequirements.reduce((acc, reqId) => {
      const requirement = defaultAccessRequirements.find(req => req.id === reqId);
      if (requirement?.requiresFields) {
        acc.push(...requirement.requiresFields);
      }
      return acc;
    }, [] as string[]);
  }, [selectedRequirements]);

  const handleRequirementToggle = (requirementId: string) => {
    console.log('🔐 [ACCESS-REQUIREMENTS-SELECTOR] Toggling requirement:', requirementId);
    
    const newRequirements = selectedRequirements.includes(requirementId)
      ? selectedRequirements.filter(id => id !== requirementId)
      : [...selectedRequirements, requirementId];
    
    onRequirementsChange(newRequirements);
  };

  const totalAdditionalFees = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className={`space-y-6 ${className}`} data-testid="access-requirements-selector">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Access Requirements
        </h3>
        <p className="text-sm text-gray-600">
          Select any special requirements for pickup access. This ensures our drivers arrive prepared and authorized.
        </p>
      </div>

      {/* Fee Summary */}
      {totalAdditionalFees > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              Additional fees apply: ${totalAdditionalFees.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {additionalFees.map(fee => (
              <p key={fee.id} className="text-sm text-yellow-700">
                • {fee.label}: +${fee.amount.toFixed(2)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Requirements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultAccessRequirements.map((requirement) => {
          const IconComponent = accessRequirementIcons[requirement.id] || Shield;
          const isSelected = selectedRequirements.includes(requirement.id);
          const hasConflict = requirement.conflictsWith?.some(conflictId => 
            selectedRequirements.includes(conflictId)
          );

          return (
            <Card
              key={requirement.id}
              className={`relative transition-all duration-200 ${
                isSelected 
                  ? 'border-blue-500 bg-blue-50' 
                  : hasConflict
                    ? 'border-red-300 bg-red-50 opacity-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              } ${hasConflict ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !hasConflict && handleRequirementToggle(requirement.id)}
              data-testid={`access-requirement-${requirement.id}`}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex items-center">
                    <Checkbox
                      checked={isSelected}
                      disabled={hasConflict}
                      onChange={() => handleRequirementToggle(requirement.id)}
                      className="mr-2"
                      data-testid={`checkbox-${requirement.id}`}
                    />
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-600' 
                        : hasConflict
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-medium ${
                        isSelected 
                          ? 'text-blue-900' 
                          : hasConflict 
                            ? 'text-gray-400'
                            : 'text-gray-900'
                      }`}>
                        {requirement.label}
                      </h4>
                      {requirement.additionalFee && (
                        <Badge variant="outline" className="text-xs">
                          +${requirement.additionalFee}
                        </Badge>
                      )}
                    </div>
                    <p className={`text-xs mt-1 ${
                      hasConflict ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {requirement.description}
                    </p>
                    {hasConflict && (
                      <div className="flex items-center space-x-1 mt-2">
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                        <span className="text-xs text-red-600">
                          Conflicts with other selection
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Conditional Fields */}
      {requirementsNeedingFields.length > 0 && (
        <div className="space-y-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900">
            Additional Information Required
          </h4>

          {/* Gate Code Input */}
          {requirementsNeedingFields.includes('gateCode') && (
            <div data-testid="gate-code-input">
              <Label htmlFor="gate-code" className="text-sm font-medium text-gray-900">
                Gate Access Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="gate-code"
                type="password"
                value={gateCode}
                onChange={(e) => onGateCodeChange?.(e.target.value)}
                placeholder="Enter gate code"
                className="mt-1"
                autoComplete="off"
                data-testid="gate-code-field"
              />
              <p className="text-xs text-gray-600 mt-1">
                This information is securely encrypted and only shared with the driver
              </p>
            </div>
          )}

          {/* Security Contact */}
          {requirementsNeedingFields.includes('securityContact') && (
            <div className="space-y-4" data-testid="security-contact-input">
              <h5 className="text-sm font-medium text-gray-900">
                Security Contact Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="security-name" className="text-sm font-medium text-gray-900">
                    Contact Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="security-name"
                    type="text"
                    value={securityContact?.name || ''}
                    onChange={(e) => onSecurityContactChange?.({
                      ...securityContact,
                      name: e.target.value,
                      company: securityContact?.company || '',
                      phone: securityContact?.phone || '',
                      email: securityContact?.email || ''
                    } as ContactInfo)}
                    placeholder="Security desk contact"
                    className="mt-1"
                    data-testid="security-name-field"
                  />
                </div>
                <div>
                  <Label htmlFor="security-phone" className="text-sm font-medium text-gray-900">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="security-phone"
                    type="tel"
                    value={securityContact?.phone || ''}
                    onChange={(e) => onSecurityContactChange?.({
                      ...securityContact,
                      name: securityContact?.name || '',
                      company: securityContact?.company || '',
                      phone: e.target.value,
                      email: securityContact?.email || ''
                    } as ContactInfo)}
                    placeholder="(555) 123-4567"
                    className="mt-1"
                    data-testid="security-phone-field"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Special Instructions */}
      <div>
        <Label htmlFor="special-instructions" className="text-sm font-medium text-gray-900">
          Special Access Instructions (Optional)
        </Label>
        <Textarea
          id="special-instructions"
          value={specialInstructions}
          onChange={(e) => onSpecialInstructionsChange?.(e.target.value)}
          placeholder="Additional details for driver access (e.g., building entrance, key location, specific procedures...)"
          maxLength={300}
          rows={3}
          className="mt-1"
          data-testid="special-instructions-field"
        />
        <p className="text-xs text-gray-600 mt-1">
          {specialInstructions.length}/300 characters - Provide any additional access details
        </p>
      </div>

      {/* Validation Summary */}
      {selectedRequirements.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">
              Access requirements configured
            </span>
          </div>
          <div className="mt-2">
            <p className="text-sm text-green-700">
              {selectedRequirements.length} requirement{selectedRequirements.length !== 1 ? 's' : ''} selected
              {totalAdditionalFees > 0 && ` with $${totalAdditionalFees.toFixed(2)} in additional fees`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
