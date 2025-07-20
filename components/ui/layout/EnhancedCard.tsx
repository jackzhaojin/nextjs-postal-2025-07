'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { LoadingSpinner } from '../feedback/LoadingSpinner'

export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  error?: boolean
  disabled?: boolean
  children: React.ReactNode
}

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const VARIANT_CLASSES = {
  default: 'border bg-card text-card-foreground shadow-sm',
  elevated: 'border bg-card text-card-foreground shadow-lg',
  outlined: 'border-2 bg-card text-card-foreground shadow-none',
  flat: 'bg-card text-card-foreground shadow-none border-0'
}

const SIZE_CLASSES = {
  sm: 'rounded-md',
  md: 'rounded-lg', 
  lg: 'rounded-xl'
}

const PADDING_CLASSES = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
}

const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({
    variant = 'default',
    size = 'md',
    loading = false,
    error = false,
    disabled = false,
    className,
    children,
    ...props
  }, ref) => {
    const variantClass = VARIANT_CLASSES[variant]
    const sizeClass = SIZE_CLASSES[size]

    return (
      <div
        ref={ref}
        className={cn(
          'enhanced-card relative',
          variantClass,
          sizeClass,
          error && 'border-destructive',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        {...props}
      >
        {loading && (
          <div className="enhanced-card-loading absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-inherit">
            <LoadingSpinner size="lg" showLabel label="Loading..." />
          </div>
        )}
        
        {children}
      </div>
    )
  }
)

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('enhanced-card-header flex flex-col space-y-1.5 p-6', className)}
      {...props}
    >
      {children}
    </div>
  )
)

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('enhanced-card-content p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
)

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('enhanced-card-footer flex items-center p-6 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
)

const CardTitle = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('enhanced-card-title text-2xl font-semibold leading-none tracking-tight', className)}
      {...props}
    >
      {children}
    </h3>
  )
)

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('enhanced-card-description text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </p>
  )
)

EnhancedCard.displayName = 'EnhancedCard'
CardHeader.displayName = 'CardHeader'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'
CardTitle.displayName = 'CardTitle'
CardDescription.displayName = 'CardDescription'

export { 
  EnhancedCard,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription
}
