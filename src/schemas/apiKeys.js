import { datetime, index, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const apiKeys = mysqlTable(
  "api_keys",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    keyHash: varchar("key_hash", { length: 128 }).notNull().unique(),
    label: varchar("label", { length: 120 }).notNull(),
    permissions: varchar("permissions", { length: 500 }).notNull(),
    status: varchar("status", { length: 16 }).notNull().default("ACTIVE"),
    expiresAt: datetime("expires_at", { mode: "string" }),
    createdAt: datetime("created_at", { mode: "string" }).notNull()
  },
  (table) => [index("idx_api_keys_status").on(table.status)]
);
