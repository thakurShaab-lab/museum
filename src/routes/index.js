import { Router } from "express"
import visitorRoutes from "./visitor.routes.js"
import authRoutes from "./auth.routes.js"

const router = Router()

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" })
})

router.use("/v1/auth", authRoutes)
router.use("/v1/visitors", visitorRoutes)

export default router