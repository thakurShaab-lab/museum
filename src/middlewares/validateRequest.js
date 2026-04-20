import { ApiError } from "../utils/errors.js";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const issue = result.error.issues[0];
      return next(new ApiError(400, "VALIDATION_ERROR", issue.message));
    }
    if (source !== "query") {
      req[source] = result.data;
    }
    next();
  };
}
