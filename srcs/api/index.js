import Fastify from 'fastify';
import PubSub from './pubSub.js';
import Routes from './routes.js';
// import Redis from 'ioredis';
import fastifyHttpProxy from '@fastify/http-proxy'
import websocketPlugin from '@fastify/websocket'
// const routes = require('./routes');
const fastify = Fastify({
  logger: true,
});

fastify.register(PubSub);
fastify.register(Routes);

// Register proxy for game service
await fastify.register(fastifyHttpProxy, {
  upstream: 'http://game-service:3003',
  prefix: '/api/game',
  rewritePrefix: '/',
  websocket: true, // Enable WebSocket proxying
});
// // HTTP proxy to game-service
// fastify.register(fastifyHttpProxy, {
//   upstream: 'http://game-service:3003', // use Docker service name if in separate container
//   prefix: '/api/game',
//   rewritePrefix: '/api/game',
// });

// WebSocket proxy to game-service
// fastify.register(fastifyHttpProxy, {
//   upstream: 'http://game-service:3003', // use Docker service name
//   prefix: '/ws/game',
//   websocket: true,
//   rewritePrefix: '/ws/game',
// });


// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: 3000,
      host: '0.0.0.0',
    });
    fastify.log.info(`✅ API Gateway listening on port 3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

