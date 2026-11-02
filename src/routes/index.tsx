import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Ruler, Shield, Stethoscope, Lightbulb, Scale, Save, X, Check } from "lucide-react";
import { AppShell } from "@/components/alara/AppShell";
import { OperatingRoom, distanceOf, placeAt, SOURCE, type Pos } from "@/components/alara/OperatingRoom";
import {
  APRONS, PROCEDURES, PROFESSIONALS, RISK_LABEL, ICRP_ANNUAL_USV, SIDE_LABEL, computeDose, fmt, riskLevel, sideZone,
  type ApronId, type ProcedureId, type ProfessionalId,
} from "@/lib/alara/physics";
import { saveRecord } from "@/lib/alara/history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ALARA — Simulador de Proteção Radiológica no Bloco Operatório" },
      { name: "description", content: "Simule tempo, distância e blindagem e veja a dose efetiva estimada em tempo real no bloco operatório." },
      { property: "og:title", content: "ALARA — Simulador de Proteção Radiológica" },
      { property: "og:description", content: "Simulador educativo de dose de radiação dispersa em fluoroscopia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Simulator,
});

const initialPos: Record<ProfessionalId, Pos> = {
  tech: { x: SOURCE.x - 90, y: SOURCE.y + 78 },
  surgeon: { x: SOURCE.x, y: SOURCE.y + 60 },
  anesthetist: { x: SOURCE.x - 120, y: SOURCE.y - 42 },
  nurse: { x: SOURCE.x + 90, y: SOURCE.y - 78 },
};

const riskText = { safe: "text-safe", warn: "text-warn", danger: "text-danger" };
const riskBg = { safe: "bg-safe", warn: "bg-warn", danger: "bg-danger" };
const CHEST_XRAY_USV = 20;
const PT_BACKGROUND_USV_DAY = 3000 / 365;

