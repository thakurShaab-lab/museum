import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

const ALGORITHM = "HS512"

export function generateToken(user, options = {}) {
  if (!user || !user.id || !user.email) {
    throw new Error("generateToken requires user with id and email")
  }
  return jwt.sign(
    { sub: String(user.id), email: user.email },
    env.JWT_SECRET,
    {
      algorithm: ALGORITHM,
      expiresIn: options.expiresIn ?? env.JWT_EXPIRES_IN,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },
  )
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: [ALGORITHM],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  })
}