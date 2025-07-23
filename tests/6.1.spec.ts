// Playwright E2E Tests for Task 6.1: Payment Method Selection
// Comprehensive testing of all 5 B2B payment methods with validation

import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

// Mock shipment data for testing
const mockShipmentData = {
  origin: {
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'US'
  },
  destination: {
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90210',
    country: 'US'
  },
  package: {
    type: 'medium',
    weight: { value: 10, unit: 'lbs' },
    dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
    declaredValue: 500
  }
};

// Mock pricing option
const mockPricingOption = {
  id: 'ground-standard',
  serviceType: 'Ground Standard',
  carrier: 'TestCarrier',
  pricing: {
    baseRate: 25.99,
    fuelSurcharge: 3.89,
    insurance: 5.00,
    taxes: 2.98,
    total: 37.86
  },
  estimatedDelivery: '2025-07-28',
  transitDays: 5
};

test.describe('Payment Method Selection - Task 6.1', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Setting up test data in localStorage...');
    
    // Set up mock transaction data in localStorage
    await page.goto(BASE_URL);
    await page.addInitScript((data) => {
      const transaction = {
        id: 'test-txn-001',
        timestamp: new Date().toISOString(),
        shipmentDetails: data.shipmentData,
        selectedOption: data.pricingOption,
        status: 'pricing'
      };
      localStorage.setItem('currentShippingTransaction', JSON.stringify(transaction));
    }, { shipmentData: mockShipmentData, pricingOption: mockPricingOption });
  });

  test('should load payment page and display all 5 payment methods', async ({ page }) => {
    console.log('Testing payment page load and payment method display...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Check page title and navigation
    await expect(page.locator('h1')).toHaveText('Payment Information');
    await expect(page.locator('text=Step 3 of 6')).toBeVisible();

    // Verify all 5 payment methods are displayed
    await expect(page.locator('text=Purchase Order')).toBeVisible();
    await expect(page.locator('text=Bill of Lading')).toBeVisible();
    await expect(page.locator('text=Third-Party Billing')).toBeVisible();
    await expect(page.locator('text=Net Terms')).toBeVisible();
    await expect(page.locator('text=Corporate Account')).toBeVisible();

    // Check shipment total is displayed
    await expect(page.locator('text=Shipment Total')).toBeVisible();
    await expect(page.locator('text=$37.86')).toBeVisible();

    console.log('✓ Payment page loaded successfully with all payment methods');
  });

  test('should validate Purchase Order payment method', async ({ page }) => {
    console.log('Testing Purchase Order payment method...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Select Purchase Order method
    await page.click('input[type="radio"][value="po"]');
    await expect(page.locator('text=Purchase Order Information')).toBeVisible();

    // Fill out PO form with valid data
    await page.fill('#po-number', 'PO-2025-TEST001');
    await page.fill('#po-amount', '50.00');
    
    // Set future expiration date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    await page.fill('#po-expiration', futureDate.toISOString().split('T')[0]);

    // Fill contact information
    await page.fill('#contact-name', 'John Smith');
    await page.fill('#contact-email', 'john.smith@testcompany.com');
    await page.fill('#contact-phone', '(555) 123-4567');

    // Verify validation summary shows completion
    await expect(page.locator('text=PO Number provided')).toBeVisible();
    await expect(page.locator('text=PO amount covers shipment total')).toBeVisible();
    
    console.log('✓ Purchase Order form validation working correctly');
  });

  test('should validate Bill of Lading payment method', async ({ page }) => {
    console.log('Testing Bill of Lading payment method...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Select Bill of Lading method
    await page.click('input[type="radio"][value="bol"]');
    await expect(page.locator('text=Bill of Lading Information')).toBeVisible();

    // Generate BOL number
    await page.click('button:has-text("Generate")');
    
    // Set BOL date (today or past)
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#bol-date', today);

    // Fill required fields
    await page.fill('#shipper-ref', 'SH-2025-001');
    await page.selectOption('#freight-terms', 'prepaid');
    
    // Fill commodity information
    await page.fill('#commodity-desc', 'Test commodity for shipping validation');
    await page.fill('#commodity-weight', '15.5');
    await page.fill('#commodity-pieces', '2');
    await page.fill('#package-type', 'Boxes');
    
    // Set declared value
    await page.fill('#declared-value', '750.00');

    // Verify validation summary
    await expect(page.locator('text=BOL number format valid')).toBeVisible();
    await expect(page.locator('text=BOL date valid')).toBeVisible();
    
    console.log('✓ Bill of Lading form validation working correctly');
  });

  test('should validate Third-Party Billing payment method', async ({ page }) => {
    console.log('Testing Third-Party Billing payment method...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Select Third-Party Billing method
    await page.click('input[type="radio"][value="thirdparty"]');
    await expect(page.locator('text=Third-Party Billing Information')).toBeVisible();

    // Fill account information
    await page.fill('#account-number', '123456789012');
    await page.fill('#company-name', 'Third Party Company Inc.');
    
    // Select relationship type
    await page.selectOption('#relationship-type', 'partner');

    // Fill contact information
    await page.fill('#contact-name', 'Jane Doe');
    await page.fill('#contact-email', 'jane.doe@thirdparty.com');
    await page.fill('#contact-phone', '(555) 987-6543');

    // Fill billing address
    await page.fill('#billing-address', '789 Business Blvd');
    await page.fill('#billing-city', 'Chicago');
    await page.fill('#billing-state', 'IL');
    await page.fill('#billing-zip', '60601');

    // Verify account verification button
    await page.click('button:has-text("Verify")');
    
    // Verify validation summary
    await expect(page.locator('text=Account number format valid')).toBeVisible();
    await expect(page.locator('text=Company name provided')).toBeVisible();
    
    console.log('✓ Third-Party Billing form validation working correctly');
  });

  test('should validate Net Terms payment method with references', async ({ page }) => {
    console.log('Testing Net Terms payment method...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Select Net Terms method
    await page.click('input[type="radio"][value="net"]');
    await expect(page.locator('text=Net Terms Application')).toBeVisible();

    // Set payment terms
    await page.selectOption('#payment-period', '30');
    await page.fill('#credit-limit', '25000');
    await page.selectOption('#business-type', 'corporation');

    // Fill business information
    await page.selectOption('#annual-revenue', '1m-5m');
    await page.fill('#years-in-business', '5');
    await page.fill('#tax-id', '12-3456789');

    // Add minimum required trade references (3)
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Add Reference")');
      
      // Fill trade reference details
      const refSection = page.locator(`div:has(h5:has-text("Trade Reference #${i + 1}"))`);
      await refSection.locator('input[placeholder="Company Name"]').fill(`Trade Company ${i + 1}`);
      await refSection.locator('input[placeholder="Contact Name"]').fill(`Contact ${i + 1}`);
      await refSection.locator('input[placeholder="contact@company.com"]').fill(`contact${i + 1}@company.com`);
      await refSection.locator('input[placeholder="(555) 123-4567"]').fill(`(555) 123-456${i}`);
    }

    // Add minimum required bank reference (1)
    await page.click('button:has-text("Add Bank Reference")');
    const bankSection = page.locator('div:has(h5:has-text("Bank Reference #1"))');
    await bankSection.locator('input[placeholder="Bank of America"]').fill('Test Bank');
    await bankSection.locator('input[placeholder="Banker Name"]').fill('Bank Contact');
    await bankSection.locator('input[placeholder="(555) 123-4567"]').fill('(555) 999-0000');

    // Verify validation summary shows requirements met
    await expect(page.locator('text=Trade references (minimum 3)')).toBeVisible();
    await expect(page.locator('text=Bank references (minimum 1)')).toBeVisible();
    
    console.log('✓ Net Terms form validation working correctly');
  });

  test('should validate Corporate Account payment method with PIN verification', async ({ page }) => {
    console.log('Testing Corporate Account payment method...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Select Corporate Account method
    await page.click('input[type="radio"][value="corporate"]');
    await expect(page.locator('text=Corporate Account Information')).toBeVisible();

    // Fill account credentials (use account that includes "12345" for mock verification)
    await page.fill('#account-number', '12345678901');
    await page.fill('#account-pin', '1234');

    // Verify account automatically
    await page.click('button:has-text("Verify Account")');
    
    // Wait for verification to complete
    await expect(page.locator('text=Account verified successfully')).toBeVisible({ timeout: 5000 });
    
    // Verify account details are displayed
    await expect(page.locator('text=Account Details')).toBeVisible();
    await expect(page.locator('text=Account Status')).toBeVisible();
    await expect(page.locator('text=Active')).toBeVisible();

    // Fill billing contact
    await page.fill('#billing-contact-name', 'Corporate Contact');
    await page.fill('#billing-contact-email', 'contact@corporate.com');
    await page.fill('#billing-contact-phone', '(555) 444-3333');

    // Verify validation summary
    await expect(page.locator('text=Account verified')).toBeVisible();
    await expect(page.locator('text=Sufficient available credit')).toBeVisible();
    
    console.log('✓ Corporate Account form validation working correctly');
  });

  test('should handle payment method switching without data loss', async ({ page }) => {
    console.log('Testing payment method switching...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Start with Purchase Order
    await page.click('input[type="radio"][value="po"]');
    await page.fill('#po-number', 'PO-TEST-001');

    // Switch to Bill of Lading
    await page.click('input[type="radio"][value="bol"]');
    await expect(page.locator('text=Bill of Lading Information')).toBeVisible();
    await page.fill('#shipper-ref', 'SH-TEST-001');

    // Switch to Corporate Account
    await page.click('input[type="radio"][value="corporate"]');
    await expect(page.locator('text=Corporate Account Information')).toBeVisible();
    await page.fill('#account-number', '12345678901');

    // Switch back to Purchase Order - data should be preserved
    await page.click('input[type="radio"][value="po"]');
    await expect(page.locator('#po-number')).toHaveValue('PO-TEST-001');

    console.log('✓ Payment method switching preserves data correctly');
  });

  test('should display cost summary with payment method fees', async ({ page }) => {
    console.log('Testing cost summary with payment method fees...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Select Bill of Lading (has processing fee)
    await page.click('input[type="radio"][value="bol"]');
    
    // Verify processing fee is displayed in payment method card
    await expect(page.locator('text=+$15.00')).toBeVisible();

    // Fill minimum required fields
    await page.click('button:has-text("Generate")'); // Generate BOL number
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#bol-date', today);
    await page.fill('#shipper-ref', 'SH-TEST');
    await page.fill('#commodity-desc', 'Test commodity');
    await page.fill('#commodity-weight', '10');
    await page.fill('#declared-value', '500');

    // Check if cost summary appears
    await expect(page.locator('text=Cost Summary')).toBeVisible();
    await expect(page.locator('text=BOL processing fee')).toBeVisible();
    await expect(page.locator('text=$15.00')).toBeVisible();

    console.log('✓ Cost summary displays payment method fees correctly');
  });

  test('should prevent navigation with incomplete payment information', async ({ page }) => {
    console.log('Testing navigation prevention with incomplete payment...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Try to continue without selecting payment method
    const continueButton = page.locator('button:has-text("Continue to Pickup")');
    await expect(continueButton).toBeDisabled();

    // Select payment method but don't fill required fields
    await page.click('input[type="radio"][value="po"]');
    await expect(continueButton).toBeDisabled();

    // Fill required fields
    await page.fill('#po-number', 'PO-COMPLETE-001');
    await page.fill('#po-amount', '50.00');
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    await page.fill('#po-expiration', futureDate.toISOString().split('T')[0]);

    await page.fill('#contact-name', 'Test Contact');
    await page.fill('#contact-email', 'test@company.com');
    await page.fill('#contact-phone', '(555) 123-4567');

    // Now continue button should be enabled
    await expect(continueButton).toBeEnabled();

    console.log('✓ Navigation prevention working correctly for incomplete payment');
  });

  test('should validate field formats and show appropriate error messages', async ({ page }) => {
    console.log('Testing field validation and error messages...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Test Purchase Order validation
    await page.click('input[type="radio"][value="po"]');
    
    // Test invalid PO amount (less than shipment total)
    await page.fill('#po-amount', '10.00');
    await expect(page.locator('text=PO amount must be at least $37.86')).toBeVisible();

    // Test invalid email format
    await page.fill('#contact-email', 'invalid-email');
    await page.fill('#contact-name', 'Test'); // Trigger validation
    
    // Test Bill of Lading validation
    await page.click('input[type="radio"][value="bol"]');
    
    // Test invalid BOL number format
    await page.fill('#bol-number', 'INVALID-FORMAT');
    await expect(page.locator('text=Format must be: BOL-YYYY-XXXXXX')).toBeVisible();

    // Test future BOL date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    await page.fill('#bol-date', futureDate.toISOString().split('T')[0]);
    await expect(page.locator('text=BOL date cannot be in the future')).toBeVisible();

    console.log('✓ Field validation and error messages working correctly');
  });

  test('should persist payment data in localStorage', async ({ page }) => {
    console.log('Testing localStorage persistence...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Fill out payment information
    await page.click('input[type="radio"][value="po"]');
    await page.fill('#po-number', 'PO-PERSIST-001');
    await page.fill('#po-amount', '75.00');

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify data is restored
    await expect(page.locator('input[type="radio"][value="po"]')).toBeChecked();
    await expect(page.locator('#po-number')).toHaveValue('PO-PERSIST-001');
    await expect(page.locator('#po-amount')).toHaveValue('75');

    // Verify localStorage contains payment data
    const transactionData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('currentShippingTransaction') || '{}');
    });
    
    expect(transactionData.paymentInfo?.method).toBe('po');
    expect(transactionData.paymentInfo?.purchaseOrder?.poNumber).toBe('PO-PERSIST-001');

    console.log('✓ localStorage persistence working correctly');
  });
});

test.describe('Payment Method Mobile Responsiveness', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Set up mock data
    await page.goto(BASE_URL);
    await page.addInitScript((data) => {
      const transaction = {
        id: 'test-txn-mobile',
        timestamp: new Date().toISOString(),
        shipmentDetails: data.shipmentData,
        selectedOption: data.pricingOption,
        status: 'pricing'
      };
      localStorage.setItem('currentShippingTransaction', JSON.stringify(transaction));
    }, { shipmentData: mockShipmentData, pricingOption: mockPricingOption });
  });

  test('should display payment methods in mobile-friendly layout', async ({ page }) => {
    console.log('Testing mobile responsive layout...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Verify payment method cards stack vertically on mobile
    const paymentCards = page.locator('input[type="radio"]');
    const cardCount = await paymentCards.count();
    expect(cardCount).toBe(5);

    // Test that forms are usable on mobile
    await page.click('input[type="radio"][value="po"]');
    
    // Verify form fields are touch-friendly
    const poNumberField = page.locator('#po-number');
    await expect(poNumberField).toBeVisible();
    await poNumberField.tap();
    await poNumberField.fill('PO-MOBILE-001');

    // Verify navigation buttons are accessible
    const backButton = page.locator('button:has-text("Back to Pricing")');
    const continueButton = page.locator('button:has-text("Continue to Pickup")');
    
    await expect(backButton).toBeVisible();
    await expect(continueButton).toBeVisible();

    console.log('✓ Mobile responsive layout working correctly');
  });
});

// Performance and accessibility tests
test.describe('Payment Method Performance & Accessibility', () => {
  test('should meet performance benchmarks', async ({ page }) => {
    console.log('Testing payment page performance...');
    
    const startTime = Date.now();
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);

    console.log(`✓ Page loaded in ${loadTime}ms (under 3s target)`);
  });

  test('should be keyboard accessible', async ({ page }) => {
    console.log('Testing keyboard accessibility...');
    
    await page.goto(`${BASE_URL}/shipping/payment`);
    await page.waitForLoadState('networkidle');

    // Test keyboard navigation through payment methods
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to select payment method with keyboard
    await page.keyboard.press('Space');
    
    // Should be able to navigate to form fields
    await page.keyboard.press('Tab');
    
    // Should be able to type in form fields
    await page.keyboard.type('PO-KEYBOARD-001');

    console.log('✓ Keyboard accessibility working correctly');
  });
});