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
  digits,
  feedback,
  over,
}: {
  input: string;
  digits: number;
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
        accessibilityLabel={
          over
            ? '¡Tiempo!'
            : `Respuesta de ${digits} ${digits === 1 ? 'cifra' : 'cifras'}. ${input ? `Escrito: ${input}.` : 'Sin responder.'}`
        }
        maxFontSizeMultiplier={1.2}
        style={[numerals.answer, { color: input || over ? colors.label : colors.tertiaryLabel }]}>
        {over ? '¡Tiempo!' : [...input, ...Array<string>(digits - input.length).fill('·')].join(' ')}
      </Text>
    </Animated.View>
  );
}

/** Keeps the latest result visible while the player answers the next question. */
export function FeedbackLine({ feedback }: { feedback: Feedback | null }) {
  const colors = useColors();
  const missed = feedback?.kind === 'wrong' ? feedback.question : null;

  // Always takes up space so the layout doesn't jump when it appears.
  return (
    <View style={{ minHeight: 24, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
      {feedback && (
        <>
          <SymbolView
            name={
              missed
                ? { ios: 'xmark.circle.fill', android: 'cancel', web: 'cancel' }
                : { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }
            }
            size={18}
            tintColor={missed ? colors.danger : colors.success}
          />
          <Text style={[typography.subhead, { color: colors.secondaryLabel }]}>
            {missed ? `Incorrecto: ${formatQuestion(missed)} = ${missed.answer}` : '¡Correcto!'}
          </Text>
        </>
      )}
    </View>
  );
}
