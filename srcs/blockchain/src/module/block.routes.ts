import { FastifyInstance } from "fastify";
import { blockIdSchema, blockSchema } from "./block.schema.js";
import { addRow, addRowJSON, listRows, listRowsJSON, showRow } from "./block.controller.js";

export async function blockRoutes(app: FastifyInstance) {
  app.get("/", listRows);
  app.get("/me", listRowsJSON);
  app.post("/", { schema: { body: blockSchema } }, addRow);
  app.post("/register", { schema: { body: blockSchema } }, addRowJSON);
  app.get("/row/:id", { schema: { params: blockIdSchema } }, showRow);
}
