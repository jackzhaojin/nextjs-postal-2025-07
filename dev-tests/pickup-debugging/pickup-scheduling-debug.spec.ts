import { test, expect } from '@playwright/test';

test.describe('Pickup Scheduling Debug', () => {
  test('should test pickup page tabs directly', async ({ page }) => {
    // Capture console messages and errors
    const consoleMessages: string[] = [];
    const pageErrors: string[] = [];
    
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });
    
    // Navigate directly to pickup page
    await page.goto('http://localhost:3000/shipping/pickup');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Take screenshot of initial pickup page
    await page.screenshot({ path: 'pickup-page-initial.png' });
    
    // Check if we're redirected to shipping due to missing data
    const currentUrl = page.url();
    console.log('Current URL:', currentUrl);
    
    if (currentUrl.includes('/shipping/pickup')) {
      console.log('On pickup page, testing tabs...');
      
      // Test Location Details tab (default)
      await page.click('[data-testid="tab-location"]');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'pickup-location-tab.png' });
      
      // Test Date & Time tab
      console.log('Clicking Date & Time tab...');
      await page.click('[data-testid="tab-schedule"]');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'pickup-schedule-tab.png' });
      
      // Test Contact & Instructions tab (this should cause the error)
      console.log('Clicking Contact & Instructions tab...');
      await page.click('[data-testid="tab-contact"]');
      
      // Wait to see if there's an error
      await page.waitForTimeout(2000);
      
      // Log any console messages and errors that occurred
      console.log('Console messages after contact tab:', consoleMessages.slice(-10));
      console.log('Page errors after contact tab:', pageErrors);
      
      // Check for any error messages
      const errorMessage = await page.locator('text=Application error').first().isVisible().catch(() => false);
      if (errorMessage) {
        console.log('Error detected on Contact & Instructions tab');
      }
      
      // Take screenshot after clicking Contact & Instructions
      await page.screenshot({ path: 'contact-instructions-debug.png' });
      
      // Try to continue with other tabs if possible
      try {
        // Test Notifications & Authorization tab
        console.log('Attempting to click Notifications & Authorization tab...');
        await page.click('[data-testid="tab-notifications"]', { timeout: 5000 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: 'notifications-tab.png' });
      } catch (error) {
        console.log('Could not click notifications tab, likely due to previous error');
        console.log('Final console messages:', consoleMessages.slice(-5));
        console.log('Final page errors:', pageErrors);
      }
      
    } else {
      console.log('Redirected away from pickup page, likely due to missing data');
      await page.screenshot({ path: 'pickup-page-redirect.png' });
    }
  });
});
