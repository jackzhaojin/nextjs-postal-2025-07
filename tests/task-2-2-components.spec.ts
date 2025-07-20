import { test, expect } from '@playwright/test'

test.describe('Task 2.2 UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-components')
  })

  test('DatePicker component works', async ({ page }) => {
    // Test standard date picker
    await expect(page.getByText('DatePicker Component')).toBeVisible()
    
    // Click on the date picker to open it - use a more specific selector
    const datePickerButton = page.locator('[data-slot="popover-trigger"]').first()
    await expect(datePickerButton).toBeVisible()
    await datePickerButton.click()
    
    // Check if calendar appears - wait longer and use more specific selector
    await expect(page.locator('[data-slot="popover-content"]')).toBeVisible({ timeout: 10000 })
    
    // Look for any day button in the calendar
    const dayButton = page.locator('button').filter({ hasText: /^\d+$/ }).first()
    await expect(dayButton).toBeVisible()
    await dayButton.click()
    
    // Verify popover closes after selection
    await expect(page.locator('[data-slot="popover-content"]')).not.toBeVisible()
  })

  test('Toast notifications work', async ({ page }) => {
    await expect(page.getByText('Toast Notifications')).toBeVisible()
    
    // Test success toast - add a small delay and check for toast container
    await page.getByRole('button', { name: 'Success Toast' }).click()
    
    // Wait a moment for the toast to render
    await page.waitForTimeout(1000)
    
    // Look for toast content more broadly - check the entire page for the text
    await expect(page.locator('text=Success!')).toBeVisible({ timeout: 10000 })
    
    // Clear any existing toasts before testing error toast
    await page.waitForTimeout(2000)
    
    // Test error toast
    await page.getByRole('button', { name: 'Error Toast' }).click()
    await page.waitForTimeout(1000)
    await expect(page.locator('text=Error occurred')).toBeVisible({ timeout: 10000 })
  })

  test('Modal components work', async ({ page }) => {
    await expect(page.getByText('Modal Components')).toBeVisible()
    
    // Test basic modal
    await page.getByRole('button', { name: 'Open Modal' }).click()
    await expect(page.getByText('Example Modal')).toBeVisible()
    await expect(page.getByText('This is a demonstration of our modal component')).toBeVisible()
    
    // Close modal with Cancel button
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByText('Example Modal')).not.toBeVisible()
    
    // Test confirm modal
    await page.getByRole('button', { name: 'Confirm Modal' }).click()
    await expect(page.getByText('Confirm Action')).toBeVisible()
    await expect(page.getByText('Are you sure you want to proceed?')).toBeVisible()
    
    // Close with Cancel
    await page.getByRole('button', { name: 'Cancel' }).click()
    
    // Test alert modal
    await page.getByRole('button', { name: 'Alert Modal' }).click()
    await expect(page.getByText('Important Notice')).toBeVisible()
    await page.getByRole('button', { name: 'Got it' }).click()
  })

  test('Drawer components work', async ({ page }) => {
    await expect(page.getByText('Drawer Components')).toBeVisible()
    
    // Test main drawer - use more specific selector
    const drawerTrigger = page.getByRole('button', { name: 'Open Drawer' })
    await expect(drawerTrigger).toBeVisible()
    await drawerTrigger.click()
    
    // Wait for drawer to open with longer timeout
    await expect(page.getByText('Settings Panel')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Configure your application settings here.')).toBeVisible()
    
    // Check drawer content
    await expect(page.getByText('Notification Settings')).toBeVisible()
    await expect(page.getByText('Email notifications')).toBeVisible()
    
    // Close drawer using the test ID which should be more reliable
    const cancelButton = page.getByTestId('drawer-cancel-button')
    await expect(cancelButton).toBeVisible()
    
    // Scroll to ensure the button is in view and clickable
    await cancelButton.scrollIntoViewIfNeeded()
    
    // Click with force to override any pointer event interception
    await cancelButton.click({ force: true })
    
    // Wait for drawer to close
    await expect(page.getByText('Settings Panel')).not.toBeVisible({ timeout: 5000 })
  })

  test('Tabs components work', async ({ page }) => {
    await expect(page.getByText('Tabs Components')).toBeVisible()
    
    // Test standard tabs
    await expect(page.getByRole('tab', { name: 'Tab 1' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Tab 2' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Tab 3' })).toBeVisible()
    
    // Check default tab content
    await expect(page.getByText('This is the content for Tab 1')).toBeVisible()
    
    // Click on Tab 2
    await page.getByRole('tab', { name: 'Tab 2' }).click()
    await expect(page.getByText('This is the content for Tab 2')).toBeVisible()
    await expect(page.getByText('This is the content for Tab 1')).not.toBeVisible()
    
    // Test card style tabs
    await expect(page.getByRole('tab', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Metrics' })).toBeVisible()
    
    // Test underline tabs
    await expect(page.getByRole('tab', { name: 'Summary' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Details' })).toBeVisible()
  })

  test('Accordion components work', async ({ page }) => {
    await expect(page.getByText('Accordion Components')).toBeVisible()
    
    // Test standard accordion
    const firstAccordionTrigger = page.getByRole('button', { name: 'What is your shipping process?' })
    await expect(firstAccordionTrigger).toBeVisible()
    
    // Click to expand
    await firstAccordionTrigger.click()
    await expect(page.getByText('Our shipping process involves package pickup')).toBeVisible()
    
    // Click to collapse
    await firstAccordionTrigger.click()
    await expect(page.getByText('Our shipping process involves package pickup')).not.toBeVisible()
    
    // Test FAQ style accordion
    const faqQuestion = page.getByRole('button', { name: 'How do I create a shipping label?' })
    await expect(faqQuestion).toBeVisible()
    
    await faqQuestion.click()
    await expect(page.getByText('You can create a shipping label by following these steps')).toBeVisible()
  })

  test('Error boundary works', async ({ page }) => {
    await expect(page.getByText('Error Boundary Test')).toBeVisible()
    
    // The error boundary component should render initially
    await expect(page.getByRole('button', { name: 'Trigger Error' })).toBeVisible()
    
    // Click to trigger error
    await page.getByRole('button', { name: 'Trigger Error' }).click()
    
    // Error boundary should catch the error and show fallback UI
    await expect(page.getByText('Something went wrong')).toBeVisible()
    await expect(page.getByText('We\'re sorry, but an unexpected error occurred')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Try Again' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Go Home' })).toBeVisible()
  })

  test('Page loads without errors', async ({ page }) => {
    // Check that all main sections are visible
    await expect(page.getByText('Component Test Page')).toBeVisible()
    await expect(page.getByText('DatePicker Component')).toBeVisible()
    await expect(page.getByText('Toast Notifications')).toBeVisible()
    await expect(page.getByText('Modal Components')).toBeVisible()
    await expect(page.getByText('Drawer Components')).toBeVisible()
    await expect(page.getByText('Tabs Components')).toBeVisible()
    await expect(page.getByText('Accordion Components')).toBeVisible()
    await expect(page.getByText('Error Boundary Test')).toBeVisible()
  })

  test('Components are responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check that content is still visible and accessible
    await expect(page.getByText('Component Test Page')).toBeVisible()
    
    // Test that mobile drawer trigger is present
    await expect(page.getByRole('button', { name: 'Mobile Menu' })).toBeVisible()
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.getByText('Component Test Page')).toBeVisible()
  })
})
