'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { PackageInfo } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DollarSign, AlertTriangle, Info, Shield } from 'lucide-react';

export interface ValueMeasurement {
  readonly amount: number;
  readonly currency: CurrencyCode;
  readonly insuranceRate: number;
  readonly insuranceFee: number;
}

export type CurrencyCode = 'USD' | 'CAD' | 'MXN' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  readonly code: CurrencyCode;
  readonly symbol: string;
  readonly name: string;
  readonly minValue: number;
  readonly maxValue: number;
  readonly step: number;
}

export interface InsuranceCalculation {
  readonly rate: number;
  readonly minimumFee: number;
  readonly maximumFee: number;
  readonly calculatedFee: number;
  readonly coverage: number;
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

interface DeclaredValueInputProps {
  readonly value: ValueMeasurement | number | null;
  readonly currency?: PackageInfo['currency'];
  readonly onValueChange?: (value: number) => void;
  readonly onCurrencyChange?: (currency: PackageInfo['currency']) => void;
  readonly onChange?: (value: ValueMeasurement | number) => void;
  readonly packageType?: string | null;
  readonly showInsurance?: boolean;
  readonly showCurrencySelector?: boolean;
  readonly validationMode?: 'strict' | 'lenient' | 'disabled';
  readonly onValidationChange?: (result: ValidationResult<ValueMeasurement>) => void;
  readonly className?: string;
  readonly label?: string;
  readonly error?: string;
  readonly disabled?: boolean;
}

// Enhanced currency configurations
const CURRENCY_CONFIGS: Record<string, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', minValue: 1, maxValue: 100000, step: 1 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', minValue: 1, maxValue: 130000, step: 1 },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', minValue: 20, maxValue: 2000000, step: 10 }
};

// Legacy currency info for backward compatibility
const currencyInfo = {
  USD: { symbol: '$', name: 'US Dollar', rate: 1.0 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', rate: 1.35 },
  MXN: { symbol: 'M$', name: 'Mexican Peso', rate: 18.5 }
};

// Exchange rates (for reference - in production would come from API)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { USD: 1, CAD: 1.35, MXN: 18.5 },
  CAD: { USD: 0.74, CAD: 1, MXN: 13.7 },
  MXN: { USD: 0.054, CAD: 0.073, MXN: 1 }
};

// Enhanced insurance rates by package type
const INSURANCE_RATES: Record<string, InsuranceCalculation> = {
  envelope: { rate: 0.5, minimumFee: 2.50, maximumFee: 50, calculatedFee: 0, coverage: 100 },
  small: { rate: 0.75, minimumFee: 3.50, maximumFee: 75, calculatedFee: 0, coverage: 100 },
  medium: { rate: 1.0, minimumFee: 5.00, maximumFee: 100, calculatedFee: 0, coverage: 100 },
  large: { rate: 1.25, minimumFee: 7.50, maximumFee: 150, calculatedFee: 0, coverage: 100 },
  pallet: { rate: 1.5, minimumFee: 15.00, maximumFee: 500, calculatedFee: 0, coverage: 100 },
  crate: { rate: 2.0, minimumFee: 25.00, maximumFee: 1000, calculatedFee: 0, coverage: 100 },
  multiple: { rate: 1.5, minimumFee: 10.00, maximumFee: 750, calculatedFee: 0, coverage: 100 }
};

// Legacy insurance rates for backward compatibility
const insuranceRates = {
  basic: { min: 0, max: 1000, rate: 0.005 },
  standard: { min: 1001, max: 10000, rate: 0.008 },
  premium: { min: 10001, max: 100000, rate: 0.012 }
};

class CurrencyConverter {
  convert(amount: number, fromCurrency: string, toCurrency: string): number {
    if (fromCurrency === toCurrency) return amount;
    
    const rate = EXCHANGE_RATES[fromCurrency]?.[toCurrency] || 1;
    return Number((amount * rate).toFixed(2));
  }
  
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
}

