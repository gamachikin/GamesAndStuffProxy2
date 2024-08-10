import { createBareServer } from '@tomphttp/bare-server-node';
import express from 'express';
import { createServer } from 'node:http';
import { uvPath } from '@titaniumnetwork-dev/ultraviolet';
import { join } from 'node:path';
import { hostname } from 'node:os';
import { fileURLToPath } from 'url';

// Define the path to the public directory
const publicPath = fileURLToPath(new URL('./public/', import.meta.url));

// Create the Bare server
const bare = createBareServer('/bare/');
const app = express();

// Serve static files from the public directory
app.use(express.static(publicPath));

// Serve Ultraviolet assets
app.use('/uv/', express.static(uvPath));

// Serve custom routes from static files
const routes = [
  { path: '/apps', file: 'apps.html' },
  { path: '/games', file: 'games.html' },
  { path: '/settings', file: 'settings.html' },
  { path: '/', file: 'index.html' },
  { path: '/search', file: 'search.html' },
];

// Map custom routes
routes.forEach(({ path, file }) => {
  app.get(path, (req, res) => {
    res.sendFile(join(publicPath, file));
  });
});

// Serve a 404 page for all other routes
app.use((req, res) => {
  res.status(404).sendFile(join(publicPath, '404.html'));
});

// Create the HTTP server
const server = createServer((req, res) => {
  if (bare.shouldRoute(req)) {
    bare.routeRequest(req, res);
  } else {
    app(req, res);
  }
});

// Handle WebSocket upgrades
server.on('upgrade', (req, socket, head) => {
  if (bare.shouldRoute(req)) {
    bare.routeUpgrade(req, socket, head);
  } else {
    socket.end();
  }
});

// Determine the port to listen on
let port = parseInt(process.env.PORT || '', 10);
if (isNaN(port)) port = 3000;

// Start the server and log its address
server.on('listening', () => {
  const address = server.address();
  console.log('Listening on:');
  console.log(`\thttp://localhost:${address.port}`);
  console.log(`\thttp://${hostname()}:${address.port}`);
  console.log(`\thttp://${address.family === 'IPv6' ? `[${address.address}]` : address.address}:${address.port}`);
});

// Handle shutdown signals
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function shutdown() {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    bare.close();
    process.exit(0);
  });
}

// Listen on the specified port
server.listen({ port });
