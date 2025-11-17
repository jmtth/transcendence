import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import { randomUUID } from 'crypto';
import { PongGame } from './pong.js';
import type { WebSocket } from 'ws';

const fastify = Fastify({ logger: true });

// Register WebSocket support
await fastify.register(fastifyWebsocket);

// Game state storage
const gameSessions = new Map<string, PongGame>();
const playerConnections = new Map<string, Set<WebSocket>>();

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

// Broadcast state to all clients in a session
function broadcastToSession(sessionId: string, message: ServerMessage) {
  const connections = playerConnections.get(sessionId);
  if (!connections) return;

  const messageStr = JSON.stringify(message);
  connections.forEach(ws => {
    try {
      if (ws.readyState === ws.OPEN) {
        ws.send(messageStr);
      }
    } catch (err) {
      console.error('Failed to send to client:', err);
    }
  });
}

// Remove closed connections
function cleanupConnection(sessionId: string, ws: WebSocket) {
  const connections = playerConnections.get(sessionId);
  if (connections) {
    connections.delete(ws);
    if (connections.size === 0) {
      playerConnections.delete(sessionId);
      // Stop game if no players connected
      const game = gameSessions.get(sessionId);
      if (game) {
        game.stop();
        gameSessions.delete(sessionId);
        fastify.log.info(`[${sessionId}] Game stopped - no players connected`);
      }
    }
  }
}

// Health check
fastify.get('/health', async (request: FastifyRequest, reply: FastifyReply) => {
  return {
    status: 'healthy',
    service: 'websocket-game-service',
    activeSessions: gameSessions.size,
    activeConnections: Array.from(playerConnections.values())
      .reduce((sum, conns) => sum + conns.size, 0),
    timestamp: new Date().toISOString()
  };
});

// Create new game session (HTTP endpoint for initial setup)
fastify.post('/create-session', async (request: FastifyRequest, reply: FastifyReply) => {
  const sessionId = randomUUID();
  const game = new PongGame(sessionId);

  gameSessions.set(sessionId, game);
  playerConnections.set(sessionId, new Set());
  
  request.log.info(`[${sessionId}] New game session created`);

  return {
    status: 'success',
    message: 'Game session created',
    sessionId,
    wsUrl: `/game/${sessionId}`
  };
});

// WebSocket game endpoint
fastify.register(async function (fastify) {
  fastify.get('/:sessionId', { websocket: true }, (socket: any, req: FastifyRequest) => {
    const params = req.params as { sessionId: string };
    const sessionId = params.sessionId;
    const ws = socket;
    
    // Get or create game session
    let game = gameSessions.get(sessionId);
    if (!game) {
      game = new PongGame(sessionId);
      gameSessions.set(sessionId, game);
      playerConnections.set(sessionId, new Set());
      fastify.log.info(`[${sessionId}] Game session created via WebSocket`);
    }
    
    // Add connection to session
    const connections = playerConnections.get(sessionId);
    if (connections) {
      connections.add(ws);
    }
    fastify.log.info(`[${sessionId}] Player connected (${connections?.size} total)`);
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      sessionId,
      message: 'Connected to game session',
      data: game.getState()
    } as ServerMessage));
    
    // Set up game state broadcasting
    const stateInterval = setInterval(() => {
      if (game && game.getState().status === 'playing') {
        broadcastToSession(sessionId, {
          type: 'state',
          data: game.getState()
        });
      }
    }, 16); // ~60 FPS
    
    // Handle incoming messages
    ws.on('message', (data: Buffer) => {
      try {
        const message: ClientMessage = JSON.parse(data.toString());
        switch (message.type) {
          case 'start':
            if (game) {
              game.start();
              broadcastToSession(sessionId, {
                type: 'state',
                message: 'Game started',
                data: game.getState()
              });
              fastify.log.info(`[${sessionId}] Game started`);
            }
            break;
          case 'stop':
            if (game) {
              game.stop();
              broadcastToSession(sessionId, {
                type: 'state',
                message: 'Game stopped',
                data: game.getState()
              });
              fastify.log.info(`[${sessionId}] Game stopped`);
            }
            break;
          case 'paddle':
            if (game && message.paddle && message.direction) {
              game.setPaddleDirection(message.paddle, message.direction);
            }
            break;
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong' } as ServerMessage));
            break;
          default:
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Unknown message type'
            } as ServerMessage));
        }
      } catch (err: unknown) {
        console.error(`[${sessionId}] Error processing message:`, err);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        } as ServerMessage));
      }
    });
    
    // Handle connection close
    ws.on('close', () => {
      fastify.log.info(`[${sessionId}] Player disconnected`);
      clearInterval(stateInterval);
      cleanupConnection(sessionId, ws);
    });
    
    // Handle errors
    ws.on('error', (err: Error) => {
      console.error(`[${sessionId}] WebSocket error:`, err);
      clearInterval(stateInterval);
      cleanupConnection(sessionId, ws);
    });
  });
});

// List active sessions (for debugging)
fastify.get('/sessions', async (request: FastifyRequest, reply: FastifyReply) => {
  const sessions = Array.from(gameSessions.entries()).map(([id, game]) => ({
    sessionId: id,
    state: game.getState(),
    playerCount: playerConnections.get(id)?.size || 0
  }));

  return {
    status: 'success',
    count: sessions.length,
    sessions
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
    fastify.log.info('WebSocket Pong server running on port 3003');
    fastify.log.info('Connect to: ws://localhost:3003/game/{sessionId}');
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
  playerConnections.clear();
  process.exit(0);
});
