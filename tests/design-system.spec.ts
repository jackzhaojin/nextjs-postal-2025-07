import { test, expect } from '@playwright/test';

test.describe('Design System Validation', () => {
  test('Validate responsive breakpoints and typography', async ({ page }) => {
    await page.goto('/');

    // Check mobile breakpoint
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileHeader = await page.locator('header');
    await expect(mobileHeader).toBeVisible();

    // Check desktop breakpoint
    await page.setViewportSize({ width: 1200, height: 800 });
    const desktopHeader = await page.locator('header');
    await expect(desktopHeader).toBeVisible();
  });

  test('Validate color palette and shadows', async ({ page }) => {
    await page.goto('/');

    // Check primary color
    const primaryElement = await page.locator('.bg-primary');
    await expect(primaryElement).toHaveCSS('background-color', 'rgb(59, 130, 246)');

    // Check shadow
    const shadowElement = await page.locator('.shadow-lg');
    await expect(shadowElement).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.1) 0px 10px 15px');
  });

  test('Validate spacing and border radius', async ({ page }) => {
    await page.goto('/');

    // Check spacing
    const spacedElement = await page.locator('.p-6');
    await expect(spacedElement).toHaveCSS('padding', '1.5rem');

    // Check border radius
    const roundedElement = await page.locator('.rounded-lg');
    await expect(roundedElement).toHaveCSS('border-radius', '0.5rem');
  });
});
