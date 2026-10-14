"use client";

import AutoVideoExporter from "./AutoVideoExporter";
import CardiacStageSvg from "./CardiacStageSvg";
import type { CardiacStage } from "./CardiacStageSvg";

const PART1: CardiacStage[] = [
  {
    kind: "a1",
    label: "The heart as a house",
    narration:
      "Think of the heart as a house. The coronary arteries are the plumbing, the valves are the doors, the pericardium is the protective sac, and the conduction system is the electrical wiring. Cardiac surgery corrects structural problems such as blocked arteries, diseased valves, tamponade, and tumours.",
  },
  {
    kind: "a2",
    label: "Mechanical or electrical",
    narration:
      "Mechanical problems include tamponade, constriction, valve disease, coronary obstruction, and tumours. Treatment may require drainage, valve surgery, bypass, or tumour excision. Electrical problems include arrhythmias and heart block. Complete heart block may require a permanent pacemaker, while life-threatening shockable arrhythmias may require defibrillation.",
  },
  {
    kind: "a3",
    label: "Types of shock",
    narration:
      "Remember four types of shock. Cardiogenic shock is pump failure, such as after a massive myocardial infarction. Obstructive shock results from impaired filling or outflow: tamponade, tension pneumothorax, and thromboembolism. Hypovolaemic shock is caused by fluid or blood loss. Distributive shock results from abnormal vasodilatation, as in sepsis.",
  },
  {
    kind: "a4",
    label: "Coronaries and valves",
    narration:
      "The right coronary artery commonly supplies the inferior heart and may supply the SA and AV nodes. The left anterior descending artery supplies the anterior left ventricle and interventricular septum; proximal occlusion can cause a massive infarction. The mitral valve normally has two leaflets and an area of about four to six square centimetres.",
  },
  {
    kind: "a5",
    label: "The pericardium",
    narration:
      "The pericardium is a double-layered sac containing a small amount of lubricating fluid, normally around fifteen to fifty millilitres. It anchors the heart, reduces friction, and limits sudden overdistension. Rapid fluid accumulation can overwhelm its stretch capacity, compress the heart, and cause cardiac tamponade.",
  },
  {
    kind: "a6",
    label: "Pericardial causes",
    narration:
      "Important causes of pericardial disease include tuberculosis, trauma, radiation, uraemia, malignancy, previous surgery or myocardial infarction, autoimmune disease, infection, and idiopathic inflammation. In Nigeria, consider tuberculosis in unexplained large effusions or constrictive pericarditis. Acute pericarditis typically causes pleuritic chest pain relieved by sitting forward and may produce a pericardial friction rub.",
  },
  {
    kind: "a7",
    label: "Tamponade",
    narration:
      "Cardiac tamponade occurs when pericardial pressure prevents adequate ventricular filling, reducing cardiac output. Beck's triad is hypotension, muffled heart sounds, and raised jugular venous pressure. Pulsus paradoxus is an inspiratory fall in systolic blood pressure exceeding ten millimetres of mercury. Suspected haemodynamically significant tamponade requires urgent assessment and drainage.",
  },
  {
    kind: "a8",
    label: "Constrict versus restrict",
    narration:
      "Constrictive pericarditis is caused by a rigid, thickened pericardium that restricts cardiac filling. Clues include a pericardial knock, Kussmaul sign, and characteristic echocardiographic or CT findings. Restrictive cardiomyopathy is primarily a stiff ventricular muscle with impaired filling. Selected patients with severe constriction may benefit from pericardiectomy; treatment of restriction depends on its cause.",
  },
  {
    kind: "a9",
    label: "Investigate and treat",
    narration:
      "Echocardiography is the key initial investigation for pericardial effusion and tamponade. ECG may show low voltage or electrical alternans. Unstable tamponade requires urgent image-guided pericardiocentesis, with supportive measures while drainage is arranged. Chronic constriction may require pericardiectomy. If tuberculosis is responsible, appropriate anti-tuberculosis treatment is essential.",
  },
];

