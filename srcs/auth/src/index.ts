import fastify, { FastifyReply, FastifyRequest } from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import { authRoutes } from './routes/auth.routes.js'
import { initAdminUser, initInviteUser } from './utils/init-users.js'
import { loggerConfig } from './config/logger.config.js'
import { AUTH_CONFIG, ERROR_CODES, EVENTS, REASONS } from './utils/constants.js'
import { AppBaseError, ServiceError } from './types/errors.js'

const env = (globalThis as any).process?.env || {}

// Validation du JWT_SECRET au démarrage (CRITIQUE)
const JWT_SECRET = env.JWT_SECRET
if (!JWT_SECRET || JWT_SECRET === 'supersecretkey') {
  console.error('❌ CRITICAL: JWT_SECRET must be defined and cannot be the default value')
  console.error('   Set a secure JWT_SECRET in environment variables')
  ;(globalThis as any).process?.exit?.(1)
  throw new Error('JWT_SECRET not configured')
}

const app = fastify({
  logger: loggerConfig,
  disableRequestLogging: false,
})

export const logger = app.log

/**
 * @abstract add userId and userName to logger
 */
app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.headers['x-user-id'];
    const userName = request.headers['x-user-name'];
    const bindings: Record<string, any> = {};
    if (userId) {
        bindings.userId = Number(userId) || userId;
    }
    if (userName) {
        bindings.username = userName;
    }
    if (Object.keys(bindings).length > 0) {
        request.log = request.log.child(bindings);
    }
});

app.setErrorHandler((error: AppBaseError, req, _reply) => {
  req.log.error({
    err: error, 
    event: error?.context?.event || EVENTS.CRITICAL.BUG,
    reason: error?.context?.reason || REASONS.UNKNOWN,
  }, 'Error');
});

// Register shared plugins once
app.register(fastifyCookie)
app.register(fastifyJwt, { secret: env.JWT_SECRET || 'supersecretkey' })

app.register(authRoutes, { prefix: '/' });

(async () => {
  try {
    const address = await app.listen({ host: '0.0.0.0', port: 3001 })
    console.log(`Auth service listening at ${address}`)

    await initAdminUser()
    await initInviteUser()

    logger.info({
      event: 'service_ready',
      message: 'Auth service is ready',
    })
  } catch (error: any) {
    logger.error({ event: 'service_startup_failed', err: error?.message || error })
    console.error(error)
    ;(globalThis as any).process?.exit?.(1)
  }
})()

