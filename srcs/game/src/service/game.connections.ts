import { gameSessions } from '../core/game.state.js';
import { FastifyInstance } from 'fastify';
import { WS_CLOSE } from '../core/game.state.js';
import { WebSocket } from 'ws';

export function cleanupConnection(
  socket: WebSocket | null,
  sessionId: string,
  code: number = 1000,
  message: string,
) {
  const currentSession = gameSessions.get(sessionId);
  if (!currentSession || !currentSession.players) return;

  if (socket) {
    socket.close(code, message);
  } else {
    currentSession.players.forEach((id, socket) => socket.close(code, message));
    currentSession.players.clear();
  }
  if (currentSession.players.size === 0) {
    if (currentSession.interval) {
      clearInterval(currentSession.interval);
      currentSession.interval = null;
    }
  }
}

export function addPlayerConnection(this: FastifyInstance, socket: WebSocket, sessionId: string) {
  const currentSession = gameSessions.get(sessionId);
  if (!currentSession || !currentSession.players || !socket) return false;

  const players = currentSession.players;

  // players is Map<WebSocket, 'A' | 'B'>
  // Check existing player IDs via values(), not keys()
  const existingIds = Array.from(players.values()); // ['A'] or ['A', 'B'] etc.

  if (players.size >= 2) {
    socket.close(WS_CLOSE.SESSION_FULL, 'Session full');
    return false;
  }

  if (players.size === 1 && existingIds.includes('A')) {
    // Second player: assign B
    players.set(socket, 'B');
    socket.send(JSON.stringify({ type: 'connected', message: 'Player B' }));
  } else if (players.size === 0) {
    // First player: assign A
    players.set(socket, 'A');
    socket.send(JSON.stringify({ type: 'connected', message: 'Player A' }));
  } else {
    // Fallback: session has 1 player but not 'A' (shouldn't happen)
    socket.close(WS_CLOSE.SESSION_FULL, 'Session full');
    return false;
  }

  this.log.info(
    `[${sessionId}] Player ${ players.get(socket) } connected. Total: ${currentSession.players.size}`,
  );

  // Once both players connected, send start automatically
  if (players.size === 2) {
    const game = currentSession.game;
    if (game && game.status === 'waiting') {
      game.start();
      this.log.info(`[${sessionId}] Both players connected — game auto-started`);
    }
  }

  // Handle connection close
  socket.on('close', (code: number, reason: string) => {
    this.log.info(`[${sessionId}] Player disconnected: ${code} - ${reason}`);
    players.delete(socket);
    if (players.size === 0 && currentSession.game.status === 'waiting') {
      currentSession.game.stop();
      this.log.info(`[${sessionId}] Game stopped`);
    }
  });

  // Handle errors
  socket.on('error', (err: Error) => {
    console.error(`[${sessionId}] WebSocket error:`, err);
    cleanupConnection(socket, sessionId, 4444, 'error');
  });

  return true;
}
