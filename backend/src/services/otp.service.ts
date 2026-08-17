import { env } from '../config/env.js'
import { redis } from '../config/redis.js'
import { AppError } from '../utils/errors.js'
import { generateOtp, hashOtp, otpMatches } from '../utils/otp.js'

function otpKey(destination: string) {
  return `otp:${destination.toLowerCase()}`
}

function attemptKey(destination: string) {
  return `otp:attempts:${destination.toLowerCase()}`
}

export const otpService = {
  async issue(destination: string) {
    const code = generateOtp()
    const key = otpKey(destination)

    await redis.set(key, hashOtp(code, destination), 'EX', env.otpTtlSeconds)
    await redis.del(attemptKey(destination))

    return {
      code,
      expiresInSeconds: env.otpTtlSeconds,
    }
  },

  async verify(destination: string, code: string) {
    const key = otpKey(destination)
    const storedHash = await redis.get(key)

    if (!storedHash) {
      throw new AppError(400, 'OTP has expired or was not requested')
    }

    const attempts = Number((await redis.incr(attemptKey(destination))) || 1)
    await redis.expire(attemptKey(destination), env.otpTtlSeconds)

    if (attempts > 5) {
      await redis.del(key)
      throw new AppError(429, 'Too many OTP attempts. Request a new code.')
    }

    if (!otpMatches(code, destination, storedHash)) {
      throw new AppError(400, 'Invalid OTP')
    }

    await redis.del(key)
    await redis.del(attemptKey(destination))
  },
}
