import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError } from "../utils/errors.js";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MIME_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export async function resolveVisitorImageUrls({ visitorId, image_urls, image_uploads, uploaded_files }) {
  if (Array.isArray(uploaded_files) && uploaded_files.length > 0) {
    return storeMulterFiles(visitorId, uploaded_files);
  }

  if (Array.isArray(image_urls) && image_urls.length === 3) {
    return image_urls;
  }

  if (!Array.isArray(image_uploads) || image_uploads.length !== 3) {
    throw new ApiError(400, "INVALID_IMAGE_INPUT", "Exactly 3 images are required.");
  }

  const visitorDir = path.resolve(process.cwd(), "uploads", "visitors", visitorId);
  await mkdir(visitorDir, { recursive: true });

  const stored = [];
  for (let i = 0; i < image_uploads.length; i += 1) {
    const image = image_uploads[i];
    const ext = MIME_EXT[image.mime_type];
    if (!ext) {
      throw new ApiError(400, "INVALID_IMAGE_TYPE", "Supported formats are JPEG, PNG and WEBP.");
    }

    let buffer;
    try {
      buffer = Buffer.from(image.data_base64, "base64");
    } catch (_error) {
      throw new ApiError(400, "INVALID_IMAGE_DATA", "Image payload is not valid base64.");
    }

    if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
      throw new ApiError(400, "INVALID_IMAGE_SIZE", "Each image must be up to 2 MB.");
    }

    const filename = `image-${i + 1}.${ext}`;
    const absolutePath = path.join(visitorDir, filename);
    await writeFile(absolutePath, buffer);
    stored.push(`/media/visitors/${visitorId}/${filename}`);
  }

  return stored;
}

async function storeMulterFiles(visitorId, files) {
  if (files.length !== 3) {
    throw new ApiError(400, "INVALID_IMAGE_INPUT", "Exactly 3 images are required.");
  }

  const visitorDir = path.resolve(process.cwd(), "uploads", "visitors", visitorId);
  await mkdir(visitorDir, { recursive: true });

  const stored = [];
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    const ext = MIME_EXT[file.mimetype];
    if (!ext) {
      throw new ApiError(400, "INVALID_IMAGE_TYPE", "Supported formats are JPEG, PNG and WEBP.");
    }

    if (!file.size || file.size > MAX_IMAGE_BYTES) {
      throw new ApiError(400, "INVALID_IMAGE_SIZE", "Each image must be up to 2 MB.");
    }

    const filename = `image-${i + 1}.${ext}`;
    const absolutePath = path.join(visitorDir, filename);
    await writeFile(absolutePath, file.buffer);
    stored.push(`/media/visitors/${visitorId}/${filename}`);
  }

  return stored;
}
