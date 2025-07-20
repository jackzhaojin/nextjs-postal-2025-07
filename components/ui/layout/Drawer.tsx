"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  direction?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

interface DrawerContentProps {
  className?: string
  children: React.ReactNode
  direction?: 'left' | 'right' | 'top' | 'bottom'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showOverlay?: boolean
}

interface DrawerHeaderProps {
  children: React.ReactNode
  className?: string
}

interface DrawerBodyProps {
  children: React.ReactNode
  className?: string
}

interface DrawerFooterProps {
  children: React.ReactNode
  className?: string
}

interface DrawerTitleProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

interface DrawerDescriptionProps {
  children: React.ReactNode
  className?: string
  asChild?: boolean
}

// Main Drawer wrapper
export function Drawer({ 
  open, 
  onOpenChange, 
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: DrawerProps) {
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && (!closeOnOverlayClick && !closeOnEscape)) {
      return // Prevent closing if both methods are disabled
    }
    onOpenChange?.(newOpen)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      {children}
    </Sheet>
  )
}

// Drawer trigger
export function DrawerTrigger({ children, ...props }: React.ComponentProps<typeof SheetTrigger>) {
  return <SheetTrigger {...props}>{children}</SheetTrigger>
}

// Enhanced drawer content with direction and size variants
export function DrawerContent({ 
  className, 
  children, 
  direction = 'right',
  size = 'md',
  showOverlay = true,
  ...props 
}: DrawerContentProps & Omit<React.ComponentProps<typeof SheetContent>, 'side'>) {
  
  // Map direction to sheet side
  const sideMapping = {
    left: 'left' as const,
    right: 'right' as const,
    top: 'top' as const,
    bottom: 'bottom' as const,
  }

  // Size classes based on direction
  const getSizeClasses = () => {
    if (direction === 'left' || direction === 'right') {
      return {
        sm: 'w-80',
        md: 'w-96',
        lg: 'w-[32rem]',
        xl: 'w-[40rem]',
        full: 'w-full'
      }[size]
    } else {
      return {
        sm: 'h-80',
        md: 'h-96',
        lg: 'h-[32rem]',
        xl: 'h-[40rem]',
        full: 'h-full'
      }[size]
    }
  }

  return (
    <SheetContent 
      side={sideMapping[direction]}
      className={cn(
        "flex flex-col gap-0 p-0 overflow-hidden",
        getSizeClasses(),
        !showOverlay && "shadow-2xl border-l",
        className
      )}
      {...props}
    >
      {children}
    </SheetContent>
  )
}

// Drawer header
export function DrawerHeader({ 
  children, 
  className,
  ...props 
}: DrawerHeaderProps) {
  return (
    <SheetHeader 
      className={cn(
        "px-6 py-4 border-b border-border shrink-0",
        className
      )}
      {...props}
    >
      {children}
    </SheetHeader>
  )
}

// Drawer title
export function DrawerTitle({ 
  children, 
  className,
  asChild = false,
  ...props 
}: DrawerTitleProps) {
  return (
    <SheetTitle 
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      asChild={asChild}
      {...props}
    >
      {children}
    </SheetTitle>
  )
}

// Drawer description
export function DrawerDescription({ 
  children, 
  className,
  asChild = false,
  ...props 
}: DrawerDescriptionProps) {
  return (
    <SheetDescription 
      className={cn(
        "text-sm text-muted-foreground mt-2",
        className
      )}
      asChild={asChild}
      {...props}
    >
      {children}
    </SheetDescription>
  )
}

// Drawer body/content area
export function DrawerBody({ 
  children, 
  className,
  ...props 
}: DrawerBodyProps) {
  return (
    <div 
      className={cn(
        "px-6 py-4 flex-1 overflow-y-auto min-h-0",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Drawer footer
export function DrawerFooter({ 
  children, 
  className,
  ...props 
}: DrawerFooterProps) {
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
export function DrawerCloseButton({ 
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

// Mobile-optimized drawer for mobile menus
interface MobileDrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger: React.ReactNode
  children: React.ReactNode
  title?: string
  description?: string
}

export function MobileDrawer({
  open,
  onOpenChange,
  trigger,
  children,
  title,
  description
}: MobileDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
        {trigger}
      </DrawerTrigger>
      
      <DrawerContent direction="left" size="sm" className="sm:hidden">
        {(title || description) && (
          <DrawerHeader>
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && <DrawerDescription>{description}</DrawerDescription>}
          </DrawerHeader>
        )}
        
        <DrawerBody>
          {children}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

// Notification drawer for alerts and messages
interface NotificationDrawerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  notifications: Array<{
    id: string
    title: string
    description?: string
    time: string
    read?: boolean
    action?: () => void
  }>
  onMarkAllRead?: () => void
  onClearAll?: () => void
}

export function NotificationDrawer({
  open,
  onOpenChange,
  notifications,
  onMarkAllRead,
  onClearAll
}: NotificationDrawerProps) {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent direction="right" size="md">
        <DrawerHeader>
          <DrawerTitle>
            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </DrawerTitle>
          <DrawerDescription>
            Stay updated with your shipping activities
          </DrawerDescription>
        </DrawerHeader>
        
        <DrawerBody>
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                    !notification.read && "bg-blue-50 border-blue-200"
                  )}
                  onClick={notification.action}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      {notification.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.description}
                        </p>
                      )}
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {notification.time}
                    </time>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DrawerBody>
        
        {notifications.length > 0 && (
          <DrawerFooter>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={onMarkAllRead}>
                Mark All Read
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClearAll}>
              Clear All
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
