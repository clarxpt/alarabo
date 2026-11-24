import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/alara/AppShell";
import { clearHistory, loadHistory, type SessionRecord } from "@/lib/alara/history";
import { APRONS, PROCEDURES, fmt, riskLevel } from "@/lib/alara/physics";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de Sessão — ALARA" },
      { name: "description", content: "Registo dos cenários simulados para avaliação e auto-reflexão." },
      { property: "og:title", content: "Histórico de Sessão — ALARA" },
      { property: "og:description", content: "Reveja os cenários de dose que simulou." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Hist,
});

const riskText = { safe: "text-safe", warn: "text-warn", danger: "text-danger" };

function Hist() {
  const [rows, setRows] = useState<SessionRecord[]>([]);
  useEffect(() => setRows(loadHistory()), []);
  const total = rows.reduce((s, r) => s + r.dose, 0);

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Relatório de Sessão</h1>
          <p className="text-xs text-muted-foreground">Cenários fictícios de diferentes funções; não é um registo dosimétrico pessoal.</p>
          <p className="text-muted-foreground">{rows.length} cenários · soma de valores simulados {fmt(total)} µSv</p>
        </div>
        {rows.length > 0 && (
          <button onClick={() => { clearHistory(); setRows([]); }} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
            <Trash2 className="h-4 w-4" /> Limpar
          </button>
        )}
      </div>
      <div className="panel mt-6 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-muted-foreground">Ainda não registou cenários. Use o botão "Registar" no simulador.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr>{["Data", "Profissional", "Procedimento", "Tempo", "Distância", "EPI", "Dose"].map((h) => <th key={h} className="px-4 py-2">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-2 font-mono text-xs">{new Date(r.at).toLocaleString("pt-PT")}</td>
                  <td className="px-4 py-2">{r.professional}</td>
                  <td className="px-4 py-2">{PROCEDURES[r.procedure].label.split(" (")[0]}</td>
                  <td className="px-4 py-2 font-mono">{r.minutes.toFixed(1)} min</td>
                  <td className="px-4 py-2 font-mono">{r.distance.toFixed(2)} m</td>
                  <td className="px-4 py-2">{APRONS[r.apron].label}{r.thyroidGlasses ? " + tiroide/óculos" : ""}</td>
                  <td className={`px-4 py-2 font-mono font-semibold ${riskText[riskLevel(r.dose)]}`}>{fmt(r.dose)} µSv {r.modelVersion !== 2 && <span className="text-xs text-muted-foreground">(modelo anterior)</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AppShell>
  );
}