class InsuranceCalculator {
  calculateInsurance(declaredValue: number, packageType: string, currency: string = 'USD'): InsuranceCalculation {
    console.log('InsuranceCalculator: Calculating insurance', { declaredValue, packageType, currency });
    const baseRates = INSURANCE_RATES[packageType] || INSURANCE_RATES.medium;
    
    // Convert declared value to USD for calculation
    const converter = new CurrencyConverter();
    const valueInUSD = converter.convert(declaredValue, currency, 'USD');
    
    // Calculate insurance fee
    const calculatedFee = Math.max(
      (valueInUSD * baseRates.rate) / 100,
      baseRates.minimumFee
    );
    
    const finalFee = Math.min(calculatedFee, baseRates.maximumFee);
    
    return {
      ...baseRates,
      calculatedFee: Number(finalFee.toFixed(2))
    };
  }
}

class ValueValidator {
  validateValue(value: ValueMeasurement): ValidationResult<ValueMeasurement> {
    console.log('ValueValidator: Validating value', { value });
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    const config = CURRENCY_CONFIGS[value.currency];
    
    if (value.amount < config.minValue) {
      errors.push({
        field: 'amount',
        message: `Declared value must be at least ${config.symbol}${config.minValue}`,
        code: 'VALUE_TOO_LOW'
      });
    }
    
    if (value.amount > config.maxValue) {
      errors.push({
        field: 'amount',
        message: `Declared value cannot exceed ${config.symbol}${config.maxValue.toLocaleString()}`,
        code: 'VALUE_TOO_HIGH'
      });
    }
    
    // Warning for high values
    const warningThreshold = config.maxValue * 0.8;
    if (value.amount > warningThreshold && value.amount <= config.maxValue) {
      warnings.push({
        field: 'amount',
        message: `High declared value may require additional documentation`,
        code: 'VALUE_HIGH_WARNING'
      });
    }
    
    // Warning for very low values
    if (value.amount < config.minValue * 5) {
      warnings.push({
        field: 'amount',
        message: `Consider if this value accurately reflects your package contents`,
        code: 'VALUE_LOW_WARNING'
      });
    }
    
    return {
      isValid: errors.length === 0,
      data: errors.length === 0 ? value : null,
      errors,
      warnings
    };
  }
  
  validatePackageCompatibility(value: ValueMeasurement, packageType: string): ValidationResult<boolean> {
    console.log('ValueValidator: Validating package compatibility', { value, packageType });
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // High-value packages may need special handling
    const converter = new CurrencyConverter();
    const valueInUSD = converter.convert(value.amount, value.currency, 'USD');
    
    if (valueInUSD > 10000 && ['envelope', 'small'].includes(packageType)) {
      warnings.push({
        field: 'packageType',
        message: `High-value items may be better suited for larger package types with additional security`,
        code: 'HIGH_VALUE_SMALL_PACKAGE'
      });
    }
    
    if (valueInUSD > 50000) {
      warnings.push({
        field: 'value',
        message: `Very high-value shipments may require special handling and documentation`,
        code: 'VERY_HIGH_VALUE_WARNING'
      });
    }
    
    return {
      isValid: errors.length === 0,
      data: errors.length === 0,
      errors,
      warnings
    };
  }
}

