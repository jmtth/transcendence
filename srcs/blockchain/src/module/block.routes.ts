import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { blockIdSchema, blockSchema } from './block.schema.js'
import { addTournament, addTournamentForm, getTournamentView, listTournament, listTournamentView } from './block.controller.js'

export async function registerRoutes(app: FastifyInstance) {
  app.register(healthRoutes, { prefix: '/health' })
  app.register(blockRoutes)
}

async function blockRoutes(app: FastifyInstance) {
  app.get("/blockchain", listTournamentView);
  app.get("/list", listTournament);
  app.post("/", { schema: { body: blockSchema } }, addTournamentForm);
  app.post("/register", { schema: { body: blockSchema } }, addTournament);
  app.get("/row/:tx_id", { schema: { params: blockIdSchema } }, getTournamentView);
  app.get("/cwd", chekCwd);
}

async function healthRoutes(app: FastifyInstance) {
  app.get(
    '/',
    async function (this: FastifyInstance, _request: FastifyRequest, reply: FastifyReply) {
      return reply.code(200).send({ status: 'healthy', hotReload: 'ok fdac!' })
    },
  )
}

async function chekCwd() {
  return {
    cwd: process.cwd(),
  };
}

