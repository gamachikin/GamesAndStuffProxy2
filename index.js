import express from 'express';
import path from 'node:path';
import cors from 'cors';
import dotenv from 'dotenv';
import { UV } from '@titaniumnetwork-dev/ultraviolet';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Initialize Ultraviolet
const uv = new UV({
  prefix: process.env.UV_PREFIX || '/service/',
  handler: process.env.UV_HANDLER || '/public/uv/uv.handler.js',
  bundle: process.env.UV_BUNDLE || '/public/uv/uv.bundle.js',
  config: process.env.UV_CONFIG || '/public/uv/uv.config.js',
  sw: process.env.UV_SW || '/public/uv/uv.sw.js',
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), 'public')));

// Use Ultraviolet as middleware for handling proxy requests
app.use(uv.prefix, uv.app());

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'test.html'));
});

// Middleware to handle 404 errors
app.use((req, res) => {
  res.status(404).sendFile(path.join(process.cwd(), 'public', '404.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
