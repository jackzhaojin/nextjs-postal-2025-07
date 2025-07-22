'use client';

import { useState, useEffect } from 'react';
import { PackageInfo, SpecialHandlingType, HazmatDetails, MultiplePackageDetails } from '@/lib/types';
import { PackageTypeSelector } from './PackageTypeSelector';
import { DimensionsInput } from './DimensionsInput';
import { WeightInput } from './WeightInput';
import { DeclaredValueInput } from './DeclaredValueInput';
import { ContentsSelector } from './ContentsSelector';
import { SpecialHandlingSelector } from './SpecialHandlingSelector';
import { HazmatDetailsForm } from './HazmatDetailsForm';
import { MultiplePackagesForm } from './MultiplePackagesForm';
import { Package, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PackageInfoSectionProps {
  value: PackageInfo;
  onChange: (packageInfo: PackageInfo) => void;
  className?: string;
  errors?: Record<string, string>;
}

export function PackageInfoSection({ value, onChange, className, errors }: PackageInfoSectionProps) {
  const [dimensionalWeight, setDimensionalWeight] = useState(0);
  const [isValidPackage, setIsValidPackage] = useState(false);
  const [hazmatDetails, setHazmatDetails] = useState<HazmatDetails | null>(null);

  console.log('[PackageInfoSection] Rendering with:', {
    packageType: value.type,
    contentsCategory: value.contentsCategory,
    specialHandling: value.specialHandling,
    multiplePackages: value.multiplePackages?.numberOfPieces
  });

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

  // Update hazmat details when special handling changes
  useEffect(() => {
    const hasHazmat = value.specialHandling.includes('hazmat');
    if (hasHazmat && !hazmatDetails) {
      // Initialize hazmat details
      const initialHazmat: HazmatDetails = {
        unNumber: '',
        properShippingName: '',
        hazardClass: '3',
        packingGroup: 'III',
        totalQuantity: 1,
        quantityUnit: 'kg',
        emergencyContact: ''
      };
      setHazmatDetails(initialHazmat);
    } else if (!hasHazmat && hazmatDetails) {
      setHazmatDetails(null);
    }
  }, [value.specialHandling, hazmatDetails]);

  // Validate package completeness
  useEffect(() => {
    let isValid = false;
    
    if (value.type === 'multiple' && value.multiplePackages) {
      // For multiple packages, validate the multiple packages form
      isValid = value.multiplePackages.numberOfPieces > 0 &&
                value.multiplePackages.pieces.length > 0 &&
                value.multiplePackages.totalWeight > 0 &&
                value.contentsCategory !== undefined;
    } else {
      // For single packages
      isValid = value.type !== undefined &&
                value.dimensions.length > 0 &&
                value.dimensions.width > 0 &&
                value.dimensions.height > 0 &&
                value.weight.value > 0 &&
                value.declaredValue > 0 &&
                (value.contents?.trim().length ?? 0) > 0 &&
                value.contentsCategory !== undefined;
    }
    
    // Additional validation for hazmat
    if (value.specialHandling.includes('hazmat')) {
      isValid = isValid && hazmatDetails !== null && 
                hazmatDetails.unNumber.length > 0 &&
                hazmatDetails.properShippingName.length > 0 &&
                hazmatDetails.emergencyContact.length > 0;
    }
    
    setIsValidPackage(isValid);
    console.log('[PackageInfoSection] Package validation:', { isValid, type: value.type, hasHazmat: value.specialHandling.includes('hazmat') });
  }, [value, hazmatDetails]);

  const handlePackageTypeChange = (type: PackageInfo['type']) => {
    const updatedPackage = { ...value, type };
    
    // If switching to multiple packages, initialize the structure
    if (type === 'multiple' && !value.multiplePackages) {
      updatedPackage.multiplePackages = {
        numberOfPieces: 2,
        pieces: [],
        totalWeight: 0,
        totalDeclaredValue: 0
      };
    }
    
    onChange(updatedPackage);
    console.log('[PackageInfoSection] Package type changed:', type);
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
    console.log('[PackageInfoSection] Contents category changed:', contentsCategory);
  };

  const handleSpecialHandlingChange = (specialHandling: SpecialHandlingType[]) => {
    onChange({
      ...value,
      specialHandling
    });
    console.log('[PackageInfoSection] Special handling changed:', specialHandling);
  };

  const handleHandlingSuggestionsApply = (suggestions: SpecialHandlingType[]) => {
    handleSpecialHandlingChange(suggestions);
    console.log('[PackageInfoSection] Applied handling suggestions:', suggestions);
  };

  const handleMultiplePackagesChange = (multiplePackages: MultiplePackageDetails | null) => {
    onChange({
      ...value,
      multiplePackages: multiplePackages || undefined
    });
    console.log('[PackageInfoSection] Multiple packages changed:', multiplePackages?.numberOfPieces);
  };

  const handleHazmatDetailsChange = (details: HazmatDetails | null) => {
    setHazmatDetails(details);
    console.log('[PackageInfoSection] Hazmat details changed:', details?.unNumber);
  };

  const getActualWeightInLbs = () => {
    if (value.type === 'multiple' && value.multiplePackages) {
      return value.multiplePackages.totalWeight;
    }
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
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2 mb-4">
          <span>1. Package Type</span>
          {value.type && <Zap className="w-4 h-4 text-green-500" />}
        </h3>
        <PackageTypeSelector
          value={value.type}
          onChange={handlePackageTypeChange}
          error={errors?.type}
        />
      </Card>

      {/* Multiple Packages Form */}
      {value.type === 'multiple' && (
        <Card className="p-6">
          <MultiplePackagesForm
            value={value.multiplePackages || null}
            onChange={handleMultiplePackagesChange}
            mainPackageType={value.type}
          />
        </Card>
      )}

      {/* Single Package Details */}
      {value.type && value.type !== 'multiple' && (
        <>
          {/* Dimensions Input */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2 mb-4">
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
          </Card>

          {/* Weight Input */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2 mb-4">
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
          </Card>

          {/* Declared Value Input */}
          <Card className="p-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2 mb-4">
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
          </Card>
        </>
      )}

      {/* Contents Information - For both single and multiple packages */}
      {value.type && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2 mb-4">
            <span>{value.type === 'multiple' ? '2' : '5'}. Contents Information</span>
            {(((value.contents?.trim().length ?? 0) > 0 || value.type === 'multiple') && value.contentsCategory) && 
             <Zap className="w-4 h-4 text-green-500" />}
          </h3>
          
          <ContentsSelector
            value={value.contentsCategory || 'other'}
            onCategoryChange={handleContentsCategoryChange}
            onHandlingSuggestionsApply={handleHandlingSuggestionsApply}
            currentHandling={value.specialHandling}
            currentWeight={getActualWeightInLbs()}
            className="mb-6"
          />

          {/* Contents Description for single packages */}
          {value.type !== 'multiple' && (
            <>
              <Separator className="my-6" />
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
            </>
          )}
        </Card>
      )}

      {/* Special Handling Options */}
      {value.type && (
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2 mb-4">
            <span>{value.type === 'multiple' ? '3' : '6'}. Special Handling</span>
            {value.specialHandling.length > 0 && <Zap className="w-4 h-4 text-green-500" />}
          </h3>
          
          <SpecialHandlingSelector
            value={value.specialHandling}
            onChange={handleSpecialHandlingChange}
            packageWeight={getActualWeightInLbs()}
            packageType={value.type}
          />
        </Card>
      )}

      {/* Hazmat Details Form */}
      {value.specialHandling.includes('hazmat') && (
        <Card className="p-6">
          <HazmatDetailsForm
            value={hazmatDetails}
            onChange={handleHazmatDetailsChange}
            isRequired={true}
          />
        </Card>
      )}

      {/* Package Summary */}
      {isValidPackage && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">Package Summary</h4>
          
          {value.type === 'multiple' && value.multiplePackages ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-blue-700 font-medium">Type</div>
                <div className="text-blue-900">Multiple Packages</div>
              </div>
              <div>
                <div className="text-blue-700 font-medium">Total Pieces</div>
                <div className="text-blue-900">{value.multiplePackages.numberOfPieces}</div>
              </div>
              <div>
                <div className="text-blue-700 font-medium">Total Weight</div>
                <div className="text-blue-900">{value.multiplePackages.totalWeight} lbs</div>
              </div>
              <div>
                <div className="text-blue-700 font-medium">Total Value</div>
                <div className="text-blue-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: value.currency
                  }).format(value.multiplePackages.totalDeclaredValue)}
                </div>
              </div>
            </div>
          ) : (
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
          )}
          
          {value.specialHandling.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-blue-700 font-medium text-sm">Special Handling</div>
              <div className="text-blue-900 text-sm">
                {value.specialHandling.map(handling => handling.replace('-', ' ')).join(', ')}
              </div>
            </div>
          )}

          {value.contentsCategory && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-blue-700 font-medium text-sm">Contents Category</div>
              <div className="text-blue-900 text-sm capitalize">
                {value.contentsCategory.replace('-', ' ')}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
