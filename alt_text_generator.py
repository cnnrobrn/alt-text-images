#!/usr/bin/env python3
"""
Alt Text Generator for Framer Sites
Generates alt text for images using OpenAI's Vision API
"""

import os
import base64
import requests
from typing import List, Dict, Optional
from urllib.parse import urlparse
import json
from dataclasses import dataclass
from openai import OpenAI
import logging
from dotenv import load_dotenv
import time

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class ImageInfo:
    """Information about an image"""
    url: str
    current_alt: Optional[str] = None
    selector: Optional[str] = None
    element_id: Optional[str] = None


class AltTextGenerator:
    """Generates alt text for images using OpenAI Vision API"""
    
    def __init__(self, openai_api_key: str, rate_limit_delay: float = 1.0):
        """
        Initialize the generator with OpenAI API key
        
        Args:
            openai_api_key: OpenAI API key for Vision API access
            rate_limit_delay: Delay in seconds between API calls to avoid rate limits
        """
        self.client = OpenAI(api_key=openai_api_key)
        self.rate_limit_delay = rate_limit_delay
        self.last_api_call = 0
        
    def _wait_for_rate_limit(self):
        """Enforce rate limiting between API calls"""
        current_time = time.time()
        time_since_last_call = current_time - self.last_api_call
        if time_since_last_call < self.rate_limit_delay:
            sleep_time = self.rate_limit_delay - time_since_last_call
            logger.debug(f"Rate limiting: sleeping for {sleep_time:.2f} seconds")
            time.sleep(sleep_time)
        self.last_api_call = time.time()
    
    def generate_alt_text(self, image_url: str, context: str = "", retry_count: int = 3) -> str:
        """
        Generate alt text for a single image with rate limiting and retries
        
        Args:
            image_url: URL of the image
            context: Additional context about the image placement
            retry_count: Number of retries on rate limit errors
            
        Returns:
            Generated alt text
        """
        # Apply rate limiting before making the API call
        self._wait_for_rate_limit()
        
        for attempt in range(retry_count):
            try:
                # Prepare the prompt
                prompt = """Generate concise, descriptive alt text for this image. 
                The alt text should:
                - Be brief but descriptive (under 125 characters)
                - Describe what the image shows, not what it looks like
                - Include relevant context for screen readers
                - Be written in a natural, human-friendly way
                """
                
                if context:
                    prompt += f"\nAdditional context: {context}"
                
                # Call OpenAI Vision API
                response = self.client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {"type": "text", "text": prompt},
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": image_url,
                                        "detail": "auto"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=300
                )
                
                alt_text = response.choices[0].message.content.strip()
                logger.info(f"Generated alt text for {image_url}: {alt_text}")
                return alt_text
                
            except Exception as e:
                error_message = str(e)
                
                # Check if it's a rate limit error
                if "rate_limit_exceeded" in error_message or "429" in error_message:
                    if attempt < retry_count - 1:
                        # Calculate backoff time
                        backoff_time = 2 ** attempt + 1  # Exponential backoff: 2, 3, 5 seconds
                        logger.warning(f"Rate limit hit for {image_url}. Retrying in {backoff_time} seconds... (attempt {attempt + 1}/{retry_count})")
                        time.sleep(backoff_time)
                        continue
                    else:
                        logger.error(f"Rate limit exceeded after {retry_count} attempts for {image_url}")
                        return ""
                else:
                    logger.error(f"Error generating alt text for {image_url}: {error_message}")
                    return ""
        
        return ""
    
    def generate_batch_alt_text(self, images: List[ImageInfo], batch_size: int = 0) -> Dict[str, str]:
        """
        Generate alt text for multiple images with rate limiting
        
        Args:
            images: List of ImageInfo objects
            batch_size: Maximum number of images to process (0 for all)
            
        Returns:
            Dictionary mapping image URLs to generated alt text
        """
        results = {}
        images_to_process = images[:batch_size] if batch_size > 0 else images
        total = len(images_to_process)
        successful = 0
        failed = 0
        
        logger.info(f"Starting batch processing of {total} images...")
        logger.info(f"Rate limit delay: {self.rate_limit_delay} seconds between API calls")
        
        for i, image in enumerate(images_to_process, 1):
            if not image.current_alt:  # Only process images without alt text
                logger.info(f"[{i}/{total}] Processing: {image.url}")
                alt_text = self.generate_alt_text(image.url)
                
                if alt_text:
                    results[image.url] = alt_text
                    successful += 1
                    logger.info(f"[{i}/{total}] ✓ Success: Generated alt text")
                else:
                    results[image.url] = ""
                    failed += 1
                    logger.warning(f"[{i}/{total}] ✗ Failed: Could not generate alt text")
            else:
                logger.info(f"[{i}/{total}] Skipping {image.url} - already has alt text: {image.current_alt}")
        
        logger.info(f"Batch processing complete: {successful} successful, {failed} failed out of {total} images")
        return results


