import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { PongGame } from '../core/game.engine.js';
import { listGameSessions, webSocketConnection, newGameSession, healthCheck } from '../controllers/game.controller.js'
import { gameSessions, playerConnections } from '../core/game.state.js'

// Message types
interface ClientMessage {
  type: 'paddle' | 'start' | 'stop' | 'ping';
  paddle?: 'left' | 'right';
  direction?: 'up' | 'down' | 'stop';
}

interface ServerMessage {
  type: 'connected' | 'state' | 'gameOver' | 'error' | 'pong';
  sessionId?: string;
  data?: any;
  message?: string;
}

export async function gameRoutes(app: FastifyInstance)
{ 
  app.get('/sessions', listGameSessions);
  app.get('/:sessionId', {websocket: true}, webSocketConnection);
  app.post('/create-session', newGameSession);
  app.get('/health', healthCheck );

  // 404 handler
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    reply.code(404).send({
      status: 'error',
      message: 'Endpoint not found',
      method: request.method,
      path: request.url
    });
  });
}

