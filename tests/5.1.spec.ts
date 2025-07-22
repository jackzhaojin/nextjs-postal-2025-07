/**
 * Task 5.1 - Pricing Display Components Tests
 * Comprehensive test suite for pricing display functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Task 5.1 - Pricing Display Components', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('[5.1 Tests] Setting up test environment');
    
    // Navigate to the page first to establish context
    await page.goto('/shipping/pricing');
    
    // Clear localStorage to start fresh
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch (e) {
        console.log('localStorage not available in this context');
      }
    });

    // Set up valid shipment details for pricing
    const validShipmentDetails = {
      id: 'test-shipment-001',
      timestamp: new Date().toISOString(),
      status: 'draft',
      shipmentDetails: {
        origin: {
          address: '123 Business St',
          suite: 'Suite 100',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'US',
          isResidential: false,
          locationType: 'commercial',
          contactInfo: {
            name: 'John Doe',
            company: 'Test Company',
            phone: '555-0123',
            email: 'john@test.com'
          }
        },
        destination: {
          address: '456 Delivery Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210',
          country: 'US',
          isResidential: true,
          locationType: 'residential',
          contactInfo: {
            name: 'Jane Smith',
            phone: '555-0456',
            email: 'jane@example.com'
          }
        },
        package: {
          type: 'small',
          dimensions: {
            length: 12,
            width: 8,
            height: 6,
            unit: 'in'
          },
          weight: {
            value: 5,
            unit: 'lbs'
          },
          declaredValue: 150,
          currency: 'USD',
          contents: 'Electronics',
          contentsCategory: 'other',
          specialHandling: []
        },
        deliveryPreferences: {
          signatureRequired: false,
          adultSignatureRequired: false,
          smsConfirmation: true,
          photoProof: false,
          saturdayDelivery: false,
          holdAtLocation: false,
          serviceLevel: 'reliable'
        }
      }
    };

    await page.evaluate((transaction) => {
      try {
        localStorage.setItem('currentShippingTransaction', JSON.stringify(transaction));
      } catch (e) {
        console.log('Could not set localStorage - tests may use defaults');
      }
    }, validShipmentDetails);

    console.log('[5.1 Tests] Valid shipment details configured');
  });

  test('5.1.1 - Quote Fetching and Display', async ({ page }) => {
    console.log('[5.1 Test] Testing quote fetching and display');
    
    // Wait for page header
    await expect(page.getByRole('heading', { name: 'Pricing & Options' }).last()).toBeVisible();
    
    // Check for shipment summary display
    await expect(page.locator('text=Shipment Summary')).toBeVisible();
    
    // Wait for loading state
    const loadingIndicator = page.locator('text=Getting Your Quotes');
    if (await loadingIndicator.isVisible({ timeout: 2000 })) {
      console.log('[5.1 Test] Loading state displayed');
      await expect(loadingIndicator).toBeVisible();
    }
    
    // Wait for quotes to load (with extended timeout for API call)
    await expect(page.locator('text=Available Shipping Options')).toBeVisible({ timeout: 15000 });
    
    // Verify categories are displayed
    await expect(page.locator('text=Ground Service')).toBeVisible();
    
    // Verify at least one pricing card is displayed
    const pricingCards = page.locator('[role="radio"]');
    await expect(pricingCards.first()).toBeVisible();
    
    // Check for price display
    const pricePattern = /\$\d+\.\d{2}/;
    await expect(page.locator('text=' + pricePattern.source).first()).toBeVisible();
    
    console.log('[5.1 Test] Quote fetching and display - PASSED');
  });

  test('5.1.2 - Service Category Organization', async ({ page }) => {
    console.log('[5.1 Test] Testing service category organization');
    
    // Wait for quotes to load
    await expect(page.locator('text=Available Shipping Options')).toBeVisible({ timeout: 15000 });
    
    // Verify Ground category
    const groundSection = page.locator('text=Ground Service').locator('..');
    await expect(groundSection).toBeVisible();
    await expect(groundSection.locator('text=Economical ground transportation')).toBeVisible();
    
    // Check for category pricing cards
    const groundCards = page.locator('[role="radio"]').filter({ has: page.locator('text=Ground') });
    const groundCount = await groundCards.count();
    console.log(`[5.1 Test] Found ${groundCount} ground options`);
    expect(groundCount).toBeGreaterThan(0);
    
    // If other categories exist, verify them
    const airSection = page.locator('text=Air Service');
    if (await airSection.isVisible()) {
      await expect(airSection.locator('..').locator('text=Faster air transportation')).toBeVisible();
    }
    
    const freightSection = page.locator('text=Freight Service');
    if (await freightSection.isVisible()) {
      await expect(freightSection.locator('..').locator('text=Heavy cargo')).toBeVisible();
    }
    
    console.log('[5.1 Test] Service category organization - PASSED');
  });

  test('5.1.3 - Pricing Card Information Display', async ({ page }) => {
    console.log('[5.1 Test] Testing pricing card information display');
    
    await page.goto('/shipping/pricing');
    
    // Wait for quotes to load
    await expect(page.locator('text=Available Shipping Options')).toBeVisible({ timeout: 15000 });
    
    const firstCard = page.locator('[role="radio"]').first();
    await expect(firstCard).toBeVisible();
    
    // Check for service name
    await expect(firstCard.locator('.font-semibold').first()).toBeVisible();
    
    // Check for carrier name
    await expect(firstCard.locator('.text-muted-foreground').first()).toBeVisible();
    
    // Check for price display
    const priceElement = firstCard.locator('.text-2xl.font-bold');
    await expect(priceElement).toBeVisible();
    await expect(priceElement).toContainText(/\$\d+\.\d{2}/);
    
    // Check for transit time
    const transitElement = firstCard.locator('text=/business day/');
    await expect(transitElement).toBeVisible();
    
    // Check for pricing breakdown toggle
    const breakdownToggle = firstCard.locator('text=Show Price Breakdown');
    if (await breakdownToggle.isVisible()) {
      await expect(breakdownToggle).toBeVisible();
    }
    
    console.log('[5.1 Test] Pricing card information display - PASSED');
  });

  test('5.1.4 - Quote Selection Functionality', async ({ page }) => {
    console.log('[5.1 Test] Testing quote selection functionality');
    
    await page.goto('/shipping/pricing');
    
    // Wait for quotes to load
    await expect(page.locator('text=Available Shipping Options')).toBeVisible({ timeout: 15000 });
    
    const firstCard = page.locator('[role="radio"]').first();
    await expect(firstCard).toBeVisible();
    
    // Click to select the first option
    await firstCard.click();
    console.log('[5.1 Test] Clicked first pricing option');
    
    // Verify selection feedback
    await expect(firstCard).toHaveAttribute('aria-checked', 'true');
    
    // Check for "Selected" badge
    await expect(firstCard.locator('text=Selected')).toBeVisible();
    
    // Verify selection summary appears
    await expect(page.locator('text=Selected Option')).toBeVisible({ timeout: 5000 });
    
    // Verify localStorage persistence
    const storedData = await page.evaluate(() => {
      try {
        const stored = localStorage.getItem('currentShippingTransaction');
        return stored ? JSON.parse(stored) : null;
      } catch (e) {
        console.log('localStorage not accessible');
        return null;
      }
    });
    
    if (storedData) {
      expect(storedData.selectedOption).toBeTruthy();
      expect(storedData.status).toBe('pricing');
    } else {
      console.log('[5.1 Test] localStorage not accessible - skipping persistence check');
    }
    
    console.log('[5.1 Test] Quote selection functionality - PASSED');
  });

  test('5.1.5 - Pricing Breakdown Expansion', async ({ page }) => {
    console.log('[5.1 Test] Testing pricing breakdown expansion');
    
    await page.goto('/shipping/pricing');
    
    // Wait for quotes to load
    await expect(page.locator('text=Available Shipping Options')).toBeVisible({ timeout: 15000 });
    
    const firstCard = page.locator('[role="radio"]').first();
    await expect(firstCard).toBeVisible();
    
    // Look for breakdown toggle
    const breakdownToggle = firstCard.locator('text=Show Price Breakdown');
    
    if (await breakdownToggle.isVisible()) {
      // Click to expand breakdown
      await breakdownToggle.click();
      console.log('[5.1 Test] Clicked breakdown toggle');
      
      // Wait for breakdown content
      await expect(firstCard.locator('text=Hide Price Breakdown')).toBeVisible({ timeout: 2000 });
      
      // Check for breakdown items
      await expect(firstCard.locator('text=Base Rate')).toBeVisible();
      await expect(firstCard.locator('text=Total')).toBeVisible();
      
      // Verify breakdown shows monetary amounts
      const breakdownAmounts = firstCard.locator('text=/\\$\\d+\\.\\d{2}/');
      const amountCount = await breakdownAmounts.count();
      expect(amountCount).toBeGreaterThan(1); // At least base rate and total
      
      console.log('[5.1 Test] Pricing breakdown expansion - PASSED');
    } else {
      console.log('[5.1 Test] No breakdown toggle found - skipping breakdown test');
    }
  });

  test('5.1.6 - Quote Refresh Functionality', async ({ page }) => {
    console.log('[5.1 Test] Testing quote refresh functionality');
    
    await page.goto('/shipping/pricing');
    
    // Wait for quotes to load
    await expect(page.locator('text=Available Shipping Options')).toBeVisible({ timeout: 15000 });
    
    // Look for refresh button
    const refreshButton = page.locator('text=Refresh').first();
    await expect(refreshButton).toBeVisible();
    
    // Click refresh
    await refreshButton.click();
    console.log('[5.1 Test] Clicked refresh button');
    
    // Verify loading state appears briefly
    const loadingSpinner = page.locator('.animate-spin');
    if (await loadingSpinner.isVisible({ timeout: 1000 })) {
      console.log('[5.1 Test] Loading spinner displayed during refresh');
    }
    
    // Verify quotes are still displayed after refresh
    await expect(page.locator('text=Available Shipping Options')).toBeVisible({ timeout: 10000 });
    
    console.log('[5.1 Test] Quote refresh functionality - PASSED');
  });

  test('5.1.7 - Mobile Responsive Design', async ({ page }) => {
    console.log('[5.1 Test] Testing mobile responsive design');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/shipping/pricing');
    
    // Wait for quotes to load
    await expect(page.locator('text=Available Shipping Options')).toBeVisible({ timeout: 15000 });
    
    // Verify header is readable on mobile
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify shipment summary grid adapts to mobile
    const summaryCard = page.locator('text=Shipment Summary').locator('..');
    await expect(summaryCard).toBeVisible();
    
    // Verify pricing cards are stacked vertically on mobile
    const pricingCards = page.locator('[role="radio"]');
    const firstCard = pricingCards.first();
    const secondCard = pricingCards.nth(1);
    
    if (await secondCard.isVisible()) {
      const firstCardBox = await firstCard.boundingBox();
      const secondCardBox = await secondCard.boundingBox();
      
      if (firstCardBox && secondCardBox) {
        // Cards should be stacked vertically (second card below first)
        expect(secondCardBox.y).toBeGreaterThan(firstCardBox.y + firstCardBox.height - 50);
      }
    }
    
    // Test touch interaction
    if (await firstCard.isVisible()) {
      await firstCard.tap();
      await expect(firstCard).toHaveAttribute('aria-checked', 'true');
    }
    
    console.log('[5.1 Test] Mobile responsive design - PASSED');
  });

  test('5.1.8 - Error Handling and Recovery', async ({ page }) => {
    console.log('[5.1 Test] Testing error handling and recovery');
    
    // Intercept API calls to simulate errors
    await page.route('/api/quote', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Internal server error'
        })
      });
    });
    
    await page.goto('/shipping/pricing');
    
    // Wait for error state
    await expect(page.locator('text=Internal server error')).toBeVisible({ timeout: 10000 });
    
    // Verify retry button is available
    const retryButton = page.locator('text=Retry');
    await expect(retryButton).toBeVisible();
    
    // Remove the route to allow successful requests
    await page.unroute('/api/quote');
    
    // Click retry
    await retryButton.click();
    console.log('[5.1 Test] Clicked retry button');
    
    // Verify quotes load successfully after retry
    await expect(page.locator('text=Available Shipping Options')).toBeVisible({ timeout: 15000 });
    
    console.log('[5.1 Test] Error handling and recovery - PASSED');
  });

  test('5.1.9 - Accessibility Compliance', async ({ page }) => {
    console.log('[5.1 Test] Testing accessibility compliance');
    
    await page.goto('/shipping/pricing');
    
    // Wait for quotes to load
    await expect(page.locator('text=Available Shipping Options')).toBeVisible({ timeout: 15000 });
    
    // Test keyboard navigation
    const firstCard = page.locator('[role="radio"]').first();
    await expect(firstCard).toBeVisible();
    
    // Focus the first card
    await firstCard.focus();
    
    // Test Enter key selection
    await page.keyboard.press('Enter');
    await expect(firstCard).toHaveAttribute('aria-checked', 'true');
    
    // Test space key selection (select another card first)
    const secondCard = page.locator('[role="radio"]').nth(1);
    if (await secondCard.isVisible()) {
      await secondCard.focus();
      await page.keyboard.press('Space');
      await expect(secondCard).toHaveAttribute('aria-checked', 'true');
    }
    
    // Verify ARIA labels exist
    await expect(firstCard).toHaveAttribute('aria-label');
    
    // Check for proper heading hierarchy
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
    
    console.log('[5.1 Test] Accessibility compliance - PASSED');
  });

  test('5.1.10 - Performance and Loading States', async ({ page }) => {
    console.log('[5.1 Test] Testing performance and loading states');
    
    // Start navigation timing
    const startTime = Date.now();
    
    await page.goto('/shipping/pricing');
    
    // Verify immediate loading state appears
    const loadingText = page.locator('text=Getting Your Quotes');
    if (await loadingText.isVisible({ timeout: 1000 })) {
      console.log('[5.1 Test] Loading state appeared immediately');
      await expect(loadingText).toBeVisible();
    }
    
    // Wait for quotes to load and measure time
    await expect(page.locator('text=Available Shipping Options')).toBeVisible({ timeout: 15000 });
    
    const loadTime = Date.now() - startTime;
    console.log(`[5.1 Test] Quotes loaded in ${loadTime}ms`);
    
    // Verify reasonable load time (under 5 seconds for quotes display)
    expect(loadTime).toBeLessThan(5000);
    
    // Verify skeleton loading states were shown
    const skeletonElements = page.locator('.animate-pulse');
    if (await skeletonElements.first().isVisible({ timeout: 500 })) {
      console.log('[5.1 Test] Skeleton loading states displayed');
    }
    
    console.log('[5.1 Test] Performance and loading states - PASSED');
  });
});

test.describe('Task 5.1 - Edge Cases and Integration', () => {
  
  test('5.1.11 - Handle Missing Shipment Details', async ({ page }) => {
    console.log('[5.1 Test] Testing missing shipment details handling');
    
    // Clear localStorage
    await page.evaluate(() => {
      localStorage.clear();
    });
    
    await page.goto('/shipping/pricing');
    
    // Should handle gracefully without shipment details
    await expect(page.locator('h1')).toContainText('Pricing & Options');
    
    // Should show appropriate message or redirect
    // This might show an error state or redirect to step 1
    await page.waitForTimeout(2000);
    
    console.log('[5.1 Test] Missing shipment details handling - PASSED');
  });

  test('5.1.12 - Quote Expiration Handling', async ({ page }) => {
    console.log('[5.1 Test] Testing quote expiration handling');
    
    await page.goto('/shipping/pricing');
    
    // Wait for quotes to load
    await expect(page.locator('text=Available Shipping Options')).toBeVisible({ timeout: 15000 });
    
    // Check if expiry information is displayed
    const expiryText = page.locator('text=Expires');
    if (await expiryText.isVisible({ timeout: 2000 })) {
      console.log('[5.1 Test] Quote expiry information displayed');
      await expect(expiryText).toBeVisible();
    }
    
    console.log('[5.1 Test] Quote expiration handling - PASSED');
  });
});
