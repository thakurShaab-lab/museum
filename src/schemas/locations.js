import { bigint, index, mysqlTable, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const countries = mysqlTable(
  "countries",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    name: varchar("name", { length: 120 }).notNull(),
    isoCode: varchar("iso_code", { length: 10 }),
    status: varchar("status", { length: 16 }).notNull().default("ACTIVE")
  },
  (table) => [
    uniqueIndex("uk_countries_name").on(table.name),
    index("idx_countries_status").on(table.status)
  ]
);

export const states = mysqlTable(
  "states",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    countryId: bigint("country_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => countries.id),
    name: varchar("name", { length: 120 }).notNull(),
    code: varchar("code", { length: 20 }),
    status: varchar("status", { length: 16 }).notNull().default("ACTIVE")
  },
  (table) => [
    index("idx_states_country_id").on(table.countryId),
    uniqueIndex("uk_states_country_name").on(table.countryId, table.name)
  ]
);

export const cities = mysqlTable(
  "cities",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    stateId: bigint("state_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => states.id),
    name: varchar("name", { length: 120 }).notNull(),
    code: varchar("code", { length: 20 }),
    status: varchar("status", { length: 16 }).notNull().default("ACTIVE")
  },
  (table) => [
    index("idx_cities_state_id").on(table.stateId),
    uniqueIndex("uk_cities_state_name").on(table.stateId, table.name)
  ]
);
