import { FastifyInstance } from "fastify";

export async function umRoutes(app: FastifyInstance) {
    app.get("/", async function (this: FastifyInstance) {
        return { message: "User management service is running" };
    });

    app.get("/health", async function (this: FastifyInstance) {
        return { message: "Service healthy"};
    });

    // app.get("/users/:id", getUserbyId);
}