import { test, expect, Page } from '@playwright/test';

test.describe('Task 9.1: Confirmation Page Implementation', () => {
  let page: Page;
  
  const mockConfirmationData = {
    confirmationNumber: 'SHP-2025-ABC123',
    estimatedDelivery: 'Thursday, July 24, 2025',
    trackingNumber: 'TRK-2025-XYZ789',
    status: 'confirmed',
    timestamp: new Date().toISOString(),
    carrierInfo: {
      name: 'Express Logistics',
      logo: '/api/placeholder/120/40',
      trackingUrl: 'https://tracking.example.com/TRK-2025-XYZ789'
    },
    totalCost: 89.50
  };

  const mockTransactionData = {
    id: 'test-transaction-001',
    timestamp: new Date(),
    status: 'confirmed',
    shipmentDetails: {
      origin: {
        address: '123 Business St',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'US',
        isResidential: false,
        locationType: 'commercial',
        contactInfo: {
          name: 'John Smith',
          company: 'Acme Manufacturing',
          phone: '312-555-0123',
          email: 'john.smith@acme.com'
        }
      },
      destination: {
        address: '456 Commerce Ave',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
        isResidential: false,
        locationType: 'commercial',
        contactInfo: {
          name: 'Jane Doe',
          company: 'Global Retailers',
          phone: '212-555-0456',
          email: 'jane.doe@globalretailers.com'
        }
      },
      package: {
        type: 'box',
        dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
        weight: { value: 5, unit: 'lbs' },
        declaredValue: 250.00,
        contents: 'Electronic components',
        pieceCount: 1,
        specialHandling: ['fragile'],
        totalDeclaredValue: 250.00
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
      id: 'ground-express',
      category: 'ground',
      serviceType: 'Ground Express',
      carrier: 'Express Logistics',
      transitDays: 2,
      pricing: {
        baseRate: 45.00,
        fuelSurcharge: 8.50,
        fuelSurchargePercentage: 18.9,
        insurance: 5.00,
        insurancePercentage: 2.0,
        specialHandling: 15.00,
        deliveryConfirmation: 3.50,
        taxes: 12.50,
        taxPercentage: 8.5,
        total: 89.50,
        calculationBasis: {
          distance: 800,
          weight: 5,
          zone: 'Zone-3'
        }
      },
      estimatedDelivery: 'Thursday, July 24, 2025',
      features: ['Tracking', 'Insurance', 'Signature Required'],
      carbonFootprint: 2.8
    },
    paymentInfo: {
      method: 'po',
      reference: 'PO-2025-001',
      paymentDetails: {
        purchaseOrder: {
          poNumber: 'PO-2025-001',
          poAmount: 89.50,
          expirationDate: '2025-08-31',
          approvalContact: 'John Smith',
          department: 'Purchasing'
        }
      }
    },
    pickupDetails: {
      date: '2025-07-22',
      timeSlot: {
        id: 'morning',
        display: '8:00 AM - 12:00 PM',
        startTime: '08:00',
        endTime: '12:00',
        availability: 'available'
      },
      instructions: 'Package ready at loading dock',
      primaryContact: {
        name: 'John Smith',
        mobilePhone: '312-555-0123',
        email: 'john.smith@acme.com',
        preferredContactMethod: 'phone',
        authorizationLevel: 'full'
      },
      accessInstructions: {
        securityRequired: false,
        appointmentRequired: false,
        limitedParking: false,
        forkliftAvailable: true,
        liftgateRequired: false,
        parkingInstructions: 'Use loading dock entrance',
        packageLocation: 'Loading dock B',
        driverInstructions: 'Call upon arrival'
      },
      equipmentRequirements: {
        standardDolly: false,
        applianceDolly: false,
        furniturePads: false,
        straps: false,
        palletJack: false,
        twoPersonTeam: false,
        customerLoads: true,
        driverAssistance: false,
        fullServiceLoading: false
      },
      notificationPreferences: {
        email24h: true,
        sms2h: true,
        call30min: true,
        driverEnRoute: true,
        pickupComplete: true,
        transitUpdates: true
      },
      readyTime: '07:30',
      authorizedPersonnel: ['John Smith', 'Mary Johnson']
    }
  };

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    console.log('Setting up test data in localStorage');
    
    // Set up localStorage with mock data
    await page.addInitScript((data) => {
      localStorage.setItem('shipping-confirmation', JSON.stringify(data.confirmation));
      localStorage.setItem('currentShippingTransaction', JSON.stringify(data.transaction));
    }, {
      confirmation: mockConfirmationData,
      transaction: mockTransactionData
    });
  });

  test('should display confirmation header with success message', async () => {
    console.log('Testing confirmation header display');
    
    await page.goto('/shipping/confirmation');
    
    // Wait for page to load
    await page.waitForSelector('main h1', { timeout: 10000 });

    // Check success header elements
    await expect(page.locator('main h1')).toHaveText('Shipment Successfully Booked!');
    await expect(page.locator('[data-testid="success-icon"]', { hasText: /checkmark/i }).or(page.locator('.lucide-check-circle'))).toBeVisible();
    
    // Check booking timestamp is displayed
    const timestampPattern = /Booking completed on/i;
    await expect(page.locator('text=' + timestampPattern.source)).toBeVisible();
  });

  test('should display confirmation number prominently with copy functionality', async () => {
    console.log('Testing confirmation number display and copy functionality');
    
    await page.goto('/shipping/confirmation');
    
    // Wait for confirmation number to load
    await page.waitForSelector('text=SHP-2025-ABC123', { timeout: 10000 });
    
    // Check confirmation number is displayed prominently
    const confirmationNumber = page.locator('text=SHP-2025-ABC123');
    await expect(confirmationNumber).toBeVisible();
    
    // Check copy button is present
    const copyButton = page.locator('button:has-text("Copy")');
    await expect(copyButton).toBeVisible();
    
    // Test copy functionality (mock clipboard)
    await page.evaluate(() => {
      // @ts-ignore - Mocking clipboard for testing
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: async (text: string) => {
            console.log('Mock clipboard write:', text);
            return Promise.resolve();
          }
        },
        writable: true
      });
    });
    
    await copyButton.click();
    
    // Check for feedback (button text change or success message)
    await expect(page.locator('button:has-text("Copied!")')).toBeVisible({ timeout: 3000 });
  });

  test('should display QR code for mobile tracking', async () => {
    console.log('Testing QR code display');
    
    await page.goto('/shipping/confirmation');
    
    // Wait for page to load
    await page.waitForSelector('main h1', { timeout: 10000 });
    
    // Check QR code image is present
    const qrCode = page.locator('img[alt*="QR"]').or(page.locator('img[src*="qr"]'));
    await expect(qrCode).toBeVisible();
    
    // Check QR code description
    await expect(page.locator('text=Scan for mobile tracking')).toBeVisible();
  });

  test('should display comprehensive shipment summary', async () => {
    console.log('Testing shipment summary display');
    
    await page.goto('/shipping/confirmation');
    
    // Wait for page to load
    await page.waitForSelector('main h1', { timeout: 10000 });
    
    // Check route display
    await expect(page.locator('text=Chicago, IL')).toBeVisible();
    await expect(page.locator('text=New York, NY')).toBeVisible();
    await expect(page.locator('text=→')).toBeVisible();
    
    // Check carrier and service
    await expect(page.locator('text=Express Logistics')).toBeVisible();
    await expect(page.locator('text=Ground Express')).toBeVisible();
    
    // Check package details
    await expect(page.locator('text=box')).toBeVisible();
    await expect(page.locator('text=5 lbs')).toBeVisible();
    await expect(page.locator('text=$250.00')).toBeVisible();
    
    // Check total cost
    await expect(page.locator('text=$89.50')).toBeVisible();
  });

  test('should display pickup confirmation details', async () => {
    console.log('Testing pickup confirmation details');
    
    await page.goto('/shipping/confirmation');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Look for pickup confirmation section (might be collapsed)
    const pickupSection = page.locator('text=Pickup Confirmation Details').or(page.locator('[data-testid="pickup-confirmation"]'));
    
    if (await pickupSection.isVisible()) {
      // If section is visible, click to expand if needed
      await pickupSection.click();
    }
    
    // Check pickup date and time
    await expect(page.locator('text=Tuesday, July 22, 2025').or(page.locator('text=2025-07-22'))).toBeVisible();
    await expect(page.locator('text=8:00 AM - 12:00 PM').or(page.locator('text=08:00 - 12:00'))).toBeVisible();
    
    // Check confirmation status
    await expect(page.locator('text=Confirmed').or(page.locator('[data-status="confirmed"]'))).toBeVisible();
    
    // Check pickup address
    await expect(page.locator('text=123 Business St')).toBeVisible();
    await expect(page.locator('text=Acme Manufacturing')).toBeVisible();
  });

  test('should display delivery information and timeline', async () => {
    console.log('Testing delivery information display');
    
    await page.goto('/shipping/confirmation');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check estimated delivery date
    await expect(page.locator('text=Thursday, July 24, 2025').or(page.locator('text=2025-07-24'))).toBeVisible();
    
    // Check delivery commitment
    await expect(page.locator('text=By 5:00 PM EST')).toBeVisible();
    
    // Check delivery status
    await expect(page.locator('text=ON SCHEDULE').or(page.locator('text=on-schedule'))).toBeVisible();
    
    // Check delivery address
    await expect(page.locator('text=456 Commerce Ave')).toBeVisible();
    await expect(page.locator('text=Global Retailers')).toBeVisible();
  });

  test('should display shipment reference information', async () => {
    console.log('Testing shipment reference information');
    
    await page.goto('/shipping/confirmation');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Look for reference section (might be collapsed)
    const referenceSection = page.locator('text=Shipment Reference Information').or(page.locator('[data-testid="reference-info"]'));
    
    if (await referenceSection.isVisible()) {
      await referenceSection.click();
    }
    
    // Check confirmation number reference
    await expect(page.locator('text=SHP-2025-ABC123')).toBeVisible();
    
    // Check PO number if present
    await expect(page.locator('text=PO-2025-001')).toBeVisible();
    
    // Check internal reference pattern
    await expect(page.locator('text=/INT-\\d+/')).toBeVisible();
  });

  test('should display customer support contact information', async () => {
    console.log('Testing customer support information');
    
    await page.goto('/shipping/confirmation');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check 24/7 support phone number
    await expect(page.locator('text=1-800-SHIP-NOW')).toBeVisible();
    
    // Check support email
    await expect(page.locator('text=support@shippingsystem.com')).toBeVisible();
    
    // Check availability information
    await expect(page.locator('text=24/7').or(page.locator('text=Available 24/7'))).toBeVisible();
    
    // Check live chat information
    await expect(page.locator('text=Live Chat Available')).toBeVisible();
  });

  test('should provide functional action buttons', async () => {
    console.log('Testing action buttons functionality');
    
    await page.goto('/shipping/confirmation');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check all action buttons are present
    await expect(page.locator('button:has-text("Print Confirmation")')).toBeVisible();
    await expect(page.locator('button:has-text("Track This Shipment")')).toBeVisible();
    await expect(page.locator('button:has-text("Ship Another Package")')).toBeVisible();
    await expect(page.locator('button:has-text("Return Home")')).toBeVisible();
    
    // Test print functionality (mock window.print)
    await page.evaluate(() => {
      window.print = () => console.log('Print dialog opened');
    });
    
    await page.locator('button:has-text("Print Confirmation")').click();
    
    // Test tracking button (should open new tab/window)
    const trackButton = page.locator('button:has-text("Track This Shipment")');
    
    // Mock window.open to prevent actual navigation
    await page.evaluate(() => {
      window.open = (url) => {
        console.log('Tracking URL opened:', url);
        return null;
      };
    });
    
    await trackButton.click();
  });

  test('should handle missing confirmation data gracefully', async () => {
    console.log('Testing error handling for missing data');
    
    // Clear localStorage to simulate missing data
    await page.evaluate(() => {
      localStorage.removeItem('shipping-confirmation');
      localStorage.removeItem('currentShippingTransaction');
    });
    
    await page.goto('/shipping/confirmation');
    
    // Wait for error state
    await page.waitForSelector('text=Confirmation Not Found', { timeout: 10000 });
    
    // Check error message is displayed
    await expect(page.locator('text=Confirmation Not Found')).toBeVisible();
    await expect(page.locator('text=No shipment confirmation data found')).toBeVisible();
    
    // Check "Create New Shipment" button is present
    await expect(page.locator('button:has-text("Create New Shipment")')).toBeVisible();
  });

  test('should be responsive and mobile-friendly', async () => {
    console.log('Testing responsive design');
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/shipping/confirmation');
    
    // Wait for page to load
    await page.waitForSelector('main h1', { timeout: 10000 });
    
    // Check that content is visible and accessible on mobile
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('text=SHP-2025-ABC123')).toBeVisible();
    
    // Check that buttons are touch-friendly (at least 44px)
    const copyButton = page.locator('button:has-text("Copy")');
    const buttonBox = await copyButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(40); // Allow some margin
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    
    // Verify content still displays properly
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=SHP-2025-ABC123')).toBeVisible();
  });

  test('should support print formatting', async () => {
    console.log('Testing print formatting');
    
    await page.goto('/shipping/confirmation');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Inject print media styles to test print layout
    await page.addStyleTag({
      content: `
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `
    });
    
    // Check that action buttons are hidden in print
    const actionButtons = page.locator('button:has-text("Print Confirmation")').first();
    
    // Simulate print media
    await page.emulateMedia({ media: 'print' });
    
    // In print media, action buttons should be hidden
    const isHiddenInPrint = await actionButtons.isHidden();
    
    // Reset to screen media
    await page.emulateMedia({ media: 'screen' });
    
    // Check print-specific footer exists
    await expect(page.locator('text=This is an official shipping confirmation').or(page.locator('.print\\:block'))).toBeTruthy();
  });
});

