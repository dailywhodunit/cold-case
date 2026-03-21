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
  };

  return (
    <>
      <style>{GLOBAL_STYLE}</style>

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
          onTimeout={() => setScreen('timeout')}
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
