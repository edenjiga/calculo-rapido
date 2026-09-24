import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { useIconFont } from '@/hooks/use-icon-font';
import { useColors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const scheme = useColorScheme();
  const colors = useColors();
  const iconFontReady = useIconFont();

  useEffect(() => {
    if (iconFontReady) SplashScreen.hideAsync();
  }, [iconFontReady]);

  if (!iconFontReady) return null;

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          headerLargeTitleShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTitleStyle: { color: colors.label },
          headerLargeTitleStyle: { color: colors.label },
          headerTintColor: colors.tint,
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="index" options={{ title: 'Calculo Rapido', headerLargeTitleEnabled: true }} />
        <Stack.Screen name="game" options={{ title: '' }} />
        <Stack.Screen name="settings" options={{ title: 'Configurar' }} />
      </Stack>
    </ThemeProvider>
  );
}
