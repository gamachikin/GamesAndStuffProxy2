import express from 'express';
import path from 'node:path';
import cors from 'cors';
import dotenv from 'dotenv';
import UV from '@titaniumnetwork-dev/ultraviolet';

// Load environment variables
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
  prefix: process.env.UV_PREFIX || '/service/',
  bare: process.env.UV_BARE || '/bare/',
  handler: process.env.UV_HANDLER || '/public/uv.handler.js',
  bundle: process.env.UV_BUNDLE || '/public/uv.bundle.js',
  config: process.env.UV_CONFIG || '/public/uv.config.js',
  sw: process.env.UV_SW || '/public/uv.sw.js',
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
