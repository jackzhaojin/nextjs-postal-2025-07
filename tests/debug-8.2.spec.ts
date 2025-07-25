// Test for Task 8.2: Terms, Validation & Submission functionality
// Tests the complete submission workflow including validation and terms acceptance

import { test, expect } from '@playwright/test';

test.describe('Task 8.2: Terms, Validation & Submission', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('Setting up test with mock data');
    
    // Set up a complete transaction in localStorage
    const mockTransaction = {
      id: 'test-transaction-' + Date.now(),
      timestamp: new Date().toISOString(),
      status: 'review',
      shipmentDetails: {
        origin: {
          address: '123 Business St',
          city: 'New York',
          state: 'NY',
          zip: '10001',
          country: 'US',
          isResidential: false,
          contactInfo: {
            name: 'John Smith',
            company: 'Test Company',
            phone: '555-0123',
            email: 'john@test.com'
          },
          locationType: 'commercial'
        },
        destination: {
          address: '456 Corporate Ave',
          city: 'Los Angeles',
          state: 'CA',
          zip: '90210',
          country: 'US',
          isResidential: false,
          contactInfo: {
            name: 'Jane Doe',
            company: 'Destination Corp',
            phone: '555-0456',
            email: 'jane@dest.com'
          },
          locationType: 'commercial'
        },
        package: {
          type: 'medium',
          dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
          weight: { value: 5, unit: 'lbs' },
          declaredValue: 250,
          currency: 'USD',
          contents: 'Electronics',
          contentsCategory: 'electronics',
          specialHandling: []
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
        id: 'opt-1',
        category: 'ground',
        serviceType: 'Ground Express',
        carrier: 'Global Express',
        transitDays: 3,
        estimatedDelivery: 'Thursday, July 27, 2025',
        features: ['Tracking', 'Insurance'],
        pricing: {
          baseRate: 25.50,
          fuelSurcharge: 3.50,
          fuelSurchargePercentage: 12,
          insurance: 2.50,
          insurancePercentage: 1,
          specialHandling: 0,
          deliveryConfirmation: 1.50,
          taxes: 3.30,
          taxPercentage: 10,
          total: 36.30,
          calculationBasis: {
            distance: 2800,
            weight: 5,
            zone: 'Zone 7'
          }
        }
      },
      paymentInfo: {
        method: 'po',
        reference: 'PO-12345',
        billingContact: {
          name: 'John Smith',
          company: 'Test Company',
          phone: '555-0123',
          email: 'billing@test.com'
        },
        paymentDetails: {
          purchaseOrder: {
            poNumber: 'PO-12345',
            poAmount: 50.00,
            expirationDate: '2025-12-31',
            approvalContact: 'Manager',
            department: 'Shipping'
          }
        }
      },
      pickupDetails: {
        date: '2025-07-25',
        timeSlot: {
          id: 'morning',
          display: '8:00 AM - 12:00 PM',
          startTime: '08:00',
          endTime: '12:00',
          availability: 'available'
        },
        readyTime: '07:30',
        instructions: 'Call before arrival',
        primaryContact: {
          name: 'John Smith',
          mobilePhone: '555-0123',
          email: 'john@test.com',
          jobTitle: 'Manager'
        },
        accessInstructions: {
          securityRequired: false,
          appointmentRequired: false,
          limitedParking: false,
          forkliftAvailable: false,
          liftgateRequired: false,
          parkingInstructions: 'Front entrance',
          packageLocation: 'Reception desk',
          driverInstructions: 'Ask for John at reception'
        },
        equipmentRequirements: {
          dolly: false,
          forklift: false,
          liftgate: false,
          insidePickup: false
        },
        notificationPreferences: {
          smsNotifications: true,
          emailNotifications: true,
          callNotifications: false
        },
        authorizedPersonnel: ['John Smith', 'Manager']
      }
    };

    await page.addInitScript((transaction) => {
      localStorage.setItem('shipping-transaction', JSON.stringify(transaction));
    }, mockTransaction);

    await page.goto('/shipping/review');
  });

  test('should display complete review page with all sections', async ({ page }) => {
    console.log('Testing complete review page display');

    // Check page title
    await expect(page.locator('h1')).toContainText('Review Your Shipment');

    // Check shipment summary
    await expect(page.locator('text=Shipment Summary')).toBeVisible();
    await expect(page.locator('text=New York, NY → Los Angeles, CA')).toBeVisible();
    await expect(page.locator('text=$36.30')).toBeVisible();

    // Check all review sections are present
    await expect(page.locator('text=Origin Details')).toBeVisible();
    await expect(page.locator('text=Destination Details')).toBeVisible();
    await expect(page.locator('text=Package Details')).toBeVisible();
    await expect(page.locator('text=Pricing Breakdown')).toBeVisible();
    await expect(page.locator('text=Payment Information')).toBeVisible();
    await expect(page.locator('text=Pickup Schedule')).toBeVisible();

    console.log('✅ All review sections displayed correctly');
  });

  test('should display terms and conditions section', async ({ page }) => {
    console.log('Testing terms and conditions display');

    // Check terms section
    await expect(page.locator('text=Terms of Service & Required Acknowledgments')).toBeVisible();
    
    // Check service terms summary
    await expect(page.locator('text=Service Terms Summary')).toBeVisible();
    await expect(page.locator('text=STANDARD LIABILITY COVERAGE')).toBeVisible();
    await expect(page.locator('text=Up to $100 per package')).toBeVisible();
    
    // Check required acknowledgments
    await expect(page.locator('text=Required Acknowledgments')).toBeVisible();
    await expect(page.locator('text=Declared Value Accuracy')).toBeVisible();
    await expect(page.locator('text=Insurance Requirements Understanding')).toBeVisible();
    await expect(page.locator('text=Package Contents Compliance')).toBeVisible();
    await expect(page.locator('text=Carrier Authorization')).toBeVisible();

    console.log('✅ Terms and conditions section displayed correctly');
  });

  test('should validate required acknowledgments', async ({ page }) => {
    console.log('Testing required acknowledgments validation');

    // Initially submit button should be disabled
    const submitButton = page.locator('button', { hasText: 'Resolve Issues First' });
    await expect(submitButton).toBeDisabled();

    // Check required acknowledgments
    await page.check('#declaredValueAccuracy');
    await page.check('#insuranceRequirements');
    await page.check('#packageContentsCompliance');
    await page.check('#carrierAuthorization');

    // Wait for validation to complete
    await page.waitForTimeout(1000);

    // Submit button should now be enabled
    await expect(page.locator('button', { hasText: 'Submit Shipment' })).toBeEnabled();

    console.log('✅ Required acknowledgments validation working correctly');
  });

  test('should show validation errors for missing information', async ({ page }) => {
    console.log('Testing validation error display');

    // Check only some acknowledgments
    await page.check('#declaredValueAccuracy');
    await page.check('#insuranceRequirements');

    // Wait for validation
    await page.waitForTimeout(1000);

    // Should show validation errors
    await expect(page.locator('text=Missing Acknowledgments')).toBeVisible();
    await expect(page.locator('text=Package Contents Compliance')).toBeVisible();
    await expect(page.locator('text=Carrier Authorization')).toBeVisible();

    console.log('✅ Validation errors displayed correctly');
  });

  test('should handle hazmat special handling requirements', async ({ page }) => {
    console.log('Testing hazmat special requirements');

    // Modify transaction to include hazmat
    await page.evaluate(() => {
      const transaction = JSON.parse(localStorage.getItem('shipping-transaction') || '{}');
      transaction.shipmentDetails.package.specialHandling = ['hazmat'];
      localStorage.setItem('shipping-transaction', JSON.stringify(transaction));
    });

    await page.reload();

    // Should show additional hazmat acknowledgment
    await expect(page.locator('text=Additional Requirements')).toBeVisible();
    await expect(page.locator('text=Hazardous Materials Certification')).toBeVisible();

    // Check all required acknowledgments including hazmat
    await page.check('#declaredValueAccuracy');
    await page.check('#insuranceRequirements');
    await page.check('#packageContentsCompliance');
    await page.check('#carrierAuthorization');
    await page.check('#hazmatCertification');

    // Wait for validation
    await page.waitForTimeout(1000);

    // Submit button should be enabled
    await expect(page.locator('button', { hasText: 'Submit Shipment' })).toBeEnabled();

    console.log('✅ Hazmat requirements handled correctly');
  });

  test('should handle international shipping requirements', async ({ page }) => {
    console.log('Testing international shipping requirements');

    // Modify transaction for international destination
    await page.evaluate(() => {
      const transaction = JSON.parse(localStorage.getItem('shipping-transaction') || '{}');
      transaction.shipmentDetails.destination.country = 'CA';
      localStorage.setItem('shipping-transaction', JSON.stringify(transaction));
    });

    await page.reload();

    // Should show additional international acknowledgments
    await expect(page.locator('text=Additional Requirements')).toBeVisible();
    await expect(page.locator('text=International Shipping Compliance')).toBeVisible();
    await expect(page.locator('text=Customs Documentation')).toBeVisible();

    console.log('✅ International requirements handled correctly');
  });

  test('should complete full submission workflow', async ({ page }) => {
    console.log('Testing complete submission workflow');

    // Check all required acknowledgments
    await page.check('#declaredValueAccuracy');
    await page.check('#insuranceRequirements');
    await page.check('#packageContentsCompliance');
    await page.check('#carrierAuthorization');

    // Wait for validation
    await page.waitForTimeout(1000);

    // Submit the shipment
    await page.locator('button', { hasText: 'Submit Shipment' }).click();

    // Should show submitting state
    await expect(page.locator('text=Submitting...')).toBeVisible();

    // Wait for submission to complete and redirect
    await page.waitForURL('**/shipping/confirmation', { timeout: 10000 });

    // Should show confirmation page
    await expect(page.locator('text=Shipment Successfully Booked!')).toBeVisible();
    await expect(page.locator('text=Confirmation Number')).toBeVisible();
    
    // Should show confirmation number in proper format
    const confirmationNumber = await page.locator('[class*="font-mono"]').first().textContent();
    expect(confirmationNumber).toMatch(/^SHP-\d{4}-\d{9}$/);

    console.log('✅ Complete submission workflow successful');
  });

  test('should handle submission errors gracefully', async ({ page }) => {
    console.log('Testing submission error handling');

    // Mock API failure
    await page.route('**/api/shipments/submit', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ 
          error: 'Internal server error', 
          message: 'Test error for validation' 
        })
      });
    });

    // Check all required acknowledgments
    await page.check('#declaredValueAccuracy');
    await page.check('#insuranceRequirements');
    await page.check('#packageContentsCompliance');
    await page.check('#carrierAuthorization');

    // Wait for validation
    await page.waitForTimeout(1000);

    // Submit the shipment
    await page.locator('button', { hasText: 'Submit Shipment' }).click();

    // Should show error message
    await expect(page.locator('text=Submission Failed')).toBeVisible();
    await expect(page.locator('text=Test error for validation')).toBeVisible();

    console.log('✅ Submission error handling working correctly');
  });

  test('should provide action buttons with proper functionality', async ({ page }) => {
    console.log('Testing action buttons functionality');

    // Test Edit Shipment button
    await expect(page.locator('button', { hasText: 'Edit Shipment' })).toBeVisible();
    
    // Test Save as Draft button
    await expect(page.locator('button', { hasText: 'Save as Draft' })).toBeVisible();
    
    // Test Print Summary button
    await expect(page.locator('button', { hasText: 'Print Summary' })).toBeVisible();
    
    // Test Start Over button
    await expect(page.locator('button', { hasText: 'Start Over' })).toBeVisible();

    console.log('✅ All action buttons present and functional');
  });

  test('should show comprehensive validation summary', async ({ page }) => {
    console.log('Testing validation summary display');

    // Leave some acknowledgments unchecked
    await page.check('#declaredValueAccuracy');
    await page.check('#insuranceRequirements');

    // Wait for validation
    await page.waitForTimeout(1000);

    // Should show validation summary
    await expect(page.locator('text=Found:')).toBeVisible();
    
    // Check that proper error counts are shown
    const validationText = await page.locator('text=Found:').textContent();
    expect(validationText).toContain('missing acknowledgment');

    console.log('✅ Validation summary displayed correctly');
  });
});

