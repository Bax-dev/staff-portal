import { randomBytes } from 'node:crypto'
import { env } from '../config/env.js'
import { redis } from '../config/redis.js'
import { AppError } from '../utils/errors.js'

function resetKey(token: string) {
  return `password-reset:${token}`
}

export const passwordResetService = {
  async issue(userId: string) {
    const token = randomBytes(32).toString('hex')
    await redis.set(resetKey(token), userId, 'EX', env.passwordResetTtlSeconds)
    return {
      token,
      expiresInSeconds: env.passwordResetTtlSeconds,
    }
  },

  async consume(token: string) {
    const key = resetKey(token)
    const userId = await redis.get(key)
    if (!userId) {
      throw new AppError(400, 'This reset link is invalid or has expired.')
    }
    await redis.del(key)
    return userId
  },
}
