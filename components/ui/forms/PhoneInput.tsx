'use client'

import React, { forwardRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { EnhancedInput } from './EnhancedInput'
import { Phone } from 'lucide-react'

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  value?: string
  onChange?: (value: string, formatted: string) => void
  country?: 'US' | 'CA' | 'MX'
  showCountryCode?: boolean
  error?: boolean
  loading?: boolean
  containerClassName?: string
}

const COUNTRY_CODES = {
  US: '+1',
  CA: '+1', 
  MX: '+52'
}

const PHONE_PATTERNS = {
  US: /^(\d{0,3})(\d{0,3})(\d{0,4})$/,
  CA: /^(\d{0,3})(\d{0,3})(\d{0,4})$/,
  MX: /^(\d{0,2})(\d{0,4})(\d{0,4})$/
}

const formatPhoneNumber = (value: string, country: 'US' | 'CA' | 'MX' = 'US'): string => {
  // Remove all non-digits
  const cleaned = value.replace(/\D/g, '')
  
  // Apply country-specific formatting
  if (country === 'MX') {
    const match = cleaned.match(PHONE_PATTERNS.MX)
    if (!match) return cleaned
    
    const [, area, mid, last] = match
    if (last) return `${area} ${mid} ${last}`
    if (mid) return `${area} ${mid}`
    return area
  } else {
    // US/CA formatting
    const match = cleaned.match(PHONE_PATTERNS.US)
    if (!match) return cleaned
    
    const [, area, mid, last] = match
    if (last) return `(${area}) ${mid}-${last}`
    if (mid) return `(${area}) ${mid}`
    if (area) return `(${area}`
    return ''
  }
}

const getMaxLength = (country: 'US' | 'CA' | 'MX'): number => {
  return country === 'MX' ? 10 : 10 // Digits only
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({
    value = '',
    onChange,
    country = 'US',
    showCountryCode = true,
    error = false,
    loading = false,
    className,
    containerClassName,
    placeholder,
    ...props
  }, ref) => {
    const [formattedValue, setFormattedValue] = useState('')
    const [rawValue, setRawValue] = useState('')

    const maxLength = getMaxLength(country)
    const countryCode = COUNTRY_CODES[country]
    
    const placeholders = {
      US: '(555) 123-4567',
      CA: '(555) 123-4567', 
      MX: '55 1234 5678'
    }

    useEffect(() => {
      // Initialize from prop value
      if (value) {
        const cleaned = value.replace(/\D/g, '')
        const formatted = formatPhoneNumber(cleaned, country)
        setRawValue(cleaned)
        setFormattedValue(formatted)
      } else {
        setRawValue('')
        setFormattedValue('')
      }
    }, [value, country])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value
      const cleaned = inputValue.replace(/\D/g, '')
      
      // Enforce max length
      if (cleaned.length > maxLength) {
        return
      }
      
      const formatted = formatPhoneNumber(cleaned, country)
      
      setRawValue(cleaned)
      setFormattedValue(formatted)
      
      // Call onChange with both raw and formatted values
      onChange?.(cleaned, formatted)
    }

    const isComplete = rawValue.length === maxLength

    return (
      <div className={cn('phone-input-container', containerClassName)}>
        {showCountryCode && (
          <div className="phone-input-country-code mb-2 text-sm text-muted-foreground">
            Country Code: {countryCode}
          </div>
        )}
        
        <EnhancedInput
          ref={ref}
          type="tel"
          value={formattedValue}
          onChange={handleChange}
          placeholder={placeholder || placeholders[country]}
          leftIcon={<Phone className="h-4 w-4" />}
          error={error}
          loading={loading}
          className={cn(
            'phone-input',
            isComplete && 'border-green-500 focus-visible:ring-green-500',
            className
          )}
          inputMode="tel"
          autoComplete="tel"
          {...props}
        />
        
        <div className="phone-input-footer mt-1 flex justify-between items-center text-xs text-muted-foreground">
          <span>
            {country === 'MX' ? 'Mexican format' : 'US/Canadian format'}
          </span>
          <span>
            {rawValue.length}/{maxLength} digits
          </span>
        </div>
      </div>
    )
  }
)

PhoneInput.displayName = 'PhoneInput'

export { PhoneInput }
