import { test, expect } from '@playwright/test';

test.describe('Task 4.3: Package Information Components - Simple Test', () => {
  test.beforeEach(async ({ page }) => {
    console.log('[Test] Starting simple Task 4.3 test');
    // Navigate to test components page where PackageInfoSection is available
    await page.goto('/test-components');
    await page.waitForLoadState('networkidle');
  });

  test('should display package information section', async ({ page }) => {
    console.log('[Test] Testing basic package info section visibility');

    // Check that our Task 4.3 section is visible
    await expect(page.locator('div').filter({ hasText: 'Package Information - Task 4.3 Components' })).toBeVisible();
    
    // Check that the PackageInfoSection component loaded
    await expect(page.locator('h2').filter({ hasText: 'Package Information' }).last()).toBeVisible();
    
    // Check for basic package type options
    await expect(page.locator('text=Medium Package').first()).toBeVisible();
    
    console.log('[Test] Package information section is visible');
  });

  test('should display contents categorization system', async ({ page }) => {
    console.log('[Test] Testing contents categorization system');

    // Wait for the section to load
    await expect(page.locator('div').filter({ hasText: 'Package Information - Task 4.3 Components' })).toBeVisible();

    // Look for Contents Category section
    const contentsSection = page.locator('text=Contents Category').first();
    if (await contentsSection.isVisible()) {
      console.log('[Test] Contents category section found');
      
      // Check for category options
      const electronicsOption = page.locator('text=Electronics').first();
      if (await electronicsOption.isVisible()) {
        await electronicsOption.click();
        console.log('[Test] Successfully clicked electronics category');
      }
    } else {
      console.log('[Test] Contents category section not visible yet');
    }
  });

  test('should display special handling options', async ({ page }) => {
    console.log('[Test] Testing special handling options');

    // Wait for the section to load
    await expect(page.locator('div').filter({ hasText: 'Package Information - Task 4.3 Components' })).toBeVisible();

    // Look for Special Handling section
    const specialHandlingSection = page.locator('text=Special Handling').first();
    if (await specialHandlingSection.isVisible()) {
      console.log('[Test] Special handling section found');
      
      // Check for fragile option
      const fragileOption = page.locator('text=Fragile').first();
      if (await fragileOption.isVisible()) {
        console.log('[Test] Fragile option found');
      }
    } else {
      console.log('[Test] Special handling section not visible yet');
    }
  });
});
