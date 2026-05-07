import path from "node:path"
import fs from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"
import * as grievanceModel from "../models/grievance.model.js"
import { asyncHandler, ok, fail } from "../utils/response.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Supported audio MIME types as defined in the PDF spec
const ALLOWED_AUDIO_MIMES = new Set([
  "audio/mpeg",       // mp3
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/ogg",
  "audio/x-ogg",
  "audio/mp4",        // m4a
  "audio/x-m4a",
  "audio/webm",
  "audio/aac",
  "audio/x-aac",
  "application/octet-stream", // fallback when browser doesn't detect type
])

const ALLOWED_EXTENSIONS = new Set([
  ".mp3", ".wav", ".ogg", ".m4a", ".webm", ".aac",
])

const STATUS_LABELS = {
  "0": "Pending",
  "1": "Assigned",
  "2": "Response Submitted",
  "3": "Approved",
  "4": "Closed",
}


// ─── POST /api/grievances ────────────────────────────────────────────────────
// Accepts multipart/form-data: name, phone, email, audio_file
// Used by: Kiosk System (IIIT Team)
export const submitGrievance = asyncHandler(async (req, res) => {
  const { name, phone, email } = req.body

  if (!name && !phone && !email) {
    return fail(
      res,
      400,
      "At least one of name, phone, or email is required",
      "E_CONTACT_REQUIRED",
    )
  }

  if (!req.file) {
    return fail(res, 400, "audio_file is required", "E_AUDIO_REQUIRED")
  }

  const ext = path.extname(req.file.originalname).toLowerCase()

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    await fs.unlink(req.file.path).catch(() => { })

    return fail(
      res,
      400,
      `Unsupported audio format '${ext}'. Allowed: ${[
        ...ALLOWED_EXTENSIONS,
      ].join(", ")}`,
      "E_INVALID_AUDIO_FORMAT",
    )
  }

  let visitor_id = null

  try {
    visitor_id = await grievanceModel.findVisitorByContact({
      name,
      phone,
      email,
    })
  } catch (error) {
    await fs.unlink(req.file.path).catch(() => { })

    return fail(
      res,
      400,
      error.message,
      "E_INVALID_VISITOR",
    )
  }

  // If visitor not found
  if (!visitor_id) {
    await fs.unlink(req.file.path).catch(() => { })

    return fail(
      res,
      400,
      "No valid visitor found with provided details",
      "E_VISITOR_NOT_FOUND",
    )
  }

  const insertId = await grievanceModel.createGrievance({
    visitor_id,
    audio_file: req.file.filename,
  })

  return ok(
    res,
    {
      grievance_id: `GRV${String(insertId).padStart(6, "0")}`,
      id: insertId,
      visitor_id,
      visitor_matched: true,
      message:
        "Grievance submitted successfully. It has been queued for supervisor review.",
    },
    201,
  )
})

// ─── GET /api/grievances ─────────────────────────────────────────────────────
// Lists all grievances with joined visitor details + pagination
export const listGrievances = asyncHandler(async (req, res) => {
  const { limit, offset } = req.validatedQuery

 // const host = req.get("host").split(":")[0]
 // const BASE_URL = `${req.protocol}://${host}`

const BASE_URL = `http://bkdbnewanubhavmantap.in`

  const { rows, total } = await grievanceModel.findAllGrievances(limit, offset)
  const items = rows.map((row) => ({ ...row, audio_file_url: row.audio_file ? `/home/bkdbnewan/public_html/uploaded_files/grievances/${row.audio_file}` : `${BASE_URL}/anubhav/uploaded_files/no_sound.png` }))
  // const items = rows.map((row) => ({ ...row, audio_file_url: row.audio_file ? `${BASE_URL}/anubhav/uploaded_files/grievances/${row.audio_file}` : `${BASE_URL}/anubhav/uploaded_files/no_sound.png` }))

  return ok(res, { count: items.length, total, limit, offset, items })
})

// ─── GET /api/grievances/:grievance_id ───────────────────────────────────────
// Fetch a single grievance by numeric id
export const getGrievance = asyncHandler(async (req, res) => {
  const id = Number(req.params.grievance_id)

 //  const host = req.get("host").split(":")[0]
const BASE_URL = `http://bkdbnewanubhavmantap.in`
//  const BASE_URL = `${req.protocol}://${host}`

  const row = await grievanceModel.findGrievanceById(id)
  if (!row) return fail(res, 404, "Grievance not found", "E_GRIEVANCE_NOT_FOUND")

  console.log("Grievance row:", row) // Debug log to inspect the raw database row

  return ok(res, { row, audio_file_url: row.audio_file ? `${BASE_URL}/uploaded_files/grievances/${row.audio_file}` : `${BASE_URL}/anubhav/uploaded_files/no_sound.png` })
  // return ok(res, { row, audio_file_url: row.audio_file ? `${BASE_URL}/anubhav/uploaded_files/grievances/${row.audio_file}` : `${BASE_URL}/anubhav/uploaded_files/no_sound.png` })
})