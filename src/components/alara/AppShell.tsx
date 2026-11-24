import { Link } from "@tanstack/react-router";
import { Activity, BookOpen, History, Monitor, Radiation, Smartphone } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

const nav = [
  { to: "/", label: "Simulador", icon: Activity },
  { to: "/educacao", label: "Princípios ALARA", icon: BookOpen },
  { to: "/historico", label: "Histórico", icon: History },
] as const;

type Mode = "auto" | "pc" | "mobile";

export function AppShell({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("auto");
  useEffect(() => {
    try { const m = localStorage.getItem("alara-view"); if (m === "pc" || m === "mobile" || m === "auto") setMode(m); } catch { /* storage unavailable */ }
  }, []);
  const choose = (m: Mode) => {
    const next = mode === m ? "auto" : m;
    setMode(next);
    try { localStorage.setItem("alara-view", next); } catch { /* view still works */ }
  };
  const width = mode === "mobile" ? "max-w-[430px]" : "max-w-7xl";
  return (
    <div className="min-h-screen">
      <header className="bg-navy text-navy-foreground">
        <div className={`mx-auto flex ${width} flex-wrap items-center gap-4 px-4 py-3`}>
          <div className="flex items-center gap-2">
            <Radiation className="h-6 w-6 text-warn" />
            <div>
              <div className="font-mono text-lg font-semibold tracking-widest">ALARA</div>
              <div className="text-[11px] opacity-70">Proteção Radiológica no Bloco Operatório</div>
              <div className="text-[10px] italic opacity-60">Ferramenta criada por Cláudio Filipe</div>
            </div>
          </div>
          <nav className="ml-auto flex gap-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                aria-label={label}
                to={to}
                activeOptions={{ exact: true }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm opacity-75 transition hover:opacity-100 data-[status=active]:bg-primary data-[status=active]:opacity-100"
              >
                <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex gap-1 rounded-md bg-primary/30 p-1" role="group" aria-label="Modo de visualização">
            {([["pc", Monitor, "Vista PC"], ["mobile", Smartphone, "Vista telemóvel"]] as const).map(([m, Icon, label]) => (
              <button key={m} onClick={() => choose(m)} aria-label={label} title={label} aria-pressed={mode === m}
                className={`rounded p-1.5 transition ${mode === m ? "bg-primary opacity-100" : "opacity-60 hover:opacity-100"}`}>
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </header>
      <main className={`@container mx-auto ${width} px-3 py-4 sm:px-4 sm:py-5`}>{children}</main>
    </div>
  );
}
