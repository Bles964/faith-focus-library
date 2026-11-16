import type { ULStage } from "./ulSvg";

export type ULVideo = { title: string; fileName: string; button: string; stages: ULStage[] };

const FR = ["Resuscitation", "Reduction", "Retention", "Regeneration", "Rehabilitation"];

export const VIDEOS: ULVideo[] = [
  /* ---------------- SESSION 1 ---------------- */
  {
    title: "Upper limb 1: Introduction",
    fileName: "upper-limb-1-introduction.mp4",
    button: "Make session 1 video",
    stages: [
      {
        label: "Fractures and dislocations of the upper limb", layout: "title", sub: "Session 1: Introduction",
        narration: "Welcome to Faith and Focus Academy. In this session, we will be introducing fractures and dislocations of the upper limb. Let's begin with some important definitions.",
      },
      {
        label: "Definitions", layout: "table",
        rows: [
          ["Fracture", "A break in the structural continuity of a bone"],
          ["Dislocation", "Complete loss of contact between the articular surfaces of a joint"],
          ["Subluxation", "Partial dislocation: some contact remains"],
          ["Fracture-dislocation", "A fracture associated with dislocation of a joint"],
        ],
        narration: "A fracture is a break in the structural continuity of a bone. A dislocation is the complete loss of contact between the articular surfaces of a joint, while a subluxation is a partial dislocation in which some contact remains. A fracture-dislocation occurs when a fracture is associated with dislocation of a joint.",
      },
      {
        label: "The upper limb", layout: "bullets",
        items: ["Shoulder girdle", "Arm", "Elbow", "Forearm", "Wrist", "Hand"],
        narration: "The upper limb consists of the shoulder girdle, arm, elbow, forearm, wrist and hand.",
      },
      {
        label: "Why these injuries matter", layout: "bullets",
        items: ["Daily activities", "Occupation", "Self-care", "Independence"],
        note: "Injuries of the dominant hand may cause greater functional impairment.",
        narration: "Injuries to these structures are clinically important because they can affect daily activities, occupation, self-care and independence. Remember that injuries affecting the dominant hand may produce greater functional impairment. Understanding these basic definitions is the foundation for studying upper-limb trauma. Let's move on to the relevant anatomy.",
      },
    ],
  },
  /* ---------------- SESSION 2 ---------------- */
  {
    title: "Upper limb 2: Anatomy and neurovascular examination",
    fileName: "upper-limb-2-anatomy.mp4",
    button: "Make session 2 video",
    stages: [
      {
        label: "Anatomy and neurovascular exam", layout: "title", sub: "Session 2",
        narration: "In this session, we will examine the relevant anatomy of the upper limb and the important principles of neurovascular assessment.",
      },
      {
        label: "The shoulder girdle", layout: "compare",
        left: { title: "Bones", lines: ["Clavicle", "Scapula"] },
        right: { title: "Major joints", lines: ["Acromioclavicular", "Sternoclavicular", "Glenohumeral"] },
        narration: "The shoulder girdle consists of two bones: the clavicle and scapula. Its major joints include the acromioclavicular joint, sternoclavicular joint and glenohumeral joint.",
      },
      {
        label: "Arm, elbow and forearm", layout: "bullets",
        items: ["Arm: the humerus", "Forearm: two bones, the radius and ulna", "Elbow: three joints", "Ulnohumeral, radiocapitellar and proximal radioulnar"],
        narration: "The arm contains the humerus, while the forearm contains two bones: the radius and ulna. The elbow consists of three joints: the ulnohumeral, radiocapitellar and proximal radioulnar joints.",
      },
      {
        label: "The forearm is a ring", layout: "bullets",
        items: ["Radius and ulna are joined by the interosseous membrane", "They work together for pronation and supination", "When one bone is fractured, assess the other bone and the joints at both ends"],
        note: "Examples: Galeazzi and Monteggia fractures",
        narration: "The radius and ulna are connected by the interosseous membrane and work together to produce pronation and supination. An important clinical principle is that the forearm behaves like a ring. Therefore, when one bone is fractured, always assess the other bone and the joints at both ends. Examples include Galeazzi and Monteggia fractures.",
      },
      {
        label: "Neurovascular examination", layout: "steps",
        items: ["Perform and document before and after any manipulation or reduction", "Check the radial and ulnar pulses", "Capillary refill", "Limb colour and temperature"],
        narration: "Now, let's discuss neurovascular examination. Neurovascular assessment must always be performed and documented before and after any manipulation or reduction. For vascular assessment, check the radial and ulnar pulses, capillary refill, limb colour and temperature.",
      },
      {
        label: "Motor assessment", layout: "table",
        rows: [["Radial nerve", "Wrist and finger extension"], ["Median nerve", "Thumb opposition and OK-sign formation"], ["Ulnar nerve", "Finger abduction"]],
        narration: "For motor assessment: Radial nerve: test wrist and finger extension. Median nerve: test thumb opposition and OK-sign formation. Ulnar nerve: test finger abduction.",
      },
      {
        label: "Sensory assessment", layout: "table",
        rows: [["Radial nerve", "First dorsal web space"], ["Median nerve", "Index finger pulp"], ["Ulnar nerve", "Little finger pulp"]],
        note: "Worse neurovascular status after reduction is a surgical emergency until proven otherwise.",
        narration: "For sensory assessment: Radial nerve: first dorsal web space. Median nerve: index finger pulp. Ulnar nerve: little finger pulp. Remember, any worsening neurovascular status following reduction is a surgical emergency until proven otherwise.",
      },
    ],
  },
  /* ---------------- SESSION 3 PART 1 ---------------- */
  {
    title: "Upper limb 3A: General principles, classification and investigations",
    fileName: "upper-limb-3a-general-principles.mp4",
    button: "Make session 3A video",
    stages: [
      {
        label: "General principles", layout: "title", sub: "Session 3, part 1: classification and investigations",
        narration: "Welcome to Session Three. Fractures and dislocations commonly result from road traffic accidents, falls, assault, gunshot injuries and other forms of trauma.",
      },
      {
        label: "Open and closed fractures", layout: "compare",
        left: { title: "Closed fracture", lines: ["The skin remains intact"] },
        right: { title: "Open fracture", lines: ["The fracture communicates with the outside environment through a wound"] },
        narration: "Fractures can be classified into open and closed fractures. In a closed fracture, the skin remains intact. In an open fracture, the fracture communicates with the outside environment through a wound.",
      },
      {
        label: "Fracture patterns", layout: "bullets",
        items: ["Transverse, oblique, spiral, comminuted and segmented", "Children: greenstick and torus", "Pathological: occurs in abnormal bone", "Stress: repetitive loading"],
        narration: "Fractures can also be classified according to their patterns. These include transverse, oblique, spiral, comminuted and segmented fractures. In children, we commonly encounter greenstick and torus fractures. Other special types include pathological fractures, which occur in abnormal bone, and stress fractures, which result from repetitive loading.",
      },
      {
        label: "Classification systems", layout: "table",
        rows: [["AO", "Classification of fractures"], ["Gustilo-Anderson", "Open fractures"], ["Salter-Harris", "Growth-plate injuries"], ["Dislocations", "By joint, direction, duration, complexity and stability"]],
        narration: "Important fracture classification systems include the AO classification, Gustilo-Anderson classification for open fractures and Salter-Harris classification for growth-plate injuries. Dislocations can be classified according to the joint involved, direction, duration, complexity and stability.",
      },
      {
        label: "Clinical features", layout: "bullets",
        items: ["Pain", "Swelling and deformity", "Tenderness", "Loss of function", "Possible neurovascular deficit"],
        note: "Crepitus may suggest a fracture, but never elicit it deliberately.",
        narration: "Common clinical features of fractures and dislocations include pain, swelling, deformity, tenderness, loss of function and possible neurovascular deficit. Crepitus may suggest a fracture, but it should never be deliberately elicited.",
      },
      {
        label: "Investigations", layout: "table",
        rows: [["X-ray", "First-line for most suspected fractures"], ["CT scan", "Complex and intra-articular fractures; operative planning"], ["MRI", "Soft-tissue and ligament injury; occult fractures"], ["Bone scan", "Certain occult and stress fractures"]],
        narration: "Now, let's discuss investigations. Plain X-rays are the first-line investigation for most suspected fractures. The standard views are anteroposterior and lateral. CT scans are particularly useful for complex and intra-articular fractures and for operative planning. MRI is useful for soft-tissue injuries, ligament damage and occult fractures. Bone scans may also help identify certain occult and stress fractures.",
      },
      {
        label: "The Rule of Twos", layout: "letters",
        letters: [
          { l: "2", w: "Two views", d: "Anteroposterior and lateral" },
          { l: "2", w: "Two joints", d: "When indicated" },
          { l: "2", w: "Two limbs", d: "Compare when necessary" },
          { l: "2", w: "Two occasions", d: "Repeat imaging when clinically indicated" },
        ],
        narration: "Remember the Rule of Twos: Two views, two joints when indicated, comparison of two limbs when necessary, and repeat imaging on two occasions when clinically indicated.",
      },
      {
        label: "LARA: displacement", layout: "letters",
        letters: [{ l: "L", w: "Length" }, { l: "A", w: "Alignment" }, { l: "R", w: "Rotation" }, { l: "A", w: "Apposition" }],
        narration: "When assessing fracture displacement, remember the mnemonic LARA: L stands for Length. A stands for Alignment. R stands for Rotation. A stands for Apposition.",
      },
    ],
  },
  /* ---------------- SESSION 3 PART 2 ---------------- */
  {
    title: "Upper limb 3B: Treatment, open fractures and complications",
    fileName: "upper-limb-3b-treatment.mp4",
    button: "Make session 3B video",
    stages: [
      {
        label: "General principles", layout: "title", sub: "Session 3, part 2: treatment, open fractures and complications",
        narration: "Now, let's move to treatment.",
      },
      {
        label: "The Five Rs", layout: "letters",
        letters: [
          { l: "1", w: "Resuscitation", d: "Following ATLS principles where necessary" },
          { l: "2", w: "Reduction", d: "Restore the alignment of the bone" },
          { l: "3", w: "Retention", d: "POP casts, splints, braces, traction or surgical fixation" },
          { l: "4", w: "Regeneration", d: "The healing process" },
          { l: "5", w: "Rehabilitation", d: "Physiotherapy and appropriate exercises" },
        ],
        narration: "The general principles of fracture management can be remembered using the Five Rs. First is Resuscitation, following ATLS principles where necessary. Second is Reduction, which means restoring the alignment of the fractured bone. Third is Retention, which involves maintaining the reduction using methods such as POP casts, splints, braces, traction or surgical fixation. Fourth is Regeneration, referring to the healing process. And fifth is Rehabilitation, which restores function through physiotherapy and appropriate exercises.",
      },
      {
        label: "Two types of bone healing", layout: "compare",
        left: { title: "Direct (primary)", lines: ["Absolute stability", "Usually compression plate fixation", "Little or no visible callus"] },
        right: { title: "Indirect (secondary)", lines: ["Relative stability", "Casts and many intramedullary nails", "Callus formation"] },
        narration: "There are two major types of bone healing. Direct or primary bone healing occurs under absolute stability, usually with compression plate fixation. It occurs with little or no visible callus formation. Indirect or secondary bone healing occurs under relative stability, such as with casts and many intramedullary nail constructs. It involves callus formation.",
      },
      {
        label: "Stages of healing", layout: "steps",
        items: ["Haematoma formation", "Inflammation", "Soft callus formation", "Hard callus formation", "Remodelling"],
        narration: "The stages include haematoma formation, inflammation, soft callus formation, hard callus formation and remodelling.",
      },
      {
        label: "Open fractures", layout: "steps",
        items: ["Initial resuscitation", "Early intravenous antibiotics", "Tetanus prophylaxis", "Sterile wound coverage", "Urgent surgical debridement", "Skeletal stabilisation", "Soft-tissue coverage"],
        note: "Orthopaedic emergency: risk of contamination and infection",
        narration: "Now, let's discuss open fractures. Open fractures are orthopaedic emergencies because of the risk of contamination and infection. Management includes initial resuscitation, early intravenous antibiotics, tetanus prophylaxis, sterile wound coverage, urgent surgical debridement, skeletal stabilisation and appropriate soft-tissue coverage.",
      },
      {
        label: "The Five Es of debridement", layout: "letters",
        letters: [{ l: "E", w: "Examine" }, { l: "E", w: "Extend" }, { l: "E", w: "Excise" }, { l: "E", w: "Eliminate" }, { l: "E", w: "Irrigate appropriately" }],
        note: "Routine wound cultures are not needed unless infection is suspected.",
        narration: "The Five Es of debridement are: Examine, Extend, Excise, Eliminate and Irrigate appropriately. Routine wound cultures are not generally necessary before debridement unless infection is suspected.",
      },
      {
        label: "Complications", layout: "table",
        rows: [["Bone", "Delayed union, non-union, malunion"], ["Vascular", "Vascular injury, compartment syndrome"], ["Infection", "Osteomyelitis"], ["Nerve", "Neurapraxia, axonotmesis, neurotmesis"], ["Joint", "Stiffness, recurrent dislocation"], ["Soft tissue", "Myositis ossificans"]],
        narration: "Finally, let's discuss complications. Bone complications include delayed union, non-union and malunion. Vascular complications include vascular injury and compartment syndrome. Infection may result in osteomyelitis. Nerve injuries may present as neurapraxia, axonotmesis or neurotmesis. Joint complications include stiffness and recurrent dislocation, while soft-tissue complications may include myositis ossificans.",
      },
      {
        label: "Compartment syndrome", layout: "letters",
        letters: [{ l: "P", w: "Pain" }, { l: "P", w: "Pallor" }, { l: "P", w: "Paraesthesia" }, { l: "P", w: "Pulselessness" }, { l: "P", w: "Paralysis" }],
        note: "Raised pressure in a closed fascial compartment compromises perfusion.",
        narration: "One particularly important emergency is compartment syndrome. It occurs when increased pressure within a closed fascial compartment compromises tissue perfusion. The classical Five Ps are pain, pallor, paraesthesia, pulselessness and paralysis.",
      },
      {
        label: "Compartment syndrome: key points", layout: "bullets",
        items: ["Earliest signs: pain out of proportion to the injury", "Pain on passive stretching", "A normal pulse does not exclude it"],
        note: "Definitive emergency treatment: fasciotomy",
        narration: "However, the earliest and most important warning signs are pain out of proportion to the injury and pain on passive stretching. Remember that the presence of a normal pulse does not exclude compartment syndrome. The definitive emergency treatment is fasciotomy. That brings us to the end of the general principles. Let's now examine injuries of the shoulder girdle.",
      },
    ],
  },
  /* ---------------- SESSION 4 ---------------- */
  {
    title: "Upper limb 4: Shoulder girdle injuries",
    fileName: "upper-limb-4-shoulder-girdle.mp4",
    button: "Make session 4 video",
    stages: [
      {
        label: "Shoulder girdle injuries", layout: "title", sub: "Session 4",
        narration: "Welcome to Session Four. In this session, we will discuss fractures and dislocations involving the clavicle, scapula and shoulder joint.",
      },
      {
        label: "Clavicle fractures", layout: "bullets",
        items: ["Commonest site: middle third", "Fall on an outstretched hand, or direct impact on the shoulder", "Most are managed with a sling and analgesia", "Surgery: open fractures, threatened skin, neurovascular injury, significantly displaced"],
        narration: "Let's begin with clavicle fractures. The clavicle is commonly fractured at its middle third. The common mechanisms of injury include a fall on an outstretched hand and direct impact on the shoulder. Most uncomplicated clavicle fractures can be managed conservatively using a sling and appropriate analgesia. Surgical fixation may be indicated in selected cases, particularly open fractures, threatened skin, neurovascular injury and significantly displaced fractures with other concerning features.",
      },
      {
        label: "Clavicle: complications", layout: "bullets",
        items: ["Non-union", "Shoulder stiffness", "Brachial plexus injury", "Subclavian vessel injury"],
        narration: "Complications include non-union, shoulder stiffness, brachial plexus injury and subclavian vessel injury.",
      },
      {
        label: "Scapula fractures", layout: "bullets",
        items: ["Uncommon: protected by surrounding muscles", "Usually from high-energy trauma", "Most: sling and early mobilisation", "Displaced glenoid or scapular neck fractures may need surgery"],
        narration: "Next is the scapula. Scapular fractures are relatively uncommon because the scapula is protected by surrounding muscles. They are usually associated with high-energy trauma. Most are treated conservatively with a sling and early mobilisation. However, significantly displaced glenoid or scapular neck fractures may require surgical treatment.",
      },
      {
        label: "Acromioclavicular dislocation", layout: "bullets",
        items: ["Follows a direct fall onto the shoulder", "Rockwood classification: six types", "Types 1 and 2: sling, analgesia, rehabilitation", "Types 4, 5 and 6: commonly need surgical consideration"],
        narration: "Now, let's discuss acromioclavicular joint dislocation. This commonly follows a direct fall onto the shoulder. It is classified using the Rockwood classification, which has six types. Types One and Two are usually managed conservatively with a sling, analgesia and rehabilitation. More severe injuries, particularly Types Four, Five and Six, commonly require surgical consideration.",
      },
      {
        label: "Anterior shoulder dislocation", layout: "bullets",
        items: ["The most commonly dislocated major joint", "Anterior: about 95 percent", "Arm forced into abduction, extension and external rotation", "Severe pain, flattened contour, abducted arm, restricted movement"],
        narration: "Now, let's move to glenohumeral dislocation. The shoulder is the most commonly dislocated major joint. Anterior dislocation accounts for approximately 95 percent of shoulder dislocations. It commonly occurs when the arm is forced into abduction, extension and external rotation. Clinical features include severe shoulder pain, flattening of the shoulder contour, an abducted arm and restricted movement.",
      },
      {
        label: "Axillary nerve and reduction", layout: "bullets",
        items: ["The axillary nerve is at risk", "Test deltoid function", "Test sensation over the regimental badge area", "Reduction: Kocher, Hippocratic, Stimson", "By trained personnel, with analgesia or sedation and neurovascular assessment"],
        narration: "The axillary nerve is particularly at risk. Therefore, always assess deltoid function and sensation over the regimental badge area. Reduction methods include the Kocher, Hippocratic and Stimson techniques. Reduction should be performed by appropriately trained personnel with adequate analgesia or sedation and appropriate neurovascular assessment.",
      },
      {
        label: "Posterior and inferior dislocation", layout: "compare",
        left: { title: "Posterior", lines: ["Less common", "Seizures and electrocution", "X-ray: light-bulb sign"] },
        right: { title: "Inferior (luxatio erecta)", lines: ["Arm fixed overhead in abduction"] },
        narration: "Posterior shoulder dislocation is less common and is classically associated with seizures and electrocution. An important X-ray finding is the light-bulb sign. Inferior shoulder dislocation is also known as luxatio erecta. Its characteristic presentation is an arm fixed overhead in abduction.",
      },
      {
        label: "Exam points", layout: "table",
        rows: [["Most common shoulder dislocation", "Anterior"], ["Nerve most at risk", "Axillary nerve"]],
        narration: "Remember these important examination points: The most common shoulder dislocation is anterior, and the nerve most at risk is the axillary nerve.",
      },
    ],
  },
  /* ---------------- SESSION 5 ---------------- */
  {
    title: "Upper limb 5: Humerus fractures",
    fileName: "upper-limb-5-humerus.mp4",
    button: "Make session 5 video",
    stages: [
      {
        label: "Humerus fractures", layout: "title", sub: "Session 5",
        narration: "Welcome to Session Five. In this session, we will discuss fractures of the humerus. Humeral fractures are classified according to their location into proximal, shaft and distal humeral fractures.",
      },
      {
        label: "Humeral shaft fractures", layout: "bullets",
        items: ["Initial U-shaped slab", "Then a functional brace in suitable cases", "Intramedullary nailing", "Plate fixation"],
        narration: "Let's begin with humeral shaft fractures. These fractures may be treated using a U-shaped slab initially, followed by a functional brace in suitable cases. Other treatment options include intramedullary nailing and plate fixation.",
      },
      {
        label: "The radial nerve", layout: "bullets",
        items: ["Runs in the radial groove of the humerus", "May be injured in shaft fractures", "Wrist drop: weak wrist extension"],
        note: "Humeral shaft fracture: think radial nerve",
        narration: "The most important nerve to remember is the radial nerve. The radial nerve runs in the radial groove of the humerus and may be injured in shaft fractures. Injury may produce wrist drop due to weakness of wrist extension.",
      },
      {
        label: "Proximal humeral fractures", layout: "bullets",
        items: ["Humeral head, surgical neck and tuberosities", "Treatment depends on pattern, displacement, age and demands", "Conservative, PHILOS plate, lag screws, arthroplasty for complex injuries"],
        narration: "Next are proximal humeral fractures. These involve the upper part of the humerus and may affect the humeral head, surgical neck and tuberosities. Treatment depends on the fracture pattern, displacement, patient's age and functional demands. Options include conservative treatment, fixation with a PHILOS plate, lag screws in selected patterns and arthroplasty for certain complex injuries.",
      },
      {
        label: "Distal humeral fractures", layout: "bullets",
        items: ["Involve the lower part of the humerus", "Lag screws and dual plating", "Depends on the fracture configuration"],
        narration: "Distal humeral fractures involve the lower part of the humerus and may require fixation using lag screws and dual plating, depending on the fracture configuration.",
      },
      {
        label: "Supracondylar fractures", layout: "bullets",
        items: ["Particularly common in children", "Fall on an outstretched hand", "Important for their neurovascular complications"],
        narration: "Now, let's focus on supracondylar fractures. These are particularly common in children and commonly result from a fall on an outstretched hand. They are important because of their potential neurovascular complications.",
      },
      {
        label: "Structures at risk", layout: "bullets",
        items: ["Brachial artery", "Median nerve, particularly its anterior interosseous branch", "Compartment syndrome", "Volkmann ischaemic contracture"],
        narration: "The structures at risk include the brachial artery and median nerve, particularly its anterior interosseous branch. Other complications include compartment syndrome and Volkmann ischaemic contracture.",
      },
      {
        label: "Supracondylar management", layout: "bullets",
        items: ["Closed reduction and percutaneous K-wire fixation", "Then appropriate immobilisation"],
        note: "A poorly perfused or pulseless hand needs urgent assessment and intervention.",
        narration: "Management commonly involves closed reduction and percutaneous K-wire fixation, followed by appropriate immobilisation. A poorly perfused or pulseless hand requires urgent assessment and intervention.",
      },
      {
        label: "Exam associations", layout: "table",
        rows: [["Humeral shaft fracture", "Radial nerve injury"], ["Supracondylar fracture", "Brachial artery and median nerve injury"]],
        narration: "Remember: Humeral shaft fracture, radial nerve injury. Supracondylar fracture, brachial artery and median nerve injury. These are important examination associations.",
      },
    ],
  },
  /* ---------------- SESSION 6 ---------------- */
  {
    title: "Upper limb 6: Elbow dislocation",
    fileName: "upper-limb-6-elbow.mp4",
    button: "Make session 6 video",
    stages: [
      {
        label: "Elbow dislocation", layout: "title", sub: "Session 6",
        narration: "Welcome to Session Six. In this session, we will discuss elbow dislocations.",
      },
      {
        label: "Elbow dislocation", layout: "bullets",
        items: ["Second most common major joint dislocation in adults, after the shoulder", "Commonest direction: posterior or posterolateral", "Fall on an outstretched hand", "Severe pain, swelling, deformity, cannot move the joint normally"],
        narration: "Elbow dislocation is the second most common major joint dislocation in adults, after shoulder dislocation. The most common direction is posterior or posterolateral. It commonly follows a fall on an outstretched hand. Patients usually present with severe elbow pain, swelling, deformity and inability to move the joint normally.",
      },
      {
        label: "Management", layout: "bullets",
        items: ["Assess neurovascular status, image, then reduce", "Simple dislocation: closed reduction, short immobilisation, early mobilisation", "Associated fractures and ligament injuries may need surgery"],
        narration: "Management involves assessment of neurovascular status, appropriate imaging and reduction. Most simple elbow dislocations can be treated with closed reduction, a short period of immobilisation and early mobilisation to reduce stiffness. However, associated fractures and ligament injuries may require surgical treatment.",
      },
      {
        label: "The terrible triad", layout: "letters",
        letters: [{ l: "1", w: "Elbow dislocation" }, { l: "2", w: "Radial head fracture" }, { l: "3", w: "Coronoid process fracture" }],
        note: "A highly unstable injury that often needs surgery.",
        narration: "One particularly important injury is the terrible triad of the elbow. It consists of three injuries: First, elbow dislocation. Second, radial head fracture. And third, coronoid process fracture. This combination produces a highly unstable elbow injury and often requires operative management. Remember: terrible triad equals elbow dislocation, radial head fracture and coronoid fracture.",
      },
    ],
  },
  /* ---------------- SESSION 7 ---------------- */
  {
    title: "Upper limb 7: Forearm fractures",
    fileName: "upper-limb-7-forearm.mp4",
    button: "Make session 7 video",
    stages: [
      {
        label: "Forearm fractures", layout: "title", sub: "Session 7",
        narration: "Welcome to Session Seven. In this session, we will discuss important fractures involving the radius and ulna.",
      },
      {
        label: "Galeazzi fracture", layout: "bullets",
        items: ["Fracture of the radial shaft", "Disruption or dislocation of the distal radioulnar joint"],
        note: "Radius fracture plus distal radioulnar joint disruption",
        narration: "Let's begin with Galeazzi fracture. A Galeazzi fracture consists of a fracture of the radial shaft associated with disruption or dislocation of the distal radioulnar joint. The key point is: radius fracture plus distal radioulnar joint disruption.",
      },
      {
        label: "Monteggia fracture: MUGR", layout: "letters",
        letters: [{ l: "M", w: "Monteggia" }, { l: "U", w: "Ulna fracture" }, { l: "G", w: "Radial head displacement" }, { l: "R", w: "Radial head" }],
        narration: "Next is Monteggia fracture. Monteggia fracture consists of an ulna fracture associated with dislocation of the radial head. A useful mnemonic is MUGR: M stands for Monteggia. U stands for Ulna fracture. G stands for radial head displacement. R reminds you of the radial head.",
      },
      {
        label: "Galeazzi or Monteggia?", layout: "compare",
        left: { title: "Galeazzi", lines: ["Radius", "plus distal radioulnar joint"] },
        right: { title: "Monteggia", lines: ["Ulna", "plus radial head"] },
        narration: "The important distinction is that Galeazzi involves the radius and distal radioulnar joint, while Monteggia involves the ulna and radial head.",
      },
      {
        label: "Colles fracture", layout: "bullets",
        items: ["Distal radius fracture with dorsal displacement", "Fall on an outstretched hand, wrist extended", "Dinner-fork deformity", "Older adults, especially postmenopausal women with osteoporosis"],
        narration: "Now, let's discuss Colles fracture. Colles fracture is a fracture of the distal radius with dorsal displacement of the distal fragment. It commonly follows a fall on an outstretched hand with the wrist extended. The characteristic deformity is called the dinner-fork deformity. It is commonly seen in older adults, particularly postmenopausal women with osteoporosis.",
      },
      {
        label: "Smith fracture", layout: "bullets",
        items: ["The reverse of Colles", "Distal radius fracture with volar displacement", "Fall onto a flexed wrist", "Garden-spade deformity"],
        narration: "Next is Smith fracture. Smith fracture is essentially the reverse of Colles fracture. It involves a distal radius fracture with volar displacement of the distal fragment. It may follow a fall onto a flexed wrist. Its characteristic deformity is known as the garden-spade deformity.",
      },
      {
        label: "Colles and Smith", layout: "deform",
        narration: "For examination purposes, remember: Colles, dorsal displacement, dinner fork. Smith, volar displacement, garden spade. These distinctions are frequently tested.",
      },
    ],
  },
  /* ---------------- SESSION 8 ---------------- */
  {
    title: "Upper limb 8: Hand injuries",
    fileName: "upper-limb-8-hand.mp4",
    button: "Make session 8 video",
    stages: [
      {
        label: "Hand injuries", layout: "title", sub: "Session 8",
        narration: "Welcome to Session Eight. In this session, we will discuss fractures and dislocations involving the hand. Hand injuries may involve the carpal bones, metacarpals and phalanges.",
      },
      {
        label: "Management", layout: "bullets",
        items: ["General fracture principles: resuscitation when necessary, reduction, retention, regeneration, rehabilitation", "Pain control and wound care where necessary", "Appropriate splinting and hand elevation", "Early protected mobilisation"],
        narration: "Management follows the general principles of fracture treatment. These include resuscitation when necessary, reduction, retention, regeneration and rehabilitation. Important aspects of management include pain control, wound care where necessary, appropriate splinting, hand elevation and early protected mobilisation.",
      },
      {
        label: "Rotational alignment", layout: "bullets",
        items: ["Ask the patient to flex the fingers", "The fingertips should converge towards the scaphoid tubercle", "Overlapping or crossing fingers suggest rotational malalignment"],
        narration: "One particularly important clinical principle is rotational alignment. When the patient flexes the fingers, the fingertips should normally converge towards the scaphoid tubercle. Any overlapping or abnormal crossing of the fingers may indicate rotational malalignment.",
      },
      {
        label: "Why alignment matters", layout: "bullets",
        items: ["Malrotation can significantly impair hand function", "It may be missed on plain radiographs", "Always assess finger alignment clinically"],
        note: "The goal: functional movement, grip and dexterity, not only bone union.",
        narration: "This is important because malrotation can significantly impair hand function. It may also be missed on plain radiographs. Therefore, always assess finger alignment clinically. Remember, the goal of treating hand injuries is not simply to achieve bone union, but to restore functional movement, grip and dexterity.",
      },
    ],
  },
  /* ---------------- SESSION 9 ---------------- */
  {
    title: "Upper limb 9: Paediatric fractures and Salter-Harris",
    fileName: "upper-limb-9-paediatric.mp4",
    button: "Make session 9 video",
    stages: [
      {
        label: "Paediatric fractures", layout: "title", sub: "Session 9",
        narration: "Welcome to our final session on fractures and dislocations of the upper limb. In this session, we will focus on paediatric fractures.",
      },
      {
        label: "Children's bones are different", layout: "bullets",
        items: ["Thicker periosteum", "Good blood supply", "Open growth plates", "Greater remodelling potential"],
        narration: "Children's bones behave differently from adult bones because they have a thicker periosteum, good blood supply, open growth plates and greater remodelling potential.",
      },
      {
        label: "Common paediatric fractures", layout: "bullets",
        items: ["Supracondylar", "Greenstick", "Torus", "Lateral condyle", "Physeal (growth plate)"],
        narration: "Common paediatric fractures include supracondylar fractures, greenstick fractures, torus fractures, lateral condyle fractures and physeal fractures.",
      },
      {
        label: "Think of non-accidental injury", layout: "bullets",
        items: ["Is the injury pattern consistent with the history?", "Is it consistent with the child's developmental stage?", "Is it consistent with the mechanism described?"],
        narration: "An important consideration when assessing a child with fractures is the possibility of non-accidental injury. Always consider whether the injury pattern and the history are consistent with the child's developmental stage and the mechanism described.",
      },
      {
        label: "Salter-Harris classification", layout: "letters",
        letters: [
          { l: "I", w: "Straight across", d: "Through the physis only" },
          { l: "II", w: "Above", d: "Physis and metaphysis" },
          { l: "III", w: "Lower", d: "Physis and epiphysis" },
          { l: "IV", w: "Through", d: "Metaphysis, physis and epiphysis" },
          { l: "V", w: "cRush", d: "Crush of the physis: worst prognosis" },
        ],
        narration: "Now, let's discuss the Salter-Harris classification. This classification describes fractures involving the growth plate, also known as the physis. There are five major types. Type One: The fracture passes through the physis only. Remember: Straight across. Type Two: The fracture passes through the physis and extends into the metaphysis. Remember: Above. Type Three: The fracture passes through the physis and extends into the epiphysis. Remember: Lower. Type Four: The fracture passes through the metaphysis, physis and epiphysis. Remember: Through. Type Five: This is a crush injury to the physis. It has the worst prognosis and the highest risk of growth arrest.",
      },
      {
        label: "Salter-Harris: SALTR", layout: "sh",
        narration: "A useful mnemonic is SALTR: S stands for Straight across. A stands for Above. L stands for Lower. T stands for Through. R stands for cRush. Remember that Type Five injuries may initially be difficult to recognise on X-rays, but can later present with growth disturbance.",
      },
    ],
  },
  /* ---------------- FINAL REVISION ---------------- */
  {
    title: "Upper limb: Final exam revision",
    fileName: "upper-limb-final-revision.mp4",
    button: "Make revision video",
    stages: [
      {
        label: "Final exam revision", layout: "title", sub: "Upper-limb fractures and dislocations",
        narration: "Before we conclude, let's quickly revise the most important examination points.",
      },
      {
        label: "Shoulder and humerus", layout: "table",
        rows: [["Clavicle fracture", "Commonest site: middle third"], ["Shoulder dislocation", "Most common: anterior"], ["Shoulder dislocation", "Nerve at risk: axillary"], ["Humeral shaft fracture", "Nerve at risk: radial"]],
        narration: "The commonest site of clavicle fracture is the middle third. The most common shoulder dislocation is anterior. The nerve most commonly at risk in shoulder dislocation is the axillary nerve. The nerve most at risk in humeral shaft fracture is the radial nerve.",
      },
      {
        label: "Elbow and forearm", layout: "table",
        rows: [["Elbow dislocation", "Commonest direction: posterior"], ["Terrible triad", "Dislocation, radial head fracture, coronoid fracture"], ["Galeazzi", "Radial shaft fracture with distal radioulnar joint disruption"], ["Monteggia", "Ulna fracture with radial head dislocation"]],
        narration: "The commonest direction of elbow dislocation is posterior. The terrible triad consists of elbow dislocation, radial head fracture and coronoid fracture. Galeazzi is radial shaft fracture with distal radioulnar joint disruption. Monteggia is ulna fracture with radial head dislocation.",
      },
      {
        label: "Wrist deformities", layout: "table",
        rows: [["Colles fracture", "Dinner-fork deformity"], ["Smith fracture", "Garden-spade deformity"]],
        narration: "Colles fracture produces a dinner-fork deformity. Smith fracture produces a garden-spade deformity.",
      },
      {
        label: "Emergencies and growth plate", layout: "table",
        rows: [["Compartment syndrome: earliest signs", "Pain out of proportion; pain on passive stretch"], ["Compartment syndrome: treatment", "Fasciotomy"], ["Salter-Harris", "Type 5 has the worst prognosis"]],
        narration: "The earliest important warning signs of compartment syndrome are pain out of proportion and pain on passive stretch. The definitive emergency treatment of compartment syndrome is fasciotomy. Salter-Harris Type Five has the worst prognosis.",
      },
      {
        label: "The Five Rs", layout: "letters",
        letters: [{ l: "1", w: "Resuscitation" }, { l: "2", w: "Reduction" }, { l: "3", w: "Retention" }, { l: "4", w: "Regeneration" }, { l: "5", w: "Rehabilitation" }],
        narration: "Remember the Five Rs of fracture management: Resuscitation, Reduction, Retention, Regeneration and Rehabilitation.",
      },
      {
        label: "LARA", layout: "letters",
        letters: [{ l: "L", w: "Length" }, { l: "A", w: "Alignment" }, { l: "R", w: "Rotation" }, { l: "A", w: "Apposition" }],
        note: "Keep studying, keep practising and keep building your clinical confidence.",
        narration: "And finally, remember LARA: Length, Alignment, Rotation and Apposition. Thank you for learning with Faith and Focus Academy. Keep studying, keep practising and keep building your clinical confidence. See you in the next lesson!",
      },
    ],
  },
];
