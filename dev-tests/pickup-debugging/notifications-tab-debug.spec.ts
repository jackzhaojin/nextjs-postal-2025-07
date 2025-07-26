import { test, expect } from '@playwright/test';

test.describe('Notifications Tab Debug', () => {
  test('should check notifications tab specifically', async ({ page }) => {
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
    
    // Go directly to notifications tab
    console.log('Clicking Notifications & Authorization tab...');
    
    try {
      await page.click('[data-testid="tab-notifications"]');
      console.log('Successfully clicked notifications tab');
      
      await page.waitForTimeout(3000);
      
      // Check if the tab content loaded
      const tabContent = await page.locator('.space-y-6').first().isVisible();
      console.log('Tab content visible:', tabContent);
      
    } catch (error) {
      console.log('Error clicking notifications tab:', error);
    }
    
    // Log any errors
    console.log('Console messages:', consoleMessages.slice(-10));
    console.log('Page errors:', pageErrors);
    
    // Take screenshot
    await page.screenshot({ path: 'notifications-tab-debug.png' });
  });
});
