"use client";
import AutoVideoExporter from "./AutoVideoExporter";
import CardiacStageSvg from "./CardiacStageSvg";
import type { CardiacStage } from "./CardiacStageSvg";
const STAGES: CardiacStage[] = [
  {
    kind: "a1",
    label: "Introduction to Cardiac Surgery",
    narration:
      "Welcome to Faith and Focus Academy. In this lesson, we will explore the surgical aspects of cardiac diseases. Cardiac surgery involves operations on the heart and great vessels to treat congenital abnormalities, acquired heart diseases, coronary artery disease, and other serious cardiovascular conditions. Successful treatment requires accurate diagnosis, appropriate patient selection, careful operative planning, and comprehensive postoperative care.",
  },
  {
    kind: "a2",
    label: "Anatomy of the Pericardium",
    narration:
      "The pericardium is a fibroserous sac surrounding the heart. It consists of an outer fibrous pericardium and an inner serous pericardium. The serous pericardium has parietal and visceral layers, with a small amount of lubricating fluid between them. This arrangement reduces friction during cardiac movement. Disease of the pericardium can impair cardiac filling and may require surgical intervention.",
  },
  {
    kind: "a3",
    label: "Cardiac Tamponade",
    narration:
      "Cardiac tamponade occurs when fluid accumulates under pressure within the pericardial sac, restricting cardiac filling and reducing cardiac output. Causes include trauma, malignancy, pericarditis, and complications of cardiac procedures. Clinical features may include hypotension, raised jugular venous pressure, tachycardia, and muffled heart sounds. This is a potentially life-threatening emergency. Urgent drainage of the pericardial fluid may be required, depending on the patient's condition.",
  },
  {
    kind: "a4",
    label: "Constrictive Pericarditis",
    narration:
      "Constrictive pericarditis develops when the pericardium becomes thickened, fibrotic, or calcified, restricting diastolic filling of the heart. Patients may present with peripheral oedema, ascites, raised jugular venous pressure, hepatomegaly, and fatigue. Causes include previous tuberculosis, cardiac surgery, radiation, and other forms of pericardial inflammation. Investigations may include echocardiography, computed tomography, and cardiac magnetic resonance imaging. Pericardiectomy may be indicated in suitable patients with persistent symptomatic disease.",
  },
  {
    kind: "a5",
    label: "Heart Valve Disease",
    narration:
      "The heart has four valves: the mitral, tricuspid, aortic, and pulmonary valves. Valvular disease may cause stenosis, regurgitation, or a combination of both. Stenosis obstructs forward blood flow, while regurgitation allows blood to flow backwards. Causes include rheumatic heart disease, degenerative calcification, infective endocarditis, and congenital abnormalities. Echocardiography is the principal investigation for assessing valve structure, severity, and cardiac consequences.",
  },
  {
    kind: "a6",
    label: "Mitral and Aortic Valve Disorders",
    narration:
      "Mitral stenosis obstructs blood flow from the left atrium into the left ventricle and may cause pulmonary congestion, atrial fibrillation, and pulmonary hypertension. Mitral regurgitation allows blood to return into the left atrium during ventricular systole. Aortic stenosis obstructs blood leaving the left ventricle and may cause exertional chest pain, syncope, and breathlessness. Aortic regurgitation produces backward flow into the left ventricle during diastole. Depending on the lesion and its severity, treatment may involve medication for associated complications, valve repair, or valve replacement.",
  },
  {
    kind: "a7",
    label: "Valve Repair and Replacement",
    narration:
      "Surgical treatment of severe valvular disease includes valve repair and valve replacement. Repair preserves the patient's own valve when a durable result is achievable. Replacement uses either a mechanical or a biological prosthesis. Mechanical valves are durable but usually require lifelong anticoagulation with a vitamin K antagonist. Biological valves generally have a lower long-term anticoagulation burden in the absence of another indication, but they may deteriorate over time. The choice depends on age, anatomy, comorbidities, anticoagulation risks, and patient preferences.",
  },
  {
    kind: "a8",
    label: "Coronary Artery Disease",
    narration:
      "Coronary artery disease commonly results from atherosclerotic plaque formation within the coronary arteries. Progressive narrowing reduces blood supply to the myocardium and may cause angina. Acute plaque disruption can lead to myocardial infarction. Assessment includes clinical history, electrocardiography, cardiac biomarkers when indicated, and appropriate coronary imaging. Management may include lifestyle modification, medical therapy, percutaneous coronary intervention, or coronary artery bypass grafting, depending on the clinical presentation and coronary anatomy.",
  },
  {
    kind: "a9",
    label: "Coronary Artery Bypass Grafting",
    narration:
      "Coronary artery bypass grafting, commonly called CABG, creates an alternative route for blood to reach myocardium beyond significant coronary artery narrowing. Common conduits include the left internal thoracic artery and the great saphenous vein. The radial artery may also be used. CABG is considered for selected patients with complex coronary disease, significant left main disease, or other appropriate anatomical and clinical indications. Potential complications include bleeding, infection, stroke, myocardial infarction, arrhythmias, and kidney injury. Long-term secondary prevention remains essential.",
  },
  {
    kind: "b1",
    label: "Cardiac Tumours",
    narration:
      "Cardiac tumours may be primary or secondary. Primary cardiac tumours are uncommon, and myxoma is a well-known example of a benign primary tumour in adults. A myxoma may obstruct blood flow, cause embolism, or produce constitutional symptoms. Secondary cardiac tumours are more common and usually arise through metastatic spread. Echocardiography is often the initial investigation, while computed tomography and cardiac magnetic resonance imaging can provide additional information. Symptomatic or embolic-risk myxomas are generally treated with surgical excision.",
  },
  {
    kind: "b2",
    label: "Cardiac Surgery Assessment",
    narration:
      "Before cardiac surgery, the team assesses the patient's symptoms, functional status, comorbidities, medication history, and operative risk. Investigations may include blood tests, electrocardiography, echocardiography, and coronary angiography when indicated. Respiratory function, renal function, coagulation status, and infection risks are also considered. The patient should receive a clear explanation of the proposed procedure, alternatives, expected benefits, and potential complications. Informed consent and multidisciplinary planning are essential.",
  },
  {
    kind: "b3",
    label: "Cardiopulmonary Bypass",
    narration:
      "Cardiopulmonary bypass allows the surgeon to operate on the heart while a machine temporarily supports circulation and gas exchange. Venous blood is drained into the bypass circuit, oxygenated, and returned to the arterial circulation. Depending on the operation, the heart may be arrested using cardioplegia. Cardiopulmonary bypass can affect coagulation, inflammatory responses, kidney function, and other organ systems. Careful monitoring and appropriate management are necessary throughout the procedure.",
  },
  {
    kind: "b4",
    label: "Sternotomy and Surgical Access",
    narration:
      "Median sternotomy is a traditional approach for many open cardiac procedures. The sternum is divided to provide access to the heart and great vessels. Other procedures may use alternative incisions or minimally invasive approaches in appropriately selected patients. Surgical access is chosen according to the operation, anatomy, patient factors, and the surgical team's expertise. Careful haemostasis, protection of surrounding structures, and appropriate sternal closure help reduce complications.",
  },
  {
    kind: "b5",
    label: "Postoperative Cardiac Care",
    narration:
      "After cardiac surgery, patients require close monitoring of haemodynamics, oxygenation, cardiac rhythm, bleeding, urine output, and neurological status. Ventilation and haemodynamic support are adjusted according to the patient's condition. Important complications include low cardiac output, arrhythmias, tamponade, bleeding, infection, kidney injury, and respiratory complications. Early recognition and prompt treatment can improve outcomes. Rehabilitation and secondary prevention are important parts of recovery.",
  },
  {
    kind: "b6",
    label: "Low Cardiac Output Syndrome",
    narration:
      "Low cardiac output syndrome occurs when the heart cannot deliver sufficient blood to meet the body's metabolic requirements. It may follow myocardial dysfunction, prolonged ischaemia, inadequate preload, excessive afterload, arrhythmias, or mechanical complications. Findings may include hypotension, cool extremities, altered mental status, reduced urine output, and elevated lactate. Management begins with identifying and correcting the cause, while supporting oxygenation and circulation. Fluids, vasoactive medicines, inotropes, or mechanical circulatory support may be appropriate in selected cases.",
  },
  {
    kind: "b7",
    label: "Postoperative Arrhythmias",
    narration:
      "Arrhythmias are common after cardiac surgery. Atrial fibrillation is particularly important because it may cause haemodynamic instability and increase thromboembolic risk. Contributing factors include inflammation, electrolyte abnormalities, ischaemia, and changes in autonomic tone. Management depends on the rhythm and the patient's stability. It may involve correcting reversible causes, rate or rhythm control, and anticoagulation when indicated. Haemodynamically unstable arrhythmias require urgent assessment and appropriate emergency treatment.",
  },
  {
    kind: "b8",
    label: "Cardiac Surgery Complications",
    narration:
      "Important complications of cardiac surgery include haemorrhage, infection, stroke, myocardial infarction, renal injury, respiratory failure, arrhythmias, and low cardiac output. Cardiac tamponade must be considered when a postoperative patient develops unexplained haemodynamic deterioration. Prevention includes appropriate surgical technique, infection control, careful fluid management, and close postoperative surveillance. Early recognition and multidisciplinary intervention are essential when complications arise.",
  },
  {
    kind: "b9",
    label: "Cardiac Rehabilitation",
    narration:
      "Cardiac rehabilitation supports recovery after cardiac surgery and other major cardiovascular events. It includes supervised exercise when appropriate, education, medication adherence, nutritional advice, smoking cessation, and psychological support. Activity is increased gradually according to the patient's recovery and the procedure performed. Rehabilitation can improve functional capacity and quality of life. Patients should receive clear instructions about wound care, warning symptoms, follow-up appointments, and when to seek urgent medical attention.",
  },
  {
    kind: "b10",
    label: "Summary of Cardiac Surgery",
    narration:
      "Let us summarize the key points. Cardiac surgery treats selected diseases of the heart, valves, coronary arteries, and pericardium. Accurate diagnosis and appropriate patient selection are essential. Common procedures include valve repair or replacement, coronary artery bypass grafting, pericardial drainage, and selected tumour excision. Cardiopulmonary bypass supports circulation during many open-heart procedures. Postoperative care focuses on haemodynamic stability, rhythm monitoring, bleeding, infection, and organ function. Early recognition of complications and appropriate rehabilitation are essential for good outcomes. Thank you for learning with Faith and Focus Academy.",
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
