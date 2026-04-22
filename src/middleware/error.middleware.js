import { logger } from "../utils/logger.js"

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  const status = err.status || err.statusCode || 500
  const isProd = process.env.NODE_ENV === "production"

  logger.error(
    {
      err: { message: err.message, name: err.name, stack: err.stack },
      reqId: req.id,
      path: req.path,
      method: req.method,
    },
    "Request error",
  )

  res.status(status).json({
    success: false,
    error: {
      code: err.code || `E${status}`,
      message: status >= 500 && isProd ? "Internal server error" : err.message,
    },
  })
}

export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "E_NOT_FOUND", message: `Route ${req.method} ${req.path} not found` },
  })
}