'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary' | 'muted'
  className?: string
  label?: string
  showLabel?: boolean
}

const SIZE_CLASSES = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4', 
  lg: 'h-6 w-6',
  xl: 'h-8 w-8'
}

const VARIANT_CLASSES = {
  default: 'text-foreground',
  primary: 'text-primary',
  secondary: 'text-secondary-foreground',
  muted: 'text-muted-foreground'
}

const LoadingSpinner = forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({
    size = 'md',
    variant = 'default',
    className,
    label = 'Loading...',
    showLabel = false,
    ...props
  }, ref) => {
    const sizeClass = SIZE_CLASSES[size]
    const variantClass = VARIANT_CLASSES[variant]

    return (
      <div
        ref={ref}
        className={cn(
          'loading-spinner flex items-center justify-center',
          showLabel && 'gap-2',
          className
        )}
        role="status"
        aria-live="polite"
        aria-label={label}
        {...props}
      >
        <Loader2 
          className={cn(
            'loading-spinner-icon animate-spin',
            sizeClass,
            variantClass
          )}
        />
        
        {showLabel && (
          <span className={cn(
            'loading-spinner-label text-sm',
            variantClass
          )}>
            {label}
          </span>
        )}
        
        <span className="sr-only">{label}</span>
      </div>
    )
  }
)

LoadingSpinner.displayName = 'LoadingSpinner'

export { LoadingSpinner }
