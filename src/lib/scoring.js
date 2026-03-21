import { RANK, TIER_DOTS } from './constants.js';

export function calcScore({ timeRemaining, timerSeconds, wrongCount, hintsUsed }) {
  return Math.max(0, Math.round(
    (timeRemaining / timerSeconds) * 100
    - wrongCount * 15
    - (hintsUsed || 0) * 5
  ));
}

export function getRank(score) {
  return RANK.find(r => score >= r.min) || RANK[RANK.length - 1];
}

export function buildShareText({ caseData, tierId, score, rank, timeRemaining, timerSeconds, foundInsights, totalInsights, wrongCount, hintsUsed }) {
  const timeUsed = timerSeconds - timeRemaining;
  const mm = String(Math.floor(timeUsed / 60)).padStart(2, '0');
  const ss = String(timeUsed % 60).padStart(2, '0');

  const tierDot   = TIER_DOTS[tierId] || '🟢';
  const insightRow = Array(Math.round(totalInsights)).fill(0)
    .map((_, i) => i < foundInsights ? '💡' : '⬛').join('');
  const wrongStr  = wrongCount  > 0 ? ' ❌'.repeat(Math.min(wrongCount, 3))  : '';
  const hintStr   = hintsUsed   > 0 ? ' 🔦'.repeat(Math.min(hintsUsed, 3))  : '';

  return [
    '🔍 Daily Whodunit',
    `${caseData.caseNum} · ${caseData.title}`,
    '',
    `${rank.icon} ${rank.label}`,
    `${tierDot} ${caseData.label} · ${score} pts`,
    '',
    `⏱️ ${mm}:${ss}${wrongStr}${hintStr}`,
    insightRow,
    '',
    'thedailywhodunit.com',
  ].join('\n');
}
