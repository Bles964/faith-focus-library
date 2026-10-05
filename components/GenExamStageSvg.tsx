import type { ReactNode } from "react";

export type GenKind =
  | "a1" | "a2" | "a3" | "a4" | "a5" | "a6" | "a7" | "a8" | "a9" | "a10"
  | "b1" | "b2" | "b3" | "b4" | "b5" | "b6" | "b7" | "b8" | "b9" | "b10";

export type GenStage = { kind: GenKind; label: string; narration: string };

const NAVY = "#0B1F3A";
const CARD = "#14294D";
const LINE = "#2A3E5C";
const GOLD = "#D4AF37";
const CREAM = "#F4F1EA";
const MUTED = "#9AA6B8";
const RED = "#E5584F";
const GREEN = "#5BBF8A";
const BLUE = "#5B9BD5";
const SKIN = "#C98E6B";
const DARK = "#1A2A47";
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
          <Txt x={72} y={y0 + i * dy - (s ? 4 : 0)} size={16} weight={700} anchor="start">{t}</Txt>
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

/* ============ VIDEO 1: preparation to neck ============ */

function A1() {
  return (
    <NumRows
      y0={116}
      dy={54}
      rows={[
        ["Clean your hands", ""],
        ["Introduce yourself", ""],
        ["Identify the patient", ""],
        ["Explain the examination", ""],
        ["Get consent", ""],
        ["Position, privacy, good light", ""],
      ]}
    />
  );
}

function A2() {
  return (
    <>
      <circle cx={100} cy={128} r={18} fill={SKIN} />
      <rect x={82} y={150} width={36} height={80} rx={12} fill={CREAM} fillOpacity={0.85} />
      <line x1={82} y1={160} x2={62} y2={215} stroke={CREAM} strokeWidth={8} strokeLinecap="round" />
      <line x1={118} y1={160} x2={138} y2={215} stroke={CREAM} strokeWidth={8} strokeLinecap="round" />
      <line x1={92} y1={230} x2={86} y2={288} stroke={CREAM} strokeWidth={9} strokeLinecap="round" />
      <line x1={108} y1={230} x2={114} y2={288} stroke={CREAM} strokeWidth={9} strokeLinecap="round" />
      <Bullets
        x={190}
        y0={134}
        dy={34}
        size={15}
        items={["Age and sex", "Consciousness", "Orientation", "Nutrition", "Hydration", "Posture and gait", "Distress and pain"]}
      />
      <Txt x={190} y={376} size={19} fill={GOLD} weight={700}>Stand back and LOOK</Txt>
      <Txt x={190} y={400} size={13} fill={MUTED}>Inspect before you palpate</Txt>
    </>
  );
}

function A3() {
  return (
    <NumRows
      y0={114}
      dy={62}
      rows={[
        ["Well-looking", "comfortable, not acutely ill"],
        ["Acutely ill", "infection, shock, heart or lung disease"],
        ["Chronically ill", "cancer, chronic infection, organ failure"],
        ["Wasted", "cancer, TB, advanced organ disease"],
        ["Obese", "diabetes, hypertension, osteoarthritis"],
      ]}
    />
  );
}

function A4() {
  return (
    <NumRows
      y0={114}
      dy={62}
      rows={[
        ["Temperature", "fever or hypothermia"],
        ["Pulse", "rate, rhythm, volume, character"],
        ["Blood pressure", "also postural hypotension"],
        ["Respiratory rate", "rate, depth, rhythm"],
        ["Oxygen saturation", "normal or hypoxaemia"],
      ]}
    />
  );
}

