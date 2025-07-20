'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
  children: React.ReactNode
  htmlFor?: string
  labelClassName?: string
  errorClassName?: string
  descriptionClassName?: string
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({
    label,
    description,
    error,
    required = false,
    children,
    htmlFor,
    className,
    labelClassName,
    errorClassName,
    descriptionClassName,
    ...props
  }, ref) => {
    // Safely extract field ID from children
    const getFieldId = () => {
      if (htmlFor) return htmlFor
      try {
        const child = React.Children.only(children) as React.ReactElement
        return (child?.props as any)?.id
      } catch {
        return undefined
      }
    }
    
    const fieldId = getFieldId()

    return (
      <div
        ref={ref}
        className={cn('form-field space-y-2', className)}
        {...props}
      >
        {label && (
          <Label
            htmlFor={fieldId}
            className={cn(
              'form-field-label text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              required && "after:content-['*'] after:ml-1 after:text-destructive",
              labelClassName
            )}
          >
            {label}
          </Label>
        )}
        
        {description && (
          <p
            className={cn(
              'form-field-description text-sm text-muted-foreground',
              descriptionClassName
            )}
            id={fieldId ? `${fieldId}-description` : undefined}
          >
            {description}
          </p>
        )}

        <div className="form-field-control">
          {React.cloneElement(children as React.ReactElement, {
            ...(fieldId && description && { 'aria-describedby': `${fieldId}-description` }),
            ...(fieldId && error && { 'aria-describedby': `${fieldId}-error` }),
            ...(error && { 'aria-invalid': 'true' }),
            ...(required && { 'aria-required': 'true' }),
          } as any)}
        </div>

        {error && (
          <p
            className={cn(
              'form-field-error text-sm font-medium text-destructive',
              errorClassName
            )}
            id={fieldId ? `${fieldId}-error` : undefined}
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

FormField.displayName = 'FormField'

export { FormField }
