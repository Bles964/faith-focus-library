import type { ReactNode } from "react";

export type EyeKind =
  | "c1" | "c2" | "c3" | "c4" | "c5" | "c6" | "c7" | "c8"
  | "g1" | "g2" | "g3" | "g4" | "g5" | "g6" | "g7" | "g8"
  | "r1" | "r2" | "r3" | "r4" | "r5" | "r6" | "r7";

export type EyeStage = { kind: EyeKind; label: string; narration: string };

const NAVY = "#0B1F3A";
const CARD = "#14294D";
const LINE = "#2A3E5C";
const GOLD = "#D4AF37";
const CREAM = "#F4F1EA";
const MUTED = "#9AA6B8";
const RED = "#E5584F";
const GREEN = "#5BBF8A";
const BLUE = "#5B9BD5";
const PURPLE = "#9B7BD5";
const DARK = "#1A2A47";
const LENS = "#F2E6A8";
const FONT = "Helvetica, Arial, sans-serif";

function Txt({
  x, y, children, size = 16, fill = CREAM, anchor = "middle", weight = 400,
}: {
  x: number; y: number; children: ReactNode; size?: number; fill?: string;
  anchor?: "start" | "middle" | "end"; weight?: number;
}) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontWeight={weight} fontFamily={FONT}>
      {children}
    </text>
  );
}

