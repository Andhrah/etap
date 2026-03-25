# ETAP Mobile

Geofence tracking app built with Expo Router, React Native Maps, and foreground live location monitoring.

## Principles

- File-based routing stays thin. Route files only compose screens and navigation.
- All product code lives under `src/`.
- Shared concerns are separated from feature concerns.
- Runtime configuration is typed and explicit.
- Tooling defaults favor strictness and maintainability.

## Project Structure

```text
app/                    Expo Router screens and navigation
docs/                   Architecture and engineering conventions
src/
  components/           Reusable UI building blocks
    shared/             Shared primitives (AppText, AppLayout, AppButton, etc.)
  config/               Runtime environment configuration
  constants/            App-wide constants and enums
    theme/              Colors, tokens, and navigation themes
  hooks/                Shared custom hooks
  providers/            Singleton provider composition
  utils/                Helper functions and utilities
```

Detailed conventions live in `docs/architecture.md`.

## Commands

```bash
npm install
npm run start
npm run ios
npm run android
npm run web
npm run lint
npm run typecheck
npm run check
```

## Setup

1. Install dependencies.
2. Create a `.env` file in the project root.
3. Add the required environment values.
4. Rebuild the native app after changing native config such as the Android Maps key.

## Environment

Expo public runtime variables should use the `EXPO_PUBLIC_` prefix.

```bash
EXPO_PUBLIC_APP_NAME=ETAP
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
GOOGLE_MAPS_API_KEY=your-android-google-maps-api-key
```

The runtime config is read from `src/config/env.ts`. The Android Google Maps key is read in `app.config.ts` and the native Android project.

## Testing The App

### Automated checks

```bash
npm run typecheck
npm test -- --runInBand
```

### Run on iOS

```bash
npm run ios
```

What to verify:

- Allow location permission when prompted.
- Confirm the map loads and centers on the current location.
- Tap the map or use current location to place a geofence.
- Adjust the radius and set the geofence.
- Move the device or simulator location across the boundary and confirm:
  - the top transition banner appears
  - a React Native alert is shown on enter or exit
  - the inside and outside status sheets update correctly

### Run on Android

```bash
npm run android
```

Android requirements:

- `GOOGLE_MAPS_API_KEY` must be set.
- The key must have `Maps SDK for Android` enabled in Google Cloud.
- If the key or native config changes, rebuild the app.

If installation fails with insufficient storage on a physical device, free storage or uninstall the existing app before rerunning the command.

### Manual geofence verification flow

1. Launch the app and grant location permission.
2. Create a geofence from the current location or a searched location.
3. Confirm the setup bottom sheet opens and the circular boundary is visible on the map.
4. Move outside the radius and confirm the `Boundary Breach` sheet appears and `Last Inside` updates over time.
5. Move back inside the radius and confirm the `Zone Status` sheet appears and `Duration` updates while the sheet remains open.
6. Use `Reset` to clear the geofence and confirm the setup sheet returns.

## Notes

- This app uses `react-native-maps` for map rendering.
- Android uses Google Maps and requires a valid API key.
- Live location monitoring is foreground-based in the current implementation.
- Geofence utility coverage lives in `src/utils/__tests__/geofence.test.ts`.
