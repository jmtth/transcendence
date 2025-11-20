import fastify from "fastify";
import { umRoutes as userRoutes } from "routes/um.routes.js";
import { env } from "config.js";

const app = fastify({ logger: env.LOG_ENABLED });

export const logger = app.log;

app.register(userRoutes, { prefix: '/'});

app.listen({ host: '0.0.0.0', port: env.PORT }, (err: Error | null, address: string) => {
    if (err) {
        app.log.error({ message: err.message });
        process.exit(1);
    }
    app.log.info({ message: `User Management service listening at ${address}`});
});