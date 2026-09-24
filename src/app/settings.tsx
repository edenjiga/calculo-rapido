import { FieldGroup, Host, Switch, Text } from '@expo/ui';

import { SegmentedControl } from '@/components/segmented-control';
import { useSettings } from '@/hooks/use-settings';
import { useStaticColors } from '@/theme';
import { DIFFICULTIES, OPERATIONS } from '@/utils/questions';
import {
  DIFFICULTY_HINTS,
  DIFFICULTY_LABELS,
  EASY_DIVISION_HINT,
  OPERATION_LABELS,
  setOperation,
} from '@/utils/settings';
import { saveSettings } from '@/utils/storage';

const DIFFICULTY_OPTIONS = DIFFICULTIES.map((difficulty) => ({
  label: DIFFICULTY_LABELS[difficulty],
  value: difficulty,
}));

export default function SettingsScreen() {
  const settings = useSettings();
  const colors = useStaticColors();
  const footnote = { fontSize: 13, color: colors.secondaryLabel };
  const lastOneOn = settings.operations.length === 1;
  const hint =
    settings.difficulty === 'easy'
      ? `${DIFFICULTY_HINTS.easy} ${EASY_DIVISION_HINT}`
      : DIFFICULTY_HINTS[settings.difficulty];

  return (
    <Host style={{ flex: 1 }}>
      <FieldGroup>
        <FieldGroup.Section title="Dificultad">
          <SegmentedControl
            options={DIFFICULTY_OPTIONS}
            value={settings.difficulty}
            onChange={(difficulty) => saveSettings({ ...settings, difficulty })}
          />
          <FieldGroup.SectionFooter>
            <Text textStyle={footnote}>{hint}</Text>
          </FieldGroup.SectionFooter>
        </FieldGroup.Section>

        <FieldGroup.Section title="Operaciones">
          {OPERATIONS.map((operation) => {
            const on = settings.operations.includes(operation);
            return (
              <Switch
                key={operation}
                label={OPERATION_LABELS[operation]}
                value={on}
                // The last operation that's on stays on: a round needs something to ask.
                disabled={on && lastOneOn}
                onValueChange={(value) => saveSettings(setOperation(settings, operation, value))}
              />
            );
          })}
          <FieldGroup.SectionFooter>
            <Text textStyle={footnote}>Deja al menos una operación activa.</Text>
          </FieldGroup.SectionFooter>
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}
