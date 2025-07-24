/**
 * Task 7.3: Basic Component Rendering Test
 * 
 * Simple test to verify Task 7.3 components render without errors
 */

import { test, expect } from '@playwright/test';

test.describe('Task 7.3: Basic Component Tests', () => {
  
  test('pickup page loads and shows contact tab', async ({ page }) => {
    console.log('🧪 [TEST-7.3-BASIC] Testing basic page load');
    
    // Navigate to pickup page
    await page.goto('/shipping/pickup');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if the contact tab exists
    const contactTab = page.locator('[data-testid="tab-contact"]');
    await expect(contactTab).toBeVisible();
    
    // Click the contact tab
    await contactTab.click();
    
    // Wait a moment for the component to render
    await page.waitForTimeout(1000);
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/task-7-3-contact-form.png', fullPage: true });
    
    console.log('✅ [TEST-7.3-BASIC] Basic component test passed');
  });

});
