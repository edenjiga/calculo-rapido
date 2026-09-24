import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { motion, numerals, radius, spacing, typography, useColors } from '@/theme';
import type { Feedback } from '@/utils/game';
import { formatQuestion } from '@/utils/questions';

const FLASH_OPACITY = 0.3;
const SHAKE = [-8, 8, -5, 5, 0];

export function AnswerDisplay({
  input,
  feedback,
  over,
}: {
  input: string;
  feedback: Feedback | null;
  over: boolean;
}) {
  const colors = useColors();
  const reducedMotion = useReducedMotion();
  const flash = useSharedValue(0);
  const shake = useSharedValue(0);
  const wrong = feedback?.kind === 'wrong';

  // Correct answers happen dozens of times a game, so their flash stays short.
  // Mistakes are rarer and get a longer flash plus a shake.
  useEffect(() => {
    if (!feedback) return;
    const fade = feedback.kind === 'wrong' ? 400 : motion.fast;
    flash.set(
      withSequence(
        withTiming(FLASH_OPACITY, { duration: 0 }),
        withTiming(0, { duration: fade, easing: motion.easeOut })
      )
    );
    if (feedback.kind === 'wrong' && !reducedMotion) {
      shake.set(withSequence(...SHAKE.map((x) => withTiming(x, { duration: 50 }))));
    }
  }, [feedback, reducedMotion, flash, shake]);

  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.get() }));
  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.get() }] }));

  return (
    <Animated.View
      style={[
        {
          alignSelf: 'stretch',
          height: 76,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.lg,
          borderCurve: 'continuous',
          backgroundColor: colors.fill,
          overflow: 'hidden',
        },
        shakeStyle,
      ]}>
      {/* Static color, animated opacity: platform colors can't be interpolated. */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { pointerEvents: 'none', backgroundColor: wrong ? colors.danger : colors.success },
          flashStyle,
        ]}
      />
      <Text
        testID="answer"
        maxFontSizeMultiplier={1.2}
        style={[numerals.answer, { color: input || over ? colors.label : colors.tertiaryLabel }]}>
        {over ? '¡Tiempo!' : input || '?'}
      </Text>
    </Animated.View>
  );
}

/** Shows the right answer to the last question missed, until the next answer. */
export function MistakeLine({ feedback }: { feedback: Feedback | null }) {
  const colors = useColors();
  const missed = feedback?.kind === 'wrong' ? feedback.question : null;

  // Always takes up space so the layout doesn't jump when it appears.
  return (
    <View style={{ minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      {missed && (
        <>
          <SymbolView
            name={{ ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }}
            size={18}
            tintColor={colors.danger}
          />
          <Text style={[typography.subhead, { color: colors.secondaryLabel }]}>
            {formatQuestion(missed)} = {missed.answer}
          </Text>
        </>
      )}
    </View>
  );
}
