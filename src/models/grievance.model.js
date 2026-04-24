import { eq, sql, desc } from "drizzle-orm"
import { db } from "../config/db.js"
import { grievances } from "../db/schema/grievances.js"
import { visitors } from "../db/schema/visitors.js"

/**
 * Create a new grievance record.
 * No schema changes — all existing columns used as-is.
 * grievance_id is back-filled to match the auto-increment id after insert.
 */
export async function createGrievance({ visitor_id, audio_file }) {
  const [result] = await db.insert(grievances).values({
    visitor_id,
    audio_file,
    status: "0",   // 0 = Pending
    assigned_from: 0,
    assigned_to: 0,
    created_at: new Date(),
  })

  const insertId = result.insertId

  // Back-fill grievance_id = id (readable GRV reference used at API layer)
  await db
    .update(grievances)
    .set({ grievance_id: insertId })
    .where(eq(grievances.id, insertId))

  return insertId
}

/**
 * Fetch a single grievance with joined visitor details.
 */
export async function findGrievanceById(id) {
  const rows = await db
    .select({
      id: grievances.id,
      grievance_id: grievances.grievance_id,
      visitor_id: grievances.visitor_id,
      audio_file: grievances.audio_file,
      status: grievances.status,
      created_at: grievances.created_at,
      assigned_from: grievances.assigned_from,
      assigned_to: grievances.assigned_to,
      visitor_name: sql`CONCAT(${visitors.first_name}, ' ', ${visitors.last_name})`,
      visitor_email: visitors.email,
      visitor_phone: visitors.mobile_number,
      guest_type: visitors.guest_type,
    })
    .from(grievances)
    .leftJoin(visitors, eq(grievances.visitor_id, visitors.customers_id))
    .where(eq(grievances.id, id))
    .limit(1)

  return rows[0] ?? null
}

/**
 * List grievances with pagination, joined to visitor details.
 */
export async function findAllGrievances(limit, offset) {
  const [rows, totalRow] = await Promise.all([
    db
      .select({
        id: grievances.id,
        grievance_id: grievances.grievance_id,
        visitor_id: grievances.visitor_id,
        audio_file: grievances.audio_file,
        status: grievances.status,
        created_at: grievances.created_at,
        assigned_from: grievances.assigned_from,
        assigned_to: grievances.assigned_to,
        visitor_name: sql`CONCAT(${visitors.first_name}, ' ', ${visitors.last_name})`,
        visitor_email: visitors.email,
        visitor_phone: visitors.mobile_number,
        guest_type: visitors.guest_type,
      })
      .from(grievances)
      .leftJoin(visitors, eq(grievances.visitor_id, visitors.customers_id))
      .orderBy(desc(grievances.created_at))
      .limit(limit)
      .offset(offset),
    db.select({ total: sql`count(*)`.mapWith(Number) }).from(grievances),
  ])

  return { rows, total: totalRow[0]?.total ?? 0 }
}

/**
 * Resolve a visitor_id from the kiosk-supplied contact fields
 * (email preferred → phone → name as final fallback).
 * Returns the customers_id of the first matching visitor, or null.
 */
export async function findVisitorByContact({ name, phone, email }) {
  // 1. Email match
  if (email) {
    const rows = await db
      .select({ customers_id: visitors.customers_id })
      .from(visitors)
      .where(eq(visitors.email, email))
      .limit(1)
    if (rows[0]) return rows[0].customers_id
  }

  // 2. Mobile number match
  if (phone) {
    const rows = await db
      .select({ customers_id: visitors.customers_id })
      .from(visitors)
      .where(eq(visitors.mobile_number, phone))
      .limit(1)
    if (rows[0]) return rows[0].customers_id
  }

  // 3. Name split match (last resort when no email/phone)
  if (name && !email && !phone) {
    const parts = name.trim().split(/\s+/)
    const firstName = parts[0] ?? ""
    const lastName = parts.slice(1).join(" ")
    const rows = await db
      .select({ customers_id: visitors.customers_id })
      .from(visitors)
      .where(
        sql`${visitors.first_name} = ${firstName} AND ${visitors.last_name} = ${lastName}`,
      )
      .limit(1)
    if (rows[0]) return rows[0].customers_id
  }

  return null
}
