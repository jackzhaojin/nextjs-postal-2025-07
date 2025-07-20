"use client"

import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionProps {
  type?: 'single' | 'multiple'
  defaultValue?: string | string[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  collapsible?: boolean
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

interface AccordionItemProps {
  value: string
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

interface AccordionTriggerProps {
  className?: string
  children: React.ReactNode
  icon?: React.ReactNode
  showIcon?: boolean
}

interface AccordionContentProps {
  className?: string
  children: React.ReactNode
}

// Main Accordion wrapper
export function Accordion({
  type = 'single',
  defaultValue,
  value,
  onValueChange,
  collapsible = true,
  disabled = false,
  className,
  children,
  ...props
}: AccordionProps) {
  if (type === 'single') {
    return (
      <AccordionPrimitive.Root
        type="single"
        defaultValue={defaultValue as string}
        value={value as string}
        onValueChange={onValueChange as (value: string) => void}
        collapsible={collapsible}
        disabled={disabled}
        className={cn("w-full", className)}
        {...props}
      >
        {children}
      </AccordionPrimitive.Root>
    )
  }

  return (
    <AccordionPrimitive.Root
      type="multiple"
      defaultValue={defaultValue as string[]}
      value={value as string[]}
      onValueChange={onValueChange as (value: string[]) => void}
      disabled={disabled}
      className={cn("w-full", className)}
      {...props}
    >
      {children}
    </AccordionPrimitive.Root>
  )
}

// Individual accordion item
export function AccordionItem({
  value,
  disabled = false,
  className,
  children,
  ...props
}: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      value={value}
      disabled={disabled}
      className={cn(
        "border-b border-border last:border-b-0",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Item>
  )
}

// Accordion trigger (clickable header)
export function AccordionTrigger({
  className,
  children,
  icon,
  showIcon = true,
  ...props
}: AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={cn(
          "flex flex-1 items-center justify-between py-4 px-1 font-medium transition-all",
          "hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "[&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        {showIcon && (
          icon || (
            <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform duration-200" />
          )
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

// Accordion content (collapsible content)
export function AccordionContent({
  className,
  children,
  ...props
}: AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        "overflow-hidden text-sm transition-all",
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      {...props}
    >
      <div className="pb-4 pt-0 px-1">
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

// FAQ-style accordion preset
interface FAQAccordionProps {
  items: Array<{
    id: string
    question: string
    answer: React.ReactNode
    defaultOpen?: boolean
  }>
  allowMultiple?: boolean
  className?: string
}

export function FAQAccordion({
  items,
  allowMultiple = false,
  className
}: FAQAccordionProps) {
  const defaultOpenItems = items
    .filter(item => item.defaultOpen)
    .map(item => item.id)

  return (
    <Accordion
      type={allowMultiple ? 'multiple' : 'single'}
      defaultValue={allowMultiple ? defaultOpenItems : defaultOpenItems[0]}
      className={cn("w-full space-y-2", className)}
    >
      {items.map((item) => (
        <AccordionItem 
          key={item.id} 
          value={item.id}
          className="border rounded-lg px-4 data-[state=open]:bg-muted/50"
        >
          <AccordionTrigger className="text-left hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

// Settings-style accordion preset
interface SettingsAccordionProps {
  sections: Array<{
    id: string
    title: string
    description?: string
    content: React.ReactNode
    icon?: React.ReactNode
    badge?: string | number
  }>
  defaultOpen?: string[]
  className?: string
}

export function SettingsAccordion({
  sections,
  defaultOpen,
  className
}: SettingsAccordionProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={defaultOpen}
      className={cn("w-full", className)}
    >
      {sections.map((section) => (
        <AccordionItem 
          key={section.id} 
          value={section.id}
          className="border-b"
        >
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center space-x-3">
              {section.icon && (
                <span className="h-5 w-5 text-muted-foreground">
                  {section.icon}
                </span>
              )}
              <div className="text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{section.title}</span>
                  {section.badge && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                      {section.badge}
                    </span>
                  )}
                </div>
                {section.description && (
                  <div className="text-sm text-muted-foreground font-normal">
                    {section.description}
                  </div>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {section.content}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

// Nested accordion for complex hierarchies
interface NestedAccordionProps {
  items: Array<{
    id: string
    title: string
    content?: React.ReactNode
    children?: Array<{
      id: string
      title: string
      content: React.ReactNode
    }>
  }>
  className?: string
}

export function NestedAccordion({
  items,
  className
}: NestedAccordionProps) {
  return (
    <Accordion type="multiple" className={cn("w-full", className)}>
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger className="font-medium">
            {item.title}
          </AccordionTrigger>
          <AccordionContent>
            {item.content}
            {item.children && (
              <Accordion type="multiple" className="mt-4 ml-4 border-l pl-4">
                {item.children.map((child) => (
                  <AccordionItem key={child.id} value={child.id} className="border-b-0">
                    <AccordionTrigger className="py-2 text-sm">
                      {child.title}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm">
                      {child.content}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
