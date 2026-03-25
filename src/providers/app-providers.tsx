/**
 * @fileoverview Root provider composition for application-wide dependencies.
 * @module providers/app-providers
 */
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useState,
} from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { navigationThemes } from '@theme/navigation-theme';

type AppThemeMode = 'light' | 'dark';

type AppThemeModeContextValue = {
  isDarkMode: boolean;
  setThemeMode: (nextMode: AppThemeMode) => void;
  toggleThemeMode: () => void;
  themeMode: AppThemeMode;
};

const AppThemeModeContext = createContext<AppThemeModeContextValue | null>(null);

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
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<AppThemeMode>(
    systemColorScheme === 'dark' ? 'dark' : 'light',
  );
  const theme = navigationThemes[themeMode];
  const contextValue = useMemo<AppThemeModeContextValue>(
    () => ({
      isDarkMode: themeMode === 'dark',
      setThemeMode,
      toggleThemeMode: () => {
        setThemeMode((currentMode) => (currentMode === 'dark' ? 'light' : 'dark'));
      },
      themeMode,
    }),
    [themeMode],
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppThemeModeContext.Provider value={contextValue}>
          <ThemeProvider value={theme}>
            {children}
            <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </AppThemeModeContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export { AppProviders };
export type { AppThemeMode, AppThemeModeContextValue };

/**
 * Returns the active app theme mode and mutation helpers.
 */
const useAppThemeMode = () => {
  const context = useContext(AppThemeModeContext);

  if (context == null) {
    throw new Error('useAppThemeMode must be used within AppProviders');
  }

  return context;
};

export { useAppThemeMode };
