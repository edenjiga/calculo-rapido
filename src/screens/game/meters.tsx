import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { BONUS_EVERY, BONUS_TIME_MS, START_TIME_MS } from '@/constants';
import { motion, radius, spacing, typography, useColors } from '@/theme';

const BAR_HEIGHT = 6;

/** Drains over the remaining time on the UI thread; a full bar means a minute or more. */
export function TimeBar({ deadline, running, low }: { deadline: number; running: boolean; low: boolean }) {
  const colors = useColors();
  const reducedMotion = useReducedMotion();
  // A game starts with a full bar; the effect below syncs it to the real deadline.
  const remaining = useSharedValue(START_TIME_MS);

  useEffect(() => {
    if (!running) {
      cancelAnimation(remaining);
      remaining.set(0);
      return;
    }
    const left = Math.max(0, deadline - Date.now());
    // Bonus time grows the bar back quickly; otherwise it jumps straight to `left`.
    const grow = left > remaining.get() + 1000 && !reducedMotion ? motion.base : 0;
    remaining.set(
      withSequence(
        withTiming(left, { duration: grow, easing: motion.easeOut }),
        withTiming(0, { duration: Math.max(0, left - grow), easing: Easing.linear })
      )
    );
  }, [deadline, running, reducedMotion, remaining]);

  // The fill is absolutely positioned with no children, so animating its width
  // doesn't trigger layout for anything else.
  const fill = useAnimatedStyle(() => ({
    width: `${Math.min(1, remaining.get() / START_TIME_MS) * 100}%`,
  }));

  return (
    <View
      style={{
        height: BAR_HEIGHT,
        borderRadius: radius.full,
        backgroundColor: colors.fill,
        overflow: 'hidden',
      }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            borderRadius: radius.full,
            backgroundColor: low ? colors.danger : colors.tint,
          },
          fill,
        ]}
      />
    </View>
  );
}

/** Progress toward the next time bonus. A wrong answer empties it. */
export function StreakMeter({ streak }: { streak: number }) {
  const colors = useColors();
  const filled = streak % BONUS_EVERY;
  const bonusSeconds = BONUS_TIME_MS / 1000;

  return (
    <View
      accessible
      accessibilityLabel={`Racha: ${filled} de ${BONUS_EVERY} para ganar ${bonusSeconds} segundos`}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <View style={{ flex: 1, flexDirection: 'row', gap: spacing.xs }}>
        {Array.from({ length: BONUS_EVERY }, (_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: BAR_HEIGHT,
              borderRadius: radius.full,
              backgroundColor: i < filled ? colors.success : colors.fill,
            }}
          />
        ))}
      </View>
      <Text style={[typography.footnote, { color: colors.secondaryLabel }]}>+{bonusSeconds} s</Text>
    </View>
  );
}
