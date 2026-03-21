// Last Order — Case #004 — Rosie's All-Night Diner
// Used when no daily case file exists for today.

export const CASE_BASE = {
  title:   'Last Order',
  caseNum: 'Case #004',
  emoji:   '🍳',
  setting: "Rosie's All-Night Diner · Nashville, Tennessee · 2024",
  flavor:  "Regular customer Frank Dellano never made it through his Tuesday morning coffee. By the time the ambulance arrived, Rosie's was back to business. Someone at that diner made sure of it.",
  tagline: 'Your daily ten minute mystery',
  theme:   { accent: '#d4a84b', accentDim: '#6a5018', bg: '#08090a' },
};

const ROOKIE = {
  ...CASE_BASE,
  id: 'rookie', tier: 'rookie', label: 'Rookie', stars: 1,
  color: '#5ba060', timerSeconds: 600,
  description: '3 variables · Clean red herring · Clear clue trail',
  solution: { suspect: 'Vera Kowalski', method: 'Antifreeze in Coffee', location: 'The Lunch Counter' },
  epilogue: "Vera broke down when the toxicology report came back. Frank had been blackmailing her for two years — he'd seen her pocket cash from the register and kept quiet for free meals and silence money. When she found out he'd been recording their conversations, she snapped. She added ethylene glycol to the carafe she knew he always ordered from. Vera was the only one who knew Frank sat at the counter every Tuesday at 6am.",
  categories: [
    { key: 'suspect', label: 'Suspect', icon: '🎭', items: [
      { name: 'Vera Kowalski', icon: '☕', detail: "Waitress. 14 years at Rosie's. Opens every Tuesday." },
      { name: 'Hank Morrow',   icon: '🍳', detail: 'Short-order cook. Feud with Frank over parking.' },
      { name: 'Dale Simmons',  icon: '🪑', detail: 'Booth regular. Frank owed him money.' },
      { name: 'Lori Tate',     icon: '📋', detail: 'Manager. Rumored to be skimming the register.' },
    ]},
    { key: 'method', label: 'Method', icon: '⚗️', items: [
      { name: 'Antifreeze in Coffee', icon: '🧪', detail: 'Ethylene glycol. Sweet-tasting, odorless. Lethal in small doses.' },
      { name: 'Poison in Food',       icon: '🍽️', detail: 'Would affect anyone who ordered the same dish.' },
      { name: 'Medication Overdose',  icon: '💊', detail: "No drugs found in Frank's possession." },
      { name: 'Allergic Reaction',    icon: '🌿', detail: 'No known allergies on file.' },
    ]},
    { key: 'location', label: 'Where Tampered', icon: '📍', items: [
      { name: 'The Lunch Counter', icon: '🪑', detail: "Frank's regular seat. Carafe brought directly to him." },
      { name: 'The Kitchen',       icon: '🍳', detail: 'Cook prep area. Multiple people have access.' },
      { name: 'The Storage Room',  icon: '📦', detail: 'Locked. Manager key only.' },
      { name: 'The Parking Lot',   icon: '🚗', detail: "Frank arrived alone. Bag never left his sight." },
    ]},
  ],
  clues: [
    { id: 'R1', type: 'physical', icon: '🔬', heading: "Coroner's Report",
      text: '"Cause of death: ethylene glycol poisoning. Absorbed through a beverage — concentration too high for food."',
      alone: "The poison was in something Frank drank. Large dose. Not accidental.",
      links: [{ with: 'R4', insight: "The coroner confirms poison in a beverage. Frank's coffee carafe tested positive for ethylene glycol at lethal concentration. Everything else on the table was clean." }] },
    { id: 'R2', type: 'witness', icon: '👁️', heading: 'Booth Customer — Gary Pruitt',
      text: '"Vera brought Frank his coffee before he even sat down. She had it waiting. That\'s not how it works here — you flag her down."',
      alone: "Vera pre-prepared Frank's coffee before he arrived. That's unusual.",
      links: [{ with: 'R5', insight: "Vera had his coffee waiting before he sat down — and phone records show Frank called her the night before threatening to go to the owner. She knew exactly when he was coming." }] },
    { id: 'R3', type: 'testimony', icon: '💬', heading: 'Hank Morrow — Cook',
      text: '"I never touched the coffee. That\'s all Vera. Counter service is her station — I don\'t leave the grill."',
      alone: "Hank had no access to Frank's coffee. Counter prep belongs entirely to the waitress.",
      links: [{ with: 'R6', insight: "Hank had no access to the counter carafe. The storage log shows antifreeze signed out by Vera two days prior with no legitimate reason." }] },
    { id: 'R4', type: 'physical', icon: '☕', heading: 'Lab Test — Coffee Carafe',
      text: '"Carafe #3 — the lunch counter carafe used Tuesday morning — tested positive for ethylene glycol. All others were clean."',
      alone: "Only one carafe was tampered with. Frank's. Targeted and deliberate.",
      links: [{ with: 'R1', insight: "The coroner confirms poison in a beverage. Frank's coffee carafe tested positive for ethylene glycol at lethal concentration. Everything else on the table was clean." }] },
    { id: 'R5', type: 'document', icon: '📱', heading: 'Phone Records — Frank Dellano',
      text: '"Frank called Vera at 11:22pm the night before his death. Four minutes. Vera told investigators she didn\'t remember the call."',
      alone: "Frank contacted Vera hours before he died. She denied it. That's a lie.",
      links: [{ with: 'R2', insight: "Vera had his coffee waiting before he sat down — and phone records show Frank called her the night before threatening to go to the owner. She knew exactly when he was coming." }] },
    { id: 'R6', type: 'document', icon: '📋', heading: 'Storage Room Log',
      text: '"Antifreeze checked out two days prior. Listed reason: \'equipment maintenance.\' Signed: V. Kowalski. No maintenance was scheduled."',
      alone: "Vera removed antifreeze from storage with no legitimate reason.",
      links: [{ with: 'R3', insight: "Hank had no access to the counter carafe. The storage log shows antifreeze signed out by Vera two days prior with no legitimate reason." }] },
  ],
};

export const FALLBACK_TIERS = {
  rookie:    ROOKIE,
  detective: { ...ROOKIE, id: 'detective', tier: 'detective', label: 'Detective', stars: 2, color: '#d4a84b', timerSeconds: 600, description: '4 variables · Ambiguous clues · Misleading witness' },
  inspector: { ...ROOKIE, id: 'inspector', tier: 'inspector', label: 'Inspector', stars: 3, color: '#e07040', timerSeconds: 480, description: '5 variables · Decoy testimony · 8 minutes only' },
};
