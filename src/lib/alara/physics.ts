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
export const ICRP_ANNUAL_USV = 20000;

export interface DoseInput {
  procedure: ProcedureId;
  minutes: number;
  distance: number;
  apron: ApronId;
  thyroidGlasses: boolean;
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
  const rateAtDistance = baseRate * (D_REF / d) ** 2;
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
