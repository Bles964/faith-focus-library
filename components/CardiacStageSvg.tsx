import type { ReactNode } from "react";

export type CardiacKind =
  | "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "a7" | "a8" | "a9"
  | "b1" | "b2" | "b3" | "b4" | "b5" | "b6" | "b7" | "b8" | "b9" | "b10";

export type CardiacStage = { kind: CardiacKind; label: string; narration: string };

const NAVY = "#0B1F3A";
const CARD = "#14294D";
const LINE = "#2A3E5C";
const GOLD = "#D4AF37";
const CREAM = "#F4F1EA";
const MUTED = "#9AA6B8";
const RED = "#E5584F";
const GREEN = "#5BBF8A";
const BLUE = "#5B9BD5";
const HEART = "#B23A48";
const HEART_EDGE = "#7E2634";
const PLAQUE = "#D8B85A";
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

function Heart({ cx, cy, s = 1, children }: { cx: number; cy: number; s?: number; children?: ReactNode }) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <path
        d="M 0 -20 C 0 -55 -60 -55 -60 -10 C -60 30 0 55 0 80 C 0 55 60 30 60 -10 C 60 -55 0 -55 0 -20 Z"
        fill={HEART}
        stroke={HEART_EDGE}
        strokeWidth={3}
      />
      {children}
    </g>
  );
}

/* ================= VIDEO 1 ================= */

function A1() {
  const rows: [string, string, string][] = [
    ["Roof", "pericardium", CREAM],
    ["Doors", "valves", RED],
    ["Plumbing", "coronary arteries", BLUE],
    ["Wiring", "conduction system", GOLD],
  ];
  return (
    <>
      <polygon points="110,128 190,78 270,128" fill="none" stroke={CREAM} strokeWidth={5} strokeLinejoin="round" />
      <rect x={120} y={128} width={140} height={92} fill={CARD} stroke={LINE} strokeWidth={2} />
      <rect x={176} y={168} width={30} height={52} rx={3} fill={RED} fillOpacity={0.85} />
      <path d="M 132 150 Q 146 138 150 158 T 164 190" fill="none" stroke={BLUE} strokeWidth={4} strokeLinecap="round" />
      <polyline points="226,146 238,160 226,174 240,192" fill="none" stroke={GOLD} strokeWidth={3} strokeLinejoin="round" />
      {rows.map(([a, b, c], i) => (
        <g key={a}>
          <circle cx={78} cy={256 + i * 28} r={6} fill={c} />
          <Txt x={94} y={261 + i * 28} size={16} weight={700} anchor="start">{a}</Txt>
          <Txt x={190} y={261 + i * 28} size={15} fill={MUTED} anchor="start">{b}</Txt>
        </g>
      ))}
      <Divider y={378} />
      <Txt x={190} y={404} size={16} fill={RED} weight={700}>All roads lead to heart failure</Txt>
    </>
  );
}

function A2() {
  const mech = ["Tamponade", "Constriction", "Valve disease", "Coronary blockage", "Tumour"];
  const elec = ["Heart block", "Arrhythmia", "Cardiac arrest"];
  return (
    <>
      <Card x={15} y={88} w={170} h={250}>
        <Txt x={100} y={116} size={17} fill={GOLD} weight={700}>Mechanical</Txt>
        {mech.map((t, i) => (
          <Txt key={t} x={100} y={150 + i * 30} size={14}>{t}</Txt>
        ))}
        <Txt x={100} y={318} size={11} fill={MUTED}>drain, repair, replace, bypass</Txt>
      </Card>
      <Card x={195} y={88} w={170} h={250}>
        <Txt x={280} y={116} size={17} fill={BLUE} weight={700}>Electrical</Txt>
        {elec.map((t, i) => (
          <Txt key={t} x={280} y={150 + i * 30} size={14}>{t}</Txt>
        ))}
        <Txt x={280} y={262} size={11} fill={MUTED}>pacemaker, defibrillation</Txt>
      </Card>
      <Txt x={190} y={376} size={13} fill={GOLD}>Third-degree block: no signal reaches the ventricles</Txt>
      <Txt x={190} y={398} size={12} fill={MUTED}>P waves and QRS run independently: pacemaker</Txt>
    </>
  );
}

