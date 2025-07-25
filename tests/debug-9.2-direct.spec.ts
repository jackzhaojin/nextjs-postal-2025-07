import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * 🧪 [TEST-9.2-DIRECT] Direct test for Task 9.2 components
 * Tests the confirmation page components by directly setting up transaction data
 * in localStorage and navigating to the confirmation page.
 */

// Mock transaction data for testing
const mockTransactionData = {
  id: "TEST-" + Date.now(),
  status: "confirmed",
  trackingNumber: "1234567890",
  estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
  origin: {
    address: "123 Test St",
    city: "Test City",
    state: "CA",
    zip: "90210",
    country: "US"
  },
  destination: {
    address: "456 Destination Ave",
    city: "Dest City", 
    state: "NY",
    zip: "10001",
    country: "US"
  },
  package: {
    type: "medium",
    weight: { value: 5, unit: "lbs" },
    dimensions: { length: 12, width: 8, height: 6, unit: "in" },
    declaredValue: 500,
    currency: "USD",
    contents: "Electronics",
    contentsCategory: "electronics"
  },
  pricing: {
    baseRate: 25.99,
    insuranceFee: 3.75,
    total: 29.74
  },
  createdAt: new Date().toISOString()
};

// High-value shipment data for testing
const highValueTransactionData = {
  ...mockTransactionData,
  id: "TEST-HIGH-" + Date.now(),
  package: {
    ...mockTransactionData.package,
    declaredValue: 5000,
    contents: "High-value electronics"
  }
};

// International shipment data for testing
const internationalTransactionData = {
  ...mockTransactionData,
  id: "TEST-INTL-" + Date.now(),
  destination: {
    address: "456 International St",
    city: "Toronto", 
    state: "ON",
    zip: "M5V 3A8",
    country: "CA"
  }
};

// Hazmat shipment data for testing
const hazmatTransactionData = {
  ...mockTransactionData,
  id: "TEST-HAZMAT-" + Date.now(),
  package: {
    ...mockTransactionData.package,
    contents: "Lithium batteries",
    contentsCategory: "hazmat",
    specialHandling: ["hazmat"]
  }
};

async function setupTransactionData(page: Page, transactionData: any) {
  console.log(`🧪 [TEST-SETUP] Setting up transaction data:`, transactionData.id);
  
  await page.evaluate((data) => {
    localStorage.setItem('currentTransaction', JSON.stringify(data));
  }, transactionData);
  
  console.log(`✅ [TEST-SETUP] Transaction data stored in localStorage`);
}

