import { test, expect } from '@playwright/test';

test.describe('Billing Information Form (Task 6.2)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000); // Increase timeout for beforeEach hook

    // Mock ShippingTransaction to simulate previous steps being completed
    const mockShippingTransaction = {
      id: 'test-transaction-123',
      timestamp: new Date().toISOString(),
      shipmentDetails: {
        origin: {
          address: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zip: '90210',
          country: 'USA',
          isResidential: false,
          contactInfo: { name: 'Test Origin', phone: '123-456-7890', email: 'origin@example.com' },
          locationType: 'commercial',
        },
        destination: {
          address: '456 Oak Ave',
          city: 'Otherville',
          state: 'NY',
          zip: '10001',
          country: 'USA',
          isResidential: false,
          contactInfo: { name: 'Test Destination', phone: '098-765-4321', email: 'destination@example.com' },
          locationType: 'commercial',
        },
        package: {
          type: 'box',
          dimensions: { length: 10, width: 10, height: 10, unit: 'in' },
          weight: { value: 10, unit: 'lbs' },
          declaredValue: 100,
          currency: 'USD',
          contents: 'Test Contents',
          contentsCategory: 'other',
          specialHandling: [],
        },
        deliveryPreferences: {
          signatureRequired: false,
          adultSignatureRequired: false,
          smsConfirmation: false,
          photoProof: false,
          saturdayDelivery: false,
          holdAtLocation: false,
          serviceLevel: 'economical',
        },
      },
      selectedOption: {
        id: 'test-option-1',
        category: 'ground',
        serviceType: 'Standard',
        carrier: 'Test Carrier',
        pricing: {
          baseRate: 50,
          fuelSurcharge: 5,
          fuelSurchargePercentage: 0.1,
          insurance: 1,
          insurancePercentage: 0.01,
          specialHandling: 0,
          deliveryConfirmation: 0,
          taxes: 4.5,
          taxPercentage: 0.085,
          total: 60.5,
          calculationBasis: { distance: 100, weight: 10 },
        },
        estimatedDelivery: '2-3 business days',
        transitDays: 2,
        features: [],
      },
      status: 'pricing',
      paymentInfo: {
        method: 'PurchaseOrder',
        validationStatus: 'complete',
        lastUpdated: new Date().toISOString(),
      },
    };

    await page.evaluate(mockTransaction => {
      localStorage.setItem('currentShippingTransaction', JSON.stringify(mockTransaction));
    }, mockShippingTransaction);

    await page.goto('http://localhost:4000/shipping/payment/billing'); // Directly navigate to the billing page
    await page.waitForURL('http://localhost:4000/shipping/payment/billing'); // Ensure navigation to the billing page
    await page.waitForLoadState('networkidle'); // Wait for the page to be fully loaded
  });

  test('should display billing address section', async ({ page }) => {
    await expect(page.getByText('Billing Address')).toBeVisible();
    await expect(page.getByLabel('Street Address')).toBeVisible();
    await expect(page.getByLabel('City')).toBeVisible();
    await expect(page.getByLabel('State')).toBeVisible();
    await expect(page.getByLabel('ZIP Code')).toBeVisible();
    await expect(page.getByLabel('Country')).toBeVisible();
  });

  test('should display accounts payable contact section', async ({ page }) => {
    await expect(page.getByText('Accounts Payable Contact')).toBeVisible();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Phone Number')).toBeVisible();
    await expect(page.getByLabel('Business Email')).toBeVisible();
  });

  test('should display company information section', async ({ page }) => {
    await expect(page.getByText('Company Information')).toBeVisible();
    await expect(page.getByLabel('Legal Company Name')).toBeVisible();
    await expect(page.getByLabel('Business Type')).toBeVisible();
    await expect(page.getByLabel('Industry')).toBeVisible();
    await expect(page.getByLabel('Annual Shipping Volume')).toBeVisible();
  });

  test('should display invoice preferences section', async ({ page }) => {
    await expect(page.getByText('Invoice Preferences')).toBeVisible();
    await expect(page.getByLabel('Invoice Delivery Method')).toBeVisible();
    await expect(page.getByLabel('Invoice Format')).toBeVisible();
    await expect(page.getByLabel('Invoice Frequency')).toBeVisible();
  });

  test('should allow filling billing address and auto-fill from origin', async ({ page }) => {
    await page.getByLabel('Same as Origin Address').check();
    await expect(page.getByLabel('Street Address')).toHaveValue('123 Main St');
    await expect(page.getByLabel('City')).toHaveValue('Anytown');
    await expect(page.getByLabel('State')).toHaveValue('CA');
    await expect(page.getByLabel('ZIP Code')).toHaveValue('90210');
    await expect(page.getByLabel('Country')).toHaveValue('USA');
  });

  test('should show errors for invalid billing address submission', async ({ page }) => {
    await page.getByLabel('Street Address').fill(''); // Clear required field
    await page.click('button:has-text("Continue to Review")');
    await expect(page.getByText('Street address is required.')).toBeVisible();
  });

  test('should allow valid billing information submission', async ({ page }) => {
    // Fill billing address
    await page.getByLabel('Street Address').fill('789 Pine St');
    await page.getByLabel('City').fill('Someplace');
    await page.getByLabel('State').fill('TX');
    await page.getByLabel('ZIP Code').fill('75001');
    await page.getByLabel('Country').fill('USA');
    await page.getByLabel('Contact Name').fill('Billing Contact');
    await page.getByLabel('Phone').fill('1112223333');
    await page.getByLabel('Email').fill('billing@example.com');

    // Fill accounts payable contact
    await page.getByLabel('Full Name').fill('AP Manager');
    await page.getByLabel('Phone Number').fill('4445556666');
    await page.getByLabel('Business Email').fill('ap@example.com');

    // Fill company information
    await page.getByLabel('Legal Company Name').fill('Test Corp');
    await page.getByLabel('Business Type').click();
    await page.getByText('Corporation').click();
    await page.getByLabel('Industry').click();
    await page.getByText('Technology').click();
    await page.getByLabel('Annual Shipping Volume').click();
    await page.getByText('> $1M').click();

    // Fill invoice preferences
    await page.getByLabel('Invoice Delivery Method').click();
    await page.getByText('Email').click();
    await page.getByLabel('Invoice Format').click();
    await page.getByText('Standard').click();
    await page.getByLabel('Invoice Frequency').click();
    await page.getByText('Monthly').click();

    await page.click('button:has-text("Continue to Review")');
    await expect(page).toHaveURL('http://localhost:4000/shipping/review');
  });
});
