import Fastify from "fastify";
import { registerRoutes } from "./route/index.js";
import { registerPlugins } from "./plugins/index.js";
import { registerErrorHandler } from "./core/error-handler.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  await registerRoutes(app);
  await registerPlugins(app);
  // registerErrorHandler(app);

  return app;
}
