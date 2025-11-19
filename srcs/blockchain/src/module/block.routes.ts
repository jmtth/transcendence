import { FastifyInstance } from "fastify";
import { rowIdSchema, bodySchema } from "./block.schema.js";
import { addRow, listRows, showRow } from "./block.controller.js";

export async function blockRoutes(app: FastifyInstance) {
  app.get("/", listRows);
  app.post("/", { schema: { body: bodySchema } }, addRow);
  app.get("/row/:id", { schema: { params: rowIdSchema } }, showRow);
}
