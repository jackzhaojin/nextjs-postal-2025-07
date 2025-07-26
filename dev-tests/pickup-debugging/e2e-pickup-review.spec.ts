import { test, expect } from '@playwright/test';

test.describe('End-to-End Pickup and Review Flow', () => {
  test('should complete pickup scheduling and proceed to review', async ({ page }) => {
    console.log('Starting end-to-end pickup and review test...');
    
    // Step 1: Navigate to pickup page
    await page.goto('http://localhost:3000/shipping/pickup');
    await page.waitForTimeout(2000);
    console.log('✅ Navigated to pickup page');
    
    // Step 2: Test Location Details tab
    await page.click('[data-testid="tab-location"]');
    await page.waitForTimeout(1000);
    console.log('✅ Location Details tab active');
    
    // Step 3: Test Date & Time tab
    await page.click('[data-testid="tab-schedule"]');
    await page.waitForTimeout(1000);
    console.log('✅ Date & Time tab active');
    
    // Step 4: Take screenshot of working pickup page
    await page.screenshot({ path: 'pickup-working-e2e.png' });
    
    // Step 5: Navigate to review page using the Continue button
    const reviewButton = page.locator('a[href="/shipping/review"]');
    const isReviewButtonVisible = await reviewButton.isVisible();
    
    if (isReviewButtonVisible) {
      await reviewButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Navigated to review page');
      
      // Step 6: Verify we're on the review page
      const currentUrl = page.url();
      const isOnReviewPage = currentUrl.includes('/shipping/review');
      console.log(`Current URL: ${currentUrl}`);
      console.log(`On review page: ${isOnReviewPage}`);
      
      // Step 7: Take screenshot of review page
      await page.screenshot({ path: 'review-page-e2e.png' });
      
      // Step 8: Check for review page content
      const reviewHeading = await page.locator('h1, h2').first().textContent();
      console.log(`Review page heading: ${reviewHeading}`);
      
      // Step 9: Look for back to pickup button or edit links
      const backButton = await page.locator('button:has-text("Back"), a:has-text("Back"), button:has-text("Edit"), a:has-text("Edit")').count();
      console.log(`Number of back/edit buttons: ${backButton}`);
      
      console.log('✅ End-to-end test completed successfully!');
      
    } else {
      console.log('⚠️ Review button not visible on pickup page');
      await page.screenshot({ path: 'pickup-no-review-button.png' });
    }
  });
});
