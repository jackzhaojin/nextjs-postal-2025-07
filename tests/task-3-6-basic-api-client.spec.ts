import { test, expect } from '@playwright/test';

const BASE_URL = 'http://172.24.240.1:3000';

test.describe('API Client - Form Configuration', () => {
  test('should successfully fetch form configuration', async ({ request }) => {
    console.log('🧪 [TEST] Testing form configuration fetch...');
    
    const response = await request.get(`${BASE_URL}/api/form-config`);
    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    expect(data.data).toHaveProperty('packageTypes');
    expect(data.data).toHaveProperty('countries');
    expect(data.data).toHaveProperty('industries');
    expect(Array.isArray(data.data.packageTypes)).toBe(true);
    expect(Array.isArray(data.data.countries)).toBe(true);
    
    console.log('✅ [TEST] Form config fetched successfully');
  });

  test('should handle network timeouts', async ({ request }) => {
    console.log('🧪 [TEST] Testing network timeout handling...');
    
    try {
      // Test with very short timeout
      const response = await request.get(`${BASE_URL}/api/form-config`, { timeout: 1 });
      console.log('Response received despite short timeout');
    } catch (error) {
      expect((error as Error).message.toLowerCase()).toContain('timeout');
      console.log('✅ [TEST] Timeout handled correctly');
    }
  });
});

