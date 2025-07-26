import { test, expect } from '@playwright/test';

test.describe('Pickup Contact Tab Error Debug', () => {
  test('should capture console errors when clicking contact tab', async ({ page }) => {
    // Capture console messages
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      consoleMessages.push(`${msg.type()}: ${msg.text()}`);
    });

    // Capture page errors
    const pageErrors: string[] = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Navigate directly to pickup page
    await page.goto('http://localhost:3000/shipping/pickup');
    
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    console.log('Initial console messages:', consoleMessages);
    console.log('Initial page errors:', pageErrors);
    
    // Try to click Contact & Instructions tab
    try {
      await page.click('[data-testid="tab-contact"]');
      await page.waitForTimeout(3000);
    } catch (error) {
      console.log('Error clicking contact tab:', error);
    }
    
    // Log all console messages and errors
    console.log('Final console messages:', consoleMessages);
    console.log('Final page errors:', pageErrors);
    
    // Check if page is still responsive
    const pageTitle = await page.title();
    console.log('Page title after contact tab click:', pageTitle);
    
    // Take a screenshot to see the current state
    await page.screenshot({ path: 'contact-tab-error-debug.png' });
  });
});
