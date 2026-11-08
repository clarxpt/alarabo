import { describe, expect, it } from "vitest";

import { CHEST_XRAY_USV, ICRP_ANNUAL_USV, PT_BACKGROUND_USV_DAY } from "@/lib/alara/physics";

// Reference values shown in "Comparações e Equivalências".
describe("Reference values for comparisons", () => {
  it("uses the 20 mSv/year limit for Trabalhadores Expostos (Dec. Lei n.º 108/2018)", () => {
    expect(ICRP_ANNUAL_USV).toBe(20000);
  });

  it("uses 0,02 mSv for a chest X-ray PA", () => {
    expect(CHEST_XRAY_USV).toBe(20);
  });

  it("uses ~3 mSv/year of natural background in Portugal", () => {
    expect(PT_BACKGROUND_USV_DAY).toBeCloseTo(3000 / 365, 3);
    expect(PT_BACKGROUND_USV_DAY).toBeCloseTo(8.22, 1);
  });
});

import { angulationFactor } from "@/lib/alara/physics";
import { describe as d2, it as i2, expect as e2 } from "vitest";
d2("C-arm angulation (Kuon 2004)", () => {
  i2("PA 0° is baseline", () => e2(angulationFactor(0, 0)).toBe(1));
  i2("LAO 100° = 10.6×", () => e2(angulationFactor(100, 0)).toBeCloseTo(10.6));
  i2("RAO 100° = 2.4×", () => e2(angulationFactor(-100, 0)).toBeCloseTo(2.4));
  i2("30° cranial/caudal = 2.5×", () => { e2(angulationFactor(0, 30)).toBeCloseTo(2.5); e2(angulationFactor(0, -30)).toBeCloseTo(2.5); });
});
