"use client";
import AutoVideoExporter from "./AutoVideoExporter";
import PelvisStageSvg from "./PelvisStageSvg";
import type { PelvisStage } from "./PelvisStageSvg";

const STAGES: PelvisStage[] = [
  {
    kind: "ring",
    label: "The pelvis is a ring",
    narration:
      "The pelvis is a ring, like a pretzel. Two hip bones, each made of the ilium, ischium and pubis, meet at the acetabulum, the hip socket. In a child, the Y-shaped tri-radiate cartilage separates them. A ring is strong, so breaking it takes high-energy trauma, and that force usually injures other organs too.",
  },
  {
    kind: "stable",
    label: "Stable or unstable",
    narration:
      "Crack the ring in one place and it still holds its shape: that is stable. Break it in two places, or tear the ligaments, and it comes apart under normal load: that is unstable, with shock, heavy bleeding and no walking. In an open-book injury, the symphysis splits open and the pelvis can hold much more blood.",
  },
  {
    kind: "tile",
    label: "Tile classification",
    narration:
      "Tile is A, B, C. Type A is stable: the ring is intact. Type B is rotationally unstable but vertically stable, and the open-book injury sits here. Type C is unstable in both directions, the worst pattern with the worst bleeding. Alright, Bends, Can't hold.",
  },
  {
    kind: "yb",
    label: "Young-Burgess: mechanism",
    narration:
      "Young-Burgess classifies by the direction of force: A, L, V, C. A P C is front-to-back compression, and the pelvis opens like a book. L C is a hit from the side, and the pelvis squeezes inward. V S is vertical shear, from a fall onto one leg. C M is a combined mechanism, two forces at once.",
  },
  {
    kind: "resus",
    label: "Resuscitate before X-ray",
    narration:
      "A broken pelvis can bleed massively, so resuscitate first: A B C, then pictures. Put in two wide-bore 16 gauge lines, whether or not the patient looks shocked. Start crystalloid, take blood for count and crossmatch, and give early pain relief. Resus before radiology.",
  },
  {
    kind: "binder",
    label: "Three B's of bleeding",
    narration:
      "Remember the three B's. Binder: wrap a sheet tightly around the pelvis, over the greater trochanters, to shrink its volume. Blood: transfuse. Brake the bleeding: an external fixator, then surgery. And don't keep rocking the pelvis, because that breaks up clots.",
  },
  {
    kind: "organs",
    label: "Organs at risk",
    narration:
      "Sharp bone edges can injure the organs next to the pelvis. Front to back: Bladder, Uterus in women, and Rectum. Always ask six questions: is the airway clear, is the patient ventilating, is there active bleeding, is there an abdominal injury, is there a bladder or urethral injury, and is the pelvis stable?",
  },
  {
    kind: "urethra",
    label: "Blood at the meatus",
    narration:
      "Blood at the tip of the urethra means a urethral injury, so do not catheterize. A blind catheter can turn a partial tear into a complete one. Call the most experienced doctor, or leave it and do a suprapubic cystostomy. A ruptured bladder needs a laparotomy and repair, with a check of the bowel, spleen and liver.",
  },
  {
    kind: "blood",
    label: "Blood and clots",
    narration:
      "If the patient is bleeding now, give O-negative blood, the universal donor. If you can wait, give type-specific blood. Pelvic fractures also carry a high clot risk, especially in smokers, the obese, and patients on bed rest, with diabetes, multiple injuries, or oral contraceptives. Give prophylaxis with enoxaparin, or an oral drug such as rivaroxaban.",
  },
  {
    kind: "treat",
    label: "Treating the ring",
    narration:
      "A stable pelvic fracture is treated conservatively. Counsel the patient: non-weight-bearing for six weeks, then partial weight-bearing. An unstable fracture needs resuscitation, stabilising the ring with a binder or external fixator, then internal fixation as needed.",
  },
  {
    kind: "acet",
    label: "Acetabular fractures",
    narration:
      "The acetabulum is the socket and the femoral head is the ball. If the socket breaks and the ball no longer fits, the hip wears out early. The patterns are A, P, T, C: anterior column, posterior column, transverse, and central, where the femoral head is pushed into the pelvis.",
  },
  {
    kind: "medic",
    label: "When to avoid surgery",
    narration:
      "Think MEDIC. Minimal displacement, less than 3 millimetres. Elderly, where closed reduction is feasible. Doesn't involve the weight-bearing roof. Intact congruence of the hip. And a medical Condition that stops surgery, such as uncontrolled diabetes.",
  },
  {
    kind: "decide",
    label: "Operate or not",
    narration:
      "The decision rule: a congruent hip, an intact roof and a small gap means conservative treatment. If the roof is involved, or the hip is no longer congruent, operate: reduce and fix. Matta and Merritt's CIPO adds that conservative care works better in older patients. Children are managed with traction for about six weeks.",
  },
];

export default function PelvisVideo() {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", color: "#F4F1EA" }}>
      <p style={{ color: "#D4AF37", fontSize: ".8rem", textTransform: "uppercase", marginBottom: 12 }}>
        Pelvic and acetabular injuries: teaching video
      </p>
      <AutoVideoExporter
        stages={STAGES}
        StageComponent={PelvisStageSvg}
        buttonLabel="Make pelvis video"
        fileName="pelvis-video.mp4"
      />
    </div>
  );
}
