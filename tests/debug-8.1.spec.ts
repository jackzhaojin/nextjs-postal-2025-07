import { test, expect } from '@playwright/test';

test.describe('Review Page - Debug', () => {
  test.beforeEach(async ({ page }) => {
    // Mock localStorage with minimal data
    await page.addInitScript(() => {
      const mockTransaction = {
        id: 'test-transaction',
        timestamp: new Date().toISOString(),
        status: 'review',
        shipmentDetails: {
          origin: {
            address: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US',
            isResidential: false,
            locationType: 'commercial',
            contactInfo: {
              name: 'John Smith',
              phone: '555-123-4567',
              email: 'john@test.com'
            }
          },
          destination: {
            address: '456 Oak Ave',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90210',
            country: 'US',
            isResidential: true,
            locationType: 'residential',
            contactInfo: {
              name: 'Jane Doe',
              phone: '555-987-6543',
              email: 'jane@test.com'
            }
          },
          package: {
            type: 'medium',
            dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
            weight: { value: 5, unit: 'lbs' },
            declaredValue: 250.00,
            currency: 'USD',
            contents: 'Electronics',
            contentsCategory: 'electronics',
            specialHandling: ['fragile', 'this-side-up']
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
      
      localStorage.setItem('currentShippingTransaction', JSON.stringify(mockTransaction));
    });
  });

  test('should load review page and display basic content', async ({ page }) => {
    await page.goto('/shipping/review');
    
    // Take a screenshot to debug
    await page.screenshot({ path: 'test-results/debug-review-page.png', fullPage: true });
    
    // Check for the main heading
    const heading = page.getByText('Review Your Shipment');
    await expect(heading).toBeVisible();
    
    // Check for route display
    await expect(page.getByText('New York, NY → Los Angeles, CA')).toBeVisible();
    
    console.log('✓ Basic page content is visible');
  });
});
