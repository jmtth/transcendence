/* ===========================
 * Tournaments list DB
 * =========================== */
export interface TournamentDTO {
  id: number;
  username: string;
  status: 'PENDING' | 'STARTED' | 'FINISHED';
  player_count: number;
}

export interface PlayerDTO {
  player_id: number;
  username: string;
  avatar: string | null;
  slot: 1 | 2 | 3 | 4;
}
