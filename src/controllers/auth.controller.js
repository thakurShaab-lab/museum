import { generateToken } from "../utils/jwt.js"
import { asyncHandler, ok } from "../utils/response.js"

export const issueToken = asyncHandler(async (req, res) => {
  const { id, email, expiresIn } = req.body
  const token = generateToken(
    { id, email },
    expiresIn ? { expiresIn } : undefined,
  )
  return ok(
    res,
    {
      token,
      token_type: "Bearer",
      visitor: { id: String(id), email },
    },
    201,
  )
})