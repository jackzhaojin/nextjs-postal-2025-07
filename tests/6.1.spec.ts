import { test, expect } from '@playwright/test';

test.describe('Task 6.1: Payment Method Selection', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the payment page directly for testing
    await page.goto('/shipping/payment');
  });

  test('should display payment method selector', async ({ page }) => {
    await expect(page.getByText('Select your preferred B2B payment method.')).toBeVisible();
    await expect(page.getByText('Purchase Order')).toBeVisible();
    await expect(page.getByText('Bill of Lading')).toBeVisible();
    await expect(page.getByText('Third-Party Billing')).toBeVisible();
    await expect(page.getByText('Net Terms')).toBeVisible();
    await expect(page.getByText('Corporate Account')).toBeVisible();
  });

  test('should render Purchase Order form when selected', async ({ page }) => {
    await page.getByText('Purchase Order').click();
    await expect(page.getByLabel('PO Number')).toBeVisible();
    await expect(page.getByLabel('PO Amount')).toBeVisible();
    await expect(page.getByLabel('PO Expiration Date')).toBeVisible();
    await expect(page.getByLabel('Approval Contact (Email or Phone)')).toBeVisible();
  });

  test('should render Bill of Lading form when selected', async ({ page }) => {
    await page.getByText('Bill of Lading').click();
    await expect(page.getByLabel('BOL Number')).toBeVisible();
    await expect(page.getByLabel('BOL Date')).toBeVisible();
    await expect(page.getByLabel('Freight Terms')).toBeVisible();
  });

  test('should render Third-Party Billing form when selected', async ({ page }) => {
    await page.getByText('Third-Party Billing').click();
    await expect(page.getByLabel('Account Number')).toBeVisible();
    await expect(page.getByLabel('Company Name')).toBeVisible();
    await expect(page.getByLabel('Contact Info (Email or Phone)')).toBeVisible();
  });

  test('should render Net Terms form when selected', async ({ page }) => {
    await page.getByText('Net Terms').click();
    await expect(page.getByLabel('Net Terms Period')).toBeVisible();
    await expect(page.getByLabel('Credit Application (PDF/DOC, max 5MB)')).toBeVisible();
    await expect(page.getByText('Trade References (3 required)')).toBeVisible();
    await expect(page.getByLabel('Annual Revenue')).toBeVisible();
  });

  test('should render Corporate Account form when selected', async ({ page }) => {
    await page.getByText('Corporate Account').click();
    await expect(page.getByLabel('Account Number')).toBeVisible();
    await expect(page.getByLabel('Account PIN')).toBeVisible();
    await expect(page.getByLabel('Billing Contact (Email or Phone)')).toBeVisible();
  });

  test('should show validation errors for Purchase Order form', async ({ page }) => {
    await page.getByText('Purchase Order').click();
    await page.getByRole('button', { name: 'Continue to Pickup' }).click();
    await expect(page.getByText('PO Number must be between 4 and 50 characters')).toBeVisible();
    await expect(page.getByText('Amount must be a non-negative number')).toBeVisible();
    await expect(page.getByText('PO Expiration must be a future date')).toBeVisible();
    await expect(page.getByText('Must be a valid business email or phone number')).toBeVisible();
  });

  test('should allow navigation to next step when Purchase Order form is valid', async ({ page }) => {
    await page.getByText('Purchase Order').click();
    await page.getByLabel('PO Number').fill('PO-12345');
    await page.getByLabel('PO Amount').fill('100');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    await page.getByLabel('PO Expiration Date').fill(futureDate.toISOString().split('T')[0]);
    await page.getByLabel('Approval Contact (Email or Phone)').fill('test@example.com');

    await page.getByRole('button', { name: 'Continue to Pickup' }).click();
    await expect(page.url()).toContain('/shipping/pickup');
  });
});
