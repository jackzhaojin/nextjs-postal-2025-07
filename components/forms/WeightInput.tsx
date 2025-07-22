'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Weight } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Scale, AlertTriangle, Info } from 'lucide-react';

export interface WeightMeasurement {
  readonly value: number;
  readonly unit: WeightUnit;
  readonly precision: number;
  readonly displayFormat: WeightDisplayFormat;
}

export type WeightUnit = 'lbs' | 'kg';
export type WeightDisplayFormat = 'decimal' | 'fractional' | 'mixed';

export interface WeightConstraints {
  readonly min: number;
  readonly max: number;
  readonly unit: WeightUnit;
}

export interface ValidationResult<T> {
  readonly isValid: boolean;
  readonly data: T | null;
  readonly errors: ValidationError[];
  readonly warnings: ValidationWarning[];
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

export interface ValidationWarning {
  readonly field: string;
  readonly message: string;
  readonly code: string;
}

interface WeightInputProps {
  readonly value: Weight | null;
  readonly onChange: (weight: Weight) => void;
  readonly packageType: string | null;
  readonly constraints?: WeightConstraints;
  readonly showBillingWeight?: boolean;
  readonly dimensionalWeight?: number;
  readonly validationMode?: 'strict' | 'lenient' | 'disabled';
  readonly onValidationChange?: (result: ValidationResult<WeightMeasurement>) => void;
  readonly className?: string;
  readonly placeholder?: string;
  readonly label?: string;
  readonly error?: string;
  readonly disabled?: boolean;
}

// Weight conversion rates
const CONVERSION_RATES: Record<WeightUnit, Record<WeightUnit, number>> = {
  lbs: { lbs: 1, kg: 0.453592 },
  kg: { lbs: 2.20462, kg: 1 }
};

// Precision rules by unit
const PRECISION_RULES: Record<WeightUnit, number> = {
  lbs: 1, // 0.1 lb minimum
  kg: 2   // 0.01 kg minimum
};

// Package type weight limits
const PACKAGE_WEIGHT_LIMITS: Record<string, { min: number; max: number; unit: WeightUnit }> = {
  envelope: { min: 0.1, max: 1, unit: 'lbs' },
  small: { min: 0.1, max: 50, unit: 'lbs' },
  medium: { min: 0.1, max: 150, unit: 'lbs' },
  large: { min: 0.1, max: 500, unit: 'lbs' },
  pallet: { min: 1, max: 2500, unit: 'lbs' },
  crate: { min: 1, max: 5000, unit: 'lbs' },
  multiple: { min: 0.1, max: 10000, unit: 'lbs' }
};

class WeightConverter {
  convert(weight: WeightMeasurement, targetUnit: WeightUnit): WeightMeasurement {
    if (weight.unit === targetUnit) return weight;
    
    const conversionRate = CONVERSION_RATES[weight.unit][targetUnit];
    const convertedValue = weight.value * conversionRate;
    const precision = PRECISION_RULES[targetUnit];
    
    return {
      value: Number(convertedValue.toFixed(precision)),
      unit: targetUnit,
      precision,
      displayFormat: weight.displayFormat
    };
  }
}

class WeightValidator {
  validateRange(weight: WeightMeasurement, constraints: WeightConstraints): ValidationResult<WeightMeasurement> {
    console.log('WeightValidator: Validating range', { weight, constraints });
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // Convert weight to constraint unit for comparison
    const converter = new WeightConverter();
    const convertedWeight = converter.convert(weight, constraints.unit);
    
    if (convertedWeight.value < constraints.min) {
      errors.push({
        field: 'weight',
        message: `Weight must be at least ${constraints.min} ${constraints.unit}`,
        code: 'WEIGHT_TOO_LOW'
      });
    }
    
    if (convertedWeight.value > constraints.max) {
      errors.push({
        field: 'weight',
        message: `Weight cannot exceed ${constraints.max} ${constraints.unit}`,
        code: 'WEIGHT_TOO_HIGH'
      });
    }
    
    // Warning for approaching limits
    const warningThreshold = constraints.max * 0.9;
    if (convertedWeight.value > warningThreshold && convertedWeight.value <= constraints.max) {
      warnings.push({
        field: 'weight',
        message: `Weight is approaching the maximum limit of ${constraints.max} ${constraints.unit}`,
        code: 'WEIGHT_APPROACHING_LIMIT'
      });
    }
    
    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? weight : null,
      errors,
      warnings
    };
  }
  
  validatePrecision(value: number, unit: WeightUnit): boolean {
    const precision = PRECISION_RULES[unit];
    const factor = Math.pow(10, precision);
    return Math.round(value * factor) === value * factor;
  }
  
