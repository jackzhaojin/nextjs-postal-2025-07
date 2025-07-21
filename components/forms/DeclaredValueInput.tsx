'use client';

import { useState, useEffect } from 'react';
import { PackageInfo } from '@/lib/types';
import { DollarSign, Shield, AlertTriangle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeclaredValueInputProps {
  value: number;
  currency: PackageInfo['currency'];
  onValueChange: (value: number) => void;
  onCurrencyChange: (currency: PackageInfo['currency']) => void;
  className?: string;
  error?: string;
}

const currencyInfo = {
  USD: { symbol: '$', name: 'US Dollar', rate: 1.0 },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', rate: 1.35 },
  MXN: { symbol: 'M$', name: 'Mexican Peso', rate: 18.5 }
};

const insuranceRates = {
  basic: { min: 0, max: 1000, rate: 0.005 },
  standard: { min: 1001, max: 10000, rate: 0.008 },
  premium: { min: 10001, max: 100000, rate: 0.012 }
};

export function DeclaredValueInput({
  value,
  currency,
  onValueChange,
  onCurrencyChange,
  className,
  error
}: DeclaredValueInputProps) {
  const [insuranceCost, setInsuranceCost] = useState(0);
  const [insuranceLevel, setInsuranceLevel] = useState('basic');
  const [valueInUSD, setValueInUSD] = useState(0);
  const [isUnderInsured, setIsUnderInsured] = useState(false);
  const [isOverInsured, setIsOverInsured] = useState(false);

  // Calculate insurance cost and level
  useEffect(() => {
    if (value > 0) {
      // Convert to USD for insurance calculation
      const usdValue = value / currencyInfo[currency].rate;
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
  }, [value, currency]);

  const handleValueChange = (inputValue: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = inputValue.replace(/[^0-9.]/g, '');
    const numValue = parseFloat(cleanValue) || 0;
    
    // Enforce maximum limit
    const maxValue = 100000;
    const finalValue = Math.min(numValue, maxValue);
    
    onValueChange(finalValue);
  };

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

  return (
    <div className={cn('space-y-4', className)}>
      {/* Currency and value input */}
      <div className="space-y-2">
        <label htmlFor="declaredValue" className="block text-sm font-medium text-gray-700">
          Declared Value
        </label>
        
        <div className="flex space-x-2">
          {/* Currency selector */}
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            {Object.entries(currencyInfo).map(([code, info]) => (
              <button
                key={code}
                type="button"
                onClick={() => onCurrencyChange(code as PackageInfo['currency'])}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors border-r border-gray-300 last:border-r-0',
                  currency === code
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                )}
                title={info.name}
              >
                {info.symbol}
              </button>
            ))}
          </div>
          
          {/* Value input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                id="declaredValue"
                value={value > 0 ? value.toFixed(2) : ''}
                onChange={(e) => handleValueChange(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500',
                  error ? 'border-red-300' : 'border-gray-300'
                )}
                placeholder="0.00"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm">{error}</p>
        )}
      </div>

      {/* Currency conversion display */}
      {value > 0 && currency !== 'USD' && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm">
            <div className="text-gray-600 font-medium mb-1">Currency Conversion</div>
            <div className="flex justify-between">
              <span>{formatCurrency(value, currency)}</span>
              <span className="text-gray-500">≈ {formatCurrency(valueInUSD, 'USD')}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Exchange rate: 1 USD = {currencyInfo[currency].rate} {currency}
            </div>
          </div>
        </div>
      )}

      {/* Insurance calculation */}
      {value > 0 && (
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