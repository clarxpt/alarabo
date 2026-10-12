import { Link } from "@tanstack/react-router";
import { Activity, BookOpen, History, Radiation } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Simulador", icon: Activity },
  { to: "/educacao", label: "Princípios ALARA", icon: BookOpen },
  { to: "/historico", label: "Histórico", icon: History },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="bg-navy text-navy-foreground">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <Radiation className="h-6 w-6 text-warn" />
            <div>
              <div className="font-mono text-lg font-semibold tracking-widest">ALARA</div>
              <div className="text-[11px] opacity-70">Proteção Radiológica no Bloco Operatório</div>
            </div>
          </div>
          <nav className="ml-auto flex gap-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: true }}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm opacity-75 transition hover:opacity-100 data-[status=active]:bg-primary data-[status=active]:opacity-100"
              >
                <Icon className="h-4 w-4" /> <span className="hidden sm:inline">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
