import express from "express"
import path from "node:path"
import visitorRoutes from "./routes/visitorRoutes.js"
import { env } from "./config/env.js"
import { auditLogger } from "./middlewares/auditLogger.js"
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js"
import { securityMiddleware } from "./middlewares/security.js"

export function createApp() {
  const app = express()
  securityMiddleware(app)
  app.use(express.json({ limit: "1mb" }))

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" })
  })

  app.use(auditLogger)

  const uploadsPath = path.resolve(process.cwd(), "uploads")
  app.use(env.localMediaBasePath, express.static(uploadsPath))

  app.use("/api/v1", visitorRoutes)
  app.use(notFoundHandler)
  app.use(errorHandler)
  return app
}
