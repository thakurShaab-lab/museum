import { z } from "zod";
import {
  genderEnum,
  guestTypeEnum,
  languageEnum
} from "./visitors.js";

export const visitorIdSchema = z
  .string()
  .trim()
  .regex(/^VIS-\d{8}-\d{6}$/, "Invalid visitor_id format");

export const imageIndexSchema = z.coerce.number().int().min(1).max(3);
export const visitorIdParamsSchema = z.object({ visitor_id: visitorIdSchema });
export const visitorImageParamsSchema = z.object({
  visitor_id: visitorIdSchema,
  image_index: imageIndexSchema
});

export const dateRangeSchema = z
  .object({
    start_date: z.iso.datetime(),
    end_date: z.iso.datetime(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(500).default(100)
  })
  .superRefine((value, ctx) => {
    if (new Date(value.start_date) > new Date(value.end_date)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "The start_date cannot be later than the end_date.",
        path: ["start_date"]
      });
    }
  });

export const registerVisitorSchema = z.object({
  first_name: z.string().trim().min(2).max(100),
  last_name: z.string().trim().min(1).max(100),
  preferred_name: z.string().trim().min(1).max(100),
  email: z.string().email(),
  mobile_number: z.string().trim().regex(/^[0-9]{10,15}$/),
  password: z.string().min(8).max(72),
  guest_type: z.enum(guestTypeEnum),
  gender: z.enum(genderEnum),
  language: z.enum(languageEnum),
  ticket_type: z.string().trim().min(3).max(100).default("GENERAL_ADMISSION"),
  valid_from: z.iso.datetime(),
  valid_until: z.iso.datetime(),
  address: z.string().trim().min(5).max(255),
  country_id: z.coerce.number().int().positive(),
  state_id: z.coerce.number().int().positive(),
  city_id: z.coerce.number().int().positive(),
  state: z.string().trim().min(2).max(100).optional(),
  district: z.string().trim().min(2).max(100).optional(),
  taluka: z.string().trim().min(2).max(100),
  mandal: z.string().trim().min(2).max(100),
  village: z.string().trim().min(2).max(100),
  pincode: z.string().trim().regex(/^[0-9]{5,12}$/),
  distributor_name: z.string().trim().min(2).max(120),
  referral_code: z.string().trim().max(64).optional(),
  aadhaar_number: z.string().trim().regex(/^[0-9]{12}$/),
  package_details: z.string().trim().min(2).max(160),
  time_slot_start: z.iso.datetime(),
  time_slot_end: z.iso.datetime(),
  aadhaar_name: z.string().trim().min(2).max(120),
  aadhaar_dob: z.iso.date(),
  image_urls: z.array(z.string().url()).length(3).optional(),
  image_uploads: z
    .array(
      z.object({
        filename: z.string().trim().min(1).max(120),
        mime_type: z.enum(["image/jpeg", "image/png", "image/webp"]),
        data_base64: z.string().min(20)
      })
    )
    .length(3)
    .optional(),
  multipart_images_present: z.boolean().optional()
})
.superRefine((value, ctx) => {
  if (new Date(value.valid_from) > new Date(value.valid_until)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "The valid_from cannot be later than valid_until.",
      path: ["valid_from"]
    });
  }

  if (new Date(value.time_slot_start) > new Date(value.time_slot_end)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "The time_slot_start cannot be later than time_slot_end.",
      path: ["time_slot_start"]
    });
  }

  if (!value.image_urls && !value.image_uploads && !value.multipart_images_present) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide images via image_urls, image_uploads, or multipart files.",
      path: ["image_urls"]
    });
  }

  if (value.image_urls && value.image_uploads) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Provide only one source for images: image_urls or image_uploads.",
      path: ["image_uploads"]
    });
  }
});

export const statesQuerySchema = z.object({
  country_id: z.coerce.number().int().positive()
});

export const citiesQuerySchema = z.object({
  state_id: z.coerce.number().int().positive()
});