function A3() {
  const cards = [
    { x: 15, y: 92, t: "Cardiogenic", a: "pump failure", b: "massive heart attack", c: LINE },
    { x: 205, y: 92, t: "Obstructive", a: "T-P-T", b: "tamponade, tension pneumothorax, PE", c: GOLD },
    { x: 15, y: 238, t: "Hypovolaemic", a: "too little volume", b: "bleeding, burns, diarrhoea", c: LINE },
    { x: 205, y: 238, t: "Distributive", a: "vasodilatation", b: "sepsis, anaphylaxis", c: LINE },
  ];
  return (
    <>
      {cards.map((c) => (
        <Card key={c.t} x={c.x} y={c.y} w={160} h={135} stroke={c.c}>
          <Txt x={c.x + 80} y={c.y + 36} size={16} fill={GOLD} weight={700}>{c.t}</Txt>
          <Txt x={c.x + 80} y={c.y + 66} size={14}>{c.a}</Txt>
          <Txt x={c.x + 80} y={c.y + 96} size={11} fill={MUTED}>{c.b}</Txt>
        </Card>
      ))}
      <Txt x={190} y={410} size={13} fill={MUTED}>Massive MI is cardiogenic. Tamponade is obstructive.</Txt>
    </>
  );
}

function A4() {
  return (
    <>
      <Heart cx={190} cy={160} s={1}>
        <path d="M 6 -30 Q 14 20 4 70" fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" />
        <path d="M -30 -40 Q -52 0 -28 42" fill="none" stroke={BLUE} strokeWidth={5} strokeLinecap="round" />
      </Heart>
      <Txt x={108} y={146} size={15} fill={BLUE} weight={700} anchor="end">RCA</Txt>
      <Txt x={108} y={163} size={11} fill={MUTED} anchor="end">right + rhythm</Txt>
      <Txt x={272} y={146} size={15} fill={GOLD} weight={700} anchor="start">LAD</Txt>
      <Txt x={272} y={163} size={11} fill={MUTED} anchor="start">widowmaker</Txt>
      <Divider y={262} />
      <Txt x={190} y={288} size={13}>RCA: SA + AV nodes: inferior MI, heart block</Txt>
      <Txt x={190} y={310} size={13}>LAD: septum + front wall: most often blocked</Txt>
      <Txt x={190} y={338} size={14} fill={GOLD} weight={700}>Mitral: 2 leaflets, 4 to 6 cm²</Txt>
      <Txt x={190} y={360} size={14} fill={GOLD} weight={700}>Aortic: 3 cusps, 3 to 4 cm²</Txt>
      <Txt x={190} y={394} size={12} fill={MUTED}>LAB RAT: Left Atrium-Bicuspid, Right Atrium-Tricuspid</Txt>
    </>
  );
}

function A5() {
  return (
    <>
      <ellipse cx={190} cy={160} rx={90} ry={74} fill="none" stroke={CREAM} strokeWidth={5} />
      <ellipse cx={190} cy={160} rx={76} ry={60} fill={BLUE} fillOpacity={0.25} stroke={BLUE} strokeWidth={2} />
      <Heart cx={190} cy={150} s={0.5} />
      <circle cx={300} cy={150} r={5} fill={BLUE} />
      <Txt x={310} y={154} size={12} fill={BLUE} anchor="start">fluid</Txt>
      <Txt x={310} y={170} size={11} fill={MUTED} anchor="start">15 to 35 mL</Txt>
      <Divider y={256} />
      <Bullets
        y0={288}
        dy={28}
        size={14}
        items={["Holds the heart in place", "Reduces friction", "Barrier against infection", "Barely stretches: fast fluid = tamponade"]}
      />
    </>
  );
}

