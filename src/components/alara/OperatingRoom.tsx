import { useRef } from "react";
import { PROFESSIONALS, type ProfessionalId, riskLevel } from "@/lib/alara/physics";

const W = 640, H = 640, SCALE = 60; // 60 px = 1 m — room radius 5 m
export const SOURCE = { x: 320, y: 320 };

export interface Pos { x: number; y: number }

interface Props {
  positions: Record<ProfessionalId, Pos>;
  doses: Record<ProfessionalId, number>;
  selected: ProfessionalId;
  intensity: number; // 0..1
  onSelect: (id: ProfessionalId) => void;
  onMove: (id: ProfessionalId, p: Pos) => void;
}

export function distanceOf(p: Pos) {
  return Math.hypot(p.x - SOURCE.x, p.y - SOURCE.y) / SCALE;
}
export function placeAt(p: Pos, meters: number): Pos {
  const ang = Math.atan2(p.y - SOURCE.y, p.x - SOURCE.x);
  return { x: SOURCE.x + Math.cos(ang) * meters * SCALE, y: SOURCE.y + Math.sin(ang) * meters * SCALE };
}

const riskVar = { safe: "var(--safe)", warn: "var(--warn)", danger: "var(--danger)" };

export function OperatingRoom({ positions, doses, selected, intensity, onSelect, onMove }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<ProfessionalId | null>(null);

  const toSvg = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    let p = toSvg(e);
    p = { x: Math.min(W - 20, Math.max(20, p.x)), y: Math.min(H - 20, Math.max(20, p.y)) };
    const d = distanceOf(p);
    if (d < 0.5) p = placeAt(p, 0.5);
    if (d > 5) p = placeAt(p, 5);
    onMove(drag.current, p);
  };

  const a = 0.25 + intensity * 0.6;
  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className="w-full touch-none select-none rounded-lg bg-floor"
      onPointerMove={onPointerMove}
      onPointerUp={() => (drag.current = null)}
      onPointerLeave={() => (drag.current = null)}
    >
      <defs>
        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M50 0H0V50" fill="none" stroke="var(--border)" strokeWidth="1" />
        </pattern>
        <radialGradient id="heat">
          <stop offset="0%" stopColor="var(--danger)" stopOpacity={a} />
          <stop offset="25%" stopColor="var(--beam)" stopOpacity={a * 0.7} />
          <stop offset="50%" stopColor="var(--warn)" stopOpacity={a * 0.45} />
          <stop offset="80%" stopColor="var(--safe)" stopOpacity={a * 0.2} />
          <stop offset="100%" stopColor="var(--safe)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#grid)" />
      <circle cx={SOURCE.x} cy={SOURCE.y} r={5 * SCALE} fill="url(#heat)" className="animate-beam" />
      {[1, 2, 3, 4, 5].map((m) => (
        <g key={m}>
          <circle cx={SOURCE.x} cy={SOURCE.y} r={m * SCALE} fill="none" stroke="var(--muted-foreground)" strokeOpacity=".35" strokeDasharray="4 6" />
          <text x={SOURCE.x + m * SCALE * 0.707 + 4} y={SOURCE.y - m * SCALE * 0.707} fontSize="11" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">{m} m</text>
        </g>
      ))}
      {/* table + patient (2.4 m × 0.5 m) */}
      <rect x={SOURCE.x - 1.2 * SCALE} y={SOURCE.y - 0.25 * SCALE} width={2.4 * SCALE} height={0.5 * SCALE} rx={8} fill="var(--card)" stroke="var(--navy)" strokeWidth="2" />
      <ellipse cx={SOURCE.x - SCALE} cy={SOURCE.y} rx={0.14 * SCALE} ry={0.12 * SCALE} fill="var(--accent)" stroke="var(--navy)" />
      <rect x={SOURCE.x - 0.85 * SCALE} y={SOURCE.y - 0.12 * SCALE} width={1.8 * SCALE} height={0.24 * SCALE} rx={10} fill="var(--accent)" stroke="var(--navy)" />
      {/* C-arm: detector above, tube (ampola) below */}
      <path d={`M ${SOURCE.x - 0.45 * SCALE} ${SOURCE.y - 0.8 * SCALE} A ${0.8 * SCALE} ${0.8 * SCALE} 0 0 0 ${SOURCE.x - 0.45 * SCALE} ${SOURCE.y + 0.8 * SCALE}`} fill="none" stroke="var(--navy)" strokeWidth="10" strokeLinecap="round" />
      <rect x={SOURCE.x - 0.14 * SCALE} y={SOURCE.y - 0.88 * SCALE} width={0.28 * SCALE} height={0.18 * SCALE} rx={3} fill="var(--navy)" />
      <rect x={SOURCE.x - 0.18 * SCALE} y={SOURCE.y + 0.7 * SCALE} width={0.36 * SCALE} height={0.16 * SCALE} rx={3} fill="var(--navy)" />
      <polygon points={`${SOURCE.x - 0.12 * SCALE},${SOURCE.y + 0.7 * SCALE} ${SOURCE.x + 0.12 * SCALE},${SOURCE.y + 0.7 * SCALE} ${SOURCE.x + 0.22 * SCALE},${SOURCE.y - 0.7 * SCALE} ${SOURCE.x - 0.22 * SCALE},${SOURCE.y - 0.7 * SCALE}`} fill="var(--beam)" opacity=".35" className="animate-beam" />
      <circle cx={SOURCE.x} cy={SOURCE.y} r={5} fill="var(--danger)" />
      <text x={SOURCE.x + 0.25 * SCALE} y={SOURCE.y + 0.82 * SCALE} fontSize="11" fill="var(--navy)" fontFamily="var(--font-mono)">AMPOLA</text>
      <text x={SOURCE.x + 0.25 * SCALE} y={SOURCE.y - 0.74 * SCALE} fontSize="11" fill="var(--navy)" fontFamily="var(--font-mono)">DETETOR</text>
      <text x={SOURCE.x - 0.6 * SCALE} y={SOURCE.y + 1.1 * SCALE} fontSize="11" fill="var(--navy)" fontFamily="var(--font-mono)">ARCO EM C</text>

      {(Object.keys(PROFESSIONALS) as ProfessionalId[]).map((id) => {
        const p = positions[id];
        const sel = id === selected;
        const color = riskVar[riskLevel(doses[id])];
        return (
          <g
            key={id}
            transform={`translate(${p.x} ${p.y})`}
            className="cursor-grab active:cursor-grabbing"
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture?.(e.pointerId);
              drag.current = id;
              onSelect(id);
            }}
          >
            <line x1={0} y1={0} x2={SOURCE.x - p.x} y2={SOURCE.y - p.y} stroke={color} strokeWidth={sel ? 2 : 1} strokeDasharray="3 4" opacity=".7" />
            <circle r={sel ? 24 : 20} fill="var(--card)" stroke={color} strokeWidth={sel ? 5 : 3} />
            <text textAnchor="middle" dy="4" fontSize="11" fontWeight="600" fill="var(--navy)" fontFamily="var(--font-mono)">{PROFESSIONALS[id].short}</text>
            <text textAnchor="middle" y={38} fontSize="11" fill="var(--foreground)" fontFamily="var(--font-mono)">
              {distanceOf(p).toFixed(2)} m · {doses[id].toFixed(1)} µSv
            </text>
          </g>
        );
      })}
    </svg>
  );
}