function A5() {
  return (
    <>
      <circle cx={190} cy={140} r={46} fill={SKIN} fillOpacity={0.85} />
      <path d="M 144 140 A 46 46 0 0 1 236 140 Z" fill="#3B2A2A" />
      <circle cx={170} cy={116} r={2} fill={CREAM} />
      <circle cx={196} cy={108} r={2} fill={CREAM} />
      <circle cx={214} cy={122} r={2} fill={CREAM} />
      <Txt x={190} y={228} size={16} fill={GOLD} weight={700}>Alopecia</Txt>
      <Txt x={190} y={247} size={12} fill={MUTED}>endocrine, nutrition, autoimmune, drugs</Txt>
      <Txt x={190} y={278} size={16} fill={GOLD} weight={700}>Dry, brittle hair</Txt>
      <Txt x={190} y={297} size={12} fill={MUTED}>nutritional deficiency, hypothyroidism</Txt>
      <Txt x={190} y={328} size={16} fill={GOLD} weight={700}>Scalp scaling</Txt>
      <Txt x={190} y={347} size={12} fill={MUTED}>seborrhoeic dermatitis, psoriasis, fungus</Txt>
      <Txt x={190} y={388} size={13}>Mass: site, size, shape, surface, consistency</Txt>
    </>
  );
}

function Face({ cx, cy, kind }: { cx: number; cy: number; kind: "cushing" | "myx" | "thyro" }) {
  const r = kind === "cushing" ? 38 : 34;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={SKIN} fillOpacity={0.85} />
      {kind === "cushing" && (
        <>
          <circle cx={cx - 21} cy={cy + 8} r={9} fill={RED} fillOpacity={0.4} />
          <circle cx={cx + 21} cy={cy + 8} r={9} fill={RED} fillOpacity={0.4} />
        </>
      )}
      {kind === "myx" && (
        <>
          <ellipse cx={cx - 12} cy={cy} rx={8} ry={4} fill="#B07A5A" />
          <ellipse cx={cx + 12} cy={cy} rx={8} ry={4} fill="#B07A5A" />
        </>
      )}
      {kind === "thyro" ? (
        <>
          <circle cx={cx - 12} cy={cy - 6} r={7} fill={CREAM} />
          <circle cx={cx + 12} cy={cy - 6} r={7} fill={CREAM} />
          <circle cx={cx - 12} cy={cy - 6} r={3} fill={DARK} />
          <circle cx={cx + 12} cy={cy - 6} r={3} fill={DARK} />
        </>
      ) : (
        <>
          <circle cx={cx - 12} cy={cy - 6} r={3} fill={DARK} />
          <circle cx={cx + 12} cy={cy - 6} r={3} fill={DARK} />
        </>
      )}
      <path d={`M ${cx - 9} ${cy + 16} Q ${cx} ${cy + 22} ${cx + 9} ${cy + 16}`} fill="none" stroke={DARK} strokeWidth={2} />
    </g>
  );
}

function A6() {
  return (
    <>
      <Face cx={65} cy={122} kind="cushing" />
      <Face cx={190} cy={122} kind="myx" />
      <Face cx={315} cy={122} kind="thyro" />
      <Txt x={65} y={186} size={14} weight={700}>Cushing</Txt>
      <Txt x={65} y={203} size={11} fill={MUTED}>round moon face</Txt>
      <Txt x={190} y={186} size={14} weight={700}>Myxoedema</Txt>
      <Txt x={190} y={203} size={11} fill={MUTED}>puffy, coarse</Txt>
      <Txt x={315} y={186} size={14} weight={700}>Thyrotoxic</Txt>
      <Txt x={315} y={203} size={11} fill={MUTED}>anxious, staring</Txt>
      <Divider y={234} />
      <Bullets y0={268} dy={32} size={15} items={["Asymmetry: facial palsy or stroke", "Mask-like face: Parkinsonism", "Swelling: renal, low albumin, allergy"]} />
      <Txt x={190} y={376} size={13} fill={MUTED}>Always compare the two sides of the face</Txt>
    </>
  );
}

function A7() {
  return (
    <>
      <path d="M 120 138 Q 190 88 260 138 Q 190 188 120 138 Z" fill={CREAM} />
      <circle cx={190} cy={138} r={26} fill="#4A6A8A" />
      <circle cx={190} cy={138} r={10} fill={DARK} />
      <path d="M 130 166 Q 190 198 250 166" fill="none" stroke="#E8A0A0" strokeWidth={6} strokeLinecap="round" />
      <Bullets
        y0={236}
        dy={34}
        size={15}
        items={["Pale conjunctiva: anaemia", "Yellow sclera: jaundice", "Grey ring on cornea: arcus", "Eyelid plaques: xanthelasma", "Pupils: size, shape, light"]}
      />
      <Txt x={190} y={406} size={12} fill={MUTED}>Jaundice: prehepatic, hepatic, post-hepatic</Txt>
    </>
  );
}

