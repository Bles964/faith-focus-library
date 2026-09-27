"use client";
import AutoVideoExporter from "./AutoVideoExporter";

type SdStage = { label: string; narration: string; step: number };

const sdStages: SdStage[] = [
  {
    label: "The Normal Response Cycle",
    narration:
      "Sexual dysfunction is a persistent problem lasting at least six months that impairs sexual satisfaction and causes distress. To evaluate it clinically, trace the natural cycle: desire, arousal, orgasm, and resolution. Identifying the exact phase where the sequence breaks down directs your diagnostic framework.",
    step: 0,
  },
  {
    label: "Disorders of Desire",
    narration:
      "Desire disorders represent a failure of the initial want or willingness to engage in sex. Hypoactive sexual desire disorder involves a chronic deficiency or absence of sexual fantasies and interest. In contrast, sexual aversion disorder is marked by active avoidance, driven by intense anxiety, fear, or disgust toward genital contact.",
    step: 1,
  },
  {
    label: "Disorders of Arousal",
    narration:
      "In arousal disorders, the patient retains sexual desire, but the body fails to produce the expected physical response. Female sexual arousal disorder presents as recurrent difficulty achieving or maintaining lubrication and pelvic engorgement. In men, erectile disorder manifests as an inability to attain or sustain an erection sufficient for satisfactory sexual activity.",
    step: 2,
  },
  {
    label: "Orgasm and Pain Disorders",
    narration:
      "Problems can also occur at the climax or during intercourse itself. Orgasmic disorders involve a persistent delay or absence of climax, whereas premature ejaculation occurs too quickly with minimal stimulation. When intercourse hurts, distinguish dyspareunia, which is genital pain, from vaginismus, an involuntary reflex spasm of the outer vaginal musculature that prevents penetration.",
    step: 3,
  },
  {
    label: "Multifactorial Aetiology",
    narration:
      "Sexual dysfunction rarely exists in isolation and typically combines biological, psychological, and interpersonal factors. Vascular disease, diabetes, hormonal shifts, and medications like antidepressants impair physiological pathways. Performance anxiety and relationship conflicts frequently compound these physical deficits, turning an initial difficulty into a chronic cycle.",
    step: 4,
  },
  {
    label: "Principles of Management",
    narration:
      "Effective care treats the whole patient rather than just the sexual symptom. Psychoeducation and behavioral interventions, such as sensate-focus exercises to relieve performance anxiety, are foundational alongside couples therapy. Targeted medical treatments like PDE5 inhibitors, vaginal estrogen, or optimizing chronic medical conditions address the underlying physiological barriers.",
    step: 5,
  },
];

const NAVY = "#0B1F3A";
const GOLD = "#D4AF37";
const MUTED = "#9AA6B8";
const LINE = "#2A3E5C";
const BONE = "#F4F1EA";
const ALERT = "#E2674A";
const TEAL = "#8FC4D1";
const ROSE = "#E8A0B0";

const CURVE =
  "M30 280 C60 280 80 252 110 236 C140 220 160 190 200 185 C230 182 240 130 255 128 C270 130 280 220 290 250 C305 275 330 282 350 284";

const PHASES = [
  { name: "Desire", x: 30, w: 80, cx: 70 },
  { name: "Arousal", x: 110, w: 90, cx: 155 },
  { name: "Orgasm", x: 200, w: 80, cx: 240 },
  { name: "Resolution", x: 280, w: 70, cx: 315 },
];

const ACTIVE: Record<number, number[]> = { 0: [0, 1, 2, 3], 1: [0], 2: [1], 3: [2] };

const CHIPS: Record<number, string[]> = {
  0: ["Persistent: six months or more", "Impaired satisfaction and distress"],
  1: ["Hypoactive desire disorder", "Sexual aversion disorder"],
  2: ["Female sexual arousal disorder", "Erectile disorder"],
  3: [
    "Orgasmic disorder · premature ejaculation",
    "Dyspareunia (genital pain)",
    "Vaginismus (involuntary spasm)",
  ],
};

const MANAGEMENT = [
  ["Psychoeducation", "Understand the response cycle"],
  ["Sensate-focus exercises", "Relieve performance anxiety"],
  ["Couples therapy", "Address relationship factors"],
  ["Targeted medical treatment", "PDE5 inhibitors · vaginal estrogen"],
];

