import { BONUS_EVERY, BONUS_TIME_MS, MAX_ANSWER_DIGITS, START_TIME_MS } from '@/constants';
import type { Question } from '@/utils/questions';

export type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

/** Outcome of the last submitted answer. `id` changes on every answer, so it can key animations. */
export type Feedback =
  | { kind: 'correct'; id: number }
  | { kind: 'bonus'; id: number }
  | { kind: 'wrong'; id: number; question: Question; given: number };

export type GameState = {
  status: 'playing' | 'over';
  question: Question;
  input: string;
  /** Epoch ms at which time runs out. Bonuses push it later. */
  deadline: number;
  score: number;
  errors: number;
  /** Correct answers in a row. A wrong answer resets it; the score is kept. */
  streak: number;
  bestStreak: number;
  bonuses: number;
  answered: number;
  feedback: Feedback | null;
};

// Time and the next question come in on the action so the reducer stays pure.
export type GameAction =
  | { type: 'type'; digit: Digit }
  | { type: 'erase' }
  | { type: 'submit'; now: number; next: Question }
  | { type: 'expire'; now: number };

export function createGame(now: number, question: Question): GameState {
  return {
    status: 'playing',
    question,
    input: '',
    deadline: now + START_TIME_MS,
    score: 0,
    errors: 0,
    streak: 0,
    bestStreak: 0,
    bonuses: 0,
    answered: 0,
    feedback: null,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (state.status === 'over') return state;

  switch (action.type) {
    case 'type': {
      if (state.input.length >= MAX_ANSWER_DIGITS) return state;
      // Replace a lone leading zero instead of building "05".
      const input = state.input === '0' ? action.digit : state.input + action.digit;
      return { ...state, input };
    }

    case 'erase':
      return state.input ? { ...state, input: state.input.slice(0, -1) } : state;

    case 'expire':
      return action.now >= state.deadline ? { ...state, status: 'over' } : state;

    case 'submit': {
      // An answer that lands after the buzzer doesn't count.
      if (action.now >= state.deadline) return { ...state, status: 'over' };
      if (!state.input) return state;

      const given = Number(state.input);
      const answered = state.answered + 1;
      const next = { ...state, question: action.next, input: '', answered };

      if (given !== state.question.answer) {
        return {
          ...next,
          errors: state.errors + 1,
          streak: 0,
          feedback: { kind: 'wrong', id: answered, question: state.question, given },
        };
      }

      const streak = state.streak + 1;
      const bonus = streak % BONUS_EVERY === 0;
      return {
        ...next,
        score: state.score + 1,
        streak,
        bestStreak: Math.max(state.bestStreak, streak),
        bonuses: bonus ? state.bonuses + 1 : state.bonuses,
        deadline: bonus ? state.deadline + BONUS_TIME_MS : state.deadline,
        feedback: { kind: bonus ? 'bonus' : 'correct', id: answered },
      };
    }
  }
}