function A8() {
  const nose: [string, string][] = [["Flaring", "work of breathing"], ["Discharge", "infection, allergy"], ["Epistaxis", "bleeding"], ["Polyps", "if visible"]];
  const mouth: [string, string, string][] = [
    ["Blue", "central cyanosis", BLUE],
    ["Pale", "anaemia", "#E8B4B4"],
    ["Smooth", "iron, B12, folate", CREAM],
    ["Dry", "dehydration", "#C9A66B"],
    ["Cracked corners", "iron deficiency", GOLD],
  ];
  return (
    <>
      <Card x={15} y={88} w={160} h={276}>
        <Txt x={95} y={116} size={17} fill={GOLD} weight={700}>Nose</Txt>
        {nose.map(([w, s], i) => (
          <g key={w}>
            <circle cx={37} cy={152 + i * 46} r={5} fill={GOLD} />
            <Txt x={50} y={156 + i * 46} size={13} weight={700} anchor="start">{w}</Txt>
            <Txt x={50} y={172 + i * 46} size={11} fill={MUTED} anchor="start">{s}</Txt>
          </g>
        ))}
      </Card>
      <Card x={205} y={88} w={160} h={276}>
        <Txt x={285} y={116} size={17} fill={GOLD} weight={700}>Mouth</Txt>
        {mouth.map(([w, s, c], i) => (
          <g key={w}>
            <circle cx={227} cy={152 + i * 40} r={5} fill={c} />
            <Txt x={240} y={156 + i * 40} size={13} weight={700} anchor="start">{w}</Txt>
            <Txt x={240} y={171 + i * 40} size={11} fill={MUTED} anchor="start">{s}</Txt>
          </g>
        ))}
      </Card>
      <Txt x={190} y={394} size={12} fill={MUTED}>Teeth and gums: caries, gingivitis, bleeding</Txt>
    </>
  );
}

function A9() {
  return (
    <>
      <line x1={50} y1={250} x2={170} y2={250} stroke={LINE} strokeWidth={3} />
      <line x1={70} y1={250} x2={150} y2={170} stroke={CREAM} strokeWidth={14} strokeLinecap="round" />
      <circle cx={166} cy={150} r={17} fill={SKIN} />
      <line x1={160} y1={168} x2={160} y2={186} stroke={GOLD} strokeWidth={4} strokeLinecap="round" />
      <circle cx={160} cy={176} r={4} fill={GOLD} />
      <Txt x={100} y={276} size={13} fill={GOLD} weight={700}>30 to 45 degrees</Txt>
      <Txt x={210} y={134} size={16} fill={GOLD} weight={700} anchor="start">Raised JVP</Txt>
      <Txt x={210} y={158} size={12} anchor="start">right heart failure</Txt>
      <Txt x={210} y={176} size={12} anchor="start">fluid overload</Txt>
      <Txt x={210} y={194} size={12} anchor="start">tricuspid regurgitation</Txt>
      <Txt x={210} y={212} size={12} anchor="start">constrictive pericarditis</Txt>
      <Txt x={210} y={230} size={12} anchor="start">tamponade</Txt>
      <Divider y={298} />
      <Txt x={190} y={324} size={15} fill={GOLD} weight={700}>Hepatojugular reflux</Txt>
      <Txt x={190} y={344} size={13} fill={MUTED}>press the right upper abdomen</Txt>
      <Txt x={190} y={376} size={15} fill={RED} weight={700}>Never compress both carotids</Txt>
      <Txt x={190} y={398} size={12} fill={MUTED}>One side at a time: volume and character</Txt>
    </>
  );
}

