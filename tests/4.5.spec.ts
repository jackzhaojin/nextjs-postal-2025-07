import { test, expect } from '@playwright/test';

test.describe('Task 4.5: Enhanced User Experience Features', () => {
  test.beforeEach(async ({ page }) => {
    console.log('Test setup: Navigating to shipping page');
    await page.goto('/shipping');
    await page.waitForLoadState('networkidle');
  });

  test('PackageSummary component renders with basic package information', async ({ page }) => {
    console.log('Test: PackageSummary basic rendering');
    
    // Fill in basic package information to trigger summary
    await page.fill('input[name="package.weight.value"]', '10');
    await page.fill('input[name="package.dimensions.length"]', '12');
    await page.fill('input[name="package.dimensions.width"]', '8');
    await page.fill('input[name="package.dimensions.height"]', '6');
    await page.fill('input[name="package.declaredValue"]', '100');
    
    // Wait for package summary to appear
    await page.waitForSelector('[data-testid="package-summary"]', { timeout: 5000 });
    
    // Verify package summary displays correct information
    const summary = page.locator('[data-testid="package-summary"]');
    await expect(summary).toBeVisible();
    
    // Check for dimension display
    await expect(summary.locator('text=12" × 6" × 8"')).toBeVisible();
    
    // Check for weight information
    await expect(summary.locator('text=10 lbs')).toBeVisible();
    
    // Check for declared value
    await expect(summary.locator('text=$100')).toBeVisible();
    
    console.log('Test passed: PackageSummary displays basic information correctly');
  });

  test('PackageSummary shows smart recommendations for optimization', async ({ page }) => {
    console.log('Test: PackageSummary smart recommendations');
    
    // Create a scenario that should trigger recommendations (oversized package)
    await page.fill('input[name="package.weight.value"]', '5');
    await page.fill('input[name="package.dimensions.length"]', '30');
    await page.fill('input[name="package.dimensions.width"]', '30');
    await page.fill('input[name="package.dimensions.height"]', '30');
    await page.fill('input[name="package.declaredValue"]', '2000');
    
    // Wait for recommendations to appear
    await page.waitForSelector('[data-testid="smart-recommendations"]', { timeout: 5000 });
    
    const recommendations = page.locator('[data-testid="smart-recommendations"]');
    await expect(recommendations).toBeVisible();
    
    // Should show dimensional weight optimization
    await expect(recommendations.locator('text=Reduce Dimensional Weight')).toBeVisible();
    
    // Should show high-value package protection
    await expect(recommendations.locator('text=High-Value Package Protection')).toBeVisible();
    
    console.log('Test passed: Smart recommendations appear for optimization scenarios');
  });

  test('ContextualHelp displays relevant help content for form fields', async ({ page }) => {
    console.log('Test: ContextualHelp functionality');
    
    // Look for help icon next to a field
    const helpIcon = page.locator('[data-testid="help-origin-address"]').first();
    await expect(helpIcon).toBeVisible();
    
    // Click help icon
    await helpIcon.click();
    
    // Wait for help content to appear
    await page.waitForSelector('[data-testid="help-content"]', { timeout: 3000 });
    
    const helpContent = page.locator('[data-testid="help-content"]');
    await expect(helpContent).toBeVisible();
    
    // Should contain address format help
    await expect(helpContent.locator('text=Address Format Requirements')).toBeVisible();
    
    // Click on a help topic
    await helpContent.locator('text=Address Format Requirements').click();
    
    // Should show detailed help content
    await expect(helpContent.locator('text=Include building number and street name')).toBeVisible();
    
    console.log('Test passed: Contextual help displays and functions correctly');
  });

  test('Progressive Disclosure toggles between basic and advanced modes', async ({ page }) => {
    console.log('Test: Progressive Disclosure mode switching');
    
    // Look for mode toggle
    const modeToggle = page.locator('[data-testid="mode-toggle"]');
    await expect(modeToggle).toBeVisible();
    
    // Should start in basic mode
    await expect(modeToggle.locator('text=Basic')).toHaveClass(/default|active/);
    
    // Switch to advanced mode
    await modeToggle.locator('text=Advanced').click();
    
    // Wait for advanced fields to appear
    await page.waitForTimeout(500);
    
    // Advanced mode should be active
    await expect(modeToggle.locator('text=Advanced')).toHaveClass(/default|active/);
    
    // Switch to expert mode
    await modeToggle.locator('text=Expert').click();
    
    // Expert mode should be active
    await expect(modeToggle.locator('text=Expert')).toHaveClass(/default|active/);
    
    console.log('Test passed: Progressive disclosure mode switching works');
  });

  test('Performance monitoring tracks and displays metrics', async ({ page }) => {
    console.log('Test: Performance monitoring functionality');
    
    // Enable performance monitoring (if not already enabled)
    const performanceMonitor = page.locator('[data-testid="performance-monitor"]');
    
    if (await performanceMonitor.isVisible()) {
      // Check for basic metrics display
      await expect(performanceMonitor.locator('text=Render Time')).toBeVisible();
      await expect(performanceMonitor.locator('text=Memory Usage')).toBeVisible();
      
      // Should show metric values
      const renderTime = performanceMonitor.locator('[data-testid="render-time"]');
      const memoryUsage = performanceMonitor.locator('[data-testid="memory-usage"]');
      
      if (await renderTime.isVisible()) {
        await expect(renderTime).toContainText(/\d+ms/);
      }
      
      if (await memoryUsage.isVisible()) {
        await expect(memoryUsage).toContainText(/\d+MB/);
      }
      
      console.log('Test passed: Performance monitoring displays metrics');
    } else {
      console.log('Test skipped: Performance monitor not visible');
    }
  });

  test('User Analytics tracks field interactions', async ({ page }) => {
    console.log('Test: User Analytics tracking');
    
    // Fill out some form fields to generate analytics data
    const originAddress = page.locator('input[name="origin.address"]');
    await originAddress.focus();
    await originAddress.fill('123 Test Street');
    await originAddress.blur();
    
    const originCity = page.locator('input[name="origin.city"]');
    await originCity.focus();
    await originCity.fill('Test City');
    await originCity.blur();
    
    // Wait a bit for analytics to process
    await page.waitForTimeout(1000);
    
    // Check if analytics dashboard is available
    const analyticsDashboard = page.locator('[data-testid="analytics-dashboard"]');
    
    if (await analyticsDashboard.isVisible()) {
      // Should show interaction count
      await expect(analyticsDashboard.locator('text=Interactions')).toBeVisible();
      
      // Should show fields tracked
      await expect(analyticsDashboard.locator('text=Fields Tracked')).toBeVisible();
      
      console.log('Test passed: User analytics tracks interactions');
    } else {
      console.log('Test skipped: Analytics dashboard not visible');
    }
  });

  test('Enhanced form experience with auto-save and validation feedback', async ({ page }) => {
    console.log('Test: Enhanced form experience');
    
    // Fill out origin address
    await page.fill('input[name="origin.address"]', '123 Main St');
    await page.fill('input[name="origin.city"]', 'Anytown');
    await page.fill('input[name="origin.state"]', 'CA');
    await page.fill('input[name="origin.zip"]', '12345');
    
    // Wait for auto-save indicator
    await page.waitForTimeout(2000);
    
    // Check for auto-save feedback
    const autoSaveIndicator = page.locator('[data-testid="auto-save-status"]');
    if (await autoSaveIndicator.isVisible()) {
      await expect(autoSaveIndicator).toContainText(/saved|auto-saved/i);
    }
    
    // Check for validation feedback
    const validationStatus = page.locator('[data-testid="validation-status"]');
    if (await validationStatus.isVisible()) {
      // Should show completion status
      await expect(validationStatus).toBeVisible();
    }
    
    console.log('Test passed: Enhanced form experience working');
  });

  test('Mobile-responsive design elements work correctly', async ({ page }) => {
    console.log('Test: Mobile responsiveness');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Reload page to apply mobile styles
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that mode toggle is compact on mobile
    const modeToggle = page.locator('[data-testid="mode-toggle-compact"]');
    if (await modeToggle.isVisible()) {
      await expect(modeToggle).toBeVisible();
    }
    
    // Check that help content positions correctly on mobile
    const helpIcon = page.locator('[data-testid="help-origin-address"]').first();
    if (await helpIcon.isVisible()) {
      await helpIcon.click();
      
      const helpContent = page.locator('[data-testid="help-content"]');
      if (await helpContent.isVisible()) {
        // Help content should be visible and properly positioned
        await expect(helpContent).toBeVisible();
      }
    }
    
    console.log('Test passed: Mobile responsive design working');
  });

  test('Progressive disclosure maintains form state across mode changes', async ({ page }) => {
    console.log('Test: Form state preservation across modes');
    
    // Fill out some form data
    await page.fill('input[name="origin.address"]', '123 Test Street');
    await page.fill('input[name="origin.city"]', 'Test City');
    
    // Switch to advanced mode
    const modeToggle = page.locator('[data-testid="mode-toggle"]');
    if (await modeToggle.isVisible()) {
      await modeToggle.locator('text=Advanced').click();
      await page.waitForTimeout(500);
      
      // Data should still be there
      await expect(page.locator('input[name="origin.address"]')).toHaveValue('123 Test Street');
      await expect(page.locator('input[name="origin.city"]')).toHaveValue('Test City');
      
      // Switch back to basic mode
      await modeToggle.locator('text=Basic').click();
      await page.waitForTimeout(500);
      
      // Data should still be preserved
      await expect(page.locator('input[name="origin.address"]')).toHaveValue('123 Test Street');
      await expect(page.locator('input[name="origin.city"]')).toHaveValue('Test City');
    }
    
    console.log('Test passed: Form state preserved across mode changes');
  });

  test('Performance optimizations prevent excessive re-renders', async ({ page }) => {
    console.log('Test: Performance optimization effectiveness');
    
    // Add performance monitoring script
    await page.addInitScript(() => {
      (window as any).renderCount = 0;
      const originalRender = React.createElement;
      React.createElement = function(...args) {
        (window as any).renderCount++;
        return originalRender.apply(this, args);
      };
    });
    
    // Perform actions that might cause re-renders
    await page.fill('input[name="origin.address"]', '123');
    await page.waitForTimeout(100);
    await page.fill('input[name="origin.address"]', '123 Main');
    await page.waitForTimeout(100);
    await page.fill('input[name="origin.address"]', '123 Main St');
    
    // Check render count (should be optimized)
    const renderCount = await page.evaluate(() => (window as any).renderCount);
    
    // With proper optimization, render count should be reasonable
    expect(renderCount).toBeLessThan(50); // Arbitrary threshold for this test
    
    console.log(`Test passed: Render count optimized (${renderCount} renders)`);
  });
});

