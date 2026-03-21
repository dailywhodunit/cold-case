import { useState } from 'react';
import { C, F, TIER_META } from '../lib/constants.js';
import { CASE_BASE } from '../data/fallback.js';

export default function LevelSelect({ tiers, onSelect, practice }) {
  const [selected, setSelected] = useState(null);
  const active = tiers.rookie || tiers.detective || tiers.inspector || CASE_BASE;
  const theme  = active.theme || CASE_BASE.theme;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ maxWidth: 440, width: '100%' }}>

        {practice && (
          <div style={{ marginBottom: 14, padding: '8px 14px', backgroundColor: '#1a1208', border: '1px solid #6a4a10', borderRadius: 8, fontSize: 12, color: theme.accent, fontFamily: 'system-ui,sans-serif', textAlign: 'center' }}>
            🎯 Practice Mode — score won't be saved
          </div>
        )}

        {/* Eyebrow */}
        <div style={{ fontSize: F.sm, letterSpacing: '0.25em', textTransform: 'uppercase', color: theme.accentDim, fontFamily: 'system-ui,sans-serif', marginBottom: 10, textAlign: 'center' }}>
          Daily Whodunit · {active.caseNum || CASE_BASE.caseNum}
        </div>

        {/* Emoji divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right,transparent,${theme.accentDim})` }}/>
          <span style={{ fontSize: 36 }}>{active.emoji || CASE_BASE.emoji}</span>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to left,transparent,${theme.accentDim})` }}/>
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: 'Georgia,serif', fontSize: F.h1, fontWeight: 700, color: C.cream, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.1, textAlign: 'center' }}>
          {active.title || CASE_BASE.title}
        </h1>
        <p style={{ color: C.muted, fontSize: F.md, margin: '0 0 20px', fontFamily: 'system-ui,sans-serif', textAlign: 'center' }}>
          {active.setting || CASE_BASE.setting}
        </p>

        {/* Flavor */}
        <div style={{ backgroundColor: C.paper, border: `1px solid ${C.border}`, borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: F.md, color: '#a89e88', lineHeight: 1.9, fontFamily: 'Georgia,serif', fontStyle: 'italic' }}>
            {active.flavor || CASE_BASE.flavor}
          </p>
        </div>

        {/* Difficulty label */}
        <div style={{ fontSize: F.xs, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.muted, fontFamily: 'system-ui,sans-serif', marginBottom: 12, textAlign: 'center' }}>
          Choose Your Difficulty
        </div>

        {/* Tier buttons */}
        {['rookie', 'detective', 'inspector'].map(tierId => {
          const t = tiers[tierId] || TIER_META[tierId];
          const isSelected = selected === tierId;
          return (
            <button
              key={tierId}
              onClick={() => setSelected(tierId)}
              style={{
                width: '100%', padding: 18, marginBottom: 10,
                background: isSelected ? 'linear-gradient(135deg,#2a1a08,#1a1005)' : 'linear-gradient(135deg,#161820,#0f1012)',
                border: `2px solid ${isSelected ? t.color : C.border}`,
                borderRadius: 12, color: isSelected ? t.color : C.muted,
                fontSize: F.xl, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Georgia,serif', letterSpacing: '0.04em',
                transition: 'all 0.2s',
                boxShadow: isSelected ? `0 0 20px ${t.color}33` : 'none',
                textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: i < t.stars ? t.color : C.dim }}/>
                ))}
              </div>
              <div>
                <div>{t.label}</div>
                <div style={{ fontSize: F.sm, color: isSelected ? t.color : C.muted, fontWeight: 400, fontFamily: 'system-ui,sans-serif', marginTop: 2 }}>
                  {t.description}
                </div>
                {t.id === 'inspector' && (
                  <div style={{ display: 'inline-block', marginTop: 4, padding: '2px 7px', border: `1px solid ${isSelected ? t.color : C.border}`, borderRadius: 6, fontSize: F.xs, color: t.color, fontFamily: 'system-ui,sans-serif', fontWeight: 700 }}>
                    8 min
                  </div>
                )}
              </div>
            </button>
          );
        })}

        {/* Begin button */}
        <button
          onClick={() => selected && onSelect(selected)}
          disabled={!selected}
          style={{
            width: '100%', padding: 18, marginTop: 6,
            background: selected ? `linear-gradient(135deg,#2a1a08,#1a1005)` : C.dim,
            border: `1px solid ${selected ? (tiers[selected]?.color || theme.accent) : C.border}`,
            borderRadius: 12,
            color: selected ? (tiers[selected]?.color || theme.accent) : C.muted,
            fontSize: F.lg, fontWeight: 700, cursor: selected ? 'pointer' : 'default',
            fontFamily: 'Georgia,serif', letterSpacing: '0.04em',
            transition: 'all 0.2s',
          }}
        >
          {selected ? `Begin as ${tiers[selected]?.label || selected} →` : 'Select a difficulty'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 14, fontSize: F.xs, color: '#2a2218', fontFamily: 'system-ui,sans-serif' }}>
          {CASE_BASE.tagline} · thedailywhodunit.com
        </div>

      </div>
    </div>
  );
}
