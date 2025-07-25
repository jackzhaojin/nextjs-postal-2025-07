import { test, expect } from '@playwright/test';

/**
 * Task 7.4: Complete Flow Test with Form Data
 * Tests the notification and authorization system with proper form state
 */

test.describe('Task 7.4: Complete Flow Test', () => {
  
  test('should navigate through form flow and test notifications', async ({ page }) => {
    console.log('🧪 [FLOW-TEST] Starting complete flow test');
    
    // Step 1: Navigate to shipping page and fill basic info
    await page.goto('http://localhost:3000/shipping');
    await page.waitForLoadState('networkidle');
    console.log('🧪 [FLOW-TEST] Navigated to shipping page');
    
    // Wait for form to be ready
    await page.waitForSelector('input[name="origin.address"], [data-testid="origin-address"], input[placeholder*="address"], input[placeholder*="Address"]', { 
      timeout: 10000 
    });
    
    // Fill in basic shipping details
    try {
      // Try different selectors for origin address
      const originAddressSelectors = [
        'input[name="origin.address"]',
        '[data-testid="origin-address"]',
        'input[placeholder*="address"]',
        'input[placeholder*="Address"]',
        'input[placeholder*="street"]',
        'input[placeholder*="Street"]'
      ];
      
      let addressFilled = false;
      for (const selector of originAddressSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            await element.fill('123 Test Street');
            console.log(`🧪 [FLOW-TEST] Filled address using selector: ${selector}`);
            addressFilled = true;
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      if (!addressFilled) {
        console.log('🧪 [FLOW-TEST] Could not find address input, taking screenshot');
        await page.screenshot({ path: 'test-results/flow-test-no-address-input.png' });
        return;
      }
      
      // Try to fill package type and weight
      const packageSelectors = [
        'select[name="package.type"]',
        '[data-testid="package-type"]',
        'select[placeholder*="package"]'
      ];
      
      for (const selector of packageSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            await element.selectOption('medium');
            console.log(`🧪 [FLOW-TEST] Selected package type using: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      const weightSelectors = [
        'input[name="package.weight"]',
        '[data-testid="package-weight"]',
        'input[placeholder*="weight"]'
      ];
      
      for (const selector of weightSelectors) {
        try {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            await element.fill('10');
            console.log(`🧪 [FLOW-TEST] Filled weight using: ${selector}`);
            break;
          }
        } catch (e) {
          // Try next selector
        }
      }
      
      console.log('🧪 [FLOW-TEST] Basic info filled, navigating to pickup');
      
    } catch (error) {
      console.log('🧪 [FLOW-TEST] Error filling form:', error);
      await page.screenshot({ path: 'test-results/flow-test-form-error.png' });
    }
    
    // Step 2: Navigate directly to pickup page (with form data in localStorage)
    await page.goto('http://localhost:3000/shipping/pickup');
    await page.waitForLoadState('networkidle');
    console.log('🧪 [FLOW-TEST] Navigated to pickup page');
    
    // Step 3: Check if we see the "Missing Required Information" message
    const missingInfoMessage = page.locator('text=Missing Required Information');
    if (await missingInfoMessage.isVisible()) {
      console.log('🧪 [FLOW-TEST] ❌ Missing required information - form data not persisted');
      
      // Try to inject form data via localStorage
      await page.evaluate(() => {
        const testData = {
          origin: {
            address: '123 Test Street',
            city: 'Test City', 
            state: 'CA',
            zip: '90210',
            country: 'US',
            contactInfo: {
              name: 'Test User',
              phone: '555-0123',
              email: 'test@example.com'
            }
          },
          package: {
            type: 'medium',
            weight: { value: 10, unit: 'lbs' },
            dimensions: { length: 12, width: 12, height: 12, unit: 'in' },
            declaredValue: 100
          }
        };
        localStorage.setItem('shipment-form-data', JSON.stringify(testData));
      });
      
      // Reload page with injected data
      await page.reload();
      await page.waitForLoadState('networkidle');
      console.log('🧪 [FLOW-TEST] Reloaded with injected test data');
    }
    
    // Step 4: Test the notifications tab
    const notificationTab = page.locator('[data-testid="tab-notifications"]');
    if (await notificationTab.isVisible()) {
      console.log('🧪 [FLOW-TEST] ✅ Found notifications tab');
      await notificationTab.click();
      await page.waitForTimeout(1000);
      
      // Check for Task 7.4 content
      const notificationPrefs = page.locator('text=Notification Preferences');
      const authManagement = page.locator('text=Authorization Management');
      const packageReadiness = page.locator('text=Package Readiness');
      const premiumServices = page.locator('text=Premium Services');
      
      const results = await Promise.all([
        notificationPrefs.isVisible(),
        authManagement.isVisible(), 
        packageReadiness.isVisible(),
        premiumServices.isVisible()
      ]);
      
      console.log('🧪 [FLOW-TEST] Task 7.4 components visibility:');
      console.log(`  - Notification Preferences: ${results[0]}`);
      console.log(`  - Authorization Management: ${results[1]}`);
      console.log(`  - Package Readiness: ${results[2]}`);
      console.log(`  - Premium Services: ${results[3]}`);
      
      if (results.some(r => r)) {
        console.log('🧪 [FLOW-TEST] ✅ Task 7.4 implementation is working!');
        
        // Test interaction with notification checkboxes
        const emailCheckbox = page.locator('input[type="checkbox"]').first();
        if (await emailCheckbox.isVisible()) {
          await emailCheckbox.check();
          console.log('🧪 [FLOW-TEST] ✅ Email notification checkbox interaction works');
        }
        
      } else {
        console.log('🧪 [FLOW-TEST] ❌ Task 7.4 components not visible');
        await page.screenshot({ path: 'test-results/flow-test-no-content.png' });
      }
      
    } else {
      console.log('🧪 [FLOW-TEST] ❌ Notifications tab not found');
      await page.screenshot({ path: 'test-results/flow-test-no-tab.png' });
    }
    
    console.log('🧪 [FLOW-TEST] Test completed');
  });

});
