import { bigint, index, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core"

export const statusEnum = mysqlEnum("status", ["ACTIVE", "INACTIVE"])

export const countries = mysqlTable(
  "countries",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),

    name: varchar("name", { length: 120 }).notNull(),

    isoCode: varchar("iso_code", { length: 10 }),

    status: statusEnum.notNull().default("ACTIVE"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .onUpdateNow()
      .notNull(),

    deletedAt: timestamp("deleted_at")
  },
  (table) => [
    uniqueIndex("uk_countries_name").on(table.name),

    uniqueIndex("uk_countries_iso_code").on(table.isoCode),

    index("idx_countries_status").on(table.status)
  ]
)

export const states = mysqlTable(
  "states",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),

    countryId: bigint("country_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => countries.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 120 }).notNull(),

    code: varchar("code", { length: 20 }),

    status: statusEnum.notNull().default("ACTIVE"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .onUpdateNow()
      .notNull(),

    deletedAt: timestamp("deleted_at")
  },
  (table) => [
    index("idx_states_country_id").on(table.countryId),

    uniqueIndex("uk_states_country_name").on(table.countryId, table.name),

    uniqueIndex("uk_states_code").on(table.code),

    index("idx_states_country_status").on(table.countryId, table.status)
  ]
)

export const cities = mysqlTable(
  "cities",
  {
    id: bigint("id", { mode: "number", unsigned: true })
      .autoincrement()
      .primaryKey(),

    stateId: bigint("state_id", { mode: "number", unsigned: true })
      .notNull()
      .references(() => states.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 120 }).notNull(),

    code: varchar("code", { length: 20 }),

    status: statusEnum.notNull().default("ACTIVE"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .onUpdateNow()
      .notNull(),

    deletedAt: timestamp("deleted_at")
  },
  (table) => [
    index("idx_cities_state_id").on(table.stateId),

    uniqueIndex("uk_cities_state_name").on(table.stateId, table.name),

    uniqueIndex("uk_cities_code").on(table.code),

    index("idx_cities_state_status").on(table.stateId, table.status)
  ]
)