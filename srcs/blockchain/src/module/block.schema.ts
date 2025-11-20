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
    match_id: { type: "number" },
    player1_id: { type: "number" },
    player2_id: { type: "number" },
    player1_score: { type: "number" },
    player2_score: { type: "number" },
    winner_id: { type: "number" }
  },
  required: ["tx_id", "match_id", "player1_id", "player2_id", "player1_score", "player2_score", "winner_id"]
} as const;
