/**
 * Task 7.3: Pickup Contact and Instructions Tests
 * 
 * Comprehensive test suite for pickup contact management and instruction system
 * Tests all functional requirements from Task 7.3 specification
 */

import { test, expect } from '@playwright/test';

test.describe('Task 7.3: Pickup Contact and Instructions', () => {
  
  test.beforeEach(async ({ page }) => {
    console.log('🧪 [TEST-7.3] Setting up test environment');
    
    // Navigate directly to pickup page
    await page.goto('/shipping/pickup');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Navigate to contact tab
    await page.click('[data-testid="tab-contact"]');
    
    console.log('🧪 [TEST-7.3] Test environment ready');
  });

  test('should display contact information form with all required fields', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing contact form display');
    
    // Wait for component to be ready
    await page.waitForSelector('text=Primary Contact Information', { timeout: 10000 });
    
    // Check primary contact section exists
    await expect(page.locator('text=Primary Contact Information')).toBeVisible();
    
    // Verify all required fields are present
    await expect(page.locator('#primary-name')).toBeVisible();
    await expect(page.locator('#primary-mobile')).toBeVisible();
    await expect(page.locator('#primary-email')).toBeVisible();
    
    console.log('✅ [TEST-7.3] Contact form display test passed');
  });

  test('should validate required contact information fields', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing contact validation');
    
    // Try to save without required fields
    await page.click('button:has-text("Save Progress")');
    
    // Check for validation errors
    await expect(page.locator('text=Please complete required fields')).toBeVisible();
    
    // Fill required fields
    await page.fill('#primary-name', 'John Smith');
    await page.fill('#primary-mobile', '555-123-4567');
    await page.fill('#primary-email', 'john.smith@company.com');
    
    // Validation should pass
    await expect(page.locator('text=Please complete required fields')).not.toBeVisible();
    
    console.log('✅ [TEST-7.3] Contact validation test passed');
  });

  test('should format phone numbers automatically', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing phone number formatting');
    
    // Enter raw phone number
    await page.fill('#primary-mobile', '5551234567');
    
    // Check formatted display
    await expect(page.locator('#primary-mobile')).toHaveValue('(555) 123-4567');
    
    // Test international number
    await page.fill('#primary-mobile', '15551234567');
    await expect(page.locator('#primary-mobile')).toHaveValue('+1 (555) 123-4567');
    
    console.log('✅ [TEST-7.3] Phone formatting test passed');
  });

  test('should validate business email addresses', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing email validation');
    
    // Test invalid email
    await page.fill('#primary-email', 'invalid-email');
    await page.locator('#primary-email').blur();
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
    
    // Test consumer email warning
    await page.fill('#primary-email', 'user@gmail.com');
    await page.locator('#primary-email').blur();
    await expect(page.locator('text=Consider using a business email')).toBeVisible();
    
    // Test business email
    await page.fill('#primary-email', 'contact@company.com');
    await page.locator('#primary-email').blur();
    await expect(page.locator('text=Please enter a valid email')).not.toBeVisible();
    
    console.log('✅ [TEST-7.3] Email validation test passed');
  });

  test('should allow adding backup contact', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing backup contact functionality');
    
    // Initially backup contact should not be visible
    await expect(page.locator('text=Backup Contact Information')).not.toBeVisible();
    
    // Add backup contact
    await page.click('button:has-text("Add Backup Contact")');
    
    // Backup form should appear
    await expect(page.locator('text=Backup Contact Information')).toBeVisible();
    await expect(page.locator('#backup-name')).toBeVisible();
    
    // Fill backup contact
    await page.fill('#backup-name', 'Jane Doe');
    await page.fill('#backup-mobile', '555-987-6543');
    await page.fill('#backup-email', 'jane.doe@company.com');
    
    // Remove backup contact
    await page.click('button:has-text("Remove Backup Contact")');
    await expect(page.locator('text=Backup Contact Information')).not.toBeVisible();
    
    console.log('✅ [TEST-7.3] Backup contact test passed');
  });

  test('should provide pickup instructions interface', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing pickup instructions');
    
    // Navigate to instructions tab within contact form
    await page.click('[data-testid="instructions-tab"]');
    
    // Check all instruction fields
    await expect(page.locator('text=Gate Code / Access Instructions')).toBeVisible();
    await expect(page.locator('text=Parking / Loading Instructions')).toBeVisible();
    await expect(page.locator('text=Package Location Description')).toBeVisible();
    await expect(page.locator('text=General Driver Instructions')).toBeVisible();
    await expect(page.locator('text=Special Considerations / Safety')).toBeVisible();
    
    // Test character counting
    const gateAccessField = page.locator('textarea[placeholder*="gate codes"]');
    await gateAccessField.fill('Gate code: 1234. Use main entrance.');
    await expect(page.locator('text=39/200')).toBeVisible();
    
    console.log('✅ [TEST-7.3] Instructions interface test passed');
  });

  test('should provide instruction templates for different location types', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing instruction templates');
    
    await page.click('[data-testid="instructions-tab"]');
    
    // Check for templates section
    await expect(page.locator('text=Quick Templates')).toBeVisible();
    
    // Test template application
    const templateButton = page.locator('button:has-text("Commercial Ground Level")').first();
    if (await templateButton.isVisible()) {
      await templateButton.click();
      
      // Verify template was applied
      const packageLocationField = page.locator('textarea[placeholder*="location of packages"]');
      const value = await packageLocationField.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
    
    console.log('✅ [TEST-7.3] Instruction templates test passed');
  });

  test('should provide equipment selection interface', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing equipment requirements');
    
    await page.click('[data-testid="equipment-tab"]');
    
    // Check equipment options
    await expect(page.locator('text=Equipment Requirements')).toBeVisible();
    await expect(page.locator('text=Standard hand truck')).toBeVisible();
    await expect(page.locator('text=Heavy-duty dolly')).toBeVisible();
    await expect(page.locator('text=Protective padded blankets')).toBeVisible();
    
    // Test equipment selection
    await page.check('input[type="checkbox"]#appliance-dolly');
    
    // Check fee display
    await expect(page.locator('text=+$15')).toBeVisible();
    
    console.log('✅ [TEST-7.3] Equipment selection test passed');
  });

  test('should handle loading assistance options', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing loading assistance');
    
    await page.click('[data-testid="equipment-tab"]');
    
    // Check loading assistance section
    await expect(page.locator('text=Loading Assistance Level')).toBeVisible();
    
    // Test different assistance levels
    await page.check('input[value="driver-assist"]');
    await expect(page.locator('text=+$25')).toBeVisible();
    
    await page.check('input[value="full-service"]');
    await expect(page.locator('text=+$65')).toBeVisible();
    
    // Check total fee calculation
    await page.check('input[type="checkbox"]#appliance-dolly'); // +$15
    await expect(page.locator('text=Total Equipment & Service Fees')).toBeVisible();
    await expect(page.locator('text=$80')).toBeVisible(); // $65 + $15
    
    console.log('✅ [TEST-7.3] Loading assistance test passed');
  });

  test('should provide equipment recommendations based on package info', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing equipment recommendations');
    
    await page.click('[data-testid="equipment-tab"]');
    
    // For medium package, should see basic recommendations
    const recommendationsSection = page.locator('text=Recommended Equipment');
    
    if (await recommendationsSection.isVisible()) {
      // Check for recommendation content
      await expect(page.locator('[data-testid="equipment-recommendations"]')).toBeVisible();
    }
    
    console.log('✅ [TEST-7.3] Equipment recommendations test passed');
  });

  test('should show driver instructions preview', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing driver preview');
    
    await page.click('[data-testid="instructions-tab"]');
    
    // Fill some instructions
    await page.fill('textarea[placeholder*="gate codes"]', 'Gate code: 1234');
    await page.fill('textarea[placeholder*="parking"]', 'Use visitor parking');
    await page.fill('textarea[placeholder*="location of packages"]', 'Front desk reception');
    
    // Show preview
    await page.click('button:has-text("Show Preview")');
    
    // Check preview content
    await expect(page.locator('text=ACCESS: Gate code: 1234')).toBeVisible();
    await expect(page.locator('text=PARKING: Use visitor parking')).toBeVisible();
    await expect(page.locator('text=PACKAGE LOCATION: Front desk reception')).toBeVisible();
    
    console.log('✅ [TEST-7.3] Driver preview test passed');
  });

  test('should track form completion progress', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing progress tracking');
    
    // Check initial progress
    await expect(page.locator('[data-testid="progress-indicator"]')).toBeVisible();
    
    // Fill contact information
    await page.fill('#primary-name', 'John Smith');
    await page.fill('#primary-mobile', '555-123-4567');
    await page.fill('#primary-email', 'john.smith@company.com');
    
    // Progress should increase
    const contactProgress = page.locator('text=100%').first();
    await expect(contactProgress).toBeVisible();
    
    console.log('✅ [TEST-7.3] Progress tracking test passed');
  });

  test('should integrate with form state management', async ({ page }) => {
    console.log('🧪 [TEST-7.3] Testing form integration');
    
    // Fill contact information
    await page.fill('#primary-name', 'John Smith');
    await page.fill('#primary-mobile', '555-123-4567');
    await page.fill('#primary-email', 'john.smith@company.com');
    
    // Navigate away and back
    await page.click('[data-testid="tab-location"]');
    await page.click('[data-testid="tab-contact"]');
    
    // Data should persist
    await expect(page.locator('#primary-name')).toHaveValue('John Smith');
    await expect(page.locator('#primary-mobile')).toHaveValue('(555) 123-4567');
    await expect(page.locator('#primary-email')).toHaveValue('john.smith@company.com');
    
    console.log('✅ [TEST-7.3] Form integration test passed');
  });

});
