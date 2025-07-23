#!/usr/bin/env python3

import asyncio
from playwright.async_api import async_playwright
import sys

async def test_demo_workflow():
    async with async_playwright() as p:
        # Launch browser in headless mode for server environment
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            print("🚀 Testing complete demo workflow...")
            
            # Navigate to demo page
            print("📍 Navigating to demo page...")
            await page.goto("http://localhost:3000/demo", wait_until="networkidle")
            await page.screenshot(path="demo_1_initial.png")
            
            # Check for demo scenarios
            demo_cards = page.locator(".grid .card, [class*='card']")
            card_count = await demo_cards.count()
            print(f"🎴 Demo cards found: {card_count}")
            
            # Start the Manufacturing Company Demo
            manufacturing_button = page.locator("button:has-text('Start Demo')").first
            if await manufacturing_button.count() > 0:
                print("✅ Starting Manufacturing Company Demo...")
                await manufacturing_button.click()
                await page.wait_for_timeout(1000)
                
                # Take screenshot after starting demo
                await page.screenshot(path="demo_2_started.png")
                
                # Wait for navigation to shipping page
                print("⏳ Waiting for navigation to shipping page...")
                await page.wait_for_url("**/shipping", timeout=10000)
                await page.wait_for_timeout(3000)  # Wait for demo actions to start
                
                # Take screenshot of shipping page during demo
                await page.screenshot(path="demo_3_shipping_form.png")
                
                # Check if form fields are being filled
                print("🔍 Checking if demo is filling form fields...")
                
                # Wait a bit more for demo actions to complete
                await page.wait_for_timeout(10000)
                
                # Check form field values using correct selectors
                origin_name = await page.locator('#origin-contact-name').input_value()
                origin_company = await page.locator('#origin-contact-company').input_value()
                origin_phone = await page.locator('#origin-contact-phone').input_value()
                origin_email = await page.locator('#origin-contact-email').input_value()
                
                print(f"📝 Form fields filled:")
                print(f"   Origin Contact Name: '{origin_name}'")
                print(f"   Origin Company: '{origin_company}'")
                print(f"   Origin Phone: '{origin_phone}'")
                print(f"   Origin Email: '{origin_email}'")
                
                # Take final screenshot
                await page.screenshot(path="demo_4_form_filled.png")
                
                # Check if demo controls are visible
                demo_controls = page.locator("[class*='demo-control'], .fixed")
                controls_visible = await demo_controls.count() > 0
                print(f"🎮 Demo controls visible: {controls_visible}")
                
                # Check progress bar
                progress_bar = page.locator("[class*='progress'], .fixed.top-0")
                progress_visible = await progress_bar.count() > 0
                print(f"📊 Progress bar visible: {progress_visible}")
                
                if origin_name and origin_company and origin_phone and origin_email:
                    print("✅ Demo is working! Form fields are being filled automatically.")
                else:
                    print("❌ Demo may not be working properly - form fields are empty.")
                    
            else:
                print("❌ No Start Demo buttons found")
                
        except Exception as e:
            print(f"❌ Error during test: {e}")
            await page.screenshot(path="demo_error.png")
            print("📸 Error screenshot taken: demo_error.png")
            
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_demo_workflow())