#!/usr/bin/env python3
"""
Simplified version to apply alt text to Framer with manual login
"""

import os
import json
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Main function to apply alt text with manual login"""
    
    # Load environment variables
    load_dotenv()
    
    # Check if results file exists
    results_file = "alt_text_results.json"
    if not os.path.exists(results_file):
        logger.error(f"Results file {results_file} not found. Run alt_text_generator.py first.")
        return
        
    # Load the results
    with open(results_file, 'r') as f:
        data = json.load(f)
    
    logger.info(f"Loaded {len(data['results'])} alt text results")
    
    # Setup Chrome driver
    logger.info("Starting Chrome browser...")
    options = webdriver.ChromeOptions()
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=options)
    driver.maximize_window()
    
    # Navigate to Framer
    logger.info("Opening Framer...")
    driver.get("https://framer.com")
    
    # Wait for manual login
    logger.info("\n" + "="*60)
    logger.info("MANUAL STEPS REQUIRED:")
    logger.info("1. Login to Framer in the browser window")
    logger.info("2. Open your project in the Framer editor")
    logger.info("3. Make sure you're on the page you want to update")
    logger.info("4. Press Enter here when ready...")
    logger.info("="*60 + "\n")
    input("Press Enter when you're ready to apply alt text...")
    
    # Show the alt text that will be applied
    logger.info("\nAlt text to be applied:")
    logger.info("-" * 40)
    
    valid_results = []
    for result in data['results']:
        alt_text = result.get('generated_alt_text', '').strip()
        if alt_text and not alt_text.startswith("Please") and not alt_text.startswith("I'm unable"):
            valid_results.append(result)
            logger.info(f"Image: {result['url'][:50]}...")
            logger.info(f"Alt text: {alt_text[:100]}...")
            logger.info("")
    
    logger.info(f"Found {len(valid_results)} valid alt texts to apply")
    
    # Since Framer doesn't have a public API, we'll need to use the plugin
    # or manually apply the alt text
    logger.info("\n" + "="*60)
    logger.info("NEXT STEPS:")
    logger.info("Since Framer doesn't provide a public API for updating content,")
    logger.info("you have two options to apply the alt text:")
    logger.info("")
    logger.info("Option 1: Use the Framer Plugin")
    logger.info("  - Install the plugin from the framer-plugin directory")
    logger.info("  - The plugin can read the JSON file and apply alt text")
    logger.info("")
    logger.info("Option 2: Manual Application")
    logger.info("  - The alt text has been saved to alt_text_results.json")
    logger.info("  - You can manually copy and paste the alt text")
    logger.info("")
    logger.info("Option 3: Use Framer's Code Components")
    logger.info("  - If your images are in code components, you can update them directly")
    logger.info("="*60 + "\n")
    
    # Keep browser open for manual work
    response = input("Keep browser open for manual work? (y/n): ")
    if response.lower() != 'y':
        driver.quit()
    else:
        logger.info("Browser will remain open. Close it manually when done.")
        

if __name__ == "__main__":
    main()