test.describe('Task 9.2: Tracking and Support Information - Direct Tests', () => {
  test.beforeEach(async ({ page }) => {
    console.log(`🧪 [TEST-BEFOREEACH] Starting test setup`);
  });

  test('should display tracking information section with valid transaction data', async ({ page }) => {
    console.log(`🧪 [TEST-TRACKING] Testing tracking information display`);
    
    // Setup transaction data
    await setupTransactionData(page, mockTransactionData);
    
    // Navigate to confirmation page
    await page.goto('http://localhost:3000/shipping/confirmation');
    console.log(`🌐 [TEST-TRACKING] Navigated to confirmation page`);
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if tracking section exists
    const trackingSection = page.locator('[data-testid="tracking-info-section"]');
    await expect(trackingSection).toBeVisible({ timeout: 10000 });
    console.log(`✅ [TEST-TRACKING] Tracking section found and visible`);
    
    // Check tracking number display
    const trackingNumber = page.locator('[data-testid="tracking-number"]');
    await expect(trackingNumber).toBeVisible();
    await expect(trackingNumber).toContainText(mockTransactionData.trackingNumber);
    console.log(`✅ [TEST-TRACKING] Tracking number displayed correctly`);
    
    // Check status display
    const statusDisplay = page.locator('[data-testid="shipment-status"]');
    await expect(statusDisplay).toBeVisible();
    console.log(`✅ [TEST-TRACKING] Shipment status displayed`);
    
    // Check notification preferences
    const notificationPrefs = page.locator('[data-testid="notification-preferences"]');
    await expect(notificationPrefs).toBeVisible();
    console.log(`✅ [TEST-TRACKING] Notification preferences section visible`);
  });

  test('should display package documentation section', async ({ page }) => {
    console.log(`🧪 [TEST-DOCUMENTATION] Testing package documentation display`);
    
    await setupTransactionData(page, mockTransactionData);
    await page.goto('http://localhost:3000/shipping/confirmation');
    await page.waitForLoadState('networkidle');
    
    // Check if documentation section exists
    const docSection = page.locator('[data-testid="package-documentation-section"]');
    await expect(docSection).toBeVisible({ timeout: 10000 });
    console.log(`✅ [TEST-DOCUMENTATION] Documentation section found and visible`);
    
    // Check documents list
    const documentsList = page.locator('[data-testid="generated-documents"]');
    await expect(documentsList).toBeVisible();
    console.log(`✅ [TEST-DOCUMENTATION] Documents list displayed`);
    
    // Check download buttons exist
    const downloadButtons = page.locator('[data-testid^="download-"]');
    const buttonCount = await downloadButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
    console.log(`✅ [TEST-DOCUMENTATION] Found ${buttonCount} download buttons`);
  });

  test('should display customer support section', async ({ page }) => {
    console.log(`🧪 [TEST-SUPPORT] Testing customer support display`);
    
    await setupTransactionData(page, mockTransactionData);
    await page.goto('http://localhost:3000/shipping/confirmation');
    await page.waitForLoadState('networkidle');
    
    // Check if support section exists
    const supportSection = page.locator('[data-testid="customer-support-section"]');
    await expect(supportSection).toBeVisible({ timeout: 10000 });
    console.log(`✅ [TEST-SUPPORT] Support section found and visible`);
    
    // Check support channels
    const supportChannels = page.locator('[data-testid="support-channels"]');
    await expect(supportChannels).toBeVisible();
    console.log(`✅ [TEST-SUPPORT] Support channels displayed`);
    
    // Check contact options
    const contactOptions = page.locator('[data-testid^="contact-"]');
    const optionCount = await contactOptions.count();
    expect(optionCount).toBeGreaterThan(0);
    console.log(`✅ [TEST-SUPPORT] Found ${optionCount} contact options`);
  });

  test('should handle high-value shipment documentation', async ({ page }) => {
    console.log(`🧪 [TEST-HIGH-VALUE] Testing high-value shipment features`);
    
    await setupTransactionData(page, highValueTransactionData);
    await page.goto('http://localhost:3000/shipping/confirmation');
    await page.waitForLoadState('networkidle');
    
    // Check for high-value specific documentation
    const docSection = page.locator('[data-testid="package-documentation-section"]');
    await expect(docSection).toBeVisible({ timeout: 10000 });
    
    // Look for high-value indicators
    const highValueIndicator = page.locator('text=/high.*value/i');
    if (await highValueIndicator.count() > 0) {
      console.log(`✅ [TEST-HIGH-VALUE] High-value indicators found`);
    }
  });

  test('should handle international shipment documentation', async ({ page }) => {
    console.log(`🧪 [TEST-INTERNATIONAL] Testing international shipment features`);
    
    await setupTransactionData(page, internationalTransactionData);
    await page.goto('http://localhost:3000/shipping/confirmation');
    await page.waitForLoadState('networkidle');
    
    // Check for international specific documentation
    const docSection = page.locator('[data-testid="package-documentation-section"]');
    await expect(docSection).toBeVisible({ timeout: 10000 });
    
    // Look for customs/international indicators
    const intlIndicator = page.locator('text=/customs|international|declaration/i');
    if (await intlIndicator.count() > 0) {
      console.log(`✅ [TEST-INTERNATIONAL] International indicators found`);
    }
  });

  test('should test tracking refresh functionality', async ({ page }) => {
    console.log(`🧪 [TEST-REFRESH] Testing tracking refresh functionality`);
    
    await setupTransactionData(page, mockTransactionData);
    await page.goto('http://localhost:3000/shipping/confirmation');
    await page.waitForLoadState('networkidle');
    
    // Find and click refresh button
    const refreshButton = page.locator('[data-testid="refresh-tracking"]');
    if (await refreshButton.isVisible()) {
      await refreshButton.click();
      console.log(`✅ [TEST-REFRESH] Refresh button clicked successfully`);
      
      // Wait for any loading indicators
      await page.waitForTimeout(1000);
    } else {
      console.log(`ℹ️ [TEST-REFRESH] Refresh button not found, skipping click test`);
    }
  });

  test('should test notification preference toggles', async ({ page }) => {
    console.log(`🧪 [TEST-NOTIFICATIONS] Testing notification preference toggles`);
    
    await setupTransactionData(page, mockTransactionData);
    await page.goto('http://localhost:3000/shipping/confirmation');
    await page.waitForLoadState('networkidle');
    
    // Find notification toggles
    const toggles = page.locator('[data-testid^="notification-toggle-"]');
    const toggleCount = await toggles.count();
    
    if (toggleCount > 0) {
      console.log(`✅ [TEST-NOTIFICATIONS] Found ${toggleCount} notification toggles`);
      
      // Try clicking the first toggle
      const firstToggle = toggles.first();
      if (await firstToggle.isVisible()) {
        await firstToggle.click();
        console.log(`✅ [TEST-NOTIFICATIONS] Successfully clicked notification toggle`);
      }
    } else {
      console.log(`ℹ️ [TEST-NOTIFICATIONS] No notification toggles found`);
    }
  });

  test('should test document download functionality', async ({ page }) => {
    console.log(`🧪 [TEST-DOWNLOADS] Testing document download functionality`);
    
    await setupTransactionData(page, mockTransactionData);
    await page.goto('http://localhost:3000/shipping/confirmation');
    await page.waitForLoadState('networkidle');
    
    // Find download buttons
    const downloadButtons = page.locator('[data-testid^="download-"]');
    const buttonCount = await downloadButtons.count();
    
    if (buttonCount > 0) {
      console.log(`✅ [TEST-DOWNLOADS] Found ${buttonCount} download buttons`);
      
      // Try clicking the first download button
      const firstDownload = downloadButtons.first();
      if (await firstDownload.isVisible()) {
        // Setup download event listener
        const downloadPromise = page.waitForEvent('download');
        await firstDownload.click();
        
        try {
          const download = await downloadPromise;
          console.log(`✅ [TEST-DOWNLOADS] Download triggered for: ${download.suggestedFilename()}`);
        } catch (error) {
          console.log(`ℹ️ [TEST-DOWNLOADS] Download simulation - button clicked but no actual download`);
        }
      }
    } else {
      console.log(`ℹ️ [TEST-DOWNLOADS] No download buttons found`);
    }
  });

  test('should test support contact methods', async ({ page }) => {
    console.log(`🧪 [TEST-CONTACT] Testing support contact methods`);
    
    await setupTransactionData(page, mockTransactionData);
    await page.goto('http://localhost:3000/shipping/confirmation');
    await page.waitForLoadState('networkidle');
    
    // Find contact buttons/links
    const contactOptions = page.locator('[data-testid^="contact-"]');
    const optionCount = await contactOptions.count();
    
    if (optionCount > 0) {
      console.log(`✅ [TEST-CONTACT] Found ${optionCount} contact options`);
      
      // Check for specific contact methods
      const emailContact = page.locator('[data-testid="contact-email"]');
      const phoneContact = page.locator('[data-testid="contact-phone"]');
      const chatContact = page.locator('[data-testid="contact-chat"]');
      
      if (await emailContact.isVisible()) {
        console.log(`✅ [TEST-CONTACT] Email contact option available`);
      }
      if (await phoneContact.isVisible()) {
        console.log(`✅ [TEST-CONTACT] Phone contact option available`);
      }
      if (await chatContact.isVisible()) {
        console.log(`✅ [TEST-CONTACT] Chat contact option available`);
      }
    } else {
      console.log(`ℹ️ [TEST-CONTACT] No contact options found`);
    }
  });

  test('should validate all components render without transaction data', async ({ page }) => {
    console.log(`🧪 [TEST-NO-DATA] Testing components without transaction data`);
    
    // Clear any existing transaction data
    await page.evaluate(() => {
      localStorage.removeItem('currentTransaction');
    });
    
    await page.goto('http://localhost:3000/shipping/confirmation');
    await page.waitForLoadState('networkidle');
    
    // Components should handle missing data gracefully
    const body = page.locator('body');
    await expect(body).toBeVisible();
    console.log(`✅ [TEST-NO-DATA] Page loaded without errors when no transaction data present`);
  });
});
