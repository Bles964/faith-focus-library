import type { ReactNode } from "react";

export type PelvisKind =
  | "ring" | "stable" | "tile" | "yb" | "resus" | "binder" | "organs"
  | "urethra" | "blood" | "treat" | "acet" | "medic" | "decide";

export type PelvisStage = { kind: PelvisKind; label: string; narration: string };

const NAVY = "#0B1F3A";
const CARD = "#14294D";
const LINE = "#2A3E5C";
const GOLD = "#D4AF37";
const CREAM = "#F4F1EA";
const MUTED = "#9AA6B8";
const RED = "#E5584F";
const GREEN = "#5BBF8A";
const BLUE = "#5B9BD5";
const BONE = "#EDE6D3";
const BONE_EDGE = "#B9AE92";
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

function Crack({ pts, color = RED, width = 3 }: { pts: string; color?: string; width?: number }) {
  return <polyline points={pts} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" />;
}

function Card({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children?: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={CARD} stroke={LINE} strokeWidth={1.5} />
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

/* ---------- Pelvis drawing ---------- */

type Half = { dx?: number; dy?: number; rot?: number };

function HipHalf({ side, dx = 0, dy = 0, rot = 0 }: Half & { side: 1 | -1 }) {
  return (
    <g transform={`translate(${dx} ${dy}) rotate(${rot} 0 64)`}>
      <g transform={`scale(${side} 1)`}>
        <path d="M 75 -8 Q 72 52 6 64" fill="none" stroke={BONE_EDGE} strokeWidth={22} strokeLinecap="round" />
        <path d="M 75 -8 Q 72 52 6 64" fill="none" stroke={BONE} strokeWidth={17} strokeLinecap="round" />
        <ellipse cx={62} cy={-25} rx={44} ry={36} fill={BONE} stroke={BONE_EDGE} strokeWidth={2} transform="rotate(25 62 -25)" />
        <circle cx={56} cy={52} r={12} fill={BONE} stroke={BONE_EDGE} strokeWidth={2} />
      </g>
    </g>
  );
}

function Pelvis({
  cx, cy, s = 1, left, right, open = false, crack,
}: {
  cx: number; cy: number; s?: number; left?: Half; right?: Half; open?: boolean; crack?: string;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s})`}>
      <polygon points="-24,-52 24,-52 12,30 -12,30" fill="#D8CFB6" stroke={BONE_EDGE} strokeWidth={2} />
      <HipHalf side={-1} {...(left || {})} />
      <HipHalf side={1} {...(right || {})} />
      {open ? (
        <rect x={-9} y={56} width={18} height={16} fill={RED} />
      ) : (
        <rect x={-3} y={58} width={6} height={12} fill={GOLD} />
      )}
      {crack && <Crack pts={crack} />}
    </g>
  );
}

/* ---------- Scenes ---------- */

function SceneRing() {
  return (
    <>
      <Pelvis cx={190} cy={185} s={1.05} />
      <Txt x={190} y={300} size={15}>
        <tspan fill={GOLD} fontWeight={700}>Ilium</tspan>: the wing on top
      </Txt>
      <Txt x={190} y={322} size={15}>
        <tspan fill={GOLD} fontWeight={700}>Ischium</tspan>: the bone you sit on
      </Txt>
      <Txt x={190} y={344} size={15}>
        <tspan fill={GOLD} fontWeight={700}>Pubis</tspan>: joins at the front
      </Txt>
      <Txt x={190} y={372} size={14} fill={MUTED}>All three meet at the acetabulum, the hip socket</Txt>
      <Txt x={190} y={406} size={14} fill={RED} weight={700}>High energy: look for other injuries</Txt>
    </>
  );
}

function SceneStable() {
  return (
    <>
      <Pelvis cx={95} cy={185} s={0.72} crack="22,62 32,52 24,44" />
      <Pelvis cx={285} cy={185} s={0.72} open left={{ dx: -12, rot: -9 }} right={{ dx: 12, rot: 9 }} />
      <Txt x={95} y={284} size={18} fill={GREEN} weight={700}>Stable</Txt>
      <Txt x={95} y={304} size={12} fill={MUTED}>one crack, ring holds</Txt>
      <Txt x={285} y={284} size={18} fill={RED} weight={700}>Unstable</Txt>
      <Txt x={285} y={304} size={12} fill={MUTED}>comes apart under load</Txt>
      <line x1={50} y1={328} x2={330} y2={328} stroke={LINE} strokeWidth={1.5} />
      <Txt x={190} y={356} size={17} weight={700}>Open-book injury</Txt>
      <Txt x={190} y={378} size={13} fill={MUTED}>symphysis splits open like a book</Txt>
      <Txt x={190} y={400} size={13} fill={RED}>the pelvis holds much more blood</Txt>
    </>
  );
}

function SceneTile() {
  const cols = [
    { cx: 65, l: "A", n: "Stable", sub: "ring intact" },
    { cx: 190, l: "B", n: "Rotation only", sub: "open-book" },
    { cx: 315, l: "C", n: "Both unstable", sub: "worst bleeding" },
  ];
  return (
    <>
      <Pelvis cx={65} cy={160} s={0.5} crack="20,62 30,52 22,44" />
      <Pelvis cx={190} cy={160} s={0.5} open left={{ dx: -10, rot: -9 }} right={{ dx: 10, rot: 9 }} />
      <Pelvis cx={315} cy={160} s={0.5} open left={{ dx: -10, rot: -9 }} right={{ dx: 10, dy: -30, rot: 9 }} />
      {cols.map((c) => (
        <g key={c.l}>
          <Txt x={c.cx} y={252} size={30} fill={GOLD} weight={700}>{c.l}</Txt>
          <Txt x={c.cx} y={274} size={13} weight={700}>{c.n}</Txt>
          <Txt x={c.cx} y={292} size={11} fill={MUTED}>{c.sub}</Txt>
        </g>
      ))}
      <line x1={50} y1={318} x2={330} y2={318} stroke={LINE} strokeWidth={1.5} />
      <Txt x={190} y={348} size={16} fill={GOLD} weight={700}>{"Alright, Bends, Can't hold"}</Txt>
      <Txt x={190} y={374} size={13} fill={MUTED}>Type B = rotationally unstable only</Txt>
      <Txt x={190} y={396} size={13} fill={RED}>Type C = vertical + rotational</Txt>
    </>
  );
}

function SceneYB() {
  const cards = [
    { x: 15, y: 90, code: "APC", sub: "front-to-back" },
    { x: 205, y: 90, code: "LC", sub: "from the side" },
    { x: 15, y: 235, code: "VS", sub: "vertical shear" },
    { x: 205, y: 235, code: "CM", sub: "combined forces" },
  ];
  return (
    <>
      {cards.map((c) => (
        <Card key={c.code} x={c.x} y={c.y} w={160} h={135}>
          <Txt x={c.x + 80} y={c.y + 108} size={17} fill={GOLD} weight={700}>{c.code}</Txt>
          <Txt x={c.x + 80} y={c.y + 125} size={11} fill={MUTED}>{c.sub}</Txt>
        </Card>
      ))}
      {/* APC */}
      <Pelvis cx={95} cy={152} s={0.42} open left={{ dx: -8, rot: -8 }} right={{ dx: 8, rot: 8 }} />
      <Arrow x1={47} y1={142} x2={22} y2={142} />
      <Arrow x1={143} y1={142} x2={168} y2={142} />
      {/* LC */}
      <Pelvis cx={285} cy={152} s={0.42} />
      <Arrow x1={212} y1={142} x2={238} y2={142} />
      <Arrow x1={358} y1={142} x2={332} y2={142} />
      {/* VS */}
      <Pelvis cx={95} cy={297} s={0.42} right={{ dy: -18 }} />
      <Arrow x1={152} y1={325} x2={152} y2={290} color={GOLD} />
      {/* CM */}
      <Pelvis cx={285} cy={297} s={0.42} right={{ dy: -14 }} />
      <Arrow x1={212} y1={287} x2={238} y2={287} />
      <Arrow x1={342} y1={325} x2={342} y2={292} color={GOLD} />
      <Txt x={190} y={405} size={14} fill={GOLD}>A Lovely Vintage Car</Txt>
    </>
  );
}

function SceneResus() {
  const rows = [
    { t: "Two wide-bore 16G lines", s: "even if not yet shocked" },
    { t: "Crystalloid fluids", s: "" },
    { t: "Blood for count + crossmatch", s: "" },
    { t: "Early pain relief", s: "" },
  ];
  return (
    <>
      {rows.map((r, i) => (
        <g key={r.t}>
          <circle cx={52} cy={104 + i * 62} r={17} fill={GOLD} />
          <Txt x={52} y={111 + i * 62} size={19} fill={NAVY} weight={700}>{String(i + 1)}</Txt>
          <Txt x={84} y={109 + i * 62} size={17} anchor="start">{r.t}</Txt>
          {r.s && <Txt x={84} y={127 + i * 62} size={12} fill={MUTED} anchor="start">{r.s}</Txt>}
        </g>
      ))}
      <line x1={50} y1={352} x2={330} y2={352} stroke={LINE} strokeWidth={1.5} />
      <Txt x={190} y={386} size={19} fill={GOLD} weight={700}>Resus before radiology</Txt>
      <Txt x={190} y={408} size={13} fill={MUTED}>ABC first, X-ray later</Txt>
    </>
  );
}

function SceneBinder() {
  return (
    <>
      <Pelvis cx={190} cy={170} s={1} />
      <rect x={62} y={188} width={256} height={24} rx={6} fill={GOLD} fillOpacity={0.9} />
      <Txt x={190} y={205} size={13} fill={NAVY} weight={700}>SHEET OVER THE TROCHANTERS</Txt>
      <Arrow x1={38} y1={200} x2={60} y2={200} color={GOLD} />
      <Arrow x1={342} y1={200} x2={320} y2={200} color={GOLD} />
      <Txt x={60} y={310} size={16} anchor="start">
        <tspan fill={GOLD} fontWeight={700}>Binder</tspan>: shrinks pelvic volume
      </Txt>
      <Txt x={60} y={336} size={16} anchor="start">
        <tspan fill={GOLD} fontWeight={700}>Blood</tspan>: transfuse
      </Txt>
      <Txt x={60} y={362} size={16} anchor="start">
        <tspan fill={GOLD} fontWeight={700}>Brake</tspan>: external fixator, then surgery
      </Txt>
      <Txt x={190} y={408} size={14} fill={RED} weight={700}>{"Don't keep rocking the pelvis"}</Txt>
    </>
  );
}

function SceneOrgans() {
  return (
    <>
      <Arrow x1={40} y1={104} x2={40} y2={270} color={MUTED} w={2} />
      <Txt x={40} y={92} size={11} fill={MUTED}>front</Txt>
      <Txt x={40} y={292} size={11} fill={MUTED}>back</Txt>
      <ellipse cx={110} cy={130} rx={40} ry={26} fill={BLUE} fillOpacity={0.85} />
      <ellipse cx={110} cy={196} rx={26} ry={30} fill="#D98BA5" fillOpacity={0.9} />
      <rect x={90} y={236} width={40} height={50} rx={18} fill="#A67B5B" />
      <Txt x={170} y={137} size={19} weight={700} anchor="start">Bladder</Txt>
      <Txt x={170} y={203} size={19} weight={700} anchor="start">Uterus</Txt>
      <Txt x={170} y={219} size={12} fill={MUTED} anchor="start">in women</Txt>
      <Txt x={170} y={266} size={19} weight={700} anchor="start">Rectum</Txt>
      <line x1={50} y1={312} x2={330} y2={312} stroke={LINE} strokeWidth={1.5} />
      <Txt x={190} y={338} size={15} fill={GOLD} weight={700}>6 questions: A-V-A-I-B-S</Txt>
      <Txt x={190} y={362} size={12.5} fill={MUTED}>Airway · Ventilation · Active bleeding</Txt>
      <Txt x={190} y={382} size={12.5} fill={MUTED}>Intra-abdominal · Bladder/urethra · Stability</Txt>
    </>
  );
}

function SceneUrethra() {
  return (
    <>
      <circle cx={190} cy={148} r={52} fill="none" stroke={RED} strokeWidth={8} />
      <line x1={150} y1={148} x2={232} y2={148} stroke={CREAM} strokeWidth={9} strokeLinecap="round" />
      <line x1={153} y1={111} x2={227} y2={185} stroke={RED} strokeWidth={8} strokeLinecap="round" />
      <Txt x={190} y={246} size={20} fill={RED} weight={700}>Blood at the meatus</Txt>
      <Txt x={190} y={276} size={18} weight={700}>Do NOT catheterize</Txt>
      <Txt x={190} y={298} size={12} fill={MUTED}>A blind catheter can turn a partial tear into a complete one</Txt>
      <line x1={50} y1={320} x2={330} y2={320} stroke={LINE} strokeWidth={1.5} />
      <Txt x={190} y={348} size={16} fill={GOLD} weight={700}>Call the urologist</Txt>
      <Txt x={190} y={370} size={15} fill={GOLD}>or suprapubic cystostomy</Txt>
      <Txt x={190} y={402} size={12} fill={MUTED}>Bladder rupture: laparotomy and repair</Txt>
    </>
  );
}

function Drop({ cx, cy, label }: { cx: number; cy: number; label: string }) {
  return (
    <g>
      <path
        d={`M ${cx} ${cy - 28} C ${cx + 24} ${cy - 4} ${cx + 22} ${cy + 20} ${cx} ${cy + 20} C ${cx - 22} ${cy + 20} ${cx - 24} ${cy - 4} ${cx} ${cy - 28} Z`}
        fill={RED}
      />
      <Txt x={cx} y={cy + 9} size={14} fill={CREAM} weight={700}>{label}</Txt>
    </g>
  );
}

function SceneBlood() {
  return (
    <>
      <Card x={15} y={88} w={160} h={125}>
        <Drop cx={95} cy={140} label="O-" />
        <Txt x={95} y={185} size={14} weight={700}>Bleeding now</Txt>
        <Txt x={95} y={203} size={12} fill={MUTED}>O-negative</Txt>
      </Card>
      <Card x={205} y={88} w={160} h={125}>
        <Drop cx={285} cy={140} label="=" />
        <Txt x={285} y={185} size={14} weight={700}>Can wait</Txt>
        <Txt x={285} y={203} size={12} fill={MUTED}>type-specific</Txt>
      </Card>
      <Txt x={190} y={244} size={15} fill={GOLD} weight={700}>Clot risk: S-O-R-D-M-O</Txt>
      <Txt x={190} y={268} size={13}>Smoker · Obese · Recumbent</Txt>
      <Txt x={190} y={288} size={13}>Diabetes · Multiple injuries</Txt>
      <Txt x={190} y={308} size={13}>Oral contraceptive</Txt>
      <line x1={50} y1={330} x2={330} y2={330} stroke={LINE} strokeWidth={1.5} />
      <Txt x={190} y={358} size={14} fill={MUTED}>Prevent with</Txt>
      <Txt x={190} y={382} size={16} fill={GOLD} weight={700}>Enoxaparin (injection)</Txt>
      <Txt x={190} y={404} size={16} fill={GOLD} weight={700}>or oral rivaroxaban</Txt>
    </>
  );
}

function SceneTreat() {
  const stable = ["Counsel the patient", "Non-weight-bearing", "for 6 weeks", "then partial", "weight-bearing"];
  const unstable = ["Resuscitate", "Binder or", "external fixator", "then internal", "fixation as needed"];
  return (
    <>
      <Card x={15} y={88} w={160} h={290}>
        <Txt x={95} y={122} size={18} fill={GREEN} weight={700}>Stable</Txt>
        <Txt x={95} y={142} size={12} fill={MUTED}>conservative</Txt>
        {stable.map((t, i) => (
          <Txt key={t} x={95} y={190 + i * 34} size={14}>{t}</Txt>
        ))}
      </Card>
      <Card x={205} y={88} w={160} h={290}>
        <Txt x={285} y={122} size={18} fill={RED} weight={700}>Unstable</Txt>
        <Txt x={285} y={142} size={12} fill={MUTED}>stabilise the ring</Txt>
        {unstable.map((t, i) => (
          <Txt key={t} x={285} y={190 + i * 34} size={14}>{t}</Txt>
        ))}
      </Card>
      <Txt x={190} y={412} size={14} fill={GOLD}>6 weeks Non, then Partial</Txt>
    </>
  );
}

function SceneAcet() {
  const items = [
    ["A", "Anterior column"],
    ["P", "Posterior column"],
    ["T", "Transverse"],
    ["C", "Central: head pushed in"],
  ];
  return (
    <>
      <path d="M 215 136 A 70 70 0 1 0 215 244" fill="none" stroke={BONE_EDGE} strokeWidth={20} strokeLinecap="round" />
      <path d="M 215 136 A 70 70 0 1 0 215 244" fill="none" stroke={BONE} strokeWidth={15} strokeLinecap="round" />
      <circle cx={195} cy={190} r={42} fill={BONE} stroke={BONE_EDGE} strokeWidth={2} />
      <rect x={228} y={168} width={80} height={30} rx={12} fill={BONE} stroke={BONE_EDGE} strokeWidth={2} />
      <Txt x={96} y={96} size={13} fill={GOLD} weight={700}>socket</Txt>
      <Txt x={300} y={150} size={13} fill={GOLD} weight={700}>ball</Txt>
      <Txt x={190} y={282} size={12} fill={MUTED}>If the ball no longer fits, the hip wears out early</Txt>
      {items.map(([l, w], i) => (
        <g key={l}>
          <circle cx={62} cy={314 + i * 28} r={11} fill={GOLD} />
          <Txt x={62} y={319 + i * 28} size={14} fill={NAVY} weight={700}>{l}</Txt>
          <Txt x={84} y={319 + i * 28} size={15} anchor="start">{w}</Txt>
        </g>
      ))}
    </>
  );
}

function SceneMedic() {
  const rows: [string, string, string][] = [
    ["M", "Minimal displacement", "under 3 mm"],
    ["E", "Elderly", "closed reduction feasible"],
    ["D", "Doesn't involve the roof", "weight-bearing zone spared"],
    ["I", "Intact congruence", "the ball still fits"],
    ["C", "Condition stops surgery", "e.g. uncontrolled diabetes"],
  ];
  return (
    <>
      {rows.map(([l, w, s], i) => (
        <g key={l}>
          <circle cx={58} cy={104 + i * 66} r={21} fill={GOLD} />
          <Txt x={58} y={112 + i * 66} size={23} fill={NAVY} weight={700}>{l}</Txt>
          <Txt x={92} y={103 + i * 66} size={17} anchor="start">{w}</Txt>
          <Txt x={92} y={122 + i * 66} size={12} fill={MUTED} anchor="start">{s}</Txt>
        </g>
      ))}
    </>
  );
}

function SceneDecide() {
  return (
    <>
      <Card x={15} y={88} w={160} h={190}>
        <Txt x={95} y={122} size={18} fill={GREEN} weight={700}>Conservative</Txt>
        <Txt x={95} y={170} size={14}>Congruent hip</Txt>
        <Txt x={95} y={204} size={14}>Roof intact</Txt>
        <Txt x={95} y={238} size={14}>Small gap</Txt>
      </Card>
      <Card x={205} y={88} w={160} h={190}>
        <Txt x={285} y={122} size={18} fill={RED} weight={700}>Operate</Txt>
        <Txt x={285} y={170} size={14}>Roof involved</Txt>
        <Txt x={285} y={204} size={14}>or hip incongruent</Txt>
        <Txt x={285} y={238} size={14}>Reduce + fix</Txt>
      </Card>
      <Txt x={190} y={322} size={15} fill={GOLD} weight={700}>CIPO: older patients do better</Txt>
      <Txt x={190} y={348} size={14}>Children: traction for about 6 weeks</Txt>
      <Txt x={190} y={372} size={12} fill={MUTED}>Weight-bearing only once fixation is stable</Txt>
    </>
  );
}

export default function PelvisStageSvg({ stage }: { stage: PelvisStage }) {
  let scene: ReactNode;
  switch (stage.kind) {
    case "ring": scene = <SceneRing />; break;
    case "stable": scene = <SceneStable />; break;
    case "tile": scene = <SceneTile />; break;
    case "yb": scene = <SceneYB />; break;
    case "resus": scene = <SceneResus />; break;
    case "binder": scene = <SceneBinder />; break;
    case "organs": scene = <SceneOrgans />; break;
    case "urethra": scene = <SceneUrethra />; break;
    case "blood": scene = <SceneBlood />; break;
    case "treat": scene = <SceneTreat />; break;
    case "acet": scene = <SceneAcet />; break;
    case "medic": scene = <SceneMedic />; break;
    case "decide": scene = <SceneDecide />; break;
    default: scene = null;
  }
  return <Frame title={stage.label}>{scene}</Frame>;
}