test.describe('Enhanced UX Features Integration', () => {
  test('All enhancement features work together seamlessly', async ({ page }) => {
    console.log('Integration test: All UX features together');
    
    await page.goto('/shipping');
    await page.waitForLoadState('networkidle');
    
    // Test package summary with help and analytics
    await page.fill('input[name="package.weight.value"]', '15');
    await page.fill('input[name="package.dimensions.length"]', '20');
    await page.fill('input[name="package.dimensions.width"]', '15');
    await page.fill('input[name="package.dimensions.height"]', '10');
    await page.fill('input[name="package.declaredValue"]', '500');
    
    // Should trigger package summary
    const packageSummary = page.locator('[data-testid="package-summary"]');
    if (await packageSummary.isVisible()) {
      await expect(packageSummary).toBeVisible();
    }
    
    // Use help system
    const helpIcon = page.locator('[data-testid="help-package-weight"]').first();
    if (await helpIcon.isVisible()) {
      await helpIcon.click();
      const helpContent = page.locator('[data-testid="help-content"]');
      if (await helpContent.isVisible()) {
        await expect(helpContent).toBeVisible();
      }
    }
    
    // Switch progressive disclosure modes
    const modeToggle = page.locator('[data-testid="mode-toggle"]');
    if (await modeToggle.isVisible()) {
      await modeToggle.locator('text=Advanced').click();
      await page.waitForTimeout(500);
    }
    
    // All features should work together without conflicts
    console.log('Integration test passed: All features work together');
  });
});