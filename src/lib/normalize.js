import { TIER_META } from './constants.js';

// ── ITEM NORMALIZER ────────────────────────────────────────────────────────────
function normItem(item) {
  if (!item) return { name: '', icon: '', detail: '' };
  if (Array.isArray(item)) return {
    name: String(item[0] || ''),
    icon: String(item[1] || ''),
    detail: String(item[2] || ''),
  };
  if (typeof item === 'string') return { name: item, icon: '', detail: '' };
  return {
    name:   item.name   || item.title  || item.label || item.value || '',
    icon:   item.icon   || item.emoji  || '',
    detail: item.detail || item.description || item.role || item.hint || '',
  };
}

// ── CATEGORIES NORMALIZER ──────────────────────────────────────────────────────
function normCategories(raw) {
  if (!raw) return [];

  // Object format: { suspects: { name, ...items }, locations: { ... } }
  if (!Array.isArray(raw) && typeof raw === 'object') {
    return Object.keys(raw).map(catKey => {
      const catObj = raw[catKey];
      if (!catObj || typeof catObj !== 'object') return null;
      const items = [];
      Object.keys(catObj).forEach(ik => {
        if (['name','label','icon','emoji','detail','description'].includes(ik)) return;
        const v = catObj[ik];
        if (v && typeof v === 'object' && !Array.isArray(v)) items.push(normItem(v));
        else if (typeof v === 'string') items.push({ name: v, icon: '', detail: '' });
      });
      if (!items.length) {
        (catObj.items || catObj.options || catObj.choices || []).forEach(i => items.push(normItem(i)));
      }
      return {
        key:   catKey,
        label: catObj.name || catObj.label || catKey,
        icon:  catObj.icon || catObj.emoji || '',
        items,
      };
    }).filter(Boolean);
  }

  // Array format (expected)
  return raw.map(cat => {
    if (!cat) return null;
    if (Array.isArray(cat)) return {
      key: cat[0] || '', label: cat[1] || '', icon: cat[2] || '',
      items: (cat[3] || []).map(normItem),
    };
    const items = (cat.items || cat.options || cat.choices || []).map(normItem);
    return {
      key:   cat.key   || cat.id    || cat.type || '',
      label: cat.label || cat.title || cat.name || cat.key || '',
      icon:  cat.icon  || cat.emoji || '',
      items,
    };
  }).filter(Boolean);
}

// ── CLUES NORMALIZER ───────────────────────────────────────────────────────────
function normClues(raw) {
  if (!raw) return [];
  const list = Array.isArray(raw) ? raw : Object.values(raw);
  return list.map(cl => {
    if (!cl) return null;
    if (Array.isArray(cl)) return {
      id: cl[0]||'', type: cl[1]||'document', icon: cl[2]||'📋',
      heading: cl[3]||'', text: cl[4]||'', alone: cl[5]||'', links: cl[6]||[],
    };
    const links = (cl.links || cl.connections || cl.pairs || []).map(l => {
      if (typeof l === 'string') return { with: l, insight: '' };
      return { with: l.with || l.id || l.clue || '', insight: l.insight || l.combined || l.reveal || '' };
    });
    return {
      id:      cl.id      || cl.clueId  || '',
      type:    cl.type    || cl.clueType || 'document',
      icon:    cl.icon    || cl.emoji   || '📋',
      heading: cl.heading || cl.title   || cl.source || cl.name || '',
      text:    cl.text    || cl.content || cl.clue   || '',
      alone:   cl.alone   || cl.hint    || cl.interpretation || '',
      links,
    };
  }).filter(Boolean);
}

// ── SOLUTION NORMALIZER ────────────────────────────────────────────────────────
function normSolution(raw, cats) {
  if (!raw || typeof raw !== 'object') return {};
  const sol = { ...raw };

  // Alias map: AI sometimes uses different key names
  const aliases = {
    killer: 'suspect', murderer: 'suspect', culprit: 'suspect',
    weapon: 'method',  cause: 'method',     evidence: 'method', means: 'method',
    place:  'location', where: 'location',  room: 'location',   scene: 'location',
    time:   'window',  when: 'window',
    why:    'motive',  reason: 'motive',
  };
  Object.keys(aliases).forEach(ak => {
    if (sol[ak] !== undefined && sol[aliases[ak]] === undefined) {
      sol[aliases[ak]] = sol[ak];
    }
  });

  // Align with actual category keys (singular/plural)
  cats.forEach(cat => {
    if (sol[cat.key] === undefined) {
      if (sol[cat.key + 's'] !== undefined) sol[cat.key] = sol[cat.key + 's'];
      else if (cat.key.endsWith('s') && sol[cat.key.slice(0, -1)] !== undefined) {
        sol[cat.key] = sol[cat.key.slice(0, -1)];
      }
    }
  });

  return sol;
}

// ── SINGLE TIER NORMALIZER ─────────────────────────────────────────────────────
export function normalizeTier(d) {
  if (!d) return null;
  const tier  = d.tier || 'rookie';
  const meta  = TIER_META[tier] || TIER_META.rookie;
  const cats  = normCategories(d.categories || []);
  const clues = normClues(d.clues || []);
  const sol   = normSolution(d.solution || {}, cats);
  const flavor = d.flavor || d.description || d.intro || d.premise || d.flavorText || d.synopsis || '';

  // Robust setting split — handles · - — separators
  // Setting: try multiple field names the AI might use
  const rawSetting = d.setting || d.location || d.place || d.venue || d.where
    || d.settingDescription || d.scene || d.backdrop || '';
  const settingFirst = (rawSetting).split(/\s[·\-—,]\s|\s-\s/)[0] || rawSetting || 'The scene';

  return {
    ...meta,
    id:            tier,
    tier,
    schemaVersion: d.schemaVersion || '1.0',
    caseNum:       d.caseNum || d.caseNumber || d.case_num || '',
    title:         d.title  || '',
    emoji:         d.emoji  || d.icon || d.caseEmoji || '🔍',
    setting:       rawSetting,
    settingFirst,
    flavor,
    epilogue:      d.epilogue || '',
    timerSeconds:  d.timerSeconds || meta.timerSeconds,
    timeoutText:   d.timeoutText  || null,
    emptyState:    d.emptyState   || null,
    theme:         d.theme || { accent: '#d4a84b', accentDim: '#6a5018', bg: '#08090a' },
    solution:      sol,
    categories:    cats,
    clues,
    tagline:       'Your daily ten minute mystery',
  };
}

// ── BUNDLE → TIERS MAP ─────────────────────────────────────────────────────────
export function buildTiersFromCase(caseJson, fallback) {
  const tierKeys = ['rookie', 'detective', 'inspector'];

  // Array of tiers
  if (Array.isArray(caseJson)) {
    const built = {};
    caseJson.forEach(item => {
      const norm = normalizeTier(item);
      if (norm) built[norm.id] = norm;
    });
    if (Object.keys(built).length) return { ...fallback, ...built };
  }

  // Object with tier keys: { rookie: {...}, detective: {...}, inspector: {...} }
  if (caseJson.rookie || caseJson.detective || caseJson.inspector) {
    const built = {};
    tierKeys.forEach(k => {
      if (caseJson[k]) {
        const norm = normalizeTier(caseJson[k]);
        if (norm) built[k] = norm;
      }
    });
    if (Object.keys(built).length) return { ...fallback, ...built };
  }

  // Single tier — only replace that tier, keep fallback for others
  const norm = normalizeTier(caseJson);
  if (!norm) return fallback;
  return { ...fallback, [norm.id]: norm };
}
