import { Router } from "express"
import { z } from "zod"
import * as controller from "../controllers/visitor.controller.js"
import { authenticate, enforceSelfAccess } from "../middleware/auth.middleware.js"
import { validateApiKey } from "../middleware/apiKey.middleware.js"
import { validate } from "../middleware/validate.middleware.js"
import {
  visitorIdSchema,
  imageIndexSchema,
  listQuerySchema,
} from "../utils/validators.js"

const router = Router()

// API key required for every visitor endpoint.
router.use(validateApiKey)

// List endpoint: API key only, no Bearer token required.
router.get(
  "/",
  validate({ query: listQuerySchema }),
  controller.getVisitors,
)

// Per-visitor endpoints require a JWT that belongs to that visitor.
router.get(
  "/:visitor_id/exists",
  validate({ params: z.object({ visitor_id: visitorIdSchema }) }),
  authenticate,
  enforceSelfAccess,
  controller.checkVisitorExists,
)

router.get(
  "/:visitor_id",
  validate({ params: z.object({ visitor_id: visitorIdSchema }) }),
  authenticate,
  enforceSelfAccess,
  controller.getVisitor,
)

router.get(
  "/:visitor_id/images/:image_index",
  validate({
    params: z.object({
      visitor_id: visitorIdSchema,
      image_index: imageIndexSchema,
    }),
  }),
  authenticate,
  enforceSelfAccess,
  controller.getVisitorImage,
)

export default router