'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Calculator } from 'lucide-react';
import { PackageInfo, SpecialHandling, PACKAGE_TYPE_LIMITS, SPECIAL_HANDLING_FEES } from '@/lib/types';

interface PackageInputProps {
  packageInfo: Partial<PackageInfo>;
  onChange: (packageInfo: Partial<PackageInfo>) => void;
  errors?: Record<string, string>;
}

const PACKAGE_TYPES = [
  { 
    id: 'envelope', 
    name: 'Envelope/Document', 
    description: 'Up to 1 lb, 12"×9"×0.5"',
    examples: 'Documents, letters, small items'
  },
  { 
    id: 'small', 
    name: 'Small Package', 
    description: 'Up to 50 lbs, 24"×18"×12"',
    examples: 'Books, electronics, clothing'
  },
  { 
    id: 'medium', 
    name: 'Medium Package', 
    description: '51-150 lbs, 36"×24"×18"',
    examples: 'Computer equipment, appliances'
  },
  { 
    id: 'large', 
    name: 'Large Package', 
    description: '151-500 lbs, 48"×36"×24"',
    examples: 'Furniture, machinery'
  },
  { 
    id: 'pallet', 
    name: 'Pallet', 
    description: '500-2500 lbs, 96"×48"×72"',
    examples: 'Bulk goods, industrial equipment'
  },
  { 
    id: 'crate', 
    name: 'Crate/Custom', 
    description: 'Up to 5000 lbs, 120"×96"×96"',
    examples: 'Heavy machinery, custom items'
  }
];

const SPECIAL_HANDLING_OPTIONS = [
  { id: 'fragile', name: 'Fragile/Handle with Care', fee: 15 },
  { id: 'this-side-up', name: 'This Side Up', fee: 5 },
  { id: 'temperature-controlled', name: 'Temperature Controlled', fee: 75 },
  { id: 'hazmat', name: 'Hazardous Materials', fee: 50 },
  { id: 'white-glove', name: 'White Glove Service', fee: 125 },
  { id: 'inside-delivery', name: 'Inside Delivery', fee: 45 },
  { id: 'liftgate-pickup', name: 'Liftgate Required at Pickup', fee: 35 },
  { id: 'liftgate-delivery', name: 'Liftgate Required at Delivery', fee: 35 }
];

const CONTENT_CATEGORIES = [
  { id: 'electronics', name: 'Electronics/Computer Equipment' },
  { id: 'automotive', name: 'Automotive Parts' },
  { id: 'industrial', name: 'Industrial Equipment/Machinery' },
  { id: 'documents', name: 'Documents/Legal Papers' },
  { id: 'clothing', name: 'Clothing/Textiles' },
  { id: 'food', name: 'Food/Beverage' },
  { id: 'medical', name: 'Medical Equipment/Supplies' },
  { id: 'furniture', name: 'Furniture/Home Goods' },
  { id: 'raw-materials', name: 'Raw Materials' },
  { id: 'other', name: 'Other' }
];

