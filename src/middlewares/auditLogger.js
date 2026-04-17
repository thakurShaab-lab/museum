import { env } from "../config/env.js";

function maskSensitiveHeaders(headers) {
  return {
    ...headers,
    authorization: headers.authorization ? "***" : undefined,
    "x-api-key": headers["x-api-key"] ? "***" : undefined
  };
}

export function auditLogger(req, res, next) {
  if (!env.enableAuditLogs) {
    return next();
  }

  const start = Date.now();
  res.on("finish", () => {
    const payload = {
      timestamp: new Date().toISOString(),
      method: req.method,
      path: req.originalUrl,
      status_code: res.statusCode,
      duration_ms: Date.now() - start,
      ip: req.ip,
      user_agent: req.get("user-agent") || "",
      auth_context: req.apiKey?.label || "anonymous",
      headers: maskSensitiveHeaders(req.headers)
    };

    // Structured logs are easier to ingest in SIEM pipelines.
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(payload));
  });

  next();
}
