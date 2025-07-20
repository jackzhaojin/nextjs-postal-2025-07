"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  className?: string
}

interface ModalContentProps {
  className?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

interface ModalHeaderProps {
  children: React.ReactNode
  className?: string
}

interface ModalBodyProps {
  children: React.ReactNode
  className?: string
}

interface ModalFooterProps {
  children: React.ReactNode
  className?: string
}

interface ModalTitleProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

interface ModalDescriptionProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

// Main Modal wrapper
export function Modal({ 
  open, 
  onOpenChange, 
  children, 
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && (!closeOnOverlayClick && !closeOnEscape)) {
      return // Prevent closing if both methods are disabled
    }
    onOpenChange?.(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children}
    </Dialog>
  )
}

// Modal trigger
export function ModalTrigger({ children, ...props }: React.ComponentProps<typeof DialogTrigger>) {
  return <DialogTrigger {...props}>{children}</DialogTrigger>
}

// Enhanced modal content with size variants
export function ModalContent({ 
  className, 
  children, 
  size = 'md',
  ...props 
}: ModalContentProps & React.ComponentProps<typeof DialogContent>) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4 h-[90vh]'
  }

  return (
    <DialogContent 
      className={cn(
        "gap-0 p-0 overflow-hidden",
        sizeClasses[size],
        size === 'full' && "flex flex-col",
        className
      )}
      {...props}
    >
      {children}
    </DialogContent>
  )
}

// Modal header
export function ModalHeader({ 
  children, 
  className,
  ...props 
}: ModalHeaderProps) {
  return (
    <DialogHeader 
      className={cn(
        "px-6 py-4 border-b border-border shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </DialogHeader>
  )
}

// Modal title
export function ModalTitle({ 
  children, 
  className,
  asChild = false,
  ...props 
}: ModalTitleProps) {
  return (
    <DialogTitle 
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      asChild={asChild}
      {...props}
    >
      {children}
    </DialogTitle>
  )
}

// Modal description
export function ModalDescription({ 
  children, 
  className,
  asChild = false,
  ...props 
}: ModalDescriptionProps) {
  return (
    <DialogDescription 
      className={cn(
        "text-sm text-muted-foreground mt-2",
        className
      )}
      asChild={asChild}
      {...props}
    >
      {children}
    </DialogDescription>
  )
}

// Modal body/content area
export function ModalBody({ 
  children, 
  className,
  ...props 
}: ModalBodyProps) {
  return (
    <div 
      className={cn(
        "px-6 py-4 flex-1 overflow-y-auto",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Modal footer
export function ModalFooter({ 
  children, 
  className,
  ...props 
}: ModalFooterProps) {
  return (
    <div 
      className={cn(
        "px-6 py-4 border-t border-border shrink-0 flex items-center justify-end space-x-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Convenience close button
export function ModalCloseButton({ 
  className,
  ...props 
}: React.ComponentProps<typeof Button>) {
  return (
    <Button 
      variant="ghost" 
      size="sm"
      className={cn("h-6 w-6 p-0", className)}
      {...props}
    >
      <XIcon className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </Button>
  )
}

// Preset modal configurations
interface ConfirmModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
  variant?: 'default' | 'destructive'
  loading?: boolean
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false
}: ConfirmModalProps) {
  const handleConfirm = () => {
    onConfirm?.()
    onOpenChange?.(false)
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange?.(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && (
            <ModalDescription>{description}</ModalDescription>
          )}
        </ModalHeader>
        
        <ModalFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

// Alert modal for notifications
interface AlertModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  buttonText?: string
  variant?: 'default' | 'destructive' | 'warning'
}

export function AlertModal({
  open,
  onOpenChange,
  title,
  description,
  buttonText = "OK",
  variant = 'default'
}: AlertModalProps) {
  const handleClose = () => {
    onOpenChange?.(false)
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent size="sm">
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          {description && (
            <ModalDescription>{description}</ModalDescription>
          )}
        </ModalHeader>
        
        <ModalFooter>
          <Button 
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            onClick={handleClose}
          >
            {buttonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
