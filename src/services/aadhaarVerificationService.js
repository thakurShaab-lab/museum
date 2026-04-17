import { request as undiciRequest } from "undici";
import { env } from "../config/env.js";
import { ApiError } from "../utils/errors.js";

function maskAadhaar(aadhaarNumber) {
  return `XXXXXXXX${aadhaarNumber.slice(-4)}`;
}

export async function verifyAadhaar(payload) {
  if (!env.aadhaarVerifyUrl) {
    if (payload.aadhaar_number.startsWith("0")) {
      throw new ApiError(400, "AADHAAR_VERIFICATION_FAILED", "Invalid Aadhaar details.");
    }

    return {
      status: "VERIFIED",
      reference_id: `AADHAAR-SIM-${Date.now()}`,
      masked_aadhaar: maskAadhaar(payload.aadhaar_number)
    };
  }

  const body = {
    aadhaar_number: payload.aadhaar_number,
    aadhaar_name: payload.aadhaar_name,
    aadhaar_dob: payload.aadhaar_dob
  };

  const headers = { "content-type": "application/json" };
  if (env.aadhaarApiKey) {
    headers[env.aadhaarApiKeyHeader] = env.aadhaarApiKey;
  }

  const response = await undiciRequest(env.aadhaarVerifyUrl, {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });

  const data = await response.body.json().catch(() => ({}));
  if (response.statusCode >= 400 || data.status !== "VERIFIED") {
    throw new ApiError(400, "AADHAAR_VERIFICATION_FAILED", "Unable to verify Aadhaar details.");
  }

  return {
    status: "VERIFIED",
    reference_id: data.reference_id || `AADHAAR-${Date.now()}`,
    masked_aadhaar: data.masked_aadhaar || maskAadhaar(payload.aadhaar_number)
  };
}
