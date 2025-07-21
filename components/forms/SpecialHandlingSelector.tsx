'use client';

import { useState, useEffect } from 'react';
import { SpecialHandlingType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  ArrowUp, 
  Thermometer, 
  AlertTriangle, 
  Sparkles, 
  Building, 
  Truck, 
  Package,
  DollarSign,
  Info,
  CheckCircle2,
  AlertCircle,
  Calculator
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SpecialHandlingOption {
  type: SpecialHandlingType;
  label: string;
  description: string;
  fee: number;
  icon: React.ComponentType<any>;
  requirements: string[];
  deliveryImpact: string;
  incompatibleWith: SpecialHandlingType[];
  carrierAvailability: string[];
  packagingRequirements: string[];
  riskLevel: 'low' | 'medium' | 'high';
  category: 'protection' | 'delivery' | 'handling' | 'special';
}

const specialHandlingCatalog: SpecialHandlingOption[] = [
  {
    type: 'fragile',
    label: 'Fragile / Handle with Care',
    description: 'Extra care handling for delicate items',
    fee: 15,
    icon: Shield,
    requirements: ['Special packaging labels', 'Trained handler assignment'],
    deliveryImpact: 'No impact on delivery time',
    incompatibleWith: [],
    carrierAvailability: ['All carriers'],
    packagingRequirements: ['Cushioning material', 'Fragile labels', 'Top load only'],
    riskLevel: 'low',
    category: 'protection'
  },
  {
    type: 'this-side-up',
    label: 'This Side Up',
    description: 'Maintain proper orientation during transport',
    fee: 5,
    icon: ArrowUp,
    requirements: ['Orientation arrows', 'Handler training'],
    deliveryImpact: 'No impact on delivery time',
    incompatibleWith: [],
    carrierAvailability: ['All carriers'],
    packagingRequirements: ['Directional arrows', 'This Side Up labels', 'Internal support'],
    riskLevel: 'low',
    category: 'protection'
  },
  {
    type: 'temperature-controlled',
    label: 'Temperature Controlled',
    description: 'Climate controlled transport and storage',
    fee: 75,
    icon: Thermometer,
    requirements: ['Refrigerated vehicle', 'Temperature monitoring', 'Insulated packaging'],
    deliveryImpact: 'May add 1-2 business days',
    incompatibleWith: [],
    carrierAvailability: ['Select carriers only'],
    packagingRequirements: ['Insulated container', 'Temperature indicators', 'Dry ice if needed'],
    riskLevel: 'high',
    category: 'special'
  },
  {
    type: 'hazmat',
    label: 'Hazardous Materials',
    description: 'Dangerous goods requiring special documentation',
    fee: 50,
    icon: AlertTriangle,
    requirements: ['Hazmat certification', 'Special documentation', 'Trained drivers'],
    deliveryImpact: 'May add 2-3 business days',
    incompatibleWith: [],
    carrierAvailability: ['Certified carriers only'],
    packagingRequirements: ['UN-rated packaging', 'Hazmat labels', 'Shipping papers'],
    riskLevel: 'high',
    category: 'special'
  },
  {
    type: 'white-glove',
    label: 'White Glove Service',
    description: 'Premium handling with inside delivery and setup',
    fee: 125,
    icon: Sparkles,
    requirements: ['2-person team', 'Appointment scheduling', 'Professional presentation'],
    deliveryImpact: 'Requires appointment scheduling',
    incompatibleWith: [],
    carrierAvailability: ['Premium carriers only'],
    packagingRequirements: ['Professional packaging', 'Protective covering', 'Assembly tools if needed'],
    riskLevel: 'low',
    category: 'delivery'
  },
  {
    type: 'inside-delivery',
    label: 'Inside Delivery',
    description: 'Delivery inside building beyond threshold',
    fee: 45,
    icon: Building,
    requirements: ['Access to building', 'Clear pathway', 'Recipient presence'],
    deliveryImpact: 'May require appointment',
    incompatibleWith: [],
    carrierAvailability: ['Most carriers'],
    packagingRequirements: ['Standard packaging', 'Floor protection if needed'],
    riskLevel: 'medium',
    category: 'delivery'
  },
  {
    type: 'liftgate-pickup',
    label: 'Liftgate Required at Pickup',
    description: 'Hydraulic lift for ground-level pickup',
    fee: 35,
    icon: Truck,
    requirements: ['Liftgate-equipped vehicle', 'Ground-level access'],
    deliveryImpact: 'No impact on delivery time',
    incompatibleWith: [],
    carrierAvailability: ['Most carriers'],
    packagingRequirements: ['Palletized preferred', 'Forklift-ready if applicable'],
    riskLevel: 'medium',
    category: 'handling'
  },
  {
    type: 'liftgate-delivery',
    label: 'Liftgate Required at Delivery',
    description: 'Hydraulic lift for ground-level delivery',
    fee: 35,
    icon: Package,
    requirements: ['Liftgate-equipped vehicle', 'Ground-level access'],
    deliveryImpact: 'May add 1 business day',
    incompatibleWith: [],
    carrierAvailability: ['Most carriers'],
    packagingRequirements: ['Palletized preferred', 'Stable base required'],
    riskLevel: 'medium',
    category: 'handling'
  }
];

interface BundleDiscount {
  combinations: SpecialHandlingType[];
  discount: number;
  description: string;
}

const bundleDiscounts: BundleDiscount[] = [
  {
    combinations: ['liftgate-pickup', 'liftgate-delivery'],
    discount: 10,
    description: 'Both pickup and delivery liftgate'
  },
  {
    combinations: ['fragile', 'this-side-up'],
    discount: 5,
    description: 'Combined protective handling'
  },
  {
    combinations: ['white-glove', 'inside-delivery'],
    discount: 25,
    description: 'White glove includes inside delivery'
  }
];

interface SpecialHandlingSelectorProps {
  value: SpecialHandlingType[];
  onChange: (handling: SpecialHandlingType[]) => void;
  packageWeight: number;
  packageType: string;
  className?: string;
}

export function SpecialHandlingSelector({
  value,
  onChange,
  packageWeight,
  packageType,
  className
}: SpecialHandlingSelectorProps) {
  const [totalFees, setTotalFees] = useState(0);
  const [appliedDiscounts, setAppliedDiscounts] = useState<BundleDiscount[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [expandedOptions, setExpandedOptions] = useState<Set<SpecialHandlingType>>(new Set());

  console.log('[SpecialHandlingSelector] Rendering with:', {
    value,
    packageWeight,
    packageType,
    totalFees
  });

  useEffect(() => {
    // Calculate total fees and discounts
    let baseFees = 0;
    const applicableDiscounts: BundleDiscount[] = [];
    const newWarnings: string[] = [];

    // Calculate base fees
    value.forEach(handling => {
      const option = specialHandlingCatalog.find(opt => opt.type === handling);
      if (option) {
        baseFees += option.fee;
      }
    });

    // Check for bundle discounts
    bundleDiscounts.forEach(bundle => {
      const hasAllItems = bundle.combinations.every(item => value.includes(item));
      if (hasAllItems) {
        applicableDiscounts.push(bundle);
        baseFees -= bundle.discount;
      }
    });

    // Check for incompatibilities and warnings
    value.forEach(handling => {
      const option = specialHandlingCatalog.find(opt => opt.type === handling);
      if (option) {
        // Check incompatibilities
        const incompatible = option.incompatibleWith.filter(inc => value.includes(inc));
        if (incompatible.length > 0) {
          newWarnings.push(`${option.label} is incompatible with ${incompatible.join(', ')}`);
        }

        // Check weight/package type warnings
        if (handling === 'liftgate-pickup' || handling === 'liftgate-delivery') {
          if (packageWeight < 50) {
            newWarnings.push('Liftgate service typically not needed for packages under 50 lbs');
          }
        }

        if (handling === 'white-glove' && packageType === 'envelope') {
          newWarnings.push('White glove service not applicable to envelope packages');
        }
      }
    });

    setTotalFees(Math.max(0, baseFees));
    setAppliedDiscounts(applicableDiscounts);
    setWarnings(newWarnings);

    console.log('[SpecialHandlingSelector] Fees calculated:', {
      baseFees,
      finalFees: Math.max(0, baseFees),
      discounts: applicableDiscounts,
      warnings: newWarnings
    });
  }, [value, packageWeight, packageType]);

  const handleOptionToggle = (optionType: SpecialHandlingType) => {
    const newValue = value.includes(optionType)
      ? value.filter(item => item !== optionType)
      : [...value, optionType];
    
    console.log('[SpecialHandlingSelector] Option toggled:', {
      optionType,
      wasSelected: value.includes(optionType),
      newValue
    });
    
    onChange(newValue);
  };

  const toggleExpanded = (optionType: SpecialHandlingType) => {
    const newExpanded = new Set(expandedOptions);
    if (newExpanded.has(optionType)) {
      newExpanded.delete(optionType);
    } else {
      newExpanded.add(optionType);
    }
    setExpandedOptions(newExpanded);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'protection': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'delivery': return 'bg-green-50 text-green-700 border-green-200';
      case 'handling': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'special': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Special Handling Requirements
        </label>
        
        <div className="space-y-4">
          {specialHandlingCatalog.map((option) => {
            const IconComponent = option.icon;
            const isSelected = value.includes(option.type);
            const isExpanded = expandedOptions.has(option.type);
            
            return (
              <Card
                key={option.type}
                className={cn(
                  'transition-all duration-200',
                  isSelected 
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                    : 'hover:border-gray-300'
                )}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleOptionToggle(option.type)}
                      className="mt-1"
                    />
                    <div className={cn(
                      'p-2 rounded-lg',
                      isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {option.label}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className={cn('text-xs', getCategoryColor(option.category))}
                          >
                            {option.category}
                          </Badge>
                          <div className="flex items-center text-sm font-medium text-gray-900">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${option.fee}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpanded(option.type)}
                            className="p-1 h-auto"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </p>
                      
                      {isExpanded && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="text-xs font-medium text-gray-900 mb-2">Requirements</h4>
                            <ul className="space-y-1">
                              {option.requirements.map((req, index) => (
                                <li key={index} className="text-xs text-gray-600 flex items-center">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-900 mb-2">Packaging Requirements</h4>
                            <ul className="space-y-1">
                              {option.packagingRequirements.map((req, index) => (
                                <li key={index} className="text-xs text-gray-600 flex items-center">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-900 mb-2">Delivery Impact</h4>
                            <p className="text-xs text-gray-600">{option.deliveryImpact}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-xs font-medium text-gray-900 mb-2">Carrier Availability</h4>
                            <p className="text-xs text-gray-600">{option.carrierAvailability.join(', ')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Cost Summary */}
      {value.length > 0 && (
        <Card className="p-4 bg-gray-50 border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Special Handling Cost Summary
            </h3>
            <div className="text-xl font-bold text-gray-900">
              ${totalFees.toFixed(2)}
            </div>
          </div>
          
          <div className="space-y-2">
            {value.map(handling => {
              const option = specialHandlingCatalog.find(opt => opt.type === handling);
              if (!option) return null;
              
              return (
                <div key={handling} className="flex justify-between text-sm">
                  <span className="text-gray-700">{option.label}</span>
                  <span className="text-gray-900 font-medium">${option.fee}</span>
                </div>
              );
            })}
            
            {appliedDiscounts.map((discount, index) => (
              <div key={index} className="flex justify-between text-sm text-green-600">
                <span>Bundle Discount: {discount.description}</span>
                <span>-${discount.discount}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bundle Discounts Available */}
      {bundleDiscounts.some(bundle => 
        bundle.combinations.some(item => value.includes(item)) && 
        !bundle.combinations.every(item => value.includes(item))
      ) && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <strong>Available Bundle Discounts:</strong>
            <div className="mt-2 space-y-1">
              {bundleDiscounts
                .filter(bundle => 
                  bundle.combinations.some(item => value.includes(item)) && 
                  !bundle.combinations.every(item => value.includes(item))
                )
                .map((bundle, index) => (
                  <div key={index} className="text-sm">
                    Add {bundle.combinations.filter(item => !value.includes(item)).join(', ')} 
                    to save ${bundle.discount} ({bundle.description})
                  </div>
                ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {warnings.map((warning, index) => (
                <div key={index} className="text-sm">{warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
