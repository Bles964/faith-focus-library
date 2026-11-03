"use client";
import AutoVideoExporter from "./AutoVideoExporter";
import AcuteScrotumStageSvg from "./AcuteScrotumStageSvg";
import type { AcuteScrotumStage } from "./AcuteScrotumStageSvg";

const STAGES: AcuteScrotumStage[] = [
  {
    kind: "intro",
    label: "Acute scrotum",
    narration:
      "Acute scrotum refers to the sudden onset of pain, swelling, or tenderness of the scrotum, usually developing over hours. It is a urological emergency because some underlying causes can result in permanent testicular damage if treatment is delayed. The most important diagnosis to exclude is testicular torsion. Other important causes include epididymo-orchitis, torsion of the appendix testis, incarcerated inguinal hernia, and trauma. The golden rule is: always exclude testicular torsion in a patient presenting with acute scrotal pain.",
  },
  {
    kind: "anatomy",
    label: "Relevant anatomy",
    narration:
      "The scrotum is a skin-covered sac that contains the testes, epididymides, and lower portions of the spermatic cords. Each testis is supplied by the testicular artery, which arises directly from the abdominal aorta. Venous drainage occurs through the pampiniform plexus. The epididymis lies along the posterior aspect of the testis and functions in sperm maturation and storage. The spermatic cord contains the vas deferens, testicular vessels, nerves, and lymphatics. Understanding this anatomy is important because twisting of the spermatic cord can obstruct testicular blood supply, resulting in ischaemia and eventually infarction.",
  },
  {
    kind: "causes",
    label: "Causes",
    narration:
      "The major causes of acute scrotum include: one, testicular torsion. Two, epididymo-orchitis. Three, torsion of the appendix testis. Four, incarcerated or strangulated inguinoscrotal hernia. Five, scrotal trauma. Six, testicular tumour with haemorrhage or infarction. And seven, idiopathic scrotal oedema. Among these conditions, testicular torsion requires the most urgent attention.",
  },
  {
    kind: "torsion",
    label: "Testicular torsion",
    narration:
      "Testicular torsion occurs when the spermatic cord twists around itself, compromising blood supply to the testis. It is common in adolescents, particularly between 12 and 18 years, although it can occur at any age. There are two major types. Intravaginal torsion: the testis twists within the tunica vaginalis. It is commonly associated with the bell-clapper deformity. Extravaginal torsion: the testis and its coverings twist together. It is more common in neonates. The twisting first obstructs venous drainage, causing congestion and swelling. Continued twisting eventually compromises arterial blood supply, leading to testicular ischaemia and infarction. This is why early surgical intervention is essential.",
  },
  {
    kind: "signs",
    label: "Signs of torsion",
    narration:
      "A patient typically presents with sudden, severe unilateral scrotal pain, scrotal swelling, nausea and vomiting, a high-riding testis, a horizontal or abnormal testicular lie, and marked testicular tenderness. The cremasteric reflex is often absent on the affected side. Prehn's sign, traditionally described as relief of pain when the testis is elevated, is unreliable and should not be used to exclude torsion. Important: testicular salvage is highest when detorsion is performed within six hours. However, presentation after six hours does not mean the testis is unsalvageable. Urgent exploration is still required.",
  },
  {
    kind: "epi",
    label: "Epididymo-orchitis",
    narration:
      "Epididymo-orchitis refers to inflammation of the epididymis and testis. It may result from bacterial infection. In younger sexually active men, common organisms include Chlamydia trachomatis and Neisseria gonorrhoeae. In older men, enteric organisms such as Escherichia coli are more common, particularly in association with urinary tract obstruction or instrumentation. Clinical features include gradual onset of scrotal pain, scrotal swelling, fever, dysuria, urinary frequency, urethral discharge in some patients, and tenderness over the epididymis. Unlike testicular torsion, the pain commonly develops gradually, although clinical features overlap.",
  },
  {
    kind: "appendix",
    label: "Appendix testis torsion",
    narration:
      "The appendix testis is a small embryological remnant located near the upper pole of the testis. Torsion of this structure causes local ischaemia and inflammation. It commonly occurs in prepubertal boys. Clinical features include localised upper-pole tenderness, scrotal pain, mild swelling, and occasionally a blue dot visible through the scrotal skin. The blue-dot sign is characteristic but not always present. Treatment is usually conservative with analgesia, rest, and scrotal support, provided testicular torsion has been excluded.",
  },
  {
    kind: "assess",
    label: "Clinical assessment",
    narration:
      "The assessment of acute scrotum begins with a focused history. Ask about onset of pain, duration, site and radiation, severity, previous episodes, fever, nausea and vomiting, dysuria and frequency, urethral discharge, sexual history, recent trauma, and previous urinary or scrotal surgery. On examination, assess general condition and vital signs, scrotal swelling and redness, testicular position, testicular tenderness, epididymal tenderness, the cremasteric reflex, and the inguinal region for hernia. Examine the abdomen and groin as well. Remember: do not delay urgent surgical assessment while completing unnecessary investigations.",
  },
  {
    kind: "invest",
    label: "Investigations",
    narration:
      "The diagnosis of testicular torsion is primarily clinical. Investigations may include colour Doppler ultrasound, which assesses blood flow to the testes. Reduced or absent intratesticular blood flow supports testicular torsion, while increased blood flow may occur in epididymo-orchitis. However, a normal or equivocal ultrasound does not reliably exclude torsion when clinical suspicion is high. Urinalysis may reveal pyuria or bacteriuria in epididymo-orchitis. Urine culture helps identify bacterial organisms. Urethral or urine S T I testing should be considered for gonorrhoea and chlamydia when sexually transmitted infection is suspected. A full blood count and inflammatory markers may demonstrate infection or inflammation. The key point is that investigations must never delay surgery when testicular torsion is strongly suspected.",
  },
  {
    kind: "manage",
    label: "Managing torsion",
    narration:
      "Testicular torsion is a surgical emergency. Management involves immediate urological or surgical consultation, keeping the patient nil by mouth, establishing intravenous access, giving appropriate analgesia, providing intravenous fluids when indicated, and arranging urgent scrotal exploration. During surgery, the surgeon untwists the spermatic cord and assesses testicular viability. If the testis is viable, bilateral orchidopexy is performed to prevent recurrence. If the testis is clearly non-viable, orchidectomy may be necessary. The contralateral testis is also fixed because the anatomical predisposition may be bilateral. Manual detorsion may be attempted by an experienced clinician while awaiting surgery, but it must never replace surgical exploration and fixation.",
  },
  {
    kind: "other",
    label: "Other causes",
    narration:
      "For epididymo-orchitis, treatment includes appropriate antibiotics based on the suspected organism, analgesia, rest, scrotal support, and treatment of any underlying urinary obstruction. Sexual partners should be evaluated and treated when a sexually transmitted infection is diagnosed or suspected. Torsion of the appendix testis is usually managed with analgesia, rest, and scrotal support. Surgery may be considered when the diagnosis is uncertain or symptoms persist. An incarcerated or strangulated inguinal hernia requires urgent surgical assessment and operative management when strangulation is suspected. For scrotal trauma, management depends on the severity of injury. Suspected testicular rupture requires urgent surgical exploration and repair.",
  },
  {
    kind: "comp",
    label: "Complications",
    narration:
      "Complications of acute scrotal conditions include testicular infarction, testicular atrophy, loss of the testis, reduced fertility, particularly with bilateral injury or underlying damage to the remaining testis, chronic scrotal pain, and sepsis in severe infection. The most feared complication of untreated testicular torsion is testicular loss due to infarction.",
  },
  {
    kind: "case",
    label: "Clinical scenario",
    narration:
      "A 16-year-old boy is brought to the emergency department with sudden severe right-sided scrotal pain that began three hours ago. He has vomited twice. On examination, the right testis is swollen, tender, and lies higher than the left testis. The right cremasteric reflex is absent. What is the most likely diagnosis? Right testicular torsion. What is the next step? Immediate urological consultation and urgent surgical scrotal exploration. Should ultrasound delay surgery? No. When clinical suspicion is high, imaging must not delay surgical exploration. What operation is performed if the testis is viable? Detorsion and bilateral orchidopexy.",
  },
  {
    kind: "final",
    label: "Exam points",
    narration:
      "Remember these important distinctions. Sudden severe pain suggests testicular torsion. Gradual pain with fever and urinary symptoms suggests epididymo-orchitis. A high-riding testis is a classical feature of torsion. An absent cremasteric reflex strongly supports torsion. A blue-dot sign suggests torsion of the appendix testis. Colour Doppler ultrasound assesses testicular blood flow. Testicular torsion requires urgent surgical exploration. Bilateral orchidopexy is performed to prevent recurrence. The six-hour window is important, but late presentation is never a reason to abandon exploration. In every patient with acute scrotal pain, think of testicular torsion first. Early recognition and urgent surgical intervention can save the testis.",
  },
];

export default function AcuteScrotumVideo() {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", color: "#F4F1EA" }}>
      <p style={{ color: "#D4AF37", fontSize: ".8rem", textTransform: "uppercase", marginBottom: 12 }}>
        Acute scrotum: teaching video
      </p>
      <AutoVideoExporter
        stages={STAGES}
        StageComponent={AcuteScrotumStageSvg}
        buttonLabel="Make acute scrotum video"
        fileName="acute-scrotum-video.mp4"
      />
    </div>
  );
}
