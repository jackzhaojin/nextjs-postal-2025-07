import { Page } from '@playwright/test';

// Test data for billing information form testing
export class BillingTestData {
  // Valid billing address data
  static validBillingAddress = {
    streetAddress: '123 Corporate Way',
    suite: 'Suite 100',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'US',
    isCommercial: true,
    addressType: 'commercial' as const
  };

  // Valid accounts payable contact data
  static validAccountsPayableContact = {
    fullName: 'Sarah Johnson',
    title: 'Accounts Payable Manager',
    department: 'Finance',
    phone: '415-555-0123',
    phoneExtension: '4567',
    email: 'sarah.johnson@company.com',
    alternateEmail: 'ap@company.com',
    preferredContactMethod: 'email' as const,
    businessHours: {
      timezone: 'America/Los_Angeles',
      monday: {
        isWorkingDay: true,
        startTime: '09:00',
        endTime: '17:00'
      },
      tuesday: {
        isWorkingDay: true,
        startTime: '09:00',
        endTime: '17:00'
      },
      wednesday: {
        isWorkingDay: true,
        startTime: '09:00',
        endTime: '17:00'
      },
      thursday: {
        isWorkingDay: true,
        startTime: '09:00',
        endTime: '17:00'
      },
      friday: {
        isWorkingDay: true,
        startTime: '09:00',
        endTime: '17:00'
      },
      saturday: {
        isWorkingDay: false,
        startTime: '',
        endTime: ''
      },
      sunday: {
        isWorkingDay: false,
        startTime: '',
        endTime: ''
      }
    },
    isAuthorizedSigner: true,
    purchaseOrderLimit: 50000
  };

  // Valid company information data
  static validCompanyInformation = {
    legalName: 'Acme Corporation Inc.',
    dbaName: 'Acme Corp',
    businessType: 'corporation' as const,
    industry: 'technology',
    businessDescription: 'Software development and technology consulting',
    yearsInBusiness: 15,
    numberOfEmployees: '50-99',
    annualShippingVolume: '1000-4999',
    businessLicense: {
      number: 'BL-12345-CA',
      state: 'CA',
      expirationDate: '2025-12-31'
    },
    taxId: {
      number: '12-3456789',
      type: 'ein' as const
    },
    duns: '123456789',
    sicCode: '7372'
  };

  // Valid invoice preferences data
  static validInvoicePreferences = {
    deliveryMethod: 'email' as const,
    format: 'pdf' as const,
    emailSettings: {
      primaryEmail: 'billing@company.com',
      ccEmails: ['finance@company.com', 'ap@company.com'],
      enableReadReceipts: true,
      includeShipmentDetails: true
    },
    frequency: 'weekly' as const,
    paymentTerms: 'net-30' as const,
    requiresPurchaseOrder: true,
    purchaseOrderFormat: 'PO-{YYYY}-{####}',
    invoiceConsolidation: true,
    specialInstructions: 'Please include detailed line items for all shipments'
  };

  // Helper methods to fill form sections
  static async fillBillingAddress(page: Page) {
    const address = this.validBillingAddress;
    
    await page.getByTestId('billing-street-address').fill(address.streetAddress);
    await page.getByTestId('billing-suite').fill(address.suite);
    await page.getByTestId('billing-city').fill(address.city);
    await page.getByTestId('billing-state').selectOption(address.state);
    await page.getByTestId('billing-postal-code').fill(address.postalCode);
  }

  static async fillAccountsPayableContact(page: Page) {
    const contact = this.validAccountsPayableContact;
    
    await page.getByTestId('contact-full-name').fill(contact.fullName);
    await page.getByTestId('contact-title').fill(contact.title);
    await page.getByTestId('contact-department').fill(contact.department);
    await page.getByTestId('contact-phone').fill(contact.phone);
    await page.getByTestId('contact-phone-extension').fill(contact.phoneExtension || '');
    await page.getByTestId('contact-email').fill(contact.email);
    await page.getByTestId('contact-alternate-email').fill(contact.alternateEmail || '');
    await page.getByTestId('contact-preferred-method').selectOption(contact.preferredContactMethod);
    
    // Fill business hours
    await page.getByTestId('business-hours-timezone').selectOption(contact.businessHours.timezone);
    await page.getByTestId('monday-start-time').fill(contact.businessHours.monday.startTime);
    await page.getByTestId('monday-end-time').fill(contact.businessHours.monday.endTime);
    
    // Authorization settings
    if (contact.isAuthorizedSigner) {
      await page.getByTestId('authorized-signer-checkbox').check();
      await page.getByTestId('purchase-order-limit').fill(contact.purchaseOrderLimit?.toString() || '');
    }
  }

