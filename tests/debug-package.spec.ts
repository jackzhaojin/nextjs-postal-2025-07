import { test, expect } from '@playwright/test';

test('Debug form state and packageInfo', async ({ page }) => {
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
    console.log('🧪 [DEBUG] Set localStorage data:', mockShipmentDetails);
  });
  
  // Reload the page to pick up the localStorage data
  await page.reload();
  
  // Wait for pickup page to load
  await expect(page.getByRole('heading', { name: 'Schedule Pickup' })).toBeVisible();
  
  // Click on Location tab
  await page.click('[data-testid="tab-location"]');
  
  // Check localStorage data from browser
  const browserLocalStorage = await page.evaluate(() => {
    const data = localStorage.getItem('currentShippingTransaction');
    return data ? JSON.parse(data) : null;
  });
  
  console.log('🔍 [DEBUG] Browser localStorage data:');
  console.log('Package:', browserLocalStorage?.shipmentDetails?.package);
  
  // Add a delay to ensure React state updates
  await page.waitForTimeout(1000);
  
  // Check what the form is actually receiving by adding debug output to the console
  const formData = await page.evaluate(() => {
    // Try to access React component state through the DOM
    const equipmentSection = document.querySelector('[data-testid="equipment-assessment"]');
    return {
      equipmentSectionExists: !!equipmentSection,
      equipmentText: equipmentSection?.textContent || 'Not found'
    };
  });
  
  console.log('🔍 [DEBUG] Form data:');
  console.log('Equipment section exists:', formData.equipmentSectionExists);
  console.log('Equipment text preview:', formData.equipmentText.slice(0, 200));
  
  // Check network requests to see if there are any failed requests
  const logs = await page.evaluate(() => {
    return (window as any).console_logs || [];
  });
  
  console.log('🔍 [DEBUG] Console logs:', logs);
});