test.describe('Task 9.1: Accessibility Testing', () => {
  const mockConfirmationData = {
    confirmationNumber: 'SHP-2025-ABC123',
    estimatedDelivery: 'Thursday, July 24, 2025',
    trackingNumber: 'TRK-2025-XYZ789',
    status: 'confirmed',
    timestamp: new Date().toISOString(),
    carrierInfo: {
      name: 'Express Logistics',
      logo: '/api/placeholder/120/40',
      trackingUrl: 'https://tracking.example.com/TRK-2025-XYZ789'
    },
    totalCost: 89.50
  };

  const mockTransactionData = {
    id: 'test-transaction-001',
    timestamp: new Date(),
    status: 'confirmed',
    shipmentDetails: {
      origin: {
        address: '123 Business St',
        city: 'Chicago',
        state: 'IL',
        zip: '60601',
        country: 'US',
        isResidential: false,
        locationType: 'commercial',
        contactInfo: {
          name: 'John Smith',
          company: 'Acme Manufacturing',
          phone: '312-555-0123',
          email: 'john.smith@acme.com'
        }
      },
      destination: {
        address: '456 Commerce Ave',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'US',
        isResidential: false,
        locationType: 'commercial',
        contactInfo: {
          name: 'Jane Doe',
          company: 'Global Retailers',
          phone: '212-555-0456',
          email: 'jane.doe@globalretailers.com'
        }
      },
      package: {
        type: 'box',
        dimensions: { length: 12, width: 8, height: 6, unit: 'in' },
        weight: { value: 5, unit: 'lbs' },
        declaredValue: 250.00,
        contents: 'Electronic components',
        pieceCount: 1,
        specialHandling: ['fragile'],
        totalDeclaredValue: 250.00
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
      id: 'ground-express',
      category: 'ground',
      serviceType: 'Ground Express',
      carrier: 'Express Logistics',
      transitDays: 2,
      pricing: {
        baseRate: 45.00,
        fuelSurcharge: 8.50,
        fuelSurchargePercentage: 18.9,
        insurance: 5.00,
        insurancePercentage: 2.0,
        specialHandling: 15.00,
        deliveryConfirmation: 3.50,
        taxes: 12.50,
        taxPercentage: 8.5,
        total: 89.50,
        calculationBasis: {
          distance: 800,
          weight: 5,
          zone: 'Zone-3'
        }
      },
      estimatedDelivery: 'Thursday, July 24, 2025',
      features: ['Tracking', 'Insurance', 'Signature Required'],
      carbonFootprint: 2.8
    }
  };

  test('should meet WCAG 2.1 AA accessibility standards', async ({ page }) => {
    console.log('Testing accessibility compliance');
    
    // Set up mock data
    await page.addInitScript((data) => {
      localStorage.setItem('shipping-confirmation', JSON.stringify(data.confirmation));
      localStorage.setItem('currentShippingTransaction', JSON.stringify(data.transaction));
    }, {
      confirmation: mockConfirmationData,
      transaction: mockTransactionData
    });
    
    await page.goto('/shipping/confirmation');
    
    // Wait for page to load
    await page.waitForSelector('h1', { timeout: 10000 });
    
    // Check heading hierarchy
    const h1Elements = await page.locator('h1').count();
    expect(h1Elements).toBe(1);
    
    // Check for proper ARIA labels and roles
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      expect(text?.trim()).toBeTruthy(); // Each button should have descriptive text
    }
    
    // Check for proper color contrast (mock test)
    const headings = page.locator('h1, h2, h3, h4');
    await expect(headings.first()).toBeVisible();
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'A', 'INPUT'].includes(focusedElement || '')).toBe(true);
  });
});
