"use client";
import AutoVideoExporter from "./AutoVideoExporter";
import CardiacStageSvg from "./CardiacStageSvg";
import type { CardiacStage } from "./CardiacStageSvg";

const PART1: CardiacStage[] = [
  {
    kind: "a1",
    label: "The heart as a house",
    narration:
      "Think of the heart as a house: plumbing, which is the coronary arteries, doors, which are the valves, a protective sac, the pericardium, and wiring, the conduction system. Whatever breaks, the end result is usually heart failure. Surgery is for when the structure itself is broken: a blocked pipe, a leaking or jammed door, a squeezing sac, or a tumour.",
  },
  {
    kind: "a2",
    label: "Mechanical or electrical",
    narration:
      "Mechanical failures are tamponade, constriction, valve disease, coronary blockage and tumours, fixed by drainage, valve surgery, bypass or excision. Electrical failures are heart block, arrhythmias and cardiac arrest, fixed by pacing or defibrillation. In third-degree heart block no atrial impulse reaches the ventricles, and the patient needs a pacemaker.",
  },
  {
    kind: "a3",
    label: "Types of shock",
    narration:
      "Separate the four types of shock. Cardiogenic is pump failure, such as massive heart attack. Obstructive is a blockage to filling or outflow: T, P, T, for Tamponade, tension Pneumothorax, and Thromboembolism. Hypovolaemic is too little volume, and distributive is vasodilatation, as in sepsis.",
  },
  {
    kind: "a4",
    label: "Coronaries and valves",
    narration:
      "The right coronary supplies the right heart and the S A and A V nodes, so its blockage causes inferior infarcts and heart block. The left anterior descending artery supplies the septum, and a complete blockage is the widowmaker. The mitral valve has two leaflets and an area of 4 to 6 square centimetres, bigger than the aortic valve's 3 to 4.",
  },
  {
    kind: "a5",
    label: "The pericardium",
    narration:
      "The pericardium is a two-layer bag with 15 to 35 millilitres of lubricating fluid. It holds the heart in place, reduces friction and limits sudden over-distension. That limited stretch is exactly why fluid that collects fast causes tamponade.",
  },
  {
    kind: "a6",
    label: "Pericardial causes",
    narration:
      "Remember TRUMP, C, V, I: T B or Trauma, Radiation, Uraemia, Malignancy, Post-op or Post-M I, Collagen-vascular, Viral or bacterial, and Idiopathic. In Nigeria and the tropics, think tuberculosis first for a large effusion or constriction. Pericarditis gives pleuritic chest pain, better sitting forward, with a friction rub.",
  },
  {
    kind: "a7",
    label: "Tamponade",
    narration:
      "In tamponade, rising pressure in the sac squashes the right atrium and right ventricle, so the heart cannot fill and output falls. Beck's triad is three H's: Hypotension, Hushed heart sounds, and Hugely distended neck veins. Pulsus paradoxus is a fall in systolic pressure of more than 10 millimetres of mercury on inspiration.",
  },
  {
    kind: "a8",
    label: "Constrict vs restrict",
    narration:
      "In constriction, a thick, scarred, often calcified pericardium wraps the heart in a rigid shell, so filling stops abruptly. Look for a pericardial knock, Kussmaul sign, and a thickened pericardium on C T. Restriction is a stiff muscle, with a normal pericardium. Constriction can be cured by cutting the shell, while restriction cannot.",
  },
  {
    kind: "a9",
    label: "Investigate and treat",
    narration:
      "Echocardiography is the gold standard for effusion: under 10 millimetres is small, 10 to 19 moderate, and 20 or more large. The E C G may show low voltage and electrical alternans. Unstable tamponade needs echo-guided pericardiocentesis, with fluids to keep preload. Constriction needs pericardiectomy, usually through a median sternotomy, with anti-T B drugs if the cause is T B.",
  },
];

