/**
 * @fileoverview Root provider composition for application-wide dependencies.
 * @module providers/app-providers
 */
import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import type { PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { navigationThemes } from '@theme/navigation-theme';

/**
 * Applies singleton providers required by the application shell.
 *
 * This is the only place global UI infrastructure such as gesture handling,
 * safe area support, navigation theming, and status bar policy should be mounted.
 *
 * Provider order matters:
 * 1. GestureHandlerRootView - Required for gesture-based navigation
 * 2. SafeAreaProvider - Device-specific safe area insets
 * 3. ThemeProvider - Navigation and component theming
 *
 * @param props - Component props
 * @param props.children - Application content to wrap with providers
 * @returns Provider-wrapped application shell
 *
 * @example
 * ```tsx
 * <AppProviders>
 *   <Stack />
 * </AppProviders>
 * ```
 */
const AppProviders = ({ children }: PropsWithChildren) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? navigationThemes.dark : navigationThemes.light;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={theme}>
          {children}
          <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export { AppProviders };
