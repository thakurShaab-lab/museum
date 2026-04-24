import express from "express"
import helmet from "helmet"
import cors from "cors"
import compression from "compression"
import pinoHttp from "pino-http"
import crypto from "node:crypto"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"

import { env } from "./config/env.js"
import { logger } from "./utils/logger.js"
import { limiter } from "./middleware/rateLimit.middleware.js"
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js"
import router from "./routes/index.js"

const app = express()

app.disable("x-powered-by")
app.set("trust proxy", 1)
app.set("etag", "strong")

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
    referrerPolicy: { policy: "no-referrer" },
  }),
)

const allowedOrigins = env.CORS_ORIGINS.split(",")
  .map((s) => s.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: allowedOrigins.length === 0 ? false : allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "X-Api-Key", "Content-Type"],
    maxAge: 600,
  }),
)

app.use(compression())
app.use(express.json({ limit: "100kb" }))
app.use(express.urlencoded({ extended: false, limit: "100kb" }))

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.use('/uploaded_files', express.static(path.join(__dirname, "anubhav")))


app.use((req, _res, next) => {
  req.id = req.headers["x-request-id"] || crypto.randomUUID()
  next()
})

app.use(
  pinoHttp({
    logger,
    genReqId: (req) => req.id,
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return "error"
      if (res.statusCode >= 400) return "warn"
      return "info"
    },
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: req.url?.split("?")[0] }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  }),
)

app.use(limiter)

app.use("/api", router)

app.use(notFoundHandler)
app.use(errorHandler)

export default app