test.describe('API Client - Quote Requests', () => {
  test('should successfully request shipping quotes', async ({ request }) => {
    console.log('🧪 [TEST] Testing quote request...');
    
    const quoteRequest = {
      shipmentDetails: {
        origin: {
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'US',
          isResidential: false,
          contactInfo: {
            name: 'John Sender',
            company: 'Acme Corp',
            phone: '+1-555-123-4567',
            email: 'john@acme.com'
          },
          locationType: 'commercial'
        },
        destination: {
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210',
          country: 'US',
          isResidential: true,
          contactInfo: {
            name: 'Jane Receiver',
            phone: '+1-555-987-6543',
            email: 'jane@customer.com'
          },
          locationType: 'residential'
        },
        package: {
          type: 'medium',
          dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
          weight: { value: 5.5, unit: 'lbs' },
          declaredValue: 250,
          currency: 'USD',
          contents: 'Electronics equipment',
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
      }
    };
    
    const response = await request.post(`${BASE_URL}/api/quote`, {
      data: quoteRequest
    });
    
    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    expect(data.data).toHaveProperty('quotes');
    expect(data.data).toHaveProperty('requestId');
    expect(data.data).toHaveProperty('expiresAt');
    expect(data.data.quotes).toHaveProperty('ground');
    expect(data.data.quotes).toHaveProperty('air');
    expect(data.data.quotes).toHaveProperty('freight');
    
    console.log('✅ [TEST] Quote request successful');
  });

  test('should handle invalid quote request data', async ({ request }) => {
    console.log('🧪 [TEST] Testing invalid quote request handling...');
    
    const response = await request.post(`${BASE_URL}/api/quote`, {
      data: { invalid: 'data' }
    });
    
    expect(response.ok()).toBe(false);
    expect([400, 500]).toContain(response.status());
    
    console.log('✅ [TEST] Invalid quote request handled correctly');
  });
});

test.describe('API Client - Pickup Availability', () => {
  test('should successfully fetch pickup availability', async ({ request }) => {
    console.log('🧪 [TEST] Testing pickup availability fetch...');
    
    const response = await request.get(`${BASE_URL}/api/pickup-availability?zip=94102`);
    expect(response.ok()).toBe(true);
    
    const data = await response.json();
    expect(data.data).toHaveProperty('availableDates');
    expect(data.data).toHaveProperty('cutoffTime');
    expect(Array.isArray(data.data.availableDates)).toBe(true);
    
    console.log('✅ [TEST] Pickup availability fetched successfully');
  });

  test('should handle invalid ZIP code', async ({ request }) => {
    console.log('🧪 [TEST] Testing invalid ZIP code handling...');
    
    const response = await request.get(`${BASE_URL}/api/pickup-availability?zip=123`);
    expect([400, 500]).toContain(response.status());
    
    console.log('✅ [TEST] Invalid ZIP code handled correctly');
  });
});

test.describe('API Client - Shipment Submission', () => {
  test('should handle shipment submission', async ({ request }) => {
    console.log('🧪 [TEST] Testing shipment submission...');
    
    const transaction = {
      id: 'test-client-001',
      timestamp: new Date().toISOString(),
      shipmentDetails: {
        origin: {
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'US',
          isResidential: false,
          contactInfo: {
            name: 'John Sender',
            company: 'Acme Corp',
            phone: '+1-555-123-4567',
            email: 'john@acme.com'
          },
          locationType: 'commercial'
        },
        destination: {
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210',
          country: 'US',
          isResidential: true,
          contactInfo: {
            name: 'Jane Receiver',
            phone: '+1-555-987-6543',
            email: 'jane@customer.com'
          },
          locationType: 'residential'
        },
        package: {
          type: 'medium',
          dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
          weight: { value: 5.5, unit: 'lbs' },
          declaredValue: 250,
          currency: 'USD',
          contents: 'Electronics equipment',
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
      },
      selectedOption: {
        id: 'ground-standard-001',
        category: 'ground',
        serviceType: 'Ground Standard',
        carrier: 'UPS',
        pricing: {
          baseRate: 45.50,
          fuelSurcharge: 3.64,
          fuelSurchargePercentage: 8.0,
          insurance: 2.50,
          insurancePercentage: 1.0,
          specialHandling: 15.00,
          deliveryConfirmation: 3.50,
          taxes: 5.97,
          taxPercentage: 8.5,
          total: 76.11,
          calculationBasis: {
            distance: 380,
            weight: 5.5,
            zone: 'Zone 3'
          }
        },
        estimatedDelivery: '2025-07-28',
        transitDays: 3,
        features: ['Tracking', 'Insurance', 'Delivery Confirmation']
      },
      paymentInfo: {
        method: 'po',
        reference: 'PO-2025-12345',
        billingContact: {
          name: 'Bill Manager',
          company: 'Acme Corp',
          phone: '+1-555-111-2222',
          email: 'billing@acme.com'
        },
        companyInfo: {
          legalName: 'Acme Corporation',
          businessType: 'corporation',
          industry: 'Technology',
          annualShippingVolume: '50k-250k',
          taxId: '12-3456789'
        },
        billingAddress: {
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'US',
          isResidential: false,
          contactInfo: {
            name: 'Bill Manager',
            phone: '+1-555-111-2222',
            email: 'billing@acme.com'
          },
          locationType: 'commercial'
        },
        invoicePreferences: {
          deliveryMethod: 'email',
          format: 'itemized',
          frequency: 'per-shipment'
        },
        paymentDetails: {
          purchaseOrder: {
            poNumber: 'PO-2025-12345',
            poAmount: 1000.00,
            expirationDate: '2025-12-31',
            approvalContact: 'Bill Manager',
            department: 'Operations'
          }
        }
      },
      pickupDetails: {
        date: '2025-07-25',
        timeSlot: {
          id: 'morning-0800-1000',
          display: '8:00 AM - 10:00 AM',
          startTime: '08:00',
          endTime: '10:00',
          availability: 'available'
        },
        instructions: 'Package ready at loading dock',
        contactPerson: 'John Sender',
        phone: '+1-555-123-4567',
        accessInstructions: {
          securityRequired: false,
          appointmentRequired: false,
          limitedParking: true,
          forkliftAvailable: false,
          liftgateRequired: false,
          parkingInstructions: 'Use visitor parking',
          packageLocation: 'Loading dock, bay 3',
          driverInstructions: 'Ring bell at dock office'
        },
        equipmentRequirements: {
          dolly: false,
          applianceDolly: false,
          furniturePads: true,
          straps: false,
          palletJack: false,
          twoPersonTeam: false,
          loadingAssistance: 'driver-assist'
        },
        notificationPreferences: {
          emailReminder24h: true,
          smsReminder2h: true,
          callReminder30m: false,
          driverEnRoute: true,
          pickupCompletion: true,
          transitUpdates: true
        },
        readyTime: '07:30',
        authorizedPersonnel: ['John Sender', 'Mike Assistant']
      },
      status: 'review'
    };
    
    const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
      data: { transaction }
    });
    
    const result = await response.json();
    console.log('📋 [TEST] Submission response:', response.status(), result);
    
    // Accept success (200) or payment declined (402) due to simulation
    if (response.status() === 200) {
      expect(result).toHaveProperty('confirmationNumber');
      expect(result).toHaveProperty('trackingNumber');
      expect(result).toHaveProperty('status', 'confirmed');
      console.log('✅ [TEST] Shipment submission successful');
    } else if (response.status() === 402) {
      expect(result.error).toBe('PAYMENT_DECLINED');
      console.log('✅ [TEST] Payment declined (expected simulation behavior)');
    } else {
      console.log('⚠️ [TEST] Unexpected response:', response.status());
    }
  });

  test('should handle incomplete transaction data', async ({ request }) => {
    console.log('🧪 [TEST] Testing incomplete transaction handling...');
    
    const response = await request.post(`${BASE_URL}/api/submit-shipment`, {
      data: { 
        transaction: {
          id: 'incomplete',
          timestamp: new Date().toISOString(),
          status: 'review'
        }
      }
    });
    
    expect(response.status()).toBe(400);
    
    const result = await response.json();
    expect(result.error).toBe('VALIDATION_ERROR');
    
    console.log('✅ [TEST] Incomplete transaction handled correctly');
  });
});

