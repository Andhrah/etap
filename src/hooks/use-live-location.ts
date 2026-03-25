/**
 * @fileoverview Foreground location permission and watch management.
 * @module hooks/use-live-location
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { PermissionsAndroid, Platform } from 'react-native';
import type { GeoError, GeoPosition } from 'react-native-geolocation-service';

import type { GeofenceCoordinate } from '@constants/geofence';

/**
 * Supported foreground permission states returned to the UI.
 */
type LocationPermissionState = 'checking' | 'granted' | 'denied' | 'unsupported';

/**
 * Normalized platform permission outcomes.
 */
type PlatformPermissionResult = 'granted' | 'denied' | 'blocked' | 'unsupported';

type NativeGeolocationModule = typeof import('react-native-geolocation-service');
type NativeGeolocationRequireResult =
  | NativeGeolocationModule
  | {
      default: NativeGeolocationModule;
    };
type ExpoLocationModule = typeof import('expo-location');
type ExpoLocationSubscription = {
  remove: () => void;
};
type LocationProvider = 'expo' | 'native' | 'unsupported';

/**
 * Hook return shape for live location management.
 */
type UseLiveLocationResult = {
  currentLocation: GeofenceCoordinate | null;
  errorMessage: string | null;
  isLoading: boolean;
  permissionStatus: LocationPermissionState;
  requestPermission: () => Promise<PlatformPermissionResult>;
};

/**
 * Normalizes geolocation coordinates into the app's coordinate shape.
 *
 * @param coordinates - Raw geolocation coordinates
 * @returns Simplified coordinate object
 */
const toGeofenceCoordinate = (coordinates: Pick<GeoPosition['coords'], 'latitude' | 'longitude'>): GeofenceCoordinate => ({
  latitude: coordinates.latitude,
  longitude: coordinates.longitude,
});

let cachedNativeGeolocation: NativeGeolocationModule | null | undefined;
let cachedExpoLocation: ExpoLocationModule | null | undefined;

/**
 * Expo Go cannot load custom native modules such as react-native-geolocation-service.
 */
const isExpoGoRuntime = () =>
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Lazily loads expo-location when it is installed in the project.
 *
 * @returns Expo location module or null when unavailable
 */
const getExpoLocation = () => {
  if (cachedExpoLocation !== undefined) {
    return cachedExpoLocation;
  }

  try {
    cachedExpoLocation = require('expo-location') as ExpoLocationModule;
  } catch {
    cachedExpoLocation = null;
  }

  return cachedExpoLocation;
};

/**
 * Lazily loads the native geolocation module when the runtime supports it.
 *
 * @returns Native geolocation module or null when unavailable
 */
const getNativeGeolocation = () => {
  if (cachedNativeGeolocation !== undefined) {
    return cachedNativeGeolocation;
  }

  if (Platform.OS === 'web' || isExpoGoRuntime()) {
    cachedNativeGeolocation = null;
    return cachedNativeGeolocation;
  }

  try {
    const nativeGeolocationModule = require(
      'react-native-geolocation-service',
    ) as NativeGeolocationRequireResult;

    cachedNativeGeolocation =
      'default' in nativeGeolocationModule
        ? nativeGeolocationModule.default
        : nativeGeolocationModule;
  } catch {
    cachedNativeGeolocation = null;
  }

  return cachedNativeGeolocation;
};

/**
 * Selects the active location provider for the current runtime.
 *
 * @returns Provider identifier supported by the current runtime
 */
const getLocationProvider = (): LocationProvider => {
  if (Platform.OS === 'web') {
    return 'unsupported';
  }

  if (Platform.OS === 'android' && getExpoLocation() != null) {
    return 'expo';
  }

  if (isExpoGoRuntime()) {
    return getExpoLocation() == null ? 'unsupported' : 'expo';
  }

  if (getNativeGeolocation() != null) {
    return 'native';
  }

  if (getExpoLocation() != null) {
    return 'expo';
  }

  return 'unsupported';
};

/**
 * Describes why foreground location cannot start in the current runtime.
 *
 * @returns User-facing runtime support message
 */
const getUnsupportedRuntimeMessage = () =>
  'Location is unavailable in the current runtime. If you are using Expo Go, install expo-location or open a development build instead.';

/**
 * Maps geolocation errors to a user-facing message.
 *
 * @param error - Native geolocation error
 * @returns Readable error message
 */
