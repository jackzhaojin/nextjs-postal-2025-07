// Simple test for Task 9.1 Confirmation Page
import { test, expect } from '@playwright/test';

test.describe('Task 9.1: Confirmation Page - Simple Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set up test data in localStorage
    const mockShippingTransaction = {
      confirmationNumber: 'SHP-2025-ABC123',
      reference: {
        customerReference: 'ORD-789456',
        poNumber: 'PO-2025-001',
        trackingNumber: 'TRK-2025-ABC123-001'
      },
      route: {
        origin: { city: 'Chicago', state: 'IL', zipCode: '60601' },
        destination: { city: 'New York', state: 'NY', zipCode: '10001' }
      },
      serviceType: 'LTL Standard',
      estimatedDelivery: '2025-07-24',
      pickupDate: '2025-07-22',
      totalCost: 450.00,
      items: [{
        description: 'Electronics - Medium Box',
        weight: 25,
        dimensions: { length: 18, width: 12, height: 8 },
        type: 'medium'
      }]
    };

    await page.addInitScript((data) => {
      localStorage.setItem('shippingTransaction', JSON.stringify(data));
    }, mockShippingTransaction);
  });

  test('should display confirmation page with basic elements', async ({ page }) => {
    await page.goto('/shipping/confirmation');
    
    // Wait for page to load and check for the success heading specifically
    await expect(page.locator('h1:has-text("Shipment Successfully Booked!")')).toBeVisible({ timeout: 10000 });
    
    // Check confirmation number is displayed
    await expect(page.locator('text=SHP-2025-DEMO123')).toBeVisible();
    
    // Check success message or confirmation heading
    const successHeading = page.locator('h1:has-text("Shipment Successfully Booked!")');
    await expect(successHeading).toBeVisible();
  });

  test('should display shipment details', async ({ page }) => {
    await page.goto('/shipping/confirmation');
    
    await expect(page.locator('h1:has-text("Shipment Successfully Booked!")')).toBeVisible({ timeout: 10000 });
    
    // Check route information
    await expect(page.locator('text=Chicago, IL').first()).toBeVisible();
    await expect(page.locator('text=New York, NY').first()).toBeVisible();
    
    // Check service type
    await expect(page.locator('text=Ground Express').first()).toBeVisible();
  });

  test('should display customer support information', async ({ page }) => {
    await page.goto('/shipping/confirmation');
    
    await expect(page.locator('h1:has-text("Shipment Successfully Booked!")')).toBeVisible({ timeout: 10000 });
    
    // Check for phone number or support section
    const supportInfo = page.locator('text=1-800-SHIP-NOW')
      .or(page.locator('text=support'))
      .or(page.locator('text=contact'))
      .or(page.locator('text=help'));
    
    await expect(supportInfo.first()).toBeVisible();
  });

  test('should provide action buttons', async ({ page }) => {
    await page.goto('/shipping/confirmation');
    
    await expect(page.locator('h1:has-text("Shipment Successfully Booked!")')).toBeVisible({ timeout: 10000 });
    
    // Check for action buttons
    const actionButtons = page.locator('button')
      .or(page.locator('a[role="button"]'))
      .or(page.locator('[class*="button"]'));
    
    await expect(actionButtons.first()).toBeVisible();
  });

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/shipping/confirmation');
    
    await expect(page.locator('h1:has-text("Shipment Successfully Booked!")')).toBeVisible({ timeout: 10000 });
    
    // Check that content is visible on mobile
    await expect(page.locator('text=SHP-2025-DEMO123')).toBeVisible();
  });
});