function A6() {
  const items: [string, string][] = [
    ["T", "TB, Trauma"],
    ["R", "Radiation"],
    ["U", "Uraemia"],
    ["M", "Malignancy"],
    ["P", "Post-op, Post-MI"],
    ["C", "Collagen-vascular"],
    ["V", "Viral, bacterial"],
    ["I", "Idiopathic"],
  ];
  return (
    <>
      {items.map(([l, w], i) => {
        const col = i < 4 ? 0 : 1;
        const row = i % 4;
        const cx = col === 0 ? 50 : 205;
        const y = 112 + row * 50;
        return (
          <g key={l}>
            <circle cx={cx} cy={y} r={15} fill={GOLD} />
            <Txt x={cx} y={y + 6} size={17} fill={NAVY} weight={700}>{l}</Txt>
            <Txt x={cx + 24} y={y + 5} size={13} anchor="start">{w}</Txt>
          </g>
        );
      })}
      <Divider y={300} />
      <Txt x={190} y={328} size={16} fill={GOLD} weight={700}>In Nigeria: think TB first</Txt>
      <Txt x={190} y={350} size={12} fill={MUTED}>Large effusion or constriction: test for TB</Txt>
      <Txt x={190} y={384} size={13}>Pericarditis: pleuritic pain, better sitting forward</Txt>
    </>
  );
}

function A7() {
  return (
    <>
      <ellipse cx={190} cy={140} rx={62} ry={54} fill={BLUE} fillOpacity={0.35} stroke={CREAM} strokeWidth={4} />
      <Heart cx={190} cy={132} s={0.45} />
      <Arrow x1={190} y1={72} x2={190} y2={88} />
      <Arrow x1={190} y1={208} x2={190} y2={192} />
      <Arrow x1={112} y1={140} x2={128} y2={140} />
      <Arrow x1={268} y1={140} x2={252} y2={140} />
      <Txt x={190} y={238} size={16} fill={GOLD} weight={700}>{"Beck's triad: 3 H's"}</Txt>
      <Bullets y0={268} dy={28} size={14} items={["Hypotension", "Hushed heart sounds", "Hugely distended neck veins"]} />
      <Divider y={358} />
      <Txt x={190} y={384} size={14} fill={GOLD} weight={700}>Pulsus paradoxus</Txt>
      <Txt x={190} y={404} size={12} fill={MUTED}>systolic BP falls by more than 10 mmHg on inspiration</Txt>
    </>
  );
}

function A8() {
  const rows: [string, string, string][] = [
    ["Pericardium", "thick, calcified", "normal"],
    ["Sound", "pericardial knock", "S3 or S4"],
    ["Kussmaul sign", "classic", "may be present"],
    ["BNP", "normal or mild", "markedly raised"],
    ["Treatment", "pericardiectomy", "medical"],
  ];
  return (
    <>
      <Txt x={140} y={96} size={13} fill={GOLD} weight={700} anchor="start">Constriction</Txt>
      <Txt x={262} y={96} size={13} weight={700} anchor="start">Restriction</Txt>
      {rows.map(([a, b, c], i) => (
        <g key={a}>
          <line x1={16} y1={110 + i * 52} x2={364} y2={110 + i * 52} stroke={LINE} strokeWidth={1} />
          <Txt x={16} y={138 + i * 52} size={11} fill={MUTED} anchor="start">{a}</Txt>
          <Txt x={140} y={138 + i * 52} size={12.5} anchor="start">{b}</Txt>
          <Txt x={262} y={138 + i * 52} size={12.5} anchor="start">{c}</Txt>
        </g>
      ))}
      <Txt x={190} y={388} size={13} fill={GOLD} weight={700}>Constriction: Cut the shell, it can be cured</Txt>
      <Txt x={190} y={408} size={13} fill={MUTED}>Restriction: rarely surgical</Txt>
    </>
  );
}

function A9() {
  const grades: [string, number][] = [
    ["Small: under 10 mm", 40],
    ["Moderate: 10 to 19 mm", 100],
    ["Large: 20 mm or more", 170],
  ];
  return (
    <>
      <Txt x={190} y={92} size={13} fill={MUTED}>Echo: size of the effusion</Txt>
      {grades.map(([t, w], i) => (
        <g key={t}>
          <rect x={30} y={106 + i * 36} width={w} height={22} rx={5} fill={i === 2 ? RED : BLUE} fillOpacity={0.85} />
          <Txt x={36 + w + 6} y={122 + i * 36} size={12} anchor="start">{t}</Txt>
        </g>
      ))}
      <Divider y={228} />
      <Bullets
        y0={258}
        dy={28}
        size={14}
        items={["Tamponade: echo-guided drainage", "IV fluids, avoid diuretics", "Constriction: pericardiectomy", "TB: anti-TB drugs + steroids", "Low-voltage ECG: PEACH-O"]}
      />
    </>
  );
}

