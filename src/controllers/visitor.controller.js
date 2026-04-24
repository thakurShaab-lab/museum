import * as visitorModel from "../models/visitor.model.js"
import { asyncHandler, ok, fail } from "../utils/response.js"

const STATUS_LABELS = {
  "0": "pending",
  "1": "active",
  "2": "blocked",
  "3": "deleted",
}

export const checkVisitorExists = asyncHandler(async (req, res) => {
  const visitorId = Number(req.params.visitor_id)
  const row = await visitorModel.visitorExists(visitorId)
  if (!row) return ok(res, { visitor_id: visitorId, exists: false })
  return ok(res, {
    visitor_id: row.customers_id,
    exists: true,
    registration_status: STATUS_LABELS[row.status] ?? row.status,
    guest_type: row.guest_type,
  })
})

export const getVisitor = asyncHandler(async (req, res) => {
  const visitorId = Number(req.params.visitor_id)
  const visitor = await visitorModel.findVisitorById(visitorId)
  if (!visitor) return fail(res, 404, "Visitor not found", "E_VISITOR_NOT_FOUND")

  const host = req.get("host").split(":")[0]
  const BASE_URL = `${req.protocol}://${host}`

  const { password, otp_code, actkey, user_uq_token, customer_qr, ...safe } = visitor

  
  return ok(res, { safe, visitor_qr: customer_qr ? `${BASE_URL}/anubhav/uploaded_files/qr/${customer_qr}` : `${BASE_URL}/anubhav/uploaded_files/no_qr.svg` })
})

export const getVisitors = asyncHandler(async (req, res) => {
  const { limit, offset } = req.validatedQuery
  const { rows, total } = await visitorModel.findAllVisitors(limit, offset)
  const items = rows.map(
    ({ password, otp_code, actkey, user_uq_token, ...safe }) => safe,
  )
  return ok(res, { count: items.length, total, limit, offset, items })
})

export const getVisitorImage = asyncHandler(async (req, res) => {
  const visitorId = Number(req.params.visitor_id)
  const idx = Number(req.params.image_index)
  const row = await visitorModel.findVisitorImages(visitorId)
  if (!row) return fail(res, 404, "Visitor not found", "E_VISITOR_NOT_FOUND")

  const images = [row.image1, row.image2, row.image3]
  const image = images[idx]
  if (!image) return fail(res, 404, "Image not found", "E_IMAGE_NOT_FOUND")

  return ok(res, {
    visitor_id: visitorId,
    image_index: idx,
    image_url: image,
  })
})