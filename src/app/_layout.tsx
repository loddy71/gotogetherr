// Per-weight imports: the package root would bundle every weight and italic.
import { SofiaSansCondensed_700Bold } from '@expo-google-fonts/sofia-sans-condensed/700Bold';
import { SofiaSansCondensed_800ExtraBold } from '@expo-google-fonts/sofia-sans-condensed/800ExtraBold';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { TripsProvider } from '@/lib/store';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const palette = dark ? Colors.dark : Colors.light;

  // expo-font's hook also emits @font-face into the static web export, so the
  // display face paints with the page instead of after the bundle runs.
  const [fontsLoaded, fontError] = useFonts({ SofiaSansCondensed_700Bold, SofiaSansCondensed_800ExtraBold });

  useEffect(() => {
    // Never strand the splash: fall back to the system sans on error.
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={navTheme}>
          <TripsProvider>
            <StatusBar style={dark ? 'light' : 'dark'} />
            {/* Every screen draws its own header so large titles can collapse smoothly. */}
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: palette.background },
              }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="new-trip" options={{ presentation: 'modal', animation: 'default' }} />
              <Stack.Screen name="join" />
              <Stack.Screen name="trip/[id]/index" />
              <Stack.Screen name="trip/[id]/[city]" />
            </Stack>
          </TripsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
