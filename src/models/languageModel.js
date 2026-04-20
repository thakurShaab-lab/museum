import { db } from "../db/client.js";
import { eq } from "drizzle-orm";
import { languages } from "../schemas/language.js";

export const getLanguages = () => db.select().from(languages);

export const getLanguageById = (id) =>
  db.select().from(languages).where(eq(languages.id, id));