import { InstrumentSerif_400Regular, useFonts } from '@expo-google-fonts/instrument-serif';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors, DisplayFont } from '@/constants/theme';
import { TripsProvider } from '@/lib/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const palette = dark ? Colors.dark : Colors.light;

  const [fontsLoaded] = useFonts({ InstrumentSerif_400Regular });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  const navTheme = {
    ...(dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(dark ? DarkTheme : DefaultTheme).colors,
      background: palette.background,
      card: palette.background,
      text: palette.text,
      border: palette.border,
      primary: palette.tint,
    },
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider value={navTheme}>
        <TripsProvider>
          <Stack
            screenOptions={{
              headerShadowVisible: false,
              headerTintColor: palette.tint,
              headerTitleStyle: {
                fontFamily: DisplayFont,
                fontSize: 21,
                color: palette.text,
              },
              contentStyle: { backgroundColor: palette.background },
            }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="new-trip"
              options={{ title: 'Plan a trip', presentation: 'modal' }}
            />
            <Stack.Screen name="join" options={{ title: 'An invitation' }} />
            <Stack.Screen name="trip/[id]/index" options={{ title: 'Where to meet' }} />
            <Stack.Screen name="trip/[id]/[city]" options={{ title: 'Destination' }} />
          </Stack>
        </TripsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
