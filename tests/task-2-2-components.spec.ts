import { test, expect } from '@playwright/test'

test.describe('Task 2.2 UI Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-components')
  })

  test('DatePicker component works', async ({ page }) => {
    // Test standard date picker
    await expect(page.getByText('DatePicker Component')).toBeVisible()
    
    // Click on the date picker to open it
    await page.getByPlaceholder('Select a date').first().click()
    
    // Check if calendar appears
    await expect(page.getByRole('grid')).toBeVisible()
    
    // Click on a date (day 15)
    await page.getByRole('button', { name: '15' }).first().click()
    
    // Verify date was selected (check if placeholder changed)
    await expect(page.getByPlaceholder('Select a date').first()).not.toBeEmpty()
  })

  test('Toast notifications work', async ({ page }) => {
    await expect(page.getByText('Toast Notifications')).toBeVisible()
    
    // Test success toast
    await page.getByRole('button', { name: 'Success Toast' }).click()
    
    // Wait for toast to appear - look for the title text
    await expect(page.getByText('Success!', { exact: true })).toBeVisible({ timeout: 10000 })
    
    // Test error toast
    await page.getByRole('button', { name: 'Error Toast' }).click()
    await expect(page.getByText('Error occurred')).toBeVisible({ timeout: 10000 })
    
    // Test info toast
    await page.getByRole('button', { name: 'Info Toast' }).click()
    await expect(page.getByText('Information')).toBeVisible({ timeout: 10000 })
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
    
    // Test main drawer
    await page.getByRole('button', { name: 'Open Drawer' }).click()
    await expect(page.getByText('Settings Panel')).toBeVisible()
    await expect(page.getByText('Configure your application settings here.')).toBeVisible()
    
    // Check drawer content
    await expect(page.getByText('Notification Settings')).toBeVisible()
    await expect(page.getByText('Email notifications')).toBeVisible()
    
    // Close drawer
    await page.getByRole('button', { name: 'Cancel' }).click()
    await expect(page.getByText('Settings Panel')).not.toBeVisible()
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
