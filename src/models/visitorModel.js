import { and, between, count, eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { visitors } from "../schemas/visitors.js";
import {
  getCachedVisitors,
  setCachedVisitors
} from "../services/visitorListCacheService.js";
import { mysqlDateTimeNow } from "../utils/time.js";

export async function getVisitorExistence(visitorId) {
  const rows = await db
    .select({
      visitor_id: visitors.visitorId,
      registration_status: visitors.registrationStatus,
      guest_type: visitors.guestType
    })
    .from(visitors)
    .where(eq(visitors.visitorId, visitorId))
    .limit(1);
  return rows[0] || null;
}

export async function getVisitorById(visitorId) {
  const rows = await db
    .select()
    .from(visitors)
    .where(eq(visitors.visitorId, visitorId))
    .limit(1);
  return rows[0] || null;
}

export async function getVisitorsByDateRange(startDate, endDate, page, limit) {
  const cached = getCachedVisitors(startDate, endDate, page, limit);
  if (cached) {
    return cached;
  }

  const offset = (page - 1) * limit;

  const [metadata] = await db
    .select({ total_records: count(visitors.id) })
    .from(visitors)
    .where(between(visitors.registrationDate, startDate, endDate));

  const totalRecords = Number(metadata.total_records || 0);

  const rows = await db
    .select({
      visitor_id: visitors.visitorId,
      first_name: visitors.firstName,
      last_name: visitors.lastName,
      preferred_name: visitors.preferredName,
      gender: visitors.gender,
      guest_type: visitors.guestType,
      registration_date: visitors.registrationDate,
      country_id: visitors.countryId,
      state_id: visitors.stateId,
      city_id: visitors.cityId,
      package_details: visitors.packageDetails,
      time_slot_start: visitors.timeSlotStart,
      time_slot_end: visitors.timeSlotEnd,
      image_1_url: visitors.image1Url,
      image_2_url: visitors.image2Url,
      image_3_url: visitors.image3Url
    })
    .from(visitors)
    .where(between(visitors.registrationDate, startDate, endDate))
    .orderBy(sql`${visitors.registrationDate} ASC`)
    .limit(limit)
    .offset(offset);

  const result = {
    totalRecords,
    data: rows
  };
  setCachedVisitors(startDate, endDate, page, limit, result);
  return result;
}

export async function getVisitorImageUrl(visitorId, imageIndex) {
  const columnByIndex = {
    1: visitors.image1Url,
    2: visitors.image2Url,
    3: visitors.image3Url
  };

  const column = columnByIndex[imageIndex];
  const rows = await db
    .select({ imageUrl: column })
    .from(visitors)
    .where(eq(visitors.visitorId, visitorId))
    .limit(1);

  return rows[0]?.imageUrl || null;
}

export async function createVisitorRecord(payload) {
  const now = mysqlDateTimeNow();
  const [inserted] = await db
    .insert(visitors)
    .values({
      visitorId: payload.visitor_id,
      firstName: payload.first_name,
      lastName: payload.last_name,
      preferredName: payload.preferred_name,
      email: payload.email,
      mobileNumber: payload.mobile_number,
      passwordHash: payload.password_hash,
      guestType: payload.guest_type,
      gender: payload.gender,
      language: payload.language,
      registrationStatus: "ACTIVE",
      registrationDate: payload.registration_date,
      ticketType: payload.ticket_type,
      validFrom: payload.valid_from,
      validUntil: payload.valid_until,
      address: payload.address,
      countryId: payload.country_id,
      stateId: payload.state_id,
      cityId: payload.city_id,
      state: payload.state,
      district: payload.district,
      taluka: payload.taluka,
      mandal: payload.mandal,
      village: payload.village,
      pincode: payload.pincode,
      distributorName: payload.distributor_name,
      referralCode: payload.referral_code || null,
      aadhaarNumber: payload.aadhaar_number,
      aadhaarVerificationStatus: payload.aadhaar_verification_status,
      aadhaarVerificationRef: payload.aadhaar_verification_ref,
      packageDetails: payload.package_details,
      timeSlotStart: payload.time_slot_start,
      timeSlotEnd: payload.time_slot_end,
      qrPayload: payload.qr_payload,
      image1Url: payload.image_urls[0],
      image2Url: payload.image_urls[1],
      image3Url: payload.image_urls[2],
      createdAt: now,
      updatedAt: now
    })
    .$returningId();

  return inserted;
}
