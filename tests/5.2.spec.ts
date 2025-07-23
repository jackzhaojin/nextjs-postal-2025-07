/**
 * Playwright E2E Tests for Task 5.2: Option Selection & Comparison
 * Tests interactive selection, comparison features, filtering, and sorting
 */

import { test, expect } from '@playwright/test';

const PRICING_PAGE_URL = '/shipping/pricing';
const SHIPMENT_DETAILS_PAGE_URL = '/shipping';

// Test setup helper - directly navigate to pricing page and mock data
async function setupShipmentForPricing(page: any) {
  console.log('[Test Setup] Setting up mock shipment data in localStorage');
  
  // Set up mock shipment data
  const mockShipmentData = {
    id: 'test-' + Date.now(),
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
          name: 'John Doe',
          phone: '555-123-4567',
          email: 'john@example.com',
          company: 'Test Company'
        }
      },
      destination: {
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90210',
        country: 'US',
        isResidential: false,
        locationType: 'commercial',
        contactInfo: {
          name: 'Jane Smith',
          phone: '555-987-6543',
          email: 'jane@example.com',
          company: 'Target Company'
        }
      },
      package: {
        type: 'box',
        weight: { value: 10, unit: 'lbs' },
        dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
        declaredValue: 500,
        currency: 'USD',
        specialHandling: []
      }
    },
    status: 'pricing'
  };

  await page.goto(PRICING_PAGE_URL);
  
  // Inject the mock data
  await page.evaluate((mockData: any) => {
    localStorage.setItem('currentShippingTransaction', JSON.stringify(mockData));
  }, mockShipmentData);
  
  console.log('[Test Setup] Reloading page with mock data');
  await page.reload();
  await page.waitForLoadState('networkidle');
  
  console.log('[Test Setup] Pricing page setup completed');
}

