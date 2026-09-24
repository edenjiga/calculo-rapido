import {
  DIFFICULTIES,
  OPERATIONS,
  type Difficulty,
  type Operation,
  type QuestionSettings,
} from '@/utils/questions';

export type Settings = QuestionSettings;

export const DEFAULT_SETTINGS: Settings = { difficulty: 'medium', operations: OPERATIONS };

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
};

// Non-breaking spaces keep an example like "23 × 45" from wrapping mid-operation.
const math = (expression: string) => expression.replaceAll(' ', '\u00A0');

export const DIFFICULTY_HINTS: Record<Difficulty, string> = {
  easy: `Números de 1 dígito, como ${math('9 + 4')}.`,
  medium: `Un número de 2 dígitos con uno de 1 dígito, como ${math('21 × 5')}.`,
  hard: `Dos números de 2 dígitos, como ${math('23 × 45')}.`,
};

/** Easy is the one level where division doesn't follow the digit rule. */
export const EASY_DIVISION_HINT =
  `En las divisiones, el divisor y el resultado son de 1 dígito, como ${math('56 ÷ 8')}.`;

export const OPERATION_LABELS: Record<Operation, string> = {
  add: 'Suma',
  subtract: 'Resta',
  multiply: 'Multiplicación',
  divide: 'División',
};

const OPERATION_PLURALS: Record<Operation, string> = {
  add: 'sumas',
  subtract: 'restas',
  multiply: 'multiplicaciones',
  divide: 'divisiones',
};

/** Reads stored settings. Anything missing, unknown or corrupt falls back to the defaults. */
export function parseSettings(raw: string | null): Settings {
  let stored: unknown = null;
  try {
    stored = raw ? JSON.parse(raw) : null;
  } catch {
    // Keep the defaults.
  }
  if (typeof stored !== 'object' || stored === null) return DEFAULT_SETTINGS;

  const { difficulty, operations } = stored as { difficulty?: unknown; operations?: unknown };
  const known = OPERATIONS.filter((op) => Array.isArray(operations) && operations.includes(op));
  return {
    difficulty: DIFFICULTIES.find((d) => d === difficulty) ?? DEFAULT_SETTINGS.difficulty,
    operations: known.length > 0 ? known : DEFAULT_SETTINGS.operations,
  };
}

/** Turns an operation on or off in the usual order. Turning off the last one does nothing. */
export function setOperation(settings: Settings, operation: Operation, on: boolean): Settings {
  const operations = OPERATIONS.filter((op) =>
    op === operation ? on : settings.operations.includes(op)
  );
  return operations.length > 0 ? { ...settings, operations } : settings;
}

/** "Sumas, restas y divisiones" for the operations that are on. */
export function describeOperations(operations: readonly Operation[]) {
  const words = operations.map((op) => OPERATION_PLURALS[op]);
  const list = words.length > 1 ? `${words.slice(0, -1).join(', ')} y ${words.at(-1)}` : words[0];
  return list.charAt(0).toUpperCase() + list.slice(1);
}
