'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { RadioGroup as BaseRadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface EnhancedRadioGroupProps {
  options: RadioOption[]
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  required?: boolean
  orientation?: 'horizontal' | 'vertical'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  itemClassName?: string
  labelClassName?: string
  error?: string
  name?: string
}

const EnhancedRadioGroup = forwardRef<
  React.ElementRef<typeof BaseRadioGroup>,
  EnhancedRadioGroupProps
>(({
  options = [],
  value,
  onValueChange,
  disabled = false,
  required = false,
  orientation = 'vertical',
  size = 'md',
  className,
  itemClassName,
  labelClassName,
  error,
  name,
  ...props
}, ref) => {
  const groupId = React.useId()
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-5 w-5'
  }

  const labelSizeClasses = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  }

  const orientationClasses = {
    horizontal: 'flex flex-row flex-wrap gap-6',
    vertical: 'flex flex-col space-y-3'
  }

  return (
    <div className="enhanced-radio-group-container space-y-3">
      <BaseRadioGroup
        ref={ref}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
        name={name}
        aria-invalid={error ? 'true' : undefined}
        className={cn(
          'enhanced-radio-group',
          orientationClasses[orientation],
          className
        )}
        {...props}
      >
        {options.map((option, index) => {
          const itemId = `${groupId}-${option.value}`
          
          return (
            <div
              key={option.value}
              className={cn(
                'enhanced-radio-item flex items-start space-x-3',
                itemClassName
              )}
            >
              <RadioGroupItem
                value={option.value}
                id={itemId}
                disabled={disabled || option.disabled}
                aria-describedby={option.description ? `${itemId}-description` : undefined}
                className={cn(
                  'enhanced-radio-input mt-0.5',
                  sizeClasses[size],
                  error && 'border-destructive text-destructive'
                )}
              />
              
              <div className="enhanced-radio-content flex-1 space-y-1">
                <Label
                  htmlFor={itemId}
                  className={cn(
                    'enhanced-radio-label leading-none cursor-pointer',
                    labelSizeClasses[size],
                    (disabled || option.disabled) && 'cursor-not-allowed opacity-70',
                    labelClassName
                  )}
                >
                  {option.label}
                </Label>
                
                {option.description && (
                  <p
                    id={`${itemId}-description`}
                    className="enhanced-radio-description text-sm text-muted-foreground"
                  >
                    {option.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </BaseRadioGroup>
      
      {error && (
        <p
          className="enhanced-radio-error text-sm font-medium text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  )
})

EnhancedRadioGroup.displayName = 'EnhancedRadioGroup'

export { EnhancedRadioGroup }
