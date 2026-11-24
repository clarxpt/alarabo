import { createFileRoute } from "@tanstack/react-router";
import { Clock, Ruler, Shield } from "lucide-react";
import { AppShell } from "@/components/alara/AppShell";

export const Route = createFileRoute("/educacao")({
  head: () => ({
    meta: [
      { title: "Princípios ALARA — Tempo, Distância e Blindagem" },
      { name: "description", content: "Os três pilares da proteção radiológica no bloco operatório explicados de forma simples." },
      { property: "og:title", content: "Princípios ALARA" },
      { property: "og:description", content: "Tempo, distância e blindagem na fluoroscopia cirúrgica." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Edu,
});

const items = [
  { icon: Clock, title: "Tempo", formula: "D = Ḋ × t", text: "A dose é diretamente proporcional ao tempo de exposição. Use fluoroscopia pulsada, last-image-hold e pedal só quando necessário." },
  { icon: Ruler, title: "Distância", formula: "D ∝ 1 / d²", text: "No modelo de fonte pontual, duplicar a distância reduz a dose para um quarto; a dispersão no doente pode diferir. Um passo atrás é a medida de proteção mais barata e eficaz." },
  { icon: Shield, title: "Blindagem", formula: "D = D₀ · e^(−μx)", text: "Neste modelo ilustrativo, 0,25 e 0,5 mm Pb atenuam cerca de 86% e 98%. A transmissão real depende do espectro, geometria e material. Protetor de tiroide e óculos plumbo-vidro protegem órgãos sensíveis." },
];

function Edu() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold">Princípios ALARA</h1>
      <p className="mt-1 max-w-2xl text-muted-foreground">"As Low As Reasonably Achievable" — manter a exposição tão baixa quanto razoavelmente possível.</p>
      <div className="mt-6 grid gap-4 @3xl:grid-cols-3">
        {items.map(({ icon: Icon, title, formula, text }) => (
          <article key={title} className="panel p-6">
            <Icon className="h-8 w-8 text-primary" />
            <h2 className="mt-3 text-lg font-semibold">{title}</h2>
            <div className="mt-2 inline-block rounded bg-muted px-2 py-1 font-mono text-sm">{formula}</div>
            <p className="mt-3 text-sm text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
      <div className="panel mt-6 p-6 text-sm text-muted-foreground">
        <b className="text-foreground">Nota:</b> este simulador usa um modelo educativo simplificado. Os valores não representam uma dose efetiva validada e não substituem dosimetria pessoal nem avaliação por um especialista em física médica.
      </div>
    </AppShell>
  );
}