class FramerSiteAnalyzer:
    """Analyzes Framer sites to find images without alt text"""
    
    def __init__(self, site_url: str):
        """
        Initialize with Framer site URL
        
        Args:
            site_url: URL of the Framer site
        """
        self.site_url = site_url.rstrip('/')
        
    def fetch_page_content(self, path: str = "") -> str:
        """
        Fetch HTML content from a Framer page
        
        Args:
            path: Page path (empty for homepage)
            
        Returns:
            HTML content
        """
        url = f"{self.site_url}/{path}" if path else self.site_url
        
        try:
            response = requests.get(url, headers={
                'User-Agent': 'Mozilla/5.0 (compatible; AltTextBot/1.0)'
            })
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            logger.error(f"Error fetching {url}: {str(e)}")
            return ""
    
    def extract_images(self, html_content: str) -> List[ImageInfo]:
        """
        Extract image information from HTML content
        
        Args:
            html_content: HTML content to parse
            
        Returns:
            List of ImageInfo objects
        """
        from bs4 import BeautifulSoup
        
        soup = BeautifulSoup(html_content, 'html.parser')
        images = []
        
        # Find all img tags
        for img in soup.find_all('img'):
            src = img.get('src', '')
            if not src:
                continue
                
            # Convert relative URLs to absolute
            if src.startswith('//'):
                src = f"https:{src}"
            elif src.startswith('/'):
                src = f"{self.site_url}{src}"
            elif not src.startswith(('http://', 'https://')):
                src = f"{self.site_url}/{src}"
            
            # Get existing alt text
            alt = img.get('alt', '')
            
            # Get element ID and build selector
            element_id = img.get('id', '')
            classes = img.get('class', [])
            selector = self._build_selector(img)
            
            images.append(ImageInfo(
                url=src,
                current_alt=alt if alt else None,
                selector=selector,
                element_id=element_id
            ))
        
        # Also check for background images in divs with role="img"
        for div in soup.find_all('div', {'role': 'img'}):
            style = div.get('style', '')
            if 'background-image' in style:
                # Extract URL from style
                import re
                url_match = re.search(r'url\(["\']?([^"\']+)["\']?\)', style)
                if url_match:
                    src = url_match.group(1)
                    if src.startswith('//'):
                        src = f"https:{src}"
                    elif src.startswith('/'):
                        src = f"{self.site_url}{src}"
                    
                    alt = div.get('aria-label', '')
                    element_id = div.get('id', '')
                    selector = self._build_selector(div)
                    
                    images.append(ImageInfo(
                        url=src,
                        current_alt=alt if alt else None,
                        selector=selector,
                        element_id=element_id
                    ))
        
        return images
    
    def _build_selector(self, element) -> str:
        """Build a CSS selector for an element"""
        selector_parts = []
        
        # Add tag name
        selector_parts.append(element.name)
        
        # Add ID if present
        if element.get('id'):
            selector_parts.append(f"#{element['id']}")
        
        # Add classes if present
        classes = element.get('class', [])
        if classes:
            selector_parts.extend([f".{cls}" for cls in classes[:2]])  # Limit to 2 classes
        
        return ''.join(selector_parts)
    
    def find_images_without_alt(self, pages: List[str] = None) -> List[ImageInfo]:
        """
        Find all images without alt text across specified pages
        
        Args:
            pages: List of page paths to check (None for homepage only)
            
        Returns:
            List of ImageInfo objects for images without alt text
        """
        if pages is None:
            pages = ['']  # Just check homepage
        
        all_images = []
        images_without_alt = []
        
        for page in pages:
            logger.info(f"Analyzing page: {page if page else 'homepage'}")
            content = self.fetch_page_content(page)
            if content:
                images = self.extract_images(content)
                all_images.extend(images)
        
        # Filter images without alt text
        for img in all_images:
            if not img.current_alt:
                images_without_alt.append(img)
                logger.info(f"Found image without alt text: {img.url}")
        
        logger.info(f"Found {len(images_without_alt)} images without alt text out of {len(all_images)} total images")
        return images_without_alt


