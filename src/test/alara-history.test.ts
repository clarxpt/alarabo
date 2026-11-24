import { beforeEach, describe, expect, it } from "vitest";
import { clearHistory, loadHistory, saveRecord, type SessionRecord } from "@/lib/alara/history";
const row: SessionRecord = { id: "one", at: "2026-11-24T00:00:00.000Z", professional: "Técnico de Radiologia", procedure: "ortho", minutes: 1, distance: 1, apron: "none", thyroidGlasses: false, dose: 8, modelVersion: 2 };
describe("Scenario history", () => {
  beforeEach(() => localStorage.clear());
  it("round trips a record", () => { expect(saveRecord(row)).toBe(true); expect(loadHistory()).toEqual([row]); expect(clearHistory()).toBe(true); expect(loadHistory()).toEqual([]); });
  it("rejects invalid stored records", () => { localStorage.setItem("alara-history", JSON.stringify([null, {...row, procedure: "missing"}, {...row, dose: -1}, row])); expect(loadHistory()).toEqual([row]); });
  it("handles malformed data", () => { localStorage.setItem("alara-history", "{"); expect(loadHistory()).toEqual([]); });
});
