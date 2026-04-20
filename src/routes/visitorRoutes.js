import { Router } from "express"
import { apiKeyAuth } from "../middlewares/apiKeyAuth.js"
import { uploadVisitorImages } from "../middlewares/uploadVisitorImages.js"
import { validate } from "../middlewares/validateRequest.js"
import { listCities, listCountries, listStates } from "../controllers/locationController.js"
import { getAuthConfiguration, getVisitorDetails, getVisitorIdCard, getVisitorImage, getVisitors, registerVisitor, validateVisitorExistence } from "../controllers/visitorController.js"
import { citiesQuerySchema, dateRangeSchema, registerVisitorSchema, statesQuerySchema, visitorIdParamsSchema, visitorImageParamsSchema } from "../schemas/validation.js"

const router = Router()

router.get("/auth/configuration", getAuthConfiguration)
router.get("/locations/countries", apiKeyAuth("read:visitors"), listCountries)
router.get("/locations/states", apiKeyAuth("read:visitors"), validate(statesQuerySchema, "query"), listStates)
router.get("/locations/cities", apiKeyAuth("read:visitors"), validate(citiesQuerySchema, "query"), listCities)

router.get("/visitors/:visitor_id/exists", apiKeyAuth("read:visitors"), validate(visitorIdParamsSchema, "params"), validateVisitorExistence)

router.get("/visitors/:visitor_id/id-card", apiKeyAuth("read:visitors"), validate(visitorIdParamsSchema, "params"), getVisitorIdCard)

router.get("/visitors/:visitor_id", apiKeyAuth("read:visitors"), validate(visitorIdParamsSchema, "params"), getVisitorDetails)

router.get("/visitors", apiKeyAuth("read:visitors"), validate(dateRangeSchema, "query"), getVisitors)

router.get("/visitors/:visitor_id/images/:image_index", apiKeyAuth("read:images"), validate(visitorImageParamsSchema, "params"), getVisitorImage)

router.post("/visitors/register", apiKeyAuth("register:visitors"), ...uploadVisitorImages, validate(registerVisitorSchema, "body"), registerVisitor)

export default router
