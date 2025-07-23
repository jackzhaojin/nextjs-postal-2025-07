import { test, expect } from '@playwright/test';

test.describe('Task 6.3: Interactive Demo System', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/demo');
  });

  test('should display the demo selection dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Interactive Demo System' })).toBeVisible();
    await expect(page.getByText('Manufacturing Company Demo')).toBeVisible();
    await expect(page.getByText('Healthcare Demo')).toBeVisible();
  });

  test('should start a demo when a scenario is selected', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Demo' }).first().click();
    await expect(page.getByText('Demo in progress...')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Demo Controls: Manufacturing Company Demo/ })).toBeVisible();
  });

  test('should show the demo control panel when a demo is running', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Demo' }).first().click();
    await expect(page.getByTitle('Previous Step')).toBeVisible();
    await expect(page.getByTitle('Reset Demo')).toBeVisible();
    await expect(page.getByTitle('Pause Demo')).toBeVisible();
    await expect(page.getByTitle('Fast Forward')).toBeVisible();
    await expect(page.getByTitle('Next Step')).toBeVisible();
  });

  test('should show the progress bar when a demo is running', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Demo' }).first().click();
    await expect(page.getByRole('progressbar')).toBeVisible();
  });

  test('should be able to pause and resume a demo', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Demo' }).first().click();
    
    const pauseButton = page.getByTitle('Pause Demo');
    await expect(pauseButton).toBeVisible();
    await pauseButton.click();

    const resumeButton = page.getByTitle('Resume Demo');
    await expect(resumeButton).toBeVisible();
    await resumeButton.click();

    await expect(pauseButton).toBeVisible();
  });

  test('should be able to exit the demo', async ({ page }) => {
    await page.getByRole('button', { name: 'Start Demo' }).first().click();
        await page.getByTitle('Exit demo').click();
    await expect(page.getByRole('heading', { name: 'Interactive Demo System' })).toBeVisible();
    await expect(page.getByText('Demo in progress...')).not.toBeVisible();
  });

});
