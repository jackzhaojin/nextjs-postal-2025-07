'use client';

import { useState, useEffect } from 'react';
import { PackageInfo, SpecialHandlingType } from '@/lib/types';
import { PackageTypeSelector } from './PackageTypeSelector';
import { DimensionsInput } from './DimensionsInput';
import { WeightInput } from './WeightInput';
import { DeclaredValueInput } from './DeclaredValueInput';
import { Package, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PackageInfoSectionProps {
  value: PackageInfo;
  onChange: (packageInfo: PackageInfo) => void;
  className?: string;
  errors?: Record<string, string>;
}

const specialHandlingOptions: Array<{
  value: SpecialHandlingType;
  label: string;
  description: string;
  fee: number;
  icon: string;
}> = [
  { value: 'fragile', label: 'Fragile', description: 'Extra care handling', fee: 15, icon: '🛡️' },
  { value: 'this-side-up', label: 'This Side Up', description: 'Orientation specific', fee: 5, icon: '⬆️' },
  { value: 'temperature-controlled', label: 'Temperature Controlled', description: 'Climate controlled transport', fee: 75, icon: '🌡️' },
  { value: 'hazmat', label: 'Hazardous Materials', description: 'Special documentation required', fee: 50, icon: '⚠️' },
  { value: 'white-glove', label: 'White Glove', description: 'Premium handling service', fee: 125, icon: '🧤' },
  { value: 'inside-delivery', label: 'Inside Delivery', description: 'Delivery inside building', fee: 45, icon: '🏢' },
  { value: 'liftgate-pickup', label: 'Liftgate Pickup', description: 'Hydraulic lift for pickup', fee: 35, icon: '🚛' },
  { value: 'liftgate-delivery', label: 'Liftgate Delivery', description: 'Hydraulic lift for delivery', fee: 35, icon: '📦' }
];

const contentsCategories = [
  { value: 'electronics', label: 'Electronics & Technology' },
  { value: 'automotive', label: 'Automotive Parts' },
  { value: 'industrial', label: 'Industrial Equipment' },
  { value: 'documents', label: 'Documents & Papers' },
  { value: 'clothing', label: 'Clothing & Textiles' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'medical', label: 'Medical & Pharmaceutical' },
  { value: 'furniture', label: 'Furniture & Home Goods' },
  { value: 'raw-materials', label: 'Raw Materials' },
  { value: 'other', label: 'Other' }
];

export function PackageInfoSection({ value, onChange, className, errors }: PackageInfoSectionProps) {
  const [dimensionalWeight, setDimensionalWeight] = useState(0);
  const [totalSpecialHandlingFees, setTotalSpecialHandlingFees] = useState(0);
  const [isValidPackage, setIsValidPackage] = useState(false);

  // Calculate dimensional weight when dimensions change
  useEffect(() => {
    const { length, width, height, unit } = value.dimensions;
    
    if (length > 0 && width > 0 && height > 0) {
      // Convert to inches if needed
      const lengthInches = unit === 'cm' ? length / 2.54 : length;
      const widthInches = unit === 'cm' ? width / 2.54 : width;
      const heightInches = unit === 'cm' ? height / 2.54 : height;
      
      // Calculate dimensional weight using 166 divisor
      const dimWeight = (lengthInches * widthInches * heightInches) / 166;
      setDimensionalWeight(Math.ceil(dimWeight));
    } else {
      setDimensionalWeight(0);
    }
  }, [value.dimensions]);

  // Calculate special handling fees
  useEffect(() => {
    const totalFees = value.specialHandling.reduce((total, handling) => {
      const option = specialHandlingOptions.find(opt => opt.value === handling);
      return total + (option?.fee || 0);
    }, 0);
    setTotalSpecialHandlingFees(totalFees);
  }, [value.specialHandling]);

  // Validate package completeness
  useEffect(() => {
    const isValid = value.type !== undefined &&
                   value.dimensions.length > 0 &&
                   value.dimensions.width > 0 &&
                   value.dimensions.height > 0 &&
                   value.weight.value > 0 &&
                   value.declaredValue > 0 &&
                   value.contents.trim().length > 0 &&
                   value.contentsCategory !== undefined;
    
    setIsValidPackage(isValid);
  }, [value]);

  const handlePackageTypeChange = (type: PackageInfo['type']) => {
    onChange({
      ...value,
      type
    });
  };

  const handleDimensionsChange = (dimensions: PackageInfo['dimensions']) => {
    onChange({
      ...value,
      dimensions
    });
  };

  const handleWeightChange = (weight: PackageInfo['weight']) => {
    onChange({
      ...value,
      weight
    });
  };

  const handleDeclaredValueChange = (declaredValue: number) => {
    onChange({
      ...value,
      declaredValue
    });
  };

  const handleCurrencyChange = (currency: PackageInfo['currency']) => {
    onChange({
      ...value,
      currency
    });
  };

  const handleContentsChange = (contents: string) => {
    onChange({
      ...value,
      contents
    });
  };

  const handleContentsCategoryChange = (contentsCategory: PackageInfo['contentsCategory']) => {
    onChange({
      ...value,
      contentsCategory
    });
  };

  const handleSpecialHandlingChange = (handling: SpecialHandlingType, checked: boolean) => {
    const currentHandling = value.specialHandling || [];
    
    if (checked) {
      onChange({
        ...value,
        specialHandling: [...currentHandling, handling]
      });
    } else {
      onChange({
        ...value,
        specialHandling: currentHandling.filter(h => h !== handling)
      });
    }
  };

  const getActualWeightInLbs = () => {
    return value.weight.unit === 'kg' ? value.weight.value * 2.205 : value.weight.value;
  };

  const getBillingWeight = () => {
    return Math.max(getActualWeightInLbs(), dimensionalWeight);
  };

  return (
    <div className={cn('space-y-8', className)}>
      {/* Header with validation status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Package Information</h2>
            <p className="text-sm text-gray-600">Specify package details for accurate pricing</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {isValidPackage ? (
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Complete</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">In Progress</span>
            </div>
          )}
        </div>
      </div>

      {/* Package Type Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
          <span>1. Package Type</span>
          {value.type && <Zap className="w-4 h-4 text-green-500" />}
        </h3>
        <PackageTypeSelector
          value={value.type}
          onChange={handlePackageTypeChange}
          error={errors?.type}
        />
      </div>

      {/* Dimensions Input */}
      {value.type && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <span>2. Package Dimensions</span>
            {value.dimensions.length > 0 && value.dimensions.width > 0 && value.dimensions.height > 0 && 
             <Zap className="w-4 h-4 text-green-500" />}
          </h3>
          <DimensionsInput
            value={value.dimensions}
            onChange={handleDimensionsChange}
            actualWeight={getActualWeightInLbs()}
            packageType={value.type}
            errors={errors}
          />
        </div>
      )}

      {/* Weight Input */}
      {value.type && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <span>3. Package Weight</span>
            {value.weight.value > 0 && <Zap className="w-4 h-4 text-green-500" />}
          </h3>
          <WeightInput
            value={value.weight}
            onChange={handleWeightChange}
            dimensionalWeight={dimensionalWeight}
            packageType={value.type}
            error={errors?.weight || errors?.['weight.value']}
          />
        </div>
      )}

      {/* Declared Value Input */}
      {value.type && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <span>4. Declared Value</span>
            {value.declaredValue > 0 && <Zap className="w-4 h-4 text-green-500" />}
          </h3>
          <DeclaredValueInput
            value={value.declaredValue}
            currency={value.currency}
            onValueChange={handleDeclaredValueChange}
            onCurrencyChange={handleCurrencyChange}
            error={errors?.declaredValue}
          />
        </div>
      )}

      {/* Contents Information */}
      {value.type && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <span>5. Contents Information</span>
            {value.contents.trim().length > 0 && value.contentsCategory && 
             <Zap className="w-4 h-4 text-green-500" />}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contents Category */}
            <div>
              <label htmlFor="contentsCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Contents Category
              </label>
              <select
                id="contentsCategory"
                value={value.contentsCategory || ''}
                onChange={(e) => handleContentsCategoryChange(e.target.value as PackageInfo['contentsCategory'])}
                className={cn(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors?.contentsCategory ? 'border-red-300' : 'border-gray-300'
                )}
              >
                <option value="">Select category...</option>
                {contentsCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors?.contentsCategory && (
                <p className="text-red-600 text-sm mt-1">{errors.contentsCategory}</p>
              )}
            </div>

            {/* Contents Description */}
            <div>
              <label htmlFor="contents" className="block text-sm font-medium text-gray-700 mb-2">
                Contents Description
              </label>
              <textarea
                id="contents"
                rows={3}
                value={value.contents}
                onChange={(e) => handleContentsChange(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                  errors?.contents ? 'border-red-300' : 'border-gray-300'
                )}
                placeholder="Describe the contents of your package..."
              />
              {errors?.contents && (
                <p className="text-red-600 text-sm mt-1">{errors.contents}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Special Handling Options */}
      {value.type && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
            <span>6. Special Handling (Optional)</span>
            {value.specialHandling.length > 0 && <Zap className="w-4 h-4 text-green-500" />}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialHandlingOptions.map(option => (
              <label key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.specialHandling.includes(option.value)}
                  onChange={(e) => handleSpecialHandlingChange(option.value, e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="font-medium text-gray-900">{option.label}</span>
                    <span className="text-sm font-medium text-green-600">+${option.fee}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
          
          {totalSpecialHandlingFees > 0 && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm">
                <span className="font-medium text-green-800">
                  Total Special Handling Fees: ${totalSpecialHandlingFees}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Package Summary */}
      {isValidPackage && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">Package Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-blue-700 font-medium">Type</div>
              <div className="text-blue-900 capitalize">{value.type}</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium">Dimensions</div>
              <div className="text-blue-900">
                {value.dimensions.length}" × {value.dimensions.width}" × {value.dimensions.height}"
              </div>
            </div>
            <div>
              <div className="text-blue-700 font-medium">Billing Weight</div>
              <div className="text-blue-900">{getBillingWeight().toFixed(1)} lbs</div>
            </div>
            <div>
              <div className="text-blue-700 font-medium">Declared Value</div>
              <div className="text-blue-900">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: value.currency
                }).format(value.declaredValue)}
              </div>
            </div>
          </div>
          
          {value.specialHandling.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-blue-700 font-medium text-sm">Special Handling</div>
              <div className="text-blue-900 text-sm">
                {value.specialHandling.map(handling => {
                  const option = specialHandlingOptions.find(opt => opt.value === handling);
                  return option?.label;
                }).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}