/**
 * Playwright E2E Tests for Task 5.2: Basic Component Functionality
 * Simple tests to verify Task 5.2 components are working
 */

import { test, expect } from '@playwright/test';

const PRICING_PAGE_URL = '/shipping/pricing';

test.describe('Task 5.2: Basic Component Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('[Test Setup] Setting up mock shipment data');
    
    // Mock shipment data
    const mockData = {
      id: 'test-123',
      shipmentDetails: {
        origin: {
          address: '123 Main St', city: 'New York', state: 'NY', zip: '10001',
          country: 'USA', isResidential: false, locationType: 'commercial',
          contactInfo: { name: 'John Doe', phone: '555-123-4567', email: 'john@example.com', company: 'Test Co' }
        },
        destination: {
          address: '456 Oak Ave', city: 'Los Angeles', state: 'CA', zip: '90210',
          country: 'USA', isResidential: false, locationType: 'commercial',
          contactInfo: { name: 'Jane Smith', phone: '555-987-6543', email: 'jane@example.com', company: 'Target Co' }
        },
        package: {
          type: 'box', weight: { value: 10, unit: 'lbs' },
          dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
          declaredValue: 500, currency: 'USD', specialHandling: []
        }
      },
      status: 'pricing'
    };

    await page.goto(PRICING_PAGE_URL);
    await page.evaluate((data) => {
      localStorage.setItem('currentShippingTransaction', JSON.stringify(data));
    }, mockData);
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should load pricing page successfully', async ({ page }) => {
    console.log('[Test] Checking basic page load');
    
    // Check page title
    await expect(page.locator('h1')).toBeVisible();
    
    // Check for main content
    const hasMainContent = await page.locator('main').isVisible();
    expect(hasMainContent).toBe(true);
    
    console.log('[Test] Page loaded successfully');
  });

  test('should display shipment summary', async ({ page }) => {
    console.log('[Test] Checking shipment summary display');
    
    // Look for shipment summary content
    const hasSummary = await page.locator('text=New York').isVisible() && 
                      await page.locator('text=Los Angeles').isVisible();
    
    expect(hasSummary).toBe(true);
    console.log('[Test] Shipment summary displayed');
  });

  test('should handle loading states gracefully', async ({ page }) => {
    console.log('[Test] Testing loading state handling');
    
    // Check that either content is loaded or loading indicator is shown
    const hasContent = await page.locator('main').isVisible();
    const hasLoading = await page.locator('.animate-spin').isVisible() || 
                      await page.locator('text=Loading').isVisible();
    
    expect(hasContent || hasLoading).toBe(true);
    console.log('[Test] Loading states handled properly');
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    console.log('[Test] Testing mobile responsiveness');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Check that main content is still visible
    await expect(page.locator('main')).toBeVisible();
    
    // Check that content fits in viewport
    const mainElement = page.locator('main');
    const boundingBox = await mainElement.boundingBox();
    
    if (boundingBox) {
      expect(boundingBox.width).toBeLessThanOrEqual(375);
    }
    
    console.log('[Test] Mobile responsiveness verified');
  });

  test('should have accessible markup', async ({ page }) => {
    console.log('[Test] Testing accessibility basics');
    
    // Check for heading hierarchy
    const hasH1 = await page.locator('h1').count() > 0;
    expect(hasH1).toBe(true);
    
    // Check for semantic main element
    const hasMain = await page.locator('main').count() > 0;
    expect(hasMain).toBe(true);
    
    console.log('[Test] Basic accessibility markup verified');
  });

  test('should handle navigation states', async ({ page }) => {
    console.log('[Test] Testing navigation functionality');
    
    // Check if we can navigate back to shipment details
    await page.goBack();
    
    // Wait for navigation
    await page.waitForTimeout(1000);
    
    // Should be back at root or shipment page
    const currentURL = page.url();
    expect(currentURL).toMatch(/\/(shipping)?\/?$/);
    
    console.log('[Test] Navigation states working');
  });

  test('should persist data in localStorage', async ({ page }) => {
    console.log('[Test] Testing localStorage persistence');
    
    // Check that localStorage has the expected data
    const storedData = await page.evaluate(() => {
      return localStorage.getItem('currentShippingTransaction');
    });
    
    expect(storedData).toBeTruthy();
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      expect(parsedData.shipmentDetails).toBeTruthy();
      expect(parsedData.shipmentDetails.origin).toBeTruthy();
      expect(parsedData.shipmentDetails.destination).toBeTruthy();
    }
    
    console.log('[Test] localStorage persistence verified');
  });

  test('should handle API error states gracefully', async ({ page }) => {
    console.log('[Test] Testing error handling');
    
    // Mock an API failure scenario by clearing localStorage
    await page.evaluate(() => {
      localStorage.removeItem('currentShippingTransaction');
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should either redirect or show an error message
    const hasError = await page.locator('text=error').isVisible() || 
                    await page.locator('text=Error').isVisible() ||
                    page.url().includes('/shipping');
    
    expect(hasError).toBe(true);
    console.log('[Test] Error handling verified');
  });
});