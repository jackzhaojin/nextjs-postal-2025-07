import { test, expect } from '@playwright/test';

test.describe('Task 9.2: Tracking and Support Information', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Setting up test environment for tracking and support information');
    
    // Navigate to shipping form to create a test shipment
    await page.goto('/shipping');
    
    // Fill out basic shipping form
    await page.fill('[data-testid="origin-address"]', '123 Main St');
    await page.fill('[data-testid="origin-city"]', 'New York');
    await page.selectOption('[data-testid="origin-state"]', 'NY');
    await page.fill('[data-testid="origin-zip"]', '10001');
    
    await page.fill('[data-testid="destination-address"]', '456 Oak Ave');
    await page.fill('[data-testid="destination-city"]', 'Los Angeles');
    await page.selectOption('[data-testid="destination-state"]', 'CA');
    await page.fill('[data-testid="destination-zip"]', '90210');
    
    // Package details
    await page.selectOption('[data-testid="package-type"]', 'medium');
    await page.fill('[data-testid="package-weight"]', '10');
    await page.fill('[data-testid="declared-value"]', '500');
    
    // Submit and go through flow to confirmation
    await page.click('[data-testid="get-quote-button"]');
    await page.waitForSelector('[data-testid="pricing-options"]');
    await page.click('[data-testid="select-option-ground"]');
    await page.click('[data-testid="continue-to-pickup"]');
    
    // Skip pickup details for now - use defaults
    await page.click('[data-testid="continue-to-review"]');
    await page.click('[data-testid="submit-shipment"]');
    
    // Should now be on confirmation page
    await page.waitForSelector('[data-testid="confirmation-page"]');
  });

  test('should display tracking information section', async ({ page }) => {
    console.log('Testing tracking information display');
    
    // Check that tracking section exists and is visible
    await expect(page.locator('[data-testid="tracking-info-section"]')).toBeVisible();
    
    // Should show tracking number placeholder initially
    await expect(page.locator('[data-testid="tracking-number-placeholder"]')).toBeVisible();
    await expect(page.locator('text=Tracking number will be available after pickup')).toBeVisible();
    
    // Should show estimated availability time
    await expect(page.locator('[data-testid="tracking-availability-time"]')).toBeVisible();
    
    // Check status display
    await expect(page.locator('[data-testid="tracking-status"]')).toBeVisible();
    await expect(page.locator('text=PENDING')).toBeVisible();
    
    // Refresh button should be present
    await expect(page.locator('[data-testid="refresh-tracking-button"]')).toBeVisible();
  });

  test('should display notification preferences', async ({ page }) => {
    console.log('Testing notification preferences management');
    
    // Check email notification settings
    await expect(page.locator('[data-testid="email-notifications-toggle"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-address-input"]')).toBeVisible();
    
    // Check SMS notification settings
    await expect(page.locator('[data-testid="sms-notifications-toggle"]')).toBeVisible();
    
    // Test toggling SMS notifications
    await page.click('[data-testid="sms-notifications-toggle"]');
    await expect(page.locator('[data-testid="phone-number-input"]')).toBeVisible();
    
    // Test updating email frequency
    await page.selectOption('[data-testid="email-frequency-select"]', 'major');
    
    // Check push notification settings
    await expect(page.locator('[data-testid="push-notifications-toggle"]')).toBeVisible();
  });

  test('should display package documentation', async ({ page }) => {
    console.log('Testing package documentation display');
    
    // Check documentation section exists
    await expect(page.locator('[data-testid="package-documentation-section"]')).toBeVisible();
    
    // Should show shipping label information
    await expect(page.locator('[data-testid="shipping-label-info"]')).toBeVisible();
    await expect(page.locator('text=Shipping Label')).toBeVisible();
    
    // Should show required documents
    await expect(page.locator('[data-testid="required-documents"]')).toBeVisible();
    await expect(page.locator('text=Packing List')).toBeVisible();
    await expect(page.locator('text=Bill of Lading')).toBeVisible();
    
    // Download buttons should be present
    await expect(page.locator('[data-testid="download-packing-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-bill-of-lading"]')).toBeVisible();
    
    // Test label generation
    await page.click('[data-testid="generate-label-button"]');
    await expect(page.locator('text=Generating...')).toBeVisible();
  });

  test('should handle international shipment documentation', async ({ page }) => {
    console.log('Testing international shipment documentation');
    
    // Go back and create international shipment
    await page.goto('/shipping');
    
    // Fill domestic origin
    await page.fill('[data-testid="origin-address"]', '123 Main St');
    await page.fill('[data-testid="origin-city"]', 'New York');
    await page.selectOption('[data-testid="origin-state"]', 'NY');
    await page.fill('[data-testid="origin-zip"]', '10001');
    await page.selectOption('[data-testid="origin-country"]', 'US');
    
    // Fill international destination
    await page.fill('[data-testid="destination-address"]', '789 Queen St');
    await page.fill('[data-testid="destination-city"]', 'Toronto');
    await page.fill('[data-testid="destination-state"]', 'ON');
    await page.fill('[data-testid="destination-zip"]', 'M5H 2N2');
    await page.selectOption('[data-testid="destination-country"]', 'CA');
    
    // Complete flow to confirmation
    await page.fill('[data-testid="package-weight"]', '5');
    await page.fill('[data-testid="declared-value"]', '200');
    await page.click('[data-testid="get-quote-button"]');
    await page.waitForSelector('[data-testid="pricing-options"]');
    await page.click('[data-testid="select-option-ground"]');
    await page.click('[data-testid="continue-to-pickup"]');
    await page.click('[data-testid="continue-to-review"]');
    await page.click('[data-testid="submit-shipment"]');
    
    // Check for customs documents
    await expect(page.locator('[data-testid="customs-documents"]')).toBeVisible();
    await expect(page.locator('text=Commercial Invoice')).toBeVisible();
    await expect(page.locator('text=Customs Declaration')).toBeVisible();
    
    // Should show international shipping alert
    await expect(page.locator('text=International shipment detected')).toBeVisible();
  });

  test('should handle hazmat shipment documentation', async ({ page }) => {
    console.log('Testing hazmat shipment documentation');
    
    // Go back and create hazmat shipment
    await page.goto('/shipping');
    
    // Fill basic details
    await page.fill('[data-testid="origin-address"]', '123 Main St');
    await page.fill('[data-testid="origin-city"]', 'New York');
    await page.selectOption('[data-testid="origin-state"]', 'NY');
    await page.fill('[data-testid="origin-zip"]', '10001');
    
    await page.fill('[data-testid="destination-address"]', '456 Oak Ave');
    await page.fill('[data-testid="destination-city"]', 'Los Angeles');
    await page.selectOption('[data-testid="destination-state"]', 'CA');
    await page.fill('[data-testid="destination-zip"]', '90210');
    
    // Select hazmat handling
    await page.check('[data-testid="special-handling-hazmat"]');
    
    await page.fill('[data-testid="package-weight"]', '5');
    await page.fill('[data-testid="declared-value"]', '300');
    await page.click('[data-testid="get-quote-button"]');
    await page.waitForSelector('[data-testid="pricing-options"]');
    await page.click('[data-testid="select-option-ground"]');
    await page.click('[data-testid="continue-to-pickup"]');
    await page.click('[data-testid="continue-to-review"]');
    await page.click('[data-testid="submit-shipment"]');
    
    // Check for compliance documents
    await expect(page.locator('[data-testid="compliance-documents"]')).toBeVisible();
    await expect(page.locator('text=Dangerous Goods Declaration')).toBeVisible();
    
    // Should show compliance alert
    await expect(page.locator('text=required for regulatory compliance')).toBeVisible();
  });

  test('should display customer support information', async ({ page }) => {
    console.log('Testing customer support information display');
    
    // Check support section exists
    await expect(page.locator('[data-testid="customer-support-section"]')).toBeVisible();
    
    // Primary support should be displayed
    await expect(page.locator('[data-testid="primary-support"]')).toBeVisible();
    await expect(page.locator('text=1-800-SHIP-NOW')).toBeVisible();
    
    // Should show availability status
    await expect(page.locator('[data-testid="support-availability"]')).toBeVisible();
    
    // Specialized support channels
    await expect(page.locator('[data-testid="specialized-support"]')).toBeVisible();
    await expect(page.locator('text=Claims Department')).toBeVisible();
    await expect(page.locator('text=Regulatory Compliance')).toBeVisible();
    await expect(page.locator('text=Billing Support')).toBeVisible();
    await expect(page.locator('text=Technical Support')).toBeVisible();
    
    // Self-service resources
    await expect(page.locator('[data-testid="self-service-resources"]')).toBeVisible();
    await expect(page.locator('text=Knowledge Base')).toBeVisible();
    await expect(page.locator('text=Frequently Asked Questions')).toBeVisible();
    
    // Support tips
    await expect(page.locator('[data-testid="support-tips"]')).toBeVisible();
    await expect(page.locator('text=Have your confirmation number ready')).toBeVisible();
  });

  test('should handle high-value shipment features', async ({ page }) => {
    console.log('Testing high-value shipment features');
    
    // Go back and create high-value shipment
    await page.goto('/shipping');
    
    await page.fill('[data-testid="origin-address"]', '123 Main St');
    await page.fill('[data-testid="origin-city"]', 'New York');
    await page.selectOption('[data-testid="origin-state"]', 'NY');
    await page.fill('[data-testid="origin-zip"]', '10001');
    
    await page.fill('[data-testid="destination-address"]', '456 Oak Ave');
    await page.fill('[data-testid="destination-city"]', 'Los Angeles');
    await page.selectOption('[data-testid="destination-state"]', 'CA');
    await page.fill('[data-testid="destination-zip"]', '90210');
    
    // High declared value
    await page.fill('[data-testid="package-weight"]', '10');
    await page.fill('[data-testid="declared-value"]', '15000');
    
    await page.click('[data-testid="get-quote-button"]');
    await page.waitForSelector('[data-testid="pricing-options"]');
    await page.click('[data-testid="select-option-ground"]');
    await page.click('[data-testid="continue-to-pickup"]');
    await page.click('[data-testid="continue-to-review"]');
    await page.click('[data-testid="submit-shipment"]');
    
    // Should show account manager for enterprise customer
    await expect(page.locator('[data-testid="account-manager"]')).toBeVisible();
    await expect(page.locator('text=Your Account Manager')).toBeVisible();
    
    // Should show insurance documentation
    await expect(page.locator('text=Insurance Certificate')).toBeVisible();
  });

  test('should test tracking refresh functionality', async ({ page }) => {
    console.log('Testing tracking refresh functionality');
    
    // Click refresh button
    await page.click('[data-testid="refresh-tracking-button"]');
    
    // Should show loading state
    await expect(page.locator('[data-testid="refresh-tracking-button"] .animate-spin')).toBeVisible();
    
    // Wait for refresh to complete
    await page.waitForTimeout(2000);
    
    // Should return to normal state
    await expect(page.locator('[data-testid="refresh-tracking-button"] .animate-spin')).not.toBeVisible();
  });

  test('should test document download functionality', async ({ page }) => {
    console.log('Testing document download functionality');
    
    // Start download
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="download-packing-list"]');
    
    // Should show loading state
    await expect(page.locator('[data-testid="download-packing-list"] .animate-spin')).toBeVisible();
    
    // Wait for download to complete
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('Packing List.pdf');
  });

  test('should be mobile responsive', async ({ page }) => {
    console.log('Testing mobile responsiveness');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // All main sections should still be visible
    await expect(page.locator('[data-testid="tracking-info-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="package-documentation-section"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-support-section"]')).toBeVisible();
    
    // Touch-friendly button sizes
    const buttonHeight = await page.locator('[data-testid="refresh-tracking-button"]').evaluate(el => getComputedStyle(el).height);
    expect(parseInt(buttonHeight)).toBeGreaterThanOrEqual(44); // 44px minimum touch target
  });

  test('should display proper logging for debugging', async ({ page }) => {
    console.log('Testing logging and debugging features');
    
    // Check console logs
    const logs: string[] = [];
    page.on('console', msg => logs.push(msg.text()));
    
    // Trigger tracking refresh
    await page.click('[data-testid="refresh-tracking-button"]');
    
    // Should have comprehensive logging
    expect(logs.some(log => log.includes('TrackingInfoSection'))).toBe(true);
    expect(logs.some(log => log.includes('Refreshing tracking information'))).toBe(true);
  });
});
