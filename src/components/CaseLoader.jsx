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
