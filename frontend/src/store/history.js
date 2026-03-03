const KEY = "ana_history_v1";

export function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveToHistory(item) {
  const prev = loadHistory();
  const next = [item, ...prev].slice(0, 50);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearHistory() {
  localStorage.removeItem(KEY);
}