function A10() {
  const grid = [["Site", "Size", "Surface"], ["Consistency", "Mobility", "Tenderness"]];
  const rows: [string, string][] = [
    ["Tender, soft", "infection"],
    ["Hard, fixed", "suspect cancer"],
    ["Rubbery", "lymphoma"],
    ["Matted", "TB"],
  ];
  return (
    <>
      <Txt x={190} y={98} size={24} fill={GOLD} weight={700}>S - S - S - C - M - T</Txt>
      {grid.map((r, ri) =>
        r.map((w, ci) => (
          <Txt key={w} x={65 + ci * 125} y={132 + ri * 24} size={14}>{w}</Txt>
        ))
      )}
      <Divider y={186} />
      {rows.map(([a, b], i) => (
        <g key={a}>
          <Txt x={60} y={216 + i * 30} size={15} fill={GOLD} weight={700} anchor="start">{a}</Txt>
          <Txt x={200} y={216 + i * 30} size={15} anchor="start">{b}</Txt>
        </g>
      ))}
      <Divider y={332} />
      <Txt x={190} y={358} size={14} fill={GOLD} weight={700}>Thyroid: ask the patient to swallow</Txt>
      <Txt x={190} y={378} size={13} fill={MUTED}>it moves up with swallowing</Txt>
      <Txt x={190} y={402} size={12} fill={MUTED}>Generalised nodes: HIV, lymphoma, leukaemia</Txt>
    </>
  );
}

/* ============ VIDEO 2: chest to feet ============ */

function B1() {
  return (
    <>
      <Bullets y0={108} dy={38} size={16} items={["Respiratory rate and pattern", "Accessory muscle use", "Intercostal recession", "Nasal flaring", "Central cyanosis"]} />
      <Divider y={312} />
      <Txt x={190} y={338} size={15} fill={GOLD} weight={700}>Tachypnoea</Txt>
      <Txt x={190} y={358} size={12} fill={MUTED}>pneumonia, asthma, COPD, pulmonary oedema,</Txt>
      <Txt x={190} y={376} size={12} fill={MUTED}>embolism, metabolic acidosis</Txt>
      <Txt x={190} y={406} size={12}>Also look for scars, a pacemaker, dilated veins</Txt>
    </>
  );
}

function Fingers({ cx, cy, club }: { cx: number; cy: number; club: boolean }) {
  return (
    <g>
      <ellipse cx={cx - 13} cy={cy} rx={14} ry={46} fill={SKIN} stroke="#9A6A4B" strokeWidth={2} transform={`rotate(6 ${cx - 13} ${cy})`} />
      <ellipse cx={cx + 13} cy={cy} rx={14} ry={46} fill={SKIN} stroke="#9A6A4B" strokeWidth={2} transform={`rotate(-6 ${cx + 13} ${cy})`} />
      {!club && <polygon points={`${cx},${cy - 54} ${cx + 8},${cy - 40} ${cx},${cy - 26} ${cx - 8},${cy - 40}`} fill={NAVY} stroke={GOLD} strokeWidth={2} />}
    </g>
  );
}

function B2() {
  return (
    <>
      <Fingers cx={95} cy={128} club={false} />
      <Fingers cx={285} cy={128} club />
      <Txt x={95} y={206} size={14} fill={GREEN} weight={700}>Normal</Txt>
      <Txt x={95} y={223} size={11} fill={MUTED}>diamond window</Txt>
      <Txt x={285} y={206} size={14} fill={RED} weight={700}>Clubbing</Txt>
      <Txt x={285} y={223} size={11} fill={MUTED}>window lost</Txt>
      <Divider y={244} />
      <Txt x={190} y={270} size={16} fill={GOLD} weight={700}>LHG: Lung, Heart, Gut</Txt>
      <Txt x={190} y={296} size={14}>Koilonychia: iron deficiency</Txt>
      <Txt x={190} y={318} size={13}>Splinter haemorrhages: endocarditis, trauma</Txt>
      <Txt x={190} y={342} size={14}>Fine tremor: thyroid, anxiety, drugs</Txt>
      <Txt x={190} y={366} size={14}>Asterixis: liver failure, uraemia, CO2</Txt>
      <Txt x={190} y={390} size={12} fill={MUTED}>Coarse tremor: alcohol withdrawal, metabolic</Txt>
    </>
  );
}

