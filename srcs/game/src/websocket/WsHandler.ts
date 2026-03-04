// ============================================================================
// WsHandler — Routes incoming WS messages to the appropriate action
// No game logic: just message parsing + delegation.
// ============================================================================

import { WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';
import { ClientMessage, ServerMessage, WS_CLOSE } from '../types/game.types.js';
import { Session } from '../core/session/Session.js';
import { broadcastToSession, sendToWs } from './WsBroadcast.js';

/**
 * Attach message handlers to a client WebSocket.
 * Delegates start/stop/paddle/ping to the session and engine.
 */
export function attachWsMessageHandler(
  ws: WebSocket,
  session: Session,
  app: FastifyInstance,
): void {
  ws.on('message', (data: Buffer) => {
    try {
      const message: ClientMessage = JSON.parse(data.toString());

      switch (message.type) {
        case 'start':
          if (session.game.status === 'waiting') {
            session.game.start();
            broadcastToSession(session, {
              type: 'state',
              message: 'Game started',
              data: session.game.getState(),
            });
            app.log.info(`[${session.id}] Game started via WS`);
          }
          break;

        case 'stop':
          // "stop" means quit — close this player's connection
          session.closePlayer(ws, WS_CLOSE.PLAYER_QUIT, 'Player quit');
          break;

        case 'paddle':
          if (message.paddle && message.direction) {
            session.game.setPaddleDirection(message.paddle, message.direction);
          }
          break;

        case 'ping':
          sendToWs(ws, { type: 'pong' });
          break;

        default:
          sendToWs(ws, { type: 'error', message: 'Unknown message type' });
      }
    } catch (err: unknown) {
      app.log.error(`[${session.id}] Error processing WS message: ${err}`);
      sendToWs(ws, { type: 'error', message: 'Invalid message format' });
    }
  });
}
