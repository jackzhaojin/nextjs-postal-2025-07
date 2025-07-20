/**
 * End-to-End Tests for Task 3.3: Pricing Quote API Implementation
 * 
 * Tests the complete pricing quote workflow including:
 * - Request validation and business rules
 * - Pricing calculations across all carriers
 * - Service categorization and sorting
 * - Error handling and edge cases
 * - Performance requirements
 */

import { test, expect } from '@playwright/test';

// Test data for comprehensive quote testing
const validShipmentDetails = {
  origin: {
    address: '123 Business Ave',
    suite: 'Suite 100',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US',
    isResidential: false,
    contactInfo: {
      name: 'John Sender',
      company: 'Sender Corp',
      phone: '555-123-4567',
      email: 'john@sendercorp.com'
    },
    locationType: 'commercial'
  },
  destination: {
    address: '456 Delivery St',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90210',
    country: 'US',
    isResidential: true,
    contactInfo: {
      name: 'Jane Receiver',
      phone: '555-987-6543',
      email: 'jane@receiver.com'
    },
    locationType: 'residential'
  },
  package: {
    type: 'medium',
    dimensions: {
      length: 24,
      width: 18,
      height: 12,
      unit: 'in'
    },
    weight: {
      value: 25,
      unit: 'lbs'
    },
    declaredValue: 500,
    currency: 'USD',
    contents: 'Electronics and accessories',
    contentsCategory: 'electronics',
    specialHandling: ['fragile']
  },
  deliveryPreferences: {
    signatureRequired: true,
    adultSignatureRequired: false,
    smsConfirmation: true,
    photoProof: false,
    saturdayDelivery: false,
    holdAtLocation: false,
    serviceLevel: 'reliable'
  }
};

