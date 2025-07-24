'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Package, 
  Truck, 
  Users, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Info,
  Wrench
} from 'lucide-react';
import { type EquipmentRequirements, EquipmentRequirementOption, PackageInfo, EquipmentType } from '@/lib/types';

interface EquipmentRequirementsProps {
  requirements?: EquipmentRequirements;
  onRequirementsUpdate: (requirements: EquipmentRequirements) => void;
  packageInfo: PackageInfo;
  className?: string;
}

/**
 * EquipmentRequirements Component
 * 
 * Task 7.3: Specialized component for equipment selection and loading assistance options
 * Features:
 * - Visual equipment selector with images and descriptions
 * - Dynamic fee calculation and cost impact display
 * - Compatibility validation based on package specifications
 * - Loading assistance level selection
 * - Equipment recommendation engine
 * - Cost optimization suggestions
 */
export function EquipmentRequirements({
  requirements,
  onRequirementsUpdate,
  packageInfo,
  className = ''
}: EquipmentRequirementsProps) {
  console.log('🛠️ [EQUIPMENT-REQUIREMENTS] Rendering equipment requirements component');

  const [selectedEquipment, setSelectedEquipment] = useState<Record<string, boolean>>({
    dolly: requirements?.dolly || false,
    applianceDolly: requirements?.applianceDolly || false,
    furniturePads: requirements?.furniturePads || false,
    straps: requirements?.straps || false,
    palletJack: requirements?.palletJack || false,
    twoPersonTeam: requirements?.twoPersonTeam || false
  });

  const [loadingAssistance, setLoadingAssistance] = useState<'customer' | 'driver-assist' | 'full-service'>(
    requirements?.loadingAssistance || 'customer'
  );

  const [totalEquipmentFee, setTotalEquipmentFee] = useState(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);

  // Equipment options with detailed specifications
  const equipmentOptions: EquipmentRequirementOption[] = [
    {
      id: 'dolly',
      type: 'standard-dolly',
      required: false,
      description: 'Standard hand truck for boxes and small items up to 600 lbs',
      compatibility: ['envelope', 'small', 'medium', 'multiple'],
      recommendedFor: []
    },
    {
      id: 'appliance-dolly',
      type: 'appliance-dolly',
      required: false,
      additionalFee: 15,
      description: 'Heavy-duty dolly with straps for appliances and awkward items up to 800 lbs',
      compatibility: ['large', 'multiple'],
      recommendedFor: ['heavy']
    },
    {
      id: 'furniture-pads',
      type: 'furniture-pads',
      required: false,
      additionalFee: 10,
      description: 'Protective padded blankets for finished surfaces and fragile items',
      compatibility: ['medium', 'large', 'multiple'],
      recommendedFor: ['fragile']
    },
    {
      id: 'straps',
      type: 'straps',
      required: false,
      additionalFee: 5,
      description: 'Securing straps and tie-downs for safe transport',
      compatibility: ['small', 'medium', 'large', 'multiple'],
      recommendedFor: []
    },
    {
      id: 'pallet-jack',
      type: 'pallet-jack',
      required: false,
      additionalFee: 25,
      description: 'Hydraulic pallet jack for palletized shipments up to 5,000 lbs',
      compatibility: ['pallet', 'multiple'],
      recommendedFor: ['heavy']
    },
    {
      id: 'two-person-team',
      type: 'two-person-team',
      required: false,
      additionalFee: 45,
      description: 'Two-person delivery team for items requiring multiple handlers',
      compatibility: ['large', 'pallet', 'multiple'],
      recommendedFor: ['heavy', 'large']
    }
  ];

  // Loading assistance options with pricing
  const loadingAssistanceOptions = [
    {
      value: 'customer',
      label: 'Customer Will Load',
      description: 'Customer or their staff will load packages into vehicle',
      fee: 0
    },
    {
      value: 'driver-assist',
      label: 'Driver Assistance',
      description: 'Driver will help with loading process',
      fee: 25
    },
    {
      value: 'full-service',
      label: 'Full Service Loading',
      description: 'Driver handles complete loading process',
      fee: 65
    }
  ];

  // Generate equipment recommendations based on package info
  const generateRecommendations = useCallback(() => {
    console.log('🛠️ [EQUIPMENT-REQUIREMENTS] Generating recommendations for package:', packageInfo);
    
    const newRecommendations: string[] = [];
    
    // Weight-based recommendations
    if (packageInfo.weight.value > 50) {
      if (packageInfo.type === 'pallet') {
        newRecommendations.push('Pallet jack recommended for heavy palletized items');
      } else {
        newRecommendations.push('Appliance dolly recommended for heavy items over 50 lbs');
      }
    }

    // Package type recommendations
    if (packageInfo.type === 'large' || packageInfo.type === 'multiple') {
      newRecommendations.push('Two-person team recommended for large or multiple packages');
    }

    // Special handling recommendations
    if (packageInfo.specialHandling.includes('fragile')) {
      newRecommendations.push('Furniture pads recommended for fragile items');
    }

    if (packageInfo.specialHandling.includes('this-side-up')) {
      newRecommendations.push('Straps recommended to secure orientation-sensitive packages');
    }

    // Value-based recommendations
    if (packageInfo.declaredValue > 5000) {
      newRecommendations.push('Full service loading recommended for high-value items');
    }

    setRecommendations(newRecommendations);
  }, [packageInfo]);

  // Calculate total equipment fees
  const calculateTotalFee = useCallback(() => {
    console.log('🛠️ [EQUIPMENT-REQUIREMENTS] Calculating total equipment fees');
    
    let total = 0;
    
    // Equipment fees
    equipmentOptions.forEach(option => {
      if (selectedEquipment[option.id] && option.additionalFee) {
        total += option.additionalFee;
      }
    });

    // Loading assistance fee
    const assistanceOption = loadingAssistanceOptions.find(opt => opt.value === loadingAssistance);
    if (assistanceOption) {
      total += assistanceOption.fee;
    }

    setTotalEquipmentFee(total);
  }, [selectedEquipment, loadingAssistance]);

  // Handle equipment selection changes
  const handleEquipmentChange = useCallback((equipmentId: string, checked: boolean) => {
    console.log('🛠️ [EQUIPMENT-REQUIREMENTS] Equipment selection changed:', equipmentId, checked);
    
    setSelectedEquipment(prev => ({
      ...prev,
      [equipmentId]: checked
    }));
  }, []);

  // Handle loading assistance change
  const handleLoadingAssistanceChange = useCallback((value: string) => {
    console.log('🛠️ [EQUIPMENT-REQUIREMENTS] Loading assistance changed:', value);
    
    setLoadingAssistance(value as 'customer' | 'driver-assist' | 'full-service');
  }, []);

  // Update parent component when requirements change
  useEffect(() => {
    console.log('🛠️ [EQUIPMENT-REQUIREMENTS] Requirements changed, updating parent');
    
    const updatedRequirements: EquipmentRequirements = {
      dolly: selectedEquipment.dolly,
      applianceDolly: selectedEquipment['appliance-dolly'] || selectedEquipment.applianceDolly,
      furniturePads: selectedEquipment['furniture-pads'] || selectedEquipment.furniturePads,
      straps: selectedEquipment.straps,
      palletJack: selectedEquipment['pallet-jack'] || selectedEquipment.palletJack,
      twoPersonTeam: selectedEquipment['two-person-team'] || selectedEquipment.twoPersonTeam,
      loadingAssistance
    };
    
    onRequirementsUpdate(updatedRequirements);
  }, [selectedEquipment, loadingAssistance, onRequirementsUpdate]);

  // Generate recommendations and calculate fees on component mount and package changes
  useEffect(() => {
    generateRecommendations();
    calculateTotalFee();
  }, [generateRecommendations, calculateTotalFee]);

  // Check if equipment is compatible with package type
  const isEquipmentCompatible = useCallback((equipment: EquipmentRequirementOption): boolean => {
    return equipment.compatibility.includes(packageInfo.type);
  }, [packageInfo.type]);

  // Check if equipment is recommended for this package
  const isEquipmentRecommended = useCallback((equipment: EquipmentRequirementOption): boolean => {
    if (equipment.recommendedFor?.includes('heavy') && packageInfo.weight.value > 50) return true;
    if (equipment.recommendedFor?.includes('fragile') && packageInfo.specialHandling.includes('fragile')) return true;
    if (equipment.recommendedFor?.includes('large') && (packageInfo.type === 'large' || packageInfo.type === 'multiple')) return true;
    return false;
  }, [packageInfo]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
              <Info className="h-5 w-5" />
              Recommended Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                  <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  {recommendation}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Equipment Selection */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Wrench className="h-5 w-5" />
            Equipment Requirements
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select any specialized equipment needed for your pickup
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {equipmentOptions.map(equipment => {
              const isCompatible = isEquipmentCompatible(equipment);
              const isRecommended = isEquipmentRecommended(equipment);
              
              return (
                <div
                  key={equipment.id}
                  className={`relative border rounded-lg p-4 transition-all ${
                    selectedEquipment[equipment.id] 
                      ? 'border-blue-300 bg-blue-50' 
                      : isRecommended 
                        ? 'border-green-300 bg-green-50'
                        : isCompatible 
                          ? 'border-gray-200 hover:border-gray-300' 
                          : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={equipment.id}
                      checked={selectedEquipment[equipment.id]}
                      onCheckedChange={(checked) => handleEquipmentChange(equipment.id, checked as boolean)}
                      disabled={!isCompatible}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label 
                          htmlFor={equipment.id} 
                          className={`font-medium ${!isCompatible ? 'text-gray-400' : ''}`}
                        >
                          {equipment.description.split(' ')[0] + ' ' + equipment.description.split(' ')[1]}
                        </Label>
                        {equipment.additionalFee && (
                          <Badge variant="secondary" className="text-xs">
                            +${equipment.additionalFee}
                          </Badge>
                        )}
                        {isRecommended && (
                          <Badge variant="default" className="text-xs bg-green-600">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${!isCompatible ? 'text-gray-400' : 'text-gray-600'}`}>
                        {equipment.description}
                      </p>
                      {!isCompatible && (
                        <p className="text-xs text-red-600 mt-1">
                          Not compatible with {packageInfo.type} packages
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Loading Assistance */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Loading Assistance Level
          </CardTitle>
          <p className="text-sm text-gray-600">
            Choose the level of loading assistance you need
          </p>
        </CardHeader>
        <CardContent>
          <RadioGroup value={loadingAssistance} onValueChange={handleLoadingAssistanceChange}>
            <div className="space-y-4">
              {loadingAssistanceOptions.map(option => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={option.value} className="font-medium cursor-pointer">
                        {option.label}
                      </Label>
                      {option.fee > 0 && (
                        <Badge variant="outline">
                          +${option.fee}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Cost Summary */}
      {totalEquipmentFee > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">
                  Total Equipment & Service Fees
                </span>
              </div>
              <span className="text-xl font-bold text-green-900">
                ${totalEquipmentFee}
              </span>
            </div>
            <p className="text-sm text-green-700 mt-2">
              This amount will be added to your shipping cost
            </p>
          </CardContent>
        </Card>
      )}

      {/* Equipment Guidelines */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 mb-2">Equipment Guidelines</p>
              <ul className="text-amber-800 space-y-1 text-xs">
                <li>• Standard dollies are included with most deliveries at no extra charge</li>
                <li>• Specialized equipment is subject to availability and may affect pickup timing</li>
                <li>• Two-person teams are required for items over 150 lbs or awkward dimensions</li>
                <li>• Loading assistance fees are in addition to standard shipping rates</li>
                <li>• Equipment selection affects driver assignment and vehicle type</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
