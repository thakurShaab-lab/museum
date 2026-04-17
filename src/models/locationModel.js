import { and, asc, eq } from "drizzle-orm"
import { db } from "../db/client.js"
import { cities, countries, states } from "../schemas/locations.js"

export async function getActiveCountries() {
  return db
    .select({
      country_id: countries.id,
      country_name: countries.name,
      country_code: countries.isoCode
    })
    .from(countries)
    .where(eq(countries.status, "ACTIVE"))
    .orderBy(asc(countries.name))
}

export async function getActiveStatesByCountry(countryId) {
  return db
    .select({
      state_id: states.id,
      state_name: states.name,
      state_code: states.code,
      country_id: states.countryId
    })
    .from(states)
    .where(and(eq(states.countryId, countryId), eq(states.status, "ACTIVE")))
    .orderBy(asc(states.name))
}

export async function getActiveCitiesByState(stateId) {
  return db
    .select({
      city_id: cities.id,
      city_name: cities.name,
      city_code: cities.code,
      state_id: cities.stateId
    })
    .from(cities)
    .where(and(eq(cities.stateId, stateId), eq(cities.status, "ACTIVE")))
    .orderBy(asc(cities.name))
}

export async function getLocationHierarchy(countryId, stateId, cityId) {
  const [country] = await db
    .select({ id: countries.id, name: countries.name })
    .from(countries)
    .where(and(eq(countries.id, countryId), eq(countries.status, "ACTIVE")))
    .limit(1)
  if (!country) return null

  const [state] = await db
    .select({ id: states.id, name: states.name, countryId: states.countryId })
    .from(states)
    .where(and(eq(states.id, stateId), eq(states.status, "ACTIVE")))
    .limit(1)
  if (!state || state.countryId !== country.id) return null

  const [city] = await db
    .select({ id: cities.id, name: cities.name, stateId: cities.stateId })
    .from(cities)
    .where(and(eq(cities.id, cityId), eq(cities.status, "ACTIVE")))
    .limit(1)
  if (!city || city.stateId !== state.id) return null

  return {
    country,
    state,
    city
  }
}
