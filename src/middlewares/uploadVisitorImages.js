import multer from "multer";
import { ApiError } from "../utils/errors.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 3,
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      return cb(new ApiError(400, "INVALID_IMAGE_TYPE", "Supported formats are JPEG, PNG and WEBP."));
    }
    return cb(null, true);
  }
});

export const uploadVisitorImages = [
  upload.array("images", 3),
  (req, _res, next) => {
    if (Array.isArray(req.files) && req.files.length > 0) {
      req.body.multipart_images_present = true;
    }
    next();
  }
];
