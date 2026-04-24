import { Router } from "express"
import { z } from "zod"
import multer from "multer"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { dirname } from "node:path"
import * as controller from "../controllers/grievance.controller.js"
import { validateApiKey } from "../middleware/apiKey.middleware.js"
import { validate } from "../middleware/validate.middleware.js"
import { listQuerySchema } from "../utils/validators.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ── Upload storage ──────────────────────────────────────────────────────────
// Files stored at  src/anubhav/uploaded_files/grievances/<timestamp>-<random>.<ext>
// Served statically via  /uploaded_files/grievances/<filename>
const storage = multer.diskStorage({
  destination: path.join(__dirname, "..", "..", "..", "anubhav", "uploaded_files", "grievances"),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    cb(null, `${unique}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (_req, file, cb) => {
    // Let the controller do the exact MIME/extension check so we can return
    // a structured JSON error instead of a multer-thrown exception.
    cb(null, true)
  },
})

const router = Router()

// API key required for every grievance endpoint (same as visitor endpoints)
router.use(validateApiKey)

// POST /api/grievances  — Kiosk submits a new grievance + audio file
router.post(
  "/",
  upload.single("audio_file"),
  controller.submitGrievance,
)

// GET /api/grievances   — List all grievances (paginated)
router.get(
  "/",
  validate({ query: listQuerySchema }),
  controller.listGrievances,
)

// GET /api/grievances/:grievance_id  — Fetch single grievance details
router.get(
  "/:grievance_id",
  validate({ params: z.object({ grievance_id: z.coerce.number().int().positive() }) }),
  controller.getGrievance,
)

export default router
