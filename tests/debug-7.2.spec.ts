import { test, expect } from '@playwright/test';

test('Debug Task 7.2 elements', async ({ page }) => {
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
  
  // Reload the page to pick up the localStorage data
  await page.reload();
  
  // Wait for pickup page to load
  await expect(page.getByRole('heading', { name: 'Schedule Pickup' })).toBeVisible();
  
  // Click on Location tab
  await page.click('[data-testid="tab-location"]');
  
  // Debug: Print all data-testid attributes on the page
  const testIds = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('[data-testid]'));
    return elements.map(el => ({
      testId: el.getAttribute('data-testid'),
      tag: el.tagName,
      text: el.textContent?.slice(0, 50) || '',
      visible: (el as HTMLElement).offsetParent !== null
    }));
  });
  
  console.log('🔍 All data-testid elements on page:');
  testIds.forEach(el => {
    console.log(`  - ${el.testId} (${el.tag}) "${el.text}" visible=${el.visible}`);
  });
  
  // Debug: Check specifically for location type elements
  const locationElements = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('[data-testid*="location-type"]'));
    return elements.map(el => ({
      testId: el.getAttribute('data-testid'),
      tag: el.tagName,
      text: el.textContent?.slice(0, 100) || '',
      visible: (el as HTMLElement).offsetParent !== null,
      disabled: el.hasAttribute('disabled'),
      classes: el.className
    }));
  });
  
  console.log('🎯 Location type elements:');
  locationElements.forEach(el => {
    console.log(`  - ${el.testId} (${el.tag}) "${el.text}" visible=${el.visible} disabled=${el.disabled}`);
  });
  
  // Take a screenshot for visual debugging
  await page.screenshot({ path: 'debug-7.2-page.png', fullPage: true });
});
