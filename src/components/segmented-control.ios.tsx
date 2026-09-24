import { Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

import type { SegmentedControlProps } from '@/components/segmented-control';

/** The native segmented control, through SwiftUI. Render inside an `@expo/ui` `Host`. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <Picker modifiers={[pickerStyle('segmented')]} selection={value} onSelectionChange={onChange}>
      {options.map((option) => (
        <Text key={option.value} modifiers={[tag(option.value)]}>
          {option.label}
        </Text>
      ))}
    </Picker>
  );
}
