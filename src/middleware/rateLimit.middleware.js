import rateLimit from "express-rate-limit"
import { env } from "../config/env.js"

export const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const auth = req.headers.authorization
    if (auth && auth.startsWith("Bearer ")) {
      return `t:${auth.slice(7, 39)}`
    }
    return `ip:${req.ip || "unknown"}`
  },
  message: {
    success: false,
    error: { code: "E_RATE_LIMIT", message: "Too many requests" },
  },
})