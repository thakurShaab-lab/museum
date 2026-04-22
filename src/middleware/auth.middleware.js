import { verifyToken } from "../utils/jwt.js"
import { fail } from "../utils/response.js"

export const authenticate = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith("Bearer ")) {
    return fail(res, 401, "Missing or invalid Authorization header", "E_AUTH_MISSING")
  }
  const token = header.slice(7).trim()
  if (!token) {
    return fail(res, 401, "Missing token", "E_AUTH_MISSING")
  }
  try {
    const decoded = verifyToken(token)
    req.user = { id: decoded.sub, email: decoded.email }
    return next()
  } catch (err) {
    const code =
      err && err.name === "TokenExpiredError" ? "E_AUTH_EXPIRED" : "E_AUTH_INVALID"
    return fail(res, 401, "Invalid or expired token", code)
  }
}

// Ensures the authenticated token belongs to the visitor whose
// :visitor_id is in the URL. Prevents one visitor's token from
// being used to access another visitor's data.
export const enforceSelfAccess = (req, res, next) => {
  if (!req.user || req.user.id == null) {
    return fail(res, 401, "Not authenticated", "E_AUTH_MISSING")
  }
  const tokenId = String(req.user.id)
  const pathId = String(req.params.visitor_id)
  if (tokenId !== pathId) {
    return fail(
      res,
      403,
      "Token is not authorized for this visitor",
      "E_AUTH_FORBIDDEN",
    )
  }
  return next()
}