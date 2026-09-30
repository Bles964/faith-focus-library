import type { ReactNode } from "react";

export type FractureKind =
  | "what" | "classify" | "joint" | "tar" | "complete" | "skin" | "patterns"
  | "assess" | "twos" | "reduce" | "hold" | "compartment" | "healing" | "kids";

export type FractureStage = { kind: FractureKind; label: string; narration: string };

const NAVY = "#0B1F3A";
const CARD = "#14294D";
const LINE = "#2A3E5C";
const GOLD = "#D4AF37";
const CREAM = "#F4F1EA";
const MUTED = "#9AA6B8";
const RED = "#E5584F";
const GREEN = "#5BBF8A";
const BONE = "#EDE6D3";
const BONE_EDGE = "#B9AE92";
const SKIN = "#C98E6B";
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

function Bone({ x, y, w, h, r = 6 }: { x: number; y: number; w: number; h: number; r?: number }) {
  return <rect x={x} y={y} width={w} height={h} rx={r} fill={BONE} stroke={BONE_EDGE} strokeWidth={2} />;
}

function Crack({ pts, color = RED, width = 3 }: { pts: string; color?: string; width?: number }) {
  return <polyline points={pts} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" />;
}

function Card({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children: ReactNode }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={14} fill={CARD} stroke={LINE} strokeWidth={1.5} />
      {children}
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

/* ---------- Scenes ---------- */

function SceneWhat() {
  return (
    <>
      <Bone x={165} y={100} w={50} h={120} />
      <Bone x={165} y={240} w={50} h={120} />
      <Crack pts="158,224 174,240 188,222 203,240 216,222 224,236" width={4} />
      <Txt x={190} y={396} size={14} fill={MUTED}>Trauma · Fall · Sport · Assault</Txt>
      <Txt x={190} y={416} size={14} fill={MUTED}>Osteoporosis · Tumour · Infection</Txt>
    </>
  );
}

function SceneClassify() {
  const rows = [["J", "Joint involvement"], ["D", "Displacement"], ["C", "Completeness"], ["S", "Skin"], ["P", "Pattern"]];
  return (
    <>
      {rows.map(([l, w], i) => (
        <g key={l}>
          <circle cx={70} cy={115 + i * 64} r={23} fill={GOLD} />
          <Txt x={70} y={123 + i * 64} size={24} fill={NAVY} weight={700}>{l}</Txt>
          <Txt x={112} y={122 + i * 64} size={20} anchor="start">{w}</Txt>
        </g>
      ))}
    </>
  );
}

function JointPanel({ cx, intra }: { cx: number; intra: boolean }) {
  return (
    <g>
      <Bone x={cx - 20} y={150} w={40} h={190} r={8} />
      <ellipse cx={cx} cy={148} rx={38} ry={24} fill={BONE} stroke={BONE_EDGE} strokeWidth={2} />
      {intra ? (
        <Crack pts={`${cx - 4},126 ${cx + 8},150 ${cx - 6},172 ${cx + 6},198`} />
      ) : (
        <Crack pts={`${cx - 22},262 ${cx - 8},272 ${cx + 6},260 ${cx + 22},270`} />
      )}
    </g>
  );
}

function SceneJoint() {
  return (
    <>
      <JointPanel cx={95} intra />
      <JointPanel cx={285} intra={false} />
      <Txt x={95} y={374} size={15} fill={GOLD} weight={700}>Intra-articular</Txt>
      <Txt x={95} y={394} size={12} fill={MUTED}>into the joint</Txt>
      <Txt x={95} y={414} size={12} fill={RED}>arthritis risk</Txt>
      <Txt x={285} y={374} size={15} fill={GOLD} weight={700}>Extra-articular</Txt>
      <Txt x={285} y={394} size={12} fill={MUTED}>outside the joint</Txt>
    </>
  );
}

function TarPanel({ cx, mode }: { cx: number; mode: "T" | "A" | "R" }) {
  return (
    <g>
      <Bone x={cx - 14} y={235} w={28} h={100} />
      {mode === "T" && <Bone x={cx + 8} y={125} w={28} h={100} />}
      {mode === "A" && (
        <g transform={`rotate(24 ${cx} 228)`}>
          <Bone x={cx - 14} y={125} w={28} h={100} />
        </g>
      )}
      {mode === "R" && (
        <g>
          <Bone x={cx - 14} y={125} w={28} h={100} />
          <line x1={cx - 14} y1={150} x2={cx + 14} y2={150} stroke={RED} strokeWidth={3} />
          <line x1={cx - 14} y1={175} x2={cx + 14} y2={175} stroke={RED} strokeWidth={3} />
          <path d={`M ${cx - 26} 118 A 26 12 0 0 1 ${cx + 26} 118`} fill="none" stroke={GOLD} strokeWidth={3} />
          <polygon points={`${cx + 26},124 ${cx + 19},114 ${cx + 33},114`} fill={GOLD} />
        </g>
      )}
      <Txt x={cx} y={374} size={30} fill={GOLD} weight={700}>{mode}</Txt>
      <Txt x={cx} y={398} size={13}>{mode === "T" ? "Translation" : mode === "A" ? "Angulation" : "Rotation"}</Txt>
    </g>
  );
}

function SceneTar() {
  return (
    <>
      <TarPanel cx={65} mode="T" />
      <TarPanel cx={190} mode="A" />
      <TarPanel cx={315} mode="R" />
    </>
  );
}

function SceneComplete() {
  return (
    <>
      <Txt x={190} y={92} size={12} fill={MUTED}>Incomplete fracture: bone only partly divided</Txt>
      <path d="M 150 390 L 175 250 L 270 140" fill="none" stroke={BONE_EDGE} strokeWidth={42} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 150 390 L 175 250 L 270 140" fill="none" stroke={BONE} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" />
      <Crack pts="152,232 166,246 176,252" width={4} />
      <Txt x={132} y={226} size={15} fill={RED} weight={700} anchor="end">cracks</Txt>
      <Txt x={132} y={244} size={12} fill={MUTED} anchor="end">outer cortex</Txt>
      <Txt x={222} y={290} size={15} fill={GREEN} weight={700} anchor="start">bends</Txt>
      <Txt x={222} y={308} size={12} fill={MUTED} anchor="start">other cortex</Txt>
      <Txt x={190} y={412} size={13} fill={CREAM}>Children: elastic bone + thick periosteum</Txt>
    </>
  );
}

function SkinPanel({ cx, open }: { cx: number; open: boolean }) {
  return (
    <g>
      <rect x={cx - 50} y={105} width={100} height={240} rx={40} fill={SKIN} fillOpacity={0.3} stroke={SKIN} strokeWidth={3} />
      <Bone x={cx - 14} y={120} w={28} h={94} />
      <Bone x={cx - 14} y={234} w={28} h={100} />
      <Crack pts={`${cx - 16},218 ${cx - 5},232 ${cx + 5},216 ${cx + 16},230`} />
      {open && (
        <>
          <polygon points={`${cx - 56},205 ${cx - 20},224 ${cx - 56},244`} fill={RED} />
          <circle cx={cx - 72} cy={216} r={4} fill={GREEN} />
          <circle cx={cx - 84} cy={230} r={3} fill={GREEN} />
          <circle cx={cx - 70} cy={246} r={4} fill={GREEN} />
        </>
      )}
    </g>
  );
}

function SceneSkin() {
  return (
    <>
      <SkinPanel cx={95} open={false} />
      <SkinPanel cx={285} open />
      <Txt x={95} y={374} size={17} weight={700}>Closed</Txt>
      <Txt x={95} y={394} size={12} fill={MUTED}>no outside contact</Txt>
      <Txt x={285} y={374} size={17} fill={RED} weight={700}>Open</Txt>
      <Txt x={285} y={394} size={12} fill={MUTED}>wound reaches the fracture</Txt>
      <Txt x={285} y={414} size={12} fill={RED} weight={700}>Orthopaedic emergency</Txt>
    </>
  );
}

function ScenePatterns() {
  const cols = [
    { cx: 40, name: "Transverse", sub: "bending force" },
    { cx: 115, name: "Oblique", sub: "diagonal" },
    { cx: 190, name: "Spiral", sub: "twisting force" },
    { cx: 265, name: "Comminuted", sub: "3+ fragments" },
    { cx: 340, name: "Pathological", sub: "diseased bone" },
  ];
  return (
    <>
      {cols.map((c) => (
        <g key={c.name}>
          <Bone x={c.cx - 11} y={110} w={22} h={170} />
          <Txt x={c.cx} y={322} size={11} weight={700}>{c.name}</Txt>
          <Txt x={c.cx} y={338} size={10} fill={MUTED}>{c.sub}</Txt>
        </g>
      ))}
      <Crack pts="29,195 51,195" />
      <Crack pts="104,170 126,220" />
      <Crack pts="176,165 200,180 180,195 200,210 180,225 204,240" />
      <Crack pts="251,170 269,200 251,225" />
      <Crack pts="279,185 261,205 279,235" />
      <ellipse cx={340} cy={195} rx={13} ry={18} fill="#3B2A2A" stroke={RED} strokeWidth={2} strokeDasharray="4 3" />
      <Crack pts="329,195 351,203" />
      <Txt x={190} y={384} size={15} fill={GOLD}>Twist → spiral</Txt>
      <Txt x={190} y={406} size={15} fill={GOLD}>Crushed → comminuted</Txt>
    </>
  );
}

function SceneAssess() {
  const rows = [["A", "Airway + C-spine"], ["B", "Breathing"], ["C", "Circulation"], ["D", "Disability"], ["E", "Exposure"]];
  return (
    <>
      {rows.map(([l, w], i) => (
        <g key={l}>
          <circle cx={70} cy={105 + i * 46} r={17} fill={GOLD} />
          <Txt x={70} y={112 + i * 46} size={19} fill={NAVY} weight={700}>{l}</Txt>
          <Txt x={104} y={111 + i * 46} size={18} anchor="start">{w}</Txt>
        </g>
      ))}
      <line x1={50} y1={345} x2={330} y2={345} stroke={LINE} strokeWidth={1.5} />
      <Txt x={190} y={372} size={15} fill={GOLD} weight={700}>Then: Pulse · Power · Perception</Txt>
      <Txt x={190} y={396} size={14} fill={MUTED}>Joint above + fracture + joint below</Txt>
    </>
  );
}

function SceneTwos() {
  const items = [
    { l: "V", t: "2 Views", s: "AP + lateral", x: 25, y: 100 },
    { l: "J", t: "2 Joints", s: "above + below", x: 205, y: 100 },
    { l: "O", t: "2 Occasions", s: "before + after", x: 25, y: 250 },
    { l: "L", t: "2 Limbs", s: "compare sides", x: 205, y: 250 },
  ];
  return (
    <>
      {items.map((it) => (
        <Card key={it.l} x={it.x} y={it.y} w={150} h={130}>
          <Txt x={it.x + 75} y={it.y + 52} size={40} fill={GOLD} weight={700}>{it.l}</Txt>
          <Txt x={it.x + 75} y={it.y + 88} size={17} weight={700}>{it.t}</Txt>
          <Txt x={it.x + 75} y={it.y + 110} size={12} fill={MUTED}>{it.s}</Txt>
        </Card>
      ))}
    </>
  );
}

function SceneReduce() {
  return (
    <>
      <Bone x={88} y={95} w={30} h={62} />
      <Bone x={118} y={167} w={30} h={62} />
      <Crack pts="86,162 100,170 112,160" />
      <line x1={120} y1={240} x2={120} y2={262} stroke={GOLD} strokeWidth={4} />
      <polygon points="108,260 132,260 120,278" fill={GOLD} />
      <Bone x={105} y={290} w={30} h={120} />
      <rect x={138} y={305} width={8} height={90} rx={2} fill={GOLD} />
      <circle cx={142} cy={318} r={3.5} fill="#8A6F1C" />
      <circle cx={142} cy={350} r={3.5} fill="#8A6F1C" />
      <circle cx={142} cy={382} r={3.5} fill="#8A6F1C" />
      <Txt x={215} y={150} size={24} fill={GOLD} weight={700} anchor="start">REDUCE</Txt>
      <Txt x={215} y={174} size={15} anchor="start">put it back</Txt>
      <Txt x={215} y={335} size={24} fill={GOLD} weight={700} anchor="start">FIX</Txt>
      <Txt x={215} y={359} size={15} anchor="start">keep it there</Txt>
    </>
  );
}

function HBone({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <Bone x={cx - 48} y={cy - 9} w={45} h={18} r={6} />
      <Bone x={cx + 3} y={cy - 9} w={45} h={18} r={6} />
    </g>
  );
}

function SceneHold() {
  const cards = [
    { x: 15, y: 95, t: "Plaster cast", s: "watch neurovascular" },
    { x: 205, y: 95, t: "Traction", s: "skin or skeletal" },
    { x: 15, y: 245, t: "Internal fixation", s: "plates, screws, nails" },
    { x: 205, y: 245, t: "External fixation", s: "pins + outside frame" },
  ];
  return (
    <>
      {cards.map((c) => (
        <Card key={c.t} x={c.x} y={c.y} w={160} h={140}>
          <Txt x={c.x + 80} y={c.y + 112} size={14} weight={700}>{c.t}</Txt>
          <Txt x={c.x + 80} y={c.y + 130} size={11} fill={MUTED}>{c.s}</Txt>
        </Card>
      ))}
      {/* Cast */}
      <HBone cx={95} cy={145} />
      <rect x={38} y={129} width={114} height={32} rx={14} fill={CREAM} fillOpacity={0.3} stroke={CREAM} strokeWidth={2} />
      {/* Traction */}
      <HBone cx={285} cy={145} />
      <line x1={233} y1={145} x2={210} y2={145} stroke={GOLD} strokeWidth={3} />
      <polygon points="208,145 218,138 218,152" fill={GOLD} />
      <line x1={337} y1={145} x2={360} y2={145} stroke={GOLD} strokeWidth={3} />
      <polygon points="362,145 352,138 352,152" fill={GOLD} />
      {/* Internal fixation */}
      <HBone cx={95} cy={295} />
      <rect x={62} y={278} width={66} height={7} rx={2} fill={GOLD} />
      <circle cx={72} cy={281.5} r={2.5} fill="#8A6F1C" />
      <circle cx={95} cy={281.5} r={2.5} fill="#8A6F1C" />
      <circle cx={118} cy={281.5} r={2.5} fill="#8A6F1C" />
      {/* External fixation */}
      <HBone cx={285} cy={295} />
      <line x1={255} y1={286} x2={255} y2={262} stroke={GOLD} strokeWidth={3} />
      <line x1={315} y1={286} x2={315} y2={262} stroke={GOLD} strokeWidth={3} />
      <rect x={248} y={256} width={74} height={7} rx={2} fill={GOLD} />
    </>
  );
}

function SceneCompartment() {
  const items = [
    "Severe pain, out of proportion",
    "Pain on passive stretch",
    "Tense, swollen compartment",
    "Pulse may still be present",
  ];
  return (
    <>
      <circle cx={190} cy={170} r={62} fill={RED} fillOpacity={0.18} stroke={RED} strokeWidth={3} />
      <circle cx={190} cy={170} r={18} fill={BONE} stroke={BONE_EDGE} strokeWidth={2} />
      <polygon points="180,94 200,94 190,112" fill={RED} />
      <polygon points="180,246 200,246 190,228" fill={RED} />
      <polygon points="116,160 116,180 134,170" fill={RED} />
      <polygon points="264,160 264,180 246,170" fill={RED} />
      {items.map((t, i) => (
        <g key={t}>
          <circle cx={42} cy={278 + i * 28} r={4} fill={GOLD} />
          <Txt x={56} y={283 + i * 28} size={15} anchor="start">{t}</Txt>
        </g>
      ))}
      <Txt x={190} y={412} size={16} fill={RED} weight={700}>{"Don't wait for pulselessness"}</Txt>
    </>
  );
}

function SceneHealing() {
  return (
    <>
      {/* Delayed union */}
      <Bone x={54} y={110} w={22} h={92} />
      <Bone x={54} y={210} w={22} h={92} />
      <rect x={48} y={198} width={34} height={14} rx={4} fill={GOLD} fillOpacity={0.4} stroke={GOLD} strokeDasharray="4 3" />
      {/* Non-union */}
      <Bone x={179} y={110} w={22} h={86} />
      <Bone x={179} y={232} w={22} h={70} />
      <Crack pts="181,206 199,222" width={4} />
      <Crack pts="199,206 181,222" width={4} />
      {/* Malunion */}
      <Bone x={304} y={215} w={22} h={90} />
      <g transform="rotate(22 315 212)">
        <Bone x={304} y={115} w={22} h={95} />
      </g>
      <ellipse cx={315} cy={212} rx={20} ry={9} fill={GOLD} fillOpacity={0.7} />
      <Txt x={65} y={340} size={12.5} weight={700}>Delayed union</Txt>
      <Txt x={65} y={358} size={11} fill={MUTED}>slow healing</Txt>
      <Txt x={190} y={340} size={12.5} weight={700}>Non-union</Txt>
      <Txt x={190} y={358} size={11} fill={MUTED}>fails to unite</Txt>
      <Txt x={315} y={340} size={12.5} weight={700}>Malunion</Txt>
      <Txt x={315} y={358} size={11} fill={MUTED}>heals in a bad position</Txt>
      <Txt x={190} y={404} size={22} fill={GOLD} weight={700}>D - N - M</Txt>
    </>
  );
}

function SceneKids() {
  const items = ["Thick periosteum", "Strong remodelling", "Faster healing"];
  return (
    <>
      <Bone x={70} y={110} w={240} h={34} r={10} />
      <rect x={125} y={104} width={8} height={46} rx={2} fill={GOLD} />
      <rect x={247} y={104} width={8} height={46} rx={2} fill={GOLD} />
      <Txt x={129} y={170} size={12} fill={GOLD}>growth plate</Txt>
      <Txt x={251} y={170} size={12} fill={GOLD}>growth plate</Txt>
      {items.map((t, i) => (
        <g key={t}>
          <circle cx={50} cy={214 + i * 30} r={4} fill={GOLD} />
          <Txt x={64} y={220 + i * 30} size={17} anchor="start">{t}</Txt>
        </g>
      ))}
      <line x1={50} y1={306} x2={330} y2={306} stroke={LINE} strokeWidth={1.5} />
      <Txt x={190} y={338} size={19} fill={GOLD} weight={700}>Goal: restore FUNCTION</Txt>
      <Txt x={190} y={364} size={13}>Strength · Movement · Walking · Independence</Txt>
    </>
  );
}

export default function FractureStageSvg({ stage }: { stage: FractureStage }) {
  let scene: ReactNode;
  switch (stage.kind) {
    case "what": scene = <SceneWhat />; break;
    case "classify": scene = <SceneClassify />; break;
    case "joint": scene = <SceneJoint />; break;
    case "tar": scene = <SceneTar />; break;
    case "complete": scene = <SceneComplete />; break;
    case "skin": scene = <SceneSkin />; break;
    case "patterns": scene = <ScenePatterns />; break;
    case "assess": scene = <SceneAssess />; break;
    case "twos": scene = <SceneTwos />; break;
    case "reduce": scene = <SceneReduce />; break;
    case "hold": scene = <SceneHold />; break;
    case "compartment": scene = <SceneCompartment />; break;
    case "healing": scene = <SceneHealing />; break;
    case "kids": scene = <SceneKids />; break;
    default: scene = null;
  }
  return <Frame title={stage.label}>{scene}</Frame>;
}