  validatePackageCompatibility(weight: WeightMeasurement, packageType: string): ValidationResult<boolean> {
    console.log('WeightValidator: Validating package compatibility', { weight, packageType });
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    const limits = PACKAGE_WEIGHT_LIMITS[packageType];
    if (!limits) {
      warnings.push({
        field: 'packageType',
        message: 'Unknown package type, cannot validate weight compatibility',
        code: 'UNKNOWN_PACKAGE_TYPE'
      });
      return { isValid: true, data: true, errors, warnings };
    }
    
    const converter = new WeightConverter();
    const convertedWeight = converter.convert(weight, limits.unit);
    
    if (convertedWeight.value < limits.min) {
      errors.push({
        field: 'weight',
        message: `Weight too low for ${packageType} package (minimum: ${limits.min} ${limits.unit})`,
        code: 'WEIGHT_PACKAGE_INCOMPATIBLE_LOW'
      });
    }
    
    if (convertedWeight.value > limits.max) {
      errors.push({
        field: 'weight',
        message: `Weight too high for ${packageType} package (maximum: ${limits.max} ${limits.unit})`,
        code: 'WEIGHT_PACKAGE_INCOMPATIBLE_HIGH'
      });
    }
    
    return {
      isValid: errors.length === 0,
      data: errors.length === 0,
      errors,
      warnings
    };
  }
  
  calculateBillingWeight(actualWeight: WeightMeasurement, dimensionalWeight: number): WeightMeasurement {
    const converter = new WeightConverter();
    const actualInLbs = converter.convert(actualWeight, 'lbs');
    
    return {
      value: Math.max(actualInLbs.value, dimensionalWeight),
      unit: 'lbs',
      precision: 1,
      displayFormat: 'decimal'
    };
  }
}

