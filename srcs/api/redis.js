// plugins/redis.js
import fp from 'fastify-plugin';
import Redis from 'ioredis';

export default fp(async (fastify, opts) => {
  // Create Redis clients
  const redisPublisher = new Redis({
    host: process.env.REDIS_HOST || 'redis-broker',
    port: process.env.REDIS_PORT || 6379,
  });

  const redisSubscriber = new Redis({
    host: process.env.REDIS_HOST || 'redis-broker',
    port: process.env.REDIS_PORT || 6379,
  });

  const redisStats = { messageCount: 0, lastMessage: null };

  // Subscribe to messages to update stats
  redisSubscriber.on('message', (channel, message) => {
    redisStats.messageCount++;
    redisStats.lastMessage = { channel, message };
  });

  // Log connection events
  redisPublisher.on('ready', () => fastify.log.info('Redis publisher ready'));
  redisSubscriber.on('ready', () => fastify.log.info('Redis subscriber ready'));

  redisPublisher.on('error', (err) => fastify.log.error(err));
  redisSubscriber.on('error', (err) => fastify.log.error(err));

  // 🧠 Decorate the Fastify instance
  fastify.decorate('redisPublisher', redisPublisher);
  fastify.decorate('redisSubscriber', redisSubscriber);
  fastify.decorate('redisStats', redisStats);
});
