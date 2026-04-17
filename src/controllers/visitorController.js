import { randomUUID } from "node:crypto";
import { request as undiciRequest } from "undici";
import { env } from "../config/env.js";
import {
  createVisitorRecord,
  getVisitorById,
  getVisitorExistence,
  getVisitorImageUrl,
  getVisitorsByDateRange
} from "../models/visitorModel.js";
import { getLocationHierarchy } from "../models/locationModel.js";
import { hashPassword } from "../services/cryptoService.js";
import { verifyAadhaar } from "../services/aadhaarVerificationService.js";
import { resolveVisitorImageUrls } from "../services/visitorImageService.js";
import { generateVisitorId } from "../services/visitorIdentityService.js";
import { buildQrImageUrl, buildVisitorQrPayload } from "../services/visitorQrService.js";
import { clearVisitorListCache } from "../services/visitorListCacheService.js";
import { getTokenRotationMetadata } from "../services/tokenAuthService.js";
import { ApiError } from "../utils/errors.js";
import { toUtcIso } from "../utils/time.js";

function formatVisitorResponse(visitor, req) {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const qrPayload = visitor.qrPayload ? JSON.parse(visitor.qrPayload) : null;
  return {
    visitor_id: visitor.visitorId,
    first_name: visitor.firstName,
    last_name: visitor.lastName,
    preferred_name: visitor.preferredName,
    gender: visitor.gender,
    language: visitor.language,
    email: visitor.email,
    guest_type: visitor.guestType,
    country_id: visitor.countryId,
    state_id: visitor.stateId,
    city_id: visitor.cityId,
    state: visitor.state,
    city: visitor.district,
    registration_date: new Date(visitor.registrationDate).toISOString(),
    ticket_type: visitor.ticketType,
    package_details: visitor.packageDetails,
    valid_from: new Date(visitor.validFrom).toISOString(),
    valid_until: new Date(visitor.validUntil).toISOString(),
    time_slot_start: new Date(visitor.timeSlotStart).toISOString(),
    time_slot_end: new Date(visitor.timeSlotEnd).toISOString(),
    qr_code: qrPayload ? { payload: qrPayload, image_url: buildQrImageUrl(qrPayload) } : null,
    image_urls: [1, 2, 3].map(
      (idx) => `${baseUrl}/api/v1/visitors/${visitor.visitorId}/images/${idx}`
    )
  };
}

export async function validateVisitorExistence(req, res, next) {
  try {
    const { visitor_id: visitorId } = req.params;
    const visitor = await getVisitorExistence(visitorId);
    if (!visitor) {
      return res.status(404).json({
        visitor_id: visitorId,
        exists: false
      });
    }

    return res.status(200).json({
      visitor_id: visitor.visitor_id,
      exists: true,
      registration_status: visitor.registration_status,
      guest_type: visitor.guest_type
    });
  } catch (error) {
    next(error);
  }
}

export async function getVisitorDetails(req, res, next) {
  try {
    const { visitor_id: visitorId } = req.params;
    const visitor = await getVisitorById(visitorId);
    if (!visitor) {
      throw new ApiError(404, "VISITOR_NOT_FOUND", "Visitor ID does not exist.");
    }
    return res.status(200).json(formatVisitorResponse(visitor, req));
  } catch (error) {
    next(error);
  }
}

export async function getVisitorIdCard(req, res, next) {
  try {
    const { visitor_id: visitorId } = req.params;
    const visitor = await getVisitorById(visitorId);
    if (!visitor) {
      throw new ApiError(404, "VISITOR_NOT_FOUND", "Visitor ID does not exist.");
    }

    const qrPayload = visitor.qrPayload ? JSON.parse(visitor.qrPayload) : null;
    return res.status(200).json({
      visitor_id: visitor.visitorId,
      visitor_name: `${visitor.firstName} ${visitor.lastName}`.trim(),
      ticket_type: visitor.ticketType,
      package_details: visitor.packageDetails,
      date_time_slot: {
        slot_start: new Date(visitor.timeSlotStart).toISOString(),
        slot_end: new Date(visitor.timeSlotEnd).toISOString()
      },
      qr_code: qrPayload ? { payload: qrPayload, image_url: buildQrImageUrl(qrPayload) } : null
    });
  } catch (error) {
    next(error);
  }
}