const PART2: CardiacStage[] = [
  {
    kind: "b1",
    label: "Two ways a valve fails",
    narration:
      "A valve fails in two ways: too tight, which is stenosis, or too leaky, which is regurgitation. Tight means pressure builds behind it, and leaky means volume overload in front of it. Rheumatic heart disease is the main cause in developing countries: antibodies against group A streptococcus attack the valves, mostly the mitral. Remember the Jones criteria: Joints, carditis, Nodules, Erythema marginatum, Sydenham chorea.",
  },
  {
    kind: "b2",
    label: "Mitral stenosis",
    narration:
      "In mitral stenosis, a narrowed valve raises left atrial pressure and causes pulmonary hypertension. Listen for a loud first sound, an opening snap, then a rumbling diastolic murmur: snap then rumble. The closer the snap is to the second sound, the tighter the valve. Complications are A, E, H, H: atrial fibrillation, emboli, haemoptysis and hoarseness.",
  },
  {
    kind: "b3",
    label: "Mitral regurgitation",
    narration:
      "In mitral regurgitation, blood leaks back into the left atrium, giving a pansystolic murmur at the apex radiating to the axilla. The heart first copes by the Frank–Starling mechanism, then dilates and fails. Mitral valve prolapse is a floppy valve with a mid-systolic click. Repair is preferred in regurgitation, because it preserves the ventricle.",
  },
  {
    kind: "b4",
    label: "Aortic stenosis",
    narration:
      "Aortic stenosis raises the afterload on the left ventricle, with a slow-rising pulse and an ejection systolic murmur radiating to both carotids. Remember SAD: Syncope, Angina, Dyspnoea. Survival is about 5 years after angina, 3 after syncope, and 2 after heart failure. Treatment is valve replacement once it is symptomatic or severe.",
  },
  {
    kind: "b5",
    label: "Aortic regurgitation",
    narration:
      "In aortic regurgitation the ventricle fills from the atrium and from the aorta, so it dilates, even to cor bovinum. The pulse is collapsing with a wide pulse pressure, and the murmur is an early diastolic decrescendo, with an Austin Flint murmur at the apex. Signs are Corrigan's pulse, de Musset's head nodding, and Quincke's nail-bed pulsation.",
  },
  {
    kind: "b6",
    label: "Mechanical or tissue",
    narration:
      "Mechanical valves last forever, but the patient needs warfarin for life: mechanical means Must take warfarin. Bioprosthetic valves, from pig or cow, need no warfarin, but they wear out: Bio burns out. Auto means your own tissue, homo means human cadaver, and xeno means animal. Young patients get mechanical valves, and the elderly get tissue valves.",
  },
  {
    kind: "b7",
    label: "Warfarin and pregnancy",
    narration:
      "Your lecturer's I N R targets are 2 to 2.5 for the mitral valve and 1.5 to 2 for the tricuspid. International guidelines usually say 2.5 to 3.5 for a mechanical mitral valve. In an exam, give your lecturer's number and show you know the guideline. Warfarin is teratogenic, so a woman with a mechanical valve needs counselling and a planned switch of anticoagulant before pregnancy.",
  },
  {
    kind: "b8",
    label: "Coronary artery disease",
    narration:
      "Atherosclerosis narrows the coronaries. Partial blockage gives angina, and complete blockage kills muscle: infarction. By stenosis, 50 percent diameter loss is 75 percent area loss, so a moderate stenosis already limits flow on exertion. Disease is graded as single, double or triple vessel, with left main disease as its own high-risk category.",
  },
  {
    kind: "b9",
    label: "Bypass surgery",
    narration:
      "Bypass surgery doesn't unblock the old artery. It builds a detour. The strong indications are three-system disease, left main stenosis, diabetics with multivessel disease, and poor L V function with graftable vessels. The best graft is the left internal mammary artery to the L A D: LIMA loves LAD. Arteries last, veins fade. Watch for bleeding, atrial fibrillation on days 2 to 4, and sternal wound infection.",
  },
  {
    kind: "b10",
    label: "Cardiac tumours",
    narration:
      "Most tumours in the heart are secondary, and always malignant. The commonest primary tumour in adults is the myxoma, a benign, jelly-like growth on a stalk, usually in the left atrium of a woman aged 30 to 60. Its triad is E, O, C: Embolism, Obstruction, Constitutional symptoms. Echo is the imaging of choice, and treatment is open-heart excision, with a cuff of septum to reduce recurrence. The commonest malignant primary is angiosarcoma, which is very aggressive.",
  },
];

function Section({ title, stages, button, file }: { title: string; stages: CardiacStage[]; button: string; file: string }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", color: "#F4F1EA" }}>
      <p style={{ color: "#D4AF37", fontSize: ".8rem", textTransform: "uppercase", marginBottom: 12 }}>{title}</p>
      <AutoVideoExporter stages={stages} StageComponent={CardiacStageSvg} buttonLabel={button} fileName={file} />
    </div>
  );
}

const rule = { margin: "40px 0", border: "none", borderTop: "1px solid #2A3E5C" } as const;

export default function CardiacVideos() {
  return (
    <>
      <Section title="Cardiac surgery 1: big picture and pericardium" stages={PART1} button="Make cardiac video 1" file="cardiac-part1.mp4" />
      <hr style={rule} />
      <Section title="Cardiac surgery 2: valves, bypass and tumours" stages={PART2} button="Make cardiac video 2" file="cardiac-part2.mp4" />
    </>
  );
}