/* ================= VIDEO 2 ================= */

function ValvePanel({ cx, cy, leak }: { cx: number; cy: number; leak: boolean }) {
  return (
    <g>
      <line x1={cx - 45} y1={cy - 50} x2={cx - 45} y2={cy + 50} stroke={LINE} strokeWidth={4} />
      <line x1={cx + 45} y1={cy - 50} x2={cx + 45} y2={cy + 50} stroke={LINE} strokeWidth={4} />
      {leak ? (
        <>
          <line x1={cx - 45} y1={cy - 10} x2={cx - 2} y2={cy + 14} stroke={CREAM} strokeWidth={6} strokeLinecap="round" />
          <line x1={cx + 45} y1={cy - 10} x2={cx + 2} y2={cy + 14} stroke={CREAM} strokeWidth={6} strokeLinecap="round" />
          <Arrow x1={cx + 24} y1={cy + 50} x2={cx + 24} y2={cy - 34} color={RED} />
        </>
      ) : (
        <>
          <line x1={cx - 45} y1={cy - 10} x2={cx - 9} y2={cy + 14} stroke={CREAM} strokeWidth={6} strokeLinecap="round" />
          <line x1={cx + 45} y1={cy - 10} x2={cx + 9} y2={cy + 14} stroke={CREAM} strokeWidth={6} strokeLinecap="round" />
          <Arrow x1={cx} y1={cy - 46} x2={cx} y2={cy + 46} color={BLUE} />
        </>
      )}
    </g>
  );
}

function B1() {
  return (
    <>
      <ValvePanel cx={95} cy={140} leak={false} />
      <ValvePanel cx={285} cy={140} leak />
      <Txt x={95} y={226} size={15} fill={GOLD} weight={700}>Stenosis</Txt>
      <Txt x={95} y={244} size={12} fill={MUTED}>too tight: pressure behind</Txt>
      <Txt x={285} y={226} size={15} fill={RED} weight={700}>Regurgitation</Txt>
      <Txt x={285} y={244} size={12} fill={MUTED}>too leaky: volume in front</Txt>
      <Divider y={272} />
      <Txt x={190} y={300} size={14} fill={GOLD} weight={700}>Rheumatic heart disease</Txt>
      <Txt x={190} y={322} size={12.5}>Strep throat: antibodies attack the valves</Txt>
      <Txt x={190} y={342} size={12.5}>Mitral valve is hit most often</Txt>
      <Txt x={190} y={372} size={13} fill={GOLD}>Jones: Joints, carditis, Nodules,</Txt>
      <Txt x={190} y={392} size={13} fill={GOLD}>Erythema marginatum, Sydenham chorea</Txt>
    </>
  );
}

function B2() {
  return (
    <>
      <line x1={40} y1={140} x2={340} y2={140} stroke={LINE} strokeWidth={2} />
      <rect x={58} y={92} width={7} height={48} fill={CREAM} />
      <rect x={138} y={106} width={6} height={34} fill={CREAM} />
      <rect x={160} y={122} width={6} height={18} fill={RED} />
      <polyline
        points="176,136 184,126 192,140 200,126 208,140 216,126 224,140 232,126 240,140 248,126 256,140 264,126 272,140 280,126 288,140"
        fill="none"
        stroke={GOLD}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Txt x={62} y={162} size={11}>S1 loud</Txt>
      <Txt x={141} y={162} size={11}>S2</Txt>
      <Txt x={170} y={180} size={11} fill={RED}>snap</Txt>
      <Txt x={232} y={162} size={11} fill={GOLD}>rumble</Txt>
      <Txt x={190} y={228} size={19} fill={GOLD} weight={700}>Snap then Rumble</Txt>
      <Txt x={190} y={252} size={13}>The closer the snap is to S2, the tighter the valve</Txt>
      <Divider y={274} />
      <Txt x={190} y={302} size={14} fill={GOLD} weight={700}>AEHH complications</Txt>
      <Txt x={190} y={324} size={13}>AF · Emboli · Haemoptysis · Hoarseness</Txt>
      <Txt x={190} y={356} size={13} fill={MUTED}>Normal area 4 to 6 cm². Critical: under 1 cm²</Txt>
      <Txt x={190} y={378} size={13}>Treatment: balloon valvuloplasty or replacement</Txt>
    </>
  );
}

