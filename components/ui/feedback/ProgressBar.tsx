'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Progress as BaseProgress } from '@/components/ui/progress'

export interface ProgressBarProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  showPercentage?: boolean
  label?: string
  className?: string
  indicatorClassName?: string
  labelClassName?: string
  animated?: boolean
}

const SIZE_CLASSES = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
}

const VARIANT_CLASSES = {
  default: '[&>div]:bg-primary',
  success: '[&>div]:bg-green-500',
  warning: '[&>div]:bg-yellow-500', 
  error: '[&>div]:bg-destructive'
}

const ProgressBar = forwardRef<
  React.ElementRef<typeof BaseProgress>,
  ProgressBarProps
>(({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  showPercentage = false,
  label,
  className,
  indicatorClassName,
  labelClassName,
  animated = true,
  ...props
}, ref) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const sizeClass = SIZE_CLASSES[size]
  const variantClass = VARIANT_CLASSES[variant]

  return (
    <div className="progress-bar-container space-y-2">
      {(showLabel || showPercentage) && (
        <div className={cn(
          'progress-bar-header flex justify-between items-center text-sm',
          labelClassName
        )}>
          {showLabel && label && (
            <span className="progress-bar-label font-medium">
              {label}
            </span>
          )}
          
          {showPercentage && (
            <span className="progress-bar-percentage text-muted-foreground">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <BaseProgress
        ref={ref}
        value={percentage}
        className={cn(
          'progress-bar',
          sizeClass,
          variantClass,
          animated && 'transition-all duration-300 ease-out',
          className
        )}
        {...props}
      />
      
      {/* Optional value display */}
      {!showPercentage && (showLabel || label) && (
        <div className="progress-bar-footer text-xs text-muted-foreground">
          {value} / {max}
        </div>
      )}
    </div>
  )
})

ProgressBar.displayName = 'ProgressBar'

export { ProgressBar }
