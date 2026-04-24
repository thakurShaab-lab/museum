import { mysqlTable, int, varchar, datetime, mysqlEnum } from "drizzle-orm/mysql-core";

export const grievances = mysqlTable("wl_grievances", {
  id: int("id").autoincrement().notNull().primaryKey(),

  grievance_id: int("grievance_id").notNull().default(0),

  visitor_id: int("visitor_id").notNull().default(0),

  assigned_from: int("assigned_from").notNull().default(0),

  assigned_to: int("assigned_to").notNull().default(0),

  audio_file: varchar("audio_file", { length: 255 }).default(null),

  created_at: datetime("created_at").default(null),

  status: mysqlEnum("status", ['0', '1', '2', '3', '4'])
    .notNull()
    .default('0'),
})