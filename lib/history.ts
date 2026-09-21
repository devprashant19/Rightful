export interface HistoryRecord {
  id: string;
  title: string;
  timestamp: string;
  score: number;
  verdict: string;
  mode: "live" | "replay";
}

export function saveCaseToHistory(record: HistoryRecord) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("rightful_history");
    const history: HistoryRecord[] = raw ? JSON.parse(raw) : [];
    const filtered = history.filter((h) => h.id !== record.id);
    filtered.unshift(record);
    localStorage.setItem("rightful_history", JSON.stringify(filtered.slice(0, 10)));
  } catch (e) {
    console.warn("Storage quota exceeded or private mode active", e);
  }
}

export function getCaseHistory(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("rightful_history");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearCaseHistory() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("rightful_history");
  } catch {
    // Ignore
  }
}

