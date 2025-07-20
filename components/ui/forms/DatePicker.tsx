"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  excludeWeekends?: boolean
  excludeHolidays?: boolean
  className?: string
  error?: boolean
  businessDaysOnly?: boolean
}

// US Federal Holidays for business day calculation
const US_HOLIDAYS_2025 = [
  new Date(2025, 0, 1),   // New Year's Day
  new Date(2025, 0, 20),  // MLK Day
  new Date(2025, 1, 17),  // Presidents Day
  new Date(2025, 4, 26),  // Memorial Day
  new Date(2025, 5, 19),  // Juneteenth
  new Date(2025, 6, 4),   // Independence Day
  new Date(2025, 8, 1),   // Labor Day
  new Date(2025, 9, 13),  // Columbus Day
  new Date(2025, 10, 11), // Veterans Day
  new Date(2025, 10, 27), // Thanksgiving
  new Date(2025, 11, 25), // Christmas
]

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  disabled = false,
  minDate,
  maxDate,
  excludeWeekends = false,
  excludeHolidays = false,
  className,
  error = false,
  businessDaysOnly = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [currentMonth, setCurrentMonth] = React.useState(
    value || new Date()
  )

  const isDateDisabled = React.useCallback((date: Date) => {
    // Check min/max bounds
    if (minDate && date < minDate) return true
    if (maxDate && date > maxDate) return true
    
    // Check weekends
    if ((excludeWeekends || businessDaysOnly) && (date.getDay() === 0 || date.getDay() === 6)) {
      return true
    }
    
    // Check holidays
    if ((excludeHolidays || businessDaysOnly) && 
        US_HOLIDAYS_2025.some(holiday => 
          holiday.getFullYear() === date.getFullYear() &&
          holiday.getMonth() === date.getMonth() &&
          holiday.getDate() === date.getDate()
        )) {
      return true
    }
    
    return false
  }, [minDate, maxDate, excludeWeekends, excludeHolidays, businessDaysOnly])

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1)
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1)
      }
      return newMonth
    })
  }

  const selectDate = (date: Date) => {
    if (!isDateDisabled(date)) {
      onChange?.(date)
      setIsOpen(false)
    }
  }

  const days = getDaysInMonth(currentMonth)
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? formatDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              disabled={minDate && new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1) < minDate}
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <div className="font-semibold">{monthYear}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              disabled={maxDate && new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1) > maxDate}
            >
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="h-8 w-8 text-center text-sm font-medium text-muted-foreground flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-8 w-8" />
              }

              const isSelected = value && 
                date.getFullYear() === value.getFullYear() &&
                date.getMonth() === value.getMonth() &&
                date.getDate() === value.getDate()
              
              const isDisabled = isDateDisabled(date)
              const isToday = new Date().toDateString() === date.toDateString()

              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "ghost"}
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => selectDate(date)}
                  className={cn(
                    "h-8 w-8 p-0 font-normal",
                    isToday && !isSelected && "bg-accent text-accent-foreground",
                    isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                    isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed"
                  )}
                >
                  {date.getDate()}
                </Button>
              )
            })}
          </div>

          {/* Business Days Note */}
          {businessDaysOnly && (
            <div className="mt-3 text-xs text-muted-foreground text-center">
              Business days only (excludes weekends and holidays)
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
