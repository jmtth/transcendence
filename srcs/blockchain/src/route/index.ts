import { FastifyInstance } from "fastify";
import { blockRoutes } from "../module/block.routes.js";
import healthRoutes from "./health.route.js";

export async function registerRoutes(app: FastifyInstance) {
  app.register(healthRoutes, { prefix: "/health" });
  // app.register(blockRoutes, { prefix: "/block" });
  app.register(blockRoutes);
}
