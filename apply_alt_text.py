#!/usr/bin/env python3
"""
Apply generated alt text to Framer site using browser automation
This script automates the process of applying alt text through the Framer editor
"""

import os
import json
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class FramerAltTextApplier:
    """Applies alt text to Framer site using browser automation"""
    
    def __init__(self, framer_email: str, framer_password: str = None, use_google_login: bool = False):
        """
        Initialize the applier with Framer credentials
        
        Args:
            framer_email: Email for Framer account
            framer_password: Password for Framer account (optional if using Google login)
            use_google_login: Whether to use Google OAuth login
        """
        self.email = framer_email
        self.password = framer_password
        self.use_google_login = use_google_login
        self.driver = None
        
    def setup_driver(self):
        """Setup Chrome driver with appropriate options"""
        options = webdriver.ChromeOptions()
        options.add_argument('--disable-blink-features=AutomationControlled')
        options.add_experimental_option("excludeSwitches", ["enable-automation"])
        options.add_experimental_option('useAutomationExtension', False)
        
        # Use webdriver-manager to automatically download and manage ChromeDriver
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.driver.maximize_window()
        
    def login_to_framer(self):
        """Login to Framer account"""
        logger.info("Logging into Framer...")
        self.driver.get("https://framer.com/login")
        
        wait = WebDriverWait(self.driver, 10)
        
        if self.use_google_login:
            # Click on "Continue with Google" button
            logger.info("Using Google login...")
            try:
                # Try multiple selectors for the Google login button
                google_button = None
                selectors = [
                    "//button[contains(text(), 'Continue with Google')]",
                    "//button[contains(text(), 'Sign in with Google')]",
                    "//div[contains(text(), 'Continue with Google')]",
                    "//a[contains(@href, 'google')]",
                    "//button[contains(@class, 'google')]"
                ]
                
                for selector in selectors:
                    try:
                        google_button = wait.until(EC.element_to_be_clickable((By.XPATH, selector)))
                        logger.info(f"Found Google login button with selector: {selector}")
                        break
                    except:
                        continue
                
                if not google_button:
                    logger.error("Could not find Google login button")
                    logger.info("Please manually navigate to Framer and login, then press Enter to continue...")
                    input()
                    # After manual login, we're done
                    return
                else:
                    google_button.click()
                    
                # Switch to Google login window
                time.sleep(2)
                windows = self.driver.window_handles
                if len(windows) > 1:
                    self.driver.switch_to.window(windows[-1])
                
                # Enter Google email
                email_input = wait.until(EC.presence_of_element_located((By.ID, "identifierId")))
                email_input.send_keys(self.email)
                email_input.send_keys(Keys.RETURN)
                
            except Exception as e:
                logger.error(f"Error during Google login: {str(e)}")
                logger.info("Please manually login to Framer in the browser window, then press Enter to continue...")
                input()
                return
            
            # Wait for manual authentication
            logger.info("Please complete Google authentication in the browser...")
            logger.info("Waiting for authentication to complete (you may need to enter 2FA)...")
            
            # Wait for redirect back to Framer
            original_window = windows[0]
            timeout = 120  # 2 minutes timeout for manual auth
            start_time = time.time()
            
            while time.time() - start_time < timeout:
                try:
                    self.driver.switch_to.window(original_window)
                    if "framer.com" in self.driver.current_url and "login" not in self.driver.current_url:
                        logger.info("Successfully authenticated with Google")
                        break
                except:
                    pass
                time.sleep(2)
        else:
            # Traditional email/password login
            email_input = wait.until(EC.presence_of_element_located((By.NAME, "email")))
            email_input.send_keys(self.email)
            
            password_input = self.driver.find_element(By.NAME, "password")
            password_input.send_keys(self.password)
            
            password_input.send_keys(Keys.RETURN)
            
            # Wait for dashboard to load
            time.sleep(5)
            logger.info("Successfully logged into Framer")
        
    def open_project(self, project_url: str):
        """
        Open a Framer project in editor
        
        Args:
            project_url: URL of the Framer project
        """
        logger.info(f"Opening project: {project_url}")
        
        # Convert public URL to editor URL if needed
        if "framer.app" in project_url:
            # Extract project name and convert to editor URL
            project_name = project_url.split("//")[1].split(".")[0]
            editor_url = f"https://framer.com/projects/{project_name}"
        else:
            editor_url = project_url
            
        self.driver.get(editor_url)
        time.sleep(5)
        
    def apply_alt_text_to_image(self, element_id: str, alt_text: str):
        """
        Apply alt text to a specific image element
        
        Args:
            element_id: ID of the image element
            alt_text: Alt text to apply
        """
        try:
            wait = WebDriverWait(self.driver, 10)
            
            # Search for the element in the layers panel or canvas
            search_box = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "search-input")))
            search_box.clear()
            search_box.send_keys(element_id)
            time.sleep(2)
            
            # Click on the element to select it
            element = self.driver.find_element(By.XPATH, f"//*[contains(@data-id, '{element_id}')]")
            element.click()
            time.sleep(1)
            
            # Open properties panel if not open
            properties_button = self.driver.find_element(By.XPATH, "//button[contains(@aria-label, 'Properties')]")
            properties_button.click()
            time.sleep(1)
            
            # Find and fill alt text field
            alt_text_field = self.driver.find_element(By.XPATH, "//input[@placeholder='Alt Text' or @aria-label='Alt Text']")
            alt_text_field.clear()
            alt_text_field.send_keys(alt_text)
            
            # Save changes
            alt_text_field.send_keys(Keys.RETURN)
            time.sleep(1)
            
            logger.info(f"Applied alt text to element {element_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to apply alt text to {element_id}: {str(e)}")
            return False
            
    def apply_alt_texts_from_file(self, results_file: str = "alt_text_results.json"):
        """
        Apply alt texts from a results file
        
        Args:
            results_file: Path to JSON file with alt text results
        """
        # Load results
        with open(results_file, 'r') as f:
            data = json.load(f)
            
        results = data.get('results', [])
        
        successful = 0
        failed = 0
        
        for item in results:
            element_id = item.get('element_id')
            alt_text = item.get('alt_text')
            
            if element_id and alt_text:
                if self.apply_alt_text_to_image(element_id, alt_text):
                    successful += 1
                else:
                    failed += 1
                    
        logger.info(f"Applied alt text to {successful} images, {failed} failed")
        
    def publish_changes(self):
        """Publish the changes to the live site"""
        try:
            logger.info("Publishing changes...")
            
            # Find and click publish button
            publish_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Publish')]")
            publish_button.click()
            time.sleep(2)
            
            # Confirm publish
            confirm_button = self.driver.find_element(By.XPATH, "//button[contains(text(), 'Publish') and contains(@class, 'primary')]")
            confirm_button.click()
            time.sleep(5)
            
            logger.info("Changes published successfully")
            
        except Exception as e:
            logger.error(f"Failed to publish changes: {str(e)}")
            
    def cleanup(self):
        """Close the browser"""
        if self.driver:
            self.driver.quit()
            

