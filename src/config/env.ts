/**
 * @fileoverview Centralized runtime configuration from Expo environment variables.
 * @module config/env
 */

/** Application display name from EXPO_PUBLIC_APP_NAME */
const appName = process.env.EXPO_PUBLIC_APP_NAME ?? 'ETAP';

/** Current deployment environment from EXPO_PUBLIC_APP_ENV */
const appEnv = process.env.EXPO_PUBLIC_APP_ENV ?? 'development';

/** Backend API base URL from EXPO_PUBLIC_API_BASE_URL */
const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

/**
 * Normalized runtime configuration read from Expo public environment variables.
 *
 * Keep all direct environment access in this module so the rest of the app
 * depends on a typed, stable configuration object.
 *
 * @property appName - Display name of the application
 * @property appEnv - Current environment (development, staging, production)
 * @property apiBaseUrl - Base URL for API requests
 * @property isDevelopment - True when running in development mode
 * @property isProduction - True when running in production mode
 *
 * @example
 * ```ts
 * import { env } from '@config/env';
 *
 * if (env.isDevelopment) {
 *   console.log('Debug mode enabled');
 * }
 * ```
 */
const env = {
  appName,
  appEnv,
  apiBaseUrl,
  isDevelopment: appEnv === 'development',
  isProduction: appEnv === 'production',
} as const;

/**
 * Union type representing valid application environment values.
 */
type AppEnvironment = typeof env.appEnv;

export { env };
export type { AppEnvironment };

