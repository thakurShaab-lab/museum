import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const languages = pgTable("languages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  code: varchar("code", { length: 10 }),
});