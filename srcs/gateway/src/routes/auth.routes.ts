import { FastifyInstance } from "fastify";
import {
  authRootHandler,
  authHealthHandler,
  meHandler,
  loginHandler,
  registerHandler,
  logoutHandler
} from "../controllers/auth.controller.js";

export async function authRoutes(app: FastifyInstance) {
  app.get("/", authRootHandler);
  app.get("/health", authHealthHandler);
  app.get("/me", meHandler);
  app.post("/login", loginHandler);
  app.post("/register", registerHandler);
  app.post("/logout", logoutHandler);
}
