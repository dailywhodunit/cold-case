import { useState } from 'react';
import CaseLoader from './components/CaseLoader.jsx';
import LevelSelect from './components/LevelSelect.jsx';
import GameScreen from './components/GameScreen.jsx';
import SolvedScreen from './components/SolvedScreen.jsx';
import TimeoutScreen from './components/TimeoutScreen.jsx';
import AlreadyPlayed from './components/AlreadyPlayed.jsx';
import { FALLBACK_TIERS } from './data/fallback.js';
import { calcScore, getRank, buildShareText } from './lib/scoring.js';
import { saveResult, loadResult, getTodayString, getUrlDate } from './lib/storage.js';
import {
  trackGameStarted, trackGameCompleted, trackGameTimeout,
  trackShareClicked, trackPracticeStarted, trackArchivePlay,
} from './lib/analytics.js';

const GLOBAL_STYLE = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #08090a; }
  button:focus { outline: none; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: #272830; border-radius: 2px; }
`;

export default function App() {
  const [screen,   setScreen]   = useState('loading');
  const [tiers,    setTiers]    = useState(FALLBACK_TIERS);
  const [tierId,   setTierId]   = useState(null);
  const [result,   setResult]   = useState(null);
  const [savedRes, setSavedRes] = useState(null);
  const [practice, setPractice] = useState(false);

  const realToday = getTodayString();
  const urlDate   = getUrlDate();
  const isArchive = urlDate && urlDate !== realToday;

  // Called by CaseLoader when fetch completes
  const handleCaseReady = (loadedTiers, date) => {
    setTiers(loadedTiers);
    // Check already-played only for today's actual date (not archive replays)
    if (!practice && !isArchive) {
      const saved = loadResult(realToday);
      if (saved) {
        setSavedRes(saved);
        setScreen('already');
        return;
      }
    }
    setScreen('level');
  };

  const handleSelect = (id) => {
    setTierId(id);
    setScreen('game');
    const caseData = tiers[id];
    trackGameStarted({
      caseNum:   caseData?.caseNum || '',
      caseTitle: caseData?.title   || '',
      tier:      id,
      date:      urlDate || realToday,
      practice,
    });
    if (urlDate && urlDate !== realToday) {
      trackArchivePlay({ date: urlDate, caseNum: caseData?.caseNum || '' });
    }
  };

  const handleSolve = (r) => {
    const caseData   = tiers[r.tierId];
    const timerSecs  = caseData.timerSeconds || 600;
    const totalInsights = caseData.clues.reduce((n, c) => n + (c.links?.length || 0), 0) / 2;
    const score      = calcScore({ timeRemaining: r.timeRemaining, timerSeconds: timerSecs, wrongCount: r.wrongCount, hintsUsed: r.hintsUsed });
    const rank       = getRank(score);

    const timeUsed = timerSecs - r.timeRemaining;
    const mm = String(Math.floor(timeUsed / 60)).padStart(2, '0');
    const ss = String(timeUsed % 60).padStart(2, '0');

    const shareText = buildShareText({
      caseData, tierId: r.tierId, score, rank,
      timeRemaining: r.timeRemaining, timerSeconds: timerSecs,
      foundInsights: r.foundInsights, totalInsights: Math.round(totalInsights),
      wrongCount: r.wrongCount, hintsUsed: r.hintsUsed || 0,
    });

    const saveData = {
      score, rankIcon: rank.icon, rankLabel: rank.label,
      tierLabel: caseData.label, tierId: r.tierId,
      timeStr: `${mm}:${ss}`,
      foundInsights: r.foundInsights,
      totalInsights: Math.round(totalInsights),
      wrongCount: r.wrongCount,
      hintsUsed: r.hintsUsed || 0,
      shareText,
      caseTitle: caseData.title,
      caseNum:   caseData.caseNum,
      date:      realToday,
    };

    trackGameCompleted({
      caseNum:       caseData.caseNum || '',
      caseTitle:     caseData.title   || '',
      tier:          r.tierId,
      score,
      rank:          rank.label,
      timeRemaining: r.timeRemaining,
      timerSeconds:  timerSecs,
      wrongCount:    r.wrongCount,
      hintsUsed:     r.hintsUsed || 0,
      foundInsights: r.foundInsights,
      practice,
    });
    setResult({ ...r, score, rank, shareText, caseData });
    if (!practice) {
      saveResult(realToday, saveData);
      setSavedRes(saveData);
    }
    setScreen('solved');
  };

  const handleReset = () => {
    setPractice(false);
    if (!practice) {
      const saved = loadResult(realToday);
      if (saved && !isArchive) {
        setSavedRes(saved);
        setScreen('already');
        return;
      }
    }
    setScreen('level');
  };

  const handlePractice = () => {
    setPractice(true);
    setScreen('level');
    const caseData = tiers.rookie || tiers.detective || tiers.inspector;
    trackPracticeStarted({
      caseNum: caseData?.caseNum || '',
      tier:    'all',
      date:    realToday,
    });
  };

  return (
    <>
      <style>{GLOBAL_STYLE}</style>

      {isPastFallback && screen !== 'loading' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#1a1200', borderBottom: '1px solid #6a5018',
          padding: '8px 16px', textAlign: 'center',
          fontFamily: 'system-ui,sans-serif', fontSize: '13px', color: '#d4a84b',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <span>📁</span>
          <span>Today's case is on its way — in the meantime, here's a case from the archive.</span>
        </div>
      )}

      {screen === 'loading' && (
        <CaseLoader onReady={handleCaseReady} />
      )}
      {screen === 'already' && savedRes && (
        <AlreadyPlayed savedResult={savedRes} onPractice={handlePractice} />
      )}
      {screen === 'level' && (
        <LevelSelect tiers={tiers} onSelect={handleSelect} practice={practice} />
      )}
      {screen === 'game' && tierId && (
        <GameScreen
          caseData={tiers[tierId]}
          tierId={tierId}
          tiers={tiers}
          onSolve={handleSolve}
          onTimeout={() => {
          const cd = tiers[tierId];
          trackGameTimeout({
            caseNum:      cd?.caseNum || '',
            tier:         tierId,
            hintsUsed:    0,
            wrongCount:   0,
            cluesRevealed: 0,
          });
          setScreen('timeout');
        }}
          onReset={handleReset}
          practice={practice}
        />
      )}
      {screen === 'timeout' && tierId && (
        <TimeoutScreen caseData={tiers[tierId]} onReset={handleReset} />
      )}
      {screen === 'solved' && result && (
        <SolvedScreen result={result} onReset={handleReset} />
      )}
    </>
  );
}