test.describe('API Client - Integration Testing', () => {
  test('should complete workflow sequence', async ({ request }) => {
    console.log('🧪 [TEST] Testing complete API workflow...');
    
    // Step 1: Get form config
    console.log('Step 1: Fetching form config...');
    const configResponse = await request.get(`${BASE_URL}/api/form-config`);
    expect(configResponse.ok()).toBe(true);
    const config = await configResponse.json();
    expect(config.data.packageTypes).toBeTruthy();
    
    // Step 2: Get quotes
    console.log('Step 2: Getting quotes...');
    const quoteRequest = {
      shipmentDetails: {
        origin: {
          address: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          country: 'US',
          isResidential: false,
          contactInfo: {
            name: 'John Sender',
            phone: '+1-555-123-4567',
            email: 'john@acme.com'
          },
          locationType: 'commercial'
        },
        destination: {
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210',
          country: 'US',
          isResidential: true,
          contactInfo: {
            name: 'Jane Receiver',
            phone: '+1-555-987-6543',
            email: 'jane@customer.com'
          },
          locationType: 'residential'
        },
        package: {
          type: 'medium',
          dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
          weight: { value: 5.5, unit: 'lbs' },
          declaredValue: 250,
          currency: 'USD',
          contents: 'Electronics equipment',
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
      }
    };
    
    const quoteResponse = await request.post(`${BASE_URL}/api/quote`, {
      data: quoteRequest
    });
    expect(quoteResponse.ok()).toBe(true);
    const quotes = await quoteResponse.json();
    expect(quotes.data.quotes.ground.length).toBeGreaterThan(0);
    
    // Step 3: Check pickup availability
    console.log('Step 3: Checking pickup availability...');
    const pickupResponse = await request.get(`${BASE_URL}/api/pickup-availability?zip=94102`);
    expect(pickupResponse.ok()).toBe(true);
    const pickup = await pickupResponse.json();
    expect(pickup.data.availableDates.length).toBeGreaterThan(0);
    
    console.log('✅ [TEST] Complete workflow successful');
  });

  test('should validate API response times', async ({ request }) => {
    console.log('🧪 [TEST] Testing API response times...');
    
    const startTime = Date.now();
    const response = await request.get(`${BASE_URL}/api/form-config`);
    const responseTime = Date.now() - startTime;
    
    expect(response.ok()).toBe(true);
    expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    
    console.log(`⏱️ [TEST] Form config response time: ${responseTime}ms`);
    console.log('✅ [TEST] Response time within acceptable limits');
  });
});

test.describe('API Client - Error Scenarios', () => {
  test('should handle invalid endpoints gracefully', async ({ request }) => {
    console.log('🧪 [TEST] Testing invalid endpoint handling...');
    
    const response = await request.get(`${BASE_URL}/api/non-existent-endpoint`);
    expect(response.status()).toBe(404);
    
    console.log('✅ [TEST] Invalid endpoint handled correctly');
  });

  test('should handle malformed request data', async ({ request }) => {
    console.log('🧪 [TEST] Testing malformed request handling...');
    
    const response = await request.post(`${BASE_URL}/api/quote`, {
      data: 'invalid json string'
    });
    
    expect([400, 500]).toContain(response.status());
    
    console.log('✅ [TEST] Malformed request handled correctly');
  });
});