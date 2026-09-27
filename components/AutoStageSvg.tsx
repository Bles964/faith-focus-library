"use client";

export type Visual = {
  type?: string;
  items?: string[];
  columns?: { title?: string; items?: string[] }[];
  center?: string;
};
export type AutoStage = { label: string; narration: string; visual?: Visual };

const NAVY = "#0B1F3A";
const CARD = "#12294A";
const GOLD = "#D4AF37";
const MUTED = "#9AA6B8";
const LINE = "#2A3E5C";
const BONE = "#F4F1EA";
const TEAL = "#8FC4D1";
const ROSE = "#E8A0B0";

function wrap(text: unknown, max: number, maxLines = 2): string[] {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? cur + " " + w : w;
    if (next.length <= max) {
      cur = next;
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].slice(0, Math.max(1, max - 1)) + "…";
    return kept;
  }
  return lines;
}

function Lines({
  lines,
  x,
  cy,
  lh,
  size,
  fill,
  weight,
  anchor = "middle",
}: {
  lines: string[];
  x: number;
  cy: number;
  lh: number;
  size: number;
  fill: string;
  weight: string;
  anchor?: "middle" | "start";
}) {
  const startY = cy - ((lines.length - 1) * lh) / 2 + size * 0.35;
  return (
    <text x={x} y={startY} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={fill}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : lh}>
          {l}
        </tspan>
      ))}
    </text>
  );
}

function Flow({ items }: { items: string[] }) {
  const n = items.length;
  const h = 46;
  const gap = 22;
  const total = n * h + (n - 1) * gap;
  const y0 = 96 + (344 - total) / 2;
  return (
    <g>
      {items.map((t, i) => {
        const y = y0 + i * (h + gap);
        return (
          <g key={i}>
            <rect x="40" y={y} width="300" height={h} rx="10" fill={CARD} stroke={LINE} />
            <rect x="40" y={y} width="6" height={h} rx="3" fill={GOLD} />
            <Lines lines={wrap(t, 28)} x={196} cy={y + h / 2} lh={16} size={14} fill={BONE} weight="600" />
            {i < n - 1 && (
              <path
                d={`M190 ${y + h + 3} L190 ${y + h + gap - 5} M184 ${y + h + gap - 11} L190 ${y + h + gap - 4} L196 ${y + h + gap - 11}`}
                stroke={GOLD}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            )}
          </g>
        );
      })}
    </g>
  );
}

