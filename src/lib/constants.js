// ── COLORS ────────────────────────────────────────────────────────────────────
export const C = {
  bg:       '#08090a',
  paper:    '#0f1012',
  card:     '#161820',
  border:   '#272830',
  border2:  '#3a3d4a',
  cream:    '#e8e0cc',
  muted:    '#707080',
  dim:      '#20222a',
  gold:     '#d4a84b',
  goldDim:  '#6a5018',
  green:    '#3db870',
  greenBg:  '#0a1f0e',
  greenBdr: '#1a5028',
  red:      '#e05050',
  redBg:    '#1a0808',
  blue:     '#4a9edd',
};

// ── FONT SIZES ─────────────────────────────────────────────────────────────────
export const F = {
  xs:  '14px',   // was 13 — labels, badges, fine print
  sm:  '15px',   // was 14 — secondary text, meta
  md:  '17px',   // was 16 — clue body text, main readable content
  lg:  '18px',   // was 17 — clue headings, buttons
  xl:  '20px',   // was 18 — tier labels, prominent UI
  xxl: '24px',   // was 22 — screen titles
  h1:  '36px',   // was 34 — case title on level select
};

// ── TIER CONFIG ────────────────────────────────────────────────────────────────
export const TIER_META = {
  rookie: {
    id: 'rookie', label: 'Rookie', stars: 1,
    color: '#5ba060', timerSeconds: 600,
    description: '3 variables · Clean red herring · Clear clue trail',
  },
  detective: {
    id: 'detective', label: 'Detective', stars: 2,
    color: '#d4a84b', timerSeconds: 600,
    description: '4 variables · Ambiguous clues · Misleading witness',
  },
  inspector: {
    id: 'inspector', label: 'Inspector', stars: 3,
    color: '#e07040', timerSeconds: 480,
    description: '5 variables · Decoy testimony · 8 minutes only',
  },
};

// ── SCORING ────────────────────────────────────────────────────────────────────
export const RANK = [
  { min: 80, icon: '🏆', label: 'Beyond Doubt' },
  { min: 50, icon: '🥈', label: 'Probable Cause' },
  { min: 0,  icon: '🥉', label: 'Reasonable Doubt' },
];

export const TIER_DOTS = {
  rookie: '🟢', detective: '🟡', inspector: '🟠',
};
