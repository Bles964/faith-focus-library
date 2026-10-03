"use client";
import AutoVideoExporter from "./AutoVideoExporter";
import EyeStageSvg from "./EyeStageSvg";
import type { EyeStage } from "./EyeStageSvg";

const CATARACT: EyeStage[] = [
  {
    kind: "c1",
    label: "What is a cataract",
    narration:
      "A cataract is any opacity of the crystalline lens. The lens has no blood or nerve supply, and it has four parts: Capsule, Epithelium, Cortex and Nucleus. Cataract is the most common cause of blindness worldwide, and also a leading cause of avoidable, reversible blindness.",
  },
  {
    kind: "c2",
    label: "Causes",
    narration:
      "Age is the most common cause: 80 to 90 percent of eyes have a cataract by 65. Other causes are trauma, inflammation such as uveitis, metabolic disease such as diabetes and galactosaemia, and drugs, especially long-term steroids. Eye diseases, radiation, tobacco, alcohol and poor nutrition also play a part.",
  },
  {
    kind: "c3",
    label: "Types by location",
    narration:
      "Nuclear cataract is brown, and the hardened nucleus can give second sight of the aged: a presbyope suddenly reads without glasses. Cortical cataract is whitish and spreads from the edge toward the centre. Subcapsular cataract starts centrally and progresses fast, with glare and poor near vision, and it is linked to diabetes, steroids and younger patients.",
  },
  {
    kind: "c4",
    label: "Stages of cataract",
    narration:
      "Remember I, I, M, H, I, M: Incipient, Immature, Mature, Hypermature, Intumescent, Morgagnian. In a mature cataract the lens is white or dark brown with severe visual loss. In a Morgagnian cataract the cortex liquefies and the nucleus floats or drops.",
  },
  {
    kind: "c5",
    label: "Symptoms and signs",
    narration:
      "The classic story is gradual, painless, progressive blurring over months to years, usually in both eyes. Glare, double vision, and a white pupil in children are other clues. No light perception is not explained by a simple cataract, so look for another eye problem.",
  },
  {
    kind: "c6",
    label: "Surgery",
    narration:
      "Surgical removal is the only treatment. The reasons to operate are visual restoration, medical reasons such as lens-induced glaucoma, and cosmetic reasons. Before surgery, control blood pressure and diabetes, treat any eye infection, and use biometry to choose the lens implant power.",
  },
  {
    kind: "c7",
    label: "Surgical techniques",
    narration:
      "I C C E removes the whole lens with its capsule. E C C E removes the nucleus and cortex but keeps the posterior capsule to support the implant. S I C S uses a small self-sealing tunnel with no sutures. Phacoemulsification uses ultrasound through a 3 to 4 millimetre incision, with a foldable implant.",
  },
  {
    kind: "c8",
    label: "After surgery",
    narration:
      "Give steroid drops six times daily, tapering over six to eight weeks, plus antibiotic drops for four weeks. Check refraction at six to twelve weeks. Aphakia means the lens is absent, while pseudophakia means an implant is present. Posterior capsule opacity after E C C E is treated with an N D YAG laser.",
  },
];

const GLAUCOMA: EyeStage[] = [
  {
    kind: "g1",
    label: "What is glaucoma",
    narration:
      "Glaucoma is a group of conditions with optic nerve damage and visual field loss. It is the leading cause of irreversible blindness worldwide. Raised pressure is a risk factor, but a normal pressure reading does not rule it out.",
  },
  {
    kind: "g2",
    label: "Aqueous and pressure",
    narration:
      "Aqueous is made at about two microlitres a minute and drains by two routes. The trabecular route carries about 90 percent and the uveoscleral route about 10 percent. Normal eye pressure is 10 to 21 millimetres of mercury.",
  },
  {
    kind: "g3",
    label: "Types of glaucoma",
    narration:
      "There are four main groups: primary open-angle, primary angle-closure, secondary, and congenital. Open-angle disease is slow and silent. Angle-closure can strike suddenly as an emergency.",
  },
  {
    kind: "g4",
    label: "Open-angle glaucoma",
    narration:
      "Primary open-angle glaucoma is chronic, slowly progressive and usually in both eyes. Peripheral vision goes first and central vision is kept until late, so patients often don't notice. Risk factors are age, African descent, family history, high pressure, high myopia and a thin cornea.",
  },
  {
    kind: "g5",
    label: "Diagnosis",
    narration:
      "Gonioscopy shows an open angle. The optic disc shows pathological cupping: glaucoma digs the cup. Pachymetry checks corneal thickness, perimetry shows the field defects, and O C T images the nerve. One normal pressure reading does not exclude glaucoma.",
  },
  {
    kind: "g6",
    label: "Treatment",
    narration:
      "The aim is to lower pressure to a safe target. Drops include beta blockers, which need caution in asthma, prostaglandin analogues, alpha-2 agonists, pilocarpine and carbonic anhydrase inhibitors. Laser trabeculoplasty is another option, and trabeculectomy is the most common surgery.",
  },
  {
    kind: "g7",
    label: "Acute angle closure",
    narration:
      "This is an eye emergency. It most often affects older women with short, long-sighted eyes. The signs are severe pain, blurred vision, haloes around lights, nausea and vomiting, a mid-dilated fixed pupil, and pressure up to 50 to 60. Lower the pressure with acetazolamide and drops, then do a laser iridotomy, and treat the other eye too.",
  },
  {
    kind: "g8",
    label: "Childhood glaucoma",
    narration:
      "The classic triad is tearing, photophobia and a large, cloudy eye. The enlarged eye is called buphthalmos, and Haab's striae are breaks in the cornea. Treatment is surgery, such as goniotomy or trabeculotomy. Alphagan is avoided under age five because of the risk of apnoea.",
  },
];

