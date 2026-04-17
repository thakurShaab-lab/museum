import crypto from "node:crypto";
import { env } from "../config/env.js";
import { findActiveApiKeyByHash } from "../models/apiKeyModel.js";
import { hashApiKey } from "../services/cryptoService.js";
import { verifyBearerToken } from "../services/tokenAuthService.js";
import { ApiError } from "../utils/errors.js";

function safeEqualHex(a, b) {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function apiKeyAuth(requiredPermission) {
  return async (req, _res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (env.authMode === "token" || env.authMode === "both") {
        if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
          const provided = authHeader.slice(7).trim();
          const tokenResult = verifyBearerToken(provided);
          if (!tokenResult.isValid) {
            return next(new ApiError(401, "INVALID_TOKEN", "Invalid bearer token."));
          }

          const permissions = env.bearerTokenPermissions.split(",").map((item) => item.trim());
          if (!permissions.includes(requiredPermission)) {
            return next(new ApiError(403, "FORBIDDEN", "Token is valid but lacks permission."));
          }

          req.apiKey = {
            id: `token-auth-${tokenResult.tokenSlot}`,
            label: `bearer-token-${tokenResult.tokenSlot}`,
            permissions
          };
          return next();
        }
      }

      if (env.authMode === "token") {
        return next(new ApiError(401, "MISSING_TOKEN", "Missing bearer token."));
      }

      const rawKey = req.headers[env.apiKeyHeader];
      if (!rawKey || typeof rawKey !== "string") {
        return next(new ApiError(401, "MISSING_API_KEY", "Missing API key."));
      }

      const keyHash = hashApiKey(rawKey);
      const keyRecord = await findActiveApiKeyByHash(keyHash);
      if (!keyRecord || !safeEqualHex(keyRecord.keyHash, keyHash)) {
        return next(new ApiError(401, "INVALID_API_KEY", "Invalid API key."));
      }

      const permissions = keyRecord.permissions.split(",").map((item) => item.trim());
      if (!permissions.includes(requiredPermission)) {
        return next(
          new ApiError(403, "FORBIDDEN", "API key is valid but lacks permission.")
        );
      }

      req.apiKey = {
        id: keyRecord.id,
        label: keyRecord.label,
        permissions
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
