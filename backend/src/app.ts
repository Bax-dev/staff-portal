import cors from 'cors'
import express from 'express'
import { prisma } from './config/database.js'
import { redis } from './config/redis.js'
import { auditLogger } from './middleware/audit-logger.js'
import { errorHandler } from './middleware/error-handler.js'
import { optionalAuth } from './middleware/optional-auth.js'
import { apiRouter } from './routes/index.js'
import { asyncHandler } from './utils/async-handler.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: '*',
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  )
  app.use(express.json({ limit: '2mb' }))
  app.use(asyncHandler(optionalAuth))
  app.use(auditLogger)

  app.get('/health', async (_req, res) => {
    const checks = await Promise.allSettled([
      prisma.$queryRaw`SELECT 1`,
      redis.ping(),
    ])

    const [database, cache] = checks.map((c) => c.status === 'fulfilled')
    const ok = database && cache

    res.status(ok ? 200 : 503).json({ ok, database, cache })
  })

  app.use('/api', apiRouter)
  app.use(errorHandler)

  return app
}
