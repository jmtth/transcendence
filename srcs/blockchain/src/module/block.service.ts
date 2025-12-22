import { getGameStorage } from "../core/GameStorage.client.js";
import { BlockTournamentInput, BlockTournamentStored } from "./block.schema.js";

export async function storeTournament(tournament: BlockTournamentInput): Promise<BlockTournamentStored>{
  const gamestorage = getGameStorage();
  if (!gamestorage) {
    const error: any = new Error(`Error during Tournament Blockchain storage: Smart Contract don't exist`);
    error.code = 'BLOCKCHAIN_NO_SMART_CONTRACT_ERR';
    throw error;
  }

  try {
    const tx = await gamestorage.storeTournament(
      tournament.tx_id,
      tournament.player1_id,
      tournament.player2_id,
      tournament.player3_id,
      tournament.player4_id
    );

    const receipt = await tx.wait();
    return {
      ...tournament,
      tx_hash: receipt.hash,
      date_confirmed: new Date().toISOString(),
    };
  } catch (err: any) {
    const error: any = new Error(`Error during Tournament Blockchain storage: ${err?.message || err}`);
    error.code = 'BLOCKCHAIN_INSERT_TOURNAMENT_ERR';
    throw error;
  }
}



