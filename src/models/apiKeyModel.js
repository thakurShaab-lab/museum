import { and, eq, gt, isNull, or } from "drizzle-orm";
import { db } from "../db/client.js";
import { apiKeys } from "../schemas/apiKeys.js";
import { toUtcIso } from "../utils/time.js";

export async function findActiveApiKeyByHash(keyHash) {
  const now = toUtcIso().slice(0, 19).replace("T", " ");
  const rows = await db
    .select()
    .from(apiKeys)
    .where(
      and(
        eq(apiKeys.keyHash, keyHash),
        eq(apiKeys.status, "ACTIVE"),
        or(isNull(apiKeys.expiresAt), gt(apiKeys.expiresAt, now))
      )
    )
    .limit(1);

  return rows[0] || null;
}
