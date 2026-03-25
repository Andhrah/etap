/**
 * @fileoverview Barrel export for shared constants and enums.
 * @module constants
 */

export {
  DEFAULT_GEOFENCE_RADIUS_METERS,
  DEFAULT_MAP_REGION,
  GEOFENCE_HYSTERESIS_METERS,
  GEOFENCE_RADIUS_STEP_METERS,
  MAX_GEOFENCE_RADIUS_METERS,
  MIN_GEOFENCE_RADIUS_METERS,
  USER_FOCUSED_REGION_DELTA,
} from './geofence';
export type { GeofenceCoordinate, GeofenceStatus, GeofenceTransitionType } from './geofence';