const REFRACTION: EyeStage[] = [
  {
    kind: "r1",
    label: "Optics of the eye",
    narration:
      "The eye works like a camera. A convex lens converges light and a concave lens diverges it, and lens power is measured in dioptres: one divided by the focal length in metres. The eye has about 50 dioptres: 40 from the cornea and 10 from the lens.",
  },
  {
    kind: "r2",
    label: "Accommodation",
    narration:
      "For near objects, the ciliary muscle contracts and the suspensory ligaments relax. The lens becomes rounder and more powerful, and the image falls on the retina. Ciliary contracts, lens convex.",
  },
  {
    kind: "r3",
    label: "Myopia and hypermetropia",
    narration:
      "In myopia, light focuses in front of the retina, distant objects blur, and you correct with a concave minus lens. In hypermetropia, light focuses behind the retina, and you correct with a convex plus lens. Myopia is most often due to a long eyeball.",
  },
  {
    kind: "r4",
    label: "Other refractive errors",
    narration:
      "Astigmatism means different focus in different planes, corrected with a cylindrical lens. Presbyopia is the natural loss of accommodation with age, corrected with plus lenses for near. Aphakia is a severe hypermetropic state needing about plus ten dioptres.",
  },
  {
    kind: "r5",
    label: "Testing the eye",
    narration:
      "If vision improves through a pinhole, think refractive error. If it doesn't, look for eye disease. Subjective refraction uses a Snellen chart at six metres, and trial lenses are changed until the patient sees best.",
  },
  {
    kind: "r6",
    label: "The golden rule",
    narration:
      "Give the minimum minus for myopia and the maximum plus for hypermetropia. Don't overcorrect myopia. In the duochrome test, the aim is for the red letters to look clearer. Reading additions are about plus one at 40 to 50, plus two at 50 to 60, and plus three over 60, but tailor it to the patient.",
  },
  {
    kind: "r7",
    label: "Other ways to correct",
    narration:
      "Contact lenses sit on the cornea and need good fitting and hygiene. Excimer laser surgery reshapes the cornea, as P R K or LASIK, with limits for high myopia and unstable refraction. Low-vision aids magnify the image but narrow the field.",
  },
];

function Section({ title, stages, button, file }: { title: string; stages: EyeStage[]; button: string; file: string }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", color: "#F4F1EA" }}>
      <p style={{ color: "#D4AF37", fontSize: ".8rem", textTransform: "uppercase", marginBottom: 12 }}>{title}</p>
      <AutoVideoExporter stages={stages} StageComponent={EyeStageSvg} buttonLabel={button} fileName={file} />
    </div>
  );
}

const rule = { margin: "40px 0", border: "none", borderTop: "1px solid #2A3E5C" } as const;

export default function EyeVideos() {
  return (
    <>
      <Section title="Ophthalmology 1: Cataract" stages={CATARACT} button="Make cataract video" file="cataract-video.mp4" />
      <hr style={rule} />
      <Section title="Ophthalmology 2: Glaucoma" stages={GLAUCOMA} button="Make glaucoma video" file="glaucoma-video.mp4" />
      <hr style={rule} />
      <Section title="Ophthalmology 3: Refractive errors" stages={REFRACTION} button="Make refraction video" file="refraction-video.mp4" />
    </>
  );
}
