#!/usr/bin/env python3

import asyncio
from playwright.async_api import async_playwright

async def test_complete_demo_workflow():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        try:
            print("🚀 Testing complete demo workflow with patience...")
            
            # Navigate to demo page
            await page.goto("http://localhost:3000/demo", wait_until="networkidle")
            print("✅ Demo page loaded")
            
            # Start Manufacturing Demo
            manufacturing_button = page.locator("button:has-text('Start Demo')").first
            await manufacturing_button.click()
            print("✅ Manufacturing demo started")
            
            # Wait for navigation to shipping page
            await page.wait_for_url("**/shipping", timeout=10000)
            print("✅ Navigated to shipping page")
            
            # Wait for and check each step of the demo execution
            print("\n🔍 Monitoring demo progression...")
            
            # Step 1: Check contact fields (should happen in first 5 seconds)
            await page.wait_for_timeout(5000)
            contact_name = await page.locator('#origin-contact-name').input_value()
            contact_company = await page.locator('#origin-contact-company').input_value()
            contact_phone = await page.locator('#origin-contact-phone').input_value()
            contact_email = await page.locator('#origin-contact-email').input_value()
            
            print(f"📝 Step 1 - Contact Info:")
            print(f"   Name: '{contact_name}' {'✅' if contact_name else '❌'}")
            print(f"   Company: '{contact_company}' {'✅' if contact_company else '❌'}")
            print(f"   Phone: '{contact_phone}' {'✅' if contact_phone else '❌'}")
            print(f"   Email: '{contact_email}' {'✅' if contact_email else '❌'}")
            
            # Step 2: Wait for address fields (should happen around 8-10 seconds)
            await page.wait_for_timeout(5000)
            origin_address = await page.locator('#origin-address').input_value()
            origin_city = await page.locator('#origin-city').input_value()
            origin_state = await page.locator('#origin-state').input_value()
            origin_zip = await page.locator('#origin-zip').input_value()
            
            print(f"\n📝 Step 2 - Origin Address:")
            print(f"   Address: '{origin_address}' {'✅' if origin_address else '❌'}")
            print(f"   City: '{origin_city}' {'✅' if origin_city else '❌'}")
            print(f"   State: '{origin_state}' {'✅' if origin_state else '❌'}")
            print(f"   ZIP: '{origin_zip}' {'✅' if origin_zip else '❌'}")
            
            # Step 3: Wait for destination fields (should happen around 11-13 seconds)
            await page.wait_for_timeout(5000)
            dest_name = await page.locator('#destination-contact-name').input_value()
            dest_company = await page.locator('#destination-contact-company').input_value()
            dest_address = await page.locator('#destination-address').input_value()
            dest_city = await page.locator('#destination-city').input_value()
            
            print(f"\n📝 Step 3 - Destination Info:")
            print(f"   Contact Name: '{dest_name}' {'✅' if dest_name else '❌'}")
            print(f"   Company: '{dest_company}' {'✅' if dest_company else '❌'}")
            print(f"   Address: '{dest_address}' {'✅' if dest_address else '❌'}")
            print(f"   City: '{dest_city}' {'✅' if dest_city else '❌'}")
            
            # Step 4: Wait for package fields (should happen around 14-16 seconds)
            await page.wait_for_timeout(5000)
            weight = await page.locator('#package-weight-value').input_value()
            length_val = await page.locator('[data-testid="dimension-length"]').input_value()
            width_val = await page.locator('[data-testid="dimension-width"]').input_value()
            height_val = await page.locator('[data-testid="dimension-height"]').input_value()
            declared_value = await page.locator('#package-declared-value').input_value()
            
            print(f"\n📝 Step 4 - Package Details:")
            print(f"   Weight: '{weight}' {'✅' if weight else '❌'}")
            print(f"   Length: '{length_val}' {'✅' if length_val else '❌'}")
            print(f"   Width: '{width_val}' {'✅' if width_val else '❌'}")
            print(f"   Height: '{height_val}' {'✅' if height_val else '❌'}")
            print(f"   Declared Value: '{declared_value}' {'✅' if declared_value else '❌'}")
            
            # Take final screenshot
            await page.screenshot(path="demo_comprehensive_final.png")
            print("\n📸 Final screenshot saved")
            
            # Calculate success metrics
            all_fields = [
                contact_name, contact_company, contact_phone, contact_email,
                origin_address, origin_city, origin_state, origin_zip,
                dest_name, dest_company, dest_address, dest_city,
                weight, length_val, width_val, height_val, declared_value
            ]
            
            filled_fields = [f for f in all_fields if f]
            success_rate = (len(filled_fields) / len(all_fields)) * 100
            
            print(f"\n📊 Demo System Performance:")
            print(f"   Total fields tested: {len(all_fields)}")
            print(f"   Fields successfully filled: {len(filled_fields)}")
            print(f"   Success rate: {success_rate:.1f}%")
            
            if success_rate >= 70:
                print("   🎉 DEMO SYSTEM IS WORKING SUCCESSFULLY!")
                return True
            else:
                print("   ⚠️  Demo system needs improvement")
                return False
                
        except Exception as e:
            print(f"❌ Error during comprehensive test: {e}")
            await page.screenshot(path="demo_comprehensive_error.png")
            return False
            
        finally:
            await browser.close()

if __name__ == "__main__":
    success = asyncio.run(test_complete_demo_workflow())
    exit(0 if success else 1)