function Card({ x, y, w, h, stroke = LINE, children }: { x: number; y: number; w: number; h: number; stroke?: string; children?: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={CARD} stroke={stroke} strokeWidth={1.5} />
      {children}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color = RED, w = 3 }: { x1: number; y1: number; x2: number; y2: number; color?: string; w?: number }) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 9;
  const p1x = x2 - h * Math.cos(a - 0.5);
  const p1y = y2 - h * Math.sin(a - 0.5);
  const p2x = x2 - h * Math.cos(a + 0.5);
  const p2y = y2 - h * Math.sin(a + 0.5);
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${p1x},${p1y} ${p2x},${p2y}`} fill={color} />
    </g>
  );
}

function Divider({ y }: { y: number }) {
  return <line x1={50} y1={y} x2={330} y2={y} stroke={LINE} strokeWidth={1.5} />;
}

function Bullets({ items, x = 44, y0, dy, size = 16 }: { items: string[]; x?: number; y0: number; dy: number; size?: number }) {
  return (
    <>
      {items.map((t, i) => (
        <g key={t}>
          <circle cx={x} cy={y0 + i * dy - 5} r={4} fill={GOLD} />
          <Txt x={x + 16} y={y0 + i * dy} size={size} anchor="start">{t}</Txt>
        </g>
      ))}
    </>
  );
}

function NumRows({ rows, y0, dy }: { rows: [string, string][]; y0: number; dy: number }) {
  return (
    <>
      {rows.map(([t, s], i) => (
        <g key={t}>
          <circle cx={44} cy={y0 + i * dy - 6} r={15} fill={GOLD} />
          <Txt x={44} y={y0 + i * dy} size={16} fill={NAVY} weight={700}>{String(i + 1)}</Txt>
          <Txt x={72} y={y0 + i * dy - 4} size={16} weight={700} anchor="start">{t}</Txt>
          {s && <Txt x={72} y={y0 + i * dy + 14} size={12} fill={MUTED} anchor="start">{s}</Txt>}
        </g>
      ))}
    </>
  );
}

function Frame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <svg width={380} height={460} viewBox="0 0 380 460" xmlns="http://www.w3.org/2000/svg">
      <rect width={380} height={460} fill={NAVY} />
      <Txt x={190} y={48} size={22} fill={GOLD} weight={700}>{title}</Txt>
      <line x1={60} y1={64} x2={320} y2={64} stroke={LINE} strokeWidth={1.5} />
      {children}
      <Txt x={190} y={442} size={11} fill={MUTED}>Faith and Focus Academy</Txt>
    </svg>
  );
}

/* =================== CATARACT =================== */

function C1() {
  const rows = [["C", "Capsule"], ["E", "Epithelium"], ["C", "Cortex"], ["N", "Nucleus"]];
  return (
    <>
      <ellipse cx={190} cy={150} rx={74} ry={52} fill="#E9DFA8" fillOpacity={0.45} stroke={GOLD} strokeWidth={4} />
      <ellipse cx={190} cy={150} rx={60} ry={40} fill="#F4EBB8" fillOpacity={0.85} />
      <ellipse cx={190} cy={150} rx={30} ry={22} fill="#D8B85A" />
      <circle cx={128} cy={132} r={3.5} fill={CREAM} />
      <circle cx={122} cy={150} r={3.5} fill={CREAM} />
      <circle cx={128} cy={168} r={3.5} fill={CREAM} />
      {rows.map(([l, w], i) => (
        <g key={w}>
          <circle cx={110} cy={252 + i * 30} r={12} fill={GOLD} />
          <Txt x={110} y={257 + i * 30} size={14} fill={NAVY} weight={700}>{l}</Txt>
          <Txt x={134} y={258 + i * 30} size={17} anchor="start">{w}</Txt>
        </g>
      ))}
      <Txt x={190} y={388} size={13} fill={MUTED}>No blood or nerve supply</Txt>
      <Txt x={190} y={410} size={13} fill={RED} weight={700}>Most common cause of blindness worldwide</Txt>
    </>
  );
}

function C2() {
  return (
    <Bullets
      y0={118}
      dy={50}
      size={18}
      items={[
        "Age: 80 to 90% by age 65",
        "Trauma",
        "Inflammation: uveitis",
        "Metabolic: diabetes",
        "Drugs: long-term steroids",
        "Radiation, tobacco, alcohol",
        "Poor nutrition",
      ]}
    />
  );
}

function FrontLens({ cx, cy, kind }: { cx: number; cy: number; kind: "nuclear" | "cortical" | "sub" }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={44} fill={DARK} stroke={LINE} strokeWidth={2} />
      {kind === "nuclear" && <circle cx={cx} cy={cy} r={24} fill="#8B5A2B" />}
      {kind === "cortical" &&
        [0, 60, 120, 180, 240, 300].map((a) => (
          <line
            key={a}
            x1={cx + 42 * Math.cos((a * Math.PI) / 180)}
            y1={cy + 42 * Math.sin((a * Math.PI) / 180)}
            x2={cx + 20 * Math.cos((a * Math.PI) / 180)}
            y2={cy + 20 * Math.sin((a * Math.PI) / 180)}
            stroke={CREAM}
            strokeWidth={6}
            strokeLinecap="round"
          />
        ))}
      {kind === "sub" && <circle cx={cx} cy={cy} r={13} fill={CREAM} fillOpacity={0.9} />}
    </g>
  );
}

function C3() {
  const cols = [
    { cx: 65, k: "nuclear" as const, n: "Nuclear", s1: "brown", s2: "second sight" },
    { cx: 190, k: "cortical" as const, n: "Cortical", s1: "whitish", s2: "edge to centre" },
    { cx: 315, k: "sub" as const, n: "Subcapsular", s1: "central, fast", s2: "glare" },
  ];
  return (
    <>
      {cols.map((c) => (
        <g key={c.n}>
          <FrontLens cx={c.cx} cy={140} kind={c.k} />
          <Txt x={c.cx} y={226} size={15} weight={700}>{c.n}</Txt>
          <Txt x={c.cx} y={246} size={12} fill={MUTED}>{c.s1}</Txt>
          <Txt x={c.cx} y={262} size={12} fill={MUTED}>{c.s2}</Txt>
        </g>
      ))}
      <Divider y={292} />
      <Txt x={190} y={326} size={15} fill={GOLD} weight={700}>Second sight of the aged</Txt>
      <Txt x={190} y={348} size={12} fill={MUTED}>a presbyope suddenly reads without glasses</Txt>
      <Txt x={190} y={386} size={12} fill={CREAM}>Steroids + diabetes + glare: think subcapsular</Txt>
    </>
  );
}

function StageLens({ cx, cy, i }: { cx: number; cy: number; i: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={30} fill={DARK} stroke={LINE} strokeWidth={2} />
      {i === 0 && <circle cx={cx + 8} cy={cy - 6} r={5} fill={CREAM} fillOpacity={0.7} />}
      {i === 1 && <circle cx={cx} cy={cy} r={18} fill={CREAM} fillOpacity={0.45} />}
      {i === 2 && <circle cx={cx} cy={cy} r={30} fill={CREAM} fillOpacity={0.92} />}
      {i === 3 && <circle cx={cx} cy={cy} r={21} fill={CREAM} fillOpacity={0.85} />}
      {i === 4 && <circle cx={cx} cy={cy} r={35} fill={CREAM} fillOpacity={0.95} />}
      {i === 5 && (
        <>
          <circle cx={cx} cy={cy} r={30} fill={CREAM} fillOpacity={0.92} />
          <circle cx={cx} cy={cy + 15} r={9} fill="#8B5A2B" />
        </>
      )}
    </g>
  );
}

function C4() {
  const names = ["Incipient", "Immature", "Mature", "Hypermature", "Intumescent", "Morgagnian"];
  const xs = [65, 190, 315];
  return (
    <>
      {names.map((n, i) => {
        const cx = xs[i % 3];
        const cy = i < 3 ? 115 : 235;
        return (
          <g key={n}>
            <StageLens cx={cx} cy={cy} i={i} />
            <Txt x={cx} y={cy + 56} size={12.5} weight={700}>{n}</Txt>
          </g>
        );
      })}
      <Txt x={190} y={338} size={22} fill={GOLD} weight={700}>I - I - M - H - I - M</Txt>
      <Txt x={190} y={364} size={13} fill={MUTED}>Hypermature: shrunken. Intumescent: swollen.</Txt>
      <Txt x={190} y={386} size={13} fill={MUTED}>Morgagnian: liquefied cortex, nucleus sinks</Txt>
    </>
  );
}

function C5() {
  return (
    <>
      <Bullets
        y0={112}
        dy={44}
        size={17}
        items={[
          "Gradual, painless blurring",
          "Usually in both eyes",
          "Glare, especially at night",
          "Double vision",
          "White pupil in children",
        ]}
      />
      <Card x={30} y={336} w={320} h={64} stroke={RED}>
        <Txt x={190} y={364} size={16} fill={RED} weight={700}>No light perception?</Txt>
        <Txt x={190} y={386} size={14}>Look for another eye problem</Txt>
      </Card>
    </>
  );
}

function C6() {
  return (
    <>
      <Txt x={190} y={102} size={18} fill={GOLD} weight={700}>The only treatment: surgery</Txt>
      <Bullets y0={146} dy={34} size={16} items={["Restore vision (most common)", "Medical: lens-induced glaucoma", "Cosmetic: white pupil"]} />
      <Divider y={238} />
      <Txt x={190} y={266} size={15} fill={GOLD} weight={700}>Before surgery</Txt>
      <Bullets y0={298} dy={30} size={15} items={["Control BP and diabetes", "Treat any eye infection", "Biometry to pick the IOL power"]} />
      <Txt x={190} y={396} size={12} fill={MUTED}>Local anaesthesia; patient must lie flat</Txt>
    </>
  );
}

function C7() {
  const rows: [string, string][] = [
    ["ICCE", "whole lens + capsule out"],
    ["ECCE", "keeps the posterior capsule"],
    ["SICS", "small tunnel, no stitches"],
    ["Phaco", "ultrasound, 3 to 4 mm incision"],
    ["Lensectomy", "for children's cataract"],
  ];
  return (
    <>
      {rows.map(([c, d], i) => (
        <g key={c}>
          <Txt x={24} y={118 + i * 64} size={18} fill={GOLD} weight={700} anchor="start">{c}</Txt>
          <Txt x={140} y={118 + i * 64} size={15} anchor="start">{d}</Txt>
          {i < rows.length - 1 && <line x1={24} y1={138 + i * 64} x2={356} y2={138 + i * 64} stroke={LINE} strokeWidth={1} />}
        </g>
      ))}
    </>
  );
}

function C8() {
  return (
    <>
      <Bullets
        y0={106}
        dy={42}
        size={16}
        items={["Steroid drops 6 times daily, taper by 6 to 8 weeks", "Antibiotic drops 4 times daily for 4 weeks", "Check refraction at 6 to 12 weeks"]}
      />
      <Divider y={238} />
      <circle cx={110} cy={290} r={30} fill="#000" stroke={CREAM} strokeWidth={2} />
      <circle cx={270} cy={290} r={30} fill="#000" stroke={CREAM} strokeWidth={2} />
      <circle cx={270} cy={290} r={16} fill="none" stroke={GOLD} strokeWidth={4} />
      <Txt x={110} y={348} size={15} weight={700}>Aphakia</Txt>
      <Txt x={110} y={366} size={12} fill={MUTED}>lens absent</Txt>
      <Txt x={270} y={348} size={15} weight={700}>Pseudophakia</Txt>
      <Txt x={270} y={366} size={12} fill={MUTED}>implant present</Txt>
      <Txt x={190} y={404} size={13} fill={GOLD}>Cloudy capsule after ECCE: Nd:YAG laser</Txt>
    </>
  );
}

/* =================== GLAUCOMA =================== */

function G1() {
  return (
    <>
      <circle cx={190} cy={148} r={58} fill="#D98B5B" />
      <circle cx={190} cy={148} r={34} fill="#F4EBD0" />
      <Txt x={190} y={153} size={14} fill="#8A5A3A" weight={700}>cup</Txt>
      <Txt x={190} y={244} size={17} fill={GOLD} weight={700}>Optic nerve damage</Txt>
      <Txt x={190} y={268} size={16}>+ visual field loss</Txt>
      <Divider y={296} />
      <Txt x={190} y={326} size={15} fill={RED} weight={700}>Normal pressure does not exclude it</Txt>
      <Txt x={190} y={350} size={12} fill={MUTED}>High pressure is a risk factor, not the definition</Txt>
      <Txt x={190} y={388} size={13} fill={MUTED}>Leading cause of irreversible blindness</Txt>
    </>
  );
}

function G2() {
  return (
    <>
      <path d="M 125 125 Q 70 190 125 255 L 170 240 L 170 140 Z" fill={BLUE} fillOpacity={0.3} />
      <path d="M 125 125 Q 70 190 125 255" fill="none" stroke={CREAM} strokeWidth={6} strokeLinecap="round" />
      <rect x={166} y={126} width={10} height={52} rx={3} fill="#6B8FB5" />
      <rect x={166} y={202} width={10} height={52} rx={3} fill="#6B8FB5" />
      <ellipse cx={196} cy={190} rx={18} ry={34} fill={LENS} />
      <circle cx={178} cy={112} r={13} fill={GOLD} />
      <circle cx={178} cy={268} r={13} fill={GOLD} />
      <rect x={118} y={112} width={22} height={14} fill={GREEN} />
      <Arrow x1={166} y1={190} x2={134} y2={190} color={BLUE} w={2} />
      <Arrow x1={192} y1={122} x2={220} y2={150} color={PURPLE} w={2} />
      <circle cx={238} cy={113} r={5} fill={GOLD} />
      <Txt x={250} y={118} size={13} weight={700} anchor="start">Ciliary body</Txt>
      <Txt x={250} y={134} size={11} fill={MUTED} anchor="start">makes aqueous</Txt>
      <circle cx={238} cy={183} r={5} fill={GREEN} />
      <Txt x={250} y={188} size={13} weight={700} anchor="start">Trabecular</Txt>
      <Txt x={250} y={204} size={11} fill={MUTED} anchor="start">about 90%</Txt>
      <circle cx={238} cy={253} r={5} fill={PURPLE} />
      <Txt x={250} y={258} size={13} weight={700} anchor="start">Uveoscleral</Txt>
      <Txt x={250} y={274} size={11} fill={MUTED} anchor="start">about 10%</Txt>
      <Txt x={190} y={326} size={17} fill={GOLD} weight={700}>Normal pressure: 10 to 21 mmHg</Txt>
      <Txt x={190} y={352} size={13} fill={MUTED}>Aqueous made at 2 to 2.5 microlitres a minute</Txt>
      <Txt x={190} y={376} size={13} fill={MUTED}>Outflow resistance sets the pressure</Txt>
    </>
  );
}

function G3() {
  const cards = [
    { x: 15, y: 92, c: "POAG", a: "open angle", b: "slow and silent" },
    { x: 205, y: 92, c: "PACG", a: "angle closure", b: "can strike suddenly" },
    { x: 15, y: 238, c: "Secondary", a: "from another eye", b: "problem or disease" },
    { x: 205, y: 238, c: "Congenital", a: "present from birth", b: "or early childhood" },
  ];
  return (
    <>
      {cards.map((c) => (
        <Card key={c.c} x={c.x} y={c.y} w={160} h={135}>
          <Txt x={c.x + 80} y={c.y + 52} size={22} fill={GOLD} weight={700}>{c.c}</Txt>
          <Txt x={c.x + 80} y={c.y + 84} size={13}>{c.a}</Txt>
          <Txt x={c.x + 80} y={c.y + 104} size={12} fill={MUTED}>{c.b}</Txt>
        </Card>
      ))}
      <Txt x={190} y={410} size={13} fill={GOLD}>Open = slow and silent. Closed = emergency.</Txt>
    </>
  );
}

function G4() {
  return (
    <>
      <circle cx={90} cy={140} r={50} fill="#2E4A73" />
      <circle cx={290} cy={140} r={50} fill="#10203A" stroke={LINE} strokeWidth={2} />
      <circle cx={290} cy={140} r={18} fill="#2E4A73" />
      <Arrow x1={150} y1={140} x2={226} y2={140} color={GOLD} />
      <Txt x={90} y={216} size={13} weight={700}>Normal field</Txt>
      <Txt x={290} y={216} size={13} weight={700}>Peripheral loss first</Txt>
      <Txt x={290} y={234} size={11} fill={MUTED}>centre kept until late</Txt>
      <Bullets y0={284} dy={30} size={15} items={["Painless, usually both eyes", "Reads fine but bumps into things"]} />
      <Txt x={190} y={352} size={13} fill={MUTED}>Risks: age, African descent, family history,</Txt>
      <Txt x={190} y={372} size={13} fill={MUTED}>high myopia, thin cornea, high pressure</Txt>
    </>
  );
}

function G5() {
  return (
    <>
      <NumRows
        y0={112}
        dy={56}
        rows={[
          ["Gonioscopy", "angle is open"],
          ["Tonometry", "pressure varies through the day"],
          ["Pachymetry", "corneal thickness"],
          ["Fundoscopy", "pathological cupping"],
          ["Perimetry + OCT", "field loss and nerve damage"],
        ]}
      />
      <Txt x={190} y={404} size={15} fill={GOLD} weight={700}>Glaucoma digs the cup</Txt>
    </>
  );
}

function G6() {
  return (
    <>
      <NumRows
        y0={110}
        dy={46}
        rows={[
          ["Beta blockers", "less aqueous (caution in asthma)"],
          ["Prostaglandins", "more uveoscleral outflow"],
          ["Alpha-2 agonists", "less aqueous, more outflow"],
          ["Carbonic anhydrase inhibitors", "less aqueous"],
          ["Pilocarpine", "miotic: opens the angle"],
        ]}
      />
      <Divider y={324} />
      <Txt x={190} y={352} size={15} fill={GOLD} weight={700}>Laser: ALT or SLT</Txt>
      <Txt x={190} y={376} size={14}>Surgery: trabeculectomy is most common</Txt>
    </>
  );
}

function AngleIcon({ cx, cy, open }: { cx: number; cy: number; open: boolean }) {
  const lowerY = open ? cy + 46 : cy + 6;
  return (
    <g>
      <polygon
        points={`${cx - 40},${cy} ${cx + 50},${cy - 46} ${cx + 50},${lowerY}`}
        fill={open ? BLUE : RED}
        fillOpacity={0.35}
      />
      <line x1={cx - 40} y1={cy} x2={cx + 50} y2={cy - 46} stroke={CREAM} strokeWidth={4} strokeLinecap="round" />
      <line x1={cx - 40} y1={cy} x2={cx + 50} y2={lowerY} stroke="#6B8FB5" strokeWidth={6} strokeLinecap="round" />
      <rect x={cx - 48} y={cy - 9} width={12} height={18} fill={GREEN} />
    </g>
  );
}

function G7() {
  return (
    <>
      <AngleIcon cx={95} cy={125} open />
      <AngleIcon cx={285} cy={125} open={false} />
      <Txt x={95} y={208} size={14} weight={700}>Open angle</Txt>
      <Txt x={285} y={208} size={14} fill={RED} weight={700}>Closed angle</Txt>
      <Txt x={190} y={246} size={15} fill={RED} weight={700}>EMERGENCY</Txt>
      <Txt x={190} y={270} size={13}>Pain · Blurred vision · Haloes</Txt>
      <Txt x={190} y={290} size={13}>Nausea + vomiting · Visual loss</Txt>
      <Txt x={190} y={314} size={13} fill={RED}>Mid-dilated fixed pupil, pressure 50 to 60</Txt>
      <Divider y={334} />
      <Txt x={190} y={362} size={13} fill={GOLD}>Acetazolamide + drops, then laser iridotomy</Txt>
      <Txt x={190} y={386} size={13} fill={GOLD}>Treat the other eye too</Txt>
    </>
  );
}

function G8() {
  return (
    <>
      <circle cx={190} cy={142} r={54} fill="#C9D4E3" fillOpacity={0.75} stroke={CREAM} strokeWidth={2} />
      <circle cx={190} cy={142} r={22} fill="#4A6A8A" />
      <path d="M 150 118 Q 190 102 230 118" fill="none" stroke={RED} strokeWidth={2} />
      <path d="M 146 142 Q 190 128 234 142" fill="none" stroke={RED} strokeWidth={2} />
      <Txt x={190} y={228} size={15} fill={GOLD} weight={700}>Tearing · Photophobia</Txt>
      <Txt x={190} y={252} size={15}>Large, cloudy cornea (buphthalmos)</Txt>
      <Txt x={190} y={274} size={12} fill={MUTED}>Haab striae: breaks in Descemet membrane</Txt>
      <Divider y={298} />
      <Txt x={190} y={326} size={14} fill={GOLD} weight={700}>Surgery: goniotomy, trabeculotomy</Txt>
      <Txt x={190} y={350} size={12} fill={RED}>No Alphagan under age 5: risk of apnoea</Txt>
      <Txt x={190} y={374} size={12} fill={MUTED}>Lifelong follow-up</Txt>
    </>
  );
}

/* =================== REFRACTION =================== */

function RayLens({ cx, cy, convex }: { cx: number; cy: number; convex: boolean }) {
  const ds = [-24, 0, 24];
  return (
    <g>
      {convex ? (
        <ellipse cx={cx} cy={cy} rx={10} ry={44} fill={BLUE} fillOpacity={0.6} stroke={BLUE} strokeWidth={2} />
      ) : (
        <path
          d={`M ${cx - 9} ${cy - 44} Q ${cx} ${cy} ${cx - 9} ${cy + 44} L ${cx + 9} ${cy + 44} Q ${cx} ${cy} ${cx + 9} ${cy - 44} Z`}
          fill={BLUE}
          fillOpacity={0.6}
          stroke={BLUE}
          strokeWidth={2}
        />
      )}
      {ds.map((d) => (
        <g key={d}>
          <line x1={cx - 65} y1={cy + d} x2={cx} y2={cy + d} stroke={GOLD} strokeWidth={2} />
          {convex ? (
            <line x1={cx} y1={cy + d} x2={cx + 70} y2={cy} stroke={GOLD} strokeWidth={2} />
          ) : (
            <line x1={cx} y1={cy + d} x2={cx + 60} y2={cy + d * 2.2} stroke={GOLD} strokeWidth={2} />
          )}
        </g>
      ))}
    </g>
  );
}

function R1() {
  return (
    <>
      <RayLens cx={95} cy={140} convex />
      <RayLens cx={285} cy={140} convex={false} />
      <Txt x={110} y={216} size={15} fill={GOLD} weight={700}>Convex = plus</Txt>
      <Txt x={110} y={234} size={12} fill={MUTED}>converges light</Txt>
      <Txt x={290} y={216} size={15} fill={GOLD} weight={700}>Concave = minus</Txt>
      <Txt x={290} y={234} size={12} fill={MUTED}>diverges light</Txt>
      <Divider y={262} />
      <Txt x={190} y={292} size={15}>Power in dioptres: D = 1 / focal length (m)</Txt>
      <Txt x={190} y={322} size={17} fill={GOLD} weight={700}>The eye: about 50 D</Txt>
      <Txt x={190} y={346} size={14}>Cornea 40 D + lens 10 D</Txt>
      <Txt x={190} y={376} size={12} fill={MUTED}>The cornea gives more power than the lens</Txt>
    </>
  );
}

function AccLens({ cx, cy, near }: { cx: number; cy: number; near: boolean }) {
  const rx = near ? 30 : 14;
  return (
    <g>
      <circle cx={cx} cy={cy - 72} r={12} fill={GOLD} />
      <circle cx={cx} cy={cy + 72} r={12} fill={GOLD} />
      <line x1={cx} y1={cy - 60} x2={cx} y2={cy - 36} stroke={CREAM} strokeWidth={2} strokeDasharray={near ? "4 3" : undefined} />
      <line x1={cx} y1={cy + 60} x2={cx} y2={cy + 36} stroke={CREAM} strokeWidth={2} strokeDasharray={near ? "4 3" : undefined} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={36} fill={LENS} stroke={GOLD} strokeWidth={2} />
    </g>
  );
}

function R2() {
  return (
    <>
      <AccLens cx={95} cy={165} near={false} />
      <AccLens cx={285} cy={165} near />
      <Txt x={95} y={278} size={16} weight={700}>Far</Txt>
      <Txt x={95} y={298} size={12} fill={MUTED}>ligaments taut, lens flat</Txt>
      <Txt x={285} y={278} size={16} weight={700}>Near</Txt>
      <Txt x={285} y={298} size={12} fill={MUTED}>ligaments slack, lens round</Txt>
      <Divider y={324} />
      <Txt x={190} y={354} size={17} fill={GOLD} weight={700}>Ciliary contracts, lens convex</Txt>
      <Txt x={190} y={378} size={13} fill={MUTED}>Rounder lens = more power for near objects</Txt>
    </>
  );
}

function EyeFocus({ cx, cy, myopia }: { cx: number; cy: number; myopia: boolean }) {
  const fx = myopia ? cx + 18 : cx + 76;
  return (
    <g>
      <circle cx={cx} cy={cy} r={48} fill="none" stroke={CREAM} strokeWidth={3} />
      <path d={`M ${cx + 36.8} ${cy - 30.9} A 48 48 0 0 1 ${cx + 36.8} ${cy + 30.9}`} fill="none" stroke={RED} strokeWidth={5} />
      <line x1={cx - 52} y1={cy - 22} x2={fx} y2={cy} stroke={GOLD} strokeWidth={2} />
      <line x1={cx - 52} y1={cy + 22} x2={fx} y2={cy} stroke={GOLD} strokeWidth={2} />
      <line x1={cx - 52} y1={cy} x2={fx} y2={cy} stroke={GOLD} strokeWidth={2} />
      {myopia && (
        <>
          <line x1={fx} y1={cy} x2={cx + 44} y2={cy + 18} stroke={GOLD} strokeWidth={2} />
          <line x1={fx} y1={cy} x2={cx + 44} y2={cy - 18} stroke={GOLD} strokeWidth={2} />
        </>
      )}
    </g>
  );
}

function R3() {
  return (
    <>
      <EyeFocus cx={90} cy={140} myopia />
      <EyeFocus cx={275} cy={140} myopia={false} />
      <Txt x={90} y={224} size={16} fill={GOLD} weight={700}>Myopia</Txt>
      <Txt x={90} y={242} size={12} fill={MUTED}>focus in front of retina</Txt>
      <Txt x={90} y={262} size={13}>Concave, minus lens</Txt>
      <Txt x={275} y={224} size={16} fill={GOLD} weight={700}>Hypermetropia</Txt>
      <Txt x={275} y={242} size={12} fill={MUTED}>focus behind retina</Txt>
      <Txt x={275} y={262} size={13}>Convex, plus lens</Txt>
      <Divider y={292} />
      <Txt x={190} y={322} size={16} fill={GOLD} weight={700}>MYopia = Minus</Txt>
      <Txt x={190} y={346} size={16} fill={GOLD} weight={700}>HYpermetropia = high plus</Txt>
      <Txt x={190} y={376} size={12} fill={MUTED}>Myopia is most often a long eyeball</Txt>
    </>
  );
}

function R4() {
  const rows = [
    { t: "Astigmatism", a: "different focus in different planes", b: "corrected with a cylinder lens" },
    { t: "Presbyopia", a: "natural loss of accommodation with age", b: "plus lens for near" },
    { t: "Aphakia", a: "no lens: severe hypermetropia", b: "about +10 D, or an implant" },
  ];
  return (
    <>
      {rows.map((r, i) => {
        const y = 90 + i * 110;
        return (
          <Card key={r.t} x={20} y={y} w={340} h={96}>
            {i === 0 && <ellipse cx={62} cy={y + 48} rx={22} ry={13} fill="none" stroke={GOLD} strokeWidth={3} />}
            {i === 1 && <ellipse cx={62} cy={y + 48} rx={14} ry={22} fill="#8B5A2B" stroke={GOLD} strokeWidth={2} />}
            {i === 2 && <circle cx={62} cy={y + 48} r={20} fill="none" stroke={GOLD} strokeWidth={3} strokeDasharray="5 4" />}
            <Txt x={104} y={y + 32} size={17} weight={700} anchor="start">{r.t}</Txt>
            <Txt x={104} y={y + 54} size={12} fill={MUTED} anchor="start">{r.a}</Txt>
            <Txt x={104} y={y + 72} size={12} fill={GOLD} anchor="start">{r.b}</Txt>
          </Card>
        );
      })}
    </>
  );
}

function R5() {
  const rows: [string, string][] = [
    ["6/12", "about 1 D"],
    ["6/18", "about 2 D"],
    ["6/36", "about 3 D"],
    ["6/60", "about 4 D"],
    ["worse", "5 D or more"],
  ];
  return (
    <>
      <circle cx={190} cy={122} r={38} fill={DARK} stroke={CREAM} strokeWidth={2} />
      <circle cx={190} cy={122} r={5} fill={CREAM} />
      <Txt x={190} y={186} size={13} fill={MUTED}>Pinhole test</Txt>
      <Txt x={190} y={212} size={15} fill={GREEN} weight={700}>Improves: refractive error</Txt>
      <Txt x={190} y={234} size={15} fill={RED} weight={700}>No change: eye disease</Txt>
      <Divider y={256} />
      <Txt x={190} y={280} size={13} fill={GOLD} weight={700}>Rough guide: acuity and error</Txt>
      {rows.map(([v, d], i) => (
        <g key={v}>
          <Txt x={170} y={308 + i * 24} size={15} fill={GOLD} weight={700} anchor="end">{v}</Txt>
          <Txt x={190} y={308 + i * 24} size={15} anchor="start">{d}</Txt>
        </g>
      ))}
    </>
  );
}

function R6() {
  return (
    <>
      <Card x={20} y={86} w={340} h={64}>
        <Txt x={190} y={114} size={15} fill={MUTED}>Myopia</Txt>
        <Txt x={190} y={138} size={19} fill={GOLD} weight={700}>MINIMUM minus</Txt>
      </Card>
      <Card x={20} y={162} w={340} h={64}>
        <Txt x={190} y={190} size={15} fill={MUTED}>Hypermetropia</Txt>
        <Txt x={190} y={214} size={19} fill={GOLD} weight={700}>MAXIMUM plus</Txt>
      </Card>
      <circle cx={82} cy={256} r={12} fill={RED} />
      <circle cx={108} cy={256} r={12} fill={GREEN} />
      <Txt x={132} y={261} size={14} anchor="start">Duochrome: aim for red clearer</Txt>
      <Divider y={284} />
      <Txt x={190} y={310} size={14} fill={GOLD} weight={700}>Reading additions</Txt>
      <Txt x={190} y={336} size={14}>40 to 50 years: +1.0 D</Txt>
      <Txt x={190} y={358} size={14}>50 to 60 years: +2.0 D</Txt>
      <Txt x={190} y={380} size={14}>over 60 years: +3.0 D</Txt>
      <Txt x={190} y={406} size={12} fill={MUTED}>Tailor the addition to the patient</Txt>
    </>
  );
}

function R7() {
  const rows = [
    { t: "Contact lenses", a: "sit on the cornea", b: "need good fit and hygiene" },
    { t: "Refractive surgery", a: "excimer laser reshapes the cornea", b: "PRK or LASIK, with limits" },
    { t: "Low-vision aids", a: "magnify the image", b: "but narrow the field" },
  ];
  return (
    <>
      {rows.map((r, i) => {
        const y = 90 + i * 110;
        return (
          <Card key={r.t} x={20} y={y} w={340} h={96}>
            {i === 0 && <path d={`M 42 ${y + 36} A 22 22 0 0 0 82 ${y + 36} Z`} fill={BLUE} fillOpacity={0.6} stroke={BLUE} strokeWidth={2} />}
            {i === 1 && <Arrow x1={42} y1={y + 24} x2={72} y2={y + 60} color={RED} />}
            {i === 2 && <rect x={40} y={y + 36} width={44} height={20} rx={4} fill="none" stroke={GOLD} strokeWidth={3} />}
            <Txt x={104} y={y + 32} size={17} weight={700} anchor="start">{r.t}</Txt>
            <Txt x={104} y={y + 54} size={12} fill={MUTED} anchor="start">{r.a}</Txt>
            <Txt x={104} y={y + 72} size={12} fill={GOLD} anchor="start">{r.b}</Txt>
          </Card>
        );
      })}
    </>
  );
}

export default function EyeStageSvg({ stage }: { stage: EyeStage }) {
  let scene: ReactNode;
  switch (stage.kind) {
    case "c1": scene = <C1 />; break;
    case "c2": scene = <C2 />; break;
    case "c3": scene = <C3 />; break;
    case "c4": scene = <C4 />; break;
    case "c5": scene = <C5 />; break;
    case "c6": scene = <C6 />; break;
    case "c7": scene = <C7 />; break;
    case "c8": scene = <C8 />; break;
    case "g1": scene = <G1 />; break;
    case "g2": scene = <G2 />; break;
    case "g3": scene = <G3 />; break;
    case "g4": scene = <G4 />; break;
    case "g5": scene = <G5 />; break;
    case "g6": scene = <G6 />; break;
    case "g7": scene = <G7 />; break;
    case "g8": scene = <G8 />; break;
    case "r1": scene = <R1 />; break;
    case "r2": scene = <R2 />; break;
    case "r3": scene = <R3 />; break;
    case "r4": scene = <R4 />; break;
    case "r5": scene = <R5 />; break;
    case "r6": scene = <R6 />; break;
    case "r7": scene = <R7 />; break;
    default: scene = null;
  }
  return <Frame title={stage.label}>{scene}</Frame>;
}
