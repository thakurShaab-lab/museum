import { ApiError } from "../utils/errors.js";
import { toUtcIso } from "../utils/time.js";

export function notFoundHandler(_req, _res, next) {
  next(new ApiError(404, "NOT_FOUND", "Resource not found."));
}

export function errorHandler(err, _req, res, _next) {
  if (err?.name === "MulterError") {
    let message = "Invalid file upload.";
    let errorCode = "FILE_UPLOAD_ERROR";

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Each image must be up to 2 MB.";
      errorCode = "INVALID_IMAGE_SIZE";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "Exactly up to 3 images are allowed.";
      errorCode = "INVALID_IMAGE_COUNT";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Use field name 'images' for upload.";
      errorCode = "INVALID_IMAGE_FIELD";
    }

    return res.status(400).json({
      error_code: errorCode,
      message,
      timestamp: toUtcIso()
    });
  }

  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || "INTERNAL_SERVER_ERROR";
  const message =
    statusCode === 500 ? "Unexpected server error." : err.message || "Request failed.";

  res.status(statusCode).json({
    error_code: errorCode,
    message: err.message || "Unexpected server error.", // show real message
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined, // optional
    timestamp: toUtcIso()
  });
}