const getLocationErrorMessage = (error: GeoError) => {
  if (error.code === 1) {
    return 'Location permission was denied. Enable it to use geofence monitoring.';
  }

  if (error.code === 2) {
    return 'Location is currently unavailable. Check your device location settings.';
  }

  if (error.code === 3) {
    return 'Location request timed out. Please try again.';
  }

  return 'Unable to read your location right now. Please try again.';
};

/**
 * Maps Expo Location errors to user-facing copy.
 *
 * @param errorMessage - Expo location error reason
 * @returns Readable error message
 */
const getExpoLocationErrorMessage = (errorMessage: string) => {
  const normalizedErrorMessage = errorMessage.toLowerCase();

  if (normalizedErrorMessage.includes('denied') || normalizedErrorMessage.includes('permission')) {
    return 'Location permission was denied. Enable it to use geofence monitoring.';
  }

  if (normalizedErrorMessage.includes('unavailable') || normalizedErrorMessage.includes('disabled')) {
    return 'Location is currently unavailable. Check your device location settings.';
  }

  if (normalizedErrorMessage.includes('timeout')) {
    return 'Location request timed out. Please try again.';
  }

  return 'Unable to read your location right now. Please try again.';
};

/**
 * Requests foreground location access and maintains a live location watcher.
 *
 * The hook owns permission state, current location, and cleanup of active
 * subscriptions so screens can focus on presentation and geofence behavior.
 *
 * Android prefers Expo Location when available because it aligns with Expo's
 * managed native dependency graph more reliably in dev and production builds.
 * The standalone native geolocation service remains as a fallback for runtimes
 * where Expo Location is not present.
 *
 * @returns Permission state, current location, and retry action
 */
