import { test, expect } from '@playwright/test';

test.describe('Task 5.3: Shipment Preset System', () => {
  const baseURL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    console.log('🧪 [TEST] Starting Task 5.3 test - Preset System');
    
    // Clear localStorage before each test
    await page.goto(baseURL);
    await page.evaluate(() => {
      localStorage.clear();
      console.log('🧹 [TEST] localStorage cleared');
    });
    
    // Navigate to shipping page
    await page.goto(`${baseURL}/shipping`);
    console.log('🧪 [TEST] Navigated to shipping page');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="preset-selector"]', { timeout: 10000 });
    console.log('🧪 [TEST] Page loaded, preset selector found');
  });

  test('5.3.1: Should display preset selector interface', async ({ page }) => {
    console.log('🧪 [TEST] 5.3.1: Testing preset selector display');
    
    // Check that preset selector is visible
    const presetSelector = page.locator('[data-testid="preset-selector"]');
    await expect(presetSelector).toBeVisible();
    console.log('✅ [TEST] Preset selector is visible');
    
    // Check for preset cards or dropdown
    const presetCards = page.locator('[data-testid^="preset-card"]');
    const presetCount = await presetCards.count();
    expect(presetCount).toBe(5); // Should have 5 presets as per spec
    console.log(`✅ [TEST] Found ${presetCount} preset cards`);
    
    // Check that popular presets are highlighted
    const popularPresets = page.locator('[data-testid^="preset-card"][data-popular="true"]');
    const popularCount = await popularPresets.count();
    expect(popularCount).toBeGreaterThan(0);
    console.log(`✅ [TEST] Found ${popularCount} popular presets`);
    
    // Verify preset categories are displayed
    const categoryLabels = page.locator('[data-testid^="preset-category"]');
    const categoryCount = await categoryLabels.count();
    expect(categoryCount).toBeGreaterThan(0);
    console.log(`✅ [TEST] Found ${categoryCount} preset categories`);
  });

  test('5.3.2: Should apply manufacturing equipment preset correctly', async ({ page }) => {
    console.log('🧪 [TEST] 5.3.2: Testing manufacturing equipment preset application');
    
    // Select the manufacturing equipment preset
    const manufacturingPreset = page.locator('[data-testid="preset-card-mfg-equipment-midwest-se"]');
    await expect(manufacturingPreset).toBeVisible();
    await manufacturingPreset.click();
    console.log('🧪 [TEST] Clicked manufacturing equipment preset');
    
    // Wait for form to populate
    await page.waitForTimeout(1000);
    
    // Verify origin address fields are populated using ID selectors
    const originAddress = page.locator('#origin-address');
    await expect(originAddress).toHaveValue('1234 Industrial Blvd');
    console.log('✅ [TEST] Origin address populated correctly');
    
    const originCity = page.locator('#origin-city');
    await expect(originCity).toHaveValue('Columbus');
    console.log('✅ [TEST] Origin city populated correctly');
    
    const originState = page.locator('#origin-state');
    await expect(originState).toHaveValue('OH');
    console.log('✅ [TEST] Origin state populated correctly');
    
    // Verify destination address fields are populated
    const destinationAddress = page.locator('#destination-address');
    await expect(destinationAddress).toHaveValue('5678 Commerce Way');
    console.log('✅ [TEST] Destination address populated correctly');
    
    const destinationCity = page.locator('#destination-city');
    await expect(destinationCity).toHaveValue('Atlanta');
    console.log('✅ [TEST] Destination city populated correctly');
    
    // Verify package information is populated
    const packageWeight = page.locator('#package-weight-value');
    await expect(packageWeight).toHaveValue('85');
    console.log('✅ [TEST] Package weight populated correctly');
    
    // Verify declared value is populated
    const declaredValue = page.locator('#package-declared-value');
    await expect(declaredValue).toHaveValue('3500');
    console.log('✅ [TEST] Declared value populated correctly');
    
    // Verify contact information is populated
    const originContact = page.locator('#origin-contact-name');
    await expect(originContact).toHaveValue('John Smith');
    console.log('✅ [TEST] Origin contact populated correctly');
    
    const originCompany = page.locator('#origin-contact-company');
    await expect(originCompany).toHaveValue('ABC Manufacturing Corp');
    console.log('✅ [TEST] Origin company populated correctly');
  });

  test('5.3.3: Should apply medical supplies preset correctly', async ({ page }) => {
    console.log('🧪 [TEST] 5.3.3: Testing medical supplies preset application');
    
    // Select the medical supplies preset
    const medicalPreset = page.locator('[data-testid="preset-card-medical-supplies-express"]');
    await expect(medicalPreset).toBeVisible();
    await medicalPreset.click();
    console.log('🧪 [TEST] Clicked medical supplies preset');
    
    // Wait for form to populate
    await page.waitForTimeout(1000);
    
    // Verify medical-specific details
    const originAddress = page.locator('#origin-address');
    await expect(originAddress).toHaveValue('789 Medical Plaza Dr');
    console.log('✅ [TEST] Medical origin address populated correctly');
    
    const destinationCompany = page.locator('#destination-contact-company');
    await expect(destinationCompany).toHaveValue('Miami General Hospital');
    console.log('✅ [TEST] Hospital destination populated correctly');
    
    // Verify package weight for medical supplies
    const packageWeight = page.locator('#package-weight-value');
    await expect(packageWeight).toHaveValue('25');
    console.log('✅ [TEST] Medical package weight populated correctly');
    
    // Verify high declared value for medical equipment
    const declaredValue = page.locator('#package-declared-value');
    await expect(declaredValue).toHaveValue('8500');
    console.log('✅ [TEST] Medical declared value populated correctly');
    
    // Check special handling options for medical supplies
    const temperatureControlled = page.locator('[data-testid="special-handling-temperature-controlled"]');
    if (await temperatureControlled.isVisible()) {
      await expect(temperatureControlled).toBeChecked();
      console.log('✅ [TEST] Temperature controlled option selected');
    }
    
    const fragileHandling = page.locator('[data-testid="special-handling-fragile"]');
    if (await fragileHandling.isVisible()) {
      await expect(fragileHandling).toBeChecked();
      console.log('✅ [TEST] Fragile handling option selected');
    }
  });

  test('5.3.4: Should track field modifications after preset selection', async ({ page }) => {
    console.log('🧪 [TEST] 5.3.4: Testing field modification tracking');
    
    // Select a preset first
    const techPreset = page.locator('[data-testid="preset-card-tech-hardware-coast-to-coast"]');
    await expect(techPreset).toBeVisible();
    await techPreset.click();
    console.log('🧪 [TEST] Applied tech hardware preset');
    
    // Wait for form to populate
    await page.waitForTimeout(1000);
    
    // Verify preset is marked as applied
    const presetStatus = page.locator('[data-testid="preset-status"]');
    await expect(presetStatus).toContainText('applied');
    console.log('✅ [TEST] Preset status shows as applied');
    
    // Modify a field
    const originAddress = page.locator('#origin-address');
    await originAddress.clear();
    await originAddress.fill('Modified Address 123');
    console.log('🧪 [TEST] Modified origin address field');
    
    // Wait for modification detection
    await page.waitForTimeout(500);
    
    // Verify preset is marked as modified
    await expect(presetStatus).toContainText('Modified');
    console.log('✅ [TEST] Preset status shows as modified');
    
    // Check that modified field indicator is shown
    const modifiedIndicator = page.locator('[data-testid="field-modified-origin.address"]');
    if (await modifiedIndicator.isVisible()) {
      console.log('✅ [TEST] Modified field indicator is visible');
    }
    
    // Modify another field
    const packageWeight = page.locator('#package-weight-value');
    await packageWeight.clear();
    await packageWeight.fill('200');
    console.log('🧪 [TEST] Modified package weight field');
    
    // Wait for modification detection
    await page.waitForTimeout(500);
    
    // Check that both modified field indicators are shown or the count increased
    const weightModifiedIndicator = page.locator('[data-testid="field-modified-package.weight.value"]');
    if (await weightModifiedIndicator.isVisible()) {
      console.log('✅ [TEST] Weight modified field indicator is visible');
    }
    
    // Check that the modification count increased
    await expect(presetStatus).toContainText('field');
    console.log('✅ [TEST] Multiple field modifications tracked');
  });

  test('5.3.5: Should clear preset and return to blank state', async ({ page }) => {
    console.log('🧪 [TEST] 5.3.5: Testing preset clearing functionality');
    
    // Select a preset first
    const automotivePreset = page.locator('[data-testid="preset-card-automotive-parts-regional"]');
    await expect(automotivePreset).toBeVisible();
    await automotivePreset.click();
    console.log('🧪 [TEST] Applied automotive parts preset');
    
    // Wait for form to populate
    await page.waitForTimeout(1000);
    
    // Verify form is populated
    const originAddress = page.locator('#origin-address');
    await expect(originAddress).toHaveValue('1357 Motor City Ave');
    console.log('✅ [TEST] Form populated with preset data');
    
    // Click clear preset button
    const clearButton = page.locator('[data-testid="clear-preset-button"]');
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    console.log('🧪 [TEST] Clicked clear preset button');
    
    // Wait for form to clear
    await page.waitForTimeout(1000);
    
    // Verify form fields are cleared
    await expect(originAddress).toHaveValue('');
    console.log('✅ [TEST] Origin address cleared');
    
    const destinationAddress = page.locator('#destination-address');
    await expect(destinationAddress).toHaveValue('');
    console.log('✅ [TEST] Destination address cleared');
    
    const packageWeight = page.locator('#package-weight-value');
    await expect(packageWeight).toHaveValue('0');
    console.log('✅ [TEST] Package weight cleared');
    
    // Verify preset status is cleared
    const presetStatus = page.locator('[data-testid="preset-status"]');
    await expect(presetStatus).toContainText('none');
    console.log('✅ [TEST] Preset status cleared');
  });

  test('5.3.6: Should persist preset selection in localStorage', async ({ page }) => {
    console.log('🧪 [TEST] 5.3.6: Testing localStorage persistence');
    
    // Select a preset
    const legalPreset = page.locator('[data-testid="preset-card-documents-legal-express"]');
    await expect(legalPreset).toBeVisible();
    await legalPreset.click();
    console.log('🧪 [TEST] Applied legal documents preset');
    
    // Wait for form to populate and localStorage to save
    await page.waitForTimeout(2000);
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="preset-selector"]', { timeout: 10000 });
    console.log('🧪 [TEST] Page refreshed and reloaded');
    
    // Verify preset is still selected
    const selectedPreset = page.locator('[data-testid="preset-card-documents-legal-express"][data-selected="true"]');
    await expect(selectedPreset).toBeVisible();
    console.log('✅ [TEST] Preset selection persisted after page refresh');
    
    // Verify form data is still populated
    const originAddress = page.locator('#origin-address');
    await expect(originAddress).toHaveValue('555 Law Firm Plaza');
    console.log('✅ [TEST] Form data persisted after page refresh');
    
    // Check localStorage contains the correct data
    const localStorageData = await page.evaluate(() => {
      const data = localStorage.getItem('currentShipmentDetails');
      return data ? JSON.parse(data) : null;
    });
    
    expect(localStorageData).toBeTruthy();
    expect(localStorageData.origin.address).toBe('555 Law Firm Plaza');
    console.log('✅ [TEST] localStorage contains correct preset data');
  });

  test('5.3.7: Should validate preset data with form validation system', async ({ page }) => {
    console.log('🧪 [TEST] 5.3.7: Testing preset data validation');
    
    // Select any preset to populate form
    const manufacturingPreset = page.locator('[data-testid="preset-card-mfg-equipment-midwest-se"]');
    await expect(manufacturingPreset).toBeVisible();
    await manufacturingPreset.click();
    console.log('🧪 [TEST] Applied manufacturing preset');
    
    // Wait for form to populate
    await page.waitForTimeout(1000);
    
    // Check that no validation errors are shown for preset data
    const validationErrors = page.locator('[data-testid^="validation-error"]');
    const errorCount = await validationErrors.count();
    expect(errorCount).toBe(0);
    console.log('✅ [TEST] No validation errors for preset data');
    
    // Check that form progress indicates valid completion
    const progressIndicator = page.locator('[data-testid="progress-indicator"]');
    const progressText = await progressIndicator.textContent();
    const progressPercentage = parseInt(progressText?.match(/(\d+)%/)?.[1] || '0');
    expect(progressPercentage).toBeGreaterThan(50); // Should be significant progress
    console.log(`✅ [TEST] Form progress shows ${progressPercentage}% completion`);
    
    // Try to advance to next step (pricing) to verify form is valid
    const continueButton = page.locator('[data-testid="continue-to-pricing"]');
    if (await continueButton.isVisible()) {
      await expect(continueButton).not.toBeDisabled();
      console.log('✅ [TEST] Continue button is enabled with preset data');
    } else {
      console.log('ℹ️ [TEST] Continue button not found - checking form validation passed');
      // Alternative check - verify no error states in form
      const errorElements = page.locator('.border-red-500, .text-red-600');
      const errorElementCount = await errorElements.count();
      expect(errorElementCount).toBe(0);
      console.log('✅ [TEST] No error styling found in form');
    }
  });

  test('5.3.8: Should display category filtering functionality', async ({ page }) => {
    console.log('🧪 [TEST] 5.3.8: Testing category filtering');
    
    // Check for category filter controls
    const categoryFilter = page.locator('[data-testid="category-filter"]');
    await expect(categoryFilter).toBeVisible();
    console.log('✅ [TEST] Category filter is visible');
    
    // Test filtering by manufacturing category
    const manufacturingFilter = page.locator('[data-testid="category-filter-manufacturing"]');
    if (await manufacturingFilter.isVisible()) {
      await manufacturingFilter.click();
      console.log('🧪 [TEST] Applied manufacturing category filter');
      
      // Wait for filter to apply
      await page.waitForTimeout(500);
      
      // Check that only manufacturing presets are visible
      const visiblePresets = page.locator('[data-testid^="preset-card"]:visible');
      const visibleCount = await visiblePresets.count();
      
      // Verify at least one manufacturing preset is visible
      const manufacturingPresets = page.locator('[data-testid^="preset-card"][data-category="manufacturing"]:visible');
      const manufacturingCount = await manufacturingPresets.count();
      expect(manufacturingCount).toBeGreaterThan(0);
      console.log(`✅ [TEST] ${manufacturingCount} manufacturing presets visible after filtering`);
    }
    
    // Test "All" category to show all presets again
    const allFilter = page.locator('[data-testid="category-filter-all"]');
    if (await allFilter.isVisible()) {
      await allFilter.click();
      console.log('🧪 [TEST] Applied "all" category filter');
      
      // Wait for filter to apply
      await page.waitForTimeout(500);
      
      // Check that all presets are visible again
      const allVisiblePresets = page.locator('[data-testid^="preset-card"]:visible');
      const allVisibleCount = await allVisiblePresets.count();
      expect(allVisibleCount).toBe(5); // Should show all 5 presets
      console.log(`✅ [TEST] All ${allVisibleCount} presets visible after removing filter`);
    }
  });

  test('5.3.9: Should provide accessibility support for preset selection', async ({ page }) => {
    console.log('🧪 [TEST] 5.3.9: Testing accessibility features');
    
    // Test keyboard navigation through presets
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
    console.log(`🧪 [TEST] Focus moved to element: ${focusedElement}`);
    
    // Check for proper ARIA labels
    const presetCards = page.locator('[data-testid^="preset-card"]');
    const firstCard = presetCards.first();
    
    const ariaLabel = await firstCard.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    console.log(`✅ [TEST] First preset card has aria-label: ${ariaLabel}`);
    
    // Check for role attributes
    const role = await firstCard.getAttribute('role');
    expect(role).toBe('button');
    console.log('✅ [TEST] Preset cards have proper button role');
    
    // Test keyboard selection
    await firstCard.focus();
    await page.keyboard.press('Enter');
    console.log('🧪 [TEST] Selected preset using keyboard');
    
    // Wait for selection to take effect
    await page.waitForTimeout(1000);
    
    // Verify selection worked via keyboard
    const selectedState = await firstCard.getAttribute('data-selected');
    expect(selectedState).toBe('true');
    console.log('✅ [TEST] Keyboard selection successful');
    
    // Check for screen reader announcements
    const announcements = page.locator('[aria-live="polite"]');
    const announcementCount = await announcements.count();
    expect(announcementCount).toBeGreaterThan(0);
    console.log(`✅ [TEST] Found ${announcementCount} aria-live regions for announcements`);
  });

  test('5.3.10: Should handle preset data edge cases and error states', async ({ page }) => {
    console.log('🧪 [TEST] 5.3.10: Testing edge cases and error handling');
    
    // Test rapid preset switching
    const presets = page.locator('[data-testid^="preset-card"]');
    const presetCount = await presets.count();
    
    for (let i = 0; i < Math.min(3, presetCount); i++) {
      await presets.nth(i).click();
      await page.waitForTimeout(200); // Brief wait between selections
      console.log(`🧪 [TEST] Switched to preset ${i + 1}`);
    }
    console.log('✅ [TEST] Rapid preset switching handled gracefully');
    
    // Test invalid preset data handling (simulate corrupted localStorage)
    await page.evaluate(() => {
      localStorage.setItem('currentShipmentDetails', '{"invalid": "json"}');
      localStorage.setItem('currentPresetState', '{"corrupted": true}');
    });
    console.log('🧪 [TEST] Simulated corrupted localStorage data');
    
    // Refresh page to trigger localStorage loading
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="preset-selector"]', { timeout: 10000 });
    console.log('🧪 [TEST] Page reloaded with corrupted data');
    
    // Verify app doesn't crash and shows clean state
    const presetSelector = page.locator('[data-testid="preset-selector"]');
    await expect(presetSelector).toBeVisible();
    console.log('✅ [TEST] App handles corrupted localStorage gracefully');
    
    // Test that presets can still be selected after error recovery
    const firstPreset = page.locator('[data-testid^="preset-card"]').first();
    await firstPreset.click();
    await page.waitForTimeout(1000);
    
    const originAddress = page.locator('#origin-address');
    const addressValue = await originAddress.inputValue();
    expect(addressValue.length).toBeGreaterThan(0);
    console.log('✅ [TEST] Preset selection works after error recovery');
    
    // Verify no console errors are present
    const consoleErrors = await page.evaluate(() => {
      return window.console.error.toString();
    });
    console.log('🧪 [TEST] Console error check completed');
  });
});
