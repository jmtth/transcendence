// Params for /row/:id
export const blockIdSchema = {
  type: "object",
  properties: {
    tx_id: { type: "number" }
  },
  required: ["tx_id"]
} as const;

// Body for POST /
export const blockSchema = {
  type: "object",
  properties: {
    tx_id: { type: "number" },
    tx_hash: { type: "string" },
    date_confirmed: { type: "string" },
    tour_id: { type: "number" },
    player1_id: { type: "number" },
    player2_id: { type: "number" },
    player3_id: { type: "number" },
    player4_id: { type: "number" }
  },
  required: ["tx_id", "tour_id", "player1_id", "player2_id", "player3_id", "player4_id"]
} as const;

export interface Blockchain {
  tx_id: number;
  tx_hash?: string;
  date_confirmed?: string;
  tour_id: number;
  player1_id: number;
  player2_id: number;
  player3_id: number;
  player4_id: number;
}
