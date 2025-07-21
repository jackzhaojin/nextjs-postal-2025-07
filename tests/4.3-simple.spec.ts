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

    // Check that our Task 4.3 section is visible - using the exact text from the page
    await expect(page.getByText('Package Information - Task 4.3 Components')).toBeVisible();
    
    // Check that the PackageInfoSection component loaded - using the specific one in our section
    await expect(page.getByRole('heading', { name: 'Package Information' }).first()).toBeVisible();
    
    // Check for package type options - the actual button text from the page
    await expect(page.getByRole('button', { name: /Medium Box/ })).toBeVisible();
    
    console.log('[Test] Package information section is visible');
  });

  test('should display contents categorization system', async ({ page }) => {
    console.log('[Test] Testing contents categorization system');

    // Wait for the section to load
    await expect(page.getByText('Package Information - Task 4.3 Components')).toBeVisible();

    // Look for Contents Category section by heading
    await expect(page.getByRole('heading', { name: '5. Contents Information' })).toBeVisible();
    
    // Check for electronics category option - using the first occurrence
    const electronicsOption = page.getByRole('heading', { name: 'Electronics & Computer Equipment' }).first();
    await expect(electronicsOption).toBeVisible();
    
    // Click the electronics category
    await electronicsOption.click();
    console.log('[Test] Successfully clicked electronics category');
  });

  test('should display special handling options', async ({ page }) => {
    console.log('[Test] Testing special handling options');

    // Wait for the section to load
    await expect(page.getByText('Package Information - Task 4.3 Components')).toBeVisible();

    // Look for Special Handling section by heading
    await expect(page.getByRole('heading', { name: '6. Special Handling' })).toBeVisible();
    
    // Check for fragile option - using the actual heading text
    const fragileOption = page.getByRole('heading', { name: 'Fragile / Handle with Care' });
    await expect(fragileOption).toBeVisible();
    
    console.log('[Test] Fragile special handling option found');
    
    // Check for other special handling options
    await expect(page.getByRole('heading', { name: 'Temperature Controlled' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hazardous Materials' })).toBeVisible();
    
    console.log('[Test] Special handling options are visible');
  });
});
