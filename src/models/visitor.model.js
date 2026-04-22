import { eq, sql } from "drizzle-orm"
import { db } from "../config/db.js"
import { visitors } from "../db/schema/visitors.js"

export async function visitorExists(customerId) {
  const rows = await db
    .select({
      customers_id: visitors.customers_id,
      status: visitors.status,
      guest_type: visitors.guest_type,
    })
    .from(visitors)
    .where(eq(visitors.customers_id, customerId))
    .limit(1)
  return rows[0] ?? null
}

export async function findVisitorById(customerId) {
  const rows = await db
    .select()
    .from(visitors)
    .where(eq(visitors.customers_id, customerId))
    .limit(1)
  return rows[0] ?? null
}

export async function findAllVisitors(limit, offset) {
  const [rows, totalRow] = await Promise.all([
    db
      .select()
      .from(visitors)
      .orderBy(visitors.customers_id)
      .limit(limit)
      .offset(offset),
    db.select({ total: sql`count(*)`.mapWith(Number) }).from(visitors),
  ])
  return { rows, total: totalRow[0]?.total ?? 0 }
}

export async function findVisitorImages(customerId) {
  const rows = await db
    .select({
      image1: visitors.image1,
      image2: visitors.image2,
      image3: visitors.image3,
    })
    .from(visitors)
    .where(eq(visitors.customers_id, customerId))
    .limit(1)
  return rows[0] ?? null
}