def main():
    """Main function to apply alt text to Framer site"""
    
    # Load environment variables
    load_dotenv()
    
    # Get Framer credentials
    framer_email = os.environ.get("FRAMER_EMAIL")
    framer_password = os.environ.get("FRAMER_PASSWORD")
    framer_project_url = os.environ.get("FRAMER_PROJECT_URL")
    use_google_login = os.environ.get("USE_GOOGLE_LOGIN", "false").lower() == "true"
    
    if not framer_email:
        logger.error("FRAMER_EMAIL environment variable is required")
        logger.info("Add this to your .env file:")
        logger.info("FRAMER_EMAIL=your-email@example.com")
        logger.info("USE_GOOGLE_LOGIN=true  # If using Google login")
        logger.info("FRAMER_PROJECT_URL=https://your-project.framer.app")
        return
        
    if not use_google_login and not framer_password:
        logger.error("FRAMER_PASSWORD is required when not using Google login")
        logger.info("Either set FRAMER_PASSWORD or set USE_GOOGLE_LOGIN=true in your .env file")
        return
        
    if not framer_project_url:
        logger.error("FRAMER_PROJECT_URL environment variable is required")
        return
        
    # Check if results file exists
    results_file = "alt_text_results.json"
    if not os.path.exists(results_file):
        logger.error(f"Results file {results_file} not found. Run alt_text_generator.py first.")
        return
        
    # Apply alt texts
    applier = FramerAltTextApplier(framer_email, framer_password, use_google_login)
    
    try:
        applier.setup_driver()
        applier.login_to_framer()
        applier.open_project(framer_project_url)
        applier.apply_alt_texts_from_file(results_file)
        
        # Ask user if they want to publish
        response = input("\nDo you want to publish the changes? (y/n): ")
        if response.lower() == 'y':
            applier.publish_changes()
            
    finally:
        applier.cleanup()
        

if __name__ == "__main__":
    main()