function B3() {
  return (
    <>
      <rect x={110} y={84} width={160} height={50} rx={22} fill={HEART} fillOpacity={0.5} stroke={HEART_EDGE} strokeWidth={2} />
      <rect x={110} y={156} width={160} height={78} rx={22} fill={HEART} fillOpacity={0.8} stroke={HEART_EDGE} strokeWidth={2} />
      <Txt x={130} y={114} size={12} anchor="start">LA</Txt>
      <Txt x={130} y={204} size={12} anchor="start">LV</Txt>
      <path d="M 140 150 Q 190 112 240 150" fill="none" stroke={CREAM} strokeWidth={5} strokeLinecap="round" />
      <Arrow x1={190} y1={176} x2={190} y2={106} color={RED} w={4} />
      <Bullets
        y0={274}
        dy={26}
        size={13}
        items={[
          "MR: pansystolic murmur, apex to axilla",
          "Frank-Starling: copes first, then fails",
          "MVP: floppy valve, mid-systolic click",
          "Repair preferred: it saves the ventricle",
        ]}
      />
    </>
  );
}

function B4() {
  const cards = [
    { x: 15, l: "S", w: "Syncope", y3: "3 years" },
    { x: 137, l: "A", w: "Angina", y3: "5 years" },
    { x: 260, l: "D", w: "Dyspnoea", y3: "2 years" },
  ];
  return (
    <>
      {cards.map((c) => (
        <Card key={c.l} x={c.x} y={92} w={105} h={130}>
          <Txt x={c.x + 52} y={142} size={38} fill={GOLD} weight={700}>{c.l}</Txt>
          <Txt x={c.x + 52} y={170} size={13} weight={700}>{c.w}</Txt>
          <Txt x={c.x + 52} y={196} size={12} fill={MUTED}>{c.y3}</Txt>
        </Card>
      ))}
      <Txt x={190} y={244} size={12} fill={MUTED}>average survival after each symptom</Txt>
      <Divider y={262} />
      <Bullets
        y0={292}
        dy={28}
        size={14}
        items={["Slow-rising pulse, narrow pulse pressure", "Ejection systolic murmur to both carotids", "Treatment: valve replacement or TAVI"]}
      />
      <Txt x={190} y={396} size={14} fill={GOLD} weight={700}>SAD: Syncope, Angina, Dyspnoea</Txt>
    </>
  );
}

function B5() {
  return (
    <>
      <polyline
        points="40,150 74,150 84,98 106,168 128,150 162,150 172,98 194,168 216,150 250,150 260,98 282,168 304,150 340,150"
        fill="none"
        stroke={RED}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Txt x={190} y={196} size={12} fill={MUTED}>collapsing pulse, wide pulse pressure</Txt>
      <Divider y={216} />
      <Bullets
        y0={246}
        dy={26}
        size={13}
        items={["Early diastolic decrescendo murmur", "Austin Flint: mid-diastolic, at the apex", "LV dilates: cor bovinum"]}
      />
      <Txt x={190} y={344} size={14} fill={GOLD} weight={700}>Signs of a wide pulse pressure</Txt>
      <Txt x={190} y={368} size={13}>Corrigan: collapsing pulse</Txt>
      <Txt x={190} y={388} size={13}>de Musset: head nodding</Txt>
      <Txt x={190} y={408} size={13}>Quincke: nail-bed pulsation</Txt>
    </>
  );
}

