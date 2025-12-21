import { createProfile, getProfileByUsername } from '../controllers/um.controller.js'
import { getFriendsByUserId, addFriend } from '../controllers/friends.controller.js'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { updateFriend } from '../controllers/friends.controller.js'

export async function umRoutes(app: FastifyInstance) {
  app.get('/', async function (this: FastifyInstance) {
    return { message: 'User management service is running' }
  })

  app.get('/health', async function (this: FastifyInstance, _request: FastifyRequest, reply: FastifyReply) {
    return reply.code(200).send({ status: "healthy new" })
  })

  app.get('/users/:username', getProfileByUsername);
  app.get('/users/friends/', getFriendsByUserId);
  app.post('/users/friends', addFriend);
  app.put('/users/friends/:targetId', updateFriend);

  app.post('/users', createProfile);
}
