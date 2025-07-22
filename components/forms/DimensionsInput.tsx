'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Dimensions } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Ruler, AlertTriangle, Info, Box, Calculator } from 'lucide-react';

export interface DimensionMeasurement {
  readonly length: number;
  readonly width: number;
  readonly height: number;
  readonly unit: DimensionUnit;
}

export type DimensionUnit = 'in' | 'cm';

export interface DimensionConstraints {
  readonly maxLength: number;
  readonly maxWidth: number;
  readonly maxHeight: number;
  readonly maxVolume: number;
  readonly unit: DimensionUnit;
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

interface DimensionsInputProps {
  readonly value: Dimensions | null;
  readonly onChange: (dimensions: Dimensions) => void;
  readonly packageType?: string | null;
  readonly constraints?: DimensionConstraints;
  readonly showVolume?: boolean;
  readonly showDimensionalWeight?: boolean;
  readonly validationMode?: 'strict' | 'lenient' | 'disabled';
  readonly onValidationChange?: (result: ValidationResult<DimensionMeasurement>) => void;
  readonly className?: string;
  readonly label?: string;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly actualWeight?: number;
  readonly errors?: Record<string, string>;
}

// Dimension conversion rates
const DIMENSION_CONVERSION_RATES: Record<DimensionUnit, Record<DimensionUnit, number>> = {
  in: { in: 1, cm: 2.54 },
  cm: { in: 0.393701, cm: 1 }
};

// Package type dimension limits (in inches)
const PACKAGE_DIMENSION_LIMITS: Record<string, DimensionConstraints> = {
  envelope: { maxLength: 15, maxWidth: 12, maxHeight: 1, maxVolume: 180, unit: 'in' },
  small: { maxLength: 20, maxWidth: 20, maxHeight: 12, maxVolume: 4800, unit: 'in' },
  medium: { maxLength: 36, maxWidth: 24, maxHeight: 18, maxVolume: 15552, unit: 'in' },
  large: { maxLength: 48, maxWidth: 36, maxHeight: 24, maxVolume: 41472, unit: 'in' },
  pallet: { maxLength: 48, maxWidth: 40, maxHeight: 84, maxVolume: 161280, unit: 'in' },
  crate: { maxLength: 120, maxWidth: 96, maxHeight: 96, maxVolume: 1105920, unit: 'in' },
  multiple: { maxLength: 120, maxWidth: 96, maxHeight: 96, maxVolume: 1105920, unit: 'in' }
};

class DimensionConverter {
  convert(value: number, fromUnit: DimensionUnit, toUnit: DimensionUnit): number {
    if (fromUnit === toUnit) return value;
    
    const conversionRate = DIMENSION_CONVERSION_RATES[fromUnit][toUnit];
    return Number((value * conversionRate).toFixed(2));
  }
  
  convertDimensions(dimensions: DimensionMeasurement, targetUnit: DimensionUnit): DimensionMeasurement {
    if (dimensions.unit === targetUnit) return dimensions;
    
    return {
      length: this.convert(dimensions.length, dimensions.unit, targetUnit),
      width: this.convert(dimensions.width, dimensions.unit, targetUnit),
      height: this.convert(dimensions.height, dimensions.unit, targetUnit),
      unit: targetUnit
    };
  }
  
  calculateVolume(dimensions: DimensionMeasurement): number {
    return dimensions.length * dimensions.width * dimensions.height;
  }
  
