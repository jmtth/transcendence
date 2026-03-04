// ============================================================================
// AiMode — Human (Player A) vs AI (Player B controlled via REST RL API)
// AI paddle movement comes from the pong-ai service calling REST endpoints.
// ============================================================================

import { WebSocket } from 'ws';
import { FastifyInstance } from 'fastify';
import { IGameMode, UserIdentity } from './IGameMode.js';
import { Session } from '../core/session/Session.js';
import { GameOverData, WS_CLOSE } from '../types/game.types.js';
import { createHumanPlayer, createAiPlayer } from '../core/player/PlayerFactory.js';
import type { MatchRepository } from '../repositories/MatchRepository.js';

export class AiMode implements IGameMode {
  constructor(private matchRepo: MatchRepository) {}

  canStart(session: Session): boolean {
    // AI mode starts with 1 human player (AI is virtual)
    return session.connectedPlayerCount >= 1;
  }

  async onPlayerJoin(
    session: Session,
    ws: WebSocket,
    user: UserIdentity | null,
    app: FastifyInstance,
  ): Promise<boolean> {
    if (session.isFull()) {
      ws.close(WS_CLOSE.SESSION_FULL, 'Session full');
      return false;
    }

    // Player A: the human
    const playerA = createHumanPlayer('A', user?.id ?? null, ws);
    session.setPlayer('A', playerA);
    ws.send(JSON.stringify({ type: 'connected', message: 'Player A' }));

    // Player B: AI (no WS, controlled via REST)
    const aiB = createAiPlayer('B');
    session.setPlayer('B', aiB);

    app.log.info(`[${session.id}] AI mode — Player A (userId=${user?.id}), Player B = AI`);

    // Auto-start: AI is always "ready"
    if (session.game.status === 'waiting') {
      session.game.start();
      app.log.info(`[${session.id}] AI mode — game auto-started`);
    }

    return true;
  }

  async onPlayerDisconnect(
    session: Session,
    ws: WebSocket,
    app: FastifyInstance,
  ): Promise<void> {
    session.removePlayerByWs(ws);
    app.log.info(`[${session.id}] AI mode — human player disconnected`);

    if (session.connectedPlayerCount === 0 && session.game.status === 'waiting') {
      session.game.stop();
    }
  }

  async onGameOver(
    session: Session,
    result: GameOverData,
    app: FastifyInstance,
  ): Promise<void> {
    const player1Id = session.getUserId('A');
    // AI has no real userId — we still persist the match for stats
    if (player1Id == null || !Number.isFinite(player1Id)) {
      app.log.warn({ event: 'ai_match_no_human_player', sessionId: session.id });
      return;
    }

    try {
      // AI matches stored as free matches, player2 = 0 (AI marker)
      const AI_PLAYER_ID = 0;
      const winnerId = result.winner === 'left' ? player1Id : AI_PLAYER_ID;
      this.matchRepo.createFreeMatch(
        player1Id,
        AI_PLAYER_ID,
        session.id,
        result.scores.left,
        result.scores.right,
        winnerId,
      );

      app.log.info({
        event: 'ai_match_persisted',
        sessionId: session.id,
        humanId: player1Id,
        scores: result.scores,
        winnerId,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      app.log.error({ event: 'ai_match_persist_error', sessionId: session.id, err: msg });
    }
  }
}
