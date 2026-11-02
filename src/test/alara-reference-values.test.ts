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
