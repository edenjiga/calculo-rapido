import { router } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { BONUS_EVERY, BONUS_TIME_MS, START_TIME_MS } from '@/constants';
import { useBestScore } from '@/hooks/use-best-score';
import { useSettings } from '@/hooks/use-settings';
import { numerals, spacing, typography, useColors } from '@/theme';
import { DIFFICULTY_HINTS, DIFFICULTY_LABELS, describeOperations } from '@/utils/settings';

type Rule = { icon: SymbolViewProps['name']; text: string };

const RULES: Rule[] = [
  {
    icon: { ios: 'timer', android: 'timer', web: 'timer' },
    text: `Tienes ${START_TIME_MS / 1000} segundos para resolver todas las operaciones que puedas.`,
  },
  {
    icon: { ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' },
    text: 'Completa las cifras indicadas: la respuesta se evalúa y pasas a la siguiente automáticamente.',
  },
  {
    icon: { ios: 'bolt.fill', android: 'bolt', web: 'bolt' },
    text: `Cada ${BONUS_EVERY} aciertos seguidos ganas ${BONUS_TIME_MS / 1000} segundos más.`,
  },
  {
    icon: { ios: 'arrow.counterclockwise', android: 'replay', web: 'replay' },
    text: 'Si fallas, la racha vuelve a cero, pero no pierdes tus aciertos.',
  },
];

export default function Home() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const settings = useSettings();
  const best = useBestScore(settings.difficulty);
  const level = DIFFICULTY_LABELS[settings.difficulty];
  const hint = DIFFICULTY_HINTS[settings.difficulty];

  // The last two rules describe the current settings.
  const rules: Rule[] = [
    ...RULES,
    {
      icon: { ios: 'plus.forwardslash.minus', android: 'calculate', web: 'calculate' },
      text: `${describeOperations(settings.operations)}.`,
    },
    {
      icon: { ios: 'speedometer', android: 'speed', web: 'speed' },
      text: `Nivel ${level}: ${hint.charAt(0).toLowerCase()}${hint.slice(1)}`,
    },
  ];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        flexGrow: 1,
        gap: spacing.xl,
        padding: spacing.md,
        // iOS already insets for the home indicator via contentInsetAdjustmentBehavior.
        paddingBottom: (process.env.EXPO_OS === 'ios' ? 0 : insets.bottom) + spacing.md,
      }}>
      <View style={{ flex: 1, justifyContent: 'center', gap: spacing.xxl }}>
        <View style={{ alignItems: 'center' }}>
          <Text
            style={[
              typography.footnote,
              { color: colors.secondaryLabel, fontWeight: '600', textTransform: 'uppercase' },
            ]}>
            Tu récord en {level}
          </Text>
          <Text style={[numerals.hero, { color: best ? colors.label : colors.tertiaryLabel }]}>
            {best}
          </Text>
          <Text style={[typography.subhead, { color: colors.secondaryLabel }]}>
            {best ? (best === 1 ? 'acierto' : 'aciertos') : 'Juega tu primera partida'}
          </Text>
        </View>

        <View style={{ gap: spacing.md }}>
          <Text style={[typography.headline, { color: colors.label }]}>Cómo se juega</Text>
          {rules.map(({ icon, text }) => (
            <View key={text} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <SymbolView name={icon} size={24} tintColor={colors.tint} />
              <Text style={[typography.subhead, { flex: 1, color: colors.secondaryLabel }]}>{text}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Button title="Jugar" onPress={() => router.push('/game')} />
        <Button title="Configurar" variant="secondary" onPress={() => router.push('/settings')} />
      </View>
    </ScrollView>
  );
}
