import crypto from "node:crypto";
import { hashApiKey } from "../services/cryptoService.js";

const apiKey = crypto.randomBytes(32).toString("hex");
const keyHash = hashApiKey(apiKey);

// eslint-disable-next-line no-console
console.log("Plain API key (store once):", apiKey);
// eslint-disable-next-line no-console
console.log("SHA-256 hash (store in DB):", keyHash);
