#!/usr/bin/env node
/**
 * Generate a JWT for a given user id and email.
 *
 * Usage:
 *   pnpm --filter @workspace/api-server run generate-token -- --id=42 --email=alice@example.com [--expires=7d]
 *   node src/scripts/generate-token.js --id=42 --email=alice@example.com
 */
import { generateToken } from "../utils/jwt.js"

function parseArgs(argv) {
  const out = {}
  for (const arg of argv.slice(2)) {
    const m = arg.match(/^--([^=]+)=(.*)$/)
    if (m) out[m[1]] = m[2]
  }
  return out
}

const args = parseArgs(process.argv)
const id = args.id || process.env.GEN_TOKEN_ID
const email = args.email || process.env.GEN_TOKEN_EMAIL
const expiresIn = args.expires || process.env.GEN_TOKEN_EXPIRES

if (!id || !email) {
  console.error("Error: --id and --email are required")
  console.error("Example: node src/scripts/generate-token.js --id=1 --email=user@example.com")
  process.exit(1)
}

const token = generateToken({ id, email }, expiresIn ? { expiresIn } : undefined)

console.log("\nJWT generated successfully\n")
console.log(token)
console.log("\nUse it as: Authorization: Bearer <token>\n")