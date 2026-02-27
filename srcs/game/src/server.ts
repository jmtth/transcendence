import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { gameRoutes } from './routes/game.routes.js';
import { gameSessions } from './core/game.state.js';
import type { PongGame } from './core/game.engine.js';
import fs from 'fs';
import { env } from './config/env.js';
import redisPlugin from './plugins/ioredis.plugin.js';
import { startGameConsumer } from './core/game.consumer.js';
import * as db from './core/game.database.js';

const fastify = Fastify({
  https: {
    key: fs.readFileSync('/etc/certs/game-service.key'),
    cert: fs.readFileSync('/etc/certs/game-service.crt'),
    ca: fs.readFileSync('/etc/ca/ca.crt'),

    requestCert: true,
    rejectUnauthorized: false,
  },

  logger: true,
});

fastify.addHook('onReady', async () => {
  startGameConsumer(fastify);
});

// Prehandlher for request route
fastify.register(redisPlugin);

fastify.addHook('preHandler', async (req, reply) => {
  const idHeader = (req.headers as any)['x-user-id'];
  const usernameHeader = req.headers['x-user-name'];
  const userId = idHeader ? Number(idHeader) : null;
  if (!userId) {
    fastify.log.warn(`invalid auth header - user id missing`);
    return reply.code(400).send({ code: 'NOT_VALID_USER', message: "This user don't exist" });
  }
  const userExist = db.getUser(userId);
  if (!userExist) {
    fastify.log.warn(`invalid auth header - user not found`);
    return reply.code(400).send({ code: 'NOT_VALID_USER', message: "This user don't exist" });
  }
  req.user = {
    id: userId,
    username: String(usernameHeader),
  };
});

// Register WebSocket support
// @ts-ignore - Fastify WebSocket plugin types are incompatible with Fastify v5 but work at runtime
await fastify.register(fastifyWebsocket);

// WebSocket game endpoint
fastify.register(gameRoutes);

// 404 handler
fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
  reply.code(404).send({
    status: 'error',
    message: 'Endpoint not found',
    method: request.method,
    path: request.url,
  });
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: env.GAME_SERVICE_PORT, host: '0.0.0.0' });
    fastify.log.info('WebSocket Pong server running on port 3003');
    fastify.log.info('Connect to: wss://localhost:3003/game/{sessionId}');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Cleanup on shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down game service...');
  gameSessions.forEach((session: any) => session.game.stop());
  gameSessions.forEach((session: any) => session.players.clear());
  gameSessions.clear();
  process.exit(0);
});