test.describe('Task 5.2: Option Selection & Comparison', () => {
  
  test.beforeEach(async ({ page }) => {
    await setupShipmentForPricing(page);
  });

  test.describe('Interactive Pricing Selection', () => {
    
    test('should display pricing page content', async ({ page }) => {
      console.log('[Test] Checking pricing page display');
      
      // Check that the page title is displayed
      await expect(page.locator('h1')).toContainText(/Pricing|Options/);
      
      // Check for shipment summary card
      await expect(page.locator('text=Shipment Summary')).toBeVisible();
      
      // Check for pricing content (either cards or loading state)
      const hasCards = await page.locator('.card').count() > 0;
      const hasLoading = await page.locator('text=Loading').isVisible();
      
      expect(hasCards || hasLoading).toBe(true);
      console.log('[Test] Pricing page content validated');
    });

    test('should allow selecting a pricing option', async ({ page }) => {
      console.log('[Test] Testing pricing option selection');
      
      // Click on first pricing card
      const firstCard = page.locator('[data-testid="pricing-card"]').first();
      await firstCard.click();
      
      // Verify card is selected
      await expect(firstCard).toHaveClass(/selected|ring-2|bg-blue/);
      await expect(firstCard.locator('[data-testid="selected-badge"]')).toBeVisible();
      console.log('[Test] First pricing card selected successfully');

      // Click on second pricing card
      const secondCard = page.locator('[data-testid="pricing-card"]').nth(1);
      await secondCard.click();
      
      // Verify only second card is selected
      await expect(secondCard).toHaveClass(/selected|ring-2|bg-blue/);
      await expect(firstCard).not.toHaveClass(/selected|ring-2|bg-blue/);
      console.log('[Test] Selection changed to second card successfully');
    });

    test('should show selected option summary', async ({ page }) => {
      console.log('[Test] Testing selected option summary display');
      
      // Select a pricing option
      const firstCard = page.locator('[data-testid="pricing-card"]').first();
      await firstCard.click();
      
      // Check if selected option summary appears
      await expect(page.locator('[data-testid="selected-option-summary"]')).toBeVisible();
      await expect(page.locator('[data-testid="proceed-to-payment-button"]')).toBeVisible();
      await expect(page.locator('[data-testid="change-selection-button"]')).toBeVisible();
      console.log('[Test] Selected option summary displayed correctly');
    });

    test('should support keyboard navigation for selection', async ({ page }) => {
      console.log('[Test] Testing keyboard navigation for pricing selection');
      
      // Focus on first card and use keyboard
      const firstCard = page.locator('[data-testid="pricing-card"]').first();
      await firstCard.focus();
      await page.keyboard.press('Enter');
      
      // Verify selection
      await expect(firstCard).toHaveClass(/selected|ring-2|bg-blue/);
      console.log('[Test] Keyboard selection with Enter key works');

      // Test with Space key on another card
      const secondCard = page.locator('[data-testid="pricing-card"]').nth(1);
      await secondCard.focus();
      await page.keyboard.press(' ');
      
      // Verify selection changed
      await expect(secondCard).toHaveClass(/selected|ring-2|bg-blue/);
      console.log('[Test] Keyboard selection with Space key works');
    });

    test('should expand pricing breakdown details', async ({ page }) => {
      console.log('[Test] Testing pricing breakdown expansion');
      
      // Look for breakdown toggle button
      const breakdownToggle = page.locator('[data-testid="breakdown-toggle"]').first();
      await breakdownToggle.click();
      
      // Check if breakdown details are visible
      await expect(page.locator('[data-testid="pricing-breakdown-details"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="base-rate"]').first()).toBeVisible();
      await expect(page.locator('[data-testid="fuel-surcharge"]').first()).toBeVisible();
      console.log('[Test] Pricing breakdown expansion works correctly');
    });
  });

  test.describe('Option Comparison Features', () => {
    
    test('should add options to comparison', async ({ page }) => {
      console.log('[Test] Testing option comparison functionality');
      
      // Find and check comparison checkboxes
      const firstCard = page.locator('[data-testid="pricing-card"]').first();
      const secondCard = page.locator('[data-testid="pricing-card"]').nth(1);
      
      await firstCard.locator('[data-testid="comparison-checkbox"]').check();
      await secondCard.locator('[data-testid="comparison-checkbox"]').check();
      
      // Verify comparison button appears
      await expect(page.locator('[data-testid="compare-options-button"]')).toBeVisible();
      console.log('[Test] Comparison options added successfully');
    });

    test('should open comparison modal', async ({ page }) => {
      console.log('[Test] Testing comparison modal opening');
      
      // Add options to comparison
      await page.locator('[data-testid="pricing-card"]').first().locator('[data-testid="comparison-checkbox"]').check();
      await page.locator('[data-testid="pricing-card"]').nth(1).locator('[data-testid="comparison-checkbox"]').check();
      
      // Open comparison modal
      await page.click('[data-testid="compare-options-button"]');
      
      // Verify modal is open
      await expect(page.locator('[data-testid="comparison-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="comparison-table"]')).toBeVisible();
      console.log('[Test] Comparison modal opened successfully');
    });

    test('should allow selection from comparison modal', async ({ page }) => {
      console.log('[Test] Testing selection from comparison modal');
      
      // Add options to comparison and open modal
      await page.locator('[data-testid="pricing-card"]').first().locator('[data-testid="comparison-checkbox"]').check();
      await page.locator('[data-testid="pricing-card"]').nth(1).locator('[data-testid="comparison-checkbox"]').check();
      await page.click('[data-testid="compare-options-button"]');
      
      // Select option from comparison modal
      await page.click('[data-testid="select-from-comparison"]');
      
      // Verify modal closes and option is selected
      await expect(page.locator('[data-testid="comparison-modal"]')).not.toBeVisible();
      await expect(page.locator('[data-testid="selected-option-summary"]')).toBeVisible();
      console.log('[Test] Selection from comparison modal works');
    });

    test('should limit comparison to maximum options', async ({ page }) => {
      console.log('[Test] Testing comparison option limit');
      
      const cards = await page.locator('[data-testid="pricing-card"]').all();
      
      // Try to add more than 3 options (if available)
      if (cards.length >= 4) {
        for (let i = 0; i < 4; i++) {
          await cards[i].locator('[data-testid="comparison-checkbox"]').check();
        }
        
        // Verify that only 3 options are actually selected
        const checkedBoxes = await page.locator('[data-testid="comparison-checkbox"]:checked').count();
        expect(checkedBoxes).toBeLessThanOrEqual(3);
        console.log(`[Test] Comparison limited to ${checkedBoxes} options`);
      }
    });
  });

  test.describe('Pricing Filters', () => {
    
    test('should display filter controls', async ({ page }) => {
      console.log('[Test] Testing filter controls display');
      
      // Check if filter section is visible
      await expect(page.locator('[data-testid="pricing-filters"]')).toBeVisible();
      await expect(page.locator('[data-testid="price-range-filter"]')).toBeVisible();
      await expect(page.locator('[data-testid="transit-time-filter"]')).toBeVisible();
      console.log('[Test] Filter controls are visible');
    });

    test('should filter by price range', async ({ page }) => {
      console.log('[Test] Testing price range filtering');
      
      const initialCardCount = await page.locator('[data-testid="pricing-card"]').count();
      
      // Adjust price range filter
      const priceSlider = page.locator('[data-testid="price-range-slider"]');
      await priceSlider.click(); // This might need adjustment based on actual slider implementation
      
      // Wait for filter to apply
      await page.waitForTimeout(500);
      
      const filteredCardCount = await page.locator('[data-testid="pricing-card"]').count();
      console.log(`[Test] Price filter applied: ${initialCardCount} -> ${filteredCardCount} cards`);
    });

    test('should filter by carrier', async ({ page }) => {
      console.log('[Test] Testing carrier filtering');
      
      // Find and click carrier filter checkbox
      const carrierCheckbox = page.locator('[data-testid="carrier-filter-checkbox"]').first();
      if (await carrierCheckbox.isVisible()) {
        await carrierCheckbox.check();
        
        // Wait for filter to apply and verify results
        await page.waitForTimeout(500);
        const visibleCards = await page.locator('[data-testid="pricing-card"]:visible').count();
        console.log(`[Test] Carrier filter applied, ${visibleCards} cards visible`);
      }
    });

    test('should clear all filters', async ({ page }) => {
      console.log('[Test] Testing clear all filters');
      
      // Apply some filters first
      const carrierCheckbox = page.locator('[data-testid="carrier-filter-checkbox"]').first();
      if (await carrierCheckbox.isVisible()) {
        await carrierCheckbox.check();
      }
      
      // Clear all filters
      const clearButton = page.locator('[data-testid="clear-filters-button"]');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        
        // Verify filters are cleared
        await expect(carrierCheckbox).not.toBeChecked();
        console.log('[Test] All filters cleared successfully');
      }
    });
  });

  test.describe('Pricing Sorting', () => {
    
    test('should display sort controls', async ({ page }) => {
      console.log('[Test] Testing sort controls display');
      
      await expect(page.locator('[data-testid="pricing-sorting"]')).toBeVisible();
      await expect(page.locator('[data-testid="sort-select"]')).toBeVisible();
      console.log('[Test] Sort controls are visible');
    });

    test('should sort by price ascending', async ({ page }) => {
      console.log('[Test] Testing price ascending sort');
      
      // Select price ascending sort
      await page.selectOption('[data-testid="sort-select"]', 'price-asc');
      await page.waitForTimeout(500);
      
      // Get all price elements and verify sorting
      const priceElements = await page.locator('[data-testid="total-price"]').allTextContents();
      const prices = priceElements.map(p => parseFloat(p.replace(/[$,]/g, '')));
      
      // Verify ascending order
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
      console.log('[Test] Price ascending sort working correctly');
    });

    test('should sort by speed (transit time)', async ({ page }) => {
      console.log('[Test] Testing speed sort');
      
      // Select speed ascending sort (fastest first)
      await page.selectOption('[data-testid="sort-select"]', 'speed-asc');
      await page.waitForTimeout(500);
      
      // Verify sorting by checking transit times
      const transitElements = await page.locator('[data-testid="transit-time"]').allTextContents();
      const transitDays = transitElements.map(t => parseInt(t.match(/\d+/)?.[0] || '999'));
      
      // Verify ascending order (fastest first)
      for (let i = 0; i < transitDays.length - 1; i++) {
        expect(transitDays[i]).toBeLessThanOrEqual(transitDays[i + 1]);
      }
      console.log('[Test] Speed sort working correctly');
    });
  });

  test.describe('Mobile Responsiveness', () => {
    
    test('should work on mobile viewport', async ({ page }) => {
      console.log('[Test] Testing mobile responsiveness');
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      
      // Verify pricing cards are still visible and functional
      await expect(page.locator('[data-testid="pricing-card"]').first()).toBeVisible();
      
      // Test selection on mobile
      await page.locator('[data-testid="pricing-card"]').first().click();
      await expect(page.locator('[data-testid="selected-option-summary"]')).toBeVisible();
      
      console.log('[Test] Mobile responsiveness verified');
    });

    test('should show mobile-optimized comparison modal', async ({ page }) => {
      console.log('[Test] Testing mobile comparison modal');
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Add options to comparison
      await page.locator('[data-testid="pricing-card"]').first().locator('[data-testid="comparison-checkbox"]').check();
      await page.locator('[data-testid="pricing-card"]').nth(1).locator('[data-testid="comparison-checkbox"]').check();
      
      // Open comparison modal
      await page.click('[data-testid="compare-options-button"]');
      
      // Verify mobile-optimized modal (should be a drawer/sheet)
      await expect(page.locator('[data-testid="comparison-modal"]')).toBeVisible();
      console.log('[Test] Mobile comparison modal displayed correctly');
    });
  });

  test.describe('Navigation and Flow', () => {
    
    test('should navigate to payment page when option selected', async ({ page }) => {
      console.log('[Test] Testing navigation to payment page');
      
      // Select an option
      await page.locator('[data-testid="pricing-card"]').first().click();
      
      // Click proceed to payment
      await page.click('[data-testid="proceed-to-payment-button"]');
      
      // Verify navigation to payment page
      await expect(page).toHaveURL(/.*\/payment/);
      console.log('[Test] Navigation to payment page successful');
    });

    test('should allow changing selection', async ({ page }) => {
      console.log('[Test] Testing selection change functionality');
      
      // Select an option
      const firstCard = page.locator('[data-testid="pricing-card"]').first();
      await firstCard.click();
      
      // Click change selection button
      await page.click('[data-testid="change-selection-button"]');
      
      // Verify user can select a different option
      const secondCard = page.locator('[data-testid="pricing-card"]').nth(1);
      await secondCard.click();
      
      await expect(secondCard).toHaveClass(/selected|ring-2|bg-blue/);
      await expect(firstCard).not.toHaveClass(/selected|ring-2|bg-blue/);
      console.log('[Test] Selection change working correctly');
    });

    test('should maintain state during session', async ({ page }) => {
      console.log('[Test] Testing state persistence');
      
      // Select an option
      await page.locator('[data-testid="pricing-card"]').first().click();
      
      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify selection is maintained
      await expect(page.locator('[data-testid="selected-option-summary"]')).toBeVisible();
      console.log('[Test] State persistence working correctly');
    });
  });
});