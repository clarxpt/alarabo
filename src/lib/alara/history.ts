import { APRONS, PROCEDURES, type DoseInput } from "./physics";

export interface SessionRecord extends DoseInput {
  id: string;
  at: string;
  professional: string;
  dose: number;
  modelVersion?: number;
}

const KEY = "alara-history";

export function loadHistory(): SessionRecord[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.filter((r): r is SessionRecord => r && typeof r === "object" && typeof r.id === "string" && typeof r.at === "string" && Number.isFinite(Date.parse(r.at)) && typeof r.professional === "string" && Object.prototype.hasOwnProperty.call(PROCEDURES, r.procedure) && Object.prototype.hasOwnProperty.call(APRONS, r.apron) && Number.isFinite(r.minutes) && r.minutes >= 0 && Number.isFinite(r.distance) && r.distance >= 0 && Number.isFinite(r.dose) && r.dose >= 0 && typeof r.thyroidGlasses === "boolean").slice(0, 200);
  } catch {
    return [];
  }
}
export function saveRecord(r: SessionRecord): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify([r, ...loadHistory()].slice(0, 200)));
    return true;
  } catch { return false; }
}
export function clearHistory(): boolean {
  try { localStorage.removeItem(KEY); return true; } catch { return false; }
}
