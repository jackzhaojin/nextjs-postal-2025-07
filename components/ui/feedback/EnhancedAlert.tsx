'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { Alert as BaseAlert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X 
} from 'lucide-react'

export interface EnhancedAlertProps {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info'
  title?: string
  children: React.ReactNode
  dismissible?: boolean
  onDismiss?: () => void
  icon?: React.ReactNode
  showIcon?: boolean
  className?: string
  titleClassName?: string
  descriptionClassName?: string
}

const VARIANT_ICONS = {
  default: Info,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info
}

const VARIANT_CLASSES = {
  default: 'border-border text-foreground',
  destructive: 'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
  success: 'border-green-500/50 text-green-700 dark:border-green-500 dark:text-green-400 [&>svg]:text-green-600',
  warning: 'border-yellow-500/50 text-yellow-700 dark:border-yellow-500 dark:text-yellow-400 [&>svg]:text-yellow-600',
  info: 'border-blue-500/50 text-blue-700 dark:border-blue-500 dark:text-blue-400 [&>svg]:text-blue-600'
}

const EnhancedAlert = forwardRef<HTMLDivElement, EnhancedAlertProps>(
  ({
    variant = 'default',
    title,
    children,
    dismissible = false,
    onDismiss,
    icon,
    showIcon = true,
    className,
    titleClassName,
    descriptionClassName,
    ...props
  }, ref) => {
    const IconComponent = VARIANT_ICONS[variant]
    const variantClasses = VARIANT_CLASSES[variant]

    return (
      <BaseAlert
        ref={ref}
        className={cn(
          'enhanced-alert relative',
          variantClasses,
          dismissible && 'pr-12',
          className
        )}
        {...props}
      >
        {showIcon && (
          <div className="enhanced-alert-icon">
            {icon || <IconComponent className="h-4 w-4" />}
          </div>
        )}
        
        <div className="enhanced-alert-content flex-1">
          {title && (
            <AlertTitle className={cn('enhanced-alert-title', titleClassName)}>
              {title}
            </AlertTitle>
          )}
          
          <AlertDescription className={cn('enhanced-alert-description', descriptionClassName)}>
            {children}
          </AlertDescription>
        </div>

        {dismissible && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="enhanced-alert-dismiss absolute right-2 top-2 h-6 w-6 p-0 hover:bg-transparent"
            onClick={onDismiss}
            aria-label="Dismiss alert"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </BaseAlert>
    )
  }
)

EnhancedAlert.displayName = 'EnhancedAlert'

export { EnhancedAlert }
