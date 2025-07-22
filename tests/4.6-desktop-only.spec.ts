import { test, expect } from '@playwright/test';

test.describe('Task 4.6 - Package Information Integration (Desktop)', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Test setup: Navigating to shipping page');
    await page.goto('http://localhost:3001/shipping');
    await page.waitForSelector('text=Shipment Details', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(2000);
    console.log('Test setup complete: Page loaded');
  });

  test('should display all package components correctly', async ({ page }) => {
    console.log('Testing complete package component integration');
    
    // Verify Package Information section
    const packageSection = page.locator('text=Package Information').first();
    await expect(packageSection).toBeVisible();
    console.log('✓ Package Information section visible');
    
    // Verify all enhanced components are present
    const weightInput = page.locator('[data-testid="weight-input"]');
    const dimensionLength = page.locator('[data-testid="dimension-length"]');
    const dimensionWidth = page.locator('[data-testid="dimension-width"]');
    const dimensionHeight = page.locator('[data-testid="dimension-height"]');
    const declaredValueInput = page.locator('[data-testid="declared-value-input"]');
    
    await expect(weightInput).toBeVisible();
    await expect(dimensionLength).toBeVisible();
    await expect(dimensionWidth).toBeVisible();
    await expect(dimensionHeight).toBeVisible();
    await expect(declaredValueInput).toBeVisible();
    console.log('✓ All enhanced package component inputs visible');
  });

  test('should handle weight input with unit conversion', async ({ page }) => {
    console.log('Testing weight input functionality');
    
    // Enter weight in pounds
    const weightInput = page.locator('[data-testid="weight-input"]');
    await weightInput.fill('10');
    await expect(weightInput).toHaveValue('10');
    console.log('✓ Weight input accepts value');
    
    // Switch to kg
    await page.click('[data-testid="unit-kg"]');
    await page.waitForTimeout(500);
    
    // Check if value converted (10 lbs ≈ 4.54 kg)
    const convertedValue = await weightInput.inputValue();
    console.log('Converted weight value:', convertedValue);
    expect(parseFloat(convertedValue)).toBeCloseTo(4.54, 1);
    console.log('✓ Weight unit conversion working');
  });

  test('should handle dimension inputs with calculations', async ({ page }) => {
    console.log('Testing dimension input and calculations');
    
    // Enter dimensions
    await page.locator('[data-testid="dimension-length"]').fill('20');
    await page.locator('[data-testid="dimension-width"]').fill('15');
    await page.locator('[data-testid="dimension-height"]').fill('10');
    
    // Wait for calculations to update
    await page.waitForTimeout(1000);
    
    // Check for volume calculation (should be 3000 cubic inches)
    const volumeText = page.locator('text=/Volume: [0-9,.]+ cubic/');
    await expect(volumeText).toBeVisible();
    console.log('✓ Volume calculation displayed');
    
    // Check for dimensional weight
    const dimWeightText = page.locator('text=/Dimensional Weight: [0-9]+ lbs/');
    await expect(dimWeightText).toBeVisible();
    console.log('✓ Dimensional weight calculation displayed');
  });

  test('should handle declared value with currency selection', async ({ page }) => {
    console.log('Testing declared value input');
    
    // Enter declared value
    const valueInput = page.locator('[data-testid="declared-value-input"]');
    await valueInput.fill('2500');
    await expect(valueInput).toHaveValue('2500');
    console.log('✓ Declared value input accepts value');
    
    // Switch to CAD currency
    await page.click('[data-testid="currency-CAD"]');
    await page.waitForTimeout(500);
    
    // Check if insurance information is displayed
    const insuranceText = page.locator('text=Insurance Coverage');
    await expect(insuranceText).toBeVisible();
    console.log('✓ Insurance coverage displayed for CAD currency');
  });

  test('should integrate all components in complete workflow', async ({ page }) => {
    console.log('Testing complete package information workflow');
    
    // Step 1: Enter weight
    await page.locator('[data-testid="weight-input"]').fill('25');
    console.log('✓ Step 1: Weight entered');
    
    // Step 2: Enter dimensions
    await page.locator('[data-testid="dimension-length"]').fill('24');
    await page.locator('[data-testid="dimension-width"]').fill('18');
    await page.locator('[data-testid="dimension-height"]').fill('12');
    console.log('✓ Step 2: Dimensions entered');
    
    // Step 3: Enter declared value
    await page.locator('[data-testid="declared-value-input"]').fill('3500');
    console.log('✓ Step 3: Declared value entered');
    
    // Wait for all calculations to complete
    await page.waitForTimeout(2000);
    
    // Verify all data is integrated properly
    await expect(page.locator('[data-testid="weight-input"]')).toHaveValue('25');
    await expect(page.locator('[data-testid="dimension-length"]')).toHaveValue('24');
    await expect(page.locator('[data-testid="declared-value-input"]')).toHaveValue('3500');
    
    // Check that calculations are displayed
    const volumeInfo = page.locator('text=/Volume:/');
    const insuranceInfo = page.locator('text=Insurance Coverage');
    await expect(volumeInfo).toBeVisible();
    await expect(insuranceInfo).toBeVisible();
    
    console.log('✓ Complete workflow: All components integrated successfully');
  });

  test('should show validation and warnings appropriately', async ({ page }) => {
    console.log('Testing validation and warning system');
    
    // Test weight validation - enter very high weight
    await page.locator('[data-testid="weight-input"]').fill('15000');
    await page.waitForTimeout(1000);
    
    // Should show validation message
    const weightValidation = page.locator('.text-red-600, .text-yellow-600');
    await expect(weightValidation).toBeVisible();
    console.log('✓ Weight validation message displayed');
    
    // Test declared value warning - enter high value
    await page.locator('[data-testid="declared-value-input"]').fill('85000');
    await page.waitForTimeout(1000);
    
    // Should show high value warning
    const valueWarning = page.locator('text=/High declared value/, text=/additional documentation/');
    await expect(valueWarning).toBeVisible();
    console.log('✓ High declared value warning displayed');
  });

  test('should maintain data persistence during form interactions', async ({ page }) => {
    console.log('Testing data persistence');
    
    // Enter complete package information
    await page.locator('[data-testid="weight-input"]').fill('45');
    await page.locator('[data-testid="dimension-length"]').fill('30');
    await page.locator('[data-testid="dimension-width"]').fill('20');
    await page.locator('[data-testid="dimension-height"]').fill('15');
    await page.locator('[data-testid="declared-value-input"]').fill('4000');
    
    console.log('✓ Initial data entered');
    
    // Click on a different section
    await page.locator('text=Pickup Address (Origin)').click();
    await page.waitForTimeout(1000);
    
    // Return to package section
    await page.locator('text=Package Information').first().click();
    await page.waitForTimeout(1000);
    
    // Verify data persistence
    await expect(page.locator('[data-testid="weight-input"]')).toHaveValue('45');
    await expect(page.locator('[data-testid="dimension-length"]')).toHaveValue('30');
    await expect(page.locator('[data-testid="dimension-width"]')).toHaveValue('20');
    await expect(page.locator('[data-testid="dimension-height"]')).toHaveValue('15');
    await expect(page.locator('[data-testid="declared-value-input"]')).toHaveValue('4000');
    
    console.log('✓ Data persistence verified across form sections');
  });

  test('should handle edge cases and invalid inputs gracefully', async ({ page }) => {
    console.log('Testing edge case handling');
    
    // Test negative weight (should be rejected or corrected)
    await page.locator('[data-testid="weight-input"]').fill('-10');
    await page.waitForTimeout(500);
    
    const weightValue = await page.locator('[data-testid="weight-input"]').inputValue();
    expect(weightValue).not.toBe('-10');
    console.log('✓ Negative weight input handled correctly');
    
    // Test zero dimensions
    await page.locator('[data-testid="dimension-length"]').fill('0');
    await page.locator('[data-testid="dimension-width"]').fill('0');
    await page.locator('[data-testid="dimension-height"]').fill('0');
    await page.waitForTimeout(1000);
    
    // Should not crash and should handle gracefully
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
    console.log('✓ Zero dimensions handled gracefully');
    
    // Test very large declared value
    await page.locator('[data-testid="declared-value-input"]').fill('999999999');
    await page.waitForTimeout(1000);
    
    // Should show appropriate validation
    const validation = page.locator('.text-red-600, .text-yellow-600');
    await expect(validation).toBeVisible();
    console.log('✓ Extreme declared value validation working');
  });
});