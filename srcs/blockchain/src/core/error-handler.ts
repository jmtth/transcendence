import { RecordNotFoundError } from './error.js'
import { FastifyInstance } from 'fastify'

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _req, res) => {
    if (error instanceof RecordNotFoundError) {
      res.statusCode = 404
      return res.view('404', { error: error.message })
    }
    // if (error.validation) {
    // return reply.status(400).send({
    //   error: "Validation error",
    //   details: error.validation,
    //   })
    // }
    console.error(error)
    res.statusCode = 500
    const err = error as Error
    return {
      error: err.message,
    }
  })
}
