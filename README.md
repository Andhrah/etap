# ETAP Mobile

Production-grade Expo Router scaffold for a mobile assessment codebase. This repository is intentionally set up as a clean foundation, not as a feature-complete app.

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

## Environment

Expo public runtime variables should use the `EXPO_PUBLIC_` prefix.

```bash
EXPO_PUBLIC_APP_NAME=ETAP
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

The current baseline reads these values from `src/app/config/env.ts` and exposes the active app environment in the Expo config.

## Notes

- This setup intentionally removes demo/template code from `create-expo-app`.
- Native folders are not committed; generate them only when the delivery requirements justify prebuild/native customization.
- The next implementation step should happen inside a feature slice under `src/features/`.
