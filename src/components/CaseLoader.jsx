import { useState, useEffect } from 'react';
import { buildTiersFromCase } from '../lib/normalize.js';
import { getTodayString, getUrlDate } from '../lib/storage.js';
import { FALLBACK_TIERS } from '../data/fallback.js';

export default function CaseLoader({ onReady }) {
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const urlDate = getUrlDate();
    const date = urlDate || getTodayString();
    console.log('[Whodunit] Loading case for:', date, urlDate ? '(archive)' : '(today)');

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
        const tiers = buildTiersFromCase(data, FALLBACK_TIERS);
        // Update page meta tags with today's case info
        const activeCase = tiers.rookie || tiers.detective || tiers.inspector;
        if (activeCase?.title) {
          document.title = `${activeCase.title} — Daily Whodunit`;
          const desc = `${activeCase.caseNum} · ${activeCase.setting} · Can you solve it in 10 minutes?`;
          document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${activeCase.title} — Daily Whodunit`);
          document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
          document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `${activeCase.title} — Daily Whodunit`);
          document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', desc);
          document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
        }
        setStatus('ready');
        onReady(tiers, date);
      })
      .catch(e => {
        clearTimeout(timer);
        console.log('[Whodunit] Fallback:', e.message);
        setStatus('ready');
        onReady(FALLBACK_TIERS, date);
      });
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
