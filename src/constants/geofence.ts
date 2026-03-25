/**
 * @fileoverview Shared constants and types for geofencing behavior.
 * @module constants/geofence
 */
import type { Region } from 'react-native-maps';

/**
 * Geographic coordinate used for the user location and geofence center.
 */
type GeofenceCoordinate = {
  latitude: number;
  longitude: number;
};

/**
 * High-level geofence membership state.
 */
type GeofenceStatus = 'unknown' | 'inside' | 'outside';

/**
 * Transition types emitted when membership changes across the boundary.
 */
type GeofenceTransitionType = 'enter' | 'exit';

/**
 * Default geofence radius used before user adjustment.
 */
const DEFAULT_GEOFENCE_RADIUS_METERS = 200;

/**
 * Smallest radius supported by the UI control.
 */
const MIN_GEOFENCE_RADIUS_METERS = 50;

/**
 * Largest radius supported by the UI control.
 */
const MAX_GEOFENCE_RADIUS_METERS = 1000;

/**
 * Slider increment for radius adjustment.
 */
const GEOFENCE_RADIUS_STEP_METERS = 10;

/**
 * Buffer used to reduce alert churn near the geofence boundary.
 */
const GEOFENCE_HYSTERESIS_METERS = 15;

/**
 * Default map region used before a live device location is available.
 */
const DEFAULT_MAP_REGION: Region = {
  latitude: 6.5244,
  longitude: 3.3792,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

/**
 * Region delta applied when centering the map on the user's location.
 */
const USER_FOCUSED_REGION_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
} as const;

export {
  DEFAULT_GEOFENCE_RADIUS_METERS,
  DEFAULT_MAP_REGION,
  GEOFENCE_HYSTERESIS_METERS,
  GEOFENCE_RADIUS_STEP_METERS,
  MAX_GEOFENCE_RADIUS_METERS,
  MIN_GEOFENCE_RADIUS_METERS,
  USER_FOCUSED_REGION_DELTA,
};
export type { GeofenceCoordinate, GeofenceStatus, GeofenceTransitionType };
