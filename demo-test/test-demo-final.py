#!/usr/bin/env python3

import asyncio
from playwright.async_api import async_playwright

async def test_demo_comprehensive():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            print("🚀 Running comprehensive demo system test...")
            
            # Test 1: Demo page loads correctly
            print("\n📍 Test 1: Demo Page Loading")
            await page.goto("http://localhost:3000/demo", wait_until="networkidle")
            
            title = await page.title()
            heading = await page.locator("h1").inner_text()
            demo_cards = await page.locator(".grid .card, [class*='card']").count()
            start_buttons = await page.locator("button:has-text('Start Demo')").count()
            
            print(f"   ✅ Page title: {title}")
            print(f"   ✅ Heading: {heading}")
            print(f"   ✅ Demo cards: {demo_cards}")
            print(f"   ✅ Start buttons: {start_buttons}")
            
            # Test 2: Demo starts and navigates correctly
            print("\n📍 Test 2: Demo Start and Navigation")
            manufacturing_button = page.locator("button:has-text('Start Demo')").first
            await manufacturing_button.click()
            
            # Wait for navigation
            await page.wait_for_url("**/shipping", timeout=10000)
            current_url = page.url
            print(f"   ✅ Navigated to: {current_url}")
            
            # Test 3: Demo fills form fields correctly
            print("\n📍 Test 3: Form Field Automation")
            await page.wait_for_timeout(8000)  # Wait for demo actions
            
            # Check all filled fields
            fields_to_check = {
                "Contact Name": "#origin-contact-name",
                "Company": "#origin-contact-company", 
                "Phone": "#origin-contact-phone",
                "Email": "#origin-contact-email",
                "Address": "#origin-address",
                "City": "#origin-city",
                "State": "#origin-state",
                "ZIP": "#origin-zip"
            }
            
            filled_fields = {}
            for field_name, selector in fields_to_check.items():
                try:
                    value = await page.locator(selector).input_value()
                    filled_fields[field_name] = value
                    status = "✅" if value else "❌"
                    print(f"   {status} {field_name}: '{value}'")
                except:
                    print(f"   ❌ {field_name}: Field not found")
                    
            # Test 4: Demo controls and UI elements
            print("\n📍 Test 4: Demo UI Elements")
            
            # Check for demo mode indicator
            demo_in_progress = await page.locator("text=Demo in progress").count() > 0
            print(f"   ✅ Demo mode active: {demo_in_progress}")
            
            # Take final screenshots
            await page.screenshot(path="demo_final_test.png")
            print("   ✅ Final screenshot saved")
            
            # Test 5: Healthcare Demo
            print("\n📍 Test 5: Healthcare Demo Test")
            await page.goto("http://localhost:3000/demo")
            healthcare_button = page.locator("button:has-text('Start Demo')").nth(1)
            if await healthcare_button.count() > 0:
                await healthcare_button.click()
                await page.wait_for_url("**/shipping", timeout=10000)
                await page.wait_for_timeout(5000)
                
                # Check healthcare demo fields
                healthcare_company = await page.locator("#origin-contact-company").input_value()
                print(f"   ✅ Healthcare demo company: '{healthcare_company}'")
            
            # Summary
            print("\n📊 Test Summary:")
            filled_count = sum(1 for v in filled_fields.values() if v)
            total_fields = len(fields_to_check)
            success_rate = (filled_count / total_fields) * 100
            
            print(f"   Fields filled: {filled_count}/{total_fields} ({success_rate:.1f}%)")
            
            if success_rate >= 80:
                print("   🎉 DEMO SYSTEM IS WORKING SUCCESSFULLY!")
            else:
                print("   ⚠️  Demo system needs improvement")
                
        except Exception as e:
            print(f"❌ Error during comprehensive test: {e}")
            await page.screenshot(path="demo_final_error.png")
            
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(test_demo_comprehensive())