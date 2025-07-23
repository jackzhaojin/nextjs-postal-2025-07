import { test, expect } from '@playwright/test';
import { BillingTestData } from './test-data/billing-test-data';

test.describe('6.2 Billing Information Form', () => {
  // Setup navigation to billing page before each test
  test.beforeEach(async ({ page }) => {
    console.log('🧪 [BILLING TESTS] Setting up test navigation');
    
    // Mock localStorage with a shipping transaction
    await page.addInitScript(() => {
      const mockTransaction = {
        id: 'test-billing-' + Date.now(),
        status: 'payment-method-selected',
        origin: {
          streetAddress: '123 Main St',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90210',
          country: 'US',
          isCommercial: true
        },
        destination: {
          streetAddress: '456 Oak Ave', 
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
          isCommercial: true
        },
        packageInfo: {
          totalWeight: 25.5,
          totalValue: { amount: 1500, currency: 'USD' },
          packages: [{
            weight: 25.5,
            dimensions: { length: 24, width: 18, height: 12 },
            packageType: 'box'
          }]
        },
        serviceType: 'next-day',
        paymentInfo: {
          method: 'purchase-order',
          billingInformation: null
        },
        pricing: {
          baseRate: { amount: 45.99, currency: 'USD' },
          totalCost: { amount: 52.44, currency: 'USD' }
        }
      };
      
      localStorage.setItem('currentShippingTransaction', JSON.stringify(mockTransaction));
    });

    // Navigate to billing information page
    await page.goto('/shipping/payment/billing');
    
    // Wait for page to load
    await expect(page.getByTestId('billing-information-page')).toBeVisible();
    console.log('🧪 [BILLING TESTS] Billing page loaded successfully');
  });

  test('6.2.1 Should display billing information page with all sections', async ({ page }) => {
    console.log('🧪 [TEST 6.2.1] Testing billing page layout and navigation');
    
    // Check page header
    await expect(page.getByRole('heading', { name: 'Billing Information' })).toBeVisible();
    await expect(page.getByText('Set up your billing details and invoice preferences')).toBeVisible();
    
    // Check progress bar
    await expect(page.getByText('Billing Setup Progress')).toBeVisible();
    await expect(page.getByText('% Complete')).toBeVisible();
    
    // Check all step navigation buttons
    const expectedSteps = [
      { id: 'address', title: 'Billing Address' },
      { id: 'contact', title: 'Accounts Payable Contact' },
      { id: 'company', title: 'Company Information' },
      { id: 'preferences', title: 'Invoice Preferences' }
    ];

    for (const step of expectedSteps) {
      await expect(page.getByTestId(`billing-step-${step.id}`)).toBeVisible();
      await expect(page.getByText(step.title)).toBeVisible();
    }
    
    // Check navigation buttons
    await expect(page.getByTestId('billing-previous-button')).toBeVisible();
    await expect(page.getByTestId('billing-next-button')).toBeVisible();
    
    console.log('✅ [TEST 6.2.1] All billing page elements are visible');
  });

  test('6.2.2 Should fill out billing address section with smart defaults', async ({ page }) => {
    console.log('🧪 [TEST 6.2.2] Testing billing address section with smart defaults');
    
    // Verify we're on the billing address step
    await expect(page.getByTestId('billing-step-address')).toHaveClass(/border-blue-500/);
    
    // Check "Same as origin address" checkbox functionality
    const sameAsOriginCheckbox = page.getByTestId('same-as-origin-checkbox');
    await expect(sameAsOriginCheckbox).toBeVisible();
    
    // Toggle same as origin to test auto-fill
    await sameAsOriginCheckbox.click();
    
    // Verify fields are auto-filled with origin address
    await expect(page.getByTestId('billing-street-address')).toHaveValue('123 Main St');
    await expect(page.getByTestId('billing-city')).toHaveValue('Los Angeles');
    await expect(page.getByTestId('billing-state')).toHaveValue('CA');
    await expect(page.getByTestId('billing-postal-code')).toHaveValue('90210');
    
    // Test manual address entry
    await sameAsOriginCheckbox.click(); // Uncheck same as origin
    
    const testAddress = BillingTestData.validBillingAddress;
    await page.getByTestId('billing-street-address').fill(testAddress.streetAddress);
    await page.getByTestId('billing-suite').fill(testAddress.suite || '');
    await page.getByTestId('billing-city').fill(testAddress.city);
    await page.getByTestId('billing-state').selectOption(testAddress.state);
    await page.getByTestId('billing-postal-code').fill(testAddress.postalCode);
    
    // Verify address validation indicator appears
    await expect(page.getByTestId('address-validation-status')).toBeVisible();
    
    // Continue to next step
    await expect(page.getByTestId('billing-next-button')).toBeEnabled();
    await page.getByTestId('billing-next-button').click();
    
    // Verify we moved to the next step
    await expect(page.getByTestId('billing-step-contact')).toHaveClass(/border-blue-500/);
    
    console.log('✅ [TEST 6.2.2] Billing address section completed successfully');
  });

  test('6.2.3 Should fill out accounts payable contact section', async ({ page }) => {
    console.log('🧪 [TEST 6.2.3] Testing accounts payable contact section');
    
    // Complete billing address first
    const testAddress = BillingTestData.validBillingAddress;
    await page.getByTestId('billing-street-address').fill(testAddress.streetAddress);
    await page.getByTestId('billing-city').fill(testAddress.city);
    await page.getByTestId('billing-state').selectOption(testAddress.state);
    await page.getByTestId('billing-postal-code').fill(testAddress.postalCode);
    await page.getByTestId('billing-next-button').click();
    
    // Now test contact section
    const testContact = BillingTestData.validAccountsPayableContact;
    
    await page.getByTestId('contact-full-name').fill(testContact.fullName);
    await page.getByTestId('contact-title').fill(testContact.title);
    await page.getByTestId('contact-department').fill(testContact.department);
    await page.getByTestId('contact-phone').fill(testContact.phone);
    await page.getByTestId('contact-email').fill(testContact.email);
    
    // Test preferred contact method selection
    await page.getByTestId('contact-preferred-method').selectOption(testContact.preferredContactMethod);
    
    // Test business hours configuration
    await page.getByTestId('business-hours-timezone').selectOption(testContact.businessHours.timezone);
    
    // Configure Monday business hours
    await page.getByTestId('monday-start-time').fill(testContact.businessHours.monday.startTime);
    await page.getByTestId('monday-end-time').fill(testContact.businessHours.monday.endTime);
    
    // Test authorization settings
    if (testContact.isAuthorizedSigner) {
      await page.getByTestId('authorized-signer-checkbox').check();
      await page.getByTestId('purchase-order-limit').fill(testContact.purchaseOrderLimit?.toString() || '');
    }
    
    // Continue to next step
    await expect(page.getByTestId('billing-next-button')).toBeEnabled();
    await page.getByTestId('billing-next-button').click();
    
    await expect(page.getByTestId('billing-step-company')).toHaveClass(/border-blue-500/);
    
    console.log('✅ [TEST 6.2.3] Accounts payable contact section completed successfully');
  });

  test('6.2.4 Should fill out company information section', async ({ page }) => {
    console.log('🧪 [TEST 6.2.4] Testing company information section');
    
    // Navigate to company information step
    await BillingTestData.fillBillingAddress(page);
    await page.getByTestId('billing-next-button').click();
    
    await BillingTestData.fillAccountsPayableContact(page);
    await page.getByTestId('billing-next-button').click();
    
    // Fill company information
    const testCompany = BillingTestData.validCompanyInformation;
    
    await page.getByTestId('company-legal-name').fill(testCompany.legalName);
    await page.getByTestId('company-dba-name').fill(testCompany.dbaName || '');
    await page.getByTestId('company-business-type').selectOption(testCompany.businessType);
    
    // Test industry search and selection
    await page.getByTestId('company-industry-search').fill('technology');
    await page.getByTestId('company-industry-option-technology').click();
    
    await page.getByTestId('company-years-in-business').fill(testCompany.yearsInBusiness.toString());
    await page.getByTestId('company-number-of-employees').selectOption(testCompany.numberOfEmployees);
    await page.getByTestId('company-annual-shipping-volume').selectOption(testCompany.annualShippingVolume);
    
    // Test tax ID information
    await page.getByTestId('tax-id-number').fill(testCompany.taxId.number);
    await page.getByTestId('tax-id-type').selectOption(testCompany.taxId.type);
    
    // Continue to next step
    await expect(page.getByTestId('billing-next-button')).toBeEnabled();
    await page.getByTestId('billing-next-button').click();
    
    await expect(page.getByTestId('billing-step-preferences')).toHaveClass(/border-blue-500/);
    
    console.log('✅ [TEST 6.2.4] Company information section completed successfully');
  });

  test('6.2.5 Should fill out invoice preferences section', async ({ page }) => {
    console.log('🧪 [TEST 6.2.5] Testing invoice preferences section');
    
    // Navigate to invoice preferences step
    await BillingTestData.fillBillingAddress(page);
    await page.getByTestId('billing-next-button').click();
    
    await BillingTestData.fillAccountsPayableContact(page);
    await page.getByTestId('billing-next-button').click();
    
    await BillingTestData.fillCompanyInformation(page);
    await page.getByTestId('billing-next-button').click();
    
    // Fill invoice preferences
    const testPreferences = BillingTestData.validInvoicePreferences;
    
    await page.getByTestId('invoice-delivery-method').selectOption(testPreferences.deliveryMethod);
    await page.getByTestId('invoice-format').selectOption(testPreferences.format);
    
    // Test email invoice settings
    if (testPreferences.deliveryMethod === 'email') {
      await page.getByTestId('primary-email').fill(testPreferences.emailSettings!.primaryEmail);
      await page.getByTestId('cc-emails-input').fill(testPreferences.emailSettings!.ccEmails.join(', '));
    }
    
    await page.getByTestId('invoice-frequency').selectOption(testPreferences.frequency);
    await page.getByTestId('payment-terms').selectOption(testPreferences.paymentTerms);
    
    // Test purchase order requirements
    if (testPreferences.requiresPurchaseOrder) {
      await page.getByTestId('requires-po-checkbox').check();
      await page.getByTestId('po-number-format').fill(testPreferences.purchaseOrderFormat || '');
    }
    
    // Now the continue button should be enabled to complete billing
    await expect(page.getByTestId('billing-continue-button')).toBeEnabled();
    
    console.log('✅ [TEST 6.2.5] Invoice preferences section completed successfully');
  });

  test('6.2.6 Should complete entire billing flow and continue to pickup', async ({ page }) => {
    console.log('🧪 [TEST 6.2.6] Testing complete billing information flow');
    
    // Fill all sections
    await BillingTestData.fillBillingAddress(page);
    await page.getByTestId('billing-next-button').click();
    
    await BillingTestData.fillAccountsPayableContact(page);
    await page.getByTestId('billing-next-button').click();
    
    await BillingTestData.fillCompanyInformation(page);
    await page.getByTestId('billing-next-button').click();
    
    await BillingTestData.fillInvoicePreferences(page);
    
    // Verify progress is 100%
    await expect(page.getByText('100% Complete')).toBeVisible();
    
    // Verify all steps are marked as completed
    for (const stepId of ['address', 'contact', 'company', 'preferences']) {
      await expect(page.getByTestId(`billing-step-${stepId}`)).toHaveClass(/border-green-200/);
    }
    
    // Complete billing and continue to pickup
    await page.getByTestId('billing-continue-button').click();
    
    // Should navigate to pickup scheduling page
    await expect(page).toHaveURL(/.*\/shipping\/pickup/);
    
    console.log('✅ [TEST 6.2.6] Complete billing flow completed successfully');
  });

  test('6.2.7 Should validate required fields and show errors', async ({ page }) => {
    console.log('🧪 [TEST 6.2.7] Testing billing form validation');
    
    // Try to proceed without filling required fields
    const nextButton = page.getByTestId('billing-next-button');
    await expect(nextButton).toBeDisabled();
    
    // Fill minimum required fields for billing address
    await page.getByTestId('billing-street-address').fill('123 Test St');
    await page.getByTestId('billing-city').fill('Test City');
    await page.getByTestId('billing-state').selectOption('CA');
    await page.getByTestId('billing-postal-code').fill('90210');
    
    // Now next button should be enabled
    await expect(nextButton).toBeEnabled();
    await nextButton.click();
    
    // On contact section, next should be disabled initially
    await expect(page.getByTestId('billing-next-button')).toBeDisabled();
    
    // Test email validation
    await page.getByTestId('contact-email').fill('invalid-email');
    await expect(page.getByTestId('error-contact-email')).toBeVisible();
    
    // Fix email and fill other required fields
    await page.getByTestId('contact-email').fill('test@company.com');
    await page.getByTestId('contact-full-name').fill('Test Contact');
    await page.getByTestId('contact-phone').fill('555-123-4567');
    
    await expect(page.getByTestId('billing-next-button')).toBeEnabled();
    
    console.log('✅ [TEST 6.2.7] Billing form validation working correctly');
  });

  test('6.2.8 Should support navigation between completed sections', async ({ page }) => {
    console.log('🧪 [TEST 6.2.8] Testing step navigation');
    
    // Complete first section
    await BillingTestData.fillBillingAddress(page);
    await page.getByTestId('billing-next-button').click();
    
    // Click back to previous step
    await page.getByTestId('billing-previous-button').click();
    await expect(page.getByTestId('billing-step-address')).toHaveClass(/border-blue-500/);
    
    // Verify data persistence
    await expect(page.getByTestId('billing-street-address')).toHaveValue('123 Corporate Way');
    
    // Navigate forward again
    await page.getByTestId('billing-next-button').click();
    await expect(page.getByTestId('billing-step-contact')).toHaveClass(/border-blue-500/);
    
    // Test direct step navigation by clicking step buttons
    await page.getByTestId('billing-step-address').click();
    await expect(page.getByTestId('billing-step-address')).toHaveClass(/border-blue-500/);
    
    console.log('✅ [TEST 6.2.8] Step navigation working correctly');
  });
});