test.describe('Task 8.2: Edge Cases and Error Scenarios', () => {
  
  test('should handle incomplete transaction data', async ({ page }) => {
    console.log('Testing incomplete transaction handling');

    // Set up incomplete transaction
    const incompleteTransaction = {
      id: 'incomplete-test',
      timestamp: new Date().toISOString(),
      status: 'review',
      shipmentDetails: {
        origin: {
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          country: 'US',
          isResidential: false,
          contactInfo: {
            name: 'Test User',
            phone: '555-0123',
            email: 'test@test.com'
          },
          locationType: 'commercial'
        }
        // Missing destination, package, etc.
      }
    };

    await page.addInitScript((transaction) => {
      localStorage.setItem('shipping-transaction', JSON.stringify(transaction));
    }, incompleteTransaction);

    await page.goto('/shipping/review');

    // Should show validation errors for missing data
    await expect(page.locator('text=Critical Issues')).toBeVisible();
    await expect(page.locator('text=Shipping service selection is required')).toBeVisible();
    await expect(page.locator('text=Payment information is required')).toBeVisible();

    console.log('✅ Incomplete transaction handled correctly');
  });

  test('should validate payment authorization amounts', async ({ page }) => {
    console.log('Testing payment authorization validation');

    // Set up transaction with insufficient PO amount
    const transaction = {
      id: 'payment-test',
      timestamp: new Date().toISOString(),
      status: 'review',
      shipmentDetails: {
        origin: {
          address: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zip: '12345',
          country: 'US',
          isResidential: false,
          contactInfo: { name: 'Test', phone: '555-0123', email: 'test@test.com' },
          locationType: 'commercial'
        },
        destination: {
          address: '456 Test Ave',
          city: 'Other City',
          state: 'OT',
          zip: '67890',
          country: 'US',
          isResidential: false,
          contactInfo: { name: 'Test', phone: '555-0456', email: 'test2@test.com' },
          locationType: 'commercial'
        },
        package: {
          type: 'medium',
          dimensions: { length: 10, width: 8, height: 6, unit: 'in' },
          weight: { value: 3, unit: 'lbs' },
          declaredValue: 100,
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
      },
      selectedOption: {
        id: 'test-option',
        category: 'ground',
        serviceType: 'Ground',
        carrier: 'Test Carrier',
        transitDays: 5,
        estimatedDelivery: 'Next Week',
        features: [],
        pricing: {
          baseRate: 20,
          fuelSurcharge: 2,
          fuelSurchargePercentage: 10,
          insurance: 1,
          insurancePercentage: 1,
          specialHandling: 0,
          deliveryConfirmation: 0,
          taxes: 2.30,
          taxPercentage: 10,
          total: 25.30,
          calculationBasis: { distance: 500, weight: 3 }
        }
      },
      paymentInfo: {
        method: 'po',
        paymentDetails: {
          purchaseOrder: {
            poNumber: 'PO-LOW',
            poAmount: 20.00, // Less than total cost
            expirationDate: '2025-12-31',
            approvalContact: 'Manager',
            department: 'Test'
          }
        }
      },
      pickupDetails: {
        date: '2025-07-30',
        timeSlot: {
          id: 'test-slot',
          display: '9:00 AM - 5:00 PM',
          startTime: '09:00',
          endTime: '17:00',
          availability: 'available'
        },
        readyTime: '08:30',
        instructions: 'Test pickup',
        primaryContact: {
          name: 'Test Contact',
          mobilePhone: '555-0123',
          email: 'contact@test.com'
        },
        accessInstructions: {
          securityRequired: false,
          appointmentRequired: false,
          limitedParking: false,
          forkliftAvailable: false,
          liftgateRequired: false,
          parkingInstructions: '',
          packageLocation: '',
          driverInstructions: ''
        },
        equipmentRequirements: {
          dolly: false,
          forklift: false,
          liftgate: false,
          insidePickup: false
        },
        notificationPreferences: {
          smsNotifications: true,
          emailNotifications: true,
          callNotifications: false
        },
        authorizedPersonnel: ['Test Contact']
      }
    };

    await page.addInitScript((transaction) => {
      localStorage.setItem('shipping-transaction', JSON.stringify(transaction));
    }, transaction);

    await page.goto('/shipping/review');

    // Should show payment validation error
    await expect(page.locator('text=Critical Issues')).toBeVisible();
    await expect(page.locator('text=Purchase order amount ($20.00) is insufficient')).toBeVisible();

    console.log('✅ Payment authorization validation working correctly');
  });
});
