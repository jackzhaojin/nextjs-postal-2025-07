'use client'

import React, { forwardRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { EnhancedInput } from './EnhancedInput'
import { DollarSign } from 'lucide-react'
import { EnhancedSelect } from './EnhancedSelect'

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: number | string
  onChange?: (value: number | null, formatted: string) => void
  currency?: 'USD' | 'CAD' | 'MXN'
  onCurrencyChange?: (currency: 'USD' | 'CAD' | 'MXN') => void
  allowCurrencyChange?: boolean
  maxValue?: number
  minValue?: number
  decimalPlaces?: number
  showCurrencySymbol?: boolean
  error?: boolean
  loading?: boolean
  containerClassName?: string
}

const CURRENCY_CONFIG = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar', code: 'CAD' },
  MXN: { symbol: 'MX$', name: 'Mexican Peso', code: 'MXN' }
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar', description: 'United States Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', description: 'Canadian Dollar' },
  { value: 'MXN', label: 'MXN - Mexican Peso', description: 'Mexican Peso' }
]

const formatCurrency = (
  value: number,
  currency: 'USD' | 'CAD' | 'MXN',
  decimalPlaces: number = 2
): string => {
  const config = CURRENCY_CONFIG[currency]
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  }).format(value).replace(/^[A-Z$]+/, config.symbol)
}

const parseCurrencyInput = (input: string): number | null => {
  // Remove currency symbols and formatting
  const cleaned = input.replace(/[^\d.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? null : parsed
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({
    value,
    onChange,
    currency = 'USD',
    onCurrencyChange,
    allowCurrencyChange = false,
    maxValue,
    minValue = 0,
    decimalPlaces = 2,
    showCurrencySymbol = true,
    error = false,
    loading = false,
    className,
    containerClassName,
    placeholder,
    ...props
  }, ref) => {
    const [displayValue, setDisplayValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)

    const currencyConfig = CURRENCY_CONFIG[currency]

    useEffect(() => {
      if (value !== undefined && value !== null && value !== '') {
        const numValue = typeof value === 'string' ? parseCurrencyInput(value) : value
        if (numValue !== null) {
          if (isFocused) {
            // Show plain number when focused
            setDisplayValue(numValue.toFixed(decimalPlaces))
          } else {
            // Show formatted currency when not focused
            setDisplayValue(formatCurrency(numValue, currency, decimalPlaces))
          }
        } else {
          setDisplayValue('')
        }
      } else {
        setDisplayValue('')
      }
    }, [value, currency, decimalPlaces, isFocused])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const parsedValue = parseCurrencyInput(inputValue)

      // Enforce min/max values
      if (parsedValue !== null) {
        if (minValue !== undefined && parsedValue < minValue) return
        if (maxValue !== undefined && parsedValue > maxValue) return
      }

      setDisplayValue(inputValue)
      
      // Format for callback
      const formatted = parsedValue !== null 
        ? formatCurrency(parsedValue, currency, decimalPlaces)
        : ''
      
      onChange?.(parsedValue, formatted)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      
      // Convert to plain number format for editing
      if (value !== undefined && value !== null && value !== '') {
        const numValue = typeof value === 'string' ? parseCurrencyInput(value) : value
        if (numValue !== null) {
          setDisplayValue(numValue.toString())
        }
      }
      
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      
      // Convert back to formatted currency
      const parsedValue = parseCurrencyInput(e.target.value)
      if (parsedValue !== null) {
        setDisplayValue(formatCurrency(parsedValue, currency, decimalPlaces))
      }
      
      props.onBlur?.(e)
    }

    const getPlaceholder = () => {
      if (placeholder) return placeholder
      return formatCurrency(0, currency, decimalPlaces)
    }

    return (
      <div className={cn('currency-input-container space-y-2', containerClassName)}>
        {allowCurrencyChange && (
          <div className="currency-input-selector">
            <EnhancedSelect
              options={CURRENCY_OPTIONS}
              value={currency}
              onValueChange={(value) => onCurrencyChange?.(value as 'USD' | 'CAD' | 'MXN')}
              placeholder="Select currency..."
              searchable={false}
              className="w-full"
            />
          </div>
        )}
        
        <div className="currency-input-wrapper relative">
          <EnhancedInput
            ref={ref}
            type="text"
            value={displayValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={getPlaceholder()}
            leftIcon={showCurrencySymbol ? <DollarSign className="h-4 w-4" /> : undefined}
            error={error}
            loading={loading}
            className={cn('currency-input', className)}
            inputMode="decimal"
            {...props}
          />
          
          {!allowCurrencyChange && (
            <div className="currency-input-code absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              {currencyConfig.code}
            </div>
          )}
        </div>
        
        <div className="currency-input-footer flex justify-between items-center text-xs text-muted-foreground">
          <span>{currencyConfig.name}</span>
          {(minValue !== undefined || maxValue !== undefined) && (
            <span>
              Range: {minValue !== undefined && formatCurrency(minValue, currency, decimalPlaces)}
              {minValue !== undefined && maxValue !== undefined && ' - '}
              {maxValue !== undefined && formatCurrency(maxValue, currency, decimalPlaces)}
            </span>
          )}
        </div>
      </div>
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
