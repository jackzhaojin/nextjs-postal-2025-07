'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Truck,
  Package,
  Shield,
  Grip,
  Forklift,
  Users,
  ArrowUp,
  DoorOpen,
  Weight,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { PackageInfo, EquipmentOption, FeeCalculation } from '@/lib/types';

console.log('🔧 [EQUIPMENT-ASSESSMENT] Component module loaded');

interface EquipmentAssessmentProps {
  selectedEquipment: string[];
  onEquipmentChange: (equipment: string[]) => void;
  packageInfo: PackageInfo;
  onFeeUpdate?: (additionalFees: FeeCalculation[]) => void;
  className?: string;
}

const equipmentIcons: Record<string, React.ComponentType<any>> = {
  'standard-dolly': Truck,
  'appliance-dolly': Package,
  'furniture-pads': Shield,
  'straps': Grip,
  'pallet-jack': Forklift,
  'two-person-team': Users,
};

const defaultEquipmentOptions: EquipmentOption[] = [
  {
    id: 'standard-dolly',
    label: 'Standard Dolly/Hand Truck Available',
    description: 'Basic wheeled cart for moving packages',
    requiresCompatibilityCheck: false
  },
  {
    id: 'appliance-dolly',
    label: 'Appliance Dolly On-Site',
    description: 'Heavy-duty dolly for large appliances and equipment',
    requiresCompatibilityCheck: true
  },
  {
    id: 'furniture-pads',
    label: 'Furniture Pads Available',
    description: 'Protective padding for delicate or finished surfaces',
    requiresCompatibilityCheck: false
  },
  {
    id: 'straps',
    label: 'Straps/Tie-downs Provided',
    description: 'Securing equipment for safe transport',
    requiresCompatibilityCheck: false
  },
  {
    id: 'pallet-jack',
    label: 'Pallet Jack Available',
    description: 'For heavy palletized shipments',
    requiresCompatibilityCheck: true
  },
  {
    id: 'two-person-team',
    label: 'Two-Person Team Required',
    description: 'Additional team member for heavy or complex pickups',
    additionalFee: 45,
    requiresCompatibilityCheck: true
  }
];

interface InfrastructureConsideration {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  relevantFor: string[]; // package types or weights
}

const infrastructureConsiderations: InfrastructureConsideration[] = [
  {
    id: 'elevator-access',
    label: 'Elevator Access Available',
    description: 'Multi-story building with elevator for package transport',
    icon: DoorOpen,
    relevantFor: ['medium', 'large', 'pallet']
  },
  {
    id: 'stair-considerations',
    label: 'Stair Navigation Required',
    description: 'Package must be carried up/down stairs',
    icon: ArrowUp,
    relevantFor: ['small', 'medium', 'large']
  },
  {
    id: 'narrow-access',
    label: 'Narrow Doorway/Access',
    description: 'Limited width for package maneuvering',
    icon: DoorOpen,
    relevantFor: ['large', 'pallet', 'crate']
  },
  {
    id: 'weight-restrictions',
    label: 'Floor/Elevator Weight Limits',
    description: 'Structural weight capacity considerations',
    icon: Weight,
    relevantFor: ['pallet', 'crate', 'multiple']
  }
];

