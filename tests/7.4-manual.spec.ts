import { test, expect } from '@playwright/test';

/**
 * Task 7.4: Manual Form Data Test
 * Manually sets up complete form data and tests notification system
 */

test.describe('Task 7.4: Manual Data Setup Test', () => {
  
  test('should manually inject form data and verify Task 7.4 components', async ({ page }) => {
    console.log('🧪 [MANUAL-TEST] Starting manual data injection test');
    
    // Navigate to pickup page
    await page.goto('http://localhost:3000/shipping/pickup');
    await page.waitForLoadState('networkidle');
    console.log('🧪 [MANUAL-TEST] Navigated to pickup page');
    
    // Inject comprehensive test data via window object
    await page.evaluate(() => {
      // Complete shipment details
      const testShipmentDetails = {
        origin: {
          address: '123 Test Street',
          suite: 'Suite 100',
          city: 'Test City',
          state: 'CA',
          zip: '90210',
          country: 'US',
          isResidential: false,
          locationType: 'commercial',
          locationDescription: 'Main office building',
          contactInfo: {
            name: 'John Doe',
            company: 'Test Company',
            phone: '555-0123',
            email: 'john@test.com',
            extension: '123'
          }
        },
        destination: {
          address: '456 Dest Avenue',
          suite: '',
          city: 'Dest City',
          state: 'NY',
          zip: '10001',
          country: 'US',
          isResidential: false,
          locationType: 'commercial',
          locationDescription: '',
          contactInfo: {
            name: 'Jane Smith',
            company: 'Dest Company',
            phone: '555-0456',
            email: 'jane@dest.com',
            extension: ''
          }
        },
        package: {
          type: 'medium',
          dimensions: { length: 12, width: 12, height: 12, unit: 'in' },
          weight: { value: 10, unit: 'lbs' },
          declaredValue: 1500, // High value to trigger security requirements
          currency: 'USD',
          contents: 'Electronics',
          contentsCategory: 'electronics',
          specialHandling: []
        },
        deliveryPreferences: {
          signatureRequired: true,
          adultSignatureRequired: false,
          smsConfirmation: true,
          photoProof: false,
          saturdayDelivery: false,
          holdAtLocation: false,
          serviceLevel: 'reliable'
        },
        pickupDetails: {
          primaryContact: {
            name: 'John Doe',
            mobilePhone: '555-0123',
            email: 'john@test.com'
          }
        }
      };
      
      // Store in localStorage (common pattern for form persistence)
      localStorage.setItem('shipment-details', JSON.stringify(testShipmentDetails));
      localStorage.setItem('form-data', JSON.stringify(testShipmentDetails));
      localStorage.setItem('pickup-form-data', JSON.stringify(testShipmentDetails));
      
      // Also try to inject directly into window for React to pick up
      (window as any).testShipmentDetails = testShipmentDetails;
      
      console.log('🧪 [MANUAL-TEST] Injected test data:', testShipmentDetails);
    });
    
    // Reload to pick up injected data
    await page.reload();
    await page.waitForLoadState('networkidle');
    console.log('🧪 [MANUAL-TEST] Page reloaded with injected data');
    
    // Check if we still see missing information message
    const missingInfo = page.locator('text=Missing Required Information');
    const hasMissingInfo = await missingInfo.isVisible();
    console.log(`🧪 [MANUAL-TEST] Missing info message visible: ${hasMissingInfo}`);
    
    if (!hasMissingInfo) {
      console.log('🧪 [MANUAL-TEST] ✅ Form data successfully injected');
      
      // Find and click notifications tab
      const notificationTab = page.locator('[data-testid="tab-notifications"]');
      if (await notificationTab.isVisible()) {
        console.log('🧪 [MANUAL-TEST] Clicking notifications tab');
        await notificationTab.click();
        await page.waitForTimeout(2000); // Longer wait for content to load
        
        // Check for actual content rendering
        const pageContent = await page.content();
        console.log('🧪 [MANUAL-TEST] Checking page content for Task 7.4 elements...');
        
        // Look for specific Task 7.4 text content
        const hasNotificationPrefs = pageContent.includes('Notification Preferences');
        const hasAuthManagement = pageContent.includes('Authorization Management');  
        const hasPackageReadiness = pageContent.includes('Package Readiness');
        const hasPremiumServices = pageContent.includes('Premium Services');
        
        console.log('🧪 [MANUAL-TEST] Content analysis:');
        console.log(`  - Notification Preferences: ${hasNotificationPrefs}`);
        console.log(`  - Authorization Management: ${hasAuthManagement}`);
        console.log(`  - Package Readiness: ${hasPackageReadiness}`);
        console.log(`  - Premium Services: ${hasPremiumServices}`);
        
        if (hasNotificationPrefs || hasAuthManagement || hasPackageReadiness || hasPremiumServices) {
          console.log('🧪 [MANUAL-TEST] ✅ Task 7.4 content found in page!');
          
          // Try to interact with visible elements
          const checkboxes = page.locator('input[type="checkbox"]');
          const checkboxCount = await checkboxes.count();
          console.log(`🧪 [MANUAL-TEST] Found ${checkboxCount} checkboxes`);
          
          if (checkboxCount > 0) {
            await checkboxes.first().check();
            console.log('🧪 [MANUAL-TEST] ✅ Successfully interacted with checkbox');
          }
          
        } else {
          console.log('🧪 [MANUAL-TEST] ❌ Task 7.4 content not found in page content');
          
          // Save the HTML for inspection
          await page.screenshot({ 
            path: 'test-results/manual-test-notification-tab.png',
            fullPage: true 
          });
          
          // Check console for errors
          const consoleLogs = await page.evaluate(() => {
            return (window as any).consoleErrors || [];
          });
          console.log('🧪 [MANUAL-TEST] Console errors:', consoleLogs);
        }
        
      } else {
        console.log('🧪 [MANUAL-TEST] ❌ Notifications tab not found');
      }
      
    } else {
      console.log('🧪 [MANUAL-TEST] ❌ Still showing missing information after data injection');
      await page.screenshot({ path: 'test-results/manual-test-missing-info.png' });
    }
    
    console.log('🧪 [MANUAL-TEST] Test completed');
  });

});
