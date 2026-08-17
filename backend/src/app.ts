import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'
import { apiRouter } from './routes/index.js'

export function createApp() {
  const app = express()

  app.use(cors({ origin: env.corsOrigin }))
  app.use(express.json({ limit: '2mb' }))

  app.get('/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.use('/api', apiRouter)
  app.use(errorHandler)

  return app
}
