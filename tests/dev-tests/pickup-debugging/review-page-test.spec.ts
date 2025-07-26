import { test, expect } from '@playwright/test';

test.describe('Review Page Test', () => {
  test('should navigate to and test the review page', async ({ page }) => {
    // Navigate directly to review page
    await page.goto('http://localhost:3000/shipping/review');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    console.log('Testing review page...');
    
    // Take screenshot of the review page
    await page.screenshot({ path: 'review-page-test.png' });
    
    // Check if the page loads without errors
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);
    
    // Check for common elements that should be on a review page
    const heading = await page.locator('h1, h2').first().textContent();
    console.log(`Main heading: ${heading}`);
    
    // Look for any error messages
    const errorElement = await page.locator('text=error, text=Error').first().isVisible().catch(() => false);
    console.log(`Error visible: ${errorElement}`);
    
    // Look for review sections
    const reviewSections = await page.locator('[class*="review"], [class*="section"], .card').count();
    console.log(`Number of review sections/cards: ${reviewSections}`);
    
    console.log('Review page test completed!');
  });
});
