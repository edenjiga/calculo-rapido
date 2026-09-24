import { Pressable, Text, View } from 'react-native';

import { radius, spacing, typography, useColors } from '@/theme';

export type SegmentedControlProps<T extends string> = {
  options: readonly { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
};

/**
 * Picks one of a few options, all visible at once. iOS and Android render the native
 * control (see the `.ios` and `.android` files); this is the web version.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const colors = useColors();

  return (
    <View
      role="radiogroup"
      style={{
        flexDirection: 'row',
        padding: spacing.xs,
        borderRadius: radius.md,
        borderCurve: 'continuous',
        backgroundColor: colors.fill,
      }}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            role="radio"
            aria-checked={selected}
            onPress={() => onChange(option.value)}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: spacing.sm,
              // Inner corners follow the outer ones, inset by the padding.
              borderRadius: radius.md - spacing.xs,
              backgroundColor: selected ? colors.tint : 'transparent',
            }}>
            <Text
              style={[
                typography.subhead,
                { fontWeight: '600', color: selected ? colors.onTint : colors.label },
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
