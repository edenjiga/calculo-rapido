import { useSyncExternalStore } from 'react';

import type { Difficulty } from '@/utils/questions';
import { getBestScore, subscribe } from '@/utils/storage';

export function useBestScore(difficulty: Difficulty) {
  return useSyncExternalStore(subscribe, () => getBestScore(difficulty));
}