export function DeclaredValueInput({
  value,
  currency = 'USD',
  onValueChange,
  onCurrencyChange,
  onChange,
  packageType = 'medium',
  showInsurance = true,
  showCurrencySelector = true,
  validationMode = 'strict',
  onValidationChange,
  className,
  label = 'Declared Value',
  error,
  disabled = false
}: DeclaredValueInputProps) {
  console.log('DeclaredValueInput: Rendering with value:', value, 'currency:', currency);
  const [inputValue, setInputValue] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Legacy state for backward compatibility
  const [insuranceCost, setInsuranceCost] = useState(0);
  const [insuranceLevel, setInsuranceLevel] = useState('basic');
  const [valueInUSD, setValueInUSD] = useState(0);
  const [isUnderInsured, setIsUnderInsured] = useState(false);
  const [isOverInsured, setIsOverInsured] = useState(false);
  
  const converter = useMemo(() => new CurrencyConverter(), []);
  const insuranceCalculator = useMemo(() => new InsuranceCalculator(), []);
  const validator = useMemo(() => new ValueValidator(), []);
  
  // Convert legacy number to ValueMeasurement for internal use
  const normalizedValue = useMemo((): ValueMeasurement | null => {
    if (value === null || value === undefined) return null;
    
    // Handle legacy number interface
    if (typeof value === 'number') {
      const insuranceCalc = insuranceCalculator.calculateInsurance(value, packageType || 'medium', currency);
      return {
        amount: value,
        currency: currency as CurrencyCode,
        insuranceRate: insuranceCalc.rate,
        insuranceFee: insuranceCalc.calculatedFee
      };
    }
    
    // Handle ValueMeasurement interface
    return value as ValueMeasurement;
  }, [value, currency, packageType, insuranceCalculator]);
  
  // Initialize input value from prop
  useEffect(() => {
    if (normalizedValue) {
      setInputValue(normalizedValue.amount.toString());
    } else if (typeof value === 'number' && value > 0) {
      setInputValue(value.toFixed(2));
    } else {
      setInputValue('');
    }
  }, [normalizedValue, value]);
  
  // Get current currency config
  const currencyConfig = useMemo(() => {
    return CURRENCY_CONFIGS[normalizedValue?.currency || currency] || CURRENCY_CONFIGS.USD;
  }, [normalizedValue, currency]);
  
  // Validate current value
  const validationResult = useMemo(() => {
    if (!normalizedValue || validationMode === 'disabled') {
      return { isValid: true, data: normalizedValue, errors: [], warnings: [] };
    }
    
    const valueValidation = validator.validateValue(normalizedValue);
    let packageValidation: ValidationResult<boolean> = { isValid: true, data: true, errors: [], warnings: [] };
    
    if (packageType) {
      packageValidation = validator.validatePackageCompatibility(normalizedValue, packageType);
    }
    
    return {
      isValid: valueValidation.isValid && packageValidation.isValid,
      data: valueValidation.isValid && packageValidation.isValid ? normalizedValue : null,
      errors: [...valueValidation.errors, ...packageValidation.errors],
      warnings: [...valueValidation.warnings, ...packageValidation.warnings]
    };
  }, [normalizedValue, packageType, validator, validationMode]);
  
  // Notify parent of validation changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(validationResult);
    }
  }, [validationResult, onValidationChange]);
  
  // Calculate enhanced insurance
  const insuranceCalculation = useMemo(() => {
    if (!normalizedValue || !packageType) return null;
    return insuranceCalculator.calculateInsurance(normalizedValue.amount, packageType, normalizedValue.currency);
  }, [normalizedValue, packageType, insuranceCalculator]);

  // Calculate current value and currency for display
  const currentValue = typeof value === 'number' ? value : normalizedValue?.amount || 0;
  const currentCurrency = currency || normalizedValue?.currency || 'USD';

  // Legacy calculate insurance cost and level for backward compatibility
  useEffect(() => {
    
    if (currentValue > 0) {
      // Convert to USD for insurance calculation using legacy rate
      const usdValue = currentValue / (currencyInfo[currentCurrency as keyof typeof currencyInfo]?.rate || 1);
      setValueInUSD(Math.round(usdValue * 100) / 100);

      // Determine insurance level and calculate cost
      let level = 'basic';
      let rate = insuranceRates.basic.rate;

      if (usdValue > insuranceRates.premium.min) {
        level = 'premium';
        rate = insuranceRates.premium.rate;
      } else if (usdValue > insuranceRates.standard.min) {
        level = 'standard';
        rate = insuranceRates.standard.rate;
      }

      setInsuranceLevel(level);
      setInsuranceCost(Math.ceil(usdValue * rate * 100) / 100);

      // Check for insurance recommendations
      // Under-insured: very low value for high-end items
      setIsUnderInsured(usdValue < 100 && usdValue > 0);
      
      // Over-insured: exceeding reasonable limits
      setIsOverInsured(usdValue > 50000);
    } else {
      setInsuranceCost(0);
      setInsuranceLevel('basic');
      setValueInUSD(0);
      setIsUnderInsured(false);
      setIsOverInsured(false);
    }
  }, [value, currency, normalizedValue]);
  
  // Enhanced handlers
  const handleValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const inputStr = e.target.value;
    setInputValue(inputStr);
    
    const numValue = parseFloat(inputStr);
    if (!isNaN(numValue) && numValue >= 0) {
      // For backward compatibility, call legacy handlers
      if (onValueChange) {
        onValueChange(numValue);
      }
      
      // For enhanced functionality
      if (onChange) {
        const insuranceCalc = insuranceCalculator.calculateInsurance(numValue, packageType || 'medium', currency);
        const newValue: ValueMeasurement = {
          amount: numValue,
          currency: currency as CurrencyCode,
          insuranceRate: insuranceCalc.rate,
          insuranceFee: insuranceCalc.calculatedFee
        };
        onChange(newValue);
      }
    }
  }, [currency, packageType, insuranceCalculator, onValueChange, onChange]);
  
  const handleCurrencyChange = useCallback((newCurrency: PackageInfo['currency']) => {
    if (onCurrencyChange) {
      onCurrencyChange(newCurrency);
    }
    
    if (normalizedValue && onChange) {
      // Convert value to new currency
      const convertedAmount = converter.convert(normalizedValue.amount, normalizedValue.currency, newCurrency);
      const insuranceCalc = insuranceCalculator.calculateInsurance(convertedAmount, packageType || 'medium', newCurrency);
      
      const newValue: ValueMeasurement = {
        amount: convertedAmount,
        currency: newCurrency as CurrencyCode,
        insuranceRate: insuranceCalc.rate,
        insuranceFee: insuranceCalc.calculatedFee
      };
      
      onChange(newValue);
    }
  }, [normalizedValue, converter, insuranceCalculator, packageType, onCurrencyChange, onChange]);

  // Legacy functions for backward compatibility
  const formatCurrency = (amount: number, currencyCode: PackageInfo['currency']) => {
    const info = currencyInfo[currencyCode];
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getInsuranceRecommendation = () => {
    if (isUnderInsured) {
      return 'Consider if declared value accurately reflects item worth';
    }
    if (isOverInsured) {
      return 'Very high value items may require special handling and documentation';
    }
    if (valueInUSD > 10000) {
      return 'High-value shipments receive enhanced tracking and security';
    }
    if (valueInUSD > 1000) {
      return 'Standard insurance coverage with signature confirmation';
    }
    return 'Basic insurance coverage included';
  };
  
  const hasErrors = validationResult.errors.length > 0;
  const hasWarnings = validationResult.warnings.length > 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Enhanced Label */}
      <label className="block text-sm font-medium text-gray-700">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          {label}
          {showInsurance && insuranceCalculation && (
            <span className="text-xs text-gray-500 ml-2">
              (Insurance: {converter.formatCurrency(insuranceCalculation.calculatedFee, 'USD')})
            </span>
          )}
        </div>
      </label>
      
      {/* Enhanced Input Group */}
      <div className="relative">
        <div className={cn(
          'flex rounded-md shadow-sm border transition-colors',
          hasErrors ? 'border-red-300 focus-within:border-red-500 focus-within:ring-red-500' :
          hasWarnings ? 'border-yellow-300 focus-within:border-yellow-500 focus-within:ring-yellow-500' :
          'border-gray-300 focus-within:border-blue-500 focus-within:ring-blue-500',
          isFocused && 'ring-1'
        )}>
          {/* Currency Symbol */}
          <div className="flex items-center pl-3 pr-1 bg-gray-50 border-r border-gray-300 text-gray-500 text-sm">
            {currencyConfig.symbol}
          </div>
          
          <input
            type="number"
            value={inputValue}
            onChange={handleValueChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            step={currencyConfig.step}
            min={currencyConfig.minValue}
            max={currencyConfig.maxValue}
            placeholder={`${currencyConfig.minValue}`}
            disabled={disabled}
            className="flex-1 px-3 py-2 text-gray-900 placeholder-gray-500 border-none focus:outline-none focus:ring-0 disabled:bg-gray-50 disabled:text-gray-500"
            data-testid="declared-value-input"
            id="package-declared-value"
          />
          
          {/* Enhanced Currency Selector */}
          {showCurrencySelector && (
            <div className="flex border-l border-gray-300">
              {Object.entries(currencyInfo).map(([code, info]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleCurrencyChange(code as PackageInfo['currency'])}
                  disabled={disabled}
                  className={cn(
                    'px-3 py-2 text-sm font-medium transition-colors border-r border-gray-300 last:border-r-0',
                    (normalizedValue?.currency || currency) === code
                      ? 'bg-blue-50 text-blue-700 border-blue-300'
                      : 'bg-white text-gray-700 hover:bg-gray-50',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  title={info.name}
                  data-testid={`currency-${code}`}
                >
                  {info.symbol}
                </button>
              ))}
            </div>
          )}
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
      
      {/* Currency Range Info */}
      <div className="text-xs text-gray-500">
        Range: {currencyConfig.symbol}{currencyConfig.minValue.toLocaleString()} - {currencyConfig.symbol}{currencyConfig.maxValue.toLocaleString()}
      </div>
      
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
      
      {/* Enhanced Insurance Information */}
      {showInsurance && insuranceCalculation && normalizedValue && (
        <div className="bg-blue-50 rounded-md p-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Insurance Coverage</span>
          </div>
          <div className="text-sm space-y-1 text-blue-700">
            <div className="flex justify-between">
              <span>Coverage:</span>
              <span className="font-medium">{insuranceCalculation.coverage}% of declared value</span>
            </div>
            <div className="flex justify-between">
              <span>Rate:</span>
              <span className="font-medium">{insuranceCalculation.rate}% + fees</span>
            </div>
            <div className="flex justify-between">
              <span>Insurance Fee:</span>
              <span className="font-medium">{converter.formatCurrency(insuranceCalculation.calculatedFee, 'USD')}</span>
            </div>
            <div className="text-xs text-blue-600 mt-2 pt-2 border-t border-blue-200">
              Fee range: {converter.formatCurrency(insuranceCalculation.minimumFee, 'USD')} - {converter.formatCurrency(insuranceCalculation.maximumFee, 'USD')}
            </div>
          </div>
        </div>
      )}

      {/* Currency conversion display */}
      {currentValue > 0 && currentCurrency !== 'USD' && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm">
            <div className="text-gray-600 font-medium mb-1">Currency Conversion</div>
            <div className="flex justify-between">
              <span>{formatCurrency(currentValue, currentCurrency)}</span>
              <span className="text-gray-500">≈ {formatCurrency(valueInUSD, 'USD')}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Exchange rate: 1 USD = {currencyInfo[currency].rate} {currency}
            </div>
          </div>
        </div>
      )}

      {/* Insurance calculation */}
      {currentValue > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Shield className="w-4 h-4 text-blue-600" />
            <h4 className="text-sm font-medium text-gray-900">Insurance Coverage</h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-600 font-medium">Coverage Level</div>
              <div className="text-blue-900 font-semibold capitalize">{insuranceLevel}</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium">Coverage Amount</div>
              <div className="text-blue-900 font-semibold">{formatCurrency(valueInUSD, 'USD')}</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium">Insurance Cost</div>
              <div className="text-blue-900 font-semibold">${insuranceCost}</div>
            </div>
            <div>
              <div className="text-gray-600 font-medium">Rate</div>
              <div className="text-blue-900 font-semibold">
                {(insuranceRates[insuranceLevel as keyof typeof insuranceRates].rate * 100).toFixed(2)}%
              </div>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-blue-800">
            {getInsuranceRecommendation()}
          </div>
        </div>
      )}

      {/* Value validation warnings */}
      {isUnderInsured && (
        <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <div className="font-medium">Low declared value</div>
            <div className="mt-1">
              Ensure the declared value accurately reflects the actual worth of your items for proper insurance coverage.
            </div>
          </div>
        </div>
      )}

      {isOverInsured && (
        <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <div className="font-medium">High-value shipment</div>
            <div className="mt-1">
              Items valued over $50,000 may require additional documentation, special handling, and extended transit times.
            </div>
          </div>
        </div>
      )}

      {/* Insurance tiers explanation */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-sm">
          <div className="font-medium text-gray-900 mb-2">Insurance Tiers</div>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Basic ($0 - $1,000):</span>
              <span>0.5% of value</span>
            </div>
            <div className="flex justify-between">
              <span>Standard ($1,001 - $10,000):</span>
              <span>0.8% of value</span>
            </div>
            <div className="flex justify-between">
              <span>Premium ($10,001+):</span>
              <span>1.2% of value</span>
            </div>
          </div>
        </div>
      </div>

      {/* Value range guidance */}
      <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
        <div className="font-medium mb-1">Declared Value Guidelines:</div>
        <div>• Minimum: $1.00 • Maximum: $100,000</div>
        <div>• Must reflect actual item value for insurance claims</div>
        <div>• Required for customs clearance on international shipments</div>
      </div>
    </div>
  );
}