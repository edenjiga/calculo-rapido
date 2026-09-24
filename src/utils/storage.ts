import '@/utils/local-storage';

import type { Difficulty } from '@/utils/questions';
import { parseSettings, type Settings } from '@/utils/settings';

const SETTINGS_KEY = 'settings';
const bestScoreKey = (difficulty: Difficulty) => `best-score:${difficulty}`;

const listeners = new Set<() => void>();
const bestScores = new Map<Difficulty, number>();
let settings: Settings | undefined;

// Storage can be unavailable (private browsing, full disk). The game still works
// without it; values just last until the app closes.
function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Keep the in-memory value for this session.
  }
}

/** Calls `listener` whenever a record or the settings change. */
export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getBestScore(difficulty: Difficulty) {
  let best = bestScores.get(difficulty);
  if (best === undefined) {
    const stored = Number(read(bestScoreKey(difficulty)));
    best = Number.isFinite(stored) ? stored : 0;
    bestScores.set(difficulty, best);
  }
  return best;
}

/** Saves `score` if it beats the record for `difficulty`. Returns whether it did. */
export function saveScore(difficulty: Difficulty, score: number) {
  if (score <= getBestScore(difficulty)) return false;

  bestScores.set(difficulty, score);
  write(bestScoreKey(difficulty), String(score));
  listeners.forEach((listener) => listener());
  return true;
}

export function getSettings() {
  settings ??= parseSettings(read(SETTINGS_KEY));
  return settings;
}

export function saveSettings(next: Settings) {
  settings = next;
  write(SETTINGS_KEY, JSON.stringify(next));
  listeners.forEach((listener) => listener());
}
