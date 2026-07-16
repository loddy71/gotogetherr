import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { TripsProvider } from '@/lib/store';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <TripsProvider>
          <Stack>
            <Stack.Screen name="index" options={{ title: 'GoTogether' }} />
            <Stack.Screen name="new-trip" options={{ title: 'Plan a trip', presentation: 'modal' }} />
            <Stack.Screen name="trip/[id]/index" options={{ title: 'Best cities' }} />
            <Stack.Screen name="trip/[id]/[city]" options={{ title: 'Destination' }} />
          </Stack>
        </TripsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
