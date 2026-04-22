import app from "./app.js"
import { env } from "./config/env.js"
import { logger } from "./utils/logger.js"
import { pingDatabase, closeDatabase } from "./config/db.js"

const port = env.PORT

async function start() {
  try {
    await pingDatabase()
  } catch (err) {
    logger.error({ err: { message: err.message } }, "Database connection failed")
    process.exit(1)
  }

  const server = app.listen(port, "0.0.0.0", () => {
    logger.info({ port, env: env.NODE_ENV }, "API server listening")
  })

  server.headersTimeout = 65_000
  server.requestTimeout = 30_000
  server.keepAliveTimeout = 60_000

  const shutdown = (signal) => {
    logger.info({ signal }, "Shutting down")
    server.close(async () => {
      await closeDatabase().catch(() => {})
      process.exit(0)
    })
    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"))
  process.on("SIGINT", () => shutdown("SIGINT"))
  process.on("unhandledRejection", (err) => {
    logger.error({ err }, "Unhandled rejection")
  })
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "Uncaught exception")
    shutdown("uncaughtException")
  })
}

start()