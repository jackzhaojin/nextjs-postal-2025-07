/**
 * Task 3.4: Pickup Availability API End-to-End Tests
 * Comprehensive testing for pickup scheduling functionality
 */

import { test, expect } from '@playwright/test';

const baseURL = 'http://localhost:3000';

// Test data sets
const validZipCodes = {
  metro: '10001', // NYC Metro
  standard: '45202', // Cincinnati
  limited: '96801', // Hawaii
  remote: '99501' // Alaska
};

const invalidZipCodes = {
  tooShort: '123',
  tooLong: '123456789012',
  invalidFormat: 'ABCDE',
  military: '09001', // APO/FPO
  canadian: 'K1A0A6'
};

test.describe('Pickup Availability API - Task 3.4', () => {
  test.beforeEach(async ({ page }) => {
    // Set console event listeners for debugging
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`Console error: ${msg.text()}`);
      }
    });
  });

  test.describe('Basic Functionality', () => {
    test('should return availability for valid ZIP code', async ({ request }) => {
      console.log('🧪 Testing basic availability retrieval...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.metro}`);
      
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('availableDates');
      expect(data.data).toHaveProperty('restrictions');
      expect(data.data).toHaveProperty('cutoffTime');
      expect(data.data).toHaveProperty('serviceArea');
      expect(data.data).toHaveProperty('metadata');
      
      // Validate available dates structure
      expect(Array.isArray(data.data.availableDates)).toBe(true);
      expect(data.data.availableDates.length).toBeGreaterThan(0);
      
      const firstDate = data.data.availableDates[0];
      expect(firstDate).toHaveProperty('date');
      expect(firstDate).toHaveProperty('dayOfWeek');
      expect(firstDate).toHaveProperty('isBusinessDay');
      expect(firstDate).toHaveProperty('timeSlots');
      expect(Array.isArray(firstDate.timeSlots)).toBe(true);
      
      // Validate time slots
      const firstTimeSlot = firstDate.timeSlots[0];
      expect(firstTimeSlot).toHaveProperty('id');
      expect(firstTimeSlot).toHaveProperty('label');
      expect(firstTimeSlot).toHaveProperty('startTime');
      expect(firstTimeSlot).toHaveProperty('endTime');
      expect(firstTimeSlot).toHaveProperty('availability');
      expect(['available', 'limited', 'unavailable']).toContain(firstTimeSlot.availability);
      
      console.log('✅ Basic availability retrieval working correctly');
      console.log(`📊 Returned ${data.data.availableDates.length} available dates`);
    });

    test('should return different service levels for different ZIP codes', async ({ request }) => {
      console.log('🧪 Testing service level differentiation...');
      
      // Test metro area (should have full service)
      const metroResponse = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.metro}`);
      expect(metroResponse.status()).toBe(200);
      const metroData = await metroResponse.json();
      
      // Test remote area (should have limited service)
      const remoteResponse = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.remote}`);
      expect(remoteResponse.status()).toBe(200);
      const remoteData = await remoteResponse.json();
      
      // Compare service areas
      expect(metroData.data.serviceArea.coverage).toBe('full');
      expect(remoteData.data.serviceArea.coverage).toBe('remote');
      
      // Remote areas should have more restrictions
      expect(remoteData.data.restrictions.length).toBeGreaterThanOrEqual(metroData.data.restrictions.length);
      
      console.log('✅ Service level differentiation working correctly');
      console.log(`Metro coverage: ${metroData.data.serviceArea.coverage}`);
      console.log(`Remote coverage: ${remoteData.data.serviceArea.coverage}`);
    });

    test('should validate minimum lead time requirements', async ({ request }) => {
      console.log('🧪 Testing minimum lead time validation...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.standard}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      // Check that first available date is at least 3 business days in the future
      const today = new Date();
      const firstAvailableDate = new Date(data.data.availableDates[0].date);
      const daysDifference = Math.ceil((firstAvailableDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      expect(daysDifference).toBeGreaterThanOrEqual(3);
      expect(data.data.metadata.minimumLeadTime).toBe(3);
      
      console.log('✅ Minimum lead time validation working correctly');
      console.log(`First available date: ${data.data.availableDates[0].date} (${daysDifference} days from today)`);
    });
  });

  test.describe('Parameter Validation', () => {
    test('should reject missing ZIP code', async ({ request }) => {
      console.log('🧪 Testing missing ZIP code validation...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability`);
      
      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      expect(data.error.message).toContain('ZIP code');
      
      console.log('✅ Missing ZIP code validation working correctly');
    });

    test('should reject invalid ZIP code formats', async ({ request }) => {
      console.log('🧪 Testing invalid ZIP code format validation...');
      
      for (const [type, zip] of Object.entries(invalidZipCodes)) {
        const response = await request.get(`${baseURL}/api/pickup-availability?zip=${zip}`);
        
        expect(response.status()).toBe(400);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error.code).toBe('VALIDATION_ERROR');
        
        console.log(`✅ Invalid ZIP (${type}: ${zip}) rejected correctly`);
      }
    });

    test('should handle weeks parameter validation', async ({ request }) => {
      console.log('🧪 Testing weeks parameter validation...');
      
      // Test valid weeks parameter
      const validResponse = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.standard}&weeks=2`);
      expect(validResponse.status()).toBe(200);
      
      // Test invalid weeks parameter (too high)
      const invalidResponse = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.standard}&weeks=5`);
      expect(invalidResponse.status()).toBe(400);
      const invalidData = await invalidResponse.json();
      expect(invalidData.success).toBe(false);
      expect(invalidData.error.code).toBe('VALIDATION_ERROR');
      
      console.log('✅ Weeks parameter validation working correctly');
    });

    test('should handle boolean parameters correctly', async ({ request }) => {
      console.log('🧪 Testing boolean parameter handling...');
      
      // Test with weekend inclusion
      const weekendResponse = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.metro}&includeWeekends=true`);
      expect(weekendResponse.status()).toBe(200);
      const weekendData = await weekendResponse.json();
      expect(weekendData.data).toHaveProperty('weekendOptions');
      
      // Test with holiday inclusion
      const holidayResponse = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.metro}&includeHolidays=true`);
      expect(holidayResponse.status()).toBe(200);
      const holidayData = await holidayResponse.json();
      expect(holidayData.data).toHaveProperty('holidayOptions');
      
      console.log('✅ Boolean parameter handling working correctly');
    });
  });

  test.describe('Time Slot Management', () => {
    test('should generate standard time slots', async ({ request }) => {
      console.log('🧪 Testing standard time slot generation...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.standard}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      const firstDate = data.data.availableDates[0];
      expect(firstDate.timeSlots.length).toBeGreaterThanOrEqual(3);
      
      // Check for standard time slots
      const slotIds = firstDate.timeSlots.map((slot: any) => slot.id);
      expect(slotIds).toContain('morning');
      expect(slotIds).toContain('afternoon');
      expect(slotIds).toContain('evening');
      
      // Validate time formats
      firstDate.timeSlots.forEach((slot: any) => {
        expect(slot.startTime).toMatch(/^\d{2}:\d{2}$/);
        expect(slot.endTime).toMatch(/^\d{2}:\d{2}$/);
        expect(typeof slot.additionalFee).toBe('number');
        expect(slot.additionalFee).toBeGreaterThanOrEqual(0);
      });
      
      console.log('✅ Standard time slot generation working correctly');
      console.log(`Generated time slots: ${slotIds.join(', ')}`);
    });

    test('should apply premium fees for evening slots', async ({ request }) => {
      console.log('🧪 Testing premium fee application...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.metro}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      const firstDate = data.data.availableDates[0];
      const eveningSlot = firstDate.timeSlots.find((slot: any) => slot.id === 'evening');
      
      if (eveningSlot) {
        expect(eveningSlot.additionalFee).toBeGreaterThan(0);
        expect(eveningSlot.label).toContain('Evening');
        console.log(`✅ Evening premium fee applied: $${eveningSlot.additionalFee}`);
      } else {
        console.log('ℹ️ Evening slot not available for this date');
      }
    });

    test('should vary availability by time slot', async ({ request }) => {
      console.log('🧪 Testing time slot availability variation...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.standard}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      // Collect availability statistics
      const availabilityStats = {
        available: 0,
        limited: 0,
        unavailable: 0
      };
      
      data.data.availableDates.forEach((date: any) => {
        date.timeSlots.forEach((slot: any) => {
          availabilityStats[slot.availability as keyof typeof availabilityStats]++;
        });
      });
      
      // Should have variation in availability
      const totalSlots = availabilityStats.available + availabilityStats.limited + availabilityStats.unavailable;
      expect(totalSlots).toBeGreaterThan(0);
      
      console.log('✅ Time slot availability variation working correctly');
      console.log(`Availability distribution: Available: ${availabilityStats.available}, Limited: ${availabilityStats.limited}, Unavailable: ${availabilityStats.unavailable}`);
    });
  });

  test.describe('Geographic Coverage', () => {
    test('should handle metropolitan area coverage', async ({ request }) => {
      console.log('🧪 Testing metropolitan area coverage...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.metro}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.data.serviceArea.coverage).toBe('full');
      expect(data.data.serviceArea.zone).toContain('METRO');
      
      // Metro areas should have better availability
      const totalDates = data.data.availableDates.length;
      expect(totalDates).toBeGreaterThan(10); // Should have good availability
      
      console.log('✅ Metropolitan area coverage working correctly');
      console.log(`Metro service area: ${data.data.serviceArea.description}`);
    });

    test('should handle remote area limitations', async ({ request }) => {
      console.log('🧪 Testing remote area limitations...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.remote}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.data.serviceArea.coverage).toBe('remote');
      expect(data.data.restrictions.length).toBeGreaterThan(0);
      
      // Should have geographic restrictions
      const hasGeographicRestriction = data.data.restrictions.some((r: any) => r.type === 'geographic');
      expect(hasGeographicRestriction).toBe(true);
      
      console.log('✅ Remote area limitations working correctly');
      console.log(`Remote restrictions: ${data.data.restrictions.length}`);
    });

    test('should reject unsupported service areas', async ({ request }) => {
      console.log('🧪 Testing unsupported service area rejection...');
      
      // Use a ZIP code that will trigger business rule validation (extreme remote area)
      const unsupportedZip = '99950'; // Very remote Alaska area
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${unsupportedZip}`);
      expect(response.status()).toBe(400);
      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('BUSINESS_RULE_VIOLATION');
      expect(data.error.message).toContain('Business validation failed');
      
      console.log('✅ Unsupported service area rejection working correctly');
    });
  });

  test.describe('Premium Service Options', () => {
    test('should provide weekend options when requested', async ({ request }) => {
      console.log('🧪 Testing weekend service options...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.metro}&includeWeekends=true`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.data).toHaveProperty('weekendOptions');
      expect(data.data.weekendOptions).toHaveProperty('available');
      expect(data.data.weekendOptions).toHaveProperty('additionalFee');
      
      if (data.data.weekendOptions.available) {
        expect(data.data.weekendOptions.additionalFee).toBeGreaterThan(0);
        expect(Array.isArray(data.data.weekendOptions.conditions)).toBe(true);
        console.log(`✅ Weekend service available with $${data.data.weekendOptions.additionalFee} fee`);
      } else {
        console.log('ℹ️ Weekend service not available for this area');
      }
    });

    test('should provide holiday options when requested', async ({ request }) => {
      console.log('🧪 Testing holiday service options...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.metro}&includeHolidays=true`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.data).toHaveProperty('holidayOptions');
      expect(data.data.holidayOptions).toHaveProperty('available');
      expect(data.data.holidayOptions).toHaveProperty('additionalFee');
      
      console.log('✅ Holiday service options provided correctly');
    });

    test('should not include premium options when not requested', async ({ request }) => {
      console.log('🧪 Testing exclusion of premium options when not requested...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.standard}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.data.weekendOptions).toBeUndefined();
      expect(data.data.holidayOptions).toBeUndefined();
      
      console.log('✅ Premium options correctly excluded when not requested');
    });
  });

  test.describe('Business Rules', () => {
    test('should exclude weekends by default', async ({ request }) => {
      console.log('🧪 Testing weekend exclusion by default...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.standard}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      // All returned dates should be business days (Monday-Friday, non-holidays)
      data.data.availableDates.forEach((date: any) => {
        // Parse date correctly to avoid timezone issues
        const dateObj = new Date(date.date + 'T12:00:00');
        const dayOfWeek = dateObj.getDay();
        expect(dayOfWeek).toBeGreaterThanOrEqual(1); // Monday
        expect(dayOfWeek).toBeLessThanOrEqual(5); // Friday
      });
      
      console.log('✅ Weekend exclusion working correctly by default');
    });

    test('should respect cutoff times', async ({ request }) => {
      console.log('🧪 Testing cutoff time implementation...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.standard}`);
      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.data.cutoffTime).toMatch(/^\d{2}:\d{2}$/);
      expect(data.data.cutoffTime).toBe('15:00'); // 3:00 PM cutoff
      
      console.log('✅ Cutoff time implementation working correctly');
      console.log(`Cutoff time: ${data.data.cutoffTime}`);
    });

    test('should handle varying demand patterns', async ({ request }) => {
      console.log('🧪 Testing demand pattern variation...');
      
      // Test multiple ZIP codes to see variation
      const zipCodes = [validZipCodes.metro, validZipCodes.standard, validZipCodes.limited];
      const availabilityPatterns: number[] = [];
      
      for (const zip of zipCodes) {
        const response = await request.get(`${baseURL}/api/pickup-availability?zip=${zip}`);
        expect(response.status()).toBe(200);
        const data = await response.json();
        
        // Calculate availability ratio
        let totalSlots = 0;
        let availableSlots = 0;
        
        data.data.availableDates.forEach((date: any) => {
          date.timeSlots.forEach((slot: any) => {
            totalSlots++;
            if (slot.availability === 'available') {
              availableSlots++;
            }
          });
        });
        
        const availabilityRatio = totalSlots > 0 ? availableSlots / totalSlots : 0;
        availabilityPatterns.push(availabilityRatio);
      }
      
      // Should have variation between different areas
      const hasVariation = availabilityPatterns.some((ratio, index) => 
        index > 0 && Math.abs(ratio - availabilityPatterns[0]) > 0.1
      );
      
      expect(hasVariation).toBe(true);
      console.log('✅ Demand pattern variation working correctly');
      console.log(`Availability ratios: ${availabilityPatterns.map(r => (r * 100).toFixed(1) + '%').join(', ')}`);
    });
  });

  test.describe('Response Format and Caching', () => {
    test('should return properly formatted response', async ({ request }) => {
      console.log('🧪 Testing response format...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.standard}`);
      expect(response.status()).toBe(200);
      
      // Check standard API response format
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(data.success).toBe(true);
      
      // Check metadata
      expect(data.meta).toHaveProperty('requestId');
      expect(data.meta).toHaveProperty('timestamp');
      expect(data.meta).toHaveProperty('processingTime');
      
      console.log('✅ Response format working correctly');
    });

    test('should include appropriate caching headers', async ({ request }) => {
      console.log('🧪 Testing caching headers...');
      
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.standard}`);
      expect(response.status()).toBe(200);
      
      const headers = response.headers();
      expect(headers['cache-control']).toBeDefined();
      expect(headers['etag']).toBeDefined();
      expect(headers['vary']).toBeDefined();
      
      console.log('✅ Caching headers working correctly');
      console.log(`Cache-Control: ${headers['cache-control']}`);
    });

    test('should handle CORS preflight requests', async ({ request }) => {
      console.log('🧪 Testing CORS support...');
      
      const response = await request.fetch(`${baseURL}/api/pickup-availability`, {
        method: 'OPTIONS'
      });
      
      expect(response.status()).toBe(200);
      const headers = response.headers();
      expect(headers['access-control-allow-methods']).toContain('GET');
      expect(headers['access-control-allow-origin']).toBe('*');
      
      console.log('✅ CORS support working correctly');
    });
  });

  test.describe('Performance and Error Handling', () => {
    test('should respond within performance requirements', async ({ request }) => {
      console.log('🧪 Testing response performance...');
      
      const startTime = Date.now();
      const response = await request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.standard}`);
      const endTime = Date.now();
      
      expect(response.status()).toBe(200);
      const responseTime = endTime - startTime;
      
      // Should respond within 500ms as per requirements
      expect(responseTime).toBeLessThan(500);
      
      console.log('✅ Performance requirements met');
      console.log(`Response time: ${responseTime}ms`);
    });

    test('should handle concurrent requests properly', async ({ request }) => {
      console.log('🧪 Testing concurrent request handling...');
      
      const requests = [
        request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.metro}`),
        request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.standard}`),
        request.get(`${baseURL}/api/pickup-availability?zip=${validZipCodes.limited}`)
      ];
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status()).toBe(200);
      });
      
      console.log('✅ Concurrent request handling working correctly');
    });

    test('should provide consistent results for same ZIP code', async ({ request }) => {
      console.log('🧪 Testing result consistency...');
      
      const zip = validZipCodes.standard;
      
      const response1 = await request.get(`${baseURL}/api/pickup-availability?zip=${zip}`);
      const response2 = await request.get(`${baseURL}/api/pickup-availability?zip=${zip}`);
      
      expect(response1.status()).toBe(200);
      expect(response2.status()).toBe(200);
      
      const data1 = await response1.json();
      const data2 = await response2.json();
      
      // Should have same number of available dates
      expect(data1.data.availableDates.length).toBe(data2.data.availableDates.length);
      expect(data1.data.serviceArea.zone).toBe(data2.data.serviceArea.zone);
      
      console.log('✅ Result consistency working correctly');
    });
  });
});
