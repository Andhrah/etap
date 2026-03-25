/**
 * @fileoverview Pure geofence math and transition utilities.
 * @module utils/geofence
 */
import type {
  GeofenceCoordinate,
  GeofenceStatus,
  GeofenceTransitionType,
} from '@constants/geofence';

/**
 * Mean earth radius in meters used by the Haversine formula.
 */
const EARTH_RADIUS_METERS = 6_371_000;

/**
 * Converts degrees to radians for trigonometric calculations.
 *
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 */
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Computes the great-circle distance between two coordinates in meters.
 *
 * @param from - Starting coordinate
 * @param to - Destination coordinate
 * @returns Distance in meters
 */
const calculateDistanceMeters = (from: GeofenceCoordinate, to: GeofenceCoordinate) => {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const a =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
};

/**
 * Resolves whether the user should be considered inside or outside a geofence.
 *
 * A small hysteresis buffer is applied around the radius when a previous state
 * exists so noisy GPS updates near the edge do not rapidly flip state.
 *
 * @param params - Geofence evaluation input
 * @param params.distanceMeters - Current distance from the center
 * @param params.radiusMeters - Active radius in meters
 * @param params.previousStatus - Last known geofence membership state
 * @param params.hysteresisMeters - Boundary buffer used to reduce chatter
 * @returns Normalized geofence status
 */
const getGeofenceStatus = ({
  distanceMeters,
  radiusMeters,
  previousStatus,
  hysteresisMeters,
}: {
  distanceMeters: number;
  radiusMeters: number;
  previousStatus: GeofenceStatus;
  hysteresisMeters: number;
}): GeofenceStatus => {
  if (previousStatus === 'unknown') {
    return distanceMeters <= radiusMeters ? 'inside' : 'outside';
  }

  if (previousStatus === 'inside') {
    return distanceMeters <= radiusMeters + hysteresisMeters ? 'inside' : 'outside';
  }

  return distanceMeters < radiusMeters - hysteresisMeters ? 'inside' : 'outside';
};

/**
 * Detects whether a state change should emit an entry or exit transition.
 *
 * @param previousStatus - Prior stable geofence state
 * @param nextStatus - Newly computed geofence state
 * @returns Transition type when a boundary crossing occurred, otherwise null
 */
const getGeofenceTransition = (
  previousStatus: GeofenceStatus,
  nextStatus: GeofenceStatus,
): GeofenceTransitionType | null => {
  if (previousStatus === nextStatus || previousStatus === 'unknown' || nextStatus === 'unknown') {
    return null;
  }

  return previousStatus === 'outside' ? 'enter' : 'exit';
};

/**
 * Clamps a user-controlled geofence radius to supported limits.
 *
 * @param radiusMeters - Requested radius in meters
 * @param minRadiusMeters - Minimum supported radius
 * @param maxRadiusMeters - Maximum supported radius
 * @returns Safe radius value within the configured bounds
 */
const clampRadiusMeters = (
  radiusMeters: number,
  minRadiusMeters: number,
  maxRadiusMeters: number,
) => Math.min(Math.max(radiusMeters, minRadiusMeters), maxRadiusMeters);

export {
  calculateDistanceMeters,
  clampRadiusMeters,
  getGeofenceStatus,
  getGeofenceTransition,
};
