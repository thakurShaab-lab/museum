import crypto from "node:crypto";

export function hashApiKey(plainKey) {
  return crypto.createHash("sha256").update(plainKey, "utf8").digest("hex");
}

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const LEGACY_SALT = "anubhava-mantapa-salt";

function scrypt(password, salt) {
  return crypto.scryptSync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P
  });
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const digest = scrypt(password, salt).toString("hex");
  return `scrypt$v1$${salt}$${digest}`;
}

export function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") {
    return { isValid: false, needsRehash: false };
  }

  // Legacy hashes are plain hex output with a fixed salt.
  if (!storedHash.startsWith("scrypt$")) {
    const legacyDigest = scrypt(password, LEGACY_SALT);
    const incoming = Buffer.from(storedHash, "hex");
    if (incoming.length !== legacyDigest.length) {
      return { isValid: false, needsRehash: false };
    }
    const isValid = crypto.timingSafeEqual(incoming, legacyDigest);
    return { isValid, needsRehash: isValid };
  }

  const [algorithm, version, salt, digestHex] = storedHash.split("$");
  if (algorithm !== "scrypt" || version !== "v1" || !salt || !digestHex) {
    return { isValid: false, needsRehash: false };
  }

  const digest = scrypt(password, salt);
  const incoming = Buffer.from(digestHex, "hex");
  if (incoming.length !== digest.length) {
    return { isValid: false, needsRehash: false };
  }

  const isValid = crypto.timingSafeEqual(incoming, digest);
  return { isValid, needsRehash: false };
}

