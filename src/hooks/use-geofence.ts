/**
 * @fileoverview Geofence state, evaluation, and transition monitoring hook.
 * @module hooks/use-geofence
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  DEFAULT_GEOFENCE_RADIUS_METERS,
  GEOFENCE_HYSTERESIS_METERS,
  MAX_GEOFENCE_RADIUS_METERS,
  MIN_GEOFENCE_RADIUS_METERS,
} from '@constants/geofence';
import type {
  GeofenceCoordinate,
  GeofenceStatus,
  GeofenceTransitionType,
} from '@constants/geofence';
import {
  calculateDistanceMeters,
  clampRadiusMeters,
  getGeofenceStatus,
  getGeofenceTransition,
} from '@utils/geofence';

/**
 * Transition payload emitted when the user enters or exits the geofence.
 */
type GeofenceTransitionEvent = {
  distanceMeters: number;
  occurredAt: number;
  type: GeofenceTransitionType;
};

/**
 * Hook return shape for geofence state management.
 */
type UseGeofenceResult = {
  clearGeofence: () => void;
  distanceMeters: number | null;
  geofenceCenter: GeofenceCoordinate | null;
  radiusMeters: number;
  setGeofenceCenter: (nextCenter: GeofenceCoordinate) => void;
  setRadiusMeters: (nextRadiusMeters: number) => void;
  status: GeofenceStatus;
  transition: GeofenceTransitionEvent | null;
};

/**
 * Manages the active geofence, evaluates membership, and emits boundary transitions.
 *
 * Geofence reconfiguration does not emit enter or exit alerts. Only live
 * location updates crossing an existing boundary create transition events.
 *
 * @param currentLocation - Current user location from the live location hook
 * @returns Geofence state and update actions
 */
const useGeofence = (
  currentLocation: GeofenceCoordinate | null,
): UseGeofenceResult => {
  const [geofenceCenter, setGeofenceCenterState] = useState<GeofenceCoordinate | null>(null);
  const [radiusMeters, setRadiusMetersState] = useState(DEFAULT_GEOFENCE_RADIUS_METERS);
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null);
  const [status, setStatus] = useState<GeofenceStatus>('unknown');
  const [transition, setTransition] = useState<GeofenceTransitionEvent | null>(null);

  const previousStatusRef = useRef<GeofenceStatus>('unknown');
  const previousSignatureRef = useRef('none');

  const geofenceSignature = useMemo(() => {
    if (geofenceCenter == null) {
      return 'none';
    }

    return [
      geofenceCenter.latitude.toFixed(6),
      geofenceCenter.longitude.toFixed(6),
      radiusMeters,
    ].join(':');
  }, [geofenceCenter, radiusMeters]);

  /**
   * Sets a new geofence center from the map interaction.
   *
   * @param nextCenter - New center coordinate selected on the map
   */
  const setGeofenceCenter = (nextCenter: GeofenceCoordinate) => {
    setGeofenceCenterState(nextCenter);
  };

  /**
   * Updates the active radius while keeping it within supported UI limits.
   *
   * @param nextRadiusMeters - Requested radius in meters
   */
  const setRadiusMeters = (nextRadiusMeters: number) => {
    setRadiusMetersState(
      clampRadiusMeters(
        nextRadiusMeters,
        MIN_GEOFENCE_RADIUS_METERS,
        MAX_GEOFENCE_RADIUS_METERS,
      ),
    );
  };

  /**
   * Clears the active geofence and resets derived monitoring state.
   */
  const clearGeofence = () => {
    setGeofenceCenterState(null);
    setDistanceMeters(null);
    setStatus('unknown');
    setTransition(null);
    previousStatusRef.current = 'unknown';
    previousSignatureRef.current = 'none';
  };

  useEffect(() => {
    if (geofenceCenter == null || currentLocation == null) {
      setDistanceMeters(null);
      setStatus('unknown');
      setTransition(null);
      previousStatusRef.current = 'unknown';
      previousSignatureRef.current = geofenceSignature;
      return;
    }

    const nextDistanceMeters = calculateDistanceMeters(currentLocation, geofenceCenter);
    const nextStatus = getGeofenceStatus({
      distanceMeters: nextDistanceMeters,
      radiusMeters,
      previousStatus: previousStatusRef.current,
      hysteresisMeters: GEOFENCE_HYSTERESIS_METERS,
    });

    setDistanceMeters(nextDistanceMeters);

    if (previousSignatureRef.current !== geofenceSignature) {
      previousSignatureRef.current = geofenceSignature;
      previousStatusRef.current = nextStatus;
      setStatus(nextStatus);
      setTransition(null);
      return;
    }

    const nextTransition = getGeofenceTransition(previousStatusRef.current, nextStatus);

    setStatus(nextStatus);
    setTransition(
      nextTransition == null
        ? null
        : {
            distanceMeters: nextDistanceMeters,
            occurredAt: Date.now(),
            type: nextTransition,
          },
    );
    previousStatusRef.current = nextStatus;
  }, [currentLocation, geofenceCenter, geofenceSignature, radiusMeters]);

  return {
    clearGeofence,
    distanceMeters,
    geofenceCenter,
    radiusMeters,
    setGeofenceCenter,
    setRadiusMeters,
    status,
    transition,
  };
};

export { useGeofence };
export type { GeofenceTransitionEvent, UseGeofenceResult };
