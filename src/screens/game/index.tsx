import { Stack } from 'expo-router/stack';
import { useEffect, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnswerDisplay, FeedbackLine } from '@/screens/game/answer';
import { Keypad } from '@/screens/game/keypad';
import { StreakMeter, TimeBar } from '@/screens/game/meters';
import { Results } from '@/screens/game/results';
import { Scoreboard } from '@/screens/game/scoreboard';
import { useGame } from '@/screens/game/use-game';
import { numerals, spacing, useColors } from '@/theme';
import { answerLength, type Digit } from '@/utils/game';
import { formatQuestion, speakQuestion } from '@/utils/questions';
import { DIFFICULTY_LABELS } from '@/utils/settings';
import { getBestScore, getSettings, saveScore } from '@/utils/storage';

const LOW_TIME_S = 10;
const RESULTS_DELAY_MS = 900;

export function Game() {
  const colors = useColors();
  // Results show in place, so "Jugar otra vez" needs no navigation and back always
  // returns home. A new key remounts the round, which starts over with fresh state.
  const [round, setRound] = useState(0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Round key={round} onPlayAgain={() => setRound((n) => n + 1)} />
    </View>
  );
}

function Round({ onPlayAgain }: { onPlayAgain: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  // A round keeps the settings it started with, even if they change mid-game.
  const [settings] = useState(getSettings);
  const { difficulty } = settings;
  const [previousBest] = useState(() => getBestScore(difficulty));
  const [showResults, setShowResults] = useState(false);
  const game = useGame(settings);
  const { status, score, errors, bestStreak, bonuses, type, erase } = game;
  const over = status === 'over';

  // Hold on "¡Tiempo!" for a beat so the ending registers, then show the results.
  useEffect(() => {
    if (!over) return;
    saveScore(difficulty, score);
    const timeout = setTimeout(() => setShowResults(true), RESULTS_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [over, difficulty, score]);

  // Physical keyboards on web.
  useEffect(() => {
    if (process.env.EXPO_OS !== 'web' || over) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat) return;
      if (/^\d$/.test(event.key)) type(event.key as Digit);
      else if (event.key === 'Backspace') erase();
      else return;
      event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [over, type, erase]);

  if (showResults) {
    return (
      <>
        <Stack.Screen options={{ title: 'Resultado' }} />
        <Results
          difficulty={difficulty}
          score={score}
          errors={errors}
          bestStreak={bestStreak}
          bonuses={bonuses}
          isRecord={score > previousBest}
          onPlayAgain={onPlayAgain}
        />
      </>
    );
  }

  const low = game.seconds <= LOW_TIME_S;
  // Bigger keys on bigger phones, still fitting a 4.7" screen.
  const keyHeight = Math.round(Math.min(68, Math.max(52, height * 0.075)));

  return (
    <>
      <Stack.Screen options={{ title: DIFFICULTY_LABELS[difficulty] }} />
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 480,
          alignSelf: 'center',
          paddingHorizontal: spacing.md,
          paddingTop: spacing.sm,
          paddingBottom: insets.bottom + spacing.md,
          gap: spacing.md,
        }}>
        <Scoreboard seconds={game.seconds} low={low} score={score} bonuses={bonuses} />
        <TimeBar deadline={game.deadline} running={!over} low={low} />
        <StreakMeter streak={game.streak} />

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
          <Text
            accessibilityLabel={speakQuestion(game.question)}
            adjustsFontSizeToFit
            numberOfLines={1}
            maxFontSizeMultiplier={1.2}
            style={[numerals.question, { color: colors.label, opacity: over ? 0.4 : 1 }]}>
            {formatQuestion(game.question)}
          </Text>
          <AnswerDisplay
            input={game.input}
            digits={answerLength(game.question)}
            feedback={game.feedback}
            over={over}
          />
          <FeedbackLine feedback={game.feedback} />
        </View>

        <Keypad
          keyHeight={keyHeight}
          inactive={over}
          onDigit={type}
          onErase={erase}
        />
      </View>
    </>
  );
}
