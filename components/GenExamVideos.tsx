"use client";
import AutoVideoExporter from "./AutoVideoExporter";
import GenExamStageSvg from "./GenExamStageSvg";
import type { GenStage } from "./GenExamStageSvg";

const PART1: GenStage[] = [
  {
    kind: "a1",
    label: "Before you touch",
    narration:
      "Clean your hands. Introduce yourself, confirm the patient's identity, explain the examination and get consent. Then position the patient comfortably, keep privacy, expose only what is needed, and use good light.",
  },
  {
    kind: "a2",
    label: "General inspection",
    narration:
      "Stand back and look before you touch. Note apparent age, consciousness, orientation, nutrition, hydration, posture, gait, facial expression, respiratory distress and pain.",
  },
  {
    kind: "a3",
    label: "General appearance",
    narration:
      "A well-looking patient is comfortable. Acutely ill suggests severe infection, shock, or acute heart or lung disease. Chronically ill suggests cancer or chronic infection, kidney, liver or lung disease. Wasting suggests cancer, T B or advanced organ disease, and obesity goes with diabetes, hypertension and osteoarthritis.",
  },
  {
    kind: "a4",
    label: "Vital signs",
    narration:
      "Check temperature, pulse, blood pressure, respiratory rate and oxygen saturation. For the pulse, assess rate, rhythm, volume and character, and look for radio-radial and radio-femoral delay. Also look for postural hypotension.",
  },
  {
    kind: "a5",
    label: "Hair and scalp",
    narration:
      "Look at hair distribution, thickness, colour, loss, and scalp scaling, scars and lesions. Alopecia points to endocrine, nutritional, autoimmune or drug causes. Dry, brittle hair suggests nutritional deficiency or hypothyroidism.",
  },
  {
    kind: "a6",
    label: "The face",
    narration:
      "Look for symmetry. Asymmetry suggests facial palsy or stroke. A mask-like face suggests Parkinsonism. Cushing syndrome gives a round moon face, myxoedema gives a puffy coarse face, and thyrotoxicosis gives an anxious, staring look.",
  },
  {
    kind: "a7",
    label: "The eyes",
    narration:
      "Pull down the lower lid. Pale conjunctiva means anaemia. Yellow sclera means jaundice, from prehepatic, hepatic or post-hepatic causes. A grey ring around the cornea is arcus, and yellow plaques on the lids are xanthelasma, both linked to dyslipidaemia. Check pupil size, shape and reaction to light.",
  },
  {
    kind: "a8",
    label: "Nose and mouth",
    narration:
      "Nasal flaring means increased work of breathing. In the mouth, blue lips or tongue mean central cyanosis, and a pale tongue means anaemia. A smooth tongue suggests iron, B twelve or folate deficiency, and a dry tongue means dehydration. Cracks at the mouth corners suggest iron deficiency.",
  },
  {
    kind: "a9",
    label: "JVP and carotids",
    narration:
      "Sit the patient at 30 to 45 degrees with the head turned slightly away. A raised J V P suggests right heart failure, fluid overload, tricuspid regurgitation, constrictive pericarditis or tamponade. For hepatojugular reflux, press over the right upper abdomen. Palpate one carotid at a time, and never both together.",
  },
  {
    kind: "a10",
    label: "Nodes and thyroid",
    narration:
      "Describe any node with S, S, S, C, M, T: Site, Size, Surface, Consistency, Mobility and Tenderness. Tender and soft is usually infection. Hard, irregular and fixed is suspicious for cancer. Rubbery suggests lymphoma, and matted suggests T B. For the thyroid, ask the patient to swallow, because the thyroid moves up.",
  },
];

