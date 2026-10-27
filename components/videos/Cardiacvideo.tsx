"use client";

import AutoVideoExporter from "../AutoVideoExporter";
import CardiacStageSvg from "./CardiacStageSvg";
import type { CardiacStage } from "./CardiacStageSvg";

const STAGES: CardiacStage[] = [
  {
    kind: "a1",
    label: "Introduction to Cardiac Surgery",
    narration:
      "Welcome to this teaching session on the surgical aspects of cardiac diseases. Cardiac surgery involves the operative treatment of diseases affecting the heart, its valves, the coronary arteries, and the great vessels. The main goals are to improve cardiac function, relieve symptoms, prevent complications, and prolong life. Treatment may involve open-heart surgery, minimally invasive procedures, or catheter-based interventions.",
  },
  {
    kind: "a2",
    label: "Anatomy of the Heart",
    narration:
      "The heart is a muscular organ in the middle mediastinum. It has four chambers: the right atrium, right ventricle, left atrium, and left ventricle. The right side receives deoxygenated blood and pumps it to the lungs. The left side receives oxygenated blood and pumps it into the systemic circulation. The four valves are the tricuspid, pulmonary, mitral, and aortic valves. Knowledge of this anatomy is essential for understanding cardiac disease and planning surgery.",
  },
  {
    kind: "a3",
    label: "Cardiac Investigations",
    narration:
      "Investigations help establish the diagnosis, assess disease severity, and determine suitability for surgery. They include electrocardiography, chest radiography, echocardiography, cardiac CT, cardiac MRI, and coronary angiography. Echocardiography assesses chamber size, valve function, ventricular function, and blood flow. Coronary angiography helps identify obstructive coronary artery disease. Blood tests and preoperative assessments are also important when planning cardiac interventions.",
  },
  {
    kind: "a4",
    label: "Cardiopulmonary Bypass",
    narration:
      "Cardiopulmonary bypass is a technique that temporarily takes over the functions of the heart and lungs during selected cardiac operations. Venous blood is diverted to a bypass machine, oxygenated, and returned to the arterial circulation. This allows the surgeon to operate on a relatively bloodless and motionless heart when required. Important complications include bleeding, inflammation, kidney injury, neurological complications, and disturbances of coagulation.",
  },
  {
    kind: "a5",
    label: "Coronary Artery Disease",
    narration:
      "Coronary artery disease occurs when atherosclerotic plaques narrow the coronary arteries and reduce blood supply to the myocardium. Clinical presentations include stable angina, acute coronary syndromes, and myocardial infarction. Management includes lifestyle modification, medical treatment, and revascularisation when indicated. Coronary artery bypass grafting may be appropriate in selected patients with significant coronary disease, particularly when the anatomy or clinical circumstances favour surgery.",
  },
  {
    kind: "a6",
    label: "Coronary Artery Bypass Grafting",
    narration:
      "Coronary artery bypass grafting, commonly called CABG, creates an alternative route for blood to reach myocardium beyond a significant coronary artery obstruction. Conduits may include the internal thoracic artery, radial artery, or saphenous vein. The choice depends on the patient, the target vessels, and surgical considerations. Potential complications include bleeding, wound infection, myocardial infarction, stroke, graft failure, and postoperative arrhythmias.",
  },
  {
    kind: "a7",
    label: "Valvular Heart Disease",
    narration:
      "Valvular heart disease results from stenosis or regurgitation of one or more cardiac valves. Stenosis restricts forward blood flow, while regurgitation allows backward flow. Common examples include mitral stenosis, mitral regurgitation, aortic stenosis, and aortic regurgitation. Patients may develop breathlessness, fatigue, syncope, chest pain, or heart failure. Echocardiography is central to assessment, and intervention depends on the affected valve, severity, symptoms, ventricular function, and overall clinical risk.",
  },
  {
    kind: "a8",
    label: "Valve Repair and Replacement",
    narration:
      "Surgical treatment of valve disease may involve valve repair or valve replacement. Repair preserves the patient's own valve and is preferred when a durable result is achievable. Replacement uses either a mechanical or a biological prosthesis. Mechanical valves are durable but generally require lifelong anticoagulation. Biological valves usually have a limited lifespan because of structural degeneration. The decision must consider age, bleeding risk, anticoagulation requirements, comorbidities, and patient preference.",
  },
  {
    kind: "a9",
    label: "Infective Endocarditis",
    narration:
      "Infective endocarditis is an infection involving the endocardial surface, commonly affecting cardiac valves. Features may include fever, a new or changing murmur, embolic events, and evidence of systemic infection. Diagnosis is based on clinical assessment, blood cultures, and cardiac imaging. Treatment requires appropriate antimicrobial therapy. Surgery may be necessary in selected patients with heart failure caused by valve dysfunction, uncontrolled infection, abscess formation, or a high risk of further embolisation.",
  },
  {
    kind: "b1",
    label: "Heart Failure and Surgical Treatment",
    narration:
      "Heart failure occurs when the heart cannot provide adequate circulation without elevated filling pressures. Causes include coronary artery disease, hypertension, cardiomyopathy, and valvular disease. Management begins with identifying and treating reversible causes and providing appropriate medical therapy. Selected patients may benefit from valve surgery, coronary revascularisation, ventricular assist devices, or heart transplantation. Decisions require multidisciplinary assessment of disease severity, comorbidities, functional status, and expected benefit.",
  },
  {
    kind: "b2",
    label: "Cardiomyopathies",
    narration:
      "Cardiomyopathies are disorders of the heart muscle associated with structural or functional abnormalities. Important forms include dilated, hypertrophic, and restrictive cardiomyopathy. Patients may present with heart failure, arrhythmias, syncope, or sudden cardiac death. Investigations include electrocardiography, echocardiography, cardiac MRI, and selected genetic or laboratory tests. Treatment depends on the type and may include medication, devices, treatment of arrhythmias, mechanical circulatory support, or transplantation in advanced disease.",
  },
  {
    kind: "b3",
    label: "Aortic Aneurysm",
    narration:
      "An aortic aneurysm is an abnormal dilatation of the aorta. Important risk factors include age, smoking, hypertension, atherosclerosis, and inherited connective tissue disorders. Aneurysms may remain asymptomatic until they enlarge, rupture, or cause complications. Diagnosis and surveillance rely on appropriate imaging. Repair may be indicated according to aneurysm size, growth rate, location, symptoms, and individual risk. Treatment options include open surgical repair and endovascular repair in suitable patients.",
  },
  {
    kind: "b4",
    label: "Aortic Dissection",
    narration:
      "Aortic dissection occurs when blood enters the aortic wall through an intimal tear or related wall disruption, separating its layers. It can present with sudden severe chest or back pain, syncope, pulse deficits, or neurological symptoms. It is a life-threatening emergency. CT angiography is commonly used in stable patients to confirm the diagnosis. Acute type A dissection generally requires emergency surgical assessment and repair. Uncomplicated type B dissection is often initially managed with intensive blood pressure and heart rate control, unless complications require intervention.",
  },
  {
    kind: "b5",
    label: "Cardiac Tamponade",
    narration:
      "Cardiac tamponade occurs when fluid or blood accumulates in the pericardial space and restricts cardiac filling. Reduced ventricular filling leads to reduced cardiac output and potentially shock. Clinical features may include hypotension, raised jugular venous pressure, tachycardia, and muffled heart sounds, although the complete triad is not always present. Echocardiography is central to diagnosis. Haemodynamically significant tamponade requires urgent drainage, with the method selected according to the cause and clinical circumstances.",
  },
  {
    kind: "b6",
    label: "Congenital Cardiac Conditions",
    narration:
      "Congenital cardiac conditions are structural abnormalities of the heart or great vessels present from birth. Their effects depend on the anatomy and the resulting haemodynamic disturbance. Patients may present with murmurs, cyanosis, breathlessness, poor feeding, poor growth, or heart failure. Assessment may include echocardiography, electrocardiography, and advanced imaging when needed. Management ranges from observation and medical stabilisation to catheter-based procedures and surgery, depending on the lesion and its severity.",
  },
  {
    kind: "b7",
    label: "Cardiac Trauma",
    narration:
      "Cardiac trauma may follow blunt or penetrating chest injury. Potential injuries include myocardial contusion, chamber rupture, coronary artery injury, valvular damage, and traumatic pericardial tamponade. Initial management follows trauma resuscitation principles, prioritising airway, breathing, and circulation. Haemodynamic instability after penetrating chest trauma requires urgent evaluation for life-threatening thoracic injury. Bedside ultrasound and other imaging may assist diagnosis, but investigations must not delay necessary emergency intervention.",
  },
  {
    kind: "b8",
    label: "Postoperative Cardiac Care",
    narration:
      "Postoperative cardiac care focuses on maintaining adequate oxygenation and circulation while identifying complications early. Monitoring includes haemodynamic status, cardiac rhythm, oxygen saturation, urine output, drainage, laboratory results, and signs of bleeding or infection. Important complications include arrhythmias, myocardial dysfunction, respiratory failure, kidney injury, neurological events, and wound infection. Pain control, respiratory physiotherapy, mobilisation, medication review, and appropriate follow-up support recovery.",
  },
  {
    kind: "b9",
    label: "Complications of Cardiac Surgery",
    narration:
      "Complications of cardiac surgery include bleeding, infection, arrhythmias, stroke, myocardial infarction, kidney injury, respiratory complications, and complications related to cardiopulmonary bypass. The risk depends on the procedure, the patient's underlying condition, and preoperative risk factors. Prevention involves careful assessment, sterile technique, appropriate anticoagulation management, meticulous operative technique, and vigilant postoperative monitoring. Early recognition and timely treatment are essential to improve outcomes.",
  },
  {
    kind: "b10",
    label: "Summary of Cardiac Surgery",
    narration:
      "In summary, cardiac surgery treats selected diseases of the heart, valves, coronary arteries, pericardium, and great vessels. Safe care requires an understanding of cardiac anatomy, accurate diagnosis, appropriate patient selection, careful operative planning, and structured postoperative monitoring. Treatment may involve medication, catheter-based intervention, conventional surgery, or advanced therapies. For clinical examinations, always connect the presenting symptoms with the underlying pathology, appropriate investigations, indications for intervention, potential complications, and long-term follow-up.",
  },
];

export default function Cardiacvideo() {
  return (
    <AutoVideoExporter
      stages={STAGES}
      StageComponent={CardiacStageSvg}
      buttonLabel="Make cardiac teaching video"
      fileName="surgical-cardiac-diseases.mp4"
      saveTitle="Surgical Aspects of Cardiac Diseases"
    />
  );
}
