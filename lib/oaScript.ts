export type Stage = {
  label: string;
  narration: string;
  cart: number;
  crack: number;
  osteo: number;
  cyst: number;
  scler: number;
};

export const oaStages: Stage[] = [
  {
    label: "Healthy joint",
    narration:
      "Osteoarthritis isn't just wear and tear. It's a disease of the whole joint, a battle between destruction and repair. Here's a healthy synovial joint. Smooth articular cartilage cushions the bone ends, wrapped in a capsule lined by synovium.",
    cart: 1, crack: 0, osteo: 0, cyst: 0, scler: 0,
  },
  {
    label: "Cartilage roughening",
    narration:
      "Mechanical stress or biochemical change injures the cartilage. The cells that maintain it, chondrocytes, get damaged and release enzymes that break the cartilage down further.",
    cart: .85, crack: .4, osteo: 0, cyst: 0, scler: 0,
  },
  {
    label: "Fibrillation and thinning",
    narration:
      "The smooth surface develops cracks, called fibrillation. Cartilage becomes rough, soft, and progressively thinner.",
    cart: .55, crack: 1, osteo: 0, cyst: 0, scler: 0,
  },
  {
    label: "Bone-on-bone exposure",
    narration:
      "Eventually the cartilage is lost entirely. The underlying bone is exposed, grinding bone on bone.",
    cart: .1, crack: 1, osteo: 0, cyst: 0, scler: .3,
  },
  {
    label: "Sclerosis, cysts, osteophytes",
    narration:
      "The bone reacts. It becomes dense and polished, called eburnation. Cysts form beneath the surface. And at the joint margins, new bone grows outward, forming osteophytes, the hallmark of osteoarthritis.",
    cart: 0, crack: 0, osteo: 1, cyst: 1, scler: 1,
  },
];
