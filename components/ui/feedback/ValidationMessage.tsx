'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react'

export interface ValidationMessageProps {
  message?: string
  type?: 'error' | 'warning' | 'success' | 'info'
  show?: boolean
  className?: string
  iconClassName?: string
  animated?: boolean
}

const TYPE_CONFIG = {
  error: {
    icon: AlertCircle,
    className: 'text-destructive',
    role: 'alert' as const
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-yellow-600 dark:text-yellow-400',
    role: 'status' as const
  },
  success: {
    icon: CheckCircle,
    className: 'text-green-600 dark:text-green-400',
    role: 'status' as const
  },
  info: {
    icon: Info,
    className: 'text-blue-600 dark:text-blue-400',
    role: 'status' as const
  }
}

const ValidationMessage = forwardRef<HTMLDivElement, ValidationMessageProps>(
  ({
    message,
    type = 'error',
    show = true,
    className,
    iconClassName,
    animated = true,
    ...props
  }, ref) => {
    const config = TYPE_CONFIG[type]
    const IconComponent = config.icon

    if (!show || !message) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          'validation-message flex items-start gap-2 text-sm font-medium',
          config.className,
          animated && 'animate-in slide-in-from-top-1 duration-200',
          className
        )}
        role={config.role}
        aria-live="polite"
        {...props}
      >
        <IconComponent 
          className={cn(
            'validation-message-icon h-4 w-4 shrink-0 mt-0.5',
            iconClassName
          )}
        />
        
        <span className="validation-message-text">
          {message}
        </span>
      </div>
    )
  }
)

ValidationMessage.displayName = 'ValidationMessage'

export { ValidationMessage }
