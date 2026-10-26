“use client”;

import AutoVideoExporter from “./AutoVideoExporter”;
import CardiacStageSvg from “./CardiacStageSvg”;
import type { CardiacStage } from “./CardiacStageSvg”;

const STAGES: CardiacStage[] = [
{
kind: “intro”,
label: “Surgical Cardiac Diseases”,
narration:
“Today we’ll discuss the surgical aspects of cardiac diseases in adults. Think of the heart as a house: the coronary arteries are the plumbing, the valves are the doors, the pericardium is the protective covering, and the conduction system is the electrical wiring. Severe structural damage may require surgery, and heart failure is a common final pathway of many cardiac diseases.”,
},
{
kind: “pericardium”,
label: “The Pericardium”,
narration:
“The pericardium is a double-layered sac surrounding the heart. It normally contains a small amount of lubricating fluid that reduces friction and limits excessive cardiac expansion. Disease can produce inflammation, fluid accumulation, tamponade, or constriction.”,
},
{
kind: “tamponade”,
label: “Cardiac Tamponade”,
narration:
“Cardiac tamponade occurs when fluid accumulates under pressure in the pericardial sac and restricts cardiac filling. The classic findings are hypotension, raised jugular venous pressure, and muffled heart sounds, known as Beck’s triad. This is a medical emergency requiring urgent assessment and drainage when indicated.”,
},
{
kind: “constrictive”,
label: “Constrictive Pericarditis”,
narration:
“In constrictive pericarditis, the pericardium becomes thickened, fibrotic, and sometimes calcified. The rigid covering restricts diastolic filling and can cause systemic venous congestion. Pericardiectomy may be required in appropriately selected patients.”,
},
{
kind: “mitral-stenosis”,
label: “Mitral Stenosis”,
narration:
“Mitral stenosis narrows the opening between the left atrium and left ventricle. Rheumatic heart disease remains an important cause in many low- and middle-income countries. Classic examination findings include an opening snap and a mid-diastolic murmur, while complications include atrial fibrillation and pulmonary hypertension.”,
},
{
kind: “mitral-regurgitation”,
label: “Mitral Regurgitation”,
narration:
“Mitral regurgitation occurs when the mitral valve fails to close properly, allowing blood to flow backward into the left atrium during systole. It typically produces a pansystolic murmur radiating towards the axilla. Severe disease can cause left ventricular dysfunction and heart failure.”,
},
{
kind: “aortic-stenosis”,
label: “Aortic Stenosis”,
narration:
“Aortic stenosis obstructs blood flow from the left ventricle into the aorta. The classical symptoms of severe disease are exertional syncope, angina, and dyspnoea. Symptomatic severe aortic stenosis generally requires assessment for valve intervention.”,
},
{
kind: “aortic-regurgitation”,
label: “Aortic Regurgitation”,
narration:
“Aortic regurgitation allows blood to flow backward from the aorta into the left ventricle during diastole. The resulting volume overload may cause left ventricular dilatation and a wide pulse pressure. Intervention depends on symptoms, ventricular dimensions, ventricular function, and the underlying cause.”,
},
{
kind: “prosthetic-valves”,
label: “Prosthetic Heart Valves”,
narration:
“When valve repair is unsuitable, valve replacement may be necessary. Mechanical valves are durable but usually require lifelong vitamin K antagonist anticoagulation, such as warfarin. Bioprosthetic valves may avoid lifelong anticoagulation in the absence of another indication, but they can deteriorate over time. Valve selection requires individualised discussion, particularly when pregnancy is planned.”,
},
{
kind: “coronary-disease”,
label: “Coronary Artery Disease”,
narration:
“Coronary artery disease develops when atherosclerotic plaque builds up inside the arteries supplying the myocardium. This can restrict oxygen delivery and cause angina. Acute plaque disruption and thrombosis can cause myocardial infarction.”,
},
{
kind: “myocardial-infarction”,
label: “Myocardial Infarction”,
narration:
“Myocardial infarction occurs when prolonged ischaemia causes death of heart muscle cells. Rapid assessment and restoration of blood flow are essential when indicated. Complications may include arrhythmias, mechanical complications, and heart failure.”,
},
{
kind: “cabg”,
label: “Coronary Bypass Surgery”,
narration:
“Coronary artery bypass grafting, or CABG, creates an alternative route for blood to reach heart muscle beyond a coronary obstruction. The left internal thoracic artery is commonly grafted to the left anterior descending artery because of its excellent long-term performance. The choice between medical treatment, percutaneous intervention, and surgery depends on coronary anatomy and the patient’s clinical circumstances.”,
},
{
kind: “cardiac-tumour”,
label: “Cardiac Tumours”,
narration:
“Cardiac tumours may be primary or metastatic, with metastatic tumours being more common overall. Myxoma is the most common primary cardiac tumour in adults and often arises in the left atrium near the fossa ovalis. Patients may present with obstructed blood flow, embolic events, or constitutional symptoms. Echocardiography is an important diagnostic investigation, and symptomatic or high-risk tumours often require surgical assessment.”,
},
];

export default function CardiacVideo() {
return (
<div style={{ maxWidth: 480, margin: “0 auto”, color: “#F4F1EA” }}>
<p
style={{
color: “#D4AF37”,
fontSize: “.8rem”,
textTransform: “uppercase”,
marginBottom: 12,
}}
>
Surgical aspects of cardiac diseases
  <AutoVideoExporter
    stages={STAGES}
    StageComponent={CardiacStageSvg}
    buttonLabel="Make cardiac teaching video"
    fileName="surgical-cardiac-diseases.mp4"
    saveTitle="Surgical Aspects of Cardiac Diseases"
  />
</div>

);
}
