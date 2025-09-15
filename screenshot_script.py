from playwright.sync_api import sync_playwright
import time

def take_screenshot():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        # Navigate to the page
        page.goto("http://localhost:8080/weeks/week-01.html")

        # Wait for page to load
        time.sleep(3)

        # Take initial screenshot
        page.screenshot(path="week01_initial.png", full_page=True)

        # Try to find the Mathematical Tools & Formulas section
        try:
            # Look for the section heading
            math_section = page.locator("text=Mathematical Tools & Formulas")
            if math_section.count() > 0:
                print("Found Mathematical Tools & Formulas section")
                math_section.scroll_into_view_if_needed()
                time.sleep(2)
                page.screenshot(path="week01_math_section.png", full_page=True)
            else:
                print("Mathematical Tools & Formulas section not found, scrolling down to search")
                # Scroll down to look for the section
                page.evaluate("window.scrollTo(0, document.body.scrollHeight/2)")
                time.sleep(2)
                page.screenshot(path="week01_middle.png", full_page=True)

                page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                time.sleep(2)
                page.screenshot(path="week01_bottom.png", full_page=True)

        except Exception as e:
            print(f"Error finding section: {e}")

        # Look specifically for kinematic equations
        try:
            kinematic = page.locator("text=kinematic")
            if kinematic.count() > 0:
                print("Found kinematic content")
                kinematic.first.scroll_into_view_if_needed()
                time.sleep(2)
                page.screenshot(path="week01_kinematic.png", full_page=True)
        except Exception as e:
            print(f"Error finding kinematic content: {e}")

        browser.close()

if __name__ == "__main__":
    take_screenshot()