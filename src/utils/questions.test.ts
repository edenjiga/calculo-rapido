import {
  createQuestion,
  DIFFICULTIES,
  formatQuestion,
  OPERATIONS,
  speakQuestion,
  type Difficulty,
  type Operation,
  type Question,
  type QuestionSettings,
} from '@/utils/questions';

// Deterministic generator so failures are reproducible.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sample(settings: QuestionSettings, count = 5_000, seed = 1) {
  const random = seeded(seed);
  const questions: Question[] = [];
  for (let i = 0; i < count; i++) questions.push(createQuestion(settings, random, questions.at(-1)));
  return questions;
}

const digits = (n: number) => String(n).length;
const only = (operation: Operation, difficulty: Difficulty) =>
  sample({ difficulty, operations: [operation] });

describe.each(DIFFICULTIES)('%s', (difficulty) => {
  const questions = sample({ difficulty, operations: OPERATIONS });

  it('computes the right answer for every operation', () => {
    for (const { operation, a, b, answer } of questions) {
      if (operation === 'add') expect(answer).toBe(a + b);
      if (operation === 'subtract') expect(answer).toBe(a - b);
      if (operation === 'multiply') expect(answer).toBe(a * b);
      if (operation === 'divide') expect(answer * b).toBe(a);
    }
  });

  it('only gives whole, positive answers', () => {
    for (const { answer } of questions) {
      expect(Number.isInteger(answer)).toBe(true);
      expect(answer).toBeGreaterThan(0);
    }
  });

  it('skips trivial multiplications and divisions', () => {
    for (const { operation, a, b, answer } of questions) {
      if (operation === 'multiply') expect(Math.min(a, b)).toBeGreaterThanOrEqual(2);
      if (operation === 'divide') expect(Math.min(b, answer)).toBeGreaterThanOrEqual(2);
    }
  });

  it('mixes all four operations', () => {
    const counts = new Map<Operation, number>();
    for (const { operation } of questions) counts.set(operation, (counts.get(operation) ?? 0) + 1);
    for (const operation of OPERATIONS) {
      expect(counts.get(operation)).toBeGreaterThan(questions.length * 0.2);
    }
  });

  it('never repeats the previous question', () => {
    for (let i = 1; i < questions.length; i++) {
      const [prev, curr] = [questions[i - 1], questions[i]];
      expect(prev.operation === curr.operation && prev.a === curr.a && prev.b === curr.b).toBe(false);
    }
  });
});

describe('number sizes', () => {
  it('easy uses one-digit numbers', () => {
    for (const operation of ['add', 'subtract', 'multiply'] as const) {
      for (const { a, b } of only(operation, 'easy')) {
        expect([digits(a), digits(b)]).toEqual([1, 1]);
      }
    }
  });

  it('easy divides within the times tables', () => {
    for (const { a, b, answer } of only('divide', 'easy')) {
      expect([digits(b), digits(answer)]).toEqual([1, 1]);
      expect(a).toBeLessThanOrEqual(81);
    }
  });

  it('medium puts a two-digit number with a one-digit number', () => {
    for (const operation of OPERATIONS) {
      for (const { a, b } of only(operation, 'medium')) {
        expect([digits(a), digits(b)]).toEqual([2, 1]);
      }
    }
  });

  it('hard uses two two-digit numbers', () => {
    for (const operation of OPERATIONS) {
      for (const { a, b } of only(operation, 'hard')) {
        expect([digits(a), digits(b)]).toEqual([2, 2]);
      }
    }
  });

  it('reaches the edges of each range', () => {
    const hardFactors = only('multiply', 'hard').map((q) => q.a);
    expect(Math.min(...hardFactors)).toBe(10);
    expect(Math.max(...hardFactors)).toBe(99);
    const easySums = only('add', 'easy').flatMap((q) => [q.a, q.b]);
    expect(Math.min(...easySums)).toBe(1);
    expect(Math.max(...easySums)).toBe(9);
  });

  it('keeps every answer within four digits', () => {
    for (const difficulty of DIFFICULTIES) {
      for (const { answer } of sample({ difficulty, operations: OPERATIONS }, 2_000)) {
        expect(digits(answer)).toBeLessThanOrEqual(4);
      }
    }
  });
});

describe('operations', () => {
  it('only asks the operations that are on', () => {
    const questions = sample({ difficulty: 'medium', operations: ['subtract', 'divide'] });
    expect(new Set(questions.map((q) => q.operation))).toEqual(new Set(['subtract', 'divide']));
  });

  it('works with a single operation', () => {
    for (const operation of OPERATIONS) {
      expect(only(operation, 'easy').every((q) => q.operation === operation)).toBe(true);
    }
  });

  it('falls back to every operation if given none', () => {
    const questions = sample({ difficulty: 'hard', operations: [] }, 500);
    expect(new Set(questions.map((q) => q.operation)).size).toBe(4);
  });

  it('terminates even with a stuck random source', () => {
    const settings: QuestionSettings = { difficulty: 'easy', operations: ['add'] };
    const stuck = () => 0;
    const first = createQuestion(settings, stuck);
    expect(createQuestion(settings, stuck, first)).toEqual(first);
  });
});

describe('formatting', () => {
  const question: Question = { operation: 'divide', a: 84, b: 7, answer: 12 };

  it('uses math symbols on screen', () => {
    expect(formatQuestion(question)).toBe('84 ÷ 7');
  });

  it('spells the operation for screen readers', () => {
    expect(speakQuestion(question)).toBe('84 entre 7');
  });
});
