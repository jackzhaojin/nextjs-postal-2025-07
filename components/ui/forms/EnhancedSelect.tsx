'use client'

import React, { forwardRef, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Check, ChevronDown, Search, Loader2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  group?: string
}

export interface EnhancedSelectProps {
  options: SelectOption[]
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  loading?: boolean
  disabled?: boolean
  multiple?: boolean
  searchable?: boolean
  clearable?: boolean
  className?: string
  triggerClassName?: string
  contentClassName?: string
  maxSelected?: number
  renderOption?: (option: SelectOption) => React.ReactNode
  renderValue?: (option: SelectOption | SelectOption[]) => React.ReactNode
}

const EnhancedSelect = forwardRef<HTMLButtonElement, EnhancedSelectProps>(
  ({
    options = [],
    value,
    onValueChange,
    placeholder = 'Select an option...',
    searchPlaceholder = 'Search options...',
    emptyMessage = 'No options found.',
    loading = false,
    disabled = false,
    multiple = false,
    searchable = true,
    clearable = false,
    className,
    triggerClassName,
    contentClassName,
    maxSelected,
    renderOption,
    renderValue,
    ...props
  }, ref) => {
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Handle both single and multiple values
    const selectedValues = useMemo(() => {
      if (!value) return []
      return Array.isArray(value) ? value : [value]
    }, [value])

    const selectedOptions = useMemo(() => {
      return options.filter(option => selectedValues.includes(option.value))
    }, [options, selectedValues])

    // Filter options based on search query
    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) return options
      
      const query = searchQuery.toLowerCase()
      return options.filter(option => 
        option.label.toLowerCase().includes(query) ||
        option.description?.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query)
      )
    }, [options, searchQuery])

    // Group options if needed
    const groupedOptions = useMemo(() => {
      const groups: Record<string, SelectOption[]> = {}
      
      filteredOptions.forEach(option => {
        const groupName = option.group || 'default'
        if (!groups[groupName]) {
          groups[groupName] = []
        }
        groups[groupName].push(option)
      })
      
      return groups
    }, [filteredOptions])

    const handleSelect = (selectedValue: string) => {
      if (multiple) {
        const newValues = selectedValues.includes(selectedValue)
          ? selectedValues.filter(v => v !== selectedValue)
          : maxSelected && selectedValues.length >= maxSelected
            ? selectedValues
            : [...selectedValues, selectedValue]
        
        onValueChange?.(newValues)
      } else {
        onValueChange?.(selectedValue)
        setOpen(false)
      }
    }

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation()
      onValueChange?.(multiple ? [] : '')
    }

    const removeValue = (valueToRemove: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (multiple) {
        const newValues = selectedValues.filter(v => v !== valueToRemove)
        onValueChange?.(newValues)
      }
    }

    const renderTriggerContent = () => {
      if (loading) {
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        )
      }

      if (selectedOptions.length === 0) {
        return <span className="text-muted-foreground">{placeholder}</span>
      }

      if (renderValue) {
        return renderValue(multiple ? selectedOptions : selectedOptions[0])
      }

      if (multiple) {
        if (selectedOptions.length === 1) {
          return selectedOptions[0].label
        }
        
        return (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.slice(0, 2).map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className="enhanced-select-badge"
                onClick={(e) => removeValue(option.value, e)}
              >
                {option.label}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            ))}
            {selectedOptions.length > 2 && (
              <Badge variant="secondary">
                +{selectedOptions.length - 2} more
              </Badge>
            )}
          </div>
        )
      }

      return selectedOptions[0].label
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || loading}
            className={cn(
              'enhanced-select-trigger w-full justify-between text-left font-normal',
              !selectedOptions.length && 'text-muted-foreground',
              triggerClassName
            )}
            {...props}
          >
            <div className="enhanced-select-content flex-1 truncate">
              {renderTriggerContent()}
            </div>
            
            <div className="enhanced-select-icons flex items-center gap-1">
              {clearable && selectedOptions.length > 0 && (
                <X
                  className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                  onClick={handleClear}
                />
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          className={cn('enhanced-select-popover w-full p-0', contentClassName)}
          style={{ width: 'var(--radix-popover-trigger-width)' }}
        >
          <Command>
            {searchable && (
              <div className="enhanced-select-search flex items-center border-b px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            )}
            
            <CommandList className="enhanced-select-list">
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              
              {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <CommandGroup 
                  key={groupName}
                  heading={groupName !== 'default' ? groupName : undefined}
                >
                  {groupOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disabled}
                      onSelect={() => handleSelect(option.value)}
                      className={cn(
                        'enhanced-select-option',
                        selectedValues.includes(option.value) && 'bg-accent'
                      )}
                    >
                      <div className="flex-1">
                        {renderOption ? renderOption(option) : (
                          <div>
                            <div className="font-medium">{option.label}</div>
                            {option.description && (
                              <div className="text-sm text-muted-foreground">
                                {option.description}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {selectedValues.includes(option.value) && (
                        <Check className="ml-2 h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

EnhancedSelect.displayName = 'EnhancedSelect'

export { EnhancedSelect }
