"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
  className?: string
  children: React.ReactNode
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
  orientation?: 'horizontal' | 'vertical'
}

interface TabsTriggerProps {
  value: string
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

interface TabsContentProps {
  value: string
  className?: string
  children: React.ReactNode
  lazy?: boolean
}

// Main Tabs wrapper
export function Tabs({
  defaultValue,
  value,
  onValueChange,
  orientation = 'horizontal',
  className,
  children,
  ...props
}: TabsProps) {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      orientation={orientation}
      className={cn(
        "flex",
        orientation === 'horizontal' ? "flex-col" : "flex-row",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Root>
  )
}

// Tabs list (container for triggers)
export function TabsList({
  className,
  children,
  orientation = 'horizontal',
  ...props
}: TabsListProps) {
  return (
    <TabsPrimitive.List
      className={cn(
        "inline-flex items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        orientation === 'horizontal' 
          ? "h-10 w-full" 
          : "h-auto w-auto flex-col space-y-1",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  )
}

// Individual tab trigger
export function TabsTrigger({
  value,
  disabled = false,
  className,
  children,
  ...props
}: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        "hover:bg-background/50 hover:text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  )
}

// Tab content panel
export function TabsContent({
  value,
  className,
  children,
  lazy = false,
  ...props
}: TabsContentProps) {
  const [hasBeenActive, setHasBeenActive] = React.useState(!lazy)

  // For now, we'll render all content. In a real implementation, 
  // we could use Radix's useValue hook or similar context
  React.useEffect(() => {
    if (!hasBeenActive) {
      setHasBeenActive(true)
    }
  }, [hasBeenActive])

  return (
    <TabsPrimitive.Content
      value={value}
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    >
      {(!lazy || hasBeenActive) ? children : null}
    </TabsPrimitive.Content>
  )
}

// Preset vertical tabs variant
interface VerticalTabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  tabs: Array<{
    value: string
    label: string
    content: React.ReactNode
    disabled?: boolean
    badge?: string | number
  }>
}

export function VerticalTabs({
  defaultValue,
  value,
  onValueChange,
  className,
  tabs
}: VerticalTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      orientation="vertical"
      className={cn("flex gap-6", className)}
    >
      <TabsList orientation="vertical" className="h-auto w-48 flex-col">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className="w-full justify-between"
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                {tab.badge}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <div className="flex-1">
        {tabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-0">
            {tab.content}
          </TabsContent>
        ))}
      </div>
    </Tabs>
  )
}

// Card-style tabs variant
interface CardTabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  tabs: Array<{
    value: string
    label: string
    content: React.ReactNode
    disabled?: boolean
    icon?: React.ReactNode
  }>
}

export function CardTabs({
  defaultValue,
  value,
  onValueChange,
  className,
  tabs
}: CardTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className="flex items-center space-x-2"
          >
            {tab.icon && <span className="h-4 w-4">{tab.icon}</span>}
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent 
          key={tab.value} 
          value={tab.value}
          className="border rounded-lg p-6 bg-card"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

// Underline style tabs variant
interface UnderlineTabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  tabs: Array<{
    value: string
    label: string
    content: React.ReactNode
    disabled?: boolean
    count?: number
  }>
}

export function UnderlineTabs({
  defaultValue,
  value,
  onValueChange,
  className,
  tabs
}: UnderlineTabsProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      className={cn("w-full", className)}
    >
      <TabsList className="h-auto bg-transparent border-b rounded-none p-0 justify-start">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn(
              "relative bg-transparent shadow-none rounded-none border-b-2 border-transparent px-4 py-3",
              "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none",
              "hover:bg-muted/50"
            )}
          >
            <span className="flex items-center space-x-2">
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
                  {tab.count}
                </span>
              )}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent 
          key={tab.value} 
          value={tab.value}
          className="pt-6"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}
