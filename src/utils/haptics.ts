import * as Haptics from 'expo-haptics';

type Moment = 'correct' | 'wrong' | 'bonus' | 'over';

// A light tap for the routine case keeps the stronger patterns meaningful.
const ios: Record<Moment, () => Promise<void>> = {
  correct: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  wrong: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  bonus: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  over: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
};

// performAndroidHapticsAsync uses the system haptic engine and needs no VIBRATE permission.
const android: Record<Moment, Haptics.AndroidHaptics> = {
  correct: Haptics.AndroidHaptics.Virtual_Key,
  wrong: Haptics.AndroidHaptics.Reject,
  bonus: Haptics.AndroidHaptics.Confirm,
  over: Haptics.AndroidHaptics.Long_Press,
};

/** One haptic per event, fired in the same frame as its visual feedback. */
export function playHaptic(moment: Moment) {
  const pending =
    process.env.EXPO_OS === 'ios'
      ? ios[moment]()
      : process.env.EXPO_OS === 'android'
        ? Haptics.performAndroidHapticsAsync(android[moment])
        : undefined;
  pending?.catch(() => {});
}