export function WeightInput({
  value,
  onChange,
  packageType,
  constraints,
  showBillingWeight = false,
  dimensionalWeight,
  validationMode = 'strict',
  onValidationChange,
  className,
  label = 'Weight',
  error,
  disabled = false
}: WeightInputProps) {
  console.log('WeightInput: Rendering with value:', value, 'packageType:', packageType);
  const [unit, setUnit] = useState<WeightUnit>('lbs');
  const [inputValue, setInputValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  
  const converter = useMemo(() => new WeightConverter(), []);
  const validator = useMemo(() => new WeightValidator(), []);

  // Convert legacy Weight to WeightMeasurement for internal use
  const normalizedValue = useMemo((): WeightMeasurement | null => {
    if (!value) return null;
    
    // Handle legacy Weight interface
    if ('unit' in value && ('value' in value)) {
      return {
        value: value.value,
        unit: value.unit as WeightUnit,
        precision: PRECISION_RULES[value.unit as WeightUnit] || 1,
        displayFormat: 'decimal'
      };
    }
    
    // Handle WeightMeasurement interface
    return value as WeightMeasurement;
  }, [value]);
  
  // Initialize input value from prop
  useEffect(() => {
    if (normalizedValue) {
      const convertedWeight = converter.convert(normalizedValue, unit);
      setInputValue(convertedWeight.value.toString());
    } else {
      setInputValue('');
    }
  }, [normalizedValue, unit, converter]);
  
  // Get constraints from package type if not provided
  const effectiveConstraints = useMemo(() => {
    if (constraints) return constraints;
    if (packageType && PACKAGE_WEIGHT_LIMITS[packageType]) {
      return PACKAGE_WEIGHT_LIMITS[packageType];
    }
    return { min: 0.1, max: 10000, unit: 'lbs' as WeightUnit };
  }, [constraints, packageType]);
  
  // Validate current weight
  const validationResult = useMemo(() => {
    if (!normalizedValue || validationMode === 'disabled') {
      return { isValid: true, data: normalizedValue, errors: [], warnings: [] };
    }
    
    const rangeValidation = validator.validateRange(normalizedValue, effectiveConstraints);
    let packageValidation: ValidationResult<boolean> = { isValid: true, data: true, errors: [], warnings: [] };
    
    if (packageType) {
      packageValidation = validator.validatePackageCompatibility(normalizedValue, packageType);
    }
    
    return {
      isValid: rangeValidation.isValid && packageValidation.isValid,
      data: rangeValidation.isValid && packageValidation.isValid ? normalizedValue : null,
      errors: [...rangeValidation.errors, ...packageValidation.errors],
      warnings: [...rangeValidation.warnings, ...packageValidation.warnings]
    };
  }, [normalizedValue, effectiveConstraints, packageType, validator, validationMode]);
  
  // Notify parent of validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validationResult);
    }
  }, [validationResult, onValidationChange]);
  
  // Calculate billing weight
  const billingWeight = useMemo(() => {
    if (!normalizedValue || !dimensionalWeight) return null;
    return validator.calculateBillingWeight(normalizedValue, dimensionalWeight);
  }, [normalizedValue, dimensionalWeight, validator]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputStr = e.target.value;
    setInputValue(inputStr);
    
    const numValue = parseFloat(inputStr);
    if (!isNaN(numValue) && numValue >= 0) {
      const precision = PRECISION_RULES[unit];
      const weight: WeightMeasurement = {
        value: Number(numValue.toFixed(precision)),
        unit,
        precision,
        displayFormat: 'decimal'
      };
      
      // Convert to legacy format for compatibility
      const legacyWeight: Weight = {
        value: weight.value,
        unit: weight.unit as 'lbs' | 'kg'
      };
      
      onChange(legacyWeight);
    }
  }, [unit, onChange]);
  
  const handleUnitChange = useCallback((newUnit: WeightUnit) => {
    if (normalizedValue) {
      const convertedWeight = converter.convert(normalizedValue, newUnit);
      setUnit(newUnit);
      
      // Convert to legacy format for compatibility
      const legacyWeight: Weight = {
        value: convertedWeight.value,
        unit: convertedWeight.unit as 'lbs' | 'kg'
      };
      
      onChange(legacyWeight);
    } else {
      setUnit(newUnit);
    }
  }, [normalizedValue, converter, onChange]);
  
  const step = useMemo(() => {
    const precision = PRECISION_RULES[unit];
    return Math.pow(10, -precision);
  }, [unit]);

  const hasErrors = validationResult.errors.length > 0;
  const hasWarnings = validationResult.warnings.length > 0;
  
  return (
    <div className={cn('space-y-3', className)}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4" />
          {label}
          {showBillingWeight && billingWeight && (
            <span className="text-xs text-gray-500 ml-2">
              (Billing: {billingWeight.value} {billingWeight.unit})
            </span>
          )}
        </div>
      </label>
      
      {/* Input Group */}
      <div className="relative">
        <div className={cn(
          'flex rounded-md shadow-sm border transition-colors',
          hasErrors ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500' :
          hasWarnings ? 'border-yellow-300 focus-within:border-yellow-500 focus-within:ring-yellow-500' :
          'border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500',
          isFocused && 'ring-1'
        )}>
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            step={step}
            min={step}
            placeholder={`Enter weight in ${unit}`}
            disabled={disabled}
            className="flex-1 px-3 py-2 text-gray-900 placeholder-gray-500 border-none rounded-l-md focus:outline-none focus:ring-0 disabled:bg-gray-50 disabled:text-gray-500"
            data-testid="weight-input"
            id="package-weight-value"
          />
          
          {/* Unit Selector */}
          <div className="flex border-l border-gray-300">
            {(['lbs', 'kg'] as WeightUnit[]).map((unitOption) => (
              <button
                key={unitOption}
                type="button"
                onClick={() => handleUnitChange(unitOption)}
                disabled={disabled}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors border-r border-gray-300 last:border-r-0 last:rounded-r-md',
                  unit === unitOption
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-700 hover:bg-gray-50',
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
                data-testid={`unit-${unitOption}`}
              >
                {unitOption}
              </button>
            ))}
          </div>
        </div>
        
        {/* Validation Icons */}
        {(hasErrors || hasWarnings) && (
          <div className="absolute inset-y-0 right-16 flex items-center pr-3 pointer-events-none">
            {hasErrors ? (
              <AlertTriangle className="w-5 h-5 text-red-400" />
            ) : (
              <Info className="w-5 h-5 text-yellow-400" />
            )}
          </div>
        )}
      </div>
      
      {/* Package Type Constraints */}
      {packageType && effectiveConstraints && (
        <div className="text-xs text-gray-500">
          Range for {packageType}: {effectiveConstraints.min}-{effectiveConstraints.max} {effectiveConstraints.unit}
        </div>
      )}
      
      {/* Billing Weight Info */}
      {showBillingWeight && billingWeight && normalizedValue && (
        <div className="bg-blue-50 rounded-md p-3">
          <div className="text-sm">
            <div className="font-medium text-blue-900">Billing Weight Calculation</div>
            <div className="mt-1 space-y-1 text-blue-700">
              <div>Actual weight: {normalizedValue.value} {normalizedValue.unit}</div>
              {dimensionalWeight && (
                <div>Dimensional weight: {dimensionalWeight} lbs</div>
              )}
              <div className="font-medium">
                Billing weight: {billingWeight.value} {billingWeight.unit}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Validation Messages */}
      {validationResult.errors.length > 0 && (
        <div className="space-y-1">
          {validationResult.errors.map((error, index) => (
            <p key={index} className="text-red-600 text-sm">
              {error.message}
            </p>
          ))}
        </div>
      )}
      
      {validationResult.warnings.length > 0 && (
        <div className="space-y-1">
          {validationResult.warnings.map((warning, index) => (
            <p key={index} className="text-yellow-600 text-sm">
              {warning.message}
            </p>
          ))}
        </div>
      )}
      
      {/* External Error */}
      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}