import { cleanEnv, num, str } from "envalid";
import fastify from "fastify";
import { umRoutes as userRoutes } from "routes/um.routes.js";

const env = cleanEnv(process.env, {
  LOG_LEVEL: str({choices: ['debug', 'info', 'warn', 'error'], default: 'info'}),
  PORT: num( {default: 3003} ),
  NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'] }),
});

const app = fastify({ logger: env.LOG_LEVEL });

app.register(userRoutes, { prefix: '/'});

app.listen({ host: '0.0.0.0', port: env.PORT }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`User Management service listening at ${address}`);
});