const PART2: GenStage[] = [
  {
    kind: "b1",
    label: "The chest",
    narration:
      "Count the respiratory rate and look for accessory muscle use, recession, nasal flaring and central cyanosis. Tachypnoea can mean pneumonia, asthma, C O P D, pulmonary oedema, embolism or acidosis. Also look for scars, a pacemaker and dilated veins.",
  },
  {
    kind: "b2",
    label: "Hands and nails",
    narration:
      "Check for clubbing, koilonychia, splinter haemorrhages and tremor. In clubbing, the nail-bed angle is lost, and Schamroth's window disappears. Causes are Lung, Heart and Gut. Koilonychia means iron deficiency. A fine tremor suggests hyperthyroidism or anxiety, and asterixis suggests liver failure, uraemia or hypercapnia.",
  },
  {
    kind: "b3",
    label: "Palpating the arms",
    narration:
      "Cold hands suggest shock, low cardiac output or vasoconstriction. Warm hands suggest fever or hyperthyroidism. Check capillary refill for perfusion, and assess the pulse for rate, rhythm, volume and character.",
  },
  {
    kind: "b4",
    label: "The abdomen",
    narration:
      "Look for distension, scars, striae, dilated veins, hernias and masses. Distension has five causes, the five Fs: Fat, Fluid, Flatus, Faeces and Fetus. Dilated veins suggest portal hypertension. Always ask what operation caused a scar.",
  },
  {
    kind: "b5",
    label: "Back and groin",
    narration:
      "Inspect the spine, skin and scars, and look for pressure sores. Sacral oedema matters in bedridden patients and in fluid overload. In the groin, check inguinal nodes, hernias and the femoral pulse.",
  },
  {
    kind: "b6",
    label: "Lower limb inspection",
    narration:
      "Look at the skin for ulcers, rashes, shiny skin, hair loss and gangrene, and at the muscles for wasting. Check for varicose veins and swollen joints. Look for oedema around the ankles and shins, and press: if an indentation remains, it is pitting oedema.",
  },
  {
    kind: "b7",
    label: "Swollen legs",
    narration:
      "Bilateral oedema: think Heart, Kidney, Liver, Low albumin, Drugs. Calcium-channel blockers are one example. Unilateral swelling suggests D V T, cellulitis, trauma, lymphoedema or venous obstruction.",
  },
  {
    kind: "b8",
    label: "Pulses and feet",
    narration:
      "Feel the femoral, popliteal, posterior tibial and dorsalis pedis pulses, and compare right with left. Inspect the feet for ulcers, gangrene, infection, fungal infection, nail changes and deformity. This matters most in diabetes and peripheral vascular disease.",
  },
  {
    kind: "b9",
    label: "Finishing up",
    narration:
      "Make the patient comfortable, cover them, thank them and clean your hands. Don't just say the examination is normal. Give a proper summary: consciousness, nutrition, hydration, then pallor, jaundice, cyanosis, clubbing, nodes, J V P and oedema. If findings are abnormal, describe them first, then name the focused examination you need.",
  },
  {
    kind: "b10",
    label: "Head-to-toe map",
    narration:
      "Remember the direction: hair, face, eyes, nose, mouth, neck, chest, upper limbs, abdomen, back, groin, thighs, knees, legs, ankles, feet. At every level: look, palpate, identify findings, and think differentials.",
  },
];

function Section({ title, stages, button, file }: { title: string; stages: GenStage[]; button: string; file: string }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", color: "#F4F1EA" }}>
      <p style={{ color: "#D4AF37", fontSize: ".8rem", textTransform: "uppercase", marginBottom: 12 }}>{title}</p>
      <AutoVideoExporter stages={stages} StageComponent={GenExamStageSvg} buttonLabel={button} fileName={file} />
    </div>
  );
}

const rule = { margin: "40px 0", border: "none", borderTop: "1px solid #2A3E5C" } as const;

export default function GenExamVideos() {
  return (
    <>
      <Section title="General examination 1: preparation to neck" stages={PART1} button="Make general exam video 1" file="general-exam-part1.mp4" />
      <hr style={rule} />
      <Section title="General examination 2: chest to feet" stages={PART2} button="Make general exam video 2" file="general-exam-part2.mp4" />
    </>
  );
}
