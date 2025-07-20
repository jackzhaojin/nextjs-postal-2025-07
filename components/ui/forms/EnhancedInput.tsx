'use client'

import React, { forwardRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Input as BaseInput } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  error?: boolean
  containerClassName?: string
  iconClassName?: string
  showPasswordToggle?: boolean
  formatAs?: 'phone' | 'currency' | 'none'
  currency?: 'USD' | 'CAD' | 'MXN'
}

const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})/)
  if (!match) return value
  
  const [, area, exchange, number] = match
  if (number) return `(${area}) ${exchange}-${number}`
  if (exchange) return `(${area}) ${exchange}`
  if (area) return `(${area}`
  return ''
}

const formatCurrency = (value: string, currency: string = 'USD'): string => {
  const cleaned = value.replace(/[^\d.]/g, '')
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    parts[1] = parts.slice(1).join('')
  }
  if (parts[1] && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2)
  }
  
  const formatted = parts.join('.')
  const symbols = { USD: '$', CAD: 'C$', MXN: 'MX$' }
  return formatted ? `${symbols[currency as keyof typeof symbols] || '$'}${formatted}` : ''
}

const EnhancedInput = forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({
    className,
    containerClassName,
    iconClassName,
    leftIcon,
    rightIcon,
    loading = false,
    error = false,
    showPasswordToggle = false,
    formatAs = 'none',
    currency = 'USD',
    type,
    value,
    onChange,
    onBlur,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [internalValue, setInternalValue] = useState(value || '')
    
    const isPassword = type === 'password'
    const actualType = isPassword && showPassword ? 'text' : type

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value

      // Apply formatting
      if (formatAs === 'phone') {
        newValue = formatPhoneNumber(newValue)
        // Limit to standard US phone number length
        if (newValue.replace(/\D/g, '').length > 10) return
      } else if (formatAs === 'currency') {
        newValue = formatCurrency(newValue, currency)
      }

      setInternalValue(newValue)
      
      // Create a new event with formatted value
      const formattedEvent = {
        ...e,
        target: {
          ...e.target,
          value: newValue
        }
      }
      
      onChange?.(formattedEvent as React.ChangeEvent<HTMLInputElement>)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Additional formatting on blur if needed
      onBlur?.(e)
    }

    React.useEffect(() => {
      setInternalValue(value || '')
    }, [value])

    return (
      <div className={cn('enhanced-input-container relative', containerClassName)}>
        {leftIcon && (
          <div className={cn(
            'enhanced-input-left-icon absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none',
            iconClassName
          )}>
            {leftIcon}
          </div>
        )}
        
        <BaseInput
          ref={ref}
          type={actualType}
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'enhanced-input',
            leftIcon && 'pl-10',
            (rightIcon || loading || (isPassword && showPasswordToggle)) && 'pr-10',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          {...props}
        />

        {loading && (
          <div className={cn(
            'enhanced-input-loading absolute right-3 top-1/2 transform -translate-y-1/2',
            iconClassName
          )}>
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && isPassword && showPasswordToggle && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="enhanced-input-password-toggle absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">
              {showPassword ? 'Hide password' : 'Show password'}
            </span>
          </Button>
        )}

        {!loading && !isPassword && rightIcon && (
          <div className={cn(
            'enhanced-input-right-icon absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none',
            iconClassName
          )}>
            {rightIcon}
          </div>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = 'EnhancedInput'

export { EnhancedInput }
