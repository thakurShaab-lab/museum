import { randomInt } from "node:crypto";

function pad2(num) {
  return String(num).padStart(2, "0");
}

function formatDatePart(date) {
  return `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}`;
}

export function generateVisitorId(now = new Date()) {
  const datePart = formatDatePart(now);
  const randomPart = randomInt(100000, 999999);
  return `VIS-${datePart}-${randomPart}`;
}
