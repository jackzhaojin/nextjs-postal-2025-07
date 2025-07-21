'use client';

import { useState, useEffect } from 'react';
import { Dimensions } from '@/lib/types';
import { Calculator, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DimensionsInputProps {
  value: Dimensions;
  onChange: (dimensions: Dimensions) => void;
  actualWeight?: number;
  className?: string;
  errors?: Record<string, string>;
  packageType?: string;
}

const DIMENSIONAL_WEIGHT_DIVISOR = 166;

export function DimensionsInput({ 
  value, 
  onChange, 
  actualWeight = 0,
  className, 
  errors,
  packageType = 'medium'
}: DimensionsInputProps) {
  const [dimensionalWeight, setDimensionalWeight] = useState(0);
  const [billingWeight, setBillingWeight] = useState(0);
  const [volume, setVolume] = useState(0);
  const [isOversized, setIsOversized] = useState(false);

  // Package type limits
  const packageLimits = {
    envelope: { maxLength: 15, maxWidth: 12, maxHeight: 1 },
    small: { maxLength: 20, maxWidth: 20, maxHeight: 12 },
    medium: { maxLength: 36, maxWidth: 24, maxHeight: 18 },
    large: { maxLength: 48, maxWidth: 36, maxHeight: 24 },
    pallet: { maxLength: 48, maxWidth: 40, maxHeight: 84 },
    crate: { maxLength: 96, maxWidth: 96, maxHeight: 96 }
  };

  const currentLimits = packageLimits[packageType as keyof typeof packageLimits] || packageLimits.medium;

  // Calculate dimensional weight and related metrics
  useEffect(() => {
    const { length, width, height, unit } = value;
    
    if (length > 0 && width > 0 && height > 0) {
      // Convert to inches if needed
      const lengthInches = unit === 'cm' ? length / 2.54 : length;
      const widthInches = unit === 'cm' ? width / 2.54 : width;
      const heightInches = unit === 'cm' ? height / 2.54 : height;
      
      // Calculate dimensional weight
      const dimWeight = (lengthInches * widthInches * heightInches) / DIMENSIONAL_WEIGHT_DIVISOR;
      setDimensionalWeight(Math.ceil(dimWeight));
      
      // Calculate billing weight (higher of actual vs dimensional)
      const billing = Math.max(actualWeight, dimWeight);
      setBillingWeight(Math.ceil(billing));
      
      // Calculate volume in cubic inches
      const vol = lengthInches * widthInches * heightInches;
      setVolume(Math.round(vol));
      
      // Check if oversized
      const isOver = lengthInches > currentLimits.maxLength || 
                     widthInches > currentLimits.maxWidth || 
                     heightInches > currentLimits.maxHeight;
      setIsOversized(isOver);
    } else {
      setDimensionalWeight(0);
      setBillingWeight(actualWeight);
      setVolume(0);
      setIsOversized(false);
    }
  }, [value, actualWeight, currentLimits]);

  const handleDimensionChange = (field: keyof Dimensions, inputValue: string) => {
    const numValue = parseFloat(inputValue) || 0;
    onChange({
      ...value,
      [field]: numValue
    });
  };

  const handleUnitChange = (unit: 'in' | 'cm') => {
    // Convert existing values when unit changes
    const conversionFactor = unit === 'cm' ? 2.54 : 1/2.54;
    onChange({
      ...value,
      unit,
      length: value.length > 0 ? Math.round(value.length * conversionFactor * 100) / 100 : 0,
      width: value.width > 0 ? Math.round(value.width * conversionFactor * 100) / 100 : 0,
      height: value.height > 0 ? Math.round(value.height * conversionFactor * 100) / 100 : 0
    });
  };

  const getFieldError = (field: string) => errors?.[field] || errors?.[`dimensions.${field}`];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Unit selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Units:</label>
        <div className="flex rounded-md border border-gray-300 overflow-hidden">
          <button
            type="button"
            onClick={() => handleUnitChange('in')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors',
              value.unit === 'in'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            Inches
          </button>
          <button
            type="button"
            onClick={() => handleUnitChange('cm')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300',
              value.unit === 'cm'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            )}
          >
            Centimeters
          </button>
        </div>
      </div>

      {/* Dimension inputs */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">
            Length
          </label>
          <div className="relative">
            <input
              type="number"
              id="length"
              min="0"
              step="0.1"
              value={value.length || ''}
              onChange={(e) => handleDimensionChange('length', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                getFieldError('length') ? 'border-red-300' : 'border-gray-300'
              )}
              placeholder="0"
            />
            <span className="absolute right-3 top-2.5 text-sm text-gray-400">
              {value.unit}
            </span>
          </div>
          {getFieldError('length') && (
            <p className="text-red-600 text-xs mt-1">{getFieldError('length')}</p>
          )}
        </div>

        <div>
          <label htmlFor="width" className="block text-sm font-medium text-gray-700 mb-1">
            Width
          </label>
          <div className="relative">
            <input
              type="number"
              id="width"
              min="0"
              step="0.1"
              value={value.width || ''}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                getFieldError('width') ? 'border-red-300' : 'border-gray-300'
              )}
              placeholder="0"
            />
            <span className="absolute right-3 top-2.5 text-sm text-gray-400">
              {value.unit}
            </span>
          </div>
          {getFieldError('width') && (
            <p className="text-red-600 text-xs mt-1">{getFieldError('width')}</p>
          )}
        </div>

        <div>
          <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
            Height
          </label>
          <div className="relative">
            <input
              type="number"
              id="height"
              min="0"
              step="0.1"
              value={value.height || ''}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              className={cn(
                'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                getFieldError('height') ? 'border-red-300' : 'border-gray-300'
              )}
              placeholder="0"
            />
            <span className="absolute right-3 top-2.5 text-sm text-gray-400">
              {value.unit}
            </span>
          </div>
          {getFieldError('height') && (
            <p className="text-red-600 text-xs mt-1">{getFieldError('height')}</p>
          )}
        </div>
      </div>

      {/* Visual package representation */}
      {value.length > 0 && value.width > 0 && value.height > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Calculator className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-medium text-gray-900">Package Visualization</h4>
          </div>
          
          {/* Simple 3D representation */}
          <div className="flex items-end space-x-4 mb-4">
            <div className="relative">
              <div 
                className="bg-blue-100 border-2 border-blue-300 rounded"
                style={{
                  width: `${Math.min(value.length * 2, 80)}px`,
                  height: `${Math.min(value.height * 2, 60)}px`,
                  minWidth: '20px',
                  minHeight: '20px'
                }}
              />
              <div 
                className="absolute -top-1 -right-1 bg-blue-200 border border-blue-400 rounded"
                style={{
                  width: `${Math.min(value.width * 1.5, 60)}px`,
                  height: `${Math.min(value.height * 2, 60)}px`,
                  minWidth: '15px',
                  minHeight: '20px',
                  transform: 'skew(-10deg, -10deg)'
                }}
              />
            </div>
            <div className="text-xs text-gray-600">
              <div>{value.length}" L</div>
              <div>{value.width}" W</div>
              <div>{value.height}" H</div>
            </div>
          </div>
        </div>
      )}

      {/* Calculations display */}
      {(dimensionalWeight > 0 || volume > 0) && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600 font-medium">Volume</div>
              <div className="text-blue-900 font-semibold">{volume.toLocaleString()} in³</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium">Dimensional Weight</div>
              <div className="text-blue-900 font-semibold">{dimensionalWeight} lbs</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium">Billing Weight</div>
              <div className="text-blue-900 font-semibold">{billingWeight} lbs</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium">Used for Pricing</div>
              <div className="text-blue-900 font-semibold">
                {billingWeight > actualWeight ? 'Dimensional' : 'Actual'}
              </div>
            </div>
          </div>
          
          {dimensionalWeight > actualWeight && (
            <div className="mt-3 flex items-start space-x-2 text-sm text-amber-800 bg-amber-100 rounded p-2">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Dimensional weight pricing applies.</strong> Your package will be charged based on dimensional weight ({dimensionalWeight} lbs) rather than actual weight ({actualWeight} lbs).
              </div>
            </div>
          )}
        </div>
      )}

      {/* Oversized warning */}
      {isOversized && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <div className="font-medium">Package exceeds {packageType} limits</div>
            <div className="mt-1">
              Maximum dimensions for {packageType}: {currentLimits.maxLength}" × {currentLimits.maxWidth}" × {currentLimits.maxHeight}"
              <br />
              Consider selecting a larger package type or freight service.
            </div>
          </div>
        </div>
      )}

      {/* Package limits reference */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
        <div className="font-medium mb-1">Current package type limits ({packageType}):</div>
        <div>Maximum: {currentLimits.maxLength}" L × {currentLimits.maxWidth}" W × {currentLimits.maxHeight}" H</div>
      </div>
    </div>
  );
}