export async function getVisitors(req, res, next) {
  try {
    const { start_date: startDate, end_date: endDate, page, limit } = req.query;
    const result = await getVisitorsByDateRange(
      new Date(startDate).toISOString().slice(0, 19).replace("T", " "),
      new Date(endDate).toISOString().slice(0, 19).replace("T", " "),
      page,
      limit
    );

    const totalPages = Math.max(1, Math.ceil(result.totalRecords / limit));
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    return res.status(200).json({
      metadata: {
        total_records: result.totalRecords,
        current_page: page,
        total_pages: totalPages,
        limit,
        has_next: page < totalPages
      },
      data: result.data.map((row) => ({
        visitor_id: row.visitor_id,
        first_name: row.first_name,
        last_name: row.last_name,
        preferred_name: row.preferred_name,
        gender: row.gender,
        guest_type: row.guest_type,
        country_id: row.country_id,
        state_id: row.state_id,
        city_id: row.city_id,
        registration_date: new Date(row.registration_date).toISOString(),
        package_details: row.package_details,
        time_slot_start: new Date(row.time_slot_start).toISOString(),
        time_slot_end: new Date(row.time_slot_end).toISOString(),
        image_urls: [1, 2, 3].map(
          (idx) => `${baseUrl}/api/v1/visitors/${row.visitor_id}/images/${idx}`
        )
      }))
    });
  } catch (error) {
    next(error);
  }
}

export async function getVisitorImage(req, res, next) {
  try {
    const { visitor_id: visitorId } = req.params;
    const imageIndex = Number(req.params.image_index);
    const imageUrl = await getVisitorImageUrl(visitorId, imageIndex);

    if (!imageUrl) {
      throw new ApiError(404, "IMAGE_NOT_FOUND", "Requested image does not exist.");
    }

    if (imageUrl.startsWith("/")) {
      return res.redirect(302, imageUrl);
    }

    if (env.imageDeliveryMode === "stream") {
      const upstream = await undiciRequest(imageUrl, { method: "GET", maxRedirections: 0 });
      if (upstream.statusCode >= 400) {
        throw new ApiError(404, "IMAGE_NOT_FOUND", "Requested image does not exist.");
      }

      res.setHeader(
        "content-type",
        upstream.headers["content-type"] || "application/octet-stream"
      );
      upstream.body.pipe(res);
      return;
    }

    return res.redirect(302, imageUrl);
  } catch (error) {
    next(error);
  }
}

export async function registerVisitor(req, res, next) {
  try {
    const payload = req.body;

    console.log("BODY RECEIVED:", req.body);
    const location = await getLocationHierarchy(payload.country_id, payload.state_id, payload.city_id);
    if (!location) {
      throw new ApiError(
        400,
        "INVALID_LOCATION_HIERARCHY",
        "city_id must belong to state_id and state_id must belong to country_id."
      );
    }
    const visitorId = generateVisitorId();
    const aadhaarVerification = await verifyAadhaar(payload);
    const imageUrls = await resolveVisitorImageUrls({
      visitorId,
      image_urls: payload.image_urls,
      image_uploads: payload.image_uploads,
      uploaded_files: req.files
    });
    const qrPayload = buildVisitorQrPayload({
      visitor_id: visitorId,
      first_name: payload.first_name,
      last_name: payload.last_name,
      ticket_type: payload.ticket_type,
      package_details: payload.package_details,
      valid_from: payload.valid_from,
      valid_until: payload.valid_until,
      time_slot_start: payload.time_slot_start,
      time_slot_end: payload.time_slot_end
    });

    await createVisitorRecord({
      ...payload,
      visitor_id: visitorId,
      password_hash: hashPassword(payload.password),
      aadhaar_verification_status: aadhaarVerification.status,
      aadhaar_verification_ref: aadhaarVerification.reference_id,
      qr_payload: JSON.stringify(qrPayload),
      image_urls: imageUrls,
      state: location.state.name,
      district: location.city.name,
      registration_date: toUtcIso().slice(0, 19).replace("T", " "),
      valid_from: new Date(payload.valid_from).toISOString().slice(0, 19).replace("T", " "),
      valid_until: new Date(payload.valid_until).toISOString().slice(0, 19).replace("T", " "),
      time_slot_start: new Date(payload.time_slot_start).toISOString().slice(0, 19).replace("T", " "),
      time_slot_end: new Date(payload.time_slot_end).toISOString().slice(0, 19).replace("T", " ")
    });
    clearVisitorListCache();

    return res.status(201).json({
      visitor_id: visitorId,
      visitor_id_format: "VIS-YYYYMMDD-######",
      status: "REGISTERED",
      aadhaar_verification: {
        status: aadhaarVerification.status,
        reference_id: aadhaarVerification.reference_id,
        masked_aadhaar: aadhaarVerification.masked_aadhaar
      },
      qr_code: {
        payload: qrPayload,
        image_url: buildQrImageUrl(qrPayload)
      },
      reference_id: randomUUID()
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuthConfiguration(_req, res, next) {
  try {
    return res.status(200).json({
      auth_mode: env.authMode,
      api_key_header: env.apiKeyHeader,
      token_enabled: env.authMode === "token" || env.authMode === "both",
      token_scheme: "Bearer",
      token_rotation: getTokenRotationMetadata()
    });
  } catch (error) {
    next(error);
  }
}