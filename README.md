# Alt Text Generator for Framer Sites

An AI-powered solution to automatically generate alt text for images on Framer sites using OpenAI's Vision API. This project consists of a Python backend service and a Framer plugin that work together to identify images without alt text and generate appropriate descriptions.

## Features

- 🔍 **Automatic Detection**: Identifies all images without alt text on your Framer site
- 🤖 **AI-Powered Generation**: Uses OpenAI's GPT-4 Vision to generate contextual alt text
- 🎨 **Framer Plugin**: Native integration with Framer editor
- 🚀 **Batch Processing**: Generate alt text for multiple images at once
- 💾 **Caching**: Reduces API calls with intelligent caching
- 📊 **Export Results**: Export generated alt text as JSON

## Architecture

The solution consists of two main components:

1. **Python Backend API** (`api_server.py`): REST API that handles image analysis and alt text generation
2. **Framer Plugin** (`framer-plugin/`): TypeScript/React plugin for the Framer editor

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key
- Framer account

### Backend Setup

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/alt-text-images.git
cd alt-text-images
```

2. **Install Python dependencies:**
```bash
pip install -r requirements.txt
```

3. **Configure environment variables:**
```bash
cp .env.example .env
# Edit .env and add your OpenAI API key and other settings
```

4. **Start the API server:**
```bash
python api_server.py
```

The server will start on `http://localhost:5000`

### Framer Plugin Setup

1. **Navigate to the plugin directory:**
```bash
cd framer-plugin
```

2. **Install dependencies:**
```bash
npm install
```

3. **Build the plugin:**
```bash
npm run build
```

4. **Install in Framer:**
   - Open your Framer project
   - Go to Plugins → Install Plugin → From File
   - Select the built plugin file

## Usage

### Using the Standalone Python Script

For batch processing without the Framer plugin:

```bash
# Set environment variables
export OPENAI_API_KEY="your_api_key"
export FRAMER_SITE_URL="https://your-site.framer.app"
export PAGES_TO_CHECK=",about,contact"  # Comma-separated list

# Run the script
python alt_text_generator.py
```

### Using the API Server

Start the server and make requests to the endpoints:

```bash
# Start the server
python api_server.py

# Analyze a site for images without alt text
curl -X POST http://localhost:5000/analyze \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"site_url": "https://your-site.framer.app"}'

# Generate alt text for an image
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{"image_url": "https://example.com/image.jpg"}'
```

### Using the Framer Plugin

1. **Open the plugin** in your Framer project
2. **Configure settings:**
   - Enter your API server URL (default: `http://localhost:5000`)
   - Enter your API key
3. **Analyze the current page** to find images without alt text
4. **Select images** you want to process
5. **Generate alt text** using the AI
6. **Apply the generated text** to your Framer elements
7. **Export results** as JSON if needed

## API Endpoints

### `GET /health`
Health check endpoint

### `POST /analyze`
Analyze a Framer site for images without alt text

**Request:**
```json
{
  "site_url": "https://example.framer.app",
  "pages": ["", "about", "contact"]
}
```

### `POST /generate`
Generate alt text for a single image

**Request:**
```json
{
  "image_url": "https://example.com/image.jpg",
  "context": "Optional context about the image"
}
```

### `POST /generate-batch`
Generate alt text for multiple images

**Request:**
```json
{
  "images": [
    {"url": "https://example.com/image1.jpg"},
    {"url": "https://example.com/image2.jpg"}
  ]
}
```

## Configuration

### Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)
- `API_KEY`: API key for securing the endpoints
- `PORT`: Port for the API server (default: 5000)
- `FRAMER_SITE_URL`: URL of your Framer site (for standalone script)
- `PAGES_TO_CHECK`: Comma-separated list of pages to check

### Framer Plugin Settings

Settings are stored in browser localStorage:
- API Server URL
- API Key

## Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **CORS**: The API server has CORS enabled for Framer plugin access
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **HTTPS**: Use HTTPS in production environments

## Troubleshooting

### Common Issues

1. **"OPENAI_API_KEY not set" error**
   - Ensure your `.env` file contains the correct API key
   - Check that the environment variable is loaded

2. **Connection refused to API server**
   - Verify the server is running on the correct port
   - Check firewall settings

3. **Images not detected in Framer**
   - Ensure the plugin has proper permissions
   - Try refreshing the Framer editor

4. **Alt text not applying**
   - Check that the images have valid IDs
   - Verify write permissions in Framer

## Development

### Running Tests

```bash
# Python tests
python -m pytest tests/

# TypeScript tests
cd framer-plugin && npm test
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.