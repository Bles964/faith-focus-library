"use client";

import React from "react";

export type CardiacStageKind =
  | "intro"
  | "pericardium"
  | "tamponade"
  | "constrictive"
  | "mitral-stenosis"
  | "mitral-regurgitation"
  | "aortic-stenosis"
  | "aortic-regurgitation"
  | "prosthetic-valves"
  | "coronary-disease"
  | "myocardial-infarction"
  | "cabg"
  | "cardiac-tumour";

export type CardiacStage = {
  kind: CardiacStageKind;
  label: string;
  narration: string;
};

type Props = {
  stage: CardiacStage;
  progress?: number;
};

const NAVY = "#0B1F3A";
const GOLD = "#D4AF37";
const WHITE = "#F4F1EA";
const RED = "#E85D5D";
const BLUE = "#4CA6D9";
const MUTED = "#9AA6B8";

function Text({
  x,
  y,
  children,
  size = 12,
  color = WHITE,
  weight = 400,
  anchor = "middle",
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fill={color}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      fontFamily="Arial, Helvetica, sans-serif"
    >
      {children}
    </text>
  );
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  color = GOLD,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color?: string;
}) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const length = 8;

  const p1 = [
    x2 - length * Math.cos(angle - Math.PI / 6),
    y2 - length * Math.sin(angle - Math.PI / 6),
  ];
  const p2 = [
    x2 - length * Math.cos(angle + Math.PI / 6),
    y2 - length * Math.sin(angle + Math.PI / 6),
  ];

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={color}
        strokeWidth={2}
      />
      <polygon
        points={`${x2},${y2} ${p1[0]},${p1[1]} ${p2[0]},${p2[1]}`}
        fill={color}
      />
    </g>
  );
}