  calculateDimensionalWeight(dimensions: DimensionMeasurement, divisor: number = 166): number {
    // Convert to inches for dimensional weight calculation
    const inInches = this.convertDimensions(dimensions, 'in');
    const volume = this.calculateVolume(inInches);
    return Math.ceil(volume / divisor);
  }
}

class DimensionValidator {
  validateDimensions(dimensions: DimensionMeasurement, constraints: DimensionConstraints): ValidationResult<DimensionMeasurement> {
    console.log('DimensionValidator: Validating dimensions', { dimensions, constraints });
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    const converter = new DimensionConverter();
    const convertedDimensions = converter.convertDimensions(dimensions, constraints.unit);
    
    // Check individual dimension limits
    if (convertedDimensions.length > constraints.maxLength) {
      errors.push({
        field: 'length',
        message: `Length cannot exceed ${constraints.maxLength} ${constraints.unit}`,
        code: 'LENGTH_TOO_LARGE'
      });
    }
    
    if (convertedDimensions.width > constraints.maxWidth) {
      errors.push({
        field: 'width',
        message: `Width cannot exceed ${constraints.maxWidth} ${constraints.unit}`,
        code: 'WIDTH_TOO_LARGE'
      });
    }
    
    if (convertedDimensions.height > constraints.maxHeight) {
      errors.push({
        field: 'height',
        message: `Height cannot exceed ${constraints.maxHeight} ${constraints.unit}`,
        code: 'HEIGHT_TOO_LARGE'
      });
    }
    
    // Check volume
    const volume = converter.calculateVolume(convertedDimensions);
    if (volume > constraints.maxVolume) {
      errors.push({
        field: 'volume',
        message: `Total volume cannot exceed ${constraints.maxVolume} cubic ${constraints.unit}`,
        code: 'VOLUME_TOO_LARGE'
      });
    }
    
    // Warnings for approaching limits
    const warningThreshold = 0.9;
    
    if (convertedDimensions.length > constraints.maxLength * warningThreshold) {
      warnings.push({
        field: 'length',
        message: `Length is approaching the maximum limit`,
        code: 'LENGTH_APPROACHING_LIMIT'
      });
    }
    
    if (volume > constraints.maxVolume * warningThreshold) {
      warnings.push({
        field: 'volume',
        message: `Volume is approaching the maximum limit`,
        code: 'VOLUME_APPROACHING_LIMIT'
      });
    }
    
    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? dimensions : null,
      errors,
      warnings
    };
  }
  
  validatePackageCompatibility(dimensions: DimensionMeasurement, packageType: string): ValidationResult<boolean> {
    console.log('DimensionValidator: Validating package compatibility', { dimensions, packageType });
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    const limits = PACKAGE_DIMENSION_LIMITS[packageType];
    if (!limits) {
      warnings.push({
        field: 'packageType',
        message: 'Unknown package type, cannot validate dimension compatibility',
        code: 'UNKNOWN_PACKAGE_TYPE'
      });
      return { isValid: true, data: true, errors, warnings };
    }
    
    const dimensionValidation = this.validateDimensions(dimensions, limits);
    
    return {
      isValid: dimensionValidation.isValid,
      data: dimensionValidation.isValid,
      errors: dimensionValidation.errors.map(error => ({
        ...error,
        message: `${error.message} for ${packageType} package`
      })),
      warnings: dimensionValidation.warnings
    };
  }
}

const DIMENSIONAL_WEIGHT_DIVISOR = 166;

