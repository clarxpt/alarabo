import type { DoseInput } from "./physics";

export interface SessionRecord extends DoseInput {
  id: string;
  at: string;
  professional: string;
  dose: number;
}

const KEY = "alara-history";

export function loadHistory(): SessionRecord[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}
export function saveRecord(r: SessionRecord) {
  localStorage.setItem(KEY, JSON.stringify([r, ...loadHistory()].slice(0, 200)));
}
export function clearHistory() {
  localStorage.removeItem(KEY);
}
