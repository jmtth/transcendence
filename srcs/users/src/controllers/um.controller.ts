import { FastifyReply, FastifyRequest } from 'fastify'
import * as umService from '../services/um.service.js'
import * as mappers from '../utils/mappers.js';
// import z from 'zod'
import { API_ERRORS, LOG_EVENTS } from '../utils/messages.js'
import { ProfileCreateInDTO } from '@transcendence/core'

// function handleInvalidRequest<T>(
//   req: FastifyRequest,
//   reply: FastifyReply,
//   validation: z.ZodSafeParseError<T>
// ) {
//   req.log.warn({ event: LOG_EVENTS.INVALID_REQUEST, request: req })
//   return reply.status(400).send({
//     error: API_ERRORS.USER.INVALID_FORMAT,
//     details: z.treeifyError(validation.error),
//   })
// }

export async function getProfileByUsername(
  req: FastifyRequest<{ Params: { username: string } }>,
  reply: FastifyReply
) {
  const { username } = req.params
  req.log.info({ event: LOG_EVENTS.GET_PROFILE_BY_USERNAME, username })

  // const validation = Schemas.FieldUsername.safeParse({ username })
  // if (!validation.success) {
  //   return handleInvalidRequest(req, reply, validation)
  // }

  const profileDTO = await umService.findByUsername(username);
  if (!profileDTO) {
    return reply.status(404).send({ message: API_ERRORS.USER.NOT_FOUND })
  }
  return reply.status(200).send(profileDTO);
}

export async function createProfile(
  req: FastifyRequest,
  reply: FastifyReply
) {
  req.log.info({ event: LOG_EVENTS.CREATE_PROFILE, payload: req.body })

  try {
    const profile = await umService.createProfile(req.body as ProfileCreateInDTO)
    const profileDTO = mappers.mapUserProfileToDTO(profile);
    return reply.status(201).send(profileDTO);
  } catch (error) {
    req.log.error(error)
    return reply
      .status(409)
      .send({
        message: API_ERRORS.USER.CREATE_FAILED,
      })
  }
}
