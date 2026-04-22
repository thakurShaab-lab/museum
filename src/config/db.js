import mysql from "mysql2/promise"
import { drizzle } from "drizzle-orm/mysql2"
import { env } from "./env.js"
import * as schema from "../db/schema/index.js"
import { logger } from "../utils/logger.js"

export const pool = mysql.createPool({
  host: env.MYSQL_HOST,
  port: env.MYSQL_PORT,
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: env.MYSQL_CONNECTION_LIMIT,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10_000,
  namedPlaceholders: true,
  ssl: env.MYSQL_SSL === "true" ? { rejectUnauthorized: true } : undefined,
})

export const db = drizzle(pool, { schema, mode: "default" })

export async function pingDatabase() {
  const conn = await pool.getConnection()
  try {
    await conn.ping()
    logger.info({ db: env.MYSQL_DATABASE, host: env.MYSQL_HOST }, "MySQL connected")
  } finally {
    conn.release()
  }
}

export async function closeDatabase() {
  await pool.end()
}