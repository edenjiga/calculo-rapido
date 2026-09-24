import { Text, View } from 'react-native';
import Animated, { useReducedMotion, type CSSAnimationKeyframes } from 'react-native-reanimated';

import { BONUS_TIME_MS } from '@/constants';
import { motion, numerals, spacing, typography, useColors } from '@/theme';

const formatClock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export function Scoreboard({
  seconds,
  low,
  score,
  bonuses,
}: {
  seconds: number;
  low: boolean;
  score: number;
  bonuses: number;
}) {
  const colors = useColors();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ gap: spacing.xs }}>
        <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>Tiempo</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text
            accessibilityLabel={`${seconds} segundos`}
            style={[numerals.scoreboard, { color: low ? colors.danger : colors.label }]}>
            {formatClock(seconds)}
          </Text>
          {/* Keyed by the bonus count so every bonus replays the pop. */}
          {bonuses > 0 && <BonusPop key={bonuses} />}
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
        <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>Aciertos</Text>
        <Text style={[numerals.scoreboard, { color: colors.label }]}>{score}</Text>
      </View>
    </View>
  );
}

// Timing functions live on the keyframes that start the entry and the exit; a style-level
// cubicBezier clashes with Expo's react-native-web style typings.
const POP: CSSAnimationKeyframes = {
  '0%': {
    opacity: 0,
    transform: [{ translateY: 6 }, { scale: 0.95 }],
    animationTimingFunction: motion.cssEaseOut,
  },
  '12%': { opacity: 1, transform: [{ translateY: 0 }, { scale: 1 }] },
  '80%': {
    opacity: 1,
    transform: [{ translateY: 0 }, { scale: 1 }],
    animationTimingFunction: motion.cssEaseOut,
  },
  '100%': { opacity: 0, transform: [{ translateY: -4 }, { scale: 1 }] },
};

const FADE: CSSAnimationKeyframes = {
  '0%': { opacity: 0, animationTimingFunction: motion.cssEaseOut },
  '12%': { opacity: 1 },
  '80%': { opacity: 1, animationTimingFunction: motion.cssEaseOut },
  '100%': { opacity: 0 },
};

function BonusPop() {
  const colors = useColors();
  const reducedMotion = useReducedMotion();

  return (
    <Animated.Text
      style={[
        typography.headline,
        {
          color: colors.success,
          animationName: reducedMotion ? FADE : POP,
          animationDuration: 1600,
          animationFillMode: 'forwards',
        },
      ]}>
      +{BONUS_TIME_MS / 1000} s
    </Animated.Text>
  );
}
