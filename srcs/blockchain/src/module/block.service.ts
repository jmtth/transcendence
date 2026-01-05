import { getGameStorage } from '../core/GameStorage.client.js';
import { BlockTournamentInput, BlockTournamentStored } from './block.schema.js';
import { FastifyInstance } from 'fastify';
import type { AppLogger } from '../core/logger.js';
import { extractTournamentStoredEvent, computeBusinessHash } from '../core/GameStorage.utils.js';

export async function storeTournament(
  logger: AppLogger,
  tournament: BlockTournamentInput,
): Promise<BlockTournamentStored> {
  logger.info({
    event: 'blockchain_env_check',
    BLOCKCHAIN_READY: process.env.BLOCKCHAIN_READY,
    GAME_STORAGE_ADDRESS: !!process.env.GAME_STORAGE_ADDRESS,
    AVALANCHE_RPC_URL: !!process.env.AVALANCHE_RPC_URL,
  });

  const gamestorage = getGameStorage(logger);
  if (!gamestorage) {
    const error: any = new Error(
      `Error during Tournament Blockchain storage: Smart Contract don't exist`,
    );
    error.code = 'BLOCKCHAIN_NO_SMART_CONTRACT_ERR';
    throw error;
  }

  try {
    const tx = await gamestorage.storeTournament(
      tournament.id,
      tournament.player1_id,
      tournament.player2_id,
      tournament.player3_id,
      tournament.player4_id,
    );

    const receipt = await tx.wait();
    if (!receipt) {
      throw new Error('Transaction receipt missing');
    }
    const event = extractTournamentStoredEvent(receipt, gamestorage);

    const localHash = computeBusinessHash(
      event.id,
      event.p1,
      event.p2,
      event.p3,
      event.p4,
      event.timestamp,
    );
    if (localHash !== event.businessHash) {
      throw new Error('Business hash mismatch — integrity violation');
    }
    return {
      ...tournament,
      tx_hash: receipt.hash,
      snap_hash: localHash,
      block_timestamp: event.timestamp,
    };
  } catch (err: any) {
    const error: any = new Error(
      `Error during Tournament Blockchain storage: ${err?.message || err}`,
    );
    error.code = 'BLOCKCHAIN_INSERT_TOURNAMENT_ERR';
    throw error;
  }
}

// export async function listBlockchainTournaments(): Promise<map<string, string>> {
//
// }
