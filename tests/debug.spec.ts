import { test, expect } from '@playwright/test';

test('Debug page structure', async ({ page }) => {
  console.log('Navigating to shipping page');
  await page.goto('http://localhost:3001/shipping');
  
  // Wait a bit for page to load
  await page.waitForTimeout(5000);
  
  // Take a screenshot
  await page.screenshot({ path: 'debug-shipping-page.png', fullPage: true });
  
  // Get page content
  const content = await page.content();
  console.log('Page title:', await page.title());
  console.log('Page loaded successfully');
  
  // Look for the main elements
  const h1Elements = await page.locator('h1').count();
  console.log('H1 elements found:', h1Elements);
  
  const packageText = await page.locator('text=Package').count();
  console.log('Elements with "Package" text:', packageText);
  
  // Check what's in the package section
  const packageSection = page.locator('[fieldId="package-section"]');
  const exists = await packageSection.count();
  console.log('Package section exists:', exists > 0);
  
  if (exists > 0) {
    const packageContent = await packageSection.innerHTML();
    console.log('Package section content length:', packageContent.length);
  }
});