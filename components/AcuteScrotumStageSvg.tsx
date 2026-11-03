import type { ReactNode } from "react";

export type AcuteScrotumKind =
  | "intro" | "anatomy" | "causes" | "torsion" | "signs" | "epi" | "appendix"
  | "assess" | "invest" | "manage" | "other" | "comp" | "case" | "final";

export type AcuteScrotumStage = { kind: AcuteScrotumKind; label: string; narration: string };

const NAVY = "#0B1F3A";
const CARD = "#14294D";
const LINE = "#2A3E5C";
const GOLD = "#D4AF37";
const CREAM = "#F4F1EA";
const MUTED = "#9AA6B8";
const RED = "#E5584F";
const GREEN = "#5BBF8A";
const BLUE = "#5B9BD5";
const FLESH = "#C98B73";
const FLESH_EDGE = "#9A6450";
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

function Card({ x, y, w, h, children }: { x: number; y: number; w: number; h: number; children?: ReactNode }) {
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

function Divider({ y }: { y: number }) {
  return <line x1={50} y1={y} x2={330} y2={y} stroke={LINE} strokeWidth={1.5} />;
}

function NumDot({ x, y, n, hot = false }: { x: number; y: number; n: number; hot?: boolean }) {
  return (
    <g>
      <circle cx={x} cy={y} r={14} fill={hot ? GOLD : CARD} stroke={hot ? GOLD : LINE} strokeWidth={1.5} />
      <Txt x={x} y={y + 5} size={15} fill={hot ? NAVY : CREAM} weight={700}>{String(n)}</Txt>
    </g>
  );
}

/* ---------- Scenes ---------- */

function SceneIntro() {
  return (
    <>
      <ellipse cx={190} cy={160} rx={104} ry={74} fill="none" stroke={LINE} strokeWidth={3} strokeDasharray="6 6" />
      <line x1={150} y1={84} x2={150} y2={128} stroke={MUTED} strokeWidth={4} strokeLinecap="round" />
      <line x1={230} y1={84} x2={230} y2={128} stroke={MUTED} strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={150} cy={170} rx={34} ry={44} fill={FLESH} stroke={RED} strokeWidth={5} />
      <ellipse cx={230} cy={170} rx={34} ry={44} fill={FLESH} stroke={FLESH_EDGE} strokeWidth={2} />
      <circle cx={150} cy={170} r={14} fill={RED} />
      <Txt x={150} y={177} size={20} fill={CREAM} weight={700}>!</Txt>
      <Txt x={190} y={268} size={15}>Sudden pain, swelling or tenderness</Txt>
      <Txt x={190} y={292} size={15}>Develops over hours</Txt>
      <Txt x={190} y={322} size={17} fill={RED} weight={700}>A urological emergency</Txt>
      <Divider y={346} />
      <Txt x={190} y={374} size={13} fill={MUTED}>THE GOLDEN RULE</Txt>
      <Txt x={190} y={400} size={16} fill={GOLD} weight={700}>Always exclude testicular torsion</Txt>
    </>
  );
}

function SceneAnatomy() {
  return (
    <>
      <line x1={190} y1={84} x2={190} y2={200} stroke={CREAM} strokeWidth={3} strokeLinecap="round" />
      <line x1={180} y1={84} x2={180} y2={200} stroke={RED} strokeWidth={4} strokeLinecap="round" />
      <polyline points="200,84 207,100 199,116 207,132 199,148 207,164 199,180 205,200" fill="none" stroke={BLUE} strokeWidth={4} strokeLinejoin="round" />
      <ellipse cx={190} cy={248} rx={50} ry={58} fill={FLESH} stroke={FLESH_EDGE} strokeWidth={2} />
      <path d="M 232 208 Q 258 250 228 296" fill="none" stroke={GOLD} strokeWidth={9} strokeLinecap="round" />
      <Txt x={20} y={110} size={13} fill={RED} weight={700} anchor="start">Testicular artery</Txt>
      <Txt x={20} y={127} size={11} fill={MUTED} anchor="start">from the aorta</Txt>
      <Txt x={360} y={110} size={13} fill={BLUE} weight={700} anchor="end">Pampiniform plexus</Txt>
      <Txt x={360} y={127} size={11} fill={MUTED} anchor="end">venous drainage</Txt>
      <Txt x={20} y={252} size={14} anchor="start" weight={700}>Testis</Txt>
      <Txt x={360} y={258} size={14} fill={GOLD} weight={700} anchor="end">Epididymis</Txt>
      <Txt x={360} y={275} size={11} fill={MUTED} anchor="end">sperm maturation + storage</Txt>
      <Divider y={324} />
      <Txt x={190} y={348} size={12} fill={MUTED}>Spermatic cord</Txt>
      <Txt x={190} y={368} size={13}>vas deferens · vessels · nerves · lymphatics</Txt>
      <Txt x={190} y={404} size={14} fill={RED} weight={700}>Twisted cord: ischaemia, then infarction</Txt>
    </>
  );
}

function SceneCauses() {
  const items = [
    "Testicular torsion",
    "Epididymo-orchitis",
    "Torsion of the appendix testis",
    "Incarcerated or strangulated hernia",
    "Scrotal trauma",
    "Tumour with haemorrhage or infarction",
    "Idiopathic scrotal oedema",
  ];
  return (
    <>
      {items.map((t, i) => (
        <g key={t}>
          <NumDot x={40} y={102 + i * 48} n={i + 1} hot={i === 0} />
          <Txt x={68} y={108 + i * 48} size={i === 0 ? 18 : 15} fill={i === 0 ? GOLD : CREAM} weight={i === 0 ? 700 : 400} anchor="start">{t}</Txt>
        </g>
      ))}
      <Txt x={68} y={124} size={11} fill={RED} weight={700} anchor="start">MOST URGENT</Txt>
    </>
  );
}

function SceneTorsion() {
  const intra = ["Twists inside the", "tunica vaginalis", "Bell-clapper", "deformity", "Peak age 12 to 18"];
  const extra = ["Testis and its coverings", "twist together", "More common in", "neonates"];
  return (
    <>
      <Card x={15} y={84} w={160} h={176}>
        <Txt x={95} y={112} size={17} fill={GOLD} weight={700}>Intravaginal</Txt>
        {intra.map((t, i) => (
          <Txt key={t} x={95} y={142 + i * 25} size={13}>{t}</Txt>
        ))}
      </Card>
      <Card x={205} y={84} w={160} h={176}>
        <Txt x={285} y={112} size={17} fill={GOLD} weight={700}>Extravaginal</Txt>
        {extra.map((t, i) => (
          <Txt key={t} x={285} y={142 + i * 25} size={13}>{t}</Txt>
        ))}
      </Card>
      <Divider y={282} />
      <Txt x={190} y={308} size={14} fill={BLUE} weight={700}>Veins blocked first: congestion, swelling</Txt>
      <Txt x={190} y={332} size={14} fill={RED} weight={700}>Then arteries: ischaemia, infarction</Txt>
      <Txt x={190} y={376} size={13} fill={MUTED}>Hence</Txt>
      <Txt x={190} y={402} size={17} fill={GOLD} weight={700}>Early surgery is essential</Txt>
    </>
  );
}

function SceneSigns() {
  const signs = [
    "Sudden severe one-sided pain",
    "Scrotal swelling",
    "Nausea and vomiting",
    "High-riding testis",
    "Horizontal or abnormal lie",
    "Marked testicular tenderness",
  ];
  return (
    <>
      {signs.map((t, i) => (
        <g key={t}>
          <circle cx={40} cy={96 + i * 31} r={5} fill={GOLD} />
          <Txt x={58} y={101 + i * 31} size={15} anchor="start">{t}</Txt>
        </g>
      ))}
      <Card x={30} y={284} w={320} h={52}>
        <Txt x={190} y={317} size={17} fill={GOLD} weight={700}>Cremasteric reflex is absent</Txt>
      </Card>
      <Txt x={190} y={364} size={12} fill={MUTED}>{"Prehn's sign is unreliable: never use it to exclude torsion"}</Txt>
      <Txt x={190} y={394} size={15} fill={RED} weight={700}>Best salvage within 6 hours</Txt>
      <Txt x={190} y={414} size={12} fill={MUTED}>Late presentation: still explore</Txt>
    </>
  );
}

function SceneEpi() {
  return (
    <>
      <Card x={15} y={84} w={160} h={122}>
        <Txt x={95} y={110} size={15} fill={GOLD} weight={700}>Younger men</Txt>
        <Txt x={95} y={127} size={11} fill={MUTED}>sexually active</Txt>
        <Txt x={95} y={158} size={14}>Chlamydia</Txt>
        <Txt x={95} y={180} size={14}>Gonorrhoea</Txt>
      </Card>
      <Card x={205} y={84} w={160} h={122}>
        <Txt x={285} y={110} size={15} fill={GOLD} weight={700}>Older men</Txt>
        <Txt x={285} y={127} size={11} fill={MUTED}>urinary obstruction</Txt>
        <Txt x={285} y={158} size={14}>E. coli</Txt>
        <Txt x={285} y={180} size={11} fill={MUTED}>enteric organisms</Txt>
      </Card>
      <Txt x={190} y={238} size={14} fill={GOLD} weight={700}>Features</Txt>
      <Txt x={40} y={266} size={13} anchor="start">Gradual onset pain</Txt>
      <Txt x={40} y={290} size={13} anchor="start">Scrotal swelling</Txt>
      <Txt x={40} y={314} size={13} anchor="start">Fever</Txt>
      <Txt x={205} y={266} size={13} anchor="start">Dysuria, frequency</Txt>
      <Txt x={205} y={290} size={13} anchor="start">Urethral discharge</Txt>
      <Txt x={205} y={314} size={13} anchor="start">Epididymal tenderness</Txt>
      <Divider y={346} />
      <Txt x={190} y={374} size={15} fill={GOLD} weight={700}>Torsion: sudden. Epididymitis: gradual</Txt>
      <Txt x={190} y={396} size={12} fill={MUTED}>but the features overlap</Txt>
    </>
  );
}

function SceneAppendix() {
  return (
    <>
      <ellipse cx={190} cy={156} rx={50} ry={62} fill={FLESH} stroke={FLESH_EDGE} strokeWidth={2} />
      <circle cx={190} cy={92} r={8} fill={BLUE} stroke={CREAM} strokeWidth={2} />
      <line x1={200} y1={90} x2={246} y2={80} stroke={BLUE} strokeWidth={2} />
      <Txt x={252} y={85} size={13} fill={BLUE} weight={700} anchor="start">Blue-dot sign</Txt>
      <Txt x={20} y={110} size={12} fill={MUTED} anchor="start">upper pole</Txt>
      <Txt x={190} y={254} size={17} weight={700}>Prepubertal boys</Txt>
      <Txt x={190} y={278} size={13}>Upper-pole tenderness, mild swelling</Txt>
      <Txt x={190} y={300} size={12} fill={MUTED}>the blue dot is not always present</Txt>
      <Divider y={322} />
      <Txt x={190} y={350} size={15} fill={GOLD} weight={700}>Analgesia, rest,</Txt>
      <Txt x={190} y={372} size={15} fill={GOLD} weight={700}>scrotal support</Txt>
      <Txt x={190} y={404} size={13} fill={RED}>Only once torsion has been excluded</Txt>
    </>
  );
}

function SceneAssess() {
  const hx = ["Onset and duration", "Site and severity", "Previous episodes", "Fever, vomiting", "Urinary symptoms", "Urethral discharge", "Sexual history", "Trauma or surgery"];
  const ex = ["Vital signs", "Swelling, redness", "Testis position", "Testis tenderness", "Epididymal tenderness", "Cremasteric reflex", "Inguinal region", "Abdomen and groin"];
  return (
    <>
      <Card x={12} y={84} w={172} h={272}>
        <Txt x={98} y={112} size={16} fill={GOLD} weight={700}>History</Txt>
        {hx.map((t, i) => (
          <Txt key={t} x={26} y={144 + i * 26} size={12} anchor="start">{t}</Txt>
        ))}
      </Card>
      <Card x={196} y={84} w={172} h={272}>
        <Txt x={282} y={112} size={16} fill={GOLD} weight={700}>Examination</Txt>
        {ex.map((t, i) => (
          <Txt key={t} x={210} y={144 + i * 26} size={12} anchor="start">{t}</Txt>
        ))}
      </Card>
      <Txt x={190} y={390} size={15} fill={RED} weight={700}>{"Don't delay surgical review"}</Txt>
      <Txt x={190} y={412} size={12} fill={MUTED}>for unnecessary investigations</Txt>
    </>
  );
}

function SceneInvest() {
  const rows: [string, string][] = [
    ["Colour Doppler ultrasound", "reduced flow = torsion; normal does not exclude"],
    ["Urinalysis", "pyuria or bacteriuria"],
    ["Urine culture", "identifies the organism"],
    ["STI testing", "gonorrhoea and chlamydia"],
    ["FBC and inflammatory markers", "infection or inflammation"],
  ];
  return (
    <>
      {rows.map(([t, s], i) => (
        <g key={t}>
          <NumDot x={40} y={104 + i * 58} n={i + 1} hot={i === 0} />
          <Txt x={66} y={103 + i * 58} size={16} anchor="start" weight={i === 0 ? 700 : 400} fill={i === 0 ? GOLD : CREAM}>{t}</Txt>
          <Txt x={66} y={122 + i * 58} size={11.5} fill={MUTED} anchor="start">{s}</Txt>
        </g>
      ))}
      <Divider y={352} />
      <Txt x={190} y={384} size={17} fill={RED} weight={700}>Never delay surgery</Txt>
      <Txt x={190} y={406} size={13} fill={MUTED}>if torsion is strongly suspected</Txt>
    </>
  );
}

function SceneManage() {
  const steps = [
    "Urgent urology or surgical call",
    "Nil by mouth",
    "Intravenous access",
    "Analgesia",
    "IV fluids if indicated",
    "Urgent scrotal exploration",
  ];
  return (
    <>
      {steps.map((t, i) => (
        <g key={t}>
          <NumDot x={40} y={98 + i * 40} n={i + 1} hot={i === 5} />
          <Txt x={66} y={104 + i * 40} size={15} anchor="start" weight={i === 5 ? 700 : 400} fill={i === 5 ? GOLD : CREAM}>{t}</Txt>
        </g>
      ))}
      <Divider y={318} />
      <Txt x={190} y={344} size={14} fill={GREEN} weight={700}>Viable: untwist + bilateral orchidopexy</Txt>
      <Txt x={190} y={368} size={14} fill={RED} weight={700}>Non-viable: orchidectomy</Txt>
      <Txt x={190} y={404} size={12} fill={MUTED}>Manual detorsion never replaces exploration</Txt>
    </>
  );
}

function SceneOther() {
  const rows: [string, string][] = [
    ["Epididymo-orchitis", "Antibiotics, rest, support; treat partners"],
    ["Appendix testis torsion", "Analgesia, rest, scrotal support"],
    ["Incarcerated or strangulated hernia", "Urgent surgical assessment and repair"],
    ["Scrotal trauma", "Suspected rupture: urgent exploration"],
  ];
  return (
    <>
      {rows.map(([h, s], i) => (
        <Card key={h} x={15} y={80 + i * 84} w={350} h={72}>
          <Txt x={30} y={80 + i * 84 + 28} size={14} fill={GOLD} weight={700} anchor="start">{h}</Txt>
          <Txt x={30} y={80 + i * 84 + 52} size={12.5} anchor="start">{s}</Txt>
        </Card>
      ))}
    </>
  );
}

function SceneComp() {
  const items = [
    "Testicular infarction",
    "Testicular atrophy",
    "Loss of the testis",
    "Reduced fertility",
    "Chronic scrotal pain",
    "Sepsis in severe infection",
  ];
  return (
    <>
      {items.map((t, i) => (
        <g key={t}>
          <circle cx={46} cy={104 + i * 44} r={5} fill={GOLD} />
          <Txt x={66} y={110 + i * 44} size={17} anchor="start">{t}</Txt>
        </g>
      ))}
      <Divider y={352} />
      <Txt x={190} y={382} size={17} fill={RED} weight={700}>Most feared: testicular loss</Txt>
      <Txt x={190} y={404} size={12} fill={MUTED}>from infarction in untreated torsion</Txt>
    </>
  );
}

function SceneCase() {
  const qa: [string, string][] = [
    ["Most likely diagnosis?", "Right testicular torsion"],
    ["Next step?", "Urgent urology + scrotal exploration"],
    ["Should ultrasound delay surgery?", "No"],
    ["Operation if the testis is viable?", "Detorsion + bilateral orchidopexy"],
  ];
  return (
    <>
      <Card x={15} y={80} w={350} h={120}>
        <Txt x={30} y={104} size={14} fill={GOLD} weight={700} anchor="start">16-year-old boy</Txt>
        <Txt x={30} y={126} size={13} anchor="start">Sudden severe right scrotal pain, 3 hours</Txt>
        <Txt x={30} y={148} size={13} anchor="start">Vomited twice</Txt>
        <Txt x={30} y={170} size={13} anchor="start">Right testis swollen, tender, high-riding</Txt>
        <Txt x={30} y={190} size={13} anchor="start">Right cremasteric reflex absent</Txt>
      </Card>
      {qa.map(([q, a], i) => (
        <g key={q}>
          <Txt x={22} y={232 + i * 52} size={12} fill={MUTED} anchor="start">{q}</Txt>
          <Txt x={22} y={254 + i * 52} size={15} fill={GOLD} weight={700} anchor="start">{a}</Txt>
        </g>
      ))}
    </>
  );
}

function SceneFinal() {
  const rows: [string, string][] = [
    ["Sudden severe pain", "Torsion"],
    ["Gradual, fever, dysuria", "Epididymo-orchitis"],
    ["High-riding testis", "Torsion"],
    ["Absent cremasteric reflex", "Torsion"],
    ["Blue-dot sign", "Appendix testis"],
    ["Absent Doppler flow", "Torsion"],
    ["Bilateral orchidopexy", "Prevents recurrence"],
  ];
  return (
    <>
      {rows.map(([l, r], i) => (
        <g key={l}>
          <Txt x={22} y={104 + i * 38} size={13} anchor="start">{l}</Txt>
          <Txt x={358} y={104 + i * 38} size={13} fill={GOLD} weight={700} anchor="end">{r}</Txt>
          <line x1={22} y1={114 + i * 38} x2={358} y2={114 + i * 38} stroke={LINE} strokeWidth={1} />
        </g>
      ))}
      <Txt x={190} y={388} size={17} fill={GOLD} weight={700}>Think torsion first</Txt>
      <Txt x={190} y={412} size={12} fill={MUTED}>Late presentation: never abandon exploration</Txt>
    </>
  );
}

export default function AcuteScrotumStageSvg({ stage }: { stage: AcuteScrotumStage }) {
  let scene: ReactNode;
  switch (stage.kind) {
    case "intro": scene = <SceneIntro />; break;
    case "anatomy": scene = <SceneAnatomy />; break;
    case "causes": scene = <SceneCauses />; break;
    case "torsion": scene = <SceneTorsion />; break;
    case "signs": scene = <SceneSigns />; break;
    case "epi": scene = <SceneEpi />; break;
    case "appendix": scene = <SceneAppendix />; break;
    case "assess": scene = <SceneAssess />; break;
    case "invest": scene = <SceneInvest />; break;
    case "manage": scene = <SceneManage />; break;
    case "other": scene = <SceneOther />; break;
    case "comp": scene = <SceneComp />; break;
    case "case": scene = <SceneCase />; break;
    case "final": scene = <SceneFinal />; break;
    default: scene = null;
  }
  return <Frame title={stage.label}>{scene}</Frame>;
}
