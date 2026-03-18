/**
 * @fileoverview Root layout for Expo Router navigation structure.
 * @module app/_layout
 */
import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { AppProviders } from '@providers/app-providers';

/**
 * Composes the top-level router tree and wraps it with app-wide providers.
 *
 * Route files stay intentionally thin so bootstrap concerns remain centralized.
 * All global providers are composed in AppProviders to keep this file minimal.
 *
 * @returns Root navigation stack wrapped with application providers
 */
const RootLayout = () => {
  return (
    <AppProviders>
      <Stack
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </AppProviders>
  );
};

export default RootLayout;
