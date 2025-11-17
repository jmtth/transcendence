import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';
import { PongGame } from './pong.js';

// WebSocket
// import fastifyWebsocket from '@fastify/websocket';
// import type { WebSocket } from 'ws';
// await fastify.register(fastifyWebsocket);

const fastify = Fastify({ logger: true });

// Game state storage
const gameSessions = new Map<string, PongGame>();
const playerConnections = new Map<string, WebSocket>();

// Request body types
interface JoinRequestBody {}

interface StartRequestBody {
  sessionId: string;
}

interface StopRequestBody {
  sessionId: string;
}

interface PaddleRequestBody {
  sessionId: string;
  paddle: 'left' | 'right';
  direction: 'up' | 'down' | 'stop';
}

interface StateQueryString {
  sessionId: string;
}

// Health check
fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
  return {
    status: 'healthy',
    service: 'game-service',
    activeSessions: gameSessions.size,
    timestamp: new Date().toISOString()
  };
});

fastify.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
  return {
    status: 'healthy',
    service: 'game-service',
    activeSessions: gameSessions.size,
    timestamp: new Date().toISOString()
  };
});

// Join game
fastify.post('/join', async (request: FastifyRequest, reply: FastifyReply) => {
  const sessionId = randomUUID();
  const game = new PongGame(sessionId);

  gameSessions.set(sessionId, game);
  request.log.info(`[${sessionId}] New game session created`);

  return {
    status: 'success',
    message: 'Joined game session',
    sessionId,
    gameState: game.getState()
  };
});

// Start game
fastify.post<{ Body: StartRequestBody }>('/start', async (request: FastifyRequest<{ Body: StartRequestBody }>, reply: FastifyReply) => {
  const { sessionId } = request.body || {};

  if (!sessionId) {
    return reply.code(400).send({
      status: 'error',
      message: 'sessionId required'
    });
  }

  const game = gameSessions.get(sessionId);
  if (!game) {
    return reply.code(404).send({
      status: 'error',
      message: 'Game session not found'
    });
  }

  game.start();

  return {
    status: 'success',
    message: 'Game started',
    sessionId
  };
});

// Get game state
fastify.get<{ Querystring: StateQueryString }>('/state', async (request: FastifyRequest<{ Querystring: StateQueryString }>, reply: FastifyReply) => {
  const { sessionId } = request.query;

  if (!sessionId) {
    return reply.code(400).send({
      status: 'error',
      message: 'sessionId required'
    });
  }

  const game = gameSessions.get(sessionId);
  if (!game) {
    return reply.code(404).send({
      status: 'error',
      message: 'Game session not found'
    });
  }

  return {
    status: 'success',
    state: game.getState()
  };
});

// Stop game
fastify.post<{ Body: StopRequestBody }>('/stop', async (request: FastifyRequest<{ Body: StopRequestBody }>, reply: FastifyReply) => {
  const { sessionId } = request.body || {};

  if (!sessionId) {
    return reply.code(400).send({
      status: 'error',
      message: 'sessionId required'
    });
  }

  const game = gameSessions.get(sessionId);
  if (!game) {
    return reply.code(404).send({
      status: 'error',
      message: 'Game session not found'
    });
  }

  game.stop();
  gameSessions.delete(sessionId);

  return {
    status: 'success',
    message: 'Game stopped and session removed'
  };
});

// Move paddle
fastify.post<{ Body: PaddleRequestBody }>('/paddle', async (request: FastifyRequest<{ Body: PaddleRequestBody }>, reply: FastifyReply) => {
  const { sessionId, paddle, direction } = request.body || {};

  if (!sessionId || !paddle || !direction) {
    return reply.code(400).send({
      status: 'error',
      message: 'sessionId, paddle, and direction required'
    });
  }

  const game = gameSessions.get(sessionId);
  if (!game) {
    return reply.code(404).send({
      status: 'error',
      message: 'Game session not found'
    });
  }

  game.setPaddleDirection(paddle, direction);

  return {
    status: 'success',
    message: 'Paddle direction updated'
  };
});

// 404 handler
fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
  reply.code(404).send({
    status: 'error',
    message: 'Endpoint not found',
    method: request.method,
    path: request.url
  });
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3003, host: '0.0.0.0' });
    fastify.log.info('WebSocket server running on port 3003');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
// Cleanup on shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down game service...');
  gameSessions.forEach(game => game.stop());
  gameSessions.clear();
});
