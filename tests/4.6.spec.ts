import { test, expect } from '@playwright/test';

test.describe('Task 4.6 - Package Information Integration', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Test setup: Navigating to shipping page');
    await page.goto('http://localhost:3001/shipping');
    // Wait for the page to fully load - wait for main content
    await page.waitForSelector('text=Shipment Details', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000); // Give components time to render
    console.log('Test setup complete: Page loaded');
  });

  test.describe('PackageTypeSelector Component', () => {
    test('should display package information section', async ({ page }) => {
      console.log('Testing basic package section display');
      
      // Check that package information section exists
      const packageSection = page.locator('text=Package Information').first();
      await expect(packageSection).toBeVisible();
      console.log('Package Information section is visible');
      
      // Look for actual package component elements using data-testids and specific selectors
      const weightInput = page.locator('[data-testid="weight-input"]');
      const dimensionLengthInput = page.locator('[data-testid="dimension-length"]');
      const declaredValueInput = page.locator('[data-testid="declared-value-input"]');
      
      await expect(weightInput).toBeVisible();
      await expect(dimensionLengthInput).toBeVisible();
      await expect(declaredValueInput).toBeVisible();
      console.log('Package component inputs are visible and working');
    });

    test('should select package type and show constraints', async ({ page }) => {
      console.log('Testing package type selection');
      
      // Select medium package type
      await page.click('[data-testid="package-type-medium"]');
      
      // Verify selection styling
      const selectedCard = page.locator('[data-testid="package-type-medium"]');
      await expect(selectedCard).toHaveClass(/ring-2 ring-blue-500/);
      console.log('Medium package type selected with correct styling');
      
      // Check if constraints are displayed
      const constraintsText = page.locator('text=Max: 36 × 24 × 18 in');
      await expect(constraintsText).toBeVisible();
      console.log('Package constraints displayed correctly');
    });

    test('should change package type and update weight/dimension constraints', async ({ page }) => {
      console.log('Testing package type constraint updates');
      
      // Start with envelope
      await page.click('[data-testid="package-type-envelope"]');
      await expect(page.locator('text=Max: 15 × 12 × 1 in')).toBeVisible();
      console.log('Envelope constraints shown');
      
      // Switch to large
      await page.click('[data-testid="package-type-large"]');
      await expect(page.locator('text=Max: 48 × 36 × 24 in')).toBeVisible();
      console.log('Large package constraints updated correctly');
    });
  });

  test.describe('WeightInput Component', () => {
    test('should accept weight input with unit conversion', async ({ page }) => {
      console.log('Testing weight input functionality');
      
      // Enter weight in pounds
      const weightInput = page.locator('[data-testid="weight-input"]');
      await weightInput.fill('10');
      
      // Verify input value
      await expect(weightInput).toHaveValue('10');
      console.log('Weight input accepts value correctly');
      
      // Switch to kg
      await page.click('[data-testid="unit-kg"]');
      
      // Check if value converted
      await expect(weightInput).toHaveValue(/^4\.5[0-9]*$/);
      console.log('Weight converted from lbs to kg correctly');
    });

    test('should validate weight against package type constraints', async ({ page }) => {
      console.log('Testing weight validation against package constraints');
      
      // Select envelope package type (max 1 lb)
      await page.click('[data-testid="package-type-envelope"]');
      
      // Enter weight that exceeds envelope limit
      const weightInput = page.locator('[data-testid="weight-input"]');
      await weightInput.fill('5');
      
      // Check for validation error
      const errorMessage = page.locator('text=Weight too high for envelope package');
      await expect(errorMessage).toBeVisible();
      console.log('Weight validation error displayed for envelope package');
    });

    test('should show billing weight calculation with dimensional weight', async ({ page }) => {
      console.log('Testing billing weight calculation');
      
      // Select medium package
      await page.click('[data-testid="package-type-medium"]');
      
      // Enter dimensions that create high dimensional weight
      await page.locator('[data-testid="dimension-length"]').fill('30');
      await page.locator('[data-testid="dimension-width"]').fill('20');
      await page.locator('[data-testid="dimension-height"]').fill('15');
      
      // Enter lower actual weight
      await page.locator('[data-testid="weight-input"]').fill('10');
      
      // Check for billing weight display
      const billingWeightInfo = page.locator('text=Billing Weight Calculation');
      await expect(billingWeightInfo).toBeVisible();
      console.log('Billing weight calculation displayed');
    });
  });

  test.describe('DimensionsInput Component', () => {
    test('should accept dimension inputs and calculate volume', async ({ page }) => {
      console.log('Testing dimension input and volume calculation');
      
      // Enter dimensions
      await page.locator('[data-testid="dimension-length"]').fill('12');
      await page.locator('[data-testid="dimension-width"]').fill('8');
      await page.locator('[data-testid="dimension-height"]').fill('6');
      
      // Verify volume calculation is displayed
      const volumeDisplay = page.locator('text=Volume: 576.00 cubic in');
      await expect(volumeDisplay).toBeVisible();
      console.log('Volume calculation displayed correctly');
    });

    test('should convert between units correctly', async ({ page }) => {
      console.log('Testing dimension unit conversion');
      
      // Enter dimensions in inches
      await page.locator('[data-testid="dimension-length"]').fill('12');
      await page.locator('[data-testid="dimension-width"]').fill('8');
      await page.locator('[data-testid="dimension-height"]').fill('6');
      
      // Switch to centimeters
      await page.click('[data-testid="unit-cm"]');
      
      // Check converted values (12 inches ≈ 30.48 cm)
      const lengthInput = page.locator('[data-testid="dimension-length"]');
      await expect(lengthInput).toHaveValue('30.48');
      console.log('Dimension unit conversion working correctly');
    });

    test('should validate dimensions against package type limits', async ({ page }) => {
      console.log('Testing dimension validation against package limits');
      
      // Select small package type
      await page.click('[data-testid="package-type-small"]');
      
      // Enter dimensions that exceed small package limits
      await page.locator('[data-testid="dimension-length"]').fill('25'); // exceeds 20" limit
      
      // Check for validation error
      const errorMessage = page.locator('text=Length cannot exceed 20 in for small package');
      await expect(errorMessage).toBeVisible();
      console.log('Dimension validation error displayed correctly');
    });
  });

  test.describe('DeclaredValueInput Component', () => {
    test('should accept declared value with currency selection', async ({ page }) => {
      console.log('Testing declared value input with currency');
      
      // Enter declared value
      const valueInput = page.locator('[data-testid="declared-value-input"]');
      await valueInput.fill('1000');
      
      // Verify input value
      await expect(valueInput).toHaveValue('1000');
      console.log('Declared value input accepts value');
      
      // Switch currency to CAD
      await page.click('[data-testid="currency-CAD"]');
      
      // Check if insurance calculation updates
      const insuranceInfo = page.locator('text=Insurance Coverage');
      await expect(insuranceInfo).toBeVisible();
      console.log('Insurance coverage information displayed');
    });

    test('should calculate insurance fees based on package type', async ({ page }) => {
      console.log('Testing insurance fee calculation');
      
      // Select large package type (higher insurance rate)
      await page.click('[data-testid="package-type-large"]');
      
      // Enter high declared value
      await page.locator('[data-testid="declared-value-input"]').fill('5000');
      
      // Check for insurance fee display
      const insuranceFeeText = page.locator('text=Insurance Fee:');
      await expect(insuranceFeeText).toBeVisible();
      console.log('Insurance fee calculation displayed');
    });

    test('should show validation warnings for high values', async ({ page }) => {
      console.log('Testing high value validation warnings');
      
      // Enter very high declared value
      await page.locator('[data-testid="declared-value-input"]').fill('75000');
      
      // Check for high value warning
      const warningMessage = page.locator('text=High declared value may require additional documentation');
      await expect(warningMessage).toBeVisible();
      console.log('High value warning displayed correctly');
    });
  });

  test.describe('SpecialHandlingSelector Component', () => {
    test('should select special handling options and calculate fees', async ({ page }) => {
      console.log('Testing special handling selection and fee calculation');
      
      // Select fragile handling
      const fragileCheckbox = page.locator('input[type="checkbox"]').first();
      await fragileCheckbox.check();
      
      // Verify fee calculation appears
      const feeDisplay = page.locator('text=Special Handling Cost Summary');
      await expect(feeDisplay).toBeVisible();
      console.log('Special handling fee summary displayed');
      
      // Check for individual fee
      const fragileFeePart = page.locator('text=$15');
      await expect(fragileFeePart).toBeVisible();
      console.log('Fragile handling fee displayed correctly');
    });

    test('should show bundle discounts for compatible options', async ({ page }) => {
      console.log('Testing special handling bundle discounts');
      
      // Select liftgate pickup (should trigger bundle discount suggestion)
      await page.locator('text=Liftgate Required at Pickup').click();
      
      // Check for bundle discount suggestion
      const bundleDiscount = page.locator('text=Available Bundle Discounts');
      await expect(bundleDiscount).toBeVisible();
      console.log('Bundle discount suggestion displayed');
    });

    test('should validate special handling compatibility', async ({ page }) => {
      console.log('Testing special handling compatibility validation');
      
      // Select envelope package type
      await page.click('[data-testid="package-type-envelope"]');
      
      // Try to select white glove service (incompatible with envelope)
      await page.locator('text=White Glove Service').click();
      
      // Check for compatibility warning
      const warningMessage = page.locator('text=White glove service not applicable to envelope packages');
      await expect(warningMessage).toBeVisible();
      console.log('Special handling compatibility warning displayed');
    });
  });

  test.describe('Integration Tests', () => {
    test('should complete full package information workflow', async ({ page }) => {
      console.log('Testing complete package information workflow');
      
      // Step 1: Select package type
      await page.click('[data-testid="package-type-medium"]');
      console.log('Step 1: Package type selected');
      
      // Step 2: Enter weight
      await page.locator('[data-testid="weight-input"]').fill('25');
      console.log('Step 2: Weight entered');
      
      // Step 3: Enter dimensions
      await page.locator('[data-testid="dimension-length"]').fill('20');
      await page.locator('[data-testid="dimension-width"]').fill('15');
      await page.locator('[data-testid="dimension-height"]').fill('10');
      console.log('Step 3: Dimensions entered');
      
      // Step 4: Enter declared value
      await page.locator('[data-testid="declared-value-input"]').fill('2500');
      console.log('Step 4: Declared value entered');
      
      // Step 5: Select special handling
      await page.locator('text=Fragile / Handle with Care').click();
      console.log('Step 5: Special handling selected');
      
      // Verify package summary is updated
      const packageSummary = page.locator('[data-testid="package-summary"]');
      await expect(packageSummary).toBeVisible();
      console.log('Package summary displayed with all information');
      
      // Check that all data is properly integrated
      await expect(page.locator('text=25 lbs')).toBeVisible();
      await expect(page.locator('text=20 × 15 × 10 in')).toBeVisible();
      await expect(page.locator('text=$2,500')).toBeVisible();
      console.log('Complete package information workflow successful');
    });

    test('should maintain data persistence across form interactions', async ({ page }) => {
      console.log('Testing data persistence across interactions');
      
      // Enter complete package information
      await page.click('[data-testid="package-type-large"]');
      await page.locator('[data-testid="weight-input"]').fill('50');
      await page.locator('[data-testid="dimension-length"]').fill('40');
      await page.locator('[data-testid="declared-value-input"]').fill('5000');
      
      // Navigate to different section and back
      await page.locator('text=Pickup Address (Origin)').click();
      await page.locator('text=Package Information').click();
      
      // Verify data is still there
      await expect(page.locator('[data-testid="weight-input"]')).toHaveValue('50');
      await expect(page.locator('[data-testid="dimension-length"]')).toHaveValue('40');
      await expect(page.locator('[data-testid="declared-value-input"]')).toHaveValue('5000');
      console.log('Data persistence verified across form interactions');
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle invalid input gracefully', async ({ page }) => {
      console.log('Testing invalid input handling');
      
      // Try to enter negative weight
      await page.locator('[data-testid="weight-input"]').fill('-10');
      
      // Input should reject negative values or show error
      const weightValue = await page.locator('[data-testid="weight-input"]').inputValue();
      expect(weightValue).not.toBe('-10');
      console.log('Negative weight input handled correctly');
      
      // Try to enter non-numeric declared value
      await page.locator('[data-testid="declared-value-input"]').fill('abc');
      
      // Should not accept non-numeric input
      const valueInput = await page.locator('[data-testid="declared-value-input"]').inputValue();
      expect(valueInput).not.toBe('abc');
      console.log('Non-numeric declared value input handled correctly');
    });

    test('should handle extreme values appropriately', async ({ page }) => {
      console.log('Testing extreme value handling');
      
      // Test very large dimension
      await page.locator('[data-testid="dimension-length"]').fill('1000');
      
      // Should show validation error
      const errorMessage = page.locator('.text-red-600');
      await expect(errorMessage).toBeVisible();
      console.log('Extreme dimension value validation working');
      
      // Test very high declared value
      await page.locator('[data-testid="declared-value-input"]').fill('999999');
      
      // Should show appropriate warning or error
      const warningMessage = page.locator('.text-yellow-600, .text-red-600');
      await expect(warningMessage).toBeVisible();
      console.log('Extreme declared value validation working');
    });
  });
});