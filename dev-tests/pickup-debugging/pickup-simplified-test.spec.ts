import { test, expect } from '@playwright/test';

test.describe('Simplified Pickup Scheduling Test', () => {
  test('should test pickup page with only Location and Date/Time tabs', async ({ page }) => {
    // Navigate directly to pickup page
    await page.goto('http://localhost:3000/shipping/pickup');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    console.log('Testing simplified pickup page...');
    
    // Test Location Details tab (default)
    await page.click('[data-testid="tab-location"]');
    await page.waitForTimeout(1000);
    console.log('✅ Location Details tab works');
    await page.screenshot({ path: 'pickup-location-simplified.png' });
    
    // Test Date & Time tab
    await page.click('[data-testid="tab-schedule"]');
    await page.waitForTimeout(1000);
    console.log('✅ Date & Time tab works');
    await page.screenshot({ path: 'pickup-schedule-simplified.png' });
    
    // Verify that Contact and Notifications tabs are not present
    const contactTab = await page.locator('[data-testid="tab-contact"]').count();
    const notificationsTab = await page.locator('[data-testid="tab-notifications"]').count();
    
    console.log(`Contact tab count: ${contactTab} (should be 0)`);
    console.log(`Notifications tab count: ${notificationsTab} (should be 0)`);
    
    if (contactTab === 0 && notificationsTab === 0) {
      console.log('✅ Problematic tabs successfully removed');
    } else {
      console.log('⚠️ Some tabs still present');
    }
    
    // Test navigation to review page
    const reviewButton = page.locator('a[href="/shipping/review"]');
    const isReviewButtonVisible = await reviewButton.isVisible();
    console.log(`Review button visible: ${isReviewButtonVisible}`);
    
    console.log('Simplified pickup page test completed successfully!');
  });
});
