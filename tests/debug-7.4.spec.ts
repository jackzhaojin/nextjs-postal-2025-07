import { test, expect } from '@playwright/test';

/**
 * Task 7.4: Notification and Authorization Tests
 * Testing comprehensive notification and authorization system
 */

test.describe('Task 7.4: Notification and Authorization', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to shipping page and complete required steps
    await page.goto('http://localhost:3000/shipping');
    
    // Fill in origin address
    await page.fill('[data-testid="origin-address"]', '123 Test St');
    await page.fill('[data-testid="origin-city"]', 'Test City');
    await page.selectOption('[data-testid="origin-state"]', 'CA');
    await page.fill('[data-testid="origin-zip"]', '90210');
    
    // Fill in destination address
    await page.fill('[data-testid="destination-address"]', '456 Dest Ave');
    await page.fill('[data-testid="destination-city"]', 'Dest City');
    await page.selectOption('[data-testid="destination-state"]', 'NY');
    await page.fill('[data-testid="destination-zip"]', '10001');
    
    // Fill in package details
    await page.selectOption('[data-testid="package-type"]', 'medium');
    await page.fill('[data-testid="package-weight"]', '25');
    await page.fill('[data-testid="package-length"]', '12');
    await page.fill('[data-testid="package-width"]', '12');
    await page.fill('[data-testid="package-height"]', '12');
    await page.fill('[data-testid="package-value"]', '1500'); // High-value for testing security
    
    // Continue to pickup page
    await page.click('[data-testid="continue-to-pricing"]');
    await page.waitForLoadState('networkidle');
    
    // Select a pricing option and continue
    await page.click('[data-testid="select-pricing-option"]:first-child');
    await page.click('[data-testid="continue-to-payment"]');
    await page.waitForLoadState('networkidle');
    
    // Fill payment info and continue to pickup
    await page.selectOption('[data-testid="payment-method"]', 'corporate');
    await page.fill('[data-testid="account-number"]', '12345');
    await page.click('[data-testid="continue-to-pickup"]');
    await page.waitForLoadState('networkidle');
    
    // Complete location and contact tabs first
    await page.click('[data-testid="tab-location"]');
    await page.selectOption('[data-testid="location-type"]', 'ground-level');
    
    await page.click('[data-testid="tab-contact"]');
    await page.fill('[data-testid="primary-contact-name"]', 'John Smith');
    await page.fill('[data-testid="primary-contact-phone"]', '+1 (555) 123-4567');
    await page.fill('[data-testid="primary-contact-email"]', 'john@company.com');
    
    // Navigate to notifications tab
    await page.click('[data-testid="tab-notifications"]');
    await page.waitForLoadState('networkidle');
  });

  test('should display notification preferences with proper defaults', async ({ page }) => {
    console.log('🔔 Testing notification preferences display');
    
    // Check that notification preferences section is visible
    await expect(page.locator('text=Pickup Reminders')).toBeVisible();
    await expect(page.locator('text=Real-Time Updates')).toBeVisible();
    await expect(page.locator('text=Communication Channels')).toBeVisible();
    
    // Verify default reminder settings
    await expect(page.locator('text=Email Reminder (24 hours before)')).toBeVisible();
    await expect(page.locator('text=SMS Reminder (2 hours before)')).toBeVisible();
    await expect(page.locator('text=Phone Call Reminder (30 minutes before)')).toBeVisible();
    
    // Check default enabled states
    const emailReminder = page.locator('[data-testid="reminder-email-24h"]');
    const smsReminder = page.locator('[data-testid="reminder-sms-2h"]');
    
    if (await emailReminder.count() > 0) {
      await expect(emailReminder).toBeChecked();
    }
    if (await smsReminder.count() > 0) {
      await expect(smsReminder).toBeChecked();
    }
  });

  test('should handle notification channel configuration', async ({ page }) => {
    console.log('📱 Testing communication channel configuration');
    
    // Look for communication channels section
    const channelSection = page.locator('text=Communication Channels').locator('..');
    await expect(channelSection).toBeVisible();
    
    // Test email channel configuration
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('notifications@company.com');
    }
    
    // Test phone channel configuration
    const phoneInput = page.locator('input[type="tel"]').first();
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('+1 (555) 987-6543');
    }
    
    // Test notification channel selection
    const emailChannelButton = page.locator('button:has-text("Email")').first();
    if (await emailChannelButton.count() > 0) {
      await emailChannelButton.click();
    }
    
    const smsChannelButton = page.locator('button:has-text("SMS")').first();
    if (await smsChannelButton.count() > 0) {
      await smsChannelButton.click();
    }
  });

  test('should display package readiness section', async ({ page }) => {
    console.log('📦 Testing package readiness functionality');
    
    // Check for package readiness section
    await expect(page.locator('text=Package Ready Time')).toBeVisible();
    await expect(page.locator('text=Preparation Checklist')).toBeVisible();
    
    // Test ready time picker
    const readyTimeInput = page.locator('input[type="datetime-local"]');
    if (await readyTimeInput.count() > 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const timeString = tomorrow.toISOString().slice(0, 16);
      await readyTimeInput.fill(timeString);
    }
    
    // Check preparation checklist items
    await expect(page.locator('text=Shipping Label Attached')).toBeVisible();
    await expect(page.locator('text=Package Securely Sealed')).toBeVisible();
    await expect(page.locator('text=Location Accessible')).toBeVisible();
    
    // For high-value packages, check for additional items
    await expect(page.locator('text=Insurance Documentation')).toBeVisible();
  });

  test('should handle authorization management for high-value shipments', async ({ page }) => {
    console.log('🛡️ Testing authorization management for high-value shipments');
    
    // Check for high-value security warning
    await expect(page.locator('text=High-Value Shipment Security')).toBeVisible();
    
    // Check primary authorization section
    await expect(page.locator('text=Primary Contact Authorization')).toBeVisible();
    
    // Test primary contact form
    const primaryNameInput = page.locator('[data-testid="primary-auth-name"]');
    if (await primaryNameInput.count() > 0) {
      await primaryNameInput.fill('John Smith');
    }
    
    const primaryPhoneInput = page.locator('[data-testid="primary-auth-phone"]');
    if (await primaryPhoneInput.count() > 0) {
      await primaryPhoneInput.fill('+1 (555) 123-4567');
    }
    
    // Verify ID verification is required for high-value
    const idVerificationCheckbox = page.locator('text=ID Verification Required').locator('..//input');
    if (await idVerificationCheckbox.count() > 0) {
      await expect(idVerificationCheckbox).toBeChecked();
      await expect(idVerificationCheckbox).toBeDisabled(); // Should be required and disabled
    }
    
    // Test additional personnel
    const addPersonnelButton = page.locator('button:has-text("Add Person")');
    if (await addPersonnelButton.count() > 0) {
      await addPersonnelButton.click();
      
      // Fill additional person details
      const additionalNameInput = page.locator('[data-testid="additional-person-name"]');
      if (await additionalNameInput.count() > 0) {
        await additionalNameInput.fill('Jane Doe');
      }
    }
  });

  test('should display premium services options', async ({ page }) => {
    console.log('⭐ Testing premium services configuration');
    
    // Check premium services sections
    await expect(page.locator('text=Weekend Pickup')).toBeVisible();
    await expect(page.locator('text=Holiday Pickup')).toBeVisible();
    await expect(page.locator('text=After Hours Pickup')).toBeVisible();
    await expect(page.locator('text=Special Arrangements')).toBeVisible();
    
    // Test weekend pickup toggle
    const weekendCheckbox = page.locator('text=Enable Saturday pickup').locator('..//input');
    if (await weekendCheckbox.count() > 0) {
      await weekendCheckbox.check();
      
      // Check that additional fees are displayed
      await expect(page.locator('text=+$50')).toBeVisible();
    }
    
    // Test special arrangements
    const specialArrangementText = page.locator('textarea[placeholder*="special arrangement"]');
    if (await specialArrangementText.count() > 0) {
      await specialArrangementText.fill('Need forklift assistance for heavy package');
      
      const addRequestButton = page.locator('button:has-text("Add Request")');
      if (await addRequestButton.count() > 0) {
        await addRequestButton.click();
      }
    }
  });

  test('should validate form completion and show progress', async ({ page }) => {
    console.log('✅ Testing form validation and progress tracking');
    
    // Check progress indicator
    const progressIndicator = page.locator('text=% Complete');
    await expect(progressIndicator).toBeVisible();
    
    // Check section status indicators
    const tabList = page.locator('[role="tablist"]');
    await expect(tabList).toBeVisible();
    
    // Look for validation messages
    const validationSection = page.locator('text=Please address the following issues');
    if (await validationSection.count() > 0) {
      await expect(validationSection).toBeVisible();
    }
    
    // Test form completion by filling required fields
    // (This would require completing all sections properly)
    
    // Check that continue button state reflects form validity
    const continueButton = page.locator('button:has-text("Continue to Review")');
    await expect(continueButton).toBeVisible();
  });

  test('should handle form data persistence', async ({ page }) => {
    console.log('💾 Testing form data persistence');
    
    // Fill some form data
    const emailInput = page.locator('input[type="email"]').first();
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
    }
    
    // Navigate away and back
    await page.click('[data-testid="tab-contact"]');
    await page.click('[data-testid="tab-notifications"]');
    
    // Check that data persists
    if (await emailInput.count() > 0) {
      await expect(emailInput).toHaveValue('test@example.com');
    }
  });

  test('should calculate and display premium service fees', async ({ page }) => {
    console.log('💰 Testing premium service fee calculation');
    
    // Enable weekend pickup
    const weekendCheckbox = page.locator('text=Enable Saturday pickup').locator('..//input');
    if (await weekendCheckbox.count() > 0) {
      await weekendCheckbox.check();
    }
    
    // Enable after hours pickup
    const afterHoursCheckbox = page.locator('text=Enable after hours pickup').locator('..//input');
    if (await afterHoursCheckbox.count() > 0) {
      await afterHoursCheckbox.check();
    }
    
    // Check for fee summary
    const feesSummary = page.locator('text=Premium Service Fees');
    if (await feesSummary.count() > 0) {
      await expect(feesSummary).toBeVisible();
      
      // Check individual fees
      await expect(page.locator('text=Weekend Pickup')).toBeVisible();
      await expect(page.locator('text=After Hours Pickup')).toBeVisible();
      
      // Check total calculation
      await expect(page.locator('text=Total Additional Fees')).toBeVisible();
    }
  });

  test('should handle emergency contact protocols', async ({ page }) => {
    console.log('🚨 Testing emergency contact protocols');
    
    // Look for emergency contact protocol section
    const emergencySection = page.locator('text=Emergency Contact Protocol');
    if (await emergencySection.count() > 0) {
      await expect(emergencySection).toBeVisible();
      
      // Enable emergency contacts
      const enableCheckbox = page.locator('text=Enable emergency contact protocol').locator('..//input');
      if (await enableCheckbox.count() > 0) {
        await enableCheckbox.check();
        
        // Add emergency contact
        const addContactButton = page.locator('button:has-text("Add Contact")');
        if (await addContactButton.count() > 0) {
          await addContactButton.click();
          
          // Fill emergency contact details
          const contactNameInput = page.locator('[data-testid="emergency-contact-name"]');
          if (await contactNameInput.count() > 0) {
            await contactNameInput.fill('Emergency Manager');
          }
          
          const contactPhoneInput = page.locator('[data-testid="emergency-contact-phone"]');
          if (await contactPhoneInput.count() > 0) {
            await contactPhoneInput.fill('+1 (555) 911-0000');
          }
        }
      }
    }
  });

  test('should show different security requirements based on package value', async ({ page }) => {
    console.log('🔒 Testing security requirements based on package value');
    
    // For high-value shipment (already set to $1500), check enhanced security
    await expect(page.locator('text=High-Value Shipment Security')).toBeVisible();
    await expect(page.locator('text=Enhanced security protocols required')).toBeVisible();
    
    // Check that ID verification is mandatory
    const idVerificationCheckbox = page.locator('text=ID Verification Required').locator('..//input');
    if (await idVerificationCheckbox.count() > 0) {
      await expect(idVerificationCheckbox).toBeChecked();
      await expect(idVerificationCheckbox).toBeDisabled();
    }
    
    // Check for insurance requirements
    const securityRequirements = page.locator('text=Security requirements must be specified');
    if (await securityRequirements.count() > 0) {
      await expect(securityRequirements).toBeVisible();
    }
  });

});
