import { SymbolView } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { numerals, radius, spacing, useColors } from '@/theme';
import type { Digit } from '@/utils/game';

// react-native-web waits 50 ms before calling onPressIn and drops shorter taps. React
// Native fires it immediately and doesn't declare the prop, so it's only passed on web.
const webPressProps = process.env.EXPO_OS === 'web' ? { delayPressIn: 0 } : {};

const ROWS: Digit[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
];

type KeypadProps = {
  keyHeight: number;
  canSubmit: boolean;
  inactive: boolean;
  onDigit: (digit: Digit) => void;
  onErase: () => void;
  onSubmit: () => void;
};

export function Keypad({ keyHeight, canSubmit, inactive, onDigit, onErase, onSubmit }: KeypadProps) {
  const colors = useColors();
  const digit = (value: Digit) => (
    <Key key={value} label={value} height={keyHeight} dimmed={inactive} onPress={() => onDigit(value)}>
      <Text maxFontSizeMultiplier={1.3} style={[numerals.key, { color: colors.label }]}>
        {value}
      </Text>
    </Key>
  );

  return (
    <View style={{ gap: spacing.sm }}>
      {ROWS.map((row) => (
        <View key={row.join()} style={{ flexDirection: 'row', gap: spacing.sm }}>
          {row.map(digit)}
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Key label="Borrar" height={keyHeight} dimmed={inactive} onPress={onErase}>
          <SymbolView
            name={{ ios: 'delete.left', android: 'backspace', web: 'backspace' }}
            weight="medium"
            size={26}
            tintColor={colors.label}
          />
        </Key>
        {digit('0')}
        <Key
          label="Responder"
          height={keyHeight}
          dimmed={inactive || !canSubmit}
          prominent
          onPress={onSubmit}>
          <SymbolView
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            weight="semibold"
            size={26}
            tintColor={colors.onTint}
          />
        </Key>
      </View>
    </View>
  );
}

function Key({
  label,
  height,
  dimmed,
  prominent = false,
  onPress,
  children,
}: {
  label: string;
  height: number;
  /** Looks and reads as disabled; the game ignores its input. */
  dimmed: boolean;
  prominent?: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  const colors = useColors();

  return (
    <Pressable
      {...webPressProps}
      accessibilityRole="button"
      accessibilityLabel={label}
      // VoiceOver and TalkBack announce it as dimmed. On web, Pressable overwrites it with
      // its own `disabled` prop, so the key still reads as enabled there.
      aria-disabled={dimmed}
      // Keys fire on touch-down: it's faster, and a second thumb landing on another key
      // can't cancel this one. Screen readers go through the activate action instead.
      onPressIn={onPress}
      accessibilityActions={[{ name: 'activate' }]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'activate') onPress();
      }}
      // Not `disabled`: a key that turns disabled mid-press (✓ clearing the input) makes
      // react-native-web swallow the next tap, which was the first digit of the next answer.
      style={({ pressed }) => ({
        flex: 1,
        height,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: radius.lg,
        borderCurve: 'continuous',
        backgroundColor: prominent ? colors.tint : pressed ? colors.fillPressed : colors.fill,
        opacity: dimmed ? 0.4 : prominent && pressed ? 0.75 : 1,
      })}>
      {children}
    </Pressable>
  );
}
