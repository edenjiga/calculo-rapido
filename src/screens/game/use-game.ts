import { useEffect, useReducer, useState } from 'react';

import { createGame, gameReducer, type Digit } from '@/utils/game';
import { playHaptic } from '@/utils/haptics';
import { createQuestion, type QuestionSettings } from '@/utils/questions';

const secondsUntil = (deadline: number) => Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

/** Runs one round. `settings` must stay the same for the life of the round. */
export function useGame(settings: QuestionSettings) {
  const [state, dispatch] = useReducer(gameReducer, settings, (initial) =>
    createGame(Date.now(), createQuestion(initial))
  );
  const { status, deadline, feedback } = state;
  const playing = status === 'playing';

  // Timing is deadline-based, so a slow frame or a late timer never adds time.
  // A bonus moves the deadline, which re-arms this timeout.
  useEffect(() => {
    if (!playing) return;
    let timeout = setTimeout(function check() {
      const left = deadline - Date.now();
      if (left <= 0) dispatch({ type: 'expire', now: Date.now() });
      else timeout = setTimeout(check, left);
    }, deadline - Date.now());
    return () => clearTimeout(timeout);
  }, [playing, deadline]);

  // Polls often but only re-renders when the displayed second changes.
  const [seconds, setSeconds] = useState(() => secondsUntil(deadline));
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => setSeconds(secondsUntil(deadline)), 100);
    return () => clearInterval(interval);
  }, [playing, deadline]);

  useEffect(() => {
    if (feedback) playHaptic(feedback.kind);
  }, [feedback]);

  useEffect(() => {
    if (status === 'over') playHaptic('over');
  }, [status]);

  return {
    ...state,
    seconds: playing ? seconds : 0,
    type: (digit: Digit) =>
      dispatch({
        type: 'type',
        digit,
        now: Date.now(),
        next: createQuestion(settings, Math.random, state.question),
      }),
    erase: () => dispatch({ type: 'erase' }),
  };
}