def main():
    """Main function to run the alt text generator"""
    
    # Load environment variables from .env file
    load_dotenv()
    
    # Load configuration
    config = {
        "openai_api_key": os.environ.get("OPENAI_API_KEY", ""),
        "framer_site_url": os.environ.get("FRAMER_SITE_URL", ""),
        "pages_to_check": os.environ.get("PAGES_TO_CHECK", "").split(",") if os.environ.get("PAGES_TO_CHECK") else [""],
        "auto_apply": os.environ.get("AUTO_APPLY", "false").lower() == "true",
        "rate_limit_delay": float(os.environ.get("RATE_LIMIT_DELAY", "2.0")),  # Default 2 seconds between API calls
        "batch_size": int(os.environ.get("BATCH_SIZE", "0"))  # 0 means process all
    }
    
    # Validate configuration
    if not config["openai_api_key"]:
        logger.error("OPENAI_API_KEY environment variable is required")
        return
    
    if not config["framer_site_url"]:
        logger.error("FRAMER_SITE_URL environment variable is required")
        return
    
    # Initialize components
    analyzer = FramerSiteAnalyzer(config["framer_site_url"])
    generator = AltTextGenerator(config["openai_api_key"], rate_limit_delay=config["rate_limit_delay"])
    
    # Find images without alt text
    logger.info(f"Analyzing Framer site: {config['framer_site_url']}")
    images_without_alt = analyzer.find_images_without_alt(config["pages_to_check"])
    
    if not images_without_alt:
        logger.info("All images have alt text!")
        return
    
    # Generate alt text for images
    images_to_process = len(images_without_alt) if config["batch_size"] == 0 else min(config["batch_size"], len(images_without_alt))
    logger.info(f"Generating alt text for {images_to_process} images (found {len(images_without_alt)} total)...")
    alt_text_results = generator.generate_batch_alt_text(images_without_alt, batch_size=config["batch_size"])
    
    # Save results to JSON
    output = {
        "site_url": config["framer_site_url"],
        "images_processed": len(alt_text_results),
        "results": []
    }
    
    for image in images_without_alt:
        if image.url in alt_text_results:
            output["results"].append({
                "url": image.url,
                "selector": image.selector,
                "element_id": image.element_id,
                "generated_alt_text": alt_text_results[image.url]
            })
    
    # Save to file
    output_file = "alt_text_results.json"
    with open(output_file, "w") as f:
        json.dump(output, f, indent=2)
    
    logger.info(f"Results saved to {output_file}")
    print(json.dumps(output, indent=2))
    
    # Auto-apply if configured
    if config.get("auto_apply"):
        logger.info("\nAuto-apply is enabled. Attempting to apply alt text to Framer site...")
        try:
            from apply_alt_text import FramerAltTextApplier
            
            framer_email = os.environ.get("FRAMER_EMAIL")
            framer_password = os.environ.get("FRAMER_PASSWORD")
            use_google_login = os.environ.get("USE_GOOGLE_LOGIN", "false").lower() == "true"
            
            if framer_email:
                applier = FramerAltTextApplier(framer_email, framer_password, use_google_login)
                applier.setup_driver()
                applier.login_to_framer()
                applier.open_project(config["framer_site_url"])
                applier.apply_alt_texts_from_file(output_file)
                
                # Ask for publish confirmation
                response = input("\nDo you want to publish the changes? (y/n): ")
                if response.lower() == 'y':
                    applier.publish_changes()
                    
                applier.cleanup()
            else:
                logger.warning("FRAMER_EMAIL not set. Skipping auto-apply.")
                logger.info("To enable auto-apply, add these to your .env file:")
                logger.info("FRAMER_EMAIL=your-email@example.com")
                logger.info("USE_GOOGLE_LOGIN=true  # If using Google login")
                logger.info("AUTO_APPLY=true")
                
        except ImportError:
            logger.warning("Selenium not installed. Run: pip install selenium")
        except Exception as e:
            logger.error(f"Failed to auto-apply: {str(e)}")


if __name__ == "__main__":
    main()