function B6() {
  const mech = ["Metal and carbon", "Lasts forever", "Warfarin for life", "Young patients", "Bileaflet most used"];
  const bio = ["Pig or cow tissue", "No lifelong warfarin", "Wears out", "Elderly patients", "Own, human, animal"];
  return (
    <>
      <Card x={15} y={88} w={160} h={270}>
        <Txt x={95} y={120} size={17} fill={GOLD} weight={700}>Mechanical</Txt>
        {mech.map((t, i) => (
          <Txt key={t} x={95} y={166 + i * 38} size={13}>{t}</Txt>
        ))}
      </Card>
      <Card x={205} y={88} w={160} h={270}>
        <Txt x={285} y={120} size={17} fill={BLUE} weight={700}>Tissue</Txt>
        {bio.map((t, i) => (
          <Txt key={t} x={285} y={166 + i * 38} size={13}>{t}</Txt>
        ))}
      </Card>
      <Txt x={190} y={392} size={13} fill={GOLD}>Mechanical = Must warfarin. Bio = Burns out.</Txt>
      <Txt x={190} y={412} size={12} fill={MUTED}>Auto = own, Homo = human, Xeno = animal</Txt>
    </>
  );
}

function B7() {
  const rows: [string, string, string][] = [
    ["Mitral", "2 to 2.5", "2.5 to 3.5"],
    ["Tricuspid", "1.5 to 2", "higher than aortic"],
    ["Aortic", "not given", "2.0 to 3.0"],
  ];
  return (
    <>
      <Txt x={150} y={98} size={12} fill={GOLD} weight={700} anchor="start">Your lecturer</Txt>
      <Txt x={250} y={98} size={12} weight={700} anchor="start">Guidelines</Txt>
      {rows.map(([a, b, c], i) => (
        <g key={a}>
          <line x1={20} y1={108 + i * 32} x2={360} y2={108 + i * 32} stroke={LINE} strokeWidth={1} />
          <Txt x={20} y={130 + i * 32} size={13} weight={700} anchor="start">{a}</Txt>
          <Txt x={150} y={130 + i * 32} size={13} anchor="start">{b}</Txt>
          <Txt x={250} y={130 + i * 32} size={11.5} anchor="start">{c}</Txt>
        </g>
      ))}
      <Divider y={216} />
      <Txt x={190} y={244} size={16} fill={RED} weight={700}>Warfarin is teratogenic</Txt>
      <Txt x={190} y={264} size={12} fill={MUTED}>embryopathy weeks 6 to 12, fetal bleeding</Txt>
      <Txt x={190} y={298} size={14} fill={GOLD} weight={700}>Before pregnancy</Txt>
      <Bullets
        y0={324}
        dy={26}
        size={13}
        items={["Pre-conception counselling", "Planned change of anticoagulant", "Cardiologist, obstetrician, haematologist"]}
      />
      <Txt x={190} y={414} size={12.5} fill={GOLD}>{"Exam: give your lecturer's number, know the guideline"}</Txt>
    </>
  );
}

function Artery({ cx, cy, r }: { cx: number; cy: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={36} fill={PLAQUE} stroke="#8A6F1C" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r} fill={RED} />
    </g>
  );
}

function B8() {
  const cols = [
    { cx: 65, r: 24, n: "Mild", a: "33% diameter", b: "50% area" },
    { cx: 190, r: 18, n: "Moderate", a: "50% diameter", b: "75% area" },
    { cx: 315, r: 12, n: "Severe", a: "67% diameter", b: "90% area" },
  ];
  return (
    <>
      {cols.map((c) => (
        <g key={c.n}>
          <Artery cx={c.cx} cy={130} r={c.r} />
          <Txt x={c.cx} y={196} size={14} weight={700}>{c.n}</Txt>
          <Txt x={c.cx} y={214} size={11} fill={MUTED}>{c.a} lost</Txt>
          <Txt x={c.cx} y={229} size={11} fill={GOLD}>{c.b} lost</Txt>
        </g>
      ))}
      <Divider y={256} />
      <Txt x={190} y={284} size={14}>Partial block: angina</Txt>
      <Txt x={190} y={306} size={14}>Complete block: infarction</Txt>
      <Txt x={190} y={338} size={13} fill={MUTED}>Single, double or triple vessel; left main on its own</Txt>
      <Txt x={190} y={376} size={14} fill={GOLD} weight={700}>50% diameter = 75% area lost</Txt>
      <Txt x={190} y={398} size={12} fill={MUTED}>so a moderate stenosis already limits flow</Txt>
    </>
  );
}

