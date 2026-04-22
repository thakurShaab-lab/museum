import pino from "pino"
import { env } from "../config/env.js"

const isDev = env.NODE_ENV !== "production"

export const logger = pino({
  level: isDev ? "debug" : "info",
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers['x-api-key']",
      "req.headers.cookie",
      "*.password",
      "*.token",
      "*.secret",
    ],
    censor: "[REDACTED]",
  },
  ...(isDev
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:HH:MM:ss" },
        },
      }
    : {}),
})