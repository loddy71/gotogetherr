import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { TripsProvider } from '@/lib/store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const palette = dark ? Colors.dark : Colors.light;

  const navTheme = {
    ...(dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(dark ? DarkTheme : DefaultTheme).colors,
      background: palette.background,
      card: palette.background,
      text: palette.text,
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
              headerTitleStyle: { fontWeight: '700', color: palette.text },
            }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen
              name="new-trip"
              options={{ title: 'Plan a trip', presentation: 'modal' }}
            />
            <Stack.Screen name="join" options={{ title: 'Trip invite' }} />
            <Stack.Screen name="trip/[id]/index" options={{ title: 'Best cities' }} />
            <Stack.Screen name="trip/[id]/[city]" options={{ title: 'Destination' }} />
          </Stack>
        </TripsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
