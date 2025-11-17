import { randomUUID } from 'crypto';

// Helper function to check if Redis is ready
function isRedisReady(redisClient) {
  return redisClient && redisClient.status === 'ready';
}

// routes.js
export default async function routes(fastify) {
  const { redisPublisher, redisSubscriber, redisStats } = fastify;

  // API root endpoint
  fastify.get('/api', async (request, reply) => {
    return {
      message: 'Transcendence API Gateway',
      version: '1.0.0',
      endpoints: {
        health: '/api/health',
        redis: '/api/redis',
        users: '/api/users',
        games: '/api/game',
      },
      redis: {
        publisher: redisPublisher.status,
        subscriber: redisSubscriber.status,
      },
    };
  });

	 // Health check of API
	 fastify.get('/api/health', async () => ({
	   status: 'healthy',
	   service: 'api-gateway',
	   redis: {
	     publisher: redisPublisher.status,
	     subscriber: redisSubscriber.status,
	     connected: isRedisReady(redisPublisher) && isRedisReady(redisSubscriber),
	   },
	   timestamp: new Date().toISOString(),
	 }));

 // Make a PING test -> seding ping -> reveive pong
  fastify.get('/api/redis', async (req, reply) => {
    try {
      // Check if Redis is connected
      if (!isRedisReady(redisPublisher)) {
        return reply.code(503).send({
          status: 'unavailable',
          service: 'redis',
          error: 'Redis not connected',
          publisherStatus: redisPublisher.status,
          subscriberStatus: redisSubscriber.status,
          timestamp: new Date().toISOString(),
        });
      }

      const pong = await redisPublisher.ping();
      await redisPublisher.publish('health_test', `Test ${Date.now()}`);

      return {
        status: 'healthy',
        service: 'redis',
        ping: pong,
        publisher: 'connected',
        subscriber: redisSubscriber.status,
        lastMessage: redisStats.lastMessage,
        messagesReceived: redisStats.messageCount,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      fastify.log.error(err);
      reply.code(503).send({
        status: 'unhealthy',
        service: 'redis',
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  });


  fastify.get('/api/users', async (request, reply) => {
    // Check if Redis is connected
    if (!isRedisReady(redisPublisher) || !isRedisReady(redisSubscriber)) {
      return reply.code(503).send({
        status: 'error',
        message: 'Redis not available',
        service: 'user-service',
      });
    }

    const correlationId = randomUUID();
    const replyChannel = `user_response:${correlationId}`;

    try {
      await redisSubscriber.subscribe(replyChannel);

      const responsePromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout waiting for user-service'));
        }, 5000);

        const messageHandler = (channel, message) => {
          if (channel === replyChannel) {
            clearTimeout(timeout);
            redisSubscriber.removeListener('message', messageHandler);
            resolve(JSON.parse(message));
            redisSubscriber.unsubscribe(replyChannel);
          }
        };

        redisSubscriber.on('message', messageHandler);
      });

      const payload = {
        action: 'get_users',
        correlationId,
        replyChannel,
      };

      await redisPublisher.publish('user_requests', JSON.stringify(payload));

      const result = await responsePromise;
      reply.send({ status: 'success', data: result });
    } catch (err) {
      reply.code(500).send({ status: 'error', message: err.message });
    }
  });

// fastify.all('/api/game*', async (req, reply) => {
//   try {
//     // Extract the path after /api/game
//     const gamePath = req.url.replace(/^\/api\/game/, '') || '/';
//     const url = `http://game-service:3003${gamePath}`;
//
//     fastify.log.info(`Proxying ${req.method} request to: ${url}`);
//
//     // Prepare fetch options
//     const fetchOptions = {
//       method: req.method,
//       headers: {
//         'Content-Type': req.headers['content-type'] || 'application/json',
//       },
//     };
//
//     // Add body for non-GET/HEAD requests
//     if (!['GET', 'HEAD'].includes(req.method) && req.body) {
//       fetchOptions.body = typeof req.body === 'string' 
//         ? req.body 
//         : JSON.stringify(req.body);
//     }
//
//     const res = await fetch(url, fetchOptions);
//     const body = await res.text();
//
//     // Forward the response
//     reply
//       .code(res.status)
//       .header('Content-Type', res.headers.get('content-type') || 'application/json')
//       .send(body);
//
//   } catch (err) {
//     fastify.log.error('Game service proxy error:', err);
//     reply.code(503).send({
//       status: 'error',
//       message: 'Failed to connect to game service',
//       error: err.message,
//     });
//   }
// });

	//
	//
	// fastify.get('/api/game', async (req, reply) => {
	//   const url = 'http://game-service:3003' + req.url.replace('/api/game', '');
	//   const res = await fetch(url, {
	// 	method: req.method,
	// 	headers: req.headers,
	// 	body: ['GET','HEAD'].includes(req.method) ? undefined : await req.raw.text()
	//   });
	//
	//   const body = await res.text();
	//   reply.code(res.status).headers(res.headers.raw()).send(body);
	// });
}