const useLiveLocation = (): UseLiveLocationResult => {
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionState>('checking');
  const [currentLocation, setCurrentLocation] = useState<GeofenceCoordinate | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const watchIdRef = useRef<number | null>(null);
  const expoSubscriptionRef = useRef<ExpoLocationSubscription | null>(null);

  /**
   * Clears an active location watcher if one exists.
   */
  const clearWatcher = useCallback(() => {
    expoSubscriptionRef.current?.remove();
    expoSubscriptionRef.current = null;

    if (watchIdRef.current != null) {
      const nativeGeolocation = getNativeGeolocation();

      nativeGeolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    getNativeGeolocation()?.stopObserving();
  }, []);

  /**
   * Requests platform-correct foreground location permission.
   *
   * @returns True when access is granted, otherwise false
   */
  const requestPlatformPermission = useCallback(async (): Promise<PlatformPermissionResult> => {
    const locationProvider = getLocationProvider();

    if (locationProvider === 'unsupported') {
      return 'unsupported';
    }

    if (locationProvider === 'expo') {
      const expoLocation = getExpoLocation();

      if (expoLocation == null) {
        return 'unsupported';
      }

      const permissionResponse = await expoLocation.requestForegroundPermissionsAsync();

      if (permissionResponse.status === 'granted') {
        return 'granted';
      }

      return permissionResponse.canAskAgain ? 'denied' : 'blocked';
    }

    const nativeGeolocation = getNativeGeolocation();

    if (nativeGeolocation == null) {
      return 'unsupported';
    }

    if (Platform.OS === 'ios') {
      const authorizationStatus = await nativeGeolocation.requestAuthorization('whenInUse');

      if (authorizationStatus === 'granted') {
        return 'granted';
      }

      if (authorizationStatus === 'denied' || authorizationStatus === 'restricted' || authorizationStatus === 'disabled') {
        return 'blocked';
      }

      return 'denied';
    }

    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );

    if (fineLocationPermission === PermissionsAndroid.RESULTS.GRANTED) {
      return 'granted';
    }

    if (fineLocationPermission === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      return 'blocked';
    }

    return 'denied';
  }, []);

  /**
   * Starts the live foreground location watch after permission is granted.
   */
  const startLocationWatch = useCallback(async () => {
    clearWatcher();

    const locationProvider = getLocationProvider();

    if (locationProvider === 'unsupported') {
      setErrorMessage(getUnsupportedRuntimeMessage());
      setCurrentLocation(null);
      setIsLoading(false);
      return;
    }

    if (locationProvider === 'expo') {
      const expoLocation = getExpoLocation();

      if (expoLocation == null) {
        setErrorMessage(getUnsupportedRuntimeMessage());
        setCurrentLocation(null);
        setIsLoading(false);
        return;
      }

      try {
        const currentPosition = await expoLocation.getCurrentPositionAsync({
          accuracy: expoLocation.Accuracy.Highest,
          mayShowUserSettingsDialog: true,
        });

        setCurrentLocation(toGeofenceCoordinate(currentPosition.coords));
        setErrorMessage(null);
        setIsLoading(false);

        expoSubscriptionRef.current = await expoLocation.watchPositionAsync(
          {
            accuracy: expoLocation.Accuracy.Highest,
            distanceInterval: 5,
            mayShowUserSettingsDialog: true,
            timeInterval: 3_000,
          },
          (nextPosition) => {
            setCurrentLocation(toGeofenceCoordinate(nextPosition.coords));
            setErrorMessage(null);
          },
          (reason) => {
            setErrorMessage(getExpoLocationErrorMessage(reason));
          },
        );
      } catch (error) {
        setErrorMessage(
          getExpoLocationErrorMessage(
            error instanceof Error ? error.message : 'Unable to read your location right now.',
          ),
        );
        setCurrentLocation(null);
        setIsLoading(false);
      }

      return;
    }

    const nativeGeolocation = getNativeGeolocation();

    if (nativeGeolocation == null) {
      setErrorMessage(getUnsupportedRuntimeMessage());
      setCurrentLocation(null);
      setIsLoading(false);
      return;
    }

    nativeGeolocation.getCurrentPosition(
      (currentPosition: GeoPosition) => {
        setCurrentLocation(toGeofenceCoordinate(currentPosition.coords));
        setErrorMessage(null);
        setIsLoading(false);
      },
      (error: GeoError) => {
        setErrorMessage(getLocationErrorMessage(error));
        setCurrentLocation(null);
        setIsLoading(false);
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        enableHighAccuracy: true,
        forceRequestLocation: true,
        showLocationDialog: true,
        timeout: 15_000,
        maximumAge: 5_000,
      },
    );

    watchIdRef.current = nativeGeolocation.watchPosition(
      (nextPosition) => {
        setCurrentLocation(toGeofenceCoordinate(nextPosition.coords));
        setErrorMessage(null);
      },
      (error) => {
        setErrorMessage(getLocationErrorMessage(error));
      },
      {
        accuracy: {
          android: 'high',
          ios: 'best',
        },
        distanceFilter: 5,
        enableHighAccuracy: true,
        forceLocationManager: false,
        interval: 3_000,
        fastestInterval: 2_000,
        showsBackgroundLocationIndicator: false,
        useSignificantChanges: false,
      },
    );
  }, [clearWatcher]);

  /**
   * Requests location access and starts tracking when permission is granted.
   */
  const requestPermission = useCallback(async (): Promise<PlatformPermissionResult> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const permissionResult = await requestPlatformPermission();
      const isRuntimeUnsupported = permissionResult === 'unsupported';

      if (permissionResult !== 'granted') {
        clearWatcher();
        setPermissionStatus(isRuntimeUnsupported ? 'unsupported' : 'denied');
        setCurrentLocation(null);
        setErrorMessage(
          isRuntimeUnsupported
            ? getUnsupportedRuntimeMessage()
            : permissionResult === 'blocked'
              ? 'Location access is blocked for this app. Enable it from your device settings to use geofence monitoring.'
              : 'Location permission was denied. Enable it to use geofence monitoring.',
        );
        setIsLoading(false);
        return permissionResult;
      }

      setPermissionStatus('granted');
      await startLocationWatch();
      return 'granted';
    } catch {
      clearWatcher();
      setPermissionStatus('denied');
      setCurrentLocation(null);
      setErrorMessage('Unable to read your location right now. Please try again.');
      setIsLoading(false);
      return 'denied';
    }
  }, [clearWatcher, requestPlatformPermission, startLocationWatch]);

  useEffect(() => {
    void requestPermission();

    return () => {
      clearWatcher();
    };
  }, [clearWatcher, requestPermission]);

  return {
    currentLocation,
    errorMessage,
    isLoading,
    permissionStatus,
    requestPermission,
  };
};

export { useLiveLocation };
export type { LocationPermissionState, PlatformPermissionResult, UseLiveLocationResult };