function Simulator() {
  const [procedure, setProcedure] = useState<ProcedureId>("pain");
  const [minutes, setMinutes] = useState(2);
  const allIds = Object.keys(PROFESSIONALS) as ProfessionalId[];
  const [aprons, setAprons] = useState<Record<ProfessionalId, ApronId>>(() => Object.fromEntries(allIds.map((i) => [i, "none"])) as Record<ProfessionalId, ApronId>);
  const [tgs, setTgs] = useState<Record<ProfessionalId, boolean>>(() => Object.fromEntries(allIds.map((i) => [i, false])) as Record<ProfessionalId, boolean>);
  const [positions, setPositions] = useState(initialPos);
  const [selected, setSelected] = useState<ProfessionalId>("tech");
  const [showIcrp, setShowIcrp] = useState(false);
  const [saved, setSaved] = useState(false);

  const apron = aprons[selected];
  const thyroidGlasses = tgs[selected];
  const setApron = (a: ApronId) => setAprons((s) => ({ ...s, [selected]: a }));
  const setTG = (v: boolean) => setTgs((s) => ({ ...s, [selected]: v }));
  const distance = distanceOf(positions[selected]);
  const setDistance = (m: number) =>
    setPositions((p) => ({ ...p, [selected]: placeAt(p[selected], m) }));

  const doses = useMemo(() => {
    const out = {} as Record<ProfessionalId, number>;
    (Object.keys(PROFESSIONALS) as ProfessionalId[]).forEach((id) => {
      const d = distanceOf(positions[id]);
      const side = sideZone(positions[id].y - SOURCE.y, d);
      out[id] = computeDose({ procedure, minutes, apron: aprons[id], thyroidGlasses: tgs[id], distance: d, side }).dose;
    });
    return out;
  }, [procedure, minutes, aprons, tgs, positions]);

  const side = sideZone(positions[selected].y - SOURCE.y, distance);
  const result = computeDose({ procedure, minutes, apron, thyroidGlasses, distance, side });
  const level = riskLevel(result.dose);

  // Insight tracking: compare against last "committed" state
  const prev = useRef({ sel: selected, distance, minutes, apron, thyroidGlasses, procedure, dose: result.dose });
  const [insight, setInsight] = useState<string>("Ajuste os parâmetros ou arraste os profissionais para ver o impacto na dose.");
  useEffect(() => {
    const t = setTimeout(() => {
      const p = prev.current;
      const d = result.dose;
      if (p.sel !== selected) { prev.current = { sel: selected, distance, minutes, apron, thyroidGlasses, procedure, dose: d }; return; }
      if (Math.abs(d - p.dose) < 1e-6) return;
      const pct = Math.abs((1 - d / p.dose) * 100);
      const dir = d < p.dose ? "reduziu" : "aumentou";
      let msg = "";
      if (Math.abs(p.distance - distance) > 0.05) {
        msg = `Mudar a distância de ${p.distance.toFixed(1)} m para ${distance.toFixed(1)} m ${dir} a sua dose em ${pct.toFixed(0)}% (lei do inverso do quadrado).`;
        if (d < p.dose && pct > 85) msg += " Mais eficaz do que apenas mudar o avental!";
      } else if (p.minutes !== minutes) {
        msg = `Alterar o tempo de ${p.minutes.toFixed(1)} para ${minutes.toFixed(1)} min ${dir} a dose em ${pct.toFixed(0)}%. A dose é diretamente proporcional ao tempo.`;
      } else if (p.apron !== apron || p.thyroidGlasses !== thyroidGlasses) {
        msg = `A alteração da blindagem ${dir} a dose em ${pct.toFixed(0)}%. Atenuação total atual: ${(result.attenuation * 100).toFixed(1)}%.`;
      } else if (p.procedure !== procedure) {
        msg = `O procedimento selecionado tem taxa de dose base de ${PROCEDURES[procedure].baseRate} mGy/min — a dose ${dir} ${pct.toFixed(0)}%.`;
      }
      if (msg) setInsight(msg);
      prev.current = { sel: selected, distance, minutes, apron, thyroidGlasses, procedure, dose: d };
    }, 450);
    return () => clearTimeout(t);
  }, [distance, minutes, apron, thyroidGlasses, procedure, result.dose, result.attenuation, selected]);

  const save = () => {
    saveRecord({
      id: crypto.randomUUID(), at: new Date().toISOString(), professional: PROFESSIONALS[selected].label,
      procedure, minutes, apron, thyroidGlasses, distance, dose: result.dose,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const gaugePct = Math.min(100, (result.dose / 40) * 100);
  const procsPerYear = result.dose > 0 ? ICRP_ANNUAL_USV / result.dose : Infinity;

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-base font-semibold">Planta do Bloco Operatório</h1>
            <span className="text-xs text-muted-foreground">Arraste os profissionais</span>
          </div>
          <OperatingRoom
            positions={positions}
            doses={doses}
            selected={selected}
            intensity={Math.min(1, (PROCEDURES[procedure].baseRate / 15) * Math.min(1, minutes / 4))}
            onSelect={setSelected}
            onMove={(id, p) => setPositions((s) => ({ ...s, [id]: p }))}
          />
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(PROFESSIONALS) as ProfessionalId[]).map((id) => (
              <button
                key={id}
                onClick={() => setSelected(id)}
                className={`rounded-md border p-2 text-left text-xs transition ${id === selected ? "border-primary bg-accent" : "hover:bg-muted"}`}
              >
                <div className="font-medium">{PROFESSIONALS[id].label}</div>
                <div className="text-[10px] text-muted-foreground">{APRONS[aprons[id]].mmPb ? `${APRONS[aprons[id]].mmPb} mm Pb` : "Sem avental"}{tgs[id] ? " + tiroide" : ""}</div>
                <div className={`font-mono ${riskText[riskLevel(doses[id])]}`}>{fmt(doses[id])} µSv</div>
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="panel p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Dose efetiva estimada · {PROFESSIONALS[selected].label}</div>
            <div className="mt-1 flex items-end gap-2">
              <span className={`font-mono text-5xl font-semibold transition-colors ${riskText[level]}`}>{fmt(result.dose)}</span>
              <span className="mb-1 text-lg text-muted-foreground">µSv</span>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div className={`h-full rounded-full transition-all duration-500 ${riskBg[level]}`} style={{ width: `${gaugePct}%` }} />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>0</span><span>5</span><span>20</span><span>40+ µSv</span>
            </div>
            <div className={`mt-3 text-sm font-medium ${riskText[level]}`}>● {RISK_LABEL[level]}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Posição: <span className="font-medium text-foreground">{SIDE_LABEL[side]}</span>
              {side === "tube" && " — a dispersão é ~1,5× maior do lado da ampola."}
              {side === "detector" && " — a dispersão é ~40% menor do lado do detetor."}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <Stat label="Taxa a 1 m" value={`${fmt(result.baseRate, 1)} µSv/min`} />
              <Stat label="Sem blindagem" value={`${fmt(result.unshielded, 1)} µSv`} />
              <Stat label="Atenuação" value={`${(result.attenuation * 100).toFixed(1)}%`} />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowIcrp(true)} className="flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
                <Scale className="h-4 w-4" /> Comparações e Equivalências
              </button>
              <button onClick={save} className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90">
                {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />} {saved ? "Guardado" : "Registar"}
              </button>
            </div>
          </div>

          <div className="panel flex gap-3 p-4">
            <Lightbulb className="h-5 w-5 shrink-0 text-warn" />
            <p key={insight} className="text-sm animate-in fade-in">{insight}</p>
          </div>

          <div className="panel space-y-5 p-5">
            <Field icon={Stethoscope} label="Procedimento de referência">
              <select value={procedure} onChange={(e) => setProcedure(e.target.value as ProcedureId)} className="w-full rounded-md border bg-card px-3 py-2 text-sm">
                {Object.entries(PROCEDURES).map(([k, v]) => <option key={k} value={k}>{v.label} — {v.baseRate} mGy/min</option>)}
              </select>
            </Field>
            <Field icon={Clock} label="Tempo de fluoroscopia" value={`${minutes.toFixed(1)} min`}>
              <input type="range" min={0.1} max={10} step={0.1} value={minutes} onChange={(e) => setMinutes(+e.target.value)} className="w-full" />
            </Field>
            <Field icon={Ruler} label={`Distância à fonte (${PROFESSIONALS[selected].short})`} value={`${distance.toFixed(2)} m`}>
              <input type="range" min={0.5} max={5} step={0.05} value={distance} onChange={(e) => setDistance(+e.target.value)} className="w-full" />
            </Field>
            <Field icon={Shield} label={`Blindagem / EPIs (${PROFESSIONALS[selected].short})`}>
              <div className="grid gap-2">
                {(Object.keys(APRONS) as ApronId[]).map((k) => (
                  <label key={k} className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${apron === k ? "border-primary bg-accent" : ""}`}>
                    <input type="radio" checked={apron === k} onChange={() => setApron(k)} className="accent-primary" />
                    {APRONS[k].label}
                    <span className="ml-auto font-mono text-xs text-muted-foreground">{((1 - Math.exp(-8 * APRONS[k].mmPb)) * 100).toFixed(0)}%</span>
                  </label>
                ))}
                <label className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm ${thyroidGlasses ? "border-primary bg-accent" : ""}`}>
                  <input type="checkbox" checked={thyroidGlasses} onChange={(e) => setTG(e.target.checked)} className="accent-primary" />
                  Protetor de tiroide + óculos plumbo-vidro
                  <span className="ml-auto font-mono text-xs text-muted-foreground">+25%</span>
                </label>
              </div>
            </Field>
          </div>
        </section>
      </div>

      {showIcrp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/60 p-4 animate-in fade-in" onClick={() => setShowIcrp(false)}>
          <div className="panel w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Comparações e Equivalências</h2>
              <button onClick={() => setShowIcrp(false)} aria-label="Fechar"><X className="h-4 w-4" /></button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">Dose desta simulação ({PROFESSIONALS[selected].label}): <b className="font-mono text-foreground">{fmt(result.dose)} µSv</b></p>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <div className="font-medium">1. Limite anual ICRP (20 mSv/ano)</div>
                <Row k="Fração do limite anual" v={`${((result.dose / ICRP_ANNUAL_USV) * 100).toFixed(3)}%`} />
                <Row k="Procedimentos até ao limite" v={Number.isFinite(procsPerYear) ? Math.floor(procsPerYear).toLocaleString("pt-PT") : "∞"} />
              </div>
              <div>
                <div className="font-medium">2. Raio-X de Tórax (PA ≈ 20 µSv)</div>
                <Row k="Equivalente a" v={`${fmt(result.dose / CHEST_XRAY_USV)} raios-X`} />
              </div>
              <div>
                <div className="font-medium">3. Radiação natural em Portugal (≈ 3 mSv/ano)</div>
                <Row k="Equivalente a" v={`${fmt(result.dose / PT_BACKGROUND_USV_DAY)} dias`} />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">Valores de referência aproximados: raio-X tórax PA 0,02 mSv; fundo natural em Portugal ~3 mSv/ano (~8,2 µSv/dia).</p>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted p-2">
      <div className="text-muted-foreground">{label}</div>
      <div className="font-mono font-medium">{value}</div>
    </div>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between border-b pb-1"><span className="text-muted-foreground">{k}</span><span className="font-mono">{v}</span></div>;
}
function Field({ icon: Icon, label, value, children }: { icon: typeof Clock; label: string; value?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" /> {label}
        {value && <span className="ml-auto font-mono text-primary">{value}</span>}
      </div>
      {children}
    </div>
  );
}
