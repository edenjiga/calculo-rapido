import { Color } from 'expo-router';
import { cubicBezier, Easing } from 'react-native-reanimated';
import { useColorScheme, type ColorValue, type TextStyle } from 'react-native';

type Palette = {
  background: ColorValue;
  label: ColorValue;
  secondaryLabel: ColorValue;
  tertiaryLabel: ColorValue;
  /** Keys and secondary buttons. */
  fill: ColorValue;
  fillPressed: ColorValue;
  tint: ColorValue;
  onTint: ColorValue;
  success: ColorValue;
  danger: ColorValue;
};

// Built only for the running platform: `Color.ios` means nothing on Android or web.
function createPalettes(): Record<'light' | 'dark', Palette> {
  if (process.env.EXPO_OS === 'ios') {
    // Semantic colors resolve on-device, so one palette covers both modes.
    const ios: Palette = {
      background: Color.ios.systemBackground,
      label: Color.ios.label,
      secondaryLabel: Color.ios.secondaryLabel,
      tertiaryLabel: Color.ios.tertiaryLabel,
      fill: Color.ios.tertiarySystemFill,
      fillPressed: Color.ios.systemFill,
      tint: Color.ios.systemBlue,
      onTint: '#FFFFFF',
      success: Color.ios.systemGreen,
      danger: Color.ios.systemRed,
    };
    return { light: ios, dark: ios };
  }

  if (process.env.EXPO_OS === 'android') {
    const android = {
      background: Color.android.dynamic.surface,
      label: Color.android.dynamic.onSurface,
      secondaryLabel: Color.android.dynamic.onSurfaceVariant,
      tertiaryLabel: Color.android.dynamic.outline,
      fill: Color.android.dynamic.surfaceContainerHigh,
      fillPressed: Color.android.dynamic.surfaceContainerHighest,
      tint: Color.android.dynamic.primary,
      onTint: Color.android.dynamic.onPrimary,
      danger: Color.android.dynamic.error,
    };
    // Material 3 has no dynamic green, so success is a declared pair.
    return {
      light: { ...android, success: '#2E7D32' },
      dark: { ...android, success: '#81C784' },
    };
  }

  // Web: the iOS system values for each mode.
  return {
    light: {
      background: '#FFFFFF',
      label: '#000000',
      secondaryLabel: 'rgba(60, 60, 67, 0.6)',
      tertiaryLabel: 'rgba(60, 60, 67, 0.3)',
      fill: 'rgba(118, 118, 128, 0.12)',
      fillPressed: 'rgba(120, 120, 128, 0.2)',
      tint: '#007AFF',
      onTint: '#FFFFFF',
      success: '#34C759',
      danger: '#FF3B30',
    },
    dark: {
      background: '#000000',
      label: '#FFFFFF',
      secondaryLabel: 'rgba(235, 235, 245, 0.6)',
      tertiaryLabel: 'rgba(235, 235, 245, 0.3)',
      fill: 'rgba(118, 118, 128, 0.24)',
      fillPressed: 'rgba(120, 120, 128, 0.36)',
      tint: '#0A84FF',
      onTint: '#FFFFFF',
      success: '#30D158',
      danger: '#FF453A',
    },
  };
}

const palettes = createPalettes();

/** Call inside every component that renders colors: it re-renders them when the system theme flips. */
export function useColors() {
  return palettes[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

// `@expo/ui` text only takes plain color strings, so these mirror the iOS label colors.
const staticPalettes = {
  light: { label: '#000000', secondaryLabel: '#8A8A8E' },
  dark: { label: '#FFFFFF', secondaryLabel: '#98989F' },
} as const;

export function useStaticColors() {
  return staticPalettes[useColorScheme() === 'dark' ? 'dark' : 'light'];
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  headline: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 17, fontWeight: '400' },
  subhead: { fontSize: 15, fontWeight: '400' },
  footnote: { fontSize: 13, fontWeight: '400' },
} as const satisfies Record<string, TextStyle>;

// SF Pro Rounded on Apple platforms; the regular system face elsewhere.
const rounded =
  process.env.EXPO_OS === 'ios'
    ? 'ui-rounded'
    : process.env.EXPO_OS === 'web'
      ? 'ui-rounded, system-ui, sans-serif'
      : undefined;

/** Numbers that change in place use tabular figures so they don't jiggle. */
export const numerals = {
  hero: { fontFamily: rounded, fontSize: 88, fontWeight: '700', fontVariant: ['tabular-nums'] },
  question: { fontFamily: rounded, fontSize: 56, fontWeight: '700', fontVariant: ['tabular-nums'] },
  answer: { fontFamily: rounded, fontSize: 44, fontWeight: '600', fontVariant: ['tabular-nums'] },
  scoreboard: { fontFamily: rounded, fontSize: 32, fontWeight: '600', fontVariant: ['tabular-nums'] },
  key: { fontFamily: rounded, fontSize: 28, fontWeight: '500' },
  stat: { fontFamily: rounded, fontSize: 24, fontWeight: '600', fontVariant: ['tabular-nums'] },
} as const satisfies Record<string, TextStyle>;

// The same strong ease-out in the two forms Reanimated accepts.
export const motion = {
  fast: 150,
  base: 250,
  /** For `withTiming`. */
  easeOut: Easing.bezier(0.23, 1, 0.32, 1),
  /** For CSS animations and transitions. */
  cssEaseOut: cubicBezier(0.23, 1, 0.32, 1),
} as const;