export function EquipmentAssessment({
  selectedEquipment,
  onEquipmentChange,
  packageInfo,
  onFeeUpdate,
  className = ''
}: EquipmentAssessmentProps) {
  console.log('🔧 [EQUIPMENT-ASSESSMENT] Rendering with selected equipment:', selectedEquipment);

  // Calculate equipment compatibility and suggestions
  const equipmentSuggestions = React.useMemo(() => {
    const suggestions: string[] = [];
    const weight = packageInfo.weight.value;
    const packageType = packageInfo.type;

    // Auto-suggest based on package characteristics
    if (weight > 50) {
      suggestions.push('standard-dolly');
    }
    if (weight > 150) {
      suggestions.push('appliance-dolly', 'two-person-team');
    }
    if (packageType === 'pallet') {
      suggestions.push('pallet-jack');
    }
    if (packageInfo.specialHandling.includes('fragile')) {
      suggestions.push('furniture-pads', 'straps');
    }
    if (weight > 300) {
      suggestions.push('two-person-team');
    }

    return suggestions;
  }, [packageInfo]);

  // Calculate additional fees
  const additionalFees = React.useMemo(() => {
    const fees: FeeCalculation[] = [];
    
    selectedEquipment.forEach(equipmentId => {
      const equipment = defaultEquipmentOptions.find(eq => eq.id === equipmentId);
      if (equipment?.additionalFee) {
        fees.push({
          id: equipmentId,
          label: equipment.label,
          amount: equipment.additionalFee,
          reason: 'Equipment and handling requirement'
        });
      }
    });

    return fees;
  }, [selectedEquipment]);

  // Update parent with fee calculations (throttled to prevent infinite loops)
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFeeUpdate?.(additionalFees);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [onFeeUpdate, additionalFees]);

  // Get relevant infrastructure considerations
  const relevantInfrastructure = React.useMemo(() => {
    return infrastructureConsiderations.filter(consideration =>
      consideration.relevantFor.includes(packageInfo.type) ||
      (packageInfo.weight.value > 100 && consideration.relevantFor.includes('heavy'))
    );
  }, [packageInfo]);

  const handleEquipmentToggle = (equipmentId: string) => {
    console.log('🔧 [EQUIPMENT-ASSESSMENT] Toggling equipment:', equipmentId);
    
    const newEquipment = selectedEquipment.includes(equipmentId)
      ? selectedEquipment.filter(id => id !== equipmentId)
      : [...selectedEquipment, equipmentId];
    
    onEquipmentChange(newEquipment);
  };

  const totalAdditionalFees = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);

  return (
    <div className={`space-y-6 ${className}`} data-testid="equipment-assessment">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Equipment and Infrastructure Assessment
        </h3>
        <p className="text-sm text-gray-600">
          Select available equipment and indicate any infrastructure considerations. This helps ensure safe and efficient pickup.
        </p>
      </div>

      {/* Package Summary */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          Package Requirements Analysis
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-blue-700 font-medium">Type:</span>
            <p className="text-blue-800 capitalize">{packageInfo.type}</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Weight:</span>
            <p className="text-blue-800">{packageInfo.weight.value} {packageInfo.weight.unit}</p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Dimensions:</span>
            <p className="text-blue-800">
              {packageInfo.dimensions.length}" × {packageInfo.dimensions.width}" × {packageInfo.dimensions.height}"
            </p>
          </div>
          <div>
            <span className="text-blue-700 font-medium">Special Handling:</span>
            <p className="text-blue-800">
              {packageInfo.specialHandling.length > 0 
                ? packageInfo.specialHandling.join(', ') 
                : 'None'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Equipment Suggestions */}
      {equipmentSuggestions.length > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-800">
              Recommended Equipment
            </span>
          </div>
          <p className="text-sm text-green-700 mb-2">
            Based on your package specifications, we recommend the following equipment:
          </p>
          <div className="flex flex-wrap gap-2">
            {equipmentSuggestions.map(suggestionId => {
              const equipment = defaultEquipmentOptions.find(eq => eq.id === suggestionId);
              return (
                <Badge 
                  key={suggestionId} 
                  variant="outline" 
                  className="bg-green-100 border-green-300 text-green-800"
                >
                  {equipment?.label}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Equipment Options */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-4">
          Available Equipment
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {defaultEquipmentOptions.map((equipment) => {
            const IconComponent = equipmentIcons[equipment.id] || Package;
            const isSelected = selectedEquipment.includes(equipment.id);
            const isSuggested = equipmentSuggestions.includes(equipment.id);

            return (
              <Card
                key={equipment.id}
                className={`relative cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : isSuggested
                      ? 'border-green-300 bg-green-25 hover:border-green-400'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleEquipmentToggle(equipment.id)}
                data-testid={`equipment-${equipment.id}`}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleEquipmentToggle(equipment.id)}
                        className="mr-2"
                        data-testid={`checkbox-equipment-${equipment.id}`}
                      />
                      <div className={`p-2 rounded-lg ${
                        isSelected 
                          ? 'bg-blue-100 text-blue-600' 
                          : isSuggested
                            ? 'bg-green-100 text-green-600'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className={`text-sm font-medium ${
                          isSelected 
                            ? 'text-blue-900' 
                            : 'text-gray-900'
                        }`}>
                          {equipment.label}
                        </h5>
                        {equipment.additionalFee && (
                          <Badge variant="outline" className="text-xs">
                            +${equipment.additionalFee}
                          </Badge>
                        )}
                        {isSuggested && !isSelected && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {equipment.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Infrastructure Considerations */}
      {relevantInfrastructure.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">
            Infrastructure Considerations
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Please review these considerations that may affect pickup based on your package requirements:
          </p>
          <div className="space-y-3">
            {relevantInfrastructure.map((consideration) => {
              const IconComponent = consideration.icon;
              return (
                <div
                  key={consideration.id}
                  className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  data-testid={`infrastructure-${consideration.id}`}
                >
                  <div className="p-1 bg-yellow-100 rounded">
                    <IconComponent className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-medium text-yellow-900">
                      {consideration.label}
                    </h5>
                    <p className="text-xs text-yellow-700 mt-1">
                      {consideration.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fee Summary */}
      {totalAdditionalFees > 0 && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-orange-800">
              Equipment fees: +${totalAdditionalFees.toFixed(2)}
            </span>
          </div>
          <div className="mt-2 space-y-1">
            {additionalFees.map(fee => (
              <p key={fee.id} className="text-sm text-orange-700">
                • {fee.label}: +${fee.amount.toFixed(2)}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Compatibility Warnings */}
      {selectedEquipment.some(id => {
        const equipment = defaultEquipmentOptions.find(eq => eq.id === id);
        return equipment?.requiresCompatibilityCheck;
      }) && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-800">
              Compatibility Notice
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-2">
            Some selected equipment requires compatibility verification with your package specifications. 
            Our team will confirm equipment suitability during pickup scheduling.
          </p>
        </div>
      )}
    </div>
  );
}
