import { test, expect } from '@playwright/test';

test.describe('Task 9.3: Next Steps and Additional Services', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Setting up test environment for task 9.3');
    
    // Clear localStorage to start fresh
    await page.addInitScript(() => {
      localStorage.clear();
      
      // Mock a shipping transaction for testing
      const mockTransaction = {
        id: 'test-transaction-' + Date.now(),
        timestamp: new Date().toISOString(),
        shipmentDetails: {
          origin: {
            address: '123 Test St',
            city: 'Test City',
            state: 'NY',
            zip: '10001',
            country: 'US',
            isResidential: false,
            locationType: 'commercial',
            contactInfo: {
              name: 'Test User',
              phone: '555-123-4567',
              email: 'test@example.com',
              company: 'Test Company'
            }
          },
          destination: {
            address: '456 Dest Ave',
            city: 'Dest City',
            state: 'CA',
            zip: '90210',
            country: 'US',
            isResidential: false,
            locationType: 'commercial',
            contactInfo: {
              name: 'Dest User',
              phone: '555-987-6543',
              email: 'dest@example.com',
              company: 'Dest Company'
            }
          },
          package: {
            type: 'medium',
            dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
            weight: { value: 10, unit: 'lbs' },
            declaredValue: 500,
            currency: 'USD',
            specialHandling: []
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
          id: 'test-option',
          category: 'ground',
          serviceType: 'Ground Express',
          carrier: 'TestCarrier',
          estimatedDelivery: 'Tomorrow',
          transitDays: 1,
          pricing: {
            baseRate: 25.00,
            fuelSurcharge: 2.50,
            total: 27.50
          },
          features: ['Tracking', 'Insurance']
        },
        confirmationNumber: 'TEST-2025-ABC123',
        status: 'confirmed'
      };
      
      // Store the mock transaction
      localStorage.setItem('currentTransaction', JSON.stringify(mockTransaction));
      localStorage.setItem('submissionResponse', JSON.stringify({
        confirmationNumber: 'TEST-2025-ABC123',
        estimatedDelivery: 'Tomorrow',
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        carrierInfo: {
          name: 'TestCarrier Express',
          logo: '/test-logo.png',
          trackingUrl: 'https://track.test.com/{trackingNumber}'
        },
        totalCost: 27.50
      }));
    });
    
    console.log('Mock data setup complete');
  });

  test('should display and interact with next steps section', async ({ page }) => {
    console.log('Testing Next Steps Section functionality');

    // Navigate directly to confirmation page
    await page.goto('/shipping/confirmation');
    await page.waitForLoadState('networkidle');
    console.log('Navigated to confirmation page');

    // Verify we're on confirmation page
    await expect(page.locator('text=Shipping Confirmed')).toBeVisible();
    console.log('Confirmed we are on confirmation page');

    // Test Next Steps Section
    console.log('Testing Next Steps Section');
    
    const nextStepsSection = page.locator('h2:has-text("Next Steps")');
    await nextStepsSection.waitFor({ timeout: 10000 });
    await expect(nextStepsSection).toBeVisible();

    // Check for overall progress indicator
    const progressSection = page.locator('text=Pre-Pickup Preparation');
    await expect(progressSection).toBeVisible();

    // Check for checklist categories
    const packagePrepCategory = page.locator('text=Package Preparation');
    await expect(packagePrepCategory).toBeVisible();

    // Test checklist interaction
    await packagePrepCategory.click();
    console.log('Expanded Package Preparation category');

    // Look for checklist items
    const securePackageItem = page.locator('text=Secure Package Contents');
    await expect(securePackageItem).toBeVisible();

    // Test checking off an item
    const checkboxes = page.locator('button:has(svg)').first();
    await checkboxes.click();
    console.log('Clicked checklist item checkbox');

    // Test process timeline
    const timelineSection = page.locator('text=Process Timeline');
    await expect(timelineSection).toBeVisible();

    console.log('Next Steps Section test completed successfully');
  });

  test('should display and interact with additional services section', async ({ page }) => {
    console.log('Testing Additional Services Section functionality');

    await page.goto('/shipping/confirmation');
    await page.waitForLoadState('networkidle');

    // Test Additional Services Section
    console.log('Testing Additional Services Section');
    
    const additionalServicesHeader = page.locator('h2:has-text("Additional Services")');
    await additionalServicesHeader.scrollIntoViewIfNeeded();
    await expect(additionalServicesHeader).toBeVisible();

    // Check for service categories
    const insuranceCategory = page.locator('text=Insurance & Protection');
    await expect(insuranceCategory).toBeVisible();

    // Test service selection
    const serviceCard = page.locator('[class*="border rounded-lg p-6"]').first();
    if (await serviceCard.isVisible()) {
      await serviceCard.click();
      console.log('Selected a service');
    }

    console.log('Additional Services Section test completed successfully');
  });

  test('should display and interact with record keeping section', async ({ page }) => {
    console.log('Testing Record Keeping Section functionality');

    await page.goto('/shipping/confirmation');
    await page.waitForLoadState('networkidle');

    // Test Record Keeping Section
    console.log('Testing Record Keeping Section');
    
    const recordKeepingHeader = page.locator('h2:has-text("Record Keeping")');
    await recordKeepingHeader.scrollIntoViewIfNeeded();
    await expect(recordKeepingHeader).toBeVisible();

    // Check for document formats
    const pdfFormat = page.locator('text=PDF Document');
    await expect(pdfFormat).toBeVisible();

    // Test quick actions
    const printButton = page.locator('text=Print Page');
    await expect(printButton).toBeVisible();

    const copyButton = page.locator('text=Copy Confirmation');
    await expect(copyButton).toBeVisible();

    console.log('Record Keeping Section test completed successfully');
  });

  test('should display and interact with future shipping section', async ({ page }) => {
    console.log('Testing Future Shipping Section functionality');

    await page.goto('/shipping/confirmation');
    await page.waitForLoadState('networkidle');

    // Test Future Shipping Section
    console.log('Testing Future Shipping Section');
    
    const futureShippingHeader = page.locator('h2:has-text("Future Shipping")');
    await futureShippingHeader.scrollIntoViewIfNeeded();
    await expect(futureShippingHeader).toBeVisible();

    // Check for reorder option
    const reorderOption = page.locator('text=Repeat This Shipment');
    await expect(reorderOption).toBeVisible();

    // Check for templates section
    const templatesSection = page.locator('text=Shipment Templates');
    await expect(templatesSection).toBeVisible();

    // Check for saved addresses
    const addressesSection = page.locator('text=Saved Addresses');
    await expect(addressesSection).toBeVisible();

    // Test customer engagement features
    const feedbackSection = page.locator('text=Share Feedback');
    await expect(feedbackSection).toBeVisible();

    const loyaltySection = page.locator('text=Loyalty Rewards');
    await expect(loyaltySection).toBeVisible();

    // Test feedback functionality
    const rateExperienceButton = page.locator('text=Rate Experience');
    if (await rateExperienceButton.isVisible()) {
      await rateExperienceButton.click();
      console.log('Opened feedback form');

      // Rate the experience
      const stars = page.locator('button:has(svg)').first();
      if (await stars.isVisible()) {
        await stars.click();
        console.log('Clicked star rating');
      }
    }

    console.log('Future Shipping Section test completed successfully');
  });

  test('should verify mobile responsiveness of new sections', async ({ page }) => {
    console.log('Testing mobile responsiveness of Task 9.3 sections');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/shipping/confirmation');
    await page.waitForLoadState('networkidle');

    // Test mobile layout of new sections
    console.log('Testing mobile layout of Next Steps section');
    const nextStepsSection = page.locator('h2:has-text("Next Steps")');
    await nextStepsSection.scrollIntoViewIfNeeded();
    await expect(nextStepsSection).toBeVisible();

    // Test touch interactions
    const packagePrepCategory = page.locator('text=Package Preparation');
    await packagePrepCategory.tap();
    console.log('Tapped Package Preparation category on mobile');

    // Test additional services mobile layout
    console.log('Testing mobile layout of Additional Services section');
    const additionalServicesHeader = page.locator('h2:has-text("Additional Services")');
    await additionalServicesHeader.scrollIntoViewIfNeeded();
    await expect(additionalServicesHeader).toBeVisible();

    // Test record keeping mobile layout
    console.log('Testing mobile layout of Record Keeping section');
    const recordKeepingHeader = page.locator('h2:has-text("Record Keeping")');
    await recordKeepingHeader.scrollIntoViewIfNeeded();
    await expect(recordKeepingHeader).toBeVisible();

    // Test future shipping mobile layout
    console.log('Testing mobile layout of Future Shipping section');
    const futureShippingHeader = page.locator('h2:has-text("Future Shipping")');
    await futureShippingHeader.scrollIntoViewIfNeeded();
    await expect(futureShippingHeader).toBeVisible();

    console.log('Mobile responsiveness test completed successfully');
  });

  test('should verify localStorage persistence for checklist progress', async ({ page }) => {
    console.log('Testing localStorage persistence for checklist progress');

    await page.goto('/shipping/confirmation');
    await page.waitForLoadState('networkidle');

    // Test checklist interaction and localStorage
    const packagePrepCategory = page.locator('text=Package Preparation');
    await packagePrepCategory.click();
    console.log('Expanded Package Preparation category');

    // Check an item
    const firstCheckbox = page.locator('button:has(svg[class*="Circle"])').first();
    await firstCheckbox.click();
    console.log('Checked first checklist item');

    // Verify localStorage persistence by refreshing page
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('Reloaded page to test persistence');

    // Verify the checked item is still checked
    await packagePrepCategory.click();
    const checkedItem = page.locator('button:has(svg[class*="CheckCircle"])').first();
    await expect(checkedItem).toBeVisible();
    console.log('Verified checklist progress persisted in localStorage');
  });
});
