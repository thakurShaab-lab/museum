export function toUtcIso(date = new Date()) {
  return new Date(date).toISOString();
}

export function mysqlDateTimeNow() {
  return toUtcIso().slice(0, 19).replace("T", " ");
}

