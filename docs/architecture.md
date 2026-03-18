# Architecture

## Goals

- Keep routing declarative and minimal.
- Avoid leaking app-wide dependencies deep into the tree.
- Make replacement of infrastructure simple as the assessment grows.

## Directory Rules

### `app/`

- Expo Router screens and navigation.
- Each route file contains its screen component.
- Keep screens focused on composition using shared components.

### `src/components/`

- Reusable UI building blocks with low domain coupling.
- Theme-aware primitives like AppText, AppLayout, buttons, inputs.
- Organized into `shared/` for cross-app primitives.

### `src/config/`

- Runtime environment configuration.
- Keep all direct environment access centralized here.

### `src/constants/`

- App-wide constants, enums, and theme tokens.
- Theme lives in `constants/theme/` with colors, spacing, typography.

### `src/hooks/`, `src/utils/`

- Cross-cutting helpers and custom hooks.
- Keep these domain-agnostic and reusable.

### `src/providers/`

- Singleton provider composition for the app shell.
- Gesture handling, safe area, navigation theming.

## Import Direction

- `app` may import from all `src/` folders.
- `src/providers` may import from `src/constants/theme`.
- `src/components` may import from `src/constants`, `src/hooks`, `src/utils`.
- `src/components` must not import from `app/` routes.

## Baseline Standards

- Use aliases instead of brittle deep relative imports.
- Keep screen files focused on composition.
- Keep runtime env reads in one place.
- Prefer explicit semantic tokens over raw values as the app grows.
- Add libraries only when a concrete problem exists.
