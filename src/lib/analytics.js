// ── GA4 Analytics ─────────────────────────────────────────────────────────────
// All events follow GA4 recommended naming conventions.
// Safe to call even if gtag isn't loaded (ad blockers etc).

function track(eventName, params = {}) {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }
  } catch (e) {
    // Silently fail — never break the game over analytics
  }
}

// Called when player selects a difficulty and begins
export function trackGameStarted({ caseNum, caseTitle, tier, date, practice }) {
  track('game_started', {
    case_number: caseNum,
    case_title:  caseTitle,
    difficulty:  tier,
    game_date:   date,
    is_practice: practice ? 'true' : 'false',
  });
}

// Called each time a clue card is revealed
export function trackClueRevealed({ clueId, clueIndex, caseNum, tier }) {
  track('clue_revealed', {
    clue_id:     clueId,
    clue_index:  clueIndex,
    case_number: caseNum,
    difficulty:  tier,
  });
}

// Called when player uses a hint
export function trackHintUsed({ hintCount, timeRemaining, timerSeconds, caseNum, tier }) {
  track('hint_used', {
    hint_number:    hintCount,
    time_remaining: timeRemaining,
    time_used:      timerSeconds - timeRemaining,
    case_number:    caseNum,
    difficulty:     tier,
  });
}

// Called on a wrong accusation
export function trackWrongAccusation({ wrongCount, timeRemaining, caseNum, tier }) {
  track('wrong_accusation', {
    wrong_count:    wrongCount,
    time_remaining: timeRemaining,
    case_number:    caseNum,
    difficulty:     tier,
  });
}

// Called when player solves the case
export function trackGameCompleted({ caseNum, caseTitle, tier, score, rank, timeRemaining, timerSeconds, wrongCount, hintsUsed, foundInsights, practice }) {
  const timeUsed = timerSeconds - timeRemaining;
  track('game_completed', {
    case_number:     caseNum,
    case_title:      caseTitle,
    difficulty:      tier,
    score:           score,
    rank:            rank,
    time_used_secs:  timeUsed,
    time_remaining:  timeRemaining,
    wrong_count:     wrongCount,
    hints_used:      hintsUsed,
    insights_found:  foundInsights,
    is_practice:     practice ? 'true' : 'false',
    completion_rate: Math.round((timeRemaining / timerSeconds) * 100),
  });
}

// Called when timer runs out
export function trackGameTimeout({ caseNum, tier, hintsUsed, wrongCount, cluesRevealed }) {
  track('game_timeout', {
    case_number:    caseNum,
    difficulty:     tier,
    hints_used:     hintsUsed,
    wrong_count:    wrongCount,
    clues_revealed: cluesRevealed,
  });
}

// Called when share button is tapped
export function trackShareClicked({ method, caseNum, tier, score, rank }) {
  track('share_clicked', {
    share_method: method, // 'copy' | 'text' | 'share'
    case_number:  caseNum,
    difficulty:   tier,
    score:        score,
    rank:         rank,
  });
}

// Called when practice mode is started from already-played screen
export function trackPracticeStarted({ caseNum, tier, date }) {
  track('practice_started', {
    case_number: caseNum,
    difficulty:  tier,
    game_date:   date,
  });
}

// Called when archive link is used (date param in URL)
export function trackArchivePlay({ date, caseNum }) {
  track('archive_play', {
    game_date:   date,
    case_number: caseNum,
  });
}
