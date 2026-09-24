import { BONUS_TIME_MS, START_TIME_MS } from '@/constants';
import { createGame, gameReducer, type Digit, type GameState } from '@/utils/game';
import type { Question } from '@/utils/questions';

const T0 = 1_000_000;
const q = (a: number, b: number): Question => ({ operation: 'add', a, b, answer: a + b });
const NEXT = q(1, 1);

function typeNumber(state: GameState, value: number) {
  for (const digit of String(value)) state = gameReducer(state, { type: 'type', digit: digit as Digit });
  return state;
}

function answer(state: GameState, value: number, now = T0 + 1_000) {
  return gameReducer(typeNumber(state, value), { type: 'submit', now, next: NEXT });
}

/** Answers `count` questions correctly, each with a fresh question. */
function answerCorrectly(state: GameState, count: number) {
  for (let i = 0; i < count; i++) {
    state = gameReducer(typeNumber(state, state.question.answer), {
      type: 'submit',
      now: T0 + 1_000,
      next: q(i + 2, i + 3),
    });
  }
  return state;
}

describe('createGame', () => {
  it('starts with a minute on the clock and nothing scored', () => {
    const state = createGame(T0, q(2, 3));
    expect(state.deadline).toBe(T0 + START_TIME_MS);
    expect(state).toMatchObject({ status: 'playing', score: 0, streak: 0, input: '' });
  });
});

describe('typing', () => {
  const start = createGame(T0, q(2, 3));

  it('caps input at four digits', () => {
    expect(typeNumber(start, 123456).input).toBe('1234');
  });

  it('replaces a leading zero', () => {
    expect(typeNumber(start, 0).input).toBe('0');
    expect(gameReducer(typeNumber(start, 0), { type: 'type', digit: '7' }).input).toBe('7');
  });

  it('erases the last digit', () => {
    const state = gameReducer(typeNumber(start, 42), { type: 'erase' });
    expect(state.input).toBe('4');
    expect(gameReducer(start, { type: 'erase' })).toBe(start);
  });
});

describe('submitting', () => {
  const start = createGame(T0, q(2, 3));

  it('ignores an empty answer', () => {
    expect(gameReducer(start, { type: 'submit', now: T0, next: NEXT })).toBe(start);
  });

  it('scores a correct answer and moves on', () => {
    const state = answer(start, 5);
    expect(state).toMatchObject({ score: 1, streak: 1, errors: 0, input: '', question: NEXT });
    expect(state.feedback).toEqual({ kind: 'correct', id: 1 });
  });

  it('keeps the score on a wrong answer but resets the streak', () => {
    const state = answer(answerCorrectly(start, 3), 99);
    expect(state).toMatchObject({ score: 3, streak: 0, errors: 1, bestStreak: 3 });
    expect(state.feedback).toMatchObject({ kind: 'wrong', given: 99 });
  });

  it('reports the question that was missed, with its answer', () => {
    const state = answer(start, 4);
    expect(state.feedback).toEqual({ kind: 'wrong', id: 1, question: q(2, 3), given: 4 });
    expect(state.question).toBe(NEXT);
  });
});

describe('bonus time', () => {
  const start = createGame(T0, q(2, 3));

  it('adds ten seconds every ten correct answers in a row', () => {
    const nine = answerCorrectly(start, 9);
    expect(nine.deadline).toBe(start.deadline);

    const ten = answerCorrectly(nine, 1);
    expect(ten.deadline).toBe(start.deadline + BONUS_TIME_MS);
    expect(ten.feedback?.kind).toBe('bonus');

    const twenty = answerCorrectly(ten, 10);
    expect(twenty.deadline).toBe(start.deadline + 2 * BONUS_TIME_MS);
    expect(twenty.bonuses).toBe(2);
  });

  it('needs a fresh run of ten after a mistake', () => {
    const missed = answer(answerCorrectly(start, 9), 0);
    const afterNine = answerCorrectly(missed, 9);
    expect(afterNine.deadline).toBe(start.deadline);
    expect(answerCorrectly(afterNine, 1).deadline).toBe(start.deadline + BONUS_TIME_MS);
    expect(answerCorrectly(afterNine, 1).score).toBe(19);
  });
});

describe('time running out', () => {
  const start = createGame(T0, q(2, 3));

  it('ignores an early expiry', () => {
    expect(gameReducer(start, { type: 'expire', now: start.deadline - 1 })).toBe(start);
  });

  it('ends the game at the deadline', () => {
    expect(gameReducer(start, { type: 'expire', now: start.deadline }).status).toBe('over');
  });

  it("doesn't count an answer submitted after the deadline", () => {
    const state = answer(start, 5, start.deadline + 1);
    expect(state).toMatchObject({ status: 'over', score: 0 });
  });

  it('respects a deadline pushed back by a bonus', () => {
    const ten = answerCorrectly(start, 10);
    const later = gameReducer(ten, { type: 'expire', now: start.deadline });
    expect(later.status).toBe('playing');
  });

  it('ignores every action once the game is over', () => {
    const over = gameReducer(start, { type: 'expire', now: start.deadline });
    expect(gameReducer(over, { type: 'type', digit: '1' })).toBe(over);
    expect(gameReducer(over, { type: 'submit', now: start.deadline, next: NEXT })).toBe(over);
  });
});
