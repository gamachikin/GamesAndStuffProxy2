import express from 'express';
import path from 'node:path';
import cors from 'cors';
import dotenv from 'dotenv';
// Use default import for CommonJS module
import UV from '@titaniumnetwork-dev/ultraviolet';

// Load environment variables from .env file for local development
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'static')));

// Ultraviolet Proxy Setup
const uv = new UV({
  prefix: '/service/', // The prefix used to distinguish proxy URLs
  bare: '/bare/',      // Path to bare server (for tunneling)
  encodeUrl: UV.codec.xor.encode, // URL encoding method
  decodeUrl: UV.codec.xor.decode, // URL decoding method
  handler: '/uv.handler.js',      // Proxy handler script
  bundle: '/uv.bundle.js',        // Bundled proxy script
  config: '/uv.config.js',        // Proxy configuration
  sw: '/uv.sw.js',                // Service worker script
});

// Use Ultraviolet as middleware for handling proxy requests
app.use(uv.prefix, uv.app());

// Basic routes
const routes = [
  { path: '/', file: 'index.html' },
  { path: '/apps', file: 'apps.html' },
  { path: '/games', file: 'games.html' },
  { path: '/chat', file: 'chat.html' },
  { path: '/settings', file: 'settings.html' },
  { path: '/canvas', file: 'canvas.html' },
];

// Serve static files
routes.forEach((route) => {
  app.get(route.path, (req, res) => {
    res.sendFile(path.join(process.cwd(), 'static', route.file));
  });
});

// Middleware to handle 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(process.cwd(), 'static', '404.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
