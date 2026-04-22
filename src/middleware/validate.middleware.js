import { fail } from "../utils/response.js"

export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.params) req.params = schemas.params.parse(req.params)
    if (schemas.query) {
      const parsed = schemas.query.parse(req.query)
      Object.defineProperty(req, "validatedQuery", { value: parsed })
    }
    if (schemas.body) req.body = schemas.body.parse(req.body)
    return next()
  } catch (err) {
    const issues = err?.issues?.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }))
    return fail(res, 400, "Validation failed", "E_VALIDATION") &&
      res.status(400).json({
        success: false,
        error: { code: "E_VALIDATION", message: "Validation failed", issues },
      })
  }
}