function Heart({
  progress = 0,
  compressed = false,
}: {
  progress?: number;
  compressed?: boolean;
}) {
  const scaleX = compressed ? 0.88 + 0.12 * progress : 1;

  return (
    <g transform={`translate(190 225) scale(${scaleX} 1) translate(-190 -225)`}>
      {/* Simplified teaching illustration, not an anatomical surgical guide */}
      <path
        d="M190 145
           C170 112 132 126 132 163
           C132 196 165 222 190 248
           C215 222 248 196 248 163
           C248 126 210 112 190 145Z"
        fill="#A83245"
        stroke="#F18A8A"
        strokeWidth={2}
      />

      {/* Ventricular separation */}
      <path
        d="M190 151 C183 178 187 207 190 239"
        stroke="#F4A0A0"
        strokeWidth={3}
        fill="none"
      />

      {/* Great vessels */}
      <path
        d="M175 145 C158 122 166 91 184 89"
        stroke={RED}
        strokeWidth={13}
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M202 143 C222 118 225 98 211 83"
        stroke={BLUE}
        strokeWidth={12}
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M211 83 C229 72 243 81 240 97"
        stroke={BLUE}
        strokeWidth={9}
        fill="none"
        strokeLinecap="round"
      />

      {/* Coronary vessels */}
      <path
        d="M157 163 C174 168 177 187 180 203"
        stroke="#FFCE73"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />

      <path
        d="M220 163 C204 174 202 188 201 205"
        stroke="#FFCE73"
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

function IntroScene({ progress }: { progress: number }) {
  return (
    <>
      <Heart progress={progress} />

      <Arrow x1={78} y1={175} x2={139} y2={177} color={RED} />
      <Text x={70} y={160} color={RED} size={11}>
        Heart muscle
      </Text>

      <Arrow x1={285} y1={116} x2={222} y2={105} color={BLUE} />
      <Text x={305} y={103} color={BLUE} size={11}>
        Great vessels
      </Text>

      <Arrow x1={285} y1={274} x2={221} y2={192} color={GOLD} />
      <Text x={290} y={291} color={GOLD} size={11}>
        Coronary arteries
      </Text>

      <Text x={190} y={330} size={15} weight={700}>
        Surgical cardiac diseases
      </Text>

      <Text x={190} y={350} size={10} color={MUTED}>
        Structure • Blood flow • Function
      </Text>
    </>
  );
}

function PericardiumScene({
  progress,
  tamponade = false,
}: {
  progress: number;
  tamponade?: boolean;
}) {
  const fluidRadius = tamponade ? 78 + 15 * progress : 83;

  return (
    <>
      {/* Pericardial sac */}
      <ellipse
        cx="190"
        cy="208"
        rx={fluidRadius}
        ry={105}
        fill={tamponade ? "#4CA6D9" : "none"}
        fillOpacity={tamponade ? 0.12 + 0.1 * progress : 0}
        stroke={BLUE}
        strokeWidth={3}
        strokeDasharray={tamponade ? "none" : "7 5"}
      />

      {/* Fluid highlights */}
      {tamponade && (
        <>
          <path
            d={`M${190 - fluidRadius + 10} 190
                Q190 ${275 + 10 * progress}
                ${190 + fluidRadius - 10} 190`}
            stroke={BLUE}
            strokeWidth={4}
            fill="none"
            opacity={0.8}
          />

          <Text x={190} y={95} color={BLUE} size={12} weight={700}>
            Pericardial fluid
          </Text>
        </>
      )}

      <Heart progress={progress} compressed={tamponade} />

      <Text x={190} y={338} size={14} weight={700}>
        {tamponade ? "Reduced cardiac filling" : "Protective pericardial sac"}
      </Text>

      <Text x={190} y={359} size={10} color={MUTED}>
        {tamponade
          ? "Rapid fluid accumulation can cause shock"
          : "Normally contains a small amount of fluid"}
      </Text>
    </>
  );
}

function ValveScene({
  progress,
  regurgitation = false,
  aortic = false,
}: {
  progress: number;
  regurgitation?: boolean;
  aortic?: boolean;
}) {
  const opening = 34 - progress * 24;
  const cx = 190;
  const cy = 210;

  return (
    <>
      <circle
        cx={cx}
        cy={cy}
        r="79"
        fill="#152E4C"
        stroke={MUTED}
        strokeWidth={2}
      />

      {/* Valve ring */}
      <circle
        cx={cx}
        cy={cy}
        r="43"
        fill="#0B1F3A"
        stroke={GOLD}
        strokeWidth={4}
      />

      {/* Valve leaflets */}
      <path
        d={`M${cx - 37} ${cy - 20}
            Q${cx - opening / 2} ${cy}
            ${cx - 7} ${cy + 35}
            L${cx - 7} ${cy - 4} Z`}
        fill={RED}
        stroke="#F18A8A"
        strokeWidth={1.5}
      />

      <path
        d={`M${cx + 37} ${cy - 20}
            Q${cx + opening / 2} ${cy}
            ${cx + 7} ${cy + 35}
            L${cx + 7} ${cy - 4} Z`}
        fill={RED}
        stroke="#F18A8A"
        strokeWidth={1.5}
      />

      {regurgitation && (
        <Arrow
          x1={cx + 7}
          y1={cy - 48}
          x2={cx + 7}
          y2={cy - 8}
          color={BLUE}
        />
      )}

      {!regurgitation && (
        <Arrow
          x1={cx - 5}
          y1={cy - 62}
          x2={cx - 5}
          y2={cy - 29}
          color={GOLD}
        />
      )}

      <Text x={190} y={319} size={14} weight={700}>
        {aortic
          ? "Aortic valve"
          : "Mitral valve"}
      </Text>

      <Text x={190} y={340} size={11} color={MUTED}>
        {regurgitation
          ? "Incomplete closure • Backward flow"
          : "Narrowed opening • Restricted flow"}
      </Text>

      <Text x={190} y={370} size={10} color={GOLD}>
        {regurgitation ? "REGURGITATION" : "STENOSIS"}
      </Text>
    </>
  );
}

function CoronaryScene({
  progress,
  bypass = false,
}: {
  progress: number;
  bypass?: boolean;
}) {
  const plaqueWidth = 10 + progress * 18;

  return (
    <>
      <Text x={190} y={108} size={14} weight={700}>
        {bypass ? "Coronary artery bypass" : "Coronary artery disease"}
      </Text>

      {/* Arterial wall */}
      <rect
        x="45"
        y="175"
        width="290"
        height="62"
        rx="28"
        fill="#A83245"
        stroke="#F18A8A"
        strokeWidth={2}
      />

      {/* Lumen */}
      <rect
        x="55"
        y="192"
        width="270"
        height="28"
        rx="14"
        fill="#0B1F3A"
      />

      {!bypass && (
        <>
          <path
            d={`M${150 - plaqueWidth} 192
                Q150 160 ${170 + plaqueWidth} 192 Z`}
            fill={GOLD}
          />

          <path
            d={`M${190 - plaqueWidth} 220
                Q205 248 ${230 + plaqueWidth} 220 Z`}
            fill={GOLD}
          />

          <Arrow x1={75} y1={206} x2={132} y2={206} color={BLUE} />
          <Arrow x1={150} y1={206} x2={177} y2={206} color={BLUE} />

          <Text x={190} y={275} color={GOLD} size={12}>
            Atherosclerotic plaque
          </Text>
        </>
      )}

      {bypass && (
        <>
          {/* Simplified graft pathway */}
          <path
            d="M80 192 C90 125 280 125 300 192"
            fill="none"
            stroke={GOLD}
            strokeWidth={9}
            strokeLinecap="round"
          />

          <path
            d="M90 155 Q190 120 290 155"
            fill="none"
            stroke="#FFE18B"
            strokeWidth={3}
            strokeLinecap="round"
          />

          <Arrow x1={100} y1={151} x2={153} y2={137} color={WHITE} />
          <Arrow x1={222} y1={137} x2={278} y2={151} color={WHITE} />

          <Text x={190} y={275} color={GOLD} size={12}>
            Bypass graft
          </Text>
        </>
      )}

      <Text x={190} y={322} size={12} color={MUTED}>
        {bypass
          ? "An alternative route for blood flow"
          : "Narrowing reduces oxygen supply"}
      </Text>
    </>
  );
}

function TumourScene({ progress }: { progress: number }) {
  const radius = 12 + 13 * progress;

  return (
    <>
      <Heart progress={progress} />

      {/* Simplified tumour marker */}
      <circle
        cx="205"
        cy="177"
        r={radius}
        fill="#D4AF37"
        fillOpacity={0.85}
        stroke="#FFE18B"
        strokeWidth={3}
      />

      <circle
        cx={205 - radius * 0.25}
        cy={177 - radius * 0.25}
        r={radius * 0.22}
        fill="#FFF0B5"
      />

      <Arrow x1={290} y1={140} x2={226} y2={164} color={GOLD} />

      <Text x={292} y={126} color={GOLD} size={11}>
        Tumour
      </Text>

      <Text x={190} y={330} size={14} weight={700}>
        Cardiac tumour
      </Text>

      <Text x={190} y={351} size={10} color={MUTED}>
        May obstruct flow or cause emboli
      </Text>
    </>
  );
}

export default function CardiacStageSvg({
  stage,
  progress = 0,
}: Props) {
  const p = Math.max(0, Math.min(1, progress));

  let illustration: React.ReactNode;

  switch (stage.kind) {
    case "intro":
      illustration = <IntroScene progress={p} />;
      break;

    case "pericardium":
      illustration = <PericardiumScene progress={p} />;
      break;

    case "tamponade":
      illustration = <PericardiumScene progress={p} tamponade />;
      break;

    case "constrictive":
      illustration = (
        <>
          <ellipse
            cx="190"
            cy="210"
            rx="88"
            ry="110"
            fill="none"
            stroke={GOLD}
            strokeWidth="9"
          />
          <Heart progress={p} compressed />
          <Text x={190} y={344} size={14} weight={700}>
            Constrictive pericarditis
          </Text>
          <Text x={190} y={365} size={10} color={MUTED}>
            A rigid sac limits cardiac filling
          </Text>
        </>
      );
      break;

    case "mitral-stenosis":
      illustration = <ValveScene progress={p} />;
      break;

    case "mitral-regurgitation":
      illustration = <ValveScene progress={p} regurgitation />;
      break;

    case "aortic-stenosis":
      illustration = <ValveScene progress={p} aortic />;
      break;

    case "aortic-regurgitation":
      illustration = (
        <ValveScene progress={p} aortic regurgitation />
      );
      break;

    case "prosthetic-valves":
      illustration = (
        <>
          <circle
            cx="190"
            cy="205"
            r="72"
            fill="#152E4C"
            stroke={GOLD}
            strokeWidth={5}
          />
          <circle
            cx="190"
            cy="205"
            r="43"
            fill="#0B1F3A"
            stroke="#D6DDE7"
            strokeWidth={5}
          />
          <path
            d="M164 177 L216 233 M216 177 L164 233"
            stroke="#D6DDE7"
            strokeWidth={6}
            strokeLinecap="round"
          />
          <Text x={190} y={314} size={14} weight={700}>
            Prosthetic valve
          </Text>
          <Text x={190} y={337} size={11} color={MUTED}>
            Mechanical or bioprosthetic
          </Text>
          <Text x={190} y={361} size={10} color={GOLD}>
            Mechanical valves usually require lifelong VKA
          </Text>
        </>
      );
      break;

    case "coronary-disease":
      illustration = <CoronaryScene progress={p} />;
      break;

    case "myocardial-infarction":
      illustration = (
        <>
          <Heart progress={p} />
          <path
            d="M205 173 L220 192 L207 208 L224 226"
            stroke={GOLD}
            strokeWidth={10}
            fill="none"
            strokeLinecap="round"
          />
          <Text x={190} y={324} size={14} weight={700}>
            Myocardial infarction
          </Text>
          <Text x={190} y={346} size={10} color={MUTED}>
            Ischaemia causes myocardial injury
          </Text>
        </>
      );
      break;

    case "cabg":
      illustration = <CoronaryScene progress={p} bypass />;
      break;

    case "cardiac-tumour":
      illustration = <TumourScene progress={p} />;
      break;

    default:
      illustration = <IntroScene progress={p} />;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="380"
      height="460"
      viewBox="0 0 380 460"
      role="img"
      aria-label={stage.label}
    >
      <rect width="380" height="460" rx="16" fill={NAVY} />

      <path
        d="M18 60 H362"
        stroke="#2A3E5C"
        strokeWidth={1}
      />

      <Text
        x={20}
        y={34}
        size={10}
        color={GOLD}
        weight={700}
        anchor="start"
      >
        FAITH AND FOCUS ACADEMY
      </Text>

      <Text x={190} y={82} size={16} weight={700}>
        {stage.label}
      </Text>

      {illustration}

      <path
        d="M18 400 H362"
        stroke="#2A3E5C"
        strokeWidth={1}
      />

      <Text x={190} y={423} size={10} color={MUTED}>
        Surgical cardiac diseases
      </Text>

      <Text x={190} y={442} size={9} color={GOLD}>
        Educational illustration
      </Text>
    </svg>
  );
}