export function DimensionsInput({
  value,
  onChange,
  packageType = 'medium',
  constraints,
  showVolume = true,
  showDimensionalWeight = true,
  validationMode = 'strict',
  onValidationChange,
  className,
  label = 'Package Dimensions',
  error,
  disabled = false,
  actualWeight = 0,
  errors
}: DimensionsInputProps) {
  console.log('DimensionsInput: Rendering with value:', value, 'packageType:', packageType);
  const [unit, setUnit] = useState<DimensionUnit>('in');
  const [isFocused, setIsFocused] = useState<string | null>(null);
  
  // Legacy state for backward compatibility
  const [dimensionalWeight, setDimensionalWeight] = useState(0);
  const [billingWeight, setBillingWeight] = useState(0);
  const [volume, setVolume] = useState(0);
  const [isOversized, setIsOversized] = useState(false);

  const converter = useMemo(() => new DimensionConverter(), []);
  const validator = useMemo(() => new DimensionValidator(), []);

  // Convert legacy Dimensions to DimensionMeasurement for internal use
  const normalizedValue = useMemo((): DimensionMeasurement | null => {
    if (!value) return null;
    
    // Handle legacy Dimensions interface
    if ('unit' in value && 'length' in value && 'width' in value && 'height' in value) {
      return {
        length: value.length,
        width: value.width,
        height: value.height,
        unit: value.unit as DimensionUnit
      };
    }
    
    // Handle DimensionMeasurement interface
    return value as DimensionMeasurement;
  }, [value]);
  
  // Get constraints from package type if not provided
  const effectiveConstraints = useMemo(() => {
    if (constraints) return constraints;
    if (packageType && PACKAGE_DIMENSION_LIMITS[packageType]) {
      return PACKAGE_DIMENSION_LIMITS[packageType];
    }
    return { maxLength: 120, maxWidth: 96, maxHeight: 96, maxVolume: 1105920, unit: 'in' as DimensionUnit };
  }, [constraints, packageType]);
  
  // Validate current dimensions
  const validationResult = useMemo(() => {
    if (!normalizedValue || validationMode === 'disabled') {
      return { isValid: true, data: normalizedValue, errors: [], warnings: [] };
    }
    
    const rangeValidation = validator.validateDimensions(normalizedValue, effectiveConstraints);
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
  
  // Calculate volume and dimensional weight
  const calculations = useMemo(() => {
    if (!normalizedValue) return { volume: 0, dimensionalWeight: 0 };
    
    const volume = converter.calculateVolume(normalizedValue);
    const dimensionalWeight = converter.calculateDimensionalWeight(normalizedValue);
    
    return { volume, dimensionalWeight };
  }, [normalizedValue, converter]);

  // Legacy state updates for backward compatibility
  useEffect(() => {
    if (normalizedValue) {
      const { length, width, height, unit } = normalizedValue;
      
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
        const limits = PACKAGE_DIMENSION_LIMITS[packageType || 'medium'];
        if (limits) {
          const isOver = lengthInches > limits.maxLength || 
                         widthInches > limits.maxWidth || 
                         heightInches > limits.maxHeight;
          setIsOversized(isOver);
        }
      } else {
        setDimensionalWeight(0);
        setBillingWeight(actualWeight);
        setVolume(0);
        setIsOversized(false);
      }
    }
  }, [normalizedValue, actualWeight, packageType]);

  const handleDimensionChange = useCallback((field: 'length' | 'width' | 'height', inputValue: string) => {
    const numValue = parseFloat(inputValue);
    if (isNaN(numValue) || numValue < 0) return;
    
    const newDimensions: DimensionMeasurement = {
      length: field === 'length' ? numValue : normalizedValue?.length || 0,
      width: field === 'width' ? numValue : normalizedValue?.width || 0,
      height: field === 'height' ? numValue : normalizedValue?.height || 0,
      unit: normalizedValue?.unit || unit
    };
    
    // Convert to legacy format for compatibility
    const legacyDimensions: Dimensions = {
      length: newDimensions.length,
      width: newDimensions.width,
      height: newDimensions.height,
      unit: newDimensions.unit as 'in' | 'cm'
    };
    
    onChange(legacyDimensions);
  }, [normalizedValue, unit, onChange]);
  
  const handleUnitChange = useCallback((newUnit: DimensionUnit) => {
    if (normalizedValue) {
      const convertedDimensions = converter.convertDimensions(normalizedValue, newUnit);
      setUnit(newUnit);
      
      // Convert to legacy format for compatibility
      const legacyDimensions: Dimensions = {
        length: convertedDimensions.length,
        width: convertedDimensions.width,
        height: convertedDimensions.height,
        unit: convertedDimensions.unit as 'in' | 'cm'
      };
      
      onChange(legacyDimensions);
    } else {
      setUnit(newUnit);
    }
  }, [normalizedValue, converter, onChange]);

  const getFieldError = (field: string) => errors?.[field] || errors?.[`dimensions.${field}`];
  
  const hasErrors = validationResult.errors.length > 0;
  const hasWarnings = validationResult.warnings.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <Ruler className="w-4 h-4" />
          {label}
          {showDimensionalWeight && normalizedValue && (
            <span className="text-xs text-gray-500 ml-2">
              (Dim. Weight: {calculations.dimensionalWeight} lbs)
            </span>
          )}
        </div>
      </label>

      {/* Unit selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Units:</label>
        <div className="flex rounded-md border border-gray-300 overflow-hidden">
          <button
            type="button"
            onClick={() => handleUnitChange('in')}
            disabled={disabled}
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors',
              (normalizedValue?.unit || unit) === 'in'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            data-testid="unit-in"
          >
            Inches
          </button>
          <button
            type="button"
            onClick={() => handleUnitChange('cm')}
            disabled={disabled}
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300',
              (normalizedValue?.unit || unit) === 'cm'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            data-testid="unit-cm"
          >
            Centimeters
          </button>
        </div>
      </div>

      {/* Dimension inputs */}
      <div className="grid grid-cols-3 gap-3">
        {['length', 'width', 'height'].map((field) => (
          <div key={field} className="space-y-1">
            <label className="block text-xs font-medium text-gray-600 capitalize">
              {field} ({normalizedValue?.unit || unit})
            </label>
            <div className="relative">
              <input
                type="number"
                value={normalizedValue?.[field as keyof DimensionMeasurement] || ''}
                onChange={(e) => handleDimensionChange(field as 'length' | 'width' | 'height', e.target.value)}
                onFocus={() => setIsFocused(field)}
                onBlur={() => setIsFocused(null)}
                step="0.1"
                min="0"
                placeholder="0.0"
                disabled={disabled}
                className={cn(
                  'w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 transition-colors',
                  hasErrors || getFieldError(field) ? 'border-red-300 focus:border-red-500 focus:ring-red-500' :
                  hasWarnings ? 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500' :
                  'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
                  disabled && 'bg-gray-50 text-gray-500'
                )}
                data-testid={`dimension-${field}`}
              />
              {isFocused === field && (hasErrors || hasWarnings || getFieldError(field)) && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  {hasErrors || getFieldError(field) ? (
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Info className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              )}
            </div>
            {getFieldError(field) && (
              <p className="text-red-600 text-xs mt-1">{getFieldError(field)}</p>
            )}
          </div>
        ))}
      </div>

      {/* Enhanced Visual package representation */}
      {normalizedValue && normalizedValue.length > 0 && normalizedValue.width > 0 && normalizedValue.height > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Box className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Package Visualization</span>
          </div>
          
          <div className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-24">
            <div className="text-center space-y-2">
              <div className="text-lg font-mono text-gray-700">
                {normalizedValue.length} × {normalizedValue.width} × {normalizedValue.height} {normalizedValue.unit}
              </div>
              
              {showVolume && (
                <div className="text-sm text-gray-600">
                  Volume: {calculations.volume.toFixed(2)} cubic {normalizedValue.unit}
                </div>
              )}
              
              {showDimensionalWeight && (
                <div className="text-sm text-gray-600">
                  Dimensional Weight: {calculations.dimensionalWeight} lbs
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Package Type Constraints */}
      {packageType && effectiveConstraints && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
          <div className="font-medium mb-1">Limits for {packageType}:</div>
          <div>
            Max: {effectiveConstraints.maxLength} × {effectiveConstraints.maxWidth} × {effectiveConstraints.maxHeight} {effectiveConstraints.unit}
          </div>
        </div>
      )}
      
      {/* Enhanced Validation Messages */}
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

      {/* Oversized warning - Legacy compatibility */}
      {isOversized && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <div className="font-medium">Package exceeds {packageType} limits</div>
            <div className="mt-1">
              Maximum dimensions for {packageType}: {effectiveConstraints.maxLength}" × {effectiveConstraints.maxWidth}" × {effectiveConstraints.maxHeight}"
              <br />
              Consider selecting a larger package type or freight service.
            </div>
          </div>
        </div>
      )}

      {/* Package limits reference - Legacy compatibility */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
        <div className="font-medium mb-1">Current package type limits ({packageType}):</div>
        <div>Maximum: {effectiveConstraints.maxLength}" L × {effectiveConstraints.maxWidth}" W × {effectiveConstraints.maxHeight}" H</div>
      </div>
    </div>
  );
}