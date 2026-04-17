import {
  bigint,
  datetime,
  index,
  mysqlEnum,
  mysqlTable,
  varchar
} from "drizzle-orm/mysql-core";
import { cities, countries, states } from "./locations.js";

export const registrationStatusEnum = ["ACTIVE", "INACTIVE", "CANCELLED"];
export const guestTypeEnum = ["GENERAL", "VIP", "VVIP"];
export const genderEnum = ["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"];
export const languageEnum = [
  "ENGLISH",
  "HINDI",
  "TELUGU",
  "TAMIL",
  "KANNADA",
  "MALAYALAM"
];

export const visitors = mysqlTable(
  "visitors",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    visitorId: varchar("visitor_id", { length: 32 }).notNull().unique(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    preferredName: varchar("preferred_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    mobileNumber: varchar("mobile_number", { length: 20 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    guestType: mysqlEnum("guest_type", guestTypeEnum).notNull(),
    gender: mysqlEnum("gender", genderEnum).notNull(),
    language: mysqlEnum("language", languageEnum).notNull(),
    registrationStatus: mysqlEnum("registration_status", registrationStatusEnum)
      .notNull()
      .default("ACTIVE"),
    registrationDate: datetime("registration_date", { mode: "string" }).notNull(),
    ticketType: varchar("ticket_type", { length: 100 }).notNull().default("GENERAL_ADMISSION"),
    validFrom: datetime("valid_from", { mode: "string" }).notNull(),
    validUntil: datetime("valid_until", { mode: "string" }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),
    countryId: bigint("country_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => countries.id),
    stateId: bigint("state_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => states.id),
    cityId: bigint("city_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => cities.id),
    state: varchar("state", { length: 100 }).notNull(),
    district: varchar("district", { length: 100 }).notNull(),
    taluka: varchar("taluka", { length: 100 }).notNull(),
    mandal: varchar("mandal", { length: 100 }).notNull(),
    village: varchar("village", { length: 100 }).notNull(),
    pincode: varchar("pincode", { length: 12 }).notNull(),
    distributorName: varchar("distributor_name", { length: 120 }).notNull(),
    referralCode: varchar("referral_code", { length: 64 }),
    aadhaarNumber: varchar("aadhaar_number", { length: 12 }).notNull(),
    aadhaarVerificationStatus: varchar("aadhaar_verification_status", { length: 20 }).notNull(),
    aadhaarVerificationRef: varchar("aadhaar_verification_ref", { length: 64 }),
    packageDetails: varchar("package_details", { length: 160 }).notNull(),
    timeSlotStart: datetime("time_slot_start", { mode: "string" }).notNull(),
    timeSlotEnd: datetime("time_slot_end", { mode: "string" }).notNull(),
    qrPayload: varchar("qr_payload", { length: 2000 }).notNull(),
    image1Url: varchar("image_1_url", { length: 512 }).notNull(),
    image2Url: varchar("image_2_url", { length: 512 }).notNull(),
    image3Url: varchar("image_3_url", { length: 512 }).notNull(),
    createdAt: datetime("created_at", { mode: "string" }).notNull(),
    updatedAt: datetime("updated_at", { mode: "string" }).notNull()
  },
  (table) => [
    index("idx_visitors_registration_date").on(table.registrationDate),
    index("idx_visitors_registration_date_id").on(table.registrationDate, table.id),
    index("idx_visitors_status").on(table.registrationStatus),
    index("idx_visitors_guest_type").on(table.guestType)
  ]
);
