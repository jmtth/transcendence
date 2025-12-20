import { FastifyReply, FastifyRequest } from 'fastify'
import { friendsService } from '../services/friends.service.js'
import { ValidationSchemas } from '../schemas/schemas.js'
import z from 'zod'
import { API_ERRORS, LOG_EVENTS } from '../utils/messages.js'
import { mapProfileToFriendDTO } from '../utils/mappers.js'

function handleInvalidRequest<T>(
  req: FastifyRequest,
  reply: FastifyReply,
  validation: z.ZodSafeParseError<T>
) {
  req.log.warn({ event: LOG_EVENTS.INVALID_REQUEST, request: req })
  return reply.status(400).send({
    error: API_ERRORS.USER.INVALID_FORMAT,
    details: z.treeifyError(validation.error),
  })
}

// GET /users/friends/
export async function getFriendsByUserId(
  req: FastifyRequest,
  reply: FastifyReply
) {
  // TODO: Get current user ID from auth middleware/token
  // For now, assuming it comes from query or we get it from context
  const idUser = req.query?.idUser as string || '1' // Placeholder
  const userId = parseInt(idUser, 10)
  
  req.log.info({ event: LOG_EVENTS.GET_FRIENDS, userId })

  const validation = ValidationSchemas['FriendGet'].safeParse({ idUser: userId })
  if (!validation.success) {
    return handleInvalidRequest(req, reply, validation)
  }

  try {
    const friends = await friendsService.getFriendsByUserId(userId)
    const friendDTOs = friends.map(mapProfileToFriendDTO)
    return reply.status(200).send(friendDTOs)
  } catch (error) {
    req.log.error(error)
    return reply.status(500).send({ message: API_ERRORS.UNKNOWN })
  }
}

// POST /users/friends
export async function addFriend(
  req: FastifyRequest<{
    Body: { targetId: number }
  }>,
  reply: FastifyReply
) {
  const { targetId } = req.body
  const userId = req.user?.id // Get from auth header/middleware
  
  if (!userId) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
  
  req.log.info({ event: LOG_EVENTS.ADD_FRIEND, userId, targetId })

  const validation = ValidationSchemas['FriendAdd'].safeParse({
    targetId,
  })
  if (!validation.success) {
    return handleInvalidRequest(req, reply, validation)
  }

  try {
    const friendship = await friendsService.addFriend(userId, targetId)
    return reply.status(201).send({
      relationId: friendship.id,
      user1Id: friendship.user1Id,
      user2Id: friendship.user2Id,
    })
  } catch (error: unknown) {
    req.log.error(error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    
    if (errorMsg.includes('already exist')) {
      return reply.status(409).send({ message: API_ERRORS.USER.FRIEND.ALREADY_FRIENDS })
    }
    if (errorMsg.includes('Friend limit reached')) {
      return reply.status(400).send({ message: 'Maximum 10 friends allowed' })
    }
    return reply.status(500).send({ message: API_ERRORS.USER.FRIEND.ADD_FAILED })
  }
}

// DELETE /users/friends/:targetId
export async function removeFriend(
  req: FastifyRequest<{ Params: { targetId: string } }>,
  reply: FastifyReply
) {
  const targetId = parseInt(req.params.targetId, 10)
  const userId = (req as any).user?.id
  
  if (!userId) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
  
  req.log.info({ event: LOG_EVENTS.REMOVE_FRIEND, userId, targetId })

  const validation = ValidationSchemas['FriendDelete'].safeParse({ targetId })
  if (!validation.success) {
    return handleInvalidRequest(req, reply, validation)
  }

  try {
    const result = await friendsService.removeFriend(userId, targetId)
    if (!result) {
      return reply.status(404).send({ message: API_ERRORS.USER.FRIEND.NOT_FRIENDS })
    }
    return reply.status(200).send({ message: 'Friend removed successfully' })
  } catch (error) {
    req.log.error(error)
    return reply.status(500).send({ message: API_ERRORS.USER.FRIEND.DELETE_FAILED })
  }
}

export async function updateFriend(
  req: FastifyRequest<{ Params: {targetId: string, userId: string}}>,
  reply: FastifyReply
) {
  //const targetId = parseInt(req.params.targetId, 10)
  const userId = (req as any).user?.id
  const validation = ValidationSchemas['FriendUpdate'].safeParse({userId})
  if (!validation.success) {
    return handleInvalidRequest(req, reply, validation)
  }
  try {
    const result = await friendsService.upadeFriend(userId)
    if (!result)
      return reply.status(404).send({message: API_ERRORS.USER.FRIEND.NOT_FRIENDS})
    return reply.status(200).send({message: 'Nickname changed'})
    
  }
  catch (error) {
    req.log.error(error)
    return reply.status(500).send({message: API_ERRORS.USER.INVALID_FORMAT})
  }
}