function B3() {
  return (
    <>
      <Card x={15} y={90} w={160} h={150}>
        <Txt x={95} y={122} size={18} fill={BLUE} weight={700}>Cold hands</Txt>
        <Txt x={95} y={156} size={13}>shock</Txt>
        <Txt x={95} y={178} size={13}>low cardiac output</Txt>
        <Txt x={95} y={200} size={13}>vasoconstriction</Txt>
      </Card>
      <Card x={205} y={90} w={160} h={150}>
        <Txt x={285} y={122} size={18} fill={RED} weight={700}>Warm hands</Txt>
        <Txt x={285} y={156} size={13}>fever</Txt>
        <Txt x={285} y={178} size={13}>hyperthyroidism</Txt>
        <Txt x={285} y={200} size={13}>increased blood flow</Txt>
      </Card>
      <Divider y={270} />
      <Txt x={190} y={300} size={15} fill={GOLD} weight={700}>Capillary refill</Txt>
      <Txt x={190} y={322} size={13} fill={MUTED}>assesses peripheral perfusion</Txt>
      <Txt x={190} y={362} size={15} fill={GOLD} weight={700}>Pulse</Txt>
      <Txt x={190} y={384} size={13} fill={MUTED}>rate, rhythm, volume, character</Txt>
    </>
  );
}

function B4() {
  const fs = ["Fat", "Fluid", "Flatus", "Faeces", "Fetus"];
  return (
    <>
      {fs.map((w, i) => (
        <g key={w}>
          <circle cx={70} cy={104 + i * 44} r={16} fill={GOLD} />
          <Txt x={70} y={110 + i * 44} size={17} fill={NAVY} weight={700}>F</Txt>
          <Txt x={102} y={110 + i * 44} size={18} anchor="start">{w}</Txt>
        </g>
      ))}
      <Txt x={250} y={190} size={13} fill={MUTED}>5 Fs of</Txt>
      <Txt x={250} y={208} size={13} fill={MUTED}>distension</Txt>
      <Divider y={314} />
      <Txt x={190} y={340} size={14}>Dilated veins: portal hypertension</Txt>
      <Txt x={190} y={364} size={14}>Scars: ask what operation</Txt>
      <Txt x={190} y={390} size={12} fill={MUTED}>Also: striae, hernias, masses, umbilicus</Txt>
    </>
  );
}

function B5() {
  const back = ["Spine and skin", "Scars", "Pressure sores", "Sacral oedema:", "bedridden or", "fluid overload"];
  const groin = ["Inguinal nodes", "Hernias:", "inguinal, femoral", "Femoral pulse", "Skin changes"];
  return (
    <>
      <Card x={15} y={90} w={160} h={260}>
        <Txt x={95} y={120} size={18} fill={GOLD} weight={700}>Back</Txt>
        {back.map((t, i) => (
          <Txt key={t} x={95} y={160 + i * 30} size={14} fill={i > 3 ? MUTED : CREAM}>{t}</Txt>
        ))}
      </Card>
      <Card x={205} y={90} w={160} h={260}>
        <Txt x={285} y={120} size={18} fill={GOLD} weight={700}>Groin</Txt>
        {groin.map((t, i) => (
          <Txt key={t} x={285} y={160 + i * 30} size={14} fill={i === 2 ? MUTED : CREAM}>{t}</Txt>
        ))}
      </Card>
      <Txt x={190} y={392} size={12} fill={MUTED}>Sacral oedema matters in bedridden patients</Txt>
    </>
  );
}

function B6() {
  return (
    <>
      <rect x={70} y={92} width={50} height={178} rx={22} fill={SKIN} fillOpacity={0.6} stroke={SKIN} strokeWidth={2} />
      <ellipse cx={95} cy={190} rx={10} ry={6} fill="#7A4B32" />
      <line x1={152} y1={190} x2={124} y2={190} stroke={GOLD} strokeWidth={3} strokeLinecap="round" />
      <Txt x={162} y={150} size={14} anchor="start">Press over bone</Txt>
      <Txt x={162} y={172} size={14} anchor="start">dent stays =</Txt>
      <Txt x={162} y={206} size={16} fill={GOLD} weight={700} anchor="start">pitting oedema</Txt>
      <Divider y={290} />
      <Bullets y0={318} dy={26} size={14} items={["Skin: ulcers, shiny skin, gangrene", "Muscle wasting", "Varicose veins", "Look at the ankles and shins"]} />
    </>
  );
}

