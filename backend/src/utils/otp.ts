import { createHash, randomInt, timingSafeEqual } from 'node:crypto'
import { env } from '../config/env.js'

export function generateOtp() {
  const max = 10 ** env.otpLength
  return String(randomInt(0, max)).padStart(env.otpLength, '0')
}

export function hashOtp(code: string, destination: string) {
  return createHash('sha256').update(`${code}:${destination}:${env.otpPepper}`).digest('hex')
}

export function otpMatches(code: string, destination: string, storedHash: string) {
  const incoming = Buffer.from(hashOtp(code, destination))
  const stored = Buffer.from(storedHash)
  return incoming.length === stored.length && timingSafeEqual(incoming, stored)
}
