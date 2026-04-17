import "dotenv/config";

function toBool(value, defaultValue = false) {
  if (value === undefined) return defaultValue;
  return value === "true";
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "anubhava_mantapa",
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 20)
  },
  apiKeyHeader: (process.env.API_KEY_HEADER || "x-api-key").toLowerCase(),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 1000),
  rateLimitMaxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS || 100),
  imageDeliveryMode: process.env.IMAGE_DELIVERY_MODE || "redirect",
  localMediaBasePath: process.env.LOCAL_MEDIA_BASE_PATH || "/media",
  enforceHttps: toBool(process.env.HTTPS_ENFORCED, true),
  trustProxy: toBool(process.env.TRUST_PROXY, false),
  authMode: process.env.AUTH_MODE || "api-key",
  bearerToken: process.env.BEARER_TOKEN || "",
  nextBearerToken: process.env.NEXT_BEARER_TOKEN || "",
  nextBearerTokenExpiresAt: process.env.NEXT_BEARER_TOKEN_EXPIRES_AT || "",
  bearerTokenPermissions: process.env.BEARER_TOKEN_PERMISSIONS || "read:visitors,read:images,register:visitors",
  aadhaarVerifyUrl: process.env.AADHAAR_VERIFY_URL || "",
  aadhaarApiKey: process.env.AADHAAR_API_KEY || "",
  aadhaarApiKeyHeader: (process.env.AADHAAR_API_KEY_HEADER || "x-api-key").toLowerCase(),
  corsAllowedOrigins: process.env.CORS_ALLOWED_ORIGINS || "",
  enableAuditLogs: toBool(process.env.ENABLE_AUDIT_LOGS, true)
};

