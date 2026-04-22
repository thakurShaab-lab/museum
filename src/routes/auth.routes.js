import { Router } from "express"
import { z } from "zod"
import * as controller from "../controllers/auth.controller.js"
import { validateApiKey } from "../middleware/apiKey.middleware.js"
import { validate } from "../middleware/validate.middleware.js"

const router = Router()

const issueTokenBody = z.object({
  id: z.union([z.string().min(1).max(64), z.number().int().positive()]),
  email: z.string().email().max(255),
  expiresIn: z
    .string()
    .regex(/^\d+(ms|s|m|h|d|w|y)?$/, "Invalid expiresIn format (e.g. 1h, 7d)")
    .optional(),
})

router.post(
  "/token",
  validateApiKey,
  validate({ body: issueTokenBody }),
  controller.issueToken,
)

export default router