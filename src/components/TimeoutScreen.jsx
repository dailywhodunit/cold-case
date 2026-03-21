import { C, F } from '../lib/constants.js';

export default function TimeoutScreen({ caseData, onReset }) {
  const timeoutMsg = caseData.timeoutText
    || `${caseData.settingFirst || caseData.setting}. The case goes cold.`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: caseData.theme.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ maxWidth: 380, width: '100%', textAlign: 'center', position: 'relative', zIndex: 10 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🚨</div>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: F.xxl, color: C.cream, margin: '0 0 12px' }}>Time's Up.</h2>
        <p style={{ color: C.muted, fontSize: F.md, fontFamily: 'system-ui,sans-serif', margin: '0 0 26px', lineHeight: 1.7 }}>
          {timeoutMsg}
        </p>

        <div style={{ backgroundColor: C.paper, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginBottom: 22, textAlign: 'left' }}>
          <div style={{ fontSize: F.sm, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 14, fontFamily: 'system-ui,sans-serif' }}>
            The Answer
          </div>
          {caseData.categories.map(cat => (
            <div key={cat.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: F.md, color: C.muted, fontFamily: 'system-ui,sans-serif' }}>{cat.icon} {cat.label}</span>
              <span style={{ fontSize: F.md, fontWeight: 700, color: caseData.theme.accent, fontFamily: 'Georgia,serif' }}>
                {caseData.solution[cat.key]}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onReset}
          style={{ width: '100%', padding: 16, background: 'linear-gradient(135deg,#2a1a08,#1a1005)', border: `1px solid ${caseData.theme.accent}`, borderRadius: 10, color: caseData.theme.accent, fontSize: F.lg, fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia,serif' }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
