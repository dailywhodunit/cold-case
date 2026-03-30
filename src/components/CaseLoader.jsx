import { useState, useEffect } from 'react';
import { buildTiersFromCase } from '../lib/normalize.js';
import { getTodayString, getUrlDate } from '../lib/storage.js';
import { FALLBACK_TIERS } from '../data/fallback.js';

// Generate a list of candidate past dates to try as fallback
// Goes back up to 60 days, shuffled so we get a random past case
function getPastDateCandidates(todayStr, count = 10) {
  const today = new Date(todayStr + 'T12:00:00Z');
  const candidates = [];
  for (let i = 1; i <= 60; i++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const str = d.toISOString().split('T')[0];
    candidates.push(str);
  }
  // Shuffle
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, count);
}

// Try fetching a case for each candidate date, return first success
async function fetchRandomPastCase(todayStr) {
  const candidates = getPastDateCandidates(todayStr, 12);
  for (const date of candidates) {
    try {
      const res = await fetch(`/cases/${date}.json`);
      if (res.ok) {
        const data = await res.json();
        console.log('[Whodunit] Random past case loaded:', date, data.title || data.rookie?.title);
        return { data, date };
      }
    } catch (e) {
      // continue to next candidate
    }
  }
  return null;
}

export default function CaseLoader({ onReady }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const urlDate = getUrlDate();
    const date = urlDate || getTodayString();
    const isArchive = !!urlDate;
    console.log('[Whodunit] Loading case for:', date, isArchive ? '(archive)' : '(today)');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    fetch(`/cases/${date}.json`, { signal: controller.signal })
      .then(res => {
        clearTimeout(timer);
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then(data => {
        console.log('[Whodunit] Loaded:', data.title || data.rookie?.title || 'bundle');
        finalize(data, date);
      })
      .catch(async e => {
        clearTimeout(timer);
        console.log('[Whodunit] Today\'s case not found:', e.message);

        // Only try random past case for today (not archive requests)
        if (!isArchive) {
          console.log('[Whodunit] Trying random past case...');
          const past = await fetchRandomPastCase(date);
          if (past) {
            console.log('[Whodunit] Using past case:', past.date);
            finalize(past.data, past.date, true);
            return;
          }
        }

        // Final fallback: hardcoded Last Order
        console.log('[Whodunit] Using hardcoded fallback');
        setStatus('ready');
        onReady(FALLBACK_TIERS, date);
      });

    function finalize(data, resolvedDate, isPastFallback = false) {
      const tiers = buildTiersFromCase(data, FALLBACK_TIERS);
      const activeCase = tiers.rookie || tiers.detective || tiers.inspector;
      if (activeCase?.title) {
        const suffix = isPastFallback ? ' — Daily Whodunit (Archive)' : ' — Daily Whodunit';
        document.title = `${activeCase.title}${suffix}`;
        const desc = isPastFallback
          ? `${activeCase.caseNum} · ${activeCase.setting} · Today's case will return tomorrow!`
          : `${activeCase.caseNum} · ${activeCase.setting} · Can you solve it in 10 minutes?`;
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${activeCase.title}${suffix}`);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
        document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `${activeCase.title}${suffix}`);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', desc);
        document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
      }
      setStatus('ready');
      onReady(tiers, resolvedDate, isPastFallback);
    }
  }, []);

  if (status === 'loading') {
    return (
      <div style={{ minHeight: '100vh', background: '#08090a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 24, color: '#d4a84b', marginBottom: 12 }}>🔍</div>
          <div style={{ fontFamily: 'Georgia,serif', fontSize: 16, color: '#6a5018', letterSpacing: '0.1em' }}>
            Opening the case file...
          </div>
        </div>
      </div>
    );
  }

  return null;
}
