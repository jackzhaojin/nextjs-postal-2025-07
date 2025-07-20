/**
 * Holiday Calendar and Business Day Management
 * Federal holiday tracking and business day calculations
 */

// Federal holidays for 2025 (fixed dates and calculated ones)
export const FEDERAL_HOLIDAYS_2025: Array<{ date: string; name: string; observedDate?: string }> = [
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-01-20', name: 'Martin Luther King Jr. Day' },
  { date: '2025-02-17', name: "Presidents' Day" },
  { date: '2025-05-26', name: 'Memorial Day' },
  { date: '2025-06-19', name: 'Juneteenth' },
  { date: '2025-07-04', name: 'Independence Day' },
  { date: '2025-09-01', name: 'Labor Day' },
  { date: '2025-10-13', name: 'Columbus Day' },
  { date: '2025-11-11', name: 'Veterans Day' },
  { date: '2025-11-27', name: 'Thanksgiving Day' },
  { date: '2025-11-28', name: 'Day after Thanksgiving' }, // Common carrier closure
  { date: '2025-12-25', name: 'Christmas Day' },
  { date: '2025-12-24', name: 'Christmas Eve' }, // Common carrier closure
  { date: '2025-12-31', name: "New Year's Eve" } // Common carrier closure
];

// Carrier-specific blackout periods (simulated)
export const CARRIER_BLACKOUTS_2025: Array<{ 
  startDate: string; 
  endDate: string; 
  reason: string; 
  carriers?: string[] 
}> = [
  {
    startDate: '2025-12-20',
    endDate: '2025-12-26',
    reason: 'Holiday Peak Season Restrictions',
    carriers: ['premium-express', 'value-logistics']
  },
  {
    startDate: '2025-01-02',
    endDate: '2025-01-03',
    reason: 'Post-Holiday Service Resumption',
    carriers: ['freight-specialists']
  },
  {
    startDate: '2025-07-03',
    endDate: '2025-07-07',
    reason: 'Independence Day Weekend Extension',
    carriers: ['eco-transport']
  }
];

/**
 * Check if a date is a federal holiday
 */
export function isFederalHoliday(date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return FEDERAL_HOLIDAYS_2025.some(holiday => holiday.date === dateStr);
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is a business day
 */
export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isFederalHoliday(date);
}

/**
 * Get the next business day from a given date
 */
export function getNextBusinessDay(date: Date): Date {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while (!isBusinessDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
}

/**
 * Add business days to a date
 */
export function addBusinessDays(date: Date, businessDays: number): Date {
  let currentDate = new Date(date);
  let daysAdded = 0;
  
  while (daysAdded < businessDays) {
    currentDate = getNextBusinessDay(currentDate);
    daysAdded++;
  }
  
  return currentDate;
}

/**
 * Count business days between two dates
 */
export function countBusinessDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (isBusinessDay(currentDate)) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count;
}

/**
 * Get day of week name
 */
export function getDayOfWeekName(date: Date): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

/**
 * Check if a date falls within any carrier blackout period
 */
export function isCarrierBlackout(date: Date, carriers?: string[]): { isBlackout: boolean; reason?: string } {
  const dateStr = date.toISOString().split('T')[0];
  
  for (const blackout of CARRIER_BLACKOUTS_2025) {
    if (dateStr >= blackout.startDate && dateStr <= blackout.endDate) {
      // If specific carriers are provided, check if any match
      if (carriers && blackout.carriers) {
        const hasAffectedCarrier = carriers.some(carrier => 
          blackout.carriers!.includes(carrier)
        );
        if (hasAffectedCarrier) {
          return { isBlackout: true, reason: blackout.reason };
        }
      } else {
        // General blackout period
        return { isBlackout: true, reason: blackout.reason };
      }
    }
  }
  
  return { isBlackout: false };
}

/**
 * Get holiday name for a specific date
 */
export function getHolidayName(date: Date): string | null {
  const dateStr = date.toISOString().split('T')[0];
  const holiday = FEDERAL_HOLIDAYS_2025.find(h => h.date === dateStr);
  return holiday ? holiday.name : null;
}

/**
 * Get all holidays in a date range
 */
export function getHolidaysInRange(startDate: Date, endDate: Date): Array<{ date: string; name: string }> {
  const startStr = startDate.toISOString().split('T')[0];
  const endStr = endDate.toISOString().split('T')[0];
  
  return FEDERAL_HOLIDAYS_2025.filter(holiday => 
    holiday.date >= startStr && holiday.date <= endStr
  );
}

/**
 * Check if current time is past cutoff for next business day pickup
 */
export function isPastCutoffTime(currentTime: Date = new Date()): boolean {
  const cutoffHour = 15; // 3:00 PM cutoff
  const hour = currentTime.getHours();
  return hour >= cutoffHour;
}