const PART2: CardiacStage[] = [
  {
    kind: "b1",
    label: "Two ways a valve fails",
    narration:
      "Heart valves fail through stenosis, which obstructs forward flow, or regurgitation, which allows backward flow. Stenosis increases pressure behind the valve; regurgitation causes volume overload. Rheumatic heart disease remains important in Nigeria and other resource-limited settings, particularly affecting the mitral valve. Remember the Jones major criteria: carditis, arthritis, chorea, erythema marginatum, and subcutaneous nodules.",
  },
  {
    kind: "b2",
    label: "Mitral stenosis",
    narration:
      "Mitral stenosis raises left atrial pressure and can cause pulmonary hypertension and atrial fibrillation. The classic murmur is a low-pitched mid-diastolic rumble at the apex, sometimes preceded by an opening snap. A shorter interval between the second heart sound and opening snap generally suggests more severe stenosis. Complications include embolic stroke, haemoptysis, and hoarseness.",
  },
  {
    kind: "b3",
    label: "Mitral regurgitation",
    narration:
      "Mitral regurgitation sends blood backward into the left atrium during systole. It produces a pansystolic murmur at the apex radiating towards the axilla. Chronic disease causes left atrial and ventricular dilatation and may progress to heart failure. Mitral valve prolapse can produce a mid-systolic click. Valve repair is preferred when feasible.",
  },
  {
    kind: "b4",
    label: "Aortic stenosis",
    narration:
      "Aortic stenosis obstructs left ventricular outflow. Look for a slow-rising pulse and an ejection systolic murmur radiating to the carotids. Remember SAD: syncope, angina, and dyspnoea. These symptoms indicate a poor prognosis in severe disease. Symptomatic severe aortic stenosis generally requires valve replacement or another appropriate valve intervention.",
  },
  {
    kind: "b5",
    label: "Aortic regurgitation",
    narration:
      "Aortic regurgitation allows blood to flow backward from the aorta into the left ventricle during diastole, causing ventricular volume overload and dilatation. Signs include a collapsing pulse and wide pulse pressure. The classic murmur is an early diastolic decrescendo. Other eponymous signs include Corrigan's pulse, de Musset's head nodding, and Quincke's nail-bed pulsation.",
  },
  {
    kind: "b6",
    label: "Mechanical or tissue",
    narration:
      "Mechanical valves are durable but usually require lifelong vitamin K antagonist anticoagulation, such as warfarin. Bioprosthetic valves usually have lower long-term anticoagulation requirements but may degenerate over time. Valve selection depends on age, bleeding risk, ability to maintain anticoagulation, pregnancy plans, and patient preference. Mechanical valves are not automatically the best choice for every young patient.",
  },
  {
    kind: "b7",
    label: "Warfarin and pregnancy",
    narration:
      "Warfarin crosses the placenta and can cause fetal harm, but stopping it also risks mechanical valve thrombosis. A woman with a mechanical valve needs specialist pre-pregnancy counselling and an individualised anticoagulation plan. INR targets depend on the valve type, position, and thrombosis risk. Do not assume one target applies to every valve, and never change anticoagulation without specialist guidance.",
  },
  {
    kind: "b8",
    label: "Coronary artery disease",
    narration:
      "Coronary atherosclerosis narrows the arteries supplying the heart. Partial obstruction may cause exertional angina, while acute plaque disruption and thrombosis can cause myocardial infarction. A fifty percent reduction in vessel diameter corresponds to approximately seventy-five percent loss of cross-sectional area. Assess disease by its location, severity, symptoms, and functional effect.",
  },
  {
    kind: "b9",
    label: "Bypass surgery",
    narration:
      "Coronary artery bypass grafting creates a route around obstructed coronary arteries. Important indications include significant left main disease and selected patients with complex multivessel disease, especially when diabetes or impaired ventricular function affects treatment choice. The left internal mammary artery graft to the LAD is a classic durable combination. Complications include bleeding, postoperative atrial fibrillation, and sternal wound infection.",
  },
  {
    kind: "b10",
    label: "Cardiac tumours",
    narration:
      "Secondary metastatic tumours involving the heart are more common than primary cardiac tumours. The commonest primary cardiac tumour in adults is myxoma, usually a benign mass in the left atrium. It may cause obstruction, embolism, and constitutional symptoms. Echocardiography is a key investigation, and surgical excision is usually required. Angiosarcoma is an aggressive malignant primary cardiac tumour.",
  },
];

function Section({
  title,
  stages,
  button,
  file,
}: {
  title: string;
  stages: CardiacStage[];
  button: string;
  file: string;
}) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", color: "#F4F1EA" }}>
      <p
        style={{
          color: "#D4AF37",
          fontSize: ".8rem",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        {title}
      </p>

      <AutoVideoExporter
        stages={stages}
        StageComponent={CardiacStageSvg}
        buttonLabel={button}
        fileName={file}
      />
    </div>
  );
}

const rule = {
  margin: "40px 0",
  border: "none",
  borderTop: "1px solid #2A3E5C",
} as const;

export default function CardiacVideos() {
  return (
    <>
      <Section
        title="Cardiac surgery 1: big picture and pericardium"
        stages={PART1}
        button="Make cardiac video 1"
        file="cardiac-part1.mp4"
      />

      <hr style={rule} />

      <Section
        title="Cardiac surgery 2: valves, bypass and tumours"
        stages={PART2}
        button="Make cardiac video 2"
        file="cardiac-part2.mp4"
      />
    </>
  );
}
