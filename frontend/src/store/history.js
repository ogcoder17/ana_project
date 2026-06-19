const KEY_PREFIX = "ana_history_user_v1:";

function safeJsonParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function historyKeyForUser(userId) {
  return `${KEY_PREFIX}${userId}`;
}

export function loadHistory(userId) {
  if (!userId) return [];
  return safeJsonParse(localStorage.getItem(historyKeyForUser(userId)), []);
}

export function saveToHistory(userId, item) {
  if (!userId) return [];
  const prev = loadHistory(userId);
  const next = [item, ...prev].slice(0, 50);
  localStorage.setItem(historyKeyForUser(userId), JSON.stringify(next));
  return next;
}

export function clearHistory(userId) {
  if (!userId) return;
  localStorage.removeItem(historyKeyForUser(userId));
}