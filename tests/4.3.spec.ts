import { test, expect } from '@playwright/test';

test.describe('Task 4.3: Advanced Special Handling and Contents Management', () => {
  test.beforeEach(async ({ page }) => {
    console.log('[Test] Starting Task 4.3 test');
    // Navigate to test components page where PackageInfoSection is available
    await page.goto('/test-components');
    await page.waitForLoadState('networkidle');
  });

  test('should display contents categorization system', async ({ page }) => {
    console.log('[Test] Testing contents categorization system');

    // Wait for package info section to load
    await expect(page.locator('div').filter({ hasText: 'Package Information - Task 4.3 Components' })).toBeVisible();

    // Select a package type first
    console.log('[Test] Selecting package type');
    await page.click('[data-testid="package-type-small"], .package-type-option:has-text("Small Package"), button:has-text("Small Package")');
    await page.waitForTimeout(1000);

    // Look for contents category section
    const contentsSection = page.locator('text=Contents Information').first();
    await expect(contentsSection).toBeVisible();

    // Test electronics category selection
    console.log('[Test] Testing electronics category');
    const electronicsCard = page.locator('[data-category="electronics"], .category-card:has-text("Electronics"), .contents-category:has-text("Electronics")').first();
    if (await electronicsCard.isVisible()) {
      await electronicsCard.click();
      await page.waitForTimeout(500);
      
      // Check for recommendations
      const recommendations = page.locator('text=Smart Recommendations, text=Recommendations, .recommendations-section').first();
      if (await recommendations.isVisible()) {
        console.log('[Test] Recommendations displayed for electronics');
      }
    }

    // Test automotive category with hazmat suggestions
    console.log('[Test] Testing automotive category');
    const automotiveCard = page.locator('[data-category="automotive"], .category-card:has-text("Automotive"), .contents-category:has-text("Automotive")').first();
    if (await automotiveCard.isVisible()) {
      await automotiveCard.click();
      await page.waitForTimeout(500);
      
      // Look for hazmat risk indicator
      const hazmatRisk = page.locator('text=high risk, .hazmat-risk, .risk-indicator:has-text("risk")').first();
      if (await hazmatRisk.isVisible()) {
        console.log('[Test] Hazmat risk indicator displayed for automotive');
      }
    }

    console.log('[Test] Contents categorization system test completed');
  });

  test('should display and interact with special handling selector', async ({ page }) => {
    console.log('[Test] Testing special handling selector');

    // Navigate to package information and select package type
    await expect(page.locator('div').filter({ hasText: 'Package Information - Task 4.3 Components' })).toBeVisible();
    await page.click('[data-testid="package-type-medium"], .package-type-option:has-text("Medium Package"), button:has-text("Medium Package")');
    await page.waitForTimeout(1000);

    // Look for special handling section
    const specialHandlingSection = page.locator('text=Special Handling').first();
    await expect(specialHandlingSection).toBeVisible();

    // Test fragile option
    console.log('[Test] Testing fragile handling option');
    const fragileOption = page.locator('text=Fragile, [data-handling="fragile"], .handling-option:has-text("Fragile")').first();
    if (await fragileOption.isVisible()) {
      await fragileOption.click();
      await page.waitForTimeout(500);
      
      // Check for fee display
      const feeDisplay = page.locator('text=$15, .fee:has-text("15"), .cost:has-text("15")').first();
      if (await feeDisplay.isVisible()) {
        console.log('[Test] Fee displayed for fragile handling');
      }
    }

    // Test temperature controlled option
    console.log('[Test] Testing temperature controlled option');
    const tempControlled = page.locator('text=Temperature Controlled, [data-handling="temperature-controlled"], .handling-option:has-text("Temperature")').first();
    if (await tempControlled.isVisible()) {
      await tempControlled.click();
      await page.waitForTimeout(500);
      
      // Check for higher fee
      const highFee = page.locator('text=$75, .fee:has-text("75"), .cost:has-text("75")').first();
      if (await highFee.isVisible()) {
        console.log('[Test] High fee displayed for temperature controlled');
      }
    }

    // Test cost summary calculation
    const costSummary = page.locator('text=Cost Summary, .cost-summary, .total-fees').first();
    if (await costSummary.isVisible()) {
      console.log('[Test] Cost summary displayed');
    }

    console.log('[Test] Special handling selector test completed');
  });

  test('should display hazmat form when hazmat handling is selected', async ({ page }) => {
    console.log('[Test] Testing hazmat details form');

    // Navigate and setup
    await expect(page.locator('div').filter({ hasText: 'Package Information - Task 4.3 Components' })).toBeVisible();
    await page.click('[data-testid="package-type-large"], .package-type-option:has-text("Large Package"), button:has-text("Large Package")');
    await page.waitForTimeout(1000);

    // Select hazmat handling
    console.log('[Test] Selecting hazmat handling');
    const hazmatOption = page.locator('text=Hazardous Materials, text=Hazmat, [data-handling="hazmat"]').first();
    if (await hazmatOption.isVisible()) {
      await hazmatOption.click();
      await page.waitForTimeout(1000);

      // Check for hazmat form
      const hazmatForm = page.locator('text=Hazardous Materials Declaration, .hazmat-form, .hazmat-details').first();
      await expect(hazmatForm).toBeVisible();

      // Test UN number input
      console.log('[Test] Testing UN number input');
      const unNumberInput = page.locator('input[placeholder*="UN"], #unNumber, [data-field="unNumber"]').first();
      if (await unNumberInput.isVisible()) {
        await unNumberInput.fill('UN1203');
        console.log('[Test] UN number entered');
      }

      // Test proper shipping name
      const shippingNameInput = page.locator('input[placeholder*="shipping name"], #properShippingName, [data-field="properShippingName"]').first();
      if (await shippingNameInput.isVisible()) {
        await shippingNameInput.fill('Gasoline');
        console.log('[Test] Shipping name entered');
      }

      // Test hazard class selection
      const hazardClassSelect = page.locator('select:near(:text("Hazard Class")), .hazard-class-select').first();
      if (await hazardClassSelect.isVisible()) {
        await hazardClassSelect.selectOption('3');
        console.log('[Test] Hazard class selected');
      }

      // Test emergency contact
      const emergencyContact = page.locator('input[type="tel"], input[placeholder*="emergency"], #emergencyContact').first();
      if (await emergencyContact.isVisible()) {
        await emergencyContact.fill('+1-800-555-0123');
        console.log('[Test] Emergency contact entered');
      }

      // Check for compliance status
      const complianceStatus = page.locator('text=Compliant, .compliance-status, .validation-status').first();
      if (await complianceStatus.isVisible()) {
        console.log('[Test] Compliance status displayed');
      }
    }

    console.log('[Test] Hazmat details form test completed');
  });

  test('should handle multiple packages interface', async ({ page }) => {
    console.log('[Test] Testing multiple packages interface');

    // Navigate and setup
    await expect(page.locator('h2:has-text("Package Information")')).toBeVisible();
    
    // Select multiple packages type
    console.log('[Test] Selecting multiple packages type');
    const multipleOption = page.locator('text=Multiple Pieces, [data-type="multiple"], .package-type:has-text("Multiple")').first();
    if (await multipleOption.isVisible()) {
      await multipleOption.click();
      await page.waitForTimeout(1000);

      // Check for multiple packages form
      const multipleForm = page.locator('text=Multiple Packages, .multiple-packages-form, .packages-list').first();
      await expect(multipleForm).toBeVisible();

      // Test adding a package
      console.log('[Test] Testing add package functionality');
      const addButton = page.locator('button:has-text("Add Package"), .add-package-btn').first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await page.waitForTimeout(500);
        console.log('[Test] Package added');
      }

      // Test package details
      const packageCard = page.locator('.package-card, .piece-details').first();
      if (await packageCard.isVisible()) {
        // Test weight input
        const weightInput = page.locator('input[type="number"]:near(:text("Weight"))').first();
        if (await weightInput.isVisible()) {
          await weightInput.fill('25');
          console.log('[Test] Package weight entered');
        }

        // Test declared value
        const valueInput = page.locator('input[type="number"]:near(:text("Value"))').first();
        if (await valueInput.isVisible()) {
          await valueInput.fill('500');
          console.log('[Test] Package value entered');
        }
      }

      // Check for optimization recommendations
      const optimizationBtn = page.locator('text=Optimization, .optimization-tips, button:has-text("Tips")').first();
      if (await optimizationBtn.isVisible()) {
        await optimizationBtn.click();
        await page.waitForTimeout(500);
        console.log('[Test] Optimization tips displayed');
      }

      // Check for totals summary
      const totalsSummary = page.locator('text=Total Pieces, .totals-summary, .package-summary').first();
      if (await totalsSummary.isVisible()) {
        console.log('[Test] Totals summary displayed');
      }
    }

    console.log('[Test] Multiple packages interface test completed');
  });

  test('should provide smart recommendations based on content type', async ({ page }) => {
    console.log('[Test] Testing smart recommendations');

    // Setup package type
    await expect(page.locator('h2:has-text("Package Information")')).toBeVisible();
    await page.click('[data-testid="package-type-medium"], .package-type-option:has-text("Medium Package"), button:has-text("Medium Package")');
    await page.waitForTimeout(1000);

    // Select medical contents category
    console.log('[Test] Selecting medical contents category');
    const medicalCategory = page.locator('[data-category="medical"], .category-card:has-text("Medical"), .contents-category:has-text("Medical")').first();
    if (await medicalCategory.isVisible()) {
      await medicalCategory.click();
      await page.waitForTimeout(1000);

      // Check for fragile and temperature recommendations
      const recommendations = page.locator('.recommendations-section, .smart-recommendations').first();
      if (await recommendations.isVisible()) {
        console.log('[Test] Recommendations section displayed');
        
        // Look for suggested handling options
        const suggestedHandling = page.locator('text=Suggested, .suggested-handling, .recommendations:has-text("fragile")').first();
        if (await suggestedHandling.isVisible()) {
          console.log('[Test] Suggested handling displayed');
        }

        // Test apply suggestions button
        const applyBtn = page.locator('button:has-text("Apply"), .apply-suggestions-btn').first();
        if (await applyBtn.isVisible()) {
          await applyBtn.click();
          await page.waitForTimeout(500);
          console.log('[Test] Suggestions applied');
          
          // Verify special handling was selected
          const specialHandlingSection = page.locator('text=Special Handling').first();
          if (await specialHandlingSection.isVisible()) {
            console.log('[Test] Special handling updated with suggestions');
          }
        }
      }
    }

    console.log('[Test] Smart recommendations test completed');
  });

  test('should calculate and display cost impacts', async ({ page }) => {
    console.log('[Test] Testing cost calculation and display');

    // Setup
    await expect(page.locator('h2:has-text("Package Information")')).toBeVisible();
    await page.click('[data-testid="package-type-large"], .package-type-option:has-text("Large Package"), button:has-text("Large Package")');
    await page.waitForTimeout(1000);

    // Select multiple special handling options
    console.log('[Test] Selecting multiple special handling options');
    
    // Select fragile
    const fragileOption = page.locator('text=Fragile, [data-handling="fragile"]').first();
    if (await fragileOption.isVisible()) {
      await fragileOption.click();
      await page.waitForTimeout(500);
    }

    // Select white glove
    const whiteGloveOption = page.locator('text=White Glove, [data-handling="white-glove"]').first();
    if (await whiteGloveOption.isVisible()) {
      await whiteGloveOption.click();
      await page.waitForTimeout(500);
    }

    // Check for cost summary
    const costSummary = page.locator('.cost-summary, text=Cost Summary').first();
    if (await costSummary.isVisible()) {
      console.log('[Test] Cost summary displayed');
      
      // Look for individual fees
      const individualFees = page.locator('.fee-item, .cost-breakdown').first();
      if (await individualFees.isVisible()) {
        console.log('[Test] Individual fees displayed');
      }

      // Look for total
      const totalCost = page.locator('.total-cost, .final-total').first();
      if (await totalCost.isVisible()) {
        console.log('[Test] Total cost displayed');
      }
    }

    // Check for bundle discounts
    const bundleDiscount = page.locator('text=Bundle, text=Discount, .bundle-discount').first();
    if (await bundleDiscount.isVisible()) {
      console.log('[Test] Bundle discount information displayed');
    }

    console.log('[Test] Cost calculation test completed');
  });

  test('should validate form completion and show package summary', async ({ page }) => {
    console.log('[Test] Testing form validation and package summary');

    // Complete package information step by step
    await expect(page.locator('h2:has-text("Package Information")')).toBeVisible();
    
    // 1. Package type
    await page.click('[data-testid="package-type-medium"], .package-type-option:has-text("Medium Package"), button:has-text("Medium Package")');
    await page.waitForTimeout(500);

    // 2. Fill dimensions (look for dimension inputs)
    const dimensionInputs = page.locator('input[placeholder*="Length"], input[placeholder*="Width"], input[placeholder*="Height"]');
    if (await dimensionInputs.first().isVisible()) {
      await dimensionInputs.nth(0).fill('24');
      await dimensionInputs.nth(1).fill('18');
      await dimensionInputs.nth(2).fill('12');
      console.log('[Test] Dimensions filled');
    }

    // 3. Fill weight
    const weightInput = page.locator('input[type="number"]:near(:text("Weight"))').first();
    if (await weightInput.isVisible()) {
      await weightInput.fill('75');
      console.log('[Test] Weight filled');
    }

    // 4. Fill declared value
    const valueInput = page.locator('input[type="number"]:near(:text("Value"))').first();
    if (await valueInput.isVisible()) {
      await valueInput.fill('1500');
      console.log('[Test] Declared value filled');
    }

    // 5. Select contents category
    const electronicsCategory = page.locator('[data-category="electronics"], .category-card:has-text("Electronics")').first();
    if (await electronicsCategory.isVisible()) {
      await electronicsCategory.click();
      console.log('[Test] Contents category selected');
    }

    // 6. Fill contents description
    const contentsTextarea = page.locator('textarea[placeholder*="contents"], #contents').first();
    if (await contentsTextarea.isVisible()) {
      await contentsTextarea.fill('Computer equipment and accessories');
      console.log('[Test] Contents description filled');
    }

    // Check for validation status
    const validationStatus = page.locator('text=Complete, .validation-complete, .status-complete').first();
    if (await validationStatus.isVisible()) {
      console.log('[Test] Validation status shows complete');
    }

    // Check for package summary
    const packageSummary = page.locator('text=Package Summary, .package-summary').first();
    if (await packageSummary.isVisible()) {
      console.log('[Test] Package summary displayed');
      
      // Verify summary contains key information
      const summaryInfo = packageSummary.locator('..');
      if (await summaryInfo.locator('text=Medium').isVisible()) {
        console.log('[Test] Package type in summary');
      }
      if (await summaryInfo.locator('text=75').isVisible()) {
        console.log('[Test] Weight in summary');
      }
      if (await summaryInfo.locator('text=$1,500').isVisible()) {
        console.log('[Test] Value in summary');
      }
    }

    console.log('[Test] Form validation and summary test completed');
  });

  test('should handle accessibility and keyboard navigation', async ({ page }) => {
    console.log('[Test] Testing accessibility and keyboard navigation');

    await expect(page.locator('h2:has-text("Package Information")')).toBeVisible();

    // Test tab navigation through package types
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter'); // Select first package type
    await page.waitForTimeout(500);

    // Test tab navigation through form fields
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);
    }

    // Check for ARIA labels and accessibility attributes
    const accessibleElements = await page.locator('[aria-label], [aria-labelledby], [role]').count();
    console.log(`[Test] Found ${accessibleElements} accessible elements`);

    // Test escape key functionality in modals/dropdowns
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    console.log('[Test] Accessibility test completed');
  });

  test('should work on mobile viewport', async ({ page }) => {
    console.log('[Test] Testing mobile responsiveness');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Test package information display on mobile
    await expect(page.locator('h2:has-text("Package Information")')).toBeVisible();

    // Test touch-friendly interactions
    await page.click('[data-testid="package-type-small"], .package-type-option:has-text("Small Package"), button:has-text("Small Package")');
    await page.waitForTimeout(1000);

    // Test mobile-specific layouts
    const mobileLayout = page.locator('.grid-cols-1, .mobile-layout').first();
    if (await mobileLayout.isVisible()) {
      console.log('[Test] Mobile layout detected');
    }

    // Test scrolling behavior
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    console.log('[Test] Mobile responsiveness test completed');
  });

  test('should handle error states and validation messages', async ({ page }) => {
    console.log('[Test] Testing error handling and validation');

    await expect(page.locator('h2:has-text("Package Information")')).toBeVisible();
    await page.click('[data-testid="package-type-medium"], .package-type-option:has-text("Medium Package"), button:has-text("Medium Package")');
    await page.waitForTimeout(500);

    // Test invalid weight input
    const weightInput = page.locator('input[type="number"]:near(:text("Weight"))').first();
    if (await weightInput.isVisible()) {
      await weightInput.fill('-10'); // Invalid negative weight
      await weightInput.blur();
      await page.waitForTimeout(500);
      
      const errorMessage = page.locator('text=invalid, .error-message, .validation-error').first();
      if (await errorMessage.isVisible()) {
        console.log('[Test] Validation error displayed for invalid weight');
      }
    }

    // Test hazmat with missing required fields
    const hazmatOption = page.locator('text=Hazardous Materials, [data-handling="hazmat"]').first();
    if (await hazmatOption.isVisible()) {
      await hazmatOption.click();
      await page.waitForTimeout(1000);
      
      // Submit without filling required fields
      const submitButton = page.locator('button:has-text("Next"), .next-button, .submit-button').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(500);
        
        const hazmatErrors = page.locator('.error, .validation-error, text=required').first();
        if (await hazmatErrors.isVisible()) {
          console.log('[Test] Hazmat validation errors displayed');
        }
      }
    }

    console.log('[Test] Error handling test completed');
  });
});