function B7() {
  const both = ["HEART", "KIDNEY", "LIVER", "LOW ALBUMIN", "DRUGS"];
  const one = ["DVT", "Cellulitis", "Trauma", "Lymphoedema", "Venous block"];
  return (
    <>
      <Card x={15} y={88} w={160} h={272}>
        <Txt x={95} y={120} size={17} fill={GOLD} weight={700}>Both legs</Txt>
        {both.map((t, i) => (
          <Txt key={t} x={95} y={162 + i * 38} size={15} weight={700}>{t}</Txt>
        ))}
      </Card>
      <Card x={205} y={88} w={160} h={272}>
        <Txt x={285} y={120} size={17} fill={RED} weight={700}>One leg</Txt>
        {one.map((t, i) => (
          <Txt key={t} x={285} y={162 + i * 38} size={15} weight={700}>{t}</Txt>
        ))}
      </Card>
      <Txt x={190} y={392} size={12} fill={MUTED}>Drugs: for example calcium-channel blockers</Txt>
    </>
  );
}

function B8() {
  return (
    <>
      <Bullets y0={108} dy={34} size={16} items={["Femoral", "Popliteal", "Posterior tibial", "Dorsalis pedis"]} />
      <Txt x={190} y={262} size={15} fill={GOLD} weight={700}>Compare right with left</Txt>
      <Divider y={284} />
      <Txt x={190} y={312} size={14}>Feet: ulcers, gangrene, infection,</Txt>
      <Txt x={190} y={332} size={14}>fungus, nail changes, deformity</Txt>
      <Txt x={190} y={372} size={15} fill={RED} weight={700}>Always check the feet in diabetes</Txt>
      <Txt x={190} y={394} size={12} fill={MUTED}>neuropathy, ulcers, infection, ischaemia</Txt>
    </>
  );
}

function B9() {
  return (
    <>
      <Bullets y0={112} dy={36} size={16} items={["Make the patient comfortable", "Cover the patient", "Thank the patient", "Clean your hands"]} />
      <Divider y={266} />
      <Txt x={190} y={294} size={16} fill={GOLD} weight={700}>Then summarise</Txt>
      <Txt x={190} y={318} size={13}>consciousness, nutrition, hydration</Txt>
      <Txt x={190} y={338} size={13}>pallor, jaundice, cyanosis, clubbing</Txt>
      <Txt x={190} y={358} size={13}>nodes, JVP, oedema</Txt>
      <Txt x={190} y={394} size={13} fill={GOLD}>Name the focused examination you need</Txt>
    </>
  );
}

function B10() {
  const words = ["HAIR", "FACE", "EYES", "NOSE", "MOUTH", "NECK", "CHEST", "ARMS", "ABDOMEN", "BACK", "GROIN", "THIGHS", "KNEES", "LEGS", "ANKLES", "FEET"];
  return (
    <>
      {words.map((w, i) => {
        const col = i < 8 ? 0 : 1;
        const row = i % 8;
        const cx = col === 0 ? 62 : 212;
        const y = 104 + row * 34;
        return (
          <g key={w}>
            <circle cx={cx} cy={y} r={12} fill={GOLD} />
            <Txt x={cx} y={y + 4} size={11} fill={NAVY} weight={700}>{String(i + 1)}</Txt>
            <Txt x={cx + 22} y={y + 5} size={15} anchor="start">{w}</Txt>
          </g>
        );
      })}
      <Divider y={356} />
      <Txt x={190} y={384} size={15} fill={GOLD} weight={700}>Look, Palpate, Identify, Think</Txt>
      <Txt x={190} y={406} size={12} fill={MUTED}>differentials at every level</Txt>
    </>
  );
}

export default function GenExamStageSvg({ stage }: { stage: GenStage }) {
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
    case "a10": scene = <A10 />; break;
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
