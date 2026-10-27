“use client”;

import AutoVideoExporter from “../AutoVideoExporter”;
import CardiacStageSvg from “./CardiacStageSvg”;
import type { CardiacStage } from “./CardiacStageSvg”;

const STAGES: CardiacStage[] = [
{
kind: “intro”,
label: “Introduction to Cardiac Surgery”,
narration:
“Welcome to this teaching session on the surgical aspects of cardiac diseases. Cardiac surgery treats diseases of the heart, valves, coronary arteries, pericardium, and great vessels. Its goals include improving cardiac function, relieving symptoms, preventing complications, and prolonging life. Treatment may involve open surgery, minimally invasive surgery, or catheter-based interventions.”,
},
{
kind: “intro”,
label: “Anatomy of the Heart”,
narration:
“The heart lies in the middle mediastinum and has four chambers: the right atrium, right ventricle, left atrium, and left ventricle. The right side pumps deoxygenated blood to the lungs, while the left side pumps oxygenated blood into the systemic circulation. The four valves are the tricuspid, pulmonary, mitral, and aortic valves. Understanding this anatomy is essential for recognising cardiac disease and planning surgery.”,
},
{
kind: “intro”,
label: “Cardiac Investigations”,
narration:
“Cardiac investigations establish the diagnosis, assess severity, and help determine the need for intervention. They include electrocardiography, chest radiography, echocardiography, cardiac CT, cardiac MRI, and coronary angiography. Echocardiography evaluates cardiac chambers, valve function, ventricular function, and blood flow. Coronary angiography identifies significant coronary artery disease. Blood tests and preoperative assessment also help determine surgical risk.”,
},
{
kind: “intro”,
label: “Cardiopulmonary Bypass”,
narration:
“Cardiopulmonary bypass temporarily takes over the functions of the heart and lungs during selected cardiac operations. Venous blood passes through a machine where it is oxygenated before returning to the circulation. This allows the surgeon to operate on a relatively bloodless and motionless heart when required. Complications may include bleeding, inflammation, kidney injury, neurological injury, and coagulation disturbances.”,
},
{
kind: “coronary-disease”,
label: “Coronary Artery Disease”,
narration:
“Coronary artery disease occurs when atherosclerotic plaques narrow the coronary arteries and reduce myocardial blood supply. Presentations include stable angina, acute coronary syndromes, and myocardial infarction. Management includes lifestyle modification, medical treatment, and revascularisation when indicated. Selected patients benefit from coronary artery bypass grafting, particularly when the coronary anatomy and clinical circumstances favour surgery.”,
},
{
kind: “cabg”,
label: “Coronary Artery Bypass Grafting”,
narration:
“Coronary artery bypass grafting, or CABG, creates an alternative route for blood to reach myocardium beyond a significant coronary obstruction. Grafts may include the internal thoracic artery, radial artery, or saphenous vein. The choice depends on the patient and target vessels. Complications include bleeding, wound infection, myocardial infarction, stroke, graft failure, and postoperative arrhythmias.”,
},
{
kind: “mitral-stenosis”,
label: “Valvular Heart Disease: Mitral Stenosis”,
narration:
“Mitral stenosis is narrowing of the mitral valve opening, obstructing blood flow from the left atrium to the left ventricle. Rheumatic heart disease is an important cause in many low- and middle-income countries. Patients may develop exertional dyspnoea, orthopnoea, haemoptysis, atrial fibrillation, and pulmonary hypertension. Echocardiography establishes severity and assesses valve anatomy. Treatment depends on symptoms, severity, and suitability for balloon valvotomy or surgery.”,
},
{
kind: “mitral-regurgitation”,
label: “Mitral Regurgitation”,
narration:
“Mitral regurgitation occurs when the mitral valve fails to close properly, allowing blood to flow backward into the left atrium during ventricular systole. Causes include degenerative valve disease, rheumatic disease, ischaemia, and papillary muscle dysfunction. Patients may develop fatigue, breathlessness, and heart failure. Echocardiography evaluates severity and ventricular function. Valve repair is preferred when a durable repair is feasible; replacement may be necessary in selected cases.”,
},
{
kind: “aortic-stenosis”,
label: “Aortic Stenosis”,
narration:
“Aortic stenosis is narrowing of the aortic valve, obstructing left ventricular outflow. Causes include age-related calcification, congenital bicuspid valves, and rheumatic disease. Important symptoms are exertional dyspnoea, angina, and syncope. Echocardiography determines valve severity and ventricular function. Severe symptomatic disease generally requires valve intervention, which may involve surgical aortic valve replacement or transcatheter aortic valve implantation in appropriately selected patients.”,
},
{
kind: “aortic-regurgitation”,
label: “Aortic Regurgitation”,
narration:
“Aortic regurgitation occurs when the aortic valve fails to close completely, allowing blood to return from the aorta to the left ventricle during diastole. Causes include valve disease, aortic root dilatation, infective endocarditis, and aortic dissection. Chronic regurgitation may cause left ventricular dilatation and eventual heart failure. Echocardiography assesses severity and ventricular function. Intervention depends on symptoms, ventricular changes, disease severity, and the underlying aortic pathology.”,
},
{
kind: “prosthetic-valves”,
label: “Valve Repair and Replacement”,
narration:
“Valve disease may be treated by repairing the patient’s own valve or replacing it with a prosthetic valve. Repair preserves native tissue and is preferred when a durable result is achievable. Mechanical valves are durable but generally require lifelong vitamin K antagonist anticoagulation. Biological valves usually have a limited lifespan because of structural degeneration. Choice depends on age, bleeding risk, anticoagulation considerations, comorbidities, and patient preference.”,
},
{
kind: “intro”,
label: “Infective Endocarditis”,
narration:
“Infective endocarditis is infection of the endocardial surface, commonly involving a cardiac valve. Features may include fever, a new or changing murmur, embolic events, and systemic infection. Diagnosis relies on clinical assessment, blood cultures, and cardiac imaging. Treatment requires appropriate antimicrobial therapy. Surgery may be needed when there is heart failure caused by valve dysfunction, uncontrolled infection, abscess formation, or a high risk of further embolisation.”,
},
{
kind: “intro”,
label: “Heart Failure and Surgical Treatment”,
narration:
“Heart failure occurs when the heart cannot provide adequate circulation without elevated filling pressures. Causes include coronary artery disease, hypertension, cardiomyopathy, and valvular disease. Management includes appropriate medical therapy and treatment of reversible causes. Selected patients may benefit from valve surgery, coronary revascularisation, ventricular assist devices, or heart transplantation. Decisions require multidisciplinary assessment of disease severity, comorbidities, functional status, and expected benefit.”,
},
{
kind: “intro”,
label: “Cardiomyopathies”,
narration:
“Cardiomyopathies are disorders of the heart muscle associated with structural or functional abnormalities. Important forms include dilated, hypertrophic, and restrictive cardiomyopathy. Patients may present with heart failure, arrhythmias, syncope, or sudden cardiac death. Investigations include ECG, echocardiography, cardiac MRI, and selected laboratory or genetic tests. Treatment depends on the type and may include medication, devices, arrhythmia management, mechanical circulatory support, or transplantation.”,
},
{
kind: “pericardium”,
label: “Pericardial Diseases”,
narration:
“The pericardium is a protective sac surrounding the heart and normally contains a small amount of fluid. Pericardial disorders include acute pericarditis, pericardial effusion, and chronic pericardial disease. Symptoms may include chest pain and breathlessness. Echocardiography is useful for assessing pericardial fluid and its effects on cardiac filling. Management depends on the underlying cause, severity, and presence of haemodynamic compromise.”,
},
{
kind: “tamponade”,
label: “Cardiac Tamponade”,
narration:
“Cardiac tamponade occurs when fluid or blood accumulates in the pericardial space and restricts cardiac filling. Reduced ventricular filling lowers cardiac output and can cause shock. Clinical findings may include hypotension, raised jugular venous pressure, and tachycardia, although presentations vary. Echocardiography is central to diagnosis. Haemodynamically significant tamponade requires urgent drainage, with the method selected according to the cause and clinical circumstances.”,
},
{
kind: “constrictive”,
label: “Constrictive Pericarditis”,
narration:
“Constrictive pericarditis occurs when a thickened, fibrotic, or calcified pericardium restricts normal cardiac filling. Patients may develop peripheral oedema, ascites, raised jugular venous pressure, and fatigue. Causes include previous cardiac surgery, radiation, tuberculosis, and other inflammatory conditions. Echocardiography, CT, MRI, and selected haemodynamic studies help establish the diagnosis. Pericardiectomy may be considered in symptomatic patients with persistent constriction after appropriate evaluation.”,
},
{
kind: “myocardial-infarction”,
label: “Myocardial Infarction”,
narration:
“Myocardial infarction occurs when prolonged myocardial ischaemia causes cardiac muscle injury and necrosis, most often due to acute coronary artery obstruction. Features include chest discomfort, sweating, nausea, and breathlessness, although symptoms may be atypical. Diagnosis uses clinical assessment, ECG, and cardiac troponins. Urgent reperfusion is essential when indicated. Surgical revascularisation may be considered in selected patients with complex coronary disease or complications, following multidisciplinary assessment.”,
},
{
kind: “cardiac-tumour”,
label: “Cardiac Tumours”,
narration:
“Cardiac tumours may be primary or secondary. Myxoma is a common primary benign cardiac tumour in adults. Clinical effects depend on location and may include obstruction of blood flow, embolisation, constitutional symptoms, or arrhythmias. Echocardiography is often the initial investigation, with CT or MRI providing additional information. Symptomatic tumours or lesions with significant obstructive or embolic risk may require surgical excision after appropriate assessment.”,
},
];

export default function Cardiacvideo() {
return (
);
}