function Cycle({ items }: { items: string[] }) {
  const n = items.length;
  const cx = 190;
  const cy = 272;
  const rx = 118;
  const ry = 128;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={LINE} strokeWidth="2" strokeDasharray="5 6" />
      {items.map((t, i) => {
        const a = ((-90 + (i * 360) / n) * Math.PI) / 180;
        const x = cx + rx * Math.cos(a);
        const y = cy + ry * Math.sin(a);
        return (
          <g key={i}>
            <rect x={x - 54} y={y - 21} width="108" height="42" rx="10" fill={CARD} stroke={GOLD} strokeWidth="1.2" />
            <Lines lines={wrap(t, 15)} x={x} cy={y} lh={14} size={12} fill={BONE} weight="600" />
            <circle cx={x - 54} cy={y - 21} r="9" fill={GOLD} />
            <text x={x - 54} y={y - 17.5} textAnchor="middle" fontSize="10" fontWeight="700" fill={NAVY}>
              {i + 1}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Compare({ columns }: { columns: { title?: string; items?: string[] }[] }) {
  return (
    <g>
      {columns.map((c, ci) => {
        const x = 20 + ci * 180;
        const its = (c.items ?? []).slice(0, 3);
        return (
          <g key={ci}>
            <rect x={x} y="100" width="160" height="46" rx="10" fill={ci === 0 ? GOLD : TEAL} />
            <Lines lines={wrap(c.title, 16)} x={x + 80} cy={123} lh={15} size={13} fill={NAVY} weight="700" />
            {its.map((t, i) => {
              const y = 158 + i * 80;
              return (
                <g key={i}>
                  <rect x={x} y={y} width="160" height="68" rx="10" fill={CARD} stroke={LINE} />
                  <Lines lines={wrap(t, 19, 3)} x={x + 80} cy={y + 34} lh={15} size={12} fill={BONE} weight="400" />
                </g>
              );
            })}
          </g>
        );
      })}
      <circle cx="190" cy="123" r="11" fill={NAVY} stroke={GOLD} />
      <text x="190" y="127" textAnchor="middle" fontSize="10" fontWeight="700" fill={GOLD}>
        vs
      </text>
    </g>
  );
}

function Venn({ items, center }: { items: string[]; center?: string }) {
  const pos = [
    { x: 190, y: 200 },
    { x: 146, y: 276 },
    { x: 234, y: 276 },
  ];
  const labels = [
    { x: 190, y: 162 },
    { x: 106, y: 312 },
    { x: 274, y: 312 },
  ];
  const colors = [TEAL, ROSE, GOLD];
  return (
    <g>
      {pos.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="72" fill={colors[i]} opacity="0.35" />
      ))}
      {items.slice(0, 3).map((t, i) => (
        <Lines key={i} lines={wrap(t, 12)} x={labels[i].x} cy={labels[i].y} lh={14} size={13} fill={BONE} weight="700" />
      ))}
      {center && <Lines lines={wrap(center, 12)} x={190} cy={250} lh={12} size={10} fill={BONE} weight="400" />}
    </g>
  );
}

function ListScene({ items }: { items: string[] }) {
  const n = items.length;
  const h = 56;
  const gap = 12;
  const total = n * h + (n - 1) * gap;
  const y0 = 96 + (344 - total) / 2;
  return (
    <g>
      {items.map((t, i) => {
        const y = y0 + i * (h + gap);
        return (
          <g key={i}>
            <rect x="40" y={y} width="300" height={h} rx="10" fill={CARD} stroke={LINE} />
            <circle cx="66" cy={y + h / 2} r="11" fill={GOLD} />
            <text x="66" y={y + h / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill={NAVY}>
              {i + 1}
            </text>
            <Lines lines={wrap(t, 26)} x={90} cy={y + h / 2} lh={16} size={14} fill={BONE} weight="600" anchor="start" />
          </g>
        );
      })}
    </g>
  );
}

export default function AutoStageSvg({ stage }: { stage: AutoStage }) {
  const v = stage.visual ?? {};
  const type = v.type ?? "list";
  const its = (Array.isArray(v.items) ? v.items : []).map(String).filter(Boolean);
  const cols = (Array.isArray(v.columns) ? v.columns : []).filter(Boolean);

  let scene;
  if (type === "compare" && cols.length >= 2) scene = <Compare columns={cols.slice(0, 2)} />;
  else if (type === "venn" && its.length >= 3) scene = <Venn items={its} center={v.center} />;
  else if (type === "cycle" && its.length >= 3) scene = <Cycle items={its.slice(0, 6)} />;
  else if (type === "flow" && its.length >= 2) scene = <Flow items={its.slice(0, 5)} />;
  else scene = <ListScene items={(its.length ? its : [stage.label]).slice(0, 5)} />;

  return (
    <svg
      width="380"
      height="460"
      viewBox="0 0 380 460"
      xmlns="http://www.w3.org/2000/svg"
      fontFamily="Helvetica, Arial, sans-serif"
    >
      <rect width="380" height="460" fill={NAVY} />
      <Lines lines={wrap(stage.label, 26)} x={190} cy={46} lh={24} size={20} fill={GOLD} weight="700" />
      {scene}
      <text x="190" y="448" textAnchor="middle" fontSize="10" fill={MUTED}>
        Faith and Focus Academy
      </text>
    </svg>
  );
}
