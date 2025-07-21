'use client';

import { useState, useEffect } from 'react';
import { Weight } from '@/lib/types';
import { Scale, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeightInputProps {
  value: Weight;
  onChange: (weight: Weight) => void;
  dimensionalWeight?: number;
  packageType?: string;
  className?: string;
  error?: string;
}

const packageWeightLimits = {
  envelope: { min: 0.1, max: 1 },
  small: { min: 0.1, max: 50 },
  medium: { min: 0.1, max: 150 },
  large: { min: 0.1, max: 500 },
  pallet: { min: 1, max: 2500 },
  crate: { min: 1, max: 5000 }
};

export function WeightInput({ 
  value, 
  onChange, 
  dimensionalWeight = 0,
  packageType = 'medium',
  className, 
  error 
}: WeightInputProps) {
  const [billingWeight, setBillingWeight] = useState(0);
  const [isOverWeight, setIsOverWeight] = useState(false);
  const [isUnderWeight, setIsUnderWeight] = useState(false);
  const [optimization, setOptimization] = useState('');

  const currentLimits = packageWeightLimits[packageType as keyof typeof packageWeightLimits] || packageWeightLimits.medium;

  // Calculate billing weight and optimization suggestions
  useEffect(() => {
    const weightInLbs = value.unit === 'kg' ? value.value * 2.205 : value.value;
    const billing = Math.max(weightInLbs, dimensionalWeight);
    setBillingWeight(Math.ceil(billing));

    // Check weight limits
    setIsOverWeight(weightInLbs > currentLimits.max);
    setIsUnderWeight(weightInLbs < currentLimits.min && weightInLbs > 0);

    // Generate optimization suggestions
    if (dimensionalWeight > weightInLbs && dimensionalWeight > 0) {
      setOptimization('Consider reducing package dimensions to lower dimensional weight');
    } else if (weightInLbs > currentLimits.max) {
      setOptimization('Consider using a larger package type or freight service');
    } else if (weightInLbs < currentLimits.min && weightInLbs > 0) {
      setOptimization('Consider using a smaller package type for better rates');
    } else {
      setOptimization('');
    }
  }, [value, dimensionalWeight, currentLimits]);

  const handleWeightChange = (inputValue: string) => {
    const numValue = parseFloat(inputValue) || 0;
    onChange({
      ...value,
      value: numValue
    });
  };

  const handleUnitChange = (unit: 'lbs' | 'kg') => {
    // Convert existing value when unit changes
    const conversionFactor = unit === 'kg' ? 0.453592 : 2.205;
    const currentUnit = value.unit;
    
    if (currentUnit !== unit && value.value > 0) {
      const convertedValue = value.value * conversionFactor;
      onChange({
        ...value,
        unit,
        value: Math.round(convertedValue * 100) / 100
      });
    } else {
      onChange({
        ...value,
        unit
      });
    }
  };

  const getWeightInLbs = () => {
    return value.unit === 'kg' ? value.value * 2.205 : value.value;
  };

  const getWeightInKg = () => {
    return value.unit === 'lbs' ? value.value * 0.453592 : value.value;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Weight input with unit selector */}
      <div className="space-y-2">
        <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
          Package Weight
        </label>
        
        <div className="flex space-x-2">
          {/* Weight input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="number"
                id="weight"
                min="0"
                step="0.1"
                value={value.value || ''}
                onChange={(e) => handleWeightChange(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                  error || isOverWeight || isUnderWeight ? 'border-red-300' : 'border-gray-300'
                )}
                placeholder="0.0"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Scale className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Unit selector */}
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => handleUnitChange('lbs')}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors',
                value.unit === 'lbs'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              lbs
            </button>
            <button
              type="button"
              onClick={() => handleUnitChange('kg')}
              className={cn(
                'px-3 py-2 text-sm font-medium transition-colors border-l border-gray-300',
                value.unit === 'kg'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              )}
            >
              kg
            </button>
          </div>
        </div>

        {/* Error messages */}
        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
        
        {isOverWeight && (
          <div className="flex items-start space-x-2 text-sm text-red-800 bg-red-50 rounded p-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Weight exceeds {packageType} limit.</strong> Maximum weight for {packageType} packages is {currentLimits.max} lbs.
            </div>
          </div>
        )}
        
        {isUnderWeight && (
          <div className="flex items-start space-x-2 text-sm text-amber-800 bg-amber-50 rounded p-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Weight below minimum.</strong> Minimum weight for {packageType} packages is {currentLimits.min} lbs.
            </div>
          </div>
        )}
      </div>

      {/* Weight conversion display */}
      {value.value > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 font-medium">Weight (lbs)</div>
              <div className="text-gray-900 font-semibold">{getWeightInLbs().toFixed(2)} lbs</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium">Weight (kg)</div>
              <div className="text-gray-900 font-semibold">{getWeightInKg().toFixed(2)} kg</div>
            </div>
          </div>
        </div>
      )}

      {/* Billing weight calculation */}
      {(dimensionalWeight > 0 || value.value > 0) && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-medium text-gray-900">Billing Weight Calculation</h4>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-600 font-medium">Actual Weight</div>
              <div className="text-blue-900 font-semibold">{getWeightInLbs().toFixed(1)} lbs</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium">Dimensional Weight</div>
              <div className="text-blue-900 font-semibold">{dimensionalWeight.toFixed(1)} lbs</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium">Billing Weight</div>
              <div className="text-blue-900 font-semibold text-lg">{billingWeight} lbs</div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-blue-800">
            Billing weight is the greater of actual weight and dimensional weight.
            {billingWeight > getWeightInLbs() && ' Dimensional weight applies for pricing.'}
          </div>
        </div>
      )}

      {/* Optimization suggestions */}
      {optimization && (
        <div className="flex items-start space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <div className="text-sm text-green-800">
            <div className="font-medium">Optimization Tip</div>
            <div className="mt-1">{optimization}</div>
          </div>
        </div>
      )}

      {/* Weight scale visual representation */}
      {value.value > 0 && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-600 mb-2">Weight Scale ({packageType})</div>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  isOverWeight ? 'bg-red-500' : 
                  getWeightInLbs() > currentLimits.max * 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                )}
                style={{ 
                  width: `${Math.min((getWeightInLbs() / currentLimits.max) * 100, 100)}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{currentLimits.min} lbs</span>
              <span>{currentLimits.max} lbs</span>
            </div>
          </div>
        </div>
      )}

      {/* Package type weight limits reference */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
        <div className="font-medium mb-1">Weight limits for {packageType}:</div>
        <div>Minimum: {currentLimits.min} lbs • Maximum: {currentLimits.max} lbs</div>
      </div>
    </div>
  );
}