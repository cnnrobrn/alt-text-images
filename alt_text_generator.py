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
    
    def __init__(self, openai_api_key: str):
        """
        Initialize the generator with OpenAI API key
        
        Args:
            openai_api_key: OpenAI API key for Vision API access
        """
        self.client = OpenAI(api_key=openai_api_key)
        
    def generate_alt_text(self, image_url: str, context: str = "") -> str:
        """
        Generate alt text for a single image
        
        Args:
            image_url: URL of the image
            context: Additional context about the image placement
            
        Returns:
            Generated alt text
        """
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
            logger.error(f"Error generating alt text for {image_url}: {str(e)}")
            return ""
    
    def generate_batch_alt_text(self, images: List[ImageInfo]) -> Dict[str, str]:
        """
        Generate alt text for multiple images
        
        Args:
            images: List of ImageInfo objects
            
        Returns:
            Dictionary mapping image URLs to generated alt text
        """
        results = {}
        
        for image in images:
            if not image.current_alt:  # Only process images without alt text
                alt_text = self.generate_alt_text(image.url)
                results[image.url] = alt_text
            else:
                logger.info(f"Skipping {image.url} - already has alt text: {image.current_alt}")
                
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
    
    # Load configuration
    config = {
        "openai_api_key": os.environ.get("OPENAI_API_KEY", ""),
        "framer_site_url": os.environ.get("FRAMER_SITE_URL", ""),
        "pages_to_check": os.environ.get("PAGES_TO_CHECK", "").split(",") if os.environ.get("PAGES_TO_CHECK") else [""]
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
    generator = AltTextGenerator(config["openai_api_key"])
    
    # Find images without alt text
    logger.info(f"Analyzing Framer site: {config['framer_site_url']}")
    images_without_alt = analyzer.find_images_without_alt(config["pages_to_check"])
    
    if not images_without_alt:
        logger.info("All images have alt text!")
        return
    
    # Generate alt text for images
    logger.info(f"Generating alt text for {len(images_without_alt)} images...")
    alt_text_results = generator.generate_batch_alt_text(images_without_alt)
    
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


if __name__ == "__main__":
    main()