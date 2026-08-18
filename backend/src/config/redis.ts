import Redis from 'ioredis'
import { env } from './env.js'

export const redis = new Redis(env.redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  connectTimeout: 5000,
})

export async function connectRedis() {
  if (redis.status === 'wait') {
    await redis.connect()
  }
}

export async function disconnectRedis() {
  redis.disconnect()
}
