import { test, expect } from '@playwright/test';

test('Demo with Manufacturing Equipment preset', async ({ page }) => {
  await page.goto('/shipping');
  
  // Wait for preset selector to load
  await expect(page.getByTestId('preset-selector')).toBeVisible();
  
  // Select the Manufacturing Equipment preset (popular preset)
  await page.click('[data-testid="preset-card-mfg-equipment-midwest-se"]');
  
  // Verify preset was applied
  await expect(page.getByTestId('preset-status')).toContainText('All preset values applied');
  
  // Verify form is automatically filled with preset data
  await expect(page.locator('input[value="1234 Industrial Blvd"]')).toBeVisible();
  await expect(page.locator('input[value="Columbus"]')).toBeVisible();
  await expect(page.locator('input[value="5678 Commerce Way"]')).toBeVisible();
  await expect(page.locator('input[value="Atlanta"]')).toBeVisible();
  
  // Verify package details are filled
  await expect(page.locator('input[value="85"]')).toBeVisible(); // weight
  
  // Verify form is ready to proceed
  await expect(page.getByTestId('get-quotes-button')).not.toBeDisabled();
  
  // Click to proceed to pricing
  await page.click('[data-testid="get-quotes-button"]');
  
  // Verify navigation to pricing page
  await expect(page).toHaveURL('/shipping/pricing');
});