function Chips({ items, color }: { items: string[]; color: string }) {
  return (
    <g>
      {items.map((t, i) => (
        <g key={t}>
          <rect x="40" y={352 + i * 36} width="300" height="28" rx="14" fill="none" stroke={color} strokeWidth="1.2" />
          <text x="190" y={371 + i * 36} textAnchor="middle" fontSize="12" fill={BONE}>
            {t}
          </text>
        </g>
      ))}
    </g>
  );
}

function CycleScene({ step }: { step: number }) {
  const active = ACTIVE[step] ?? [];
  const color = step === 0 ? GOLD : ALERT;
  return (
    <g>
      <defs>
        {PHASES.map((p, i) => (
          <clipPath key={i} id={`ph${i}`}>
            <rect x={p.x} y="90" width={p.w} height="240" />
          </clipPath>
        ))}
      </defs>
      {active.map((i) => (
        <rect key={`b${i}`} x={PHASES[i].x} y="90" width={PHASES[i].w} height="240" fill={color} opacity="0.12" />
      ))}
      <path d={CURVE} fill="none" stroke={LINE} strokeWidth="4" strokeLinecap="round" />
      {active.map((i) => (
        <path
          key={`p${i}`}
          d={CURVE}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          clipPath={`url(#ph${i})`}
        />
      ))}
      <line x1="30" y1="296" x2="350" y2="296" stroke={LINE} strokeWidth="1" />
      {PHASES.map((p, i) => (
        <text
          key={p.name}
          x={p.cx}
          y="316"
          textAnchor="middle"
          fontSize="12"
          fontWeight={active.includes(i) ? "700" : "400"}
          fill={active.includes(i) ? color : MUTED}
        >
          {p.name}
        </text>
      ))}
      <Chips items={CHIPS[step] ?? []} color={color} />
    </g>
  );
}

function VennScene() {
  return (
    <g>
      <circle cx="190" cy="160" r="70" fill={TEAL} opacity="0.35" />
      <circle cx="148" cy="232" r="70" fill={ROSE} opacity="0.35" />
      <circle cx="232" cy="232" r="70" fill={GOLD} opacity="0.35" />
      <text x="190" y="128" textAnchor="middle" fontSize="13" fontWeight="700" fill={BONE}>Biological</text>
      <text x="112" y="268" textAnchor="middle" fontSize="13" fontWeight="700" fill={BONE}>Psychological</text>
      <text x="268" y="268" textAnchor="middle" fontSize="13" fontWeight="700" fill={BONE}>Interpersonal</text>
      <text x="190" y="206" textAnchor="middle" fontSize="11" fill={BONE}>Sexual</text>
      <text x="190" y="220" textAnchor="middle" fontSize="11" fill={BONE}>dysfunction</text>
      <Chips
        items={["Vascular · diabetes · hormones · drugs", "Performance anxiety", "Relationship conflict"]}
        color={GOLD}
      />
    </g>
  );
}

function ManagementScene() {
  return (
    <g>
      {MANAGEMENT.map(([title, sub], i) => (
        <g key={title}>
          <rect x="40" y={100 + i * 72} width="300" height="58" rx="10" fill="#12294A" stroke={LINE} />
          <rect x="40" y={100 + i * 72} width="6" height="58" rx="3" fill={GOLD} />
          <text x="62" y={124 + i * 72} fontSize="15" fontWeight="700" fill={BONE}>{title}</text>
          <text x="62" y={144 + i * 72} fontSize="11" fill={MUTED}>{sub}</text>
        </g>
      ))}
      <text x="190" y="422" textAnchor="middle" fontSize="14" fill={GOLD}>Treat the whole patient</text>
    </g>
  );
}

function SdStageSvg({ stage }: { stage: SdStage }) {
  return (
    <svg
      width="380"
      height="460"
      viewBox="0 0 380 460"
      xmlns="http://www.w3.org/2000/svg"
      fontFamily="Helvetica, Arial, sans-serif"
    >
      <rect width="380" height="460" fill={NAVY} />
      <text x="190" y="52" textAnchor="middle" fontSize="20" fontWeight="700" fill={GOLD}>
        {stage.label}
      </text>
      <text x="190" y="74" textAnchor="middle" fontSize="11" fill={MUTED} letterSpacing="1">
        SEXUAL DYSFUNCTION
      </text>
      {stage.step <= 3 ? <CycleScene step={stage.step} /> : stage.step === 4 ? <VennScene /> : <ManagementScene />}
    </svg>
  );
}

export default function SexualDysfunctionVideo() {
  return (
    <AutoVideoExporter
      stages={sdStages}
      StageComponent={SdStageSvg}
      buttonLabel="Generate sexual dysfunction video"
      fileName="sexual-dysfunction.mp4"
    />
  );
}
