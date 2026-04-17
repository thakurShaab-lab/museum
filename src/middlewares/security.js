import compression from "compression";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";
import { ApiError } from "../utils/errors.js";

export function securityMiddleware(app) {
  app.disable("x-powered-by");
  app.set("trust proxy", env.trustProxy);

  const allowedOrigins = env.corsAllowedOrigins
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new ApiError(403, "CORS_ORIGIN_BLOCKED", "Origin is not allowed."));
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", env.apiKeyHeader],
      maxAge: 300
    })
  );

  app.use(
    helmet({
      contentSecurityPolicy: false
    })
  );
  app.use(hpp());
  app.use(compression());

  // app.use((req, _res, next) => {
  //   if (env.enforceHttps && req.protocol !== "https") {
  //     return next(
  //       new ApiError(400, "HTTPS_REQUIRED", "Only HTTPS requests are allowed.")
  //     );
  //   }
  //   next();
  // });

  app.use(
    rateLimit({
      windowMs: env.rateLimitWindowMs,
      max: env.rateLimitMaxRequests,
      standardHeaders: true,
      legacyHeaders: false,
      handler: (_req, _res, next) => {
        next(new ApiError(429, "RATE_LIMIT_EXCEEDED", "Rate limit exceeded."));
      }
    })
  );
}
