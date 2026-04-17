const cache = new Map();
const DEFAULT_TTL_MS = 15_000;

function keyOf(startDate, endDate, page, limit) {
  return `${startDate}|${endDate}|${page}|${limit}`;
}

export function getCachedVisitors(startDate, endDate, page, limit) {
  const key = keyOf(startDate, endDate, page, limit);
  const item = cache.get(key);
  if (!item) return null;

  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

export function setCachedVisitors(startDate, endDate, page, limit, value) {
  const key = keyOf(startDate, endDate, page, limit);
  cache.set(key, {
    value,
    expiresAt: Date.now() + DEFAULT_TTL_MS
  });
}

export function clearVisitorListCache() {
  cache.clear();
}
