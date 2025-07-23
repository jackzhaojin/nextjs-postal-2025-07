#!/usr/bin/env python3

import asyncio
from playwright.async_api import async_playwright

async def debug_demo():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        # Listen to console logs to see what's happening
        page.on("console", lambda msg: print(f"[BROWSER] {msg.type}: {msg.text}"))
        
        try:
            print("🔍 Debugging demo execution...")
            
            # Navigate to demo page
            await page.goto("http://localhost:3000/demo", wait_until="networkidle")
            
            # Start demo
            print("Starting Manufacturing Demo...")
            manufacturing_button = page.locator("button:has-text('Start Demo')").first
            await manufacturing_button.click()
            
            # Wait for navigation and see logs
            await page.wait_for_url("**/shipping", timeout=10000)
            print("Navigated to shipping page, waiting for demo execution...")
            
            # Wait longer to see if demo actions happen
            await page.wait_for_timeout(15000)
            
            # Check if any fields got filled
            contact_name = await page.locator('#origin-contact-name').input_value()
            print(f"Contact name field: '{contact_name}'")
            
            # Take screenshot
            await page.screenshot(path="demo_debug.png")
            
        except Exception as e:
            print(f"Error: {e}")
            await page.screenshot(path="demo_debug_error.png")
            
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(debug_demo())