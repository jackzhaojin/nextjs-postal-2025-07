'use client'

import React, { forwardRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Textarea as BaseTextarea } from '@/components/ui/textarea'

export interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  maxLength?: number
  showCharacterCount?: boolean
  autoResize?: boolean
  minRows?: number
  maxRows?: number
  error?: boolean
  loading?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  characterCountClassName?: string
}

const EnhancedTextarea = forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({
    className,
    maxLength,
    showCharacterCount = false,
    autoResize = false,
    minRows = 3,
    maxRows = 10,
    error = false,
    loading = false,
    resize = 'vertical',
    characterCountClassName,
    value,
    onChange,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(value || '')
    const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null)

    // Handle both controlled and uncontrolled scenarios
    const currentValue = value !== undefined ? value : internalValue
    const characterCount = String(currentValue).length

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize'
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value

      // Enforce max length
      if (maxLength && newValue.length > maxLength) {
        return
      }

      if (value === undefined) {
        setInternalValue(newValue)
      }
      
      onChange?.(e)
    }

    const handleRef = (node: HTMLTextAreaElement | null) => {
      setTextareaRef(node)
      if (typeof ref === 'function') {
        ref(node)
      } else if (ref) {
        ref.current = node
      }
    }

    // Auto-resize functionality
    useEffect(() => {
      if (autoResize && textareaRef) {
        const textarea = textareaRef
        
        // Reset height to get accurate scrollHeight
        textarea.style.height = 'auto'
        
        // Calculate new height
        const lineHeight = parseInt(getComputedStyle(textarea).lineHeight) || 20
        const minHeight = lineHeight * minRows
        const maxHeight = lineHeight * maxRows
        
        const newHeight = Math.min(
          Math.max(textarea.scrollHeight, minHeight),
          maxHeight
        )
        
        textarea.style.height = `${newHeight}px`
      }
    }, [currentValue, autoResize, minRows, maxRows, textareaRef])

    // Update internal value when prop changes
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value)
      }
    }, [value])

    return (
      <div className="enhanced-textarea-container space-y-2">
        <BaseTextarea
          ref={handleRef}
          value={currentValue}
          onChange={handleChange}
          className={cn(
            'enhanced-textarea',
            resizeClasses[resize],
            error && 'border-destructive focus-visible:ring-destructive',
            loading && 'opacity-50 cursor-not-allowed',
            autoResize && 'overflow-hidden',
            className
          )}
          disabled={loading}
          rows={autoResize ? minRows : undefined}
          style={{
            minHeight: autoResize ? `${minRows * 1.5}rem` : undefined,
            maxHeight: autoResize ? `${maxRows * 1.5}rem` : undefined,
          }}
          {...props}
        />
        
        {(showCharacterCount || maxLength) && (
          <div className={cn(
            'enhanced-textarea-footer flex justify-between items-center text-sm',
            characterCountClassName
          )}>
            <div></div> {/* Spacer for right alignment */}
            
            <div className={cn(
              'enhanced-textarea-count text-muted-foreground',
              maxLength && characterCount > maxLength * 0.9 && 'text-warning',
              maxLength && characterCount >= maxLength && 'text-destructive'
            )}>
              {showCharacterCount && (
                <span>
                  {characterCount}
                  {maxLength && ` / ${maxLength}`}
                </span>
              )}
              {!showCharacterCount && maxLength && (
                <span>{maxLength - characterCount} remaining</span>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }
)

EnhancedTextarea.displayName = 'EnhancedTextarea'

export { EnhancedTextarea }
