#!/usr/bin/env python3
"""
Flask API server for Alt Text Generator
Provides REST endpoints for Framer plugin integration
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from alt_text_generator import AltTextGenerator, FramerSiteAnalyzer, ImageInfo
import os
import logging
from typing import Dict, List
from functools import wraps
import hashlib
import time

app = Flask(__name__)
CORS(app)  # Enable CORS for Framer plugin

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cache for generated alt texts (in production, use Redis)
alt_text_cache: Dict[str, Dict] = {}


def require_api_key(f):
    """Decorator to require API key for endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        expected_key = os.environ.get('API_KEY', 'development-key')
        
        if api_key != expected_key:
            return jsonify({'error': 'Invalid or missing API key'}), 401
            
        return f(*args, **kwargs)
    return decorated_function


def get_cache_key(image_url: str) -> str:
    """Generate cache key for an image URL"""
    return hashlib.md5(image_url.encode()).hexdigest()


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Alt Text Generator API',
        'version': '1.0.0'
    })


@app.route('/analyze', methods=['POST'])
@require_api_key
def analyze_site():
    """
    Analyze a Framer site for images without alt text
    
    Expected JSON payload:
    {
        "site_url": "https://example.framer.app",
        "pages": ["", "about", "contact"]  // Optional, defaults to homepage only
    }
    """
    data = request.get_json()
    
    if not data or 'site_url' not in data:
        return jsonify({'error': 'site_url is required'}), 400
    
    site_url = data['site_url']
    pages = data.get('pages', [''])
    
    try:
        analyzer = FramerSiteAnalyzer(site_url)
        images_without_alt = analyzer.find_images_without_alt(pages)
        
        # Convert to JSON-serializable format
        results = []
        for img in images_without_alt:
            results.append({
                'url': img.url,
                'selector': img.selector,
                'element_id': img.element_id,
                'current_alt': img.current_alt
            })
        
        return jsonify({
            'site_url': site_url,
            'pages_analyzed': pages,
            'images_without_alt': results,
            'total_found': len(results)
        })
        
    except Exception as e:
        logger.error(f"Error analyzing site: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/generate', methods=['POST'])
@require_api_key
def generate_alt_text():
    """
    Generate alt text for a single image
    
    Expected JSON payload:
    {
        "image_url": "https://example.com/image.jpg",
        "context": "Optional context about the image"
    }
    """
    data = request.get_json()
    
    if not data or 'image_url' not in data:
        return jsonify({'error': 'image_url is required'}), 400
    
    image_url = data['image_url']
    context = data.get('context', '')
    
    # Check cache first
    cache_key = get_cache_key(image_url)
    if cache_key in alt_text_cache:
        cached_data = alt_text_cache[cache_key]
        if time.time() - cached_data['timestamp'] < 86400:  # 24 hour cache
            logger.info(f"Returning cached alt text for {image_url}")
            return jsonify({
                'image_url': image_url,
                'alt_text': cached_data['alt_text'],
                'cached': True
            })
    
    try:
        # Get OpenAI API key from environment
        openai_key = os.environ.get('OPENAI_API_KEY')
        if not openai_key:
            return jsonify({'error': 'OpenAI API key not configured'}), 500
        
        generator = AltTextGenerator(openai_key)
        alt_text = generator.generate_alt_text(image_url, context)
        
        # Cache the result
        alt_text_cache[cache_key] = {
            'alt_text': alt_text,
            'timestamp': time.time()
        }
        
        return jsonify({
            'image_url': image_url,
            'alt_text': alt_text,
            'cached': False
        })
        
    except Exception as e:
        logger.error(f"Error generating alt text: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/generate-batch', methods=['POST'])
@require_api_key
def generate_batch_alt_text():
    """
    Generate alt text for multiple images
    
    Expected JSON payload:
    {
        "images": [
            {
                "url": "https://example.com/image1.jpg",
                "context": "Optional context"
            },
            {
                "url": "https://example.com/image2.jpg"
            }
        ]
    }
    """
    data = request.get_json()
    
    if not data or 'images' not in data:
        return jsonify({'error': 'images array is required'}), 400
    
    images_data = data['images']
    
    if not isinstance(images_data, list):
        return jsonify({'error': 'images must be an array'}), 400
    
    try:
        # Get OpenAI API key from environment
        openai_key = os.environ.get('OPENAI_API_KEY')
        if not openai_key:
            return jsonify({'error': 'OpenAI API key not configured'}), 500
        
        generator = AltTextGenerator(openai_key)
        results = []
        
        for img_data in images_data:
            if not isinstance(img_data, dict) or 'url' not in img_data:
                continue
            
            image_url = img_data['url']
            context = img_data.get('context', '')
            
            # Check cache
            cache_key = get_cache_key(image_url)
            if cache_key in alt_text_cache:
                cached_data = alt_text_cache[cache_key]
                if time.time() - cached_data['timestamp'] < 86400:
                    results.append({
                        'url': image_url,
                        'alt_text': cached_data['alt_text'],
                        'cached': True
                    })
                    continue
            
            # Generate new alt text
            alt_text = generator.generate_alt_text(image_url, context)
            
            # Cache the result
            alt_text_cache[cache_key] = {
                'alt_text': alt_text,
                'timestamp': time.time()
            }
            
            results.append({
                'url': image_url,
                'alt_text': alt_text,
                'cached': False
            })
        
        return jsonify({
            'results': results,
            'total_processed': len(results)
        })
        
    except Exception as e:
        logger.error(f"Error in batch generation: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/clear-cache', methods=['POST'])
@require_api_key
def clear_cache():
    """Clear the alt text cache"""
    global alt_text_cache
    alt_text_cache = {}
    return jsonify({'message': 'Cache cleared successfully'})


if __name__ == '__main__':
    # Check for required environment variables
    if not os.environ.get('OPENAI_API_KEY'):
        logger.warning("OPENAI_API_KEY not set. API will not be able to generate alt text.")
    
    # Set default API key for development
    if not os.environ.get('API_KEY'):
        os.environ['API_KEY'] = 'development-key'
        logger.warning("Using default development API key. Set API_KEY environment variable for production.")
    
    # Run the Flask app
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)