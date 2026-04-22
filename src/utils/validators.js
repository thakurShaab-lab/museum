import { z } from "zod"

export const visitorIdSchema = z.coerce
  .number()
  .int()
  .positive("visitor_id must be a positive integer")

export const imageIndexSchema = z.coerce.number().int().min(0).max(2)

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})