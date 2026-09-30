"use client";
import AutoVideoExporter from "./AutoVideoExporter";
import FractureStageSvg from "./FractureStageSvg";
import type { FractureStage } from "./FractureStageSvg";

const STAGES: FractureStage[] = [
  {
    kind: "what",
    label: "What is a fracture",
    narration:
      "A fracture is a break in the continuity of a bone. It usually follows trauma, such as a road accident, a fall, a sports injury or assault. But a diseased bone, weakened by osteoporosis, a tumour or infection, can break with very little force.",
  },
  {
    kind: "classify",
    label: "Classifying fractures",
    narration:
      "To classify any fracture, remember J, D, C, S, P: Joint involvement, Displacement, Completeness, Skin, and Pattern. Five questions, and you can describe almost any fracture.",
  },
  {
    kind: "joint",
    label: "Joint involvement",
    narration:
      "An intra-articular fracture extends into the joint. If the joint surface isn't restored properly, it can lead to stiffness, post-traumatic osteoarthritis and poor function. An extra-articular fracture stays outside the joint.",
  },
  {
    kind: "tar",
    label: "Displacement: TAR",
    narration:
      "In an undisplaced fracture, the fragments stay aligned. In a displaced fracture they move, and the bone TARns: Translation, where a fragment shifts sideways, Angulation, where they form an abnormal angle, and Rotation, where one fragment twists on its axis.",
  },
  {
    kind: "complete",
    label: "Complete and greenstick",
    narration:
      "A complete fracture breaks the bone right across. In an incomplete fracture, the bone is only partly divided. The classic example is the greenstick fracture, where one cortex cracks and the other bends, like a young green branch. Children get these because their bones are elastic and their periosteum is thick.",
  },
  {
    kind: "skin",
    label: "Open versus closed",
    narration:
      "A closed fracture doesn't communicate with the outside. An open fracture does, through a wound. That makes it an orthopaedic emergency, because of contamination, infection and soft-tissue damage. Even a small wound can connect to the fracture.",
  },
  {
    kind: "patterns",
    label: "Fracture patterns",
    narration:
      "Transverse fractures usually come from bending forces. Oblique fractures run diagonally. Spiral fractures come from twisting. Comminuted fractures break the bone into three or more pieces. And a pathological fracture happens through diseased bone, such as a metastasis or osteoporosis, after minimal trauma.",
  },
  {
    kind: "assess",
    label: "Assessing the patient",
    narration:
      "In major trauma, don't rush to the broken leg. Start with ABCDE: Airway, Breathing, Circulation, Disability and Exposure, and treat life threats as you find them. Then examine the limb, checking pulse, power and perception, and always look at the joint above and the joint below.",
  },
  {
    kind: "twos",
    label: "Imaging: rule of twos",
    narration:
      "The X-ray follows the rule of twos: two views, two joints, two occasions, before and after treatment, and two limbs when comparison helps. Views, Joints, Occasions, Limbs: V, J, O, L.",
  },
  {
    kind: "reduce",
    label: "Reduce then fix",
    narration:
      "Reduction puts the bone back. Fixation keeps it there. Closed reduction realigns the bone without surgical exposure, usually followed by a cast. Open reduction exposes the fracture surgically.",
  },
  {
    kind: "hold",
    label: "Ways to hold a fracture",
    narration:
      "A plaster cast immobilizes the limb, but it must be watched for tightness and neurovascular problems. Traction applies a pulling force, through the skin or directly through a bone pin. Internal fixation uses plates, screws or nails inside the bone. External fixation uses pins connected to a frame outside the body.",
  },
  {
    kind: "compartment",
    label: "Compartment syndrome",
    narration:
      "Compartment syndrome is one of the most important emergencies in orthopaedics. Pressure rises inside a closed compartment and starves muscles and nerves of blood. Watch for severe pain out of proportion, and pain on passive stretch. Don't wait for the pulse to disappear, because a pulse can still be present.",
  },
  {
    kind: "healing",
    label: "When healing goes wrong",
    narration:
      "Three problems affect healing. Delayed union is slow healing. Non-union means the fracture fails to unite. Malunion means it heals in a bad position. Delayed, non-union, malunion: D, N, M.",
  },
  {
    kind: "kids",
    label: "Children and rehabilitation",
    narration:
      "Children aren't small adults. They have a growth plate that can be damaged, thick periosteum, strong remodelling and faster healing. And for every patient, the goal isn't just a joined bone. It's restoring function: strength, movement, walking and independence.",
  },
];

export default function FractureVideo() {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", color: "#F4F1EA" }}>
      <p style={{ color: "#D4AF37", fontSize: ".8rem", textTransform: "uppercase", marginBottom: 12 }}>
        Fractures: teaching video
      </p>
      <AutoVideoExporter
        stages={STAGES}
        StageComponent={FractureStageSvg}
        buttonLabel="Make fracture video"
        fileName="fracture-video.mp4"
      />
    </div>
  );
}
