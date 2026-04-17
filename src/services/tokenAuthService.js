import crypto from "node:crypto";
import { env } from "../config/env.js";

function tokenHash(value) {
  return crypto.createHash("sha256").update(value || "", "utf8").digest("hex");
}

function safeEqualString(left, right) {
  const a = Buffer.from(left || "", "utf8");
  const b = Buffer.from(right || "", "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function withinWindow(expiresAtIso) {
  if (!expiresAtIso) return true;
  return Date.now() <= new Date(expiresAtIso).getTime();
}

export function verifyBearerToken(providedToken) {
  if (!providedToken) return { isValid: false, tokenSlot: null };

  const hashed = tokenHash(providedToken);
  const primaryHash = tokenHash(env.bearerToken);
  const nextHash = tokenHash(env.nextBearerToken);

  if (safeEqualString(hashed, primaryHash)) {
    return { isValid: true, tokenSlot: "primary" };
  }

  if (env.nextBearerToken && safeEqualString(hashed, nextHash) && withinWindow(env.nextBearerTokenExpiresAt)) {
    return { isValid: true, tokenSlot: "next" };
  }

  return { isValid: false, tokenSlot: null };
}

export function getTokenRotationMetadata() {
  return {
    current_token_configured: Boolean(env.bearerToken),
    next_token_configured: Boolean(env.nextBearerToken),
    next_token_expires_at: env.nextBearerTokenExpiresAt || null
  };
}
