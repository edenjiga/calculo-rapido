import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import { radius, spacing, typography, useColors } from '@/theme';

type Variant = 'primary' | 'secondary';

export function Button({
  title,
  variant = 'primary',
  onPress,
  style,
}: {
  title: string;
  variant?: Variant;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const colors = useColors();
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      pressRetentionOffset={spacing.lg}
      style={({ pressed }) => [
        {
          minHeight: 56,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radius.full,
          backgroundColor: primary ? colors.tint : colors.fill,
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}>
      <Text style={[typography.headline, { color: primary ? colors.onTint : colors.tint }]}>
        {title}
      </Text>
    </Pressable>
  );
}
