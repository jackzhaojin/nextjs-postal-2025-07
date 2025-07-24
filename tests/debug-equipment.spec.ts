import { test, expect } from '@playwright/test';

test('Debug equipment assessment text', async ({ page }) => {
  // Set up localStorage with mock shipment data
  await page.goto('/shipping/pickup');
  
  await page.evaluate(() => {
    // Data structure that the app expects
    const mockShippingTransaction = {
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
    
    // Data structure that the hook expects
    const mockShipmentDetails = {
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
    };
    
    // Store both formats for compatibility
    localStorage.setItem('currentShippingTransaction', JSON.stringify(mockShippingTransaction));
    localStorage.setItem('currentShipmentDetails', JSON.stringify(mockShipmentDetails));
  });
  
  // Reload the page to pick up the localStorage data
  await page.reload();
  
  // Wait for pickup page to load
  await expect(page.getByRole('heading', { name: 'Schedule Pickup' })).toBeVisible();
  
  // Click on Location tab
  await page.click('[data-testid="tab-location"]');
  
  // Look for the equipment assessment section
  const equipmentSection = page.locator('[data-testid="equipment-assessment"]');
  await expect(equipmentSection).toBeVisible();
  
  // Get all text content from the equipment section
  const equipmentText = await equipmentSection.textContent();
  console.log('🔍 Equipment Assessment Text:');
  console.log(equipmentText);
  
  // Check for package analysis section specifically
  const packageAnalysisExists = await page.getByText('Package Requirements Analysis').isVisible();
  console.log('📦 Package Requirements Analysis visible:', packageAnalysisExists);
  
  // Check for weight display
  const weightExists = await page.getByText('25 lbs').isVisible();
  console.log('⚖️ Weight "25 lbs" visible:', weightExists);
  
  // Look for any text containing "25"
  const texts = await page.evaluate(() => {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT
    );
    
    const texts = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent?.includes('25')) {
        texts.push({
          text: node.textContent,
          parent: node.parentElement?.tagName || 'unknown'
        });
      }
    }
    return texts;
  });
  
  console.log('🔢 All text nodes containing "25":');
  texts.forEach(item => console.log(`  - "${item.text}" in ${item.parent}`));
});
