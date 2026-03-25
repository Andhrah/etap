/**
 * @fileoverview Expo application configuration for managed native settings.
 * @module app.config
 */
import type { ExpoConfig } from 'expo/config';

const appName = process.env.EXPO_PUBLIC_APP_NAME ?? 'ETAP';
const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

/**
 * Managed Expo configuration for the ETAP geofencing assessment app.
 */
const config: ExpoConfig = {
  name: appName,
  slug: 'etap',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'etap',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.etap.mobile',
    infoPlist: {
      NSLocationWhenInUseUsageDescription:
        'Allow ETAP to access your location to place a geofence and detect entry or exit.',
    },
  },
  android: {
    package: 'com.etap.mobile',
    ...(googleMapsApiKey == null
      ? {}
      : { config: { googleMaps: { apiKey: googleMapsApiKey } } }),
    permissions: ['ACCESS_COARSE_LOCATION', 'ACCESS_FINE_LOCATION'],
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          'Allow ETAP to access your location to place a geofence and detect entry or exit.',
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/etap-logo.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#0B1220',
        dark: {
          backgroundColor: '#0B1220',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    appEnv,
  },
};

export default config;
