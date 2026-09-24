import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Animated, { useReducedMotion, type CSSAnimationKeyframes } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { BONUS_TIME_MS } from '@/constants';
import { useBestScore } from '@/hooks/use-best-score';
import { motion, numerals, spacing, typography, useColors } from '@/theme';
import { playHaptic } from '@/utils/haptics';
import type { Difficulty } from '@/utils/questions';
import { DIFFICULTY_LABELS } from '@/utils/settings';

// The timing function sits on the first keyframe; a style-level cubicBezier clashes
// with Expo's react-native-web style typings.
const FADE_IN: CSSAnimationKeyframes = {
  from: { opacity: 0, animationTimingFunction: motion.cssEaseOut },
  to: { opacity: 1 },
};

export function Results({
  difficulty,
  score,
  errors,
  bestStreak,
  bonuses,
  isRecord,
  onPlayAgain,
}: {
  difficulty: Difficulty;
  score: number;
  errors: number;
  bestStreak: number;
  bonuses: number;
  isRecord: boolean;
  onPlayAgain: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const best = useBestScore(difficulty);
  const level = DIFFICULTY_LABELS[difficulty];
  const bonusSeconds = (bonuses * BONUS_TIME_MS) / 1000;

  useEffect(() => {
    if (isRecord) playHaptic('bonus');
  }, [isRecord]);

  const goHome = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // The end of a round is rare enough to earn a short fade instead of a hard cut.
  return (
    <Animated.View
      style={{
        flex: 1,
        animationName: FADE_IN,
        animationDuration: motion.base,
      }}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          flexGrow: 1,
          gap: spacing.xl,
          padding: spacing.md,
          paddingBottom: (process.env.EXPO_OS === 'ios' ? 0 : insets.bottom) + spacing.md,
        }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
          {isRecord && <RecordBadge level={level} />}

          <View style={{ alignItems: 'center' }}>
            <Text selectable style={[numerals.hero, { color: colors.label }]}>
              {score}
            </Text>
            <Text style={[typography.body, { color: colors.secondaryLabel }]}>
              {score === 1 ? 'acierto' : 'aciertos'}
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignSelf: 'stretch' }}>
            <Stat value={String(errors)} label={errors === 1 ? 'error' : 'errores'} />
            <Stat value={String(bestStreak)} label="mejor racha" />
            <Stat value={`+${bonusSeconds} s`} label="tiempo extra" />
          </View>

          {!isRecord && best > 0 && (
            <Text style={[typography.subhead, { color: colors.secondaryLabel }]}>
              Tu récord en {level}: {best}
            </Text>
          )}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Button title="Jugar otra vez" onPress={onPlayAgain} />
          <Button title="Volver al inicio" variant="secondary" onPress={goHome} />
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const colors = useColors();

  return (
    <View style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
      <Text selectable style={[numerals.stat, { color: colors.label }]}>
        {value}
      </Text>
      <Text style={[typography.footnote, { color: colors.secondaryLabel, textAlign: 'center' }]}>
        {label}
      </Text>
    </View>
  );
}

const APPEAR: CSSAnimationKeyframes = {
  from: { opacity: 0, transform: [{ scale: 0.95 }], animationTimingFunction: motion.cssEaseOut },
  to: { opacity: 1, transform: [{ scale: 1 }] },
};

function RecordBadge({ level }: { level: string }) {
  const colors = useColors();
  const reducedMotion = useReducedMotion();

  return (
    <Animated.View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        animationName: reducedMotion ? FADE_IN : APPEAR,
        animationDuration: motion.base,
      }}>
      <SymbolView
        name={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
        size={24}
        tintColor={colors.tint}
      />
      <Text style={[typography.headline, { color: colors.tint }]}>¡Nuevo récord en {level}!</Text>
    </Animated.View>
  );
}
