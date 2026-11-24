import { describe, expect, it } from "vitest";
import { computeDose, sideZone, riskLevel, type DoseInput } from "@/lib/alara/physics";
const base: DoseInput = { procedure: "ortho", minutes: 1, distance: 1, apron: "none", thyroidGlasses: false };
describe("Illustrative dose model", () => {
  it("scales with time and inverse square distance", () => {
    expect(computeDose(base).dose).toBe(8);
    expect(computeDose({...base, minutes: 2}).dose).toBe(16);
    expect(computeDose({...base, distance: 2}).dose).toBe(2);
  });
  it("applies illustrative apron transmission", () => {
    expect(computeDose({...base, apron: "pb025"}).dose).toBeCloseTo(8*Math.exp(-2));
    expect(computeDose({...base, apron: "pb05"}).dose).toBeCloseTo(8*Math.exp(-4));
  });
  it("does not assign a whole-body reduction to local PPE", () => {
    expect(computeDose({...base, thyroidGlasses: true}).dose).toBe(computeDose(base).dose);
  });
  it("uses a minimum distance and rejects invalid inputs", () => {
    expect(computeDose({...base, distance: 0}).dose).toBe(32);
    expect(() => computeDose({...base, minutes: -1})).toThrow();
    expect(() => computeDose({...base, distance: NaN})).toThrow();
  });
  it("aligns the side classification with the schematic", () => {
    expect(sideZone(0, 60)).toBe("tube");
    expect(sideZone(0, -60)).toBe("detector");
    expect(sideZone(60, 0, 100)).toBe("tube");
    expect(sideZone(-60, 0, 100)).toBe("detector");
  });
  it("keeps illustrative display thresholds", () => {
    expect(riskLevel(4.99)).toBe("safe");
    expect(riskLevel(5)).toBe("warn");
    expect(riskLevel(20)).toBe("warn");
    expect(riskLevel(20.01)).toBe("danger");
  });
});
