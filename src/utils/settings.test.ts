import {
  DEFAULT_SETTINGS,
  describeOperations,
  parseSettings,
  setOperation,
  type Settings,
} from '@/utils/settings';

describe('parseSettings', () => {
  it('defaults to medium with every operation', () => {
    expect(parseSettings(null)).toEqual({
      difficulty: 'medium',
      operations: ['add', 'subtract', 'multiply', 'divide'],
    });
  });

  it('reads saved settings', () => {
    const saved = JSON.stringify({ difficulty: 'hard', operations: ['multiply', 'divide'] });
    expect(parseSettings(saved)).toEqual({ difficulty: 'hard', operations: ['multiply', 'divide'] });
  });

  it('falls back to the defaults for corrupt data', () => {
    expect(parseSettings('{not json')).toBe(DEFAULT_SETTINGS);
    expect(parseSettings('42')).toBe(DEFAULT_SETTINGS);
  });

  it('replaces an unknown difficulty and drops unknown operations', () => {
    const saved = JSON.stringify({ difficulty: 'insane', operations: ['divide', 'modulo', 'add'] });
    expect(parseSettings(saved)).toEqual({ difficulty: 'medium', operations: ['add', 'divide'] });
  });

  it('never returns an empty operation list', () => {
    const saved = JSON.stringify({ difficulty: 'easy', operations: [] });
    expect(parseSettings(saved).operations).toEqual(DEFAULT_SETTINGS.operations);
  });
});

describe('setOperation', () => {
  const settings: Settings = { difficulty: 'easy', operations: ['add', 'multiply'] };

  it('turns an operation off', () => {
    expect(setOperation(settings, 'add', false).operations).toEqual(['multiply']);
  });

  it('turns an operation on in the usual order', () => {
    expect(setOperation(settings, 'subtract', true).operations).toEqual([
      'add',
      'subtract',
      'multiply',
    ]);
  });

  it('keeps the last operation on', () => {
    const one: Settings = { difficulty: 'easy', operations: ['divide'] };
    expect(setOperation(one, 'divide', false)).toBe(one);
  });

  it('keeps the difficulty', () => {
    expect(setOperation(settings, 'divide', true).difficulty).toBe('easy');
  });
});

describe('describeOperations', () => {
  it('lists the operations in Spanish', () => {
    expect(describeOperations(['add'])).toBe('Sumas');
    expect(describeOperations(['add', 'subtract'])).toBe('Sumas y restas');
    expect(describeOperations(['add', 'multiply', 'divide'])).toBe(
      'Sumas, multiplicaciones y divisiones'
    );
  });
});
