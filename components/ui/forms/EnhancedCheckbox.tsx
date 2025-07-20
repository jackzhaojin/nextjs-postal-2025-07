'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Checkbox as BaseCheckbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

export interface EnhancedCheckboxProps {
  id?: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  label?: string
  description?: string
  error?: string
  required?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  labelClassName?: string
  containerClassName?: string
}

const EnhancedCheckbox = forwardRef<
  React.ElementRef<typeof BaseCheckbox>,
  EnhancedCheckboxProps
>(({
  id,
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  error,
  required = false,
  size = 'md',
  className,
  labelClassName,
  containerClassName,
  ...props
}, ref) => {
  const checkboxId = id || React.useId()
  
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

  return (
    <div className={cn('enhanced-checkbox-container space-y-2', containerClassName)}>
      <div className="enhanced-checkbox-wrapper flex items-start space-x-3">
        <BaseCheckbox
          ref={ref}
          id={checkboxId}
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-describedby={description ? `${checkboxId}-description` : undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-required={required ? 'true' : undefined}
          className={cn(
            'enhanced-checkbox mt-0.5',
            sizeClasses[size],
            error && 'border-destructive data-[state=checked]:bg-destructive',
            className
          )}
          {...props}
        />
        
        {label && (
          <div className="enhanced-checkbox-content flex-1 space-y-1">
            <Label
              htmlFor={checkboxId}
              className={cn(
                'enhanced-checkbox-label leading-none cursor-pointer',
                labelSizeClasses[size],
                disabled && 'cursor-not-allowed opacity-70',
                required && "after:content-['*'] after:ml-1 after:text-destructive",
                labelClassName
              )}
            >
              {label}
            </Label>
            
            {description && (
              <p
                id={`${checkboxId}-description`}
                className="enhanced-checkbox-description text-sm text-muted-foreground"
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p
          className="enhanced-checkbox-error text-sm font-medium text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  )
})

EnhancedCheckbox.displayName = 'EnhancedCheckbox'

export { EnhancedCheckbox }
