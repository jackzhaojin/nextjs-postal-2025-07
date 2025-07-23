#!/usr/bin/env python3

import asyncio
from playwright.async_api import async_playwright
import sys

async def test_demo_system():
    async with async_playwright() as p:
        # Launch browser in headless mode for server environment
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            print("🚀 Testing demo system...")
            
            # Navigate to demo page
            print("📍 Navigating to demo page...")
            await page.goto("http://localhost:3000/demo", wait_until="networkidle")
            
            # Take screenshot of initial state
            await page.screenshot(path="demo_initial.png")
            print("📸 Screenshot taken: demo_initial.png")
            
            # Check page title and content
            title = await page.title()
            print(f"📄 Page title: {title}")
            
            # Look for main heading
            heading = page.locator("h1")
            if await heading.count() > 0:
                heading_text = await heading.first.inner_text()
                print(f"📋 Main heading: {heading_text}")
            else:
                print("❌ No main heading found")
            
            # Check for demo selector cards
            demo_cards = page.locator(".grid .card, [class*='card']")
            card_count = await demo_cards.count()
            print(f"🎴 Demo cards found: {card_count}")
            
            # Check for Start Demo buttons
            start_buttons = page.locator("button:has-text('Start Demo')")
            button_count = await start_buttons.count()
            print(f"🔘 Start Demo buttons found: {button_count}")
            
            if button_count > 0:
                print("✅ Attempting to start first demo...")
                await start_buttons.first.click()
                await page.wait_for_timeout(2000)
                
                # Take screenshot after clicking
                await page.screenshot(path="demo_started.png")
                print("📸 Screenshot taken: demo_started.png")
                
                # Check if demo mode is active
                demo_controls = page.locator("[class*='demo-control'], .fixed")
                controls_count = await demo_controls.count()
                print(f"🎮 Demo control panels found: {controls_count}")
                
                # Check for progress bar
                progress = page.locator("[class*='progress'], .fixed.top-0")
                progress_count = await progress.count()
                print(f"📊 Progress indicators found: {progress_count}")
                
            else:
                print("❌ No Start Demo buttons found - checking page source...")
                content = await page.content()
                print("📝 Page content preview:")
                print(content[:1000] + "..." if len(content) > 1000 else content)
                
        except Exception as e:
            print(f"❌ Error during test: {e}")
            await page.screenshot(path="demo_error.png")
            print("📸 Error screenshot taken: demo_error.png")
            
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_demo_system())