function B9() {
  return (
    <>
      <Heart cx={170} cy={140} s={0.8}>
        <path d="M 6 -30 Q 14 20 4 70" fill="none" stroke={CREAM} strokeWidth={5} strokeLinecap="round" />
        <line x1={-4} y1={4} x2={16} y2={24} stroke={NAVY} strokeWidth={5} strokeLinecap="round" />
        <line x1={16} y1={4} x2={-4} y2={24} stroke={NAVY} strokeWidth={5} strokeLinecap="round" />
      </Heart>
      <path d="M 250 90 Q 310 170 178 192" fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" strokeDasharray="1 0" />
      <Txt x={300} y={150} size={13} fill={GOLD} weight={700} anchor="start">LIMA</Txt>
      <Txt x={190} y={252} size={17} fill={GOLD} weight={700}>LIMA loves LAD</Txt>
      <Bullets
        y0={284}
        dy={24}
        size={13}
        items={["Three-system disease, left main stenosis", "Diabetics with multivessel disease", "Poor LV function, graftable vessels"]}
      />
      <Divider y={364} />
      <Txt x={190} y={388} size={12} fill={MUTED}>Watch for: bleeding, AF on days 2 to 4,</Txt>
      <Txt x={190} y={406} size={12} fill={MUTED}>sternal wound infection, stroke, renal injury</Txt>
    </>
  );
}

function B10() {
  return (
    <>
      <circle cx={150} cy={130} r={44} fill={HEART} fillOpacity={0.6} stroke={HEART_EDGE} strokeWidth={3} />
      <line x1={150} y1={96} x2={158} y2={124} stroke={CREAM} strokeWidth={3} />
      <circle cx={162} cy={140} r={20} fill={PLAQUE} stroke="#8A6F1C" strokeWidth={2} />
      <Txt x={218} y={120} size={13} fill={GOLD} weight={700} anchor="start">Myxoma</Txt>
      <Txt x={218} y={138} size={11} fill={MUTED} anchor="start">on a stalk,</Txt>
      <Txt x={218} y={153} size={11} fill={MUTED} anchor="start">left atrium</Txt>
      <Txt x={190} y={218} size={15} fill={GOLD} weight={700}>Commonest primary: myxoma</Txt>
      <Txt x={190} y={242} size={13}>Women aged 30 to 60, left atrium (75%)</Txt>
      <Txt x={190} y={266} size={13}>EOC: Embolism, Obstruction, Constitutional</Txt>
      <Txt x={190} y={290} size={13}>Echo to diagnose; excise with a septal cuff</Txt>
      <Divider y={312} />
      <Txt x={190} y={338} size={13} fill={RED} weight={700}>Angiosarcoma: commonest malignant primary</Txt>
      <Txt x={190} y={360} size={12} fill={MUTED}>very aggressive; survival 3 to 15 months</Txt>
      <Txt x={190} y={392} size={13} fill={GOLD}>Most heart tumours are secondary, always malignant</Txt>
    </>
  );
}

export default function CardiacStageSvg({ stage }: { stage: CardiacStage }) {
  let scene: ReactNode;
  switch (stage.kind) {
    case "a1": scene = <A1 />; break;
    case "a2": scene = <A2 />; break;
    case "a3": scene = <A3 />; break;
    case "a4": scene = <A4 />; break;
    case "a5": scene = <A5 />; break;
    case "a6": scene = <A6 />; break;
    case "a7": scene = <A7 />; break;
    case "a8": scene = <A8 />; break;
    case "a9": scene = <A9 />; break;
    case "b1": scene = <B1 />; break;
    case "b2": scene = <B2 />; break;
    case "b3": scene = <B3 />; break;
    case "b4": scene = <B4 />; break;
    case "b5": scene = <B5 />; break;
    case "b6": scene = <B6 />; break;
    case "b7": scene = <B7 />; break;
    case "b8": scene = <B8 />; break;
    case "b9": scene = <B9 />; break;
    case "b10": scene = <B10 />; break;
    default: scene = null;
  }
  return <Frame title={stage.label}>{scene}</Frame>;
}
