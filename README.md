Anubhava Mantapa API Integration

Secure and optimized external registration APIs built using Node.js, Express, MySQL, and Drizzle ORM.

Key Features





Strict API key authentication via x-api-key header (never query params).



HTTPS-only enforcement support.



Global rate limiting configured for high-throughput gate validations.



Strong input validation using Zod.



SQL injection resistance through Drizzle query builder and strict schema constraints.



Layered architecture: schemas -> models -> controllers -> routes.



Consistent error contract with UTC timestamps.

Setup





Copy .env.example to .env and update values.



Install dependencies:





npm install



Generate and run migrations:





npm run db:generate



npm run db:migrate



Start server:





npm run dev

API Endpoints





GET /api/v1/auth/configuration



GET /api/v1/locations/countries



GET /api/v1/locations/states?country_id=<id>



GET /api/v1/locations/cities?state_id=<id>



GET /api/v1/visitors/:visitor_id/exists



GET /api/v1/visitors/:visitor_id/id-card



GET /api/v1/visitors/:visitor_id



GET /api/v1/visitors?start_date=...&end_date=...&page=1&limit=100



GET /api/v1/visitors/:visitor_id/images/:image_index



POST /api/v1/visitors/register

Form Data Changes Applied





Added preferred_name.



Added guest_type with strict enum: GENERAL | VIP | VVIP.



Added gender and language with allowed values.



Added image_urls array of exactly 3 photos.



Added image_uploads support with base64 (jpeg|png|webp) and max 2MB per image.



Added multer multipart upload support using images field (exactly 3 files, max 2MB each, jpeg|png|webp).



Added package_details, time_slot_start, and time_slot_end.



Added normalized location hierarchy tables: countries -> states -> cities.



Visitor registration now requires country_id, state_id, and city_id and validates hierarchy from DB.



Added Aadhaar verification flow fields: aadhaar_name and aadhaar_dob.



Added Visitor ID format VIS-YYYYMMDD-######.



Added QR payload generation with visitor_id, name, ticket/package, time slot, and verification data.



Removed PAN upload field.



Replaced Aadhaar image upload with aadhaar_number field.

Authentication Modes





AUTH_MODE=api-key (default): validate x-api-key



AUTH_MODE=token: validate Authorization: Bearer <token>



AUTH_MODE=both: accept either API key or bearer token



NEXT_BEARER_TOKEN + NEXT_BEARER_TOKEN_EXPIRES_AT: rotation hook for seamless token rollover

Security Hardening





Passwords are stored using versioned scrypt hashes with per-user random salts.



Legacy password hashes are supported through migration-aware verification helpers.



Bearer token validation uses timing-safe checks and supports primary/next token rotation windows.



CORS allowlist is configurable using CORS_ALLOWED_ORIGINS (comma separated).



Structured audit logs are enabled by default and can be toggled via ENABLE_AUDIT_LOGS.

Testing





Run endpoint contract tests:





npm test

QR Code Payload

The QR payload includes:





visitor_unique_id



visitor_name



ticket_package_details



ticket_type



date_time_slot.slot_start / date_time_slot.slot_end



verification.registration_status, valid_from, and valid_until

