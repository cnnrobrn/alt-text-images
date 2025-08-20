const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 5174;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static files
app.use(express.static('dist'));
app.use(express.static('.'));

// Serve the plugin manifest
app.get('/manifest.json', (req, res) => {
  res.json({
    id: "alt-text-generator",
    displayName: "Alt Text Generator",
    description: "Generate alt text for images using OpenAI",
    icon: "🖼️",
    permissions: ["read", "write"],
    entrypoint: `http://localhost:${PORT}/plugin.mjs`
  });
});

// Serve framer.json
app.get('/framer.json', (req, res) => {
  res.json({
    id: "alt-text-generator",
    name: "Alt Text Generator",
    displayName: "Alt Text Generator",
    description: "Generate alt text for images using OpenAI",
    icon: "🖼️",
    permissions: ["read", "write"],
    entrypoint: `http://localhost:${PORT}/plugin.mjs`
  });
});

// Serve the plugin file
app.get('/plugin.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'plugin.mjs'));
});

app.get('/plugin.mjs', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'plugin.mjs'));
});

app.listen(PORT, () => {
  console.log(`Framer plugin server running at http://localhost:${PORT}`);
  console.log(`Use this URL in Framer: http://localhost:${PORT}/manifest.json`);
});