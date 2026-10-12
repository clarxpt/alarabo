import { useRef } from "react";
import { PROFESSIONALS, type ProfessionalId, riskLevel } from "@/lib/alara/physics";

const W = 600, H = 460, SCALE = 100; // 100 px = 1 m
export const SOURCE = { x: 300, y: 230 };

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
    if (d > 3) p = placeAt(p, 3);
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
      <circle cx={SOURCE.x} cy={SOURCE.y} r={300} fill="url(#heat)" className="animate-beam" />
      {[0.5, 1, 2, 3].map((m) => (
        <g key={m}>
          <circle cx={SOURCE.x} cy={SOURCE.y} r={m * SCALE} fill="none" stroke="var(--muted-foreground)" strokeOpacity=".35" strokeDasharray="4 6" />
          <text x={SOURCE.x + m * SCALE * 0.707 + 4} y={SOURCE.y - m * SCALE * 0.707} fontSize="11" fill="var(--muted-foreground)" fontFamily="var(--font-mono)">{m} m</text>
        </g>
      ))}
      {/* table + patient */}
      <rect x={180} y={205} width={240} height={50} rx={8} fill="var(--card)" stroke="var(--navy)" strokeWidth="2" />
      <ellipse cx={200} cy={230} rx={14} ry={12} fill="var(--accent)" stroke="var(--navy)" />
      <rect x={215} y={218} width={180} height={24} rx={10} fill="var(--accent)" stroke="var(--navy)" />
      {/* C-arm */}
      <path d={`M ${SOURCE.x - 45} 150 A 80 80 0 0 0 ${SOURCE.x - 45} 310`} fill="none" stroke="var(--navy)" strokeWidth="10" strokeLinecap="round" />
      <rect x={SOURCE.x - 14} y={142} width={28} height={18} rx={3} fill="var(--navy)" />
      <rect x={SOURCE.x - 18} y={300} width={36} height={16} rx={3} fill="var(--navy)" />
      <polygon points={`${SOURCE.x - 12},300 ${SOURCE.x + 12},300 ${SOURCE.x + 22},160 ${SOURCE.x - 22},160`} fill="var(--beam)" opacity=".35" className="animate-beam" />
      <circle cx={SOURCE.x} cy={SOURCE.y} r={5} fill="var(--danger)" />
      <text x={SOURCE.x - 60} y={340} fontSize="11" fill="var(--navy)" fontFamily="var(--font-mono)">ARCO EM C</text>

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
