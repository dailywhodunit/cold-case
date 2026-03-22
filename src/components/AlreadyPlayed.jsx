import { useState } from 'react';
import { C, F } from '../lib/constants.js';
import { trackShareClicked } from '../lib/analytics.js';

export default function AlreadyPlayed({ savedResult, onPractice }) {
  const [copied, setCopied] = useState(false);
  const {
    score, rankIcon, rankLabel, tierLabel, tierId,
    timeStr, foundInsights, totalInsights,
    wrongCount, hintsUsed, shareText,
    caseTitle, caseNum, date,
  } = savedResult;

  const tierColor = tierId === 'rookie' ? '#3db870' : tierId === 'detective' ? '#d4a84b' : '#e07040';

  const copy = () => {
    trackShareClicked({ method: 'copy', caseNum: caseNum||'', tier: tierId||'', score: score||0, rank: rankLabel||'' });
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sms = () => {
    const encoded = encodeURIComponent(shareText);
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      trackShareClicked({ method: 'text', caseNum: caseNum||'', tier: tierId||'', score: score||0, rank: rankLabel||'' });
      window.location.href = `sms:?&body=${encoded}`;
    } else {
      copy();
    }
  };

  const share = () => {
    if (navigator.share) {
      trackShareClicked({ method: 'share', caseNum: caseNum||'', tier: tierId||'', score: score||0, rank: rankLabel||'' });
      navigator.share({ text: shareText }).catch(() => {});
    } else {
      copy();
    }
  };

  const stats = [
    { icon: '⏱️', label: 'Time',     val: timeStr },
    { icon: '💡', label: 'Insights', val: `${foundInsights}/${totalInsights}` },
    { icon: '❌', label: 'Wrong',    val: String(wrongCount) },
    { icon: '🔦', label: 'Hints',    val: String(hintsUsed) },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#08090a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
      <div style={{ maxWidth: 420, width: '100%', position: 'relative', zIndex: 10 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🔍</div>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6a5018', fontFamily: 'system-ui,sans-serif', marginBottom: 6 }}>
            Daily Whodunit · {caseNum}
          </div>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: C.cream, margin: '0 0 4px' }}>
            {caseTitle}
          </h2>
          <div style={{ fontSize: 13, color: C.muted, fontFamily: 'system-ui,sans-serif' }}>
            You already cracked this one · {date}
          </div>
        </div>

        {/* Score card */}
        <div style={{ backgroundColor: '#0f1012', border: '1px solid #4a3a18', borderRadius: 14, padding: 18, marginBottom: 14 }}>
          <div style={{ textAlign: 'center', padding: '16px 0 14px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>{rankIcon}</div>
            <div style={{ fontFamily: 'Georgia,serif', fontSize: 22, fontWeight: 700, color: '#d4a84b' }}>{rankLabel}</div>
            <div style={{ fontSize: 13, color: tierColor, fontFamily: 'system-ui,sans-serif', marginTop: 3 }}>
              {tierLabel} · {score} pts
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, paddingTop: 14 }}>
            {stats.map(({ icon, label, val }) => (
              <div key={label} style={{ textAlign: 'center', padding: '10px 4px', backgroundColor: '#161820', borderRadius: 10, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.cream, fontFamily: 'Georgia,serif' }}>{val}</div>
                <div style={{ fontSize: 10, color: C.muted, fontFamily: 'system-ui,sans-serif', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Share */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
          {[
            { label: copied ? '✓ Copied!' : '📋 Copy', action: copy },
            { label: '💬 Text',  action: sms },
            { label: '🔗 Share', action: share },
          ].map(({ label, action }) => (
            <button key={label} onClick={action} style={{ flex: 1, padding: 13, backgroundColor: copied && label.includes('Copy') ? '#0a1f0e' : '#0e1808', border: `1px solid ${C.greenBdr}`, borderRadius: 10, color: C.green, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'system-ui,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {label}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, backgroundColor: C.border }}/>
          <div style={{ fontSize: 11, color: C.muted, fontFamily: 'system-ui,sans-serif', letterSpacing: '0.08em', textTransform: 'uppercase' }}>come back tomorrow</div>
          <div style={{ flex: 1, height: 1, backgroundColor: C.border }}/>
        </div>

        {/* Practice mode */}
        <button onClick={onPractice} style={{ width: '100%', padding: 13, backgroundColor: 'transparent', border: `1px solid ${C.border}`, borderRadius: 10, color: C.muted, fontSize: 14, cursor: 'pointer', fontFamily: 'system-ui,sans-serif', marginBottom: 10 }}>
          🎯 Practice Mode — replay without saving score
        </button>

        <div style={{ textAlign: 'center', fontSize: 11, color: '#2a2218', fontFamily: 'system-ui,sans-serif' }}>
          Your daily ten minute mystery · thedailywhodunit.com
        </div>
      </div>
    </div>
  );
}
