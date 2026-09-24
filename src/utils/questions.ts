export const OPERATIONS = ['add', 'subtract', 'multiply', 'divide'] as const;
export type Operation = (typeof OPERATIONS)[number];

export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export type Question = {
  operation: Operation;
  a: number;
  b: number;
  answer: number;
};

/** The level and the operations that can come up. */
export type QuestionSettings = {
  difficulty: Difficulty;
  operations: readonly Operation[];
};

type Random = () => number;
type Range = readonly [min: number, max: number];

const ONE_DIGIT: Range = [1, 9];
const TWO_DIGITS: Range = [10, 99];

// Digits of the first and second number shown: easy is 1 with 1, medium 2 with 1,
// hard 2 with 2. The shared constants let `subtract` tell when both come from one range.
const OPERANDS: Record<Difficulty, { first: Range; second: Range }> = {
  easy: { first: ONE_DIGIT, second: ONE_DIGIT },
  medium: { first: TWO_DIGITS, second: ONE_DIGIT },
  hard: { first: TWO_DIGITS, second: TWO_DIGITS },
};

const SYMBOLS: Record<Operation, string> = {
  add: '+',
  subtract: '−',
  multiply: '×',
  divide: '÷',
};

const SPOKEN: Record<Operation, string> = {
  add: 'más',
  subtract: 'menos',
  multiply: 'por',
  divide: 'entre',
};

function randomInt(random: Random, [min, max]: Range) {
  return min + Math.floor(random() * (max - min + 1));
}

// Multiplying or dividing by 1 is trivial at any level.
const withoutOne = ([min, max]: Range): Range => [Math.max(2, min), max];

// Every exact division for a level, as [divisor, quotient], so the answer is always a
// whole number. Dividends stay at two digits or fewer, and results of 1 are left out.
function exactDivisions(divisors: Range, keep: (dividend: number, quotient: number) => boolean) {
  const pairs: [divisor: number, quotient: number][] = [];
  for (let divisor = divisors[0]; divisor <= divisors[1]; divisor++) {
    for (let quotient = 2; divisor * quotient <= TWO_DIGITS[1]; quotient++) {
      if (keep(divisor * quotient, quotient)) pairs.push([divisor, quotient]);
    }
  }
  return pairs;
}

const DIVISIONS: Record<Difficulty, [divisor: number, quotient: number][]> = {
  // A one-digit dividend only allows five divisions, so easy uses the times tables
  // in reverse: one-digit divisor and result, like 56 ÷ 8.
  easy: exactDivisions(withoutOne(ONE_DIGIT), (_, quotient) => quotient <= ONE_DIGIT[1]),
  medium: exactDivisions(withoutOne(ONE_DIGIT), (dividend) => dividend >= TWO_DIGITS[0]),
  hard: exactDivisions(TWO_DIGITS, () => true),
};

function build(operation: Operation, difficulty: Difficulty, random: Random): Question {
  const { first, second } = OPERANDS[difficulty];

  switch (operation) {
    case 'add': {
      const a = randomInt(random, first);
      const b = randomInt(random, second);
      return { operation, a, b, answer: a + b };
    }
    case 'subtract': {
      // Larger number first and never equal: the result is always 1 or more.
      if (first !== second) {
        const a = randomInt(random, first);
        const b = randomInt(random, second);
        return { operation, a, b, answer: a - b };
      }
      const x = randomInt(random, first);
      let y = randomInt(random, [first[0], first[1] - 1]);
      if (y >= x) y += 1;
      const a = Math.max(x, y);
      const b = Math.min(x, y);
      return { operation, a, b, answer: a - b };
    }
    case 'multiply': {
      const a = randomInt(random, withoutOne(first));
      const b = randomInt(random, withoutOne(second));
      return { operation, a, b, answer: a * b };
    }
    case 'divide': {
      const pairs = DIVISIONS[difficulty];
      const [divisor, quotient] = pairs[randomInt(random, [0, pairs.length - 1])];
      return { operation, a: divisor * quotient, b: divisor, answer: quotient };
    }
  }
}

function isSameQuestion(x: Question, y: Question) {
  return x.operation === y.operation && x.a === y.a && x.b === y.b;
}

export function createQuestion(
  { difficulty, operations }: QuestionSettings,
  random: Random = Math.random,
  previous?: Question
): Question {
  // Settings always keep one operation on; this guards against a bad caller.
  const pool = operations.length > 0 ? operations : OPERATIONS;
  const next = () => build(pool[randomInt(random, [0, pool.length - 1])], difficulty, random);

  let question = next();
  // Bounded so a degenerate random source can't loop forever.
  for (let attempt = 0; previous && isSameQuestion(question, previous) && attempt < 10; attempt++) {
    question = next();
  }
  return question;
}

export function formatQuestion({ operation, a, b }: Question) {
  return `${a} ${SYMBOLS[operation]} ${b}`;
}

/** Screen-reader text: symbols like "−" and "÷" are read inconsistently. */
export function speakQuestion({ operation, a, b }: Question) {
  return `${a} ${SPOKEN[operation]} ${b}`;
}
