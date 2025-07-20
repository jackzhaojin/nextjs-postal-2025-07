"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { XIcon, CheckCircleIcon, AlertCircleIcon, InfoIcon, AlertTriangleIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: React.ReactNode
  maxToasts?: number
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    
    setToasts(current => {
      const updated = [...current, newToast]
      // Keep only the latest maxToasts
      return updated.slice(-maxToasts)
    })

    // Auto-remove toast after duration
    const duration = toast.duration ?? 5000
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [maxToasts])

  const removeToast = React.useCallback((id: string) => {
    setToasts(current => current.filter(toast => toast.id !== id))
  }, [])

  const clearToasts = React.useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

function ToastViewport() {
  const { toasts } = useToast()

  return (
    <ToastPrimitives.Provider swipeDirection="right">
      <ToastPrimitives.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </ToastPrimitives.Provider>
  )
}

interface ToastItemProps {
  toast: Toast
}

function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast()

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'error':
        return <AlertCircleIcon className="h-4 w-4" />
      case 'warning':
        return <AlertTriangleIcon className="h-4 w-4" />
      case 'info':
      default:
        return <InfoIcon className="h-4 w-4" />
    }
  }

  const getToastClasses = () => {
    const baseClasses = "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full"
    
    switch (toast.type) {
      case 'success':
        return cn(baseClasses, "border-green-200 bg-green-50 text-green-900")
      case 'error':
        return cn(baseClasses, "border-red-200 bg-red-50 text-red-900")
      case 'warning':
        return cn(baseClasses, "border-yellow-200 bg-yellow-50 text-yellow-900")
      case 'info':
      default:
        return cn(baseClasses, "border-blue-200 bg-blue-50 text-blue-900")
    }
  }

  return (
    <ToastPrimitives.Root
      className={getToastClasses()}
      onOpenChange={(open: boolean) => {
        if (!open) {
          removeToast(toast.id)
        }
      }}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {toast.title && (
            <ToastPrimitives.Title className="text-sm font-semibold">
              {toast.title}
            </ToastPrimitives.Title>
          )}
          {toast.description && (
            <ToastPrimitives.Description className="text-sm opacity-90 mt-1">
              {toast.description}
            </ToastPrimitives.Description>
          )}
        </div>
      </div>

      {toast.action && (
        <ToastPrimitives.Action
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          altText={toast.action.label}
          onClick={toast.action.onClick}
        >
          {toast.action.label}
        </ToastPrimitives.Action>
      )}

      <ToastPrimitives.Close
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        onClick={() => removeToast(toast.id)}
        aria-label="Close"
      >
        <XIcon className="h-4 w-4" />
      </ToastPrimitives.Close>
    </ToastPrimitives.Root>
  )
}

// Convenience function for quick toast creation
export const toast = {
  success: (title: string, description?: string) => {
    // This will be set by the provider
    return { title, description, type: 'success' as const }
  },
  error: (title: string, description?: string) => {
    return { title, description, type: 'error' as const }
  },
  warning: (title: string, description?: string) => {
    return { title, description, type: 'warning' as const }
  },
  info: (title: string, description?: string) => {
    return { title, description, type: 'info' as const }
  },
}
