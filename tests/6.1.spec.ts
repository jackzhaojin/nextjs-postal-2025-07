import { test, expect } from '@playwright/test';

test.describe('Payment Method Selection (Task 6.1)', () => {
  test.beforeEach(async ({ page }) => {
    test.setTimeout(120000); // Increase timeout for beforeEach hook

    await page.goto('http://localhost:4000/shipping/payment'); // Directly navigate to the payment page
    await page.waitForURL('http://localhost:4000/shipping/payment'); // Ensure navigation to the payment page
    await page.waitForLoadState('networkidle'); // Wait for the page to be fully loaded

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
    };

    await page.evaluate(mockTransaction => {
      localStorage.setItem('currentShippingTransaction', JSON.stringify(mockTransaction));
    }, mockShippingTransaction);

    // Reload the page after setting localStorage to ensure the component picks up the new state
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should display payment method selection options', async ({ page }) => {
    await expect(page.getByText('Select Payment Method')).toBeVisible();
    await expect(page.getByLabel('Purchase Order')).toBeVisible();
    await expect(page.getByLabel('Bill of Lading')).toBeVisible();
    await expect(page.getByLabel('Third-Party Billing')).toBeVisible();
    await expect(page.getByLabel('Net Terms')).toBeVisible();
    await expect(page.getByLabel('Corporate Account')).toBeVisible();
  });

  test('should display Purchase Order form when selected', async ({ page }) => {
    await page.getByLabel('Purchase Order').click();
    await expect(page.getByText('PO Number')).toBeVisible();
    await expect(page.getByText('PO Amount')).toBeVisible();
    await expect(page.getByText('PO Expiration')).toBeVisible();
  });

  test('should display Bill of Lading form when selected', async ({ page }) => {
    await page.getByLabel('Bill of Lading').click();
    await expect(page.getByText('BOL Number')).toBeVisible();
    await expect(page.getByText('BOL Date')).toBeVisible();
    await expect(page.getByText('Freight Terms')).toBeVisible();
  });

  test('should display Third-Party Billing form when selected', async ({ page }) => {
    await page.getByLabel('Third-Party Billing').click();
    await expect(page.getByText('Account Number')).toBeVisible();
    await expect(page.getByText('Company Name')).toBeVisible();
    await expect(page.getByText('Contact Email')).toBeVisible();
  });

  test('should display Net Terms form when selected', async ({ page }) => {
    await page.getByLabel('Net Terms').click();
    await expect(page.getByText('Net Terms Period')).toBeVisible();
    await expect(page.getByText('Credit Application')).toBeVisible();
    await expect(page.getByText('Trade References')).toBeVisible();
  });

  test('should display Corporate Account form when selected', async ({ page }) => {
    await page.getByLabel('Corporate Account').click();
    await expect(page.getByText('Account Number')).toBeVisible();
    await expect(page.getByText('Account PIN')).toBeVisible();
    await expect(page.getByText('Billing Contact Name')).toBeVisible();
  });

  test('should show errors for invalid Purchase Order form submission', async ({ page }) => {
    await page.getByLabel('Purchase Order').click();
    await page.click('button:has-text("Continue to Pickup")');

    await expect(page.getByText('PO Number is required.')).toBeVisible();
    await expect(page.getByText('PO Amount must be greater than 0.')).toBeVisible();
    await expect(page.getByText('PO Expiration is required.')).toBeVisible();
    await expect(page.getByText('Approval Contact Name is required.')).toBeVisible();
    await expect(page.getByText('Approval Contact Email is required.')).toBeVisible();
    await expect(page.getByText('Approval Contact Phone is required.')).toBeVisible();
  });

  test('should allow valid Purchase Order form submission', async ({ page }) => {
    await page.getByLabel('Purchase Order').click();
    await page.fill('input[name="poNumber"]', 'PO12345');
    await page.fill('input[name="poAmount"]', '100.00');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await page.fill('input[name="poExpiration"]', futureDate.toISOString().split('T')[0]);
    await page.fill('input[name="approvalContactName"]', 'John Doe');
    await page.fill('input[name="approvalContactEmail"]', 'john.doe@example.com');
    await page.fill('input[name="approvalContactPhone"]', '1234567890');

    await page.click('button:has-text("Continue to Pickup")');
    await expect(page).toHaveURL('http://localhost:4000/shipping/pickup');
  });

  test('should show errors for invalid Bill of Lading form submission', async ({ page }) => {
    await page.getByLabel('Bill of Lading').click();
    await page.click('button:has-text("Continue to Pickup")');

    await expect(page.getByText('BOL Number is required.')).toBeVisible();
    await expect(page.getByText('BOL Date is required.')).toBeVisible();
    await expect(page.getByText('Freight Terms is required.')).toBeVisible();
  });

  test('should allow valid Bill of Lading form submission', async ({ page }) => {
    await page.getByLabel('Bill of Lading').click();
    await page.fill('input[name="bolNumber"]', 'BOL-2024-123456');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    await page.fill('input[name="bolDate"]', pastDate.toISOString().split('T')[0]);
    await page.selectOption('select[name="freightTerms"]', 'Prepaid');

    await page.click('button:has-text("Continue to Pickup")');
    await expect(page).toHaveURL('http://localhost:4000/shipping/pickup');
  });

  test('should show errors for invalid Third-Party Billing form submission', async ({ page }) => {
    await page.getByLabel('Third-Party Billing').click();
    await page.click('button:has-text("Continue to Pickup")');

    await expect(page.getByText('Account Number is required.')).toBeVisible();
    await expect(page.getByText('Company Name is required.')).toBeVisible();
    await expect(page.getByText('Contact Name is required.')).toBeVisible();
    await expect(page.getByText('Contact Email is required.')).toBeVisible();
    await expect(page.getByText('Contact Phone is required.')).toBeVisible();
  });

  test('should allow valid Third-Party Billing form submission', async ({ page }) => {
    await page.getByLabel('Third-Party Billing').click();
    await page.fill('input[name="accountNumber"]', '123456789');
    await page.fill('input[name="companyName"]', 'Test Company');
    await page.fill('input[name="contactName"]', 'Jane Doe');
    await page.fill('input[name="contactEmail"]', 'jane.doe@testcompany.com');
    await page.fill('input[name="contactPhone"]', '0987654321');

    await page.click('button:has-text("Continue to Pickup")');
    await expect(page).toHaveURL('http://localhost:4000/shipping/pickup');
  });

  test('should show errors for invalid Net Terms form submission', async ({ page }) => {
    await page.getByLabel('Net Terms').click();
    await page.click('button:has-text("Continue to Pickup")');

    await expect(page.getByText('Net Terms Period is required.')).toBeVisible();
    await expect(page.getByText('Credit Application file is required.')).toBeVisible();
    await expect(page.getByText('Trade Reference 1 Name is required.')).toBeVisible();
    await expect(page.getByText('Annual Revenue is required.')).toBeVisible();
  });

  test('should show errors for invalid Corporate Account form submission', async ({ page }) => {
    await page.getByLabel('Corporate Account').click();
    await page.click('button:has-text("Continue to Pickup")');

    await expect(page.getByText('Account Number is required.')).toBeVisible();
    await expect(page.getByText('Account PIN is required.')).toBeVisible();
    await expect(page.getByText('Billing Contact Name is required.')).toBeVisible();
    await expect(page.getByText('Billing Contact Email is required.')).toBeVisible();
    await expect(page.getByText('Billing Contact Phone is required.')).toBeVisible();
  });

  test('should allow valid Corporate Account form submission', async ({ page }) => {
    await page.getByLabel('Corporate Account').click();
    await page.fill('input[name="accountNumber"]', 'CORP123');
    await page.fill('input[name="accountPin"]', '1234');
    await page.fill('input[name="billingContactName"]', 'Bob Smith');
    await page.fill('input[name="billingContactEmail"]', 'bob.smith@corporate.com');
    await page.fill('input[name="billingContactPhone"]', '1122334455');

    await page.click('button:has-text("Continue to Pickup")');
    await expect(page).toHaveURL('http://localhost:4000/shipping/pickup');
  });
});