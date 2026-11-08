export type ProcedureId = "ortho" | "cardio" | "vascular" | "urs" | "pain" | "implantofix";
export type ApronId = "none" | "pb025" | "pb05";
export type ProfessionalId = "tech" | "surgeon" | "anesthetist" | "nurse";

export const PROCEDURES: Record<ProcedureId, { label: string; baseRate: number }> = {
  ortho: { label: "Ortopedia (Enclavamento Intramedular de Fémur)", baseRate: 8 },
  cardio: { label: "Cardiologia (Angiografia / Cateterismo)", baseRate: 15 },
  vascular: { label: "Cirurgia Vascular (Implantes de Stent)", baseRate: 12 },
  urs: { label: "Ureterorenoscopia Retrógrada (URS)", baseRate: 4 },
  pain: { label: "Medicina da Dor (Bloqueios Epidurais / Ramos Mediais)", baseRate: 3 },
  implantofix: { label: "Implantofix (Cateter Venoso Central)", baseRate: 2 },
};

export const APRONS: Record<ApronId, { label: string; mmPb: number }> = {
  none: { label: "Sem avental de chumbo", mmPb: 0 },
  pb025: { label: "Avental 0.25 mm Pb", mmPb: 0.25 },
  pb05: { label: "Avental 0.5 mm Pb", mmPb: 0.5 },
};

export const PROFESSIONALS: Record<ProfessionalId, { label: string; short: string }> = {
  tech: { label: "Técnico de Radiologia", short: "TEC" },
  surgeon: { label: "Cirurgião Principal", short: "CIR" },
  anesthetist: { label: "Anestesista", short: "ANE" },
  nurse: { label: "Enfermeiro", short: "ENF" },
};

/** Linear attenuation coefficient of lead (~80 kVp scatter), per mm. */
export const MU_PB = 8;
/** Fraction of source dose rate (mGy/min) reaching 1 m as scatter, converted to µSv. */
export const SCATTER_FACTOR_USV = 1; // 1 mGy/min source → 1 µSv/min scatter at 1 m (educational model)
export const D_REF = 1.0;
export const THYROID_GLASSES_FACTOR = 0.75;
/** Limite anual de Trabalhadores Expostos: 20 mSv/ano (Dec. Lei n.º 108/2018). */
export const ICRP_ANNUAL_USV = 20000;
/** Raio-X de tórax PA ≈ 0,02 mSv = 20 µSv. */
export const CHEST_XRAY_USV = 20;
/** Fundo natural em Portugal ≈ 3 mSv/ano ≈ 8,2 µSv/dia. */
export const PT_BACKGROUND_USV_DAY = 3000 / 365;

/** Scatter is higher on the X-ray tube (ampola) side and lower on the detector side. */
export const TUBE_SIDE_FACTOR = 1.5;
export const DETECTOR_SIDE_FACTOR = 0.6;
export const LATERAL_FACTOR = 1.0;
export type SideZone = "tube" | "detector" | "lateral";

/**
 * Zone relative to the patient: dy > 0 is the tube side (below the table),
 * dy < 0 the detector side (above). Near-lateral positions use 1.0.
 */
export function sideZone(dy: number, distance: number): SideZone {
  const d = Math.max(0.1, distance);
  const cos = dy / d; // 1 = fully on tube side, -1 = fully on detector side
  if (cos > 0.45) return "tube";
  if (cos < -0.45) return "detector";
  return "lateral";
}
export function sideFactor(zone: SideZone): number {
  return zone === "tube" ? TUBE_SIDE_FACTOR : zone === "detector" ? DETECTOR_SIDE_FACTOR : LATERAL_FACTOR;
}
export const SIDE_LABEL: Record<SideZone, string> = {
  tube: "Lado da ampola",
  detector: "Lado do detetor",
  lateral: "Lateral",
};

/**
 * C-arm angulation → operator scatter dose factor (relative to PA 0°/0°).
 * Source: Kuon E. et al., "Identification of less-irradiating tube angulations
 * in invasive cardiology", JACC 2004;44(7):1420-8 (doi:10.1016/j.jacc.2004.06.057).
 * Measured operator dose rose 10.6× towards LAO 100°, 2.4× towards RAO 100°,
 * and ~2.5× towards 30° cranial/caudal. Intermediate angles are linearly
 * interpolated (educational simplification).
 */
export const LAO_100_FACTOR = 10.6;
export const RAO_100_FACTOR = 2.4;
export const CC_30_FACTOR = 2.5;
export const MAX_OBLIQUE = 100;
export const MAX_CC = 30;
/** oblique: + LAO / − RAO (°); cc: + cranial / − caudal (°). */
export function angulationFactor(oblique: number, cc: number): number {
  const o = Math.max(-MAX_OBLIQUE, Math.min(MAX_OBLIQUE, oblique));
  const c = Math.min(MAX_CC, Math.abs(cc));
  const fo = 1 + ((o >= 0 ? LAO_100_FACTOR : RAO_100_FACTOR) - 1) * (Math.abs(o) / MAX_OBLIQUE);
  const fc = 1 + (CC_30_FACTOR - 1) * (c / MAX_CC);
  return fo * fc;
}
export function angulationLabel(oblique: number, cc: number): string {
  const o = oblique === 0 ? "PA 0°" : `${oblique > 0 ? "LAO" : "RAO"} ${Math.abs(oblique)}°`;
  const c = cc === 0 ? "" : ` · ${cc > 0 ? "CRA" : "CAU"} ${Math.abs(cc)}°`;
  return o + c;
}

export interface DoseInput {
  procedure: ProcedureId;
  minutes: number;
  distance: number;
  apron: ApronId;
  thyroidGlasses: boolean;
  side?: SideZone;
  oblique?: number;
  cc?: number;
}

export interface DoseResult {
  baseRate: number;
  rateAtDistance: number;
  unshielded: number;
  attenuation: number;
  dose: number;
}

export function computeDose(i: DoseInput): DoseResult {
  const baseRate = PROCEDURES[i.procedure].baseRate * SCATTER_FACTOR_USV;
  const d = Math.max(0.1, i.distance);
  const rateAtDistance = baseRate * (D_REF / d) ** 2 * sideFactor(i.side ?? "lateral") * angulationFactor(i.oblique ?? 0, i.cc ?? 0);
  const unshielded = rateAtDistance * i.minutes;
  let transmission = Math.exp(-MU_PB * APRONS[i.apron].mmPb);
  if (i.thyroidGlasses) transmission *= THYROID_GLASSES_FACTOR;
  return { baseRate, rateAtDistance, unshielded, attenuation: 1 - transmission, dose: unshielded * transmission };
}

export type RiskLevel = "safe" | "warn" | "danger";
export function riskLevel(usv: number): RiskLevel {
  if (usv < 5) return "safe";
  if (usv <= 20) return "warn";
  return "danger";
}
export const RISK_LABEL: Record<RiskLevel, string> = {
  safe: "Seguro / Baixo Risco",
  warn: "Atenção / Requer Otimização",
  danger: "Exposição Elevada",
};

export function fmt(n: number, digits = 2) {
  return n.toLocaleString("pt-PT", { maximumFractionDigits: digits, minimumFractionDigits: digits });
}
