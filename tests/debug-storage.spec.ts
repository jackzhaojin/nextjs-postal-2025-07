import { test, expect } from '@playwright/test';

test('Debug localStorage structure', async ({ page }) => {
  // Set up localStorage with mock shipment data
  await page.goto('/shipping/pickup');
  
  await page.evaluate(() => {
    const mockShipmentDetails = {
      id: 'test-shipment-123',
      timestamp: new Date(),
      shipmentDetails: {
        origin: {
          address: '123 Business St',
          city: 'Seattle',
          state: 'WA',
          zip: '98101',
          country: 'US',
          isResidential: false,
          locationType: 'commercial',
          contactInfo: {
            name: 'John Doe',
            company: 'Test Company',
            phone: '(555) 123-4567',
            email: 'john@test.com'
          }
        },
        destination: {
          address: '456 Client Ave',
          city: 'Portland',
          state: 'OR',
          zip: '97201',
          country: 'US',
          isResidential: false,
          locationType: 'commercial',
          contactInfo: {
            name: 'Jane Smith',
            company: 'Client Corp',
            phone: '(555) 987-6543',
            email: 'jane@client.com'
          }
        },
        package: {
          type: 'medium',
          weight: { value: 25, unit: 'lbs' },
          dimensions: { length: 24, width: 18, height: 12, unit: 'in' },
          specialHandling: [],
          declaredValue: { amount: 500, currency: 'USD' },
          description: 'Test package'
        },
        deliveryPreferences: {
          signatureRequired: false,
          leaveUnattended: false,
          deliveryInstructions: ''
        }
      },
      status: 'draft'
    };
    
    localStorage.setItem('currentShippingTransaction', JSON.stringify(mockShipmentDetails));
  });
  
  // Check what keys exist in localStorage
  const storageData = await page.evaluate(() => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }
    
    const data: Record<string, any> = {};
    keys.forEach(key => {
      if (key) {
        try {
          const value = localStorage.getItem(key);
          data[key] = value ? JSON.parse(value) : value;
        } catch (e) {
          data[key] = localStorage.getItem(key); // Store as string if not JSON
        }
      }
    });
    
    return { keys, data };
  });
  
  console.log('🔍 [DEBUG] localStorage keys:', storageData.keys);
  console.log('🔍 [DEBUG] currentShippingTransaction structure:');
  const currentTransaction = storageData.data['currentShippingTransaction'];
  if (currentTransaction) {
    console.log('  - id:', currentTransaction.id);
    console.log('  - timestamp:', currentTransaction.timestamp);
    console.log('  - status:', currentTransaction.status);
    console.log('  - shipmentDetails keys:', Object.keys(currentTransaction.shipmentDetails || {}));
    console.log('  - package data:', currentTransaction.shipmentDetails?.package);
  }
  
  // Check if there's a separate key that the hook might be looking for
  console.log('🔍 [DEBUG] Looking for other potential keys...');
  storageData.keys.forEach(key => {
    if (key && (key.includes('shipment') || key.includes('form') || key.includes('details'))) {
      console.log(`  - Found key: ${key}`);
      console.log(`    Value:`, storageData.data[key]);
    }
  });
});