  static async fillCompanyInformation(page: Page) {
    const company = this.validCompanyInformation;
    
    await page.getByTestId('company-legal-name').fill(company.legalName);
    await page.getByTestId('company-dba-name').fill(company.dbaName || '');
    await page.getByTestId('company-business-type').selectOption(company.businessType);
    
    // Industry selection with search
    await page.getByTestId('company-industry-search').fill(company.industry);
    await page.getByTestId(`company-industry-option-${company.industry}`).click();
    
    await page.getByTestId('company-business-description').fill(company.businessDescription || '');
    await page.getByTestId('company-years-in-business').fill(company.yearsInBusiness.toString());
    await page.getByTestId('company-number-of-employees').selectOption(company.numberOfEmployees);
    await page.getByTestId('company-annual-shipping-volume').selectOption(company.annualShippingVolume);
    
    // Business license
    await page.getByTestId('business-license-number').fill(company.businessLicense.number);
    await page.getByTestId('business-license-state').selectOption(company.businessLicense.state);
    await page.getByTestId('business-license-expiration').fill(company.businessLicense.expirationDate);
    
    // Tax ID
    await page.getByTestId('tax-id-number').fill(company.taxId.number);
    await page.getByTestId('tax-id-type').selectOption(company.taxId.type);
    
    // Optional fields
    await page.getByTestId('company-duns').fill(company.duns || '');
    await page.getByTestId('company-sic-code').fill(company.sicCode || '');
  }

  static async fillInvoicePreferences(page: Page) {
    const preferences = this.validInvoicePreferences;
    
    await page.getByTestId('invoice-delivery-method').selectOption(preferences.deliveryMethod);
    await page.getByTestId('invoice-format').selectOption(preferences.format);
    
    // Email settings if delivery method is email
    if (preferences.deliveryMethod === 'email' && preferences.emailSettings) {
      await page.getByTestId('primary-email').fill(preferences.emailSettings.primaryEmail);
      
      // Add CC emails
      for (const ccEmail of preferences.emailSettings.ccEmails) {
        await page.getByTestId('cc-emails-input').fill(ccEmail);
        await page.getByTestId('add-cc-email-button').click();
      }
      
      if (preferences.emailSettings.enableReadReceipts) {
        await page.getByTestId('enable-read-receipts-checkbox').check();
      }
      
      if (preferences.emailSettings.includeShipmentDetails) {
        await page.getByTestId('include-shipment-details-checkbox').check();
      }
    }
    
    await page.getByTestId('invoice-frequency').selectOption(preferences.frequency);
    await page.getByTestId('payment-terms').selectOption(preferences.paymentTerms);
    
    // Purchase order requirements
    if (preferences.requiresPurchaseOrder) {
      await page.getByTestId('requires-po-checkbox').check();
      await page.getByTestId('po-number-format').fill(preferences.purchaseOrderFormat || '');
    }
    
    if (preferences.invoiceConsolidation) {
      await page.getByTestId('invoice-consolidation-checkbox').check();
    }
    
    // Special instructions
    await page.getByTestId('special-instructions').fill(preferences.specialInstructions || '');
  }

  // Alternative test data for validation testing
  static invalidEmailContact = {
    ...this.validAccountsPayableContact,
    email: 'invalid-email-format'
  };

  static incompleteAddress = {
    streetAddress: '123 Test St',
    city: '', // Missing required field
    state: 'CA',
    postalCode: '90210',
    country: 'US'
  };

  static invalidPhoneContact = {
    ...this.validAccountsPayableContact,
    phone: '123' // Too short
  };
}
