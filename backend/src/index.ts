import { createApp } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { env } from './config/env.js'
import { connectRedis, disconnectRedis } from './config/redis.js'

const app = createApp()

async function start() {
  await connectDatabase()
  try {
    await connectRedis()
  } catch (error: unknown) {
    console.error('Redis unavailable; continuing without cache', error)
  }

  app.listen(env.port, '0.0.0.0', () => {
    console.info(`Staff portal API listening on 0.0.0.0:${env.port}`)
  })
}

async function shutdown() {
  await disconnectDatabase()
  await disconnectRedis()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

start().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