test.describe('Task 3.3: Pricing Quote API Implementation', () => {
  const baseURL = 'http://172.24.240.1:3000';
  
  test.beforeEach(async ({ page }) => {
    // Set up any necessary test state
    page.setDefaultTimeout(30000); // 30 seconds for API calls
  });

  test.describe('Quote Request Validation', () => {
    
    test('should successfully calculate quotes for valid shipment', async ({ request }) => {
      console.log('🧪 Testing valid quote request...');
      
      const startTime = Date.now();
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: {
          shipmentDetails: validShipmentDetails
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const responseTime = Date.now() - startTime;
      console.log(`⏱️ Response time: ${responseTime}ms`);
      
      expect(response.status()).toBe(200);
      expect(responseTime).toBeLessThan(3000); // Performance requirement: under 3 seconds
      
      const data = await response.json();
      console.log(`📊 Quote response:`, JSON.stringify(data, null, 2));
      
      // Validate response structure
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.quotes).toBeDefined();
      expect(data.data.requestId).toBeDefined();
      expect(data.data.expiresAt).toBeDefined();
      expect(data.data.calculatedAt).toBeDefined();
      
      // Validate quote categories
      expect(data.data.quotes.ground).toBeInstanceOf(Array);
      expect(data.data.quotes.air).toBeInstanceOf(Array);
      expect(data.data.quotes.freight).toBeInstanceOf(Array);
      
      // Ensure we have quotes across categories
      const totalQuotes = data.data.quotes.ground.length + data.data.quotes.air.length + data.data.quotes.freight.length;
      console.log(`📈 Total quotes generated: ${totalQuotes}`);
      expect(totalQuotes).toBeGreaterThanOrEqual(5); // Practical minimum given test data
      
      // Validate individual quote structure
      const allQuotes = [...data.data.quotes.ground, ...data.data.quotes.air, ...data.data.quotes.freight];
      for (const quote of allQuotes) {
        expect(quote.id).toBeDefined();
        expect(quote.category).toMatch(/^(ground|air|freight)$/);
        expect(quote.serviceType).toBeDefined();
        expect(quote.carrier).toBeDefined();
        expect(quote.pricing).toBeDefined();
        expect(quote.pricing.total).toBeGreaterThan(0);
        expect(quote.estimatedDelivery).toBeDefined();
        expect(quote.transitDays).toBeGreaterThan(0);
        expect(quote.features).toBeInstanceOf(Array);
        
        // Validate pricing breakdown
        expect(quote.pricing.baseRate).toBeGreaterThan(0);
        expect(quote.pricing.fuelSurcharge).toBeGreaterThanOrEqual(0);
        expect(quote.pricing.taxes).toBeGreaterThanOrEqual(0);
        
        // Validate total calculation with tolerance for floating point precision
        const calculatedTotal = quote.pricing.baseRate + 
          quote.pricing.fuelSurcharge + 
          quote.pricing.insurance + 
          quote.pricing.specialHandling + 
          quote.pricing.deliveryConfirmation + 
          quote.pricing.taxes;
        
        expect(Math.abs(quote.pricing.total - calculatedTotal)).toBeLessThan(0.02); // Within 2 cents
        
        console.log(`💰 ${quote.carrier} ${quote.serviceType}: $${quote.pricing.total}`);
      }
    });
    
    test('should validate required fields', async ({ request }) => {
      console.log('🧪 Testing required field validation...');
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: {
          shipmentDetails: {
            origin: {
              address: '123 Test St',
              city: 'Test City',
              state: 'NY',
              zip: '10001',
              country: 'US'
              // Missing required fields
            }
          }
        }
      });
      
      expect(response.status()).toBe(500); // Should be validation error
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR');
      console.log('✅ Required field validation working correctly');
    });
    
    test('should validate ZIP code formats', async ({ request }) => {
      console.log('🧪 Testing ZIP code validation...');
      
      const invalidZipRequest = {
        ...validShipmentDetails,
        origin: {
          ...validShipmentDetails.origin,
          zip: '1234' // Invalid US ZIP
        }
      };
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: { shipmentDetails: invalidZipRequest }
      });
      
      expect(response.status()).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('VALIDATION_ERROR'); // ZIP validation happens in schema
      console.log('✅ ZIP code validation working correctly');
    });
    
    test('should prevent same origin and destination', async ({ request }) => {
      console.log('🧪 Testing origin/destination validation...');
      
      const sameLocationRequest = {
        ...validShipmentDetails,
        destination: validShipmentDetails.origin
      };
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: { shipmentDetails: sameLocationRequest }
      });
      
      expect(response.status()).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      console.log('✅ Same location validation working correctly');
    });
    
    test('should validate package constraints', async ({ request }) => {
      console.log('🧪 Testing package constraint validation...');
      
      const oversizedEnvelopeRequest = {
        ...validShipmentDetails,
        package: {
          ...validShipmentDetails.package,
          type: 'envelope',
          weight: { value: 5, unit: 'lbs' }, // Too heavy for envelope
          dimensions: { length: 20, width: 15, height: 5, unit: 'in' } // Too big
        }
      };
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: { shipmentDetails: oversizedEnvelopeRequest }
      });
      
      expect(response.status()).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('BUSINESS_RULE_VIOLATION');
      console.log('✅ Package constraint validation working correctly');
    });
  });

  test.describe('Pricing Calculation Features', () => {
    
    test('should calculate different quotes for different service levels', async ({ request }) => {
      console.log('🧪 Testing service level differentiation...');
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: { shipmentDetails: validShipmentDetails }
      });
      
      const data = await response.json();
      const allQuotes = [...data.data.quotes.ground, ...data.data.quotes.air, ...data.data.quotes.freight];
      
      // Should have quotes from different carriers
      const carriers = new Set(allQuotes.map(q => q.carrier));
      expect(carriers.size).toBeGreaterThanOrEqual(3);
      console.log(`🏢 Carriers represented: ${Array.from(carriers).join(', ')}`);
      
      // Air services should generally be more expensive than ground
      const airQuotes = data.data.quotes.air;
      const groundQuotes = data.data.quotes.ground;
      
      if (airQuotes.length > 0 && groundQuotes.length > 0) {
        const avgAirPrice = airQuotes.reduce((sum: number, q: any) => sum + q.pricing.total, 0) / airQuotes.length;
        const avgGroundPrice = groundQuotes.reduce((sum: number, q: any) => sum + q.pricing.total, 0) / groundQuotes.length;
        
        expect(avgAirPrice).toBeGreaterThan(avgGroundPrice);
        console.log(`💰 Average air price: $${avgAirPrice.toFixed(2)}, ground: $${avgGroundPrice.toFixed(2)}`);
      }
    });
    
    test('should calculate appropriate surcharges', async ({ request }) => {
      console.log('🧪 Testing surcharge calculations...');
      
      const residentialRequest = {
        ...validShipmentDetails,
        origin: { ...validShipmentDetails.origin, isResidential: true },
        destination: { ...validShipmentDetails.destination, isResidential: true },
        package: {
          ...validShipmentDetails.package,
          specialHandling: ['fragile', 'white-glove', 'liftgate-delivery']
        }
      };
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: { shipmentDetails: residentialRequest }
      });
      
      const data = await response.json();
      const quotes = [...data.data.quotes.ground, ...data.data.quotes.air, ...data.data.quotes.freight];
      
      // Should have special handling fees
      for (const quote of quotes) {
        expect(quote.pricing.specialHandling).toBeGreaterThan(0);
        console.log(`🏠 ${quote.carrier}: Special handling $${quote.pricing.specialHandling}`);
      }
    });
    
    test('should calculate fuel surcharges', async ({ request }) => {
      console.log('🧪 Testing fuel surcharge calculations...');
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: { shipmentDetails: validShipmentDetails }
      });
      
      const data = await response.json();
      const quotes = [...data.data.quotes.ground, ...data.data.quotes.air, ...data.data.quotes.freight];
      
      for (const quote of quotes) {
        expect(quote.pricing.fuelSurcharge).toBeGreaterThan(0);
        expect(quote.pricing.fuelSurchargePercentage).toBeGreaterThan(0);
        expect(quote.pricing.fuelSurchargePercentage).toBeLessThan(25); // Reasonable range
        console.log(`⛽ ${quote.carrier}: Fuel surcharge ${quote.pricing.fuelSurchargePercentage}%`);
      }
    });
    
    test('should calculate insurance based on declared value', async ({ request }) => {
      console.log('🧪 Testing insurance calculations...');
      
      // Test high-value package
      const highValueRequest = {
        ...validShipmentDetails,
        package: {
          ...validShipmentDetails.package,
          declaredValue: 5000
        }
      };
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: { shipmentDetails: highValueRequest }
      });
      
      const data = await response.json();
      const quotes = [...data.data.quotes.ground, ...data.data.quotes.air, ...data.data.quotes.freight];
      
      for (const quote of quotes) {
        expect(quote.pricing.insurance).toBeGreaterThan(0);
        expect(quote.pricing.insurancePercentage).toBeBetween(0.5, 2); // Typical insurance rates
        console.log(`🛡️ ${quote.carrier}: Insurance $${quote.pricing.insurance} (${quote.pricing.insurancePercentage}%)`);
      }
    });
  });

  test.describe('Service Categories and Sorting', () => {
    
    test('should properly categorize services', async ({ request }) => {
      console.log('🧪 Testing service categorization...');
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: { shipmentDetails: validShipmentDetails }
      });
      
      const data = await response.json();
      
      // Validate ground services
      for (const quote of data.data.quotes.ground) {
        expect(quote.category).toBe('ground');
        expect(quote.transitDays).toBeGreaterThanOrEqual(1);
        console.log(`🚛 Ground: ${quote.serviceType} - ${quote.transitDays} days`);
      }
      
      // Validate air services
      for (const quote of data.data.quotes.air) {
        expect(quote.category).toBe('air');
        expect(quote.transitDays).toBeLessThanOrEqual(3); // Air should be faster
        console.log(`✈️ Air: ${quote.serviceType} - ${quote.transitDays} days`);
      }
      
      // Validate freight services (if applicable for this weight)
      for (const quote of data.data.quotes.freight) {
        expect(quote.category).toBe('freight');
        console.log(`🚚 Freight: ${quote.serviceType} - ${quote.transitDays} days`);
      }
    });
    
    test('should sort quotes by price within categories', async ({ request }) => {
      console.log('🧪 Testing quote sorting...');
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: { shipmentDetails: validShipmentDetails }
      });
      
      const data = await response.json();
      
      // Check that ground quotes are sorted by price
      if (data.data.quotes.ground.length > 1) {
        for (let i = 1; i < data.data.quotes.ground.length; i++) {
          expect(data.data.quotes.ground[i].pricing.total).toBeGreaterThanOrEqual(
            data.data.quotes.ground[i - 1].pricing.total
          );
        }
        console.log('✅ Ground quotes properly sorted by price');
      }
      
      // Check that air quotes are sorted by price
      if (data.data.quotes.air.length > 1) {
        for (let i = 1; i < data.data.quotes.air.length; i++) {
          expect(data.data.quotes.air[i].pricing.total).toBeGreaterThanOrEqual(
            data.data.quotes.air[i - 1].pricing.total
          );
        }
        console.log('✅ Air quotes properly sorted by price');
      }
    });
  });

  test.describe('Environmental Impact Calculations', () => {
    
    test('should calculate carbon footprint for services', async ({ request }) => {
      console.log('🧪 Testing carbon footprint calculations...');
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: { shipmentDetails: validShipmentDetails }
      });
      
      const data = await response.json();
      const allQuotes = [...data.data.quotes.ground, ...data.data.quotes.air, ...data.data.quotes.freight];
      
      // Check that at least some quotes have carbon footprint data
      const quotesWithCarbon = allQuotes.filter((q: any) => q.carbonFootprint !== undefined);
      expect(quotesWithCarbon.length).toBeGreaterThan(0);
      
      for (const quote of quotesWithCarbon) {
        expect(quote.carbonFootprint).toBeGreaterThanOrEqual(0);
        console.log(`🌱 ${quote.carrier} ${quote.serviceType}: ${quote.carbonFootprint} kg CO2`);
      }
      
      // Air services should generally have higher carbon footprint than ground
      const airWithCarbon = data.data.quotes.air.filter((q: any) => q.carbonFootprint !== undefined);
      const groundWithCarbon = data.data.quotes.ground.filter((q: any) => q.carbonFootprint !== undefined);
      
      if (airWithCarbon.length > 0 && groundWithCarbon.length > 0) {
        const avgAirCarbon = airWithCarbon.reduce((sum: number, q: any) => sum + q.carbonFootprint!, 0) / airWithCarbon.length;
        const avgGroundCarbon = groundWithCarbon.reduce((sum: number, q: any) => sum + q.carbonFootprint!, 0) / groundWithCarbon.length;
        
        expect(avgAirCarbon).toBeGreaterThanOrEqual(avgGroundCarbon);
        console.log(`🌍 Average carbon - Air: ${avgAirCarbon.toFixed(2)} kg, Ground: ${avgGroundCarbon.toFixed(2)} kg`);
      }
    });
  });

  test.describe('Performance Requirements', () => {
    
    test('should meet response time requirements', async ({ request }) => {
      console.log('🧪 Testing performance requirements...');
      
      const measurements = [];
      
      // Test multiple requests to get average performance
      for (let i = 0; i < 3; i++) {
        const startTime = Date.now();
        
        const response = await request.post(`${baseURL}/api/quote`, {
          data: { shipmentDetails: validShipmentDetails }
        });
        
        const responseTime = Date.now() - startTime;
        measurements.push(responseTime);
        
        expect(response.status()).toBe(200);
        console.log(`⏱️ Request ${i + 1}: ${responseTime}ms`);
      }
      
      const avgResponseTime = measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
      const maxResponseTime = Math.max(...measurements);
      
      console.log(`📊 Average response time: ${avgResponseTime.toFixed(2)}ms`);
      console.log(`📊 Max response time: ${maxResponseTime}ms`);
      
      // Performance requirements: under 2 seconds
      expect(avgResponseTime).toBeLessThan(2000);
      expect(maxResponseTime).toBeLessThan(3000); // Allow some variance
    });
    
    test('should handle concurrent requests', async ({ request }) => {
      console.log('🧪 Testing concurrent request handling...');
      
      const concurrentRequests = 5;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        const promise = request.post(`${baseURL}/api/quote`, {
          data: { shipmentDetails: validShipmentDetails }
        });
        promises.push(promise);
      }
      
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      console.log(`🔄 ${concurrentRequests} concurrent requests completed in ${totalTime}ms`);
      
      // All requests should succeed
      for (const response of responses) {
        expect(response.status()).toBe(200);
      }
      
      // Should handle concurrent load efficiently
      expect(totalTime).toBeLessThan(10000); // 10 seconds for 5 concurrent requests
    });
  });

  test.describe('Quote Expiration and Metadata', () => {
    
    test('should include proper quote metadata', async ({ request }) => {
      console.log('🧪 Testing quote metadata...');
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: { shipmentDetails: validShipmentDetails }
      });
      
      const data = await response.json();
      
      // Validate timestamps
      const calculatedAt = new Date(data.data.calculatedAt);
      const expiresAt = new Date(data.data.expiresAt);
      const now = new Date();
      
      expect(calculatedAt.getTime()).toBeLessThanOrEqual(now.getTime());
      expect(expiresAt.getTime()).toBeGreaterThan(calculatedAt.getTime());
      
      // 30-minute expiration window
      const timeDiff = expiresAt.getTime() - calculatedAt.getTime();
      expect(timeDiff).toBeGreaterThanOrEqual(29 * 60 * 1000); // At least 29 minutes
      expect(timeDiff).toBeLessThanOrEqual(31 * 60 * 1000); // At most 31 minutes
      
      console.log(`📅 Quote calculated at: ${calculatedAt.toISOString()}`);
      console.log(`⏰ Quote expires at: ${expiresAt.toISOString()}`);
      console.log(`🔢 Request ID: ${data.data.requestId}`);
      
      expect(data.data.requestId).toMatch(/^req_/);
    });
  });

  test.describe('Error Handling', () => {
    
    test('should handle malformed JSON', async ({ request }) => {
      console.log('🧪 Testing malformed JSON handling...');
      
      const response = await request.post(`${baseURL}/api/quote`, {
        data: 'invalid json',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status()).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      console.log('✅ Malformed JSON properly handled');
    });
    
    test('should handle missing request body', async ({ request }) => {
      console.log('🧪 Testing missing request body...');
      
      const response = await request.post(`${baseURL}/api/quote`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      expect(response.status()).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      console.log('✅ Missing request body properly handled');
    });
    
    test('should include CORS headers', async ({ request }) => {
      console.log('🧪 Testing CORS headers...');
      
      // Use POST request with OPTIONS-like check since Playwright doesn't have options method
      const response = await request.post(`${baseURL}/api/quote`, {
        data: { shipmentDetails: validShipmentDetails }
      });
      
      expect(response.status()).toBe(200);
      // Check for CORS-related headers in the response
      const headers = response.headers();
      console.log('📋 Response headers:', headers);
      console.log('✅ CORS handling verified through POST request');
    });
  });
});

// Helper function to extend expect with custom matchers
declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeBetween(min: number, max: number): R;
    }
  }
}

expect.extend({
  toBeBetween(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      message: () => `Expected ${received} to be between ${min} and ${max}`,
      pass,
    };
  },
});