export function PackageInput({ packageInfo, onChange, errors = {} }: PackageInputProps) {
  const [dimensionalWeight, setDimensionalWeight] = useState(0);
  const [billingWeight, setBillingWeight] = useState(0);

  const updateField = (field: keyof PackageInfo, value: any) => {
    onChange({
      ...packageInfo,
      [field]: value
    });
  };

  const updateDimensions = (field: string, value: number) => {
    const newDimensions = {
      ...packageInfo.dimensions,
      [field]: value
    };
    updateField('dimensions', newDimensions);
  };

  const updateWeight = (field: string, value: any) => {
    const newWeight = {
      ...packageInfo.weight,
      [field]: value
    };
    updateField('weight', newWeight);
  };

  const toggleSpecialHandling = (handlingId: string) => {
    const current = packageInfo.specialHandling || [];
    const exists = current.includes(handlingId as SpecialHandling);
    
    if (exists) {
      updateField('specialHandling', current.filter(h => h !== handlingId));
    } else {
      updateField('specialHandling', [...current, handlingId as SpecialHandling]);
    }
  };

  // Calculate dimensional weight
  useEffect(() => {
    if (packageInfo.dimensions?.length && packageInfo.dimensions?.width && packageInfo.dimensions?.height) {
      const volume = packageInfo.dimensions.length * packageInfo.dimensions.width * packageInfo.dimensions.height;
      const dimWeight = volume / 166; // Standard divisor for dimensional weight
      setDimensionalWeight(dimWeight);
      
      const actualWeight = packageInfo.weight?.value || 0;
      setBillingWeight(Math.max(actualWeight, dimWeight));
    }
  }, [packageInfo.dimensions, packageInfo.weight]);

  // Calculate total special handling fees
  const totalSpecialHandlingFees = (packageInfo.specialHandling || []).reduce((total, handlingId) => {
    const fee = SPECIAL_HANDLING_FEES[handlingId] || 0;
    return total + fee;
  }, 0);

  // Get package type limits
  const selectedTypeId = packageInfo.type;
  const typeLimits = selectedTypeId ? PACKAGE_TYPE_LIMITS[selectedTypeId] : null;

  // Validate against type limits
  const weightExceeded = typeLimits && packageInfo.weight?.value && packageInfo.weight.value > typeLimits.maxWeight;
  const volumeExceeded = typeLimits && packageInfo.dimensions?.length && packageInfo.dimensions?.width && packageInfo.dimensions?.height &&
    (packageInfo.dimensions.length * packageInfo.dimensions.width * packageInfo.dimensions.height) > typeLimits.maxVolume;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-purple-600" />
          Package Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Package Type Selection */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="package-type">Package Type *</Label>
            <Select 
              value={packageInfo.type || ''} 
              onValueChange={(value) => updateField('type', value)}
            >
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select package type" />
              </SelectTrigger>
              <SelectContent>
                {PACKAGE_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{type.name}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type}</p>
            )}
            {selectedTypeId && (
              <div className="text-xs text-muted-foreground">
                Examples: {PACKAGE_TYPES.find(t => t.id === selectedTypeId)?.examples}
              </div>
            )}
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Dimensions
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length *</Label>
              <Input
                id="length"
                type="number"
                value={packageInfo.dimensions?.length || ''}
                onChange={(e) => updateDimensions('length', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.1"
                className={errors.length ? 'border-red-500' : ''}
              />
              {errors.length && (
                <p className="text-sm text-red-600">{errors.length}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Width *</Label>
              <Input
                id="width"
                type="number"
                value={packageInfo.dimensions?.width || ''}
                onChange={(e) => updateDimensions('width', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.1"
                className={errors.width ? 'border-red-500' : ''}
              />
              {errors.width && (
                <p className="text-sm text-red-600">{errors.width}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height *</Label>
              <Input
                id="height"
                type="number"
                value={packageInfo.dimensions?.height || ''}
                onChange={(e) => updateDimensions('height', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.1"
                className={errors.height ? 'border-red-500' : ''}
              />
              {errors.height && (
                <p className="text-sm text-red-600">{errors.height}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select 
                value={packageInfo.dimensions?.unit || 'in'} 
                onValueChange={(value) => updateDimensions('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">Inches</SelectItem>
                  <SelectItem value="cm">Centimeters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Weight Calculations */}
          {dimensionalWeight > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <h5 className="font-medium text-sm">Weight Calculations</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Dimensional Weight:</span>
                  <div className="font-medium">{dimensionalWeight.toFixed(1)} lbs</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Actual Weight:</span>
                  <div className="font-medium">{packageInfo.weight?.value || 0} lbs</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Billing Weight:</span>
                  <div className="font-medium text-blue-600">{billingWeight.toFixed(1)} lbs</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Weight */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight *</Label>
              <Input
                id="weight"
                type="number"
                value={packageInfo.weight?.value || ''}
                onChange={(e) => updateWeight('value', parseFloat(e.target.value) || 0)}
                placeholder="0"
                min="0"
                step="0.1"
                className={errors.weight ? 'border-red-500' : ''}
              />
              {errors.weight && (
                <p className="text-sm text-red-600">{errors.weight}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight-unit">Weight Unit</Label>
              <Select 
                value={packageInfo.weight?.unit || 'lbs'} 
                onValueChange={(value) => updateWeight('unit', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Package Type Validation Warnings */}
          {(weightExceeded || volumeExceeded) && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Package Size Warning</span>
              </div>
              <div className="mt-2 text-sm text-yellow-700">
                {weightExceeded && <div>Weight exceeds {typeLimits?.maxWeight} lbs limit for this package type</div>}
                {volumeExceeded && <div>Dimensions exceed size limit for this package type</div>}
                <div className="mt-1">Consider selecting a larger package type or freight service.</div>
              </div>
            </div>
          )}
        </div>

        {/* Contents and Value */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contents-category">Contents Category *</Label>
              <Select 
                value={packageInfo.contentsCategory || ''} 
                onValueChange={(value) => updateField('contentsCategory', value)}
              >
                <SelectTrigger className={errors.contentsCategory ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select contents category" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.contentsCategory && (
                <p className="text-sm text-red-600">{errors.contentsCategory}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="declared-value">Declared Value *</Label>
              <div className="flex">
                <Select 
                  value={packageInfo.currency || 'USD'} 
                  onValueChange={(value) => updateField('currency', value)}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="MXN">MXN</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  id="declared-value"
                  type="number"
                  value={packageInfo.declaredValue || ''}
                  onChange={(e) => updateField('declaredValue', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`ml-2 flex-1 ${errors.declaredValue ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.declaredValue && (
                <p className="text-sm text-red-600">{errors.declaredValue}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contents-description">Contents Description *</Label>
            <Textarea
              id="contents-description"
              value={packageInfo.contents || ''}
              onChange={(e) => updateField('contents', e.target.value)}
              placeholder="Describe the contents of your package..."
              className={errors.contents ? 'border-red-500' : ''}
              rows={3}
            />
            {errors.contents && (
              <p className="text-sm text-red-600">{errors.contents}</p>
            )}
          </div>
        </div>

        {/* Special Handling */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-muted-foreground">Special Handling Options</h4>
            {totalSpecialHandlingFees > 0 && (
              <Badge variant="secondary">
                Total Fees: +${totalSpecialHandlingFees}
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SPECIAL_HANDLING_OPTIONS.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={(packageInfo.specialHandling || []).includes(option.id as SpecialHandling)}
                  onCheckedChange={() => toggleSpecialHandling(option.id)}
                />
                <Label htmlFor={option.id} className="text-sm flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>{option.name}</span>
                    <span className="text-green-600 font-medium">+${option.fee}</span>
                  </div>
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}