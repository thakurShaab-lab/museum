import crypto from "node:crypto"
import { env } from "../config/env.js"
import { fail } from "../utils/response.js"

const expected = Buffer.from(env.ADMIN_API_SECRET, "utf8")

export const validateApiKey = (req, res, next) => {
  const provided = req.headers["x-api-key"]
  if (typeof provided !== "string" || provided.length === 0) {
    return fail(res, 403, "Forbidden", "E_API_KEY_MISSING")
  }
  const providedBuf = Buffer.from(provided, "utf8")
  if (
    providedBuf.length !== expected.length ||
    !crypto.timingSafeEqual(providedBuf, expected)
  ) {
    return fail(res, 403, "Forbidden", "E_API_KEY_INVALID")
  }
  return next()
}