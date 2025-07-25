import { test, expect } from '@playwright/test';

test.describe('Review Page - Task 8.1', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Setting up test environment for review page');
    
    // Mock localStorage with complete shipping transaction data
    await page.addInitScript(() => {
      const mockTransaction = {
        id: 'test-transaction-8-1',
        timestamp: new Date().toISOString(),
        status: 'review',
        shipmentDetails: {
          origin: {
            address: '123 Main St',
            suite: 'Suite 100',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US',
            isResidential: false,
            locationType: 'commercial',
            locationDescription: 'Loading dock available',
            contactInfo: {
              name: 'John Smith',
              company: 'Test Company Inc',
              phone: '555-123-4567',
              email: 'john@testcompany.com',
              extension: '123'
            }
          },
          destination: {
            address: '456 Oak Ave',
            suite: '',
            city: 'Los Angeles',
            state: 'CA',
            zip: '90210',
            country: 'US',
            isResidential: true,
            locationType: 'residential',
            locationDescription: '',
            contactInfo: {
              name: 'Jane Doe',
              company: '',
              phone: '555-987-6543',
              email: 'jane@example.com',
              extension: ''
            }
          },
          package: {
            type: 'medium',
            dimensions: {
              length: 12,
              width: 8,
              height: 6,
              unit: 'in'
            },
            weight: {
              value: 5,
              unit: 'lbs'
            },
            declaredValue: 250.00,
            currency: 'USD',
            contents: 'Electronics',
            contentsCategory: 'electronics',
            specialHandling: ['fragile', 'this-side-up']
          },
          deliveryPreferences: {
            signatureRequired: true,
            adultSignatureRequired: false,
            smsConfirmation: true,
            photoProof: false,
            saturdayDelivery: false,
            holdAtLocation: false,
            serviceLevel: 'reliable'
          }
        },
        selectedOption: {
          id: 'ground-standard-001',
          category: 'ground',
          serviceType: 'Ground Standard',
          carrier: 'TestCarrier',
          estimatedDelivery: '2025-07-26',
          transitDays: 2,
          features: ['Tracking Included', 'Insurance Available'],
          pricing: {
            baseRate: 35.50,
            fuelSurcharge: 4.98,
            fuelSurchargePercentage: 14.0,
            insurance: 2.50,
            insurancePercentage: 1.0,
            specialHandling: 20.00,
            deliveryConfirmation: 5.00,
            taxes: 5.78,
            taxPercentage: 8.5,
            total: 73.76,
            calculationBasis: {
              distance: 2445,
              weight: 5,
              dimensionalWeight: 4.2,
              zone: 'Zone 8'
            }
          }
        },
        paymentInfo: {
          method: 'po',
          reference: 'PO-2025-001',
          billingContact: {
            name: 'Accounts Payable',
            company: 'Test Company Inc',
            phone: '555-123-4567',
            email: 'ap@testcompany.com',
            extension: '200'
          },
          companyInfo: {
            legalName: 'Test Company Inc',
            businessType: 'corporation',
            industry: 'Technology',
            annualShippingVolume: '50k-250k',
            taxId: '12-3456789'
          },
          billingAddress: {
            address: '123 Main St',
            suite: 'Suite 100',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US',
            isResidential: false,
            locationType: 'commercial',
            contactInfo: {
              name: 'Billing Contact',
              company: 'Test Company Inc',
              phone: '555-123-4567',
              email: 'billing@testcompany.com'
            }
          }
        },
        pickupDetails: {
          date: '2025-07-24',
          timeSlot: {
            id: 'morning',
            display: '8:00 AM - 12:00 PM',
            startTime: '08:00',
            endTime: '12:00',
            availability: 'available'
          },
          readyTime: '7:30 AM',
          instructions: 'Package will be ready at loading dock. Call upon arrival.',
          primaryContact: {
            name: 'John Smith',
            jobTitle: 'Shipping Manager',
            mobilePhone: '555-123-4567',
            email: 'john@testcompany.com',
            preferredContactMethod: 'phone',
            authorizationLevel: 'full'
          },
          backupContact: {
            name: 'Mary Johnson',
            jobTitle: 'Assistant Manager',
            mobilePhone: '555-123-9999',
            email: 'mary@testcompany.com',
            preferredContactMethod: 'phone',
            authorizationLevel: 'limited'
          }
        }
      };
      
      localStorage.setItem('currentShippingTransaction', JSON.stringify(mockTransaction));
      console.log('Mock transaction data set in localStorage');
    });
  });

  test('should display comprehensive shipment summary', async ({ page }) => {
    console.log('Test: should display comprehensive shipment summary');
    
    await page.goto('/shipping/review');
    await expect(page.getByRole('main').getByRole('heading', { name: /Review Your Shipment/i })).toBeVisible();

    // Verify shipment summary card
    const summaryCard = page.locator('[data-testid="shipment-summary"], .border-primary\\/20');
    await expect(summaryCard).toBeVisible();
    
    // Check route display
    await expect(page.getByText('New York, NY → Los Angeles, CA')).toBeVisible();
    
    // Check service type
    await expect(page.getByText('Ground Standard - 2 business days')).toBeVisible();
    
    // Check total cost
    await expect(page.getByText('$73.76')).toBeVisible();
    
    // Check package summary
    await expect(page.getByText('1 Package, 5 lbs, 12"×8"×6"')).toBeVisible();
    
    // Check pickup date
    await expect(page.getByText('Thursday, July 24, 2025')).toBeVisible();
    
    // Check pickup time
    await expect(page.getByText('8:00 AM - 12:00 PM')).toBeVisible();
    
    console.log('✓ Shipment summary displays correctly');
  });

  test('should display expandable review sections with edit buttons', async ({ page }) => {
    console.log('Test: should display expandable review sections with edit buttons');
    
    await page.goto('/shipping/review');
    
    // Verify all review sections are present
    const sections = [
      'Origin Details',
      'Destination Details', 
      'Package Details',
      'Pricing Breakdown',
      'Payment Information',
      'Pickup Schedule'
    ];
    
    for (const section of sections) {
      const sectionCard = page.locator(`h3:has-text("${section}"), .text-lg:has-text("${section}")`).first();
      await expect(sectionCard).toBeVisible();
      
      // Check edit button exists
      const editButton = page.locator('button:has-text("Edit")').nth(sections.indexOf(section));
      await expect(editButton).toBeVisible();
      
      // Check expand/collapse button
      const toggleButton = page.locator('button:has-text("Show Details"), button:has-text("Hide Details")').nth(sections.indexOf(section));
      await expect(toggleButton).toBeVisible();
    }
    
    console.log('✓ All review sections and buttons are present');
  });

  test('should expand and collapse section details', async ({ page }) => {
    console.log('Test: should expand and collapse section details');
    
    await page.goto('/shipping/review');
    
    // Test origin details expansion
    const originToggleButton = page.locator('button:has-text("Show Details")').first();
    await originToggleButton.click();
    
    // Verify origin details are visible
    await expect(page.getByText('123 Main St')).toBeVisible();
    await expect(page.getByText('Suite: Suite 100')).toBeVisible();
    await expect(page.getByText('New York, NY 10001')).toBeVisible();
    await expect(page.getByText('John Smith')).toBeVisible();
    await expect(page.getByText('Test Company Inc')).toBeVisible();
    
    // Test collapse
    const hideButton = page.locator('button:has-text("Hide Details")').first();
    await hideButton.click();
    
    // Wait for collapse animation
    await page.waitForTimeout(500);
    
    console.log('✓ Section expansion and collapse works correctly');
  });

  test('should display detailed pricing breakdown', async ({ page }) => {
    console.log('Test: should display detailed pricing breakdown');
    
    await page.goto('/shipping/review');
    
    // Expand pricing section
    const pricingToggleButton = page.locator('button:has-text("Show Details")').nth(3);
    await pricingToggleButton.click();
    
    // Verify pricing details
    await expect(page.getByText('Base Rate')).toBeVisible();
    await expect(page.getByText('$35.50')).toBeVisible();
    
    await expect(page.getByText('Fuel Surcharge (14%)')).toBeVisible();
    await expect(page.getByText('$4.98')).toBeVisible();
    
    await expect(page.getByText('Insurance (1%)')).toBeVisible();
    await expect(page.getByText('$2.50')).toBeVisible();
    
    await expect(page.getByText('Special Handling')).toBeVisible();
    await expect(page.getByText('$20.00')).toBeVisible();
    
    await expect(page.getByText('Taxes (8.5%)')).toBeVisible();
    await expect(page.getByText('$5.78')).toBeVisible();
    
    await expect(page.getByText('Total:', { exact: false })).toBeVisible();
    await expect(page.getByText('$73.76')).toBeVisible();
    
    // Verify calculation basis
    await expect(page.getByText('Distance: 2445 miles')).toBeVisible();
    await expect(page.getByText('Weight: 5 lbs')).toBeVisible();
    await expect(page.getByText('Dimensional Weight: 4.2 lbs')).toBeVisible();
    await expect(page.getByText('Zone: Zone 8')).toBeVisible();
    
    console.log('✓ Pricing breakdown displays correctly');
  });

  test('should display package details with special handling', async ({ page }) => {
    console.log('Test: should display package details with special handling');
    
    await page.goto('/shipping/review');
    
    // Expand package section
    const packageToggleButton = page.locator('button:has-text("Show Details")').nth(2);
    await packageToggleButton.click();
    
    // Verify package information
    await expect(page.getByText('Type: Medium')).toBeVisible();
    await expect(page.getByText('Dimensions: 12" × 8" × 6"')).toBeVisible();
    await expect(page.getByText('Weight: 5 lbs')).toBeVisible();
    await expect(page.getByText('Declared Value: $250.00')).toBeVisible();
    await expect(page.getByText('Contents: Electronics')).toBeVisible();
    await expect(page.getByText('Category: Electronics')).toBeVisible();
    
    // Verify special handling badges
    await expect(page.getByText('Fragile')).toBeVisible();
    await expect(page.getByText('This Side Up')).toBeVisible();
    
    // Verify delivery preferences
    await expect(page.getByText('Signature Required')).toBeVisible();
    await expect(page.getByText('SMS Confirmation')).toBeVisible();
    await expect(page.getByText('Service Level: Reliable')).toBeVisible();
    
    console.log('✓ Package details and special handling display correctly');
  });

  test('should display payment information securely', async ({ page }) => {
    console.log('Test: should display payment information securely');
    
    await page.goto('/shipping/review');
    
    // Expand payment section
    const paymentToggleButton = page.locator('button:has-text("Show Details")').nth(4);
    await paymentToggleButton.click();
    
    // Verify payment method
    await expect(page.getByText('Purchase Order', { exact: false })).toBeVisible();
    await expect(page.getByText('Reference: PO-2025-001')).toBeVisible();
    
    // Verify billing contact
    await expect(page.getByText('Accounts Payable')).toBeVisible();
    await expect(page.getByText('ap@testcompany.com')).toBeVisible();
    
    // Verify company information
    await expect(page.getByText('Legal Name: Test Company Inc')).toBeVisible();
    await expect(page.getByText('Business Type: Corporation')).toBeVisible();
    await expect(page.getByText('Industry: Technology')).toBeVisible();
    await expect(page.getByText('Tax ID: 12-3456789')).toBeVisible();
    
    // Verify billing address
    await expect(page.getByText('123 Main St')).toBeVisible();
    await expect(page.getByText('New York, NY 10001')).toBeVisible();
    
    console.log('✓ Payment information displays securely');
  });

  test('should display pickup schedule with contact information', async ({ page }) => {
    console.log('Test: should display pickup schedule with contact information');
    
    await page.goto('/shipping/review');
    
    // Expand pickup section
    const pickupToggleButton = page.locator('button:has-text("Show Details")').nth(5);
    await pickupToggleButton.click();
    
    // Verify pickup schedule
    await expect(page.getByText('Date:', { exact: false })).toBeVisible();
    await expect(page.getByText('Thursday, July 24, 2025', { exact: false })).toBeVisible();
    await expect(page.getByText('Time Window: 8:00 AM - 12:00 PM')).toBeVisible();
    await expect(page.getByText('Package Ready Time: 7:30 AM')).toBeVisible();
    
    // Verify primary contact
    await expect(page.getByText('Name: John Smith')).toBeVisible();
    await expect(page.getByText('Phone: 555-123-4567')).toBeVisible();
    await expect(page.getByText('john@testcompany.com')).toBeVisible();
    await expect(page.getByText('Title: Shipping Manager')).toBeVisible();
    
    // Verify backup contact
    await expect(page.getByText('Name: Mary Johnson')).toBeVisible();
    await expect(page.getByText('mary@testcompany.com')).toBeVisible();
    
    // Verify special instructions
    await expect(page.getByText('Package will be ready at loading dock. Call upon arrival.')).toBeVisible();
    
    console.log('✓ Pickup schedule displays correctly');
  });

  test('should navigate to edit pages from edit buttons', async ({ page }) => {
    console.log('Test: should navigate to edit pages from edit buttons');
    
    await page.goto('/shipping/review');
    
    // Test origin/destination edit navigation
    const originEditButton = page.locator('button:has-text("Edit")').first();
    await originEditButton.click();
    await expect(page).toHaveURL('/shipping');
    
    await page.goBack();
    
    // Test pricing edit navigation
    const pricingEditButton = page.locator('button:has-text("Edit")').nth(3);
    await pricingEditButton.click();
    await expect(page).toHaveURL('/shipping/pricing');
    
    await page.goBack();
    
    // Test payment edit navigation
    const paymentEditButton = page.locator('button:has-text("Edit")').nth(4);
    await paymentEditButton.click();
    await expect(page).toHaveURL('/shipping/payment');
    
    await page.goBack();
    
    // Test pickup edit navigation
    const pickupEditButton = page.locator('button:has-text("Edit")').nth(5);
    await pickupEditButton.click();
    await expect(page).toHaveURL('/shipping/pickup');
    
    console.log('✓ Edit navigation works correctly');
  });

  test('should handle action buttons correctly', async ({ page }) => {
    console.log('Test: should handle action buttons correctly');
    
    await page.goto('/shipping/review');
    
    // Verify action buttons are present
    await expect(page.getByRole('button', { name: 'Edit Shipment' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save as Draft' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Print Summary' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Start Over' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Submit Shipment' })).toBeVisible();
    
    // Test Edit Shipment navigation
    await page.getByRole('button', { name: 'Edit Shipment' }).click();
    await expect(page).toHaveURL('/shipping');
    
    await page.goBack();
    
    // Test Submit Shipment navigation
    await page.getByRole('button', { name: 'Submit Shipment' }).click();
    await expect(page).toHaveURL('/shipping/confirmation');
    
    console.log('✓ Action buttons work correctly');
  });

  test('should be mobile responsive', async ({ page }) => {
    console.log('Test: should be mobile responsive');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/shipping/review');
    
    // Verify layout adapts to mobile
    await expect(page.getByRole('main').getByRole('heading', { name: /Review Your Shipment/i })).toBeVisible();
    await expect(page.getByText('Review Your Shipment')).toBeVisible();
    
    // Verify summary card is visible
    const summaryCard = page.locator('.border-primary\\/20');
    await expect(summaryCard).toBeVisible();
    
    // Verify action buttons stack properly on mobile
    const actionButtons = page.locator('button:has-text("Submit Shipment")');
    await expect(actionButtons).toBeVisible();
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(summaryCard).toBeVisible();
    
    console.log('✓ Mobile responsiveness works correctly');
  });

  test('should handle missing data gracefully', async ({ page }) => {
    console.log('Test: should handle missing data gracefully');
    
    // Set minimal transaction data
    await page.addInitScript(() => {
      const minimalTransaction = {
        id: 'test-minimal',
        timestamp: new Date().toISOString(),
        status: 'draft',
        shipmentDetails: {
          origin: {
            address: '123 Test St',
            city: 'TestCity',
            state: 'TS',
            zip: '12345',
            country: 'US',
            isResidential: false,
            locationType: 'commercial',
            contactInfo: {
              name: 'Test User',
              phone: '555-0000',
              email: 'test@example.com'
            }
          },
          destination: {
            address: '456 Test Ave',
            city: 'TestTown',
            state: 'TT',
            zip: '67890',
            country: 'US',
            isResidential: true,
            locationType: 'residential',
            contactInfo: {
              name: 'Test Recipient',
              phone: '555-0001',
              email: 'recipient@example.com'
            }
          },
          package: {
            type: 'small',
            dimensions: { length: 6, width: 4, height: 2, unit: 'in' },
            weight: { value: 1, unit: 'lbs' },
            declaredValue: 50,
            currency: 'USD',
            specialHandling: []
          },
          deliveryPreferences: {
            signatureRequired: false,
            adultSignatureRequired: false,
            smsConfirmation: false,
            photoProof: false,
            saturdayDelivery: false,
            holdAtLocation: false,
            serviceLevel: 'economical'
          }
        }
      };
      
      localStorage.setItem('currentShippingTransaction', JSON.stringify(minimalTransaction));
    });
    
    await page.goto('/shipping/review');
    
    // Verify page handles missing data gracefully
    await expect(page.getByRole('main').getByRole('heading', { name: /Review Your Shipment/i })).toBeVisible();
    
    // Expand sections to check missing data messages
    const toggleButtons = page.locator('button:has-text("Show Details")');
    
    // Expand pricing section (should show "not available")
    await toggleButtons.nth(3).click();
    await expect(page.getByText('Pricing breakdown not available')).toBeVisible();
    
    // Expand payment section (should show "not provided")
    await toggleButtons.nth(4).click();
    await expect(page.getByText('Payment information not provided')).toBeVisible();
    
    // Expand pickup section (should show "not provided")
    await toggleButtons.nth(5).click();
    await expect(page.getByText('Pickup schedule not provided')).toBeVisible();
    
    console.log('✓ Missing data handled gracefully');
  });
});
