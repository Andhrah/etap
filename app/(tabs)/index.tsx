/**
 * @fileoverview Main geofence tracking screen.
 * @module app/(tabs)/index
 */
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import MapView, { type MapPressEvent, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GeofenceBreachSheet } from '@components/geofence/geofence-breach-sheet';
import { GeofenceHelperCard } from '@components/geofence/geofence-helper-card';
import { MapPanel } from '@components/geofence/map-panel';
import { PermissionEmptyState } from '@components/geofence/permission-empty-state';
import { GeofenceSafeZoneSheet } from '@components/geofence/geofence-safe-zone-sheet';
import { RadiusControlCard } from '@components/geofence/radius-control-card';
import { GeofenceTransitionBanner } from '@components/geofence/geofence-transition-banner';
import { AppBottomSheet } from '@components/shared/app-bottom-sheet';
import { AppButton } from '@components/shared/app-button';
import { AppText } from '@components/shared/app-text';
import type { GeofenceCoordinate } from '@constants/geofence';
import { DEFAULT_MAP_REGION, USER_FOCUSED_REGION_DELTA } from '@constants/geofence';
import { useGeofence } from '@hooks/use-geofence';
import { useLiveLocation } from '@hooks/use-live-location';
import { getResponsiveSpacingScale, getScaledValue, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

type ExpoLocationModule = typeof import('expo-location');

let cachedExpoLocation: ExpoLocationModule | null | undefined;

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

const LOCATION_SEARCH_UNAVAILABLE_MESSAGE =
  'Location search is unavailable in this Android build. Rebuild the development client after adding expo-location to enable address search.';

type MovementTrend = 'away' | 'returning' | 'steady';

const getMovementLabel = (movementTrend: MovementTrend) => {
  if (movementTrend === 'away') {
    return 'Moving away';
  }

  if (movementTrend === 'returning') {
    return 'Returning inward';
  }

  return 'Holding position';
};

const getTransitionNotificationMessage = (transitionType: 'enter' | 'exit') =>
  transitionType === 'enter'
    ? 'You entered the geofenced area.'
    : 'You exited the geofenced area.';

/**
 * Builds a focused map region around the supplied coordinate.
 *
 * @param latitude - Latitude to center the map on
 * @param longitude - Longitude to center the map on
 * @returns Region suitable for an immediate map focus animation
 */
const buildFocusedRegion = (latitude: number, longitude: number): Region => ({
  latitude,
  longitude,
  latitudeDelta: USER_FOCUSED_REGION_DELTA.latitudeDelta,
  longitudeDelta: USER_FOCUSED_REGION_DELTA.longitudeDelta,
});

/**
 * Main map tab for the geofencing assessment.
 *
 * The screen composes the product flow states for permission handling,
 * map interaction, radius adjustment, and status monitoring.
 */
const MapScreen = () => {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const mapRef = useRef<MapView | null>(null);
  const hasAutoCenteredRef = useRef(false);
  const lastAlertTimestampRef = useRef<number | null>(null);
  const previousDistanceMetersRef = useRef<number | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSetupSheetOpen, setIsSetupSheetOpen] = useState(true);
  const [isStatusSheetVisible, setIsStatusSheetVisible] = useState(true);
  const [isTransitionBannerVisible, setIsTransitionBannerVisible] = useState(false);
  const [transitionBannerTone, setTransitionBannerTone] = useState<'enter' | 'exit'>('exit');
  const [lastEnteredAt, setLastEnteredAt] = useState<number | null>(null);
  const [lastInsideAt, setLastInsideAt] = useState<number | null>(null);
  const [movementTrend, setMovementTrend] = useState<MovementTrend>('steady');
  const [searchQuery, setSearchQuery] = useState('');

  const { currentLocation, errorMessage, isLoading, permissionStatus, requestPermission } =
    useLiveLocation();
  const isPermissionBlocked = errorMessage?.includes('device settings') ?? false;
  const {
    clearGeofence,
    distanceMeters,
    geofenceCenter,
    radiusMeters,
    setGeofenceCenter,
    setRadiusMeters,
    status,
    transition,
  } = useGeofence(currentLocation);
  const isCompactWidth = windowWidth < 390;
  const isCompactHeight = windowHeight < 780;
  const isCompact = isCompactWidth || isCompactHeight;
  const spacingScale = getResponsiveSpacingScale(windowWidth, windowHeight);
  const horizontalPadding = isCompactWidth
    ? getScaledValue(spacing.md, spacingScale)
    : getScaledValue(spacing.lg, spacingScale);
  const controlGap = getScaledValue(spacing.md, spacingScale);
  const contentMaxWidth = Math.min(windowWidth - horizontalPadding * 2, 720);
  const mapHeight = windowHeight;
  const searchBarHeight = isCompact ? 48 : 54;
  const topChromeOffset = insets.top + getScaledValue(spacing.lg, spacingScale);
  const bottomSheetOverlap = Math.max(
    getScaledValue(spacing.xl, spacingScale),
    Math.round(windowHeight * 0.7),
  );
  const bottomSheetMinSnapHeight = Math.round(windowHeight * 0.1);
  const bottomSheetPaddingTop = 0;
  const bottomSheetTop = Math.max(
    topChromeOffset + getScaledValue(spacing.xl, spacingScale),
    windowHeight - bottomSheetOverlap,
  );
  const bottomSheetMaxHeight = Math.max(0, windowHeight - bottomSheetTop);
  const bottomSheetInitialHeight = Math.min(bottomSheetMaxHeight, Math.round(windowHeight * 0.5));
  const statusSheetInitialHeight = Math.min(bottomSheetMaxHeight, Math.round(windowHeight * 0.5));
  const statusSheetPeekHeight = Math.min(bottomSheetMaxHeight, Math.round(windowHeight * 0.1));
  const hasSearchValue = searchQuery.trim().length > 0;
  const isLocationSearchAvailable = getExpoLocation() != null;
  const isSearchInteracting = isSearchOpen || isSearching || isSearchFocused || hasSearchValue;
  const isInsideBoundary = geofenceCenter != null && status === 'inside';
  const isOutsideBoundary = geofenceCenter != null && status === 'outside';
  const boundaryDistanceMeters =
    distanceMeters == null ? null : Math.max(0, Math.round(distanceMeters - radiusMeters));
  const shouldShowSafeZoneSheet =
    !isSearchInteracting && isInsideBoundary && !isSetupSheetOpen && isStatusSheetVisible;
  const shouldShowBreachSheet =
    !isSearchInteracting && isOutsideBoundary && !isSetupSheetOpen && isStatusSheetVisible;
  const shouldShowSetupSheet = !isSearchInteracting && isSetupSheetOpen;
  const shouldShowFloatingSetupButton =
    !isSetupSheetOpen && !shouldShowSafeZoneSheet && !shouldShowBreachSheet;
  const mapLayerStyle = {
    height: mapHeight,
    top: 0,
  } as const;
  const searchBarWrapStyle = {
    paddingHorizontal: horizontalPadding,
    top: topChromeOffset,
  } as const;
  const searchBarStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    maxWidth: contentMaxWidth,
    minHeight: searchBarHeight,
    shadowColor: '#1E1630',
  } as const;
  const bottomSheetWrapStyle = {
    top: bottomSheetTop,
  } as const;
  const bottomSheetStyle = {
    backgroundColor:
      (isOutsideBoundary || isInsideBoundary) && !isSetupSheetOpen
        ? colors.surface
        : colors.background,
    paddingHorizontal:
      (isOutsideBoundary || isInsideBoundary) && !isSetupSheetOpen ? 0 : horizontalPadding,
    shadowColor: '#1E1630',
  } as const;
  const bottomSheetScrollContentStyle = {
    paddingBottom: 0,
    paddingTop: bottomSheetPaddingTop,
  } as const;
  const bottomSheetInnerStyle = {
    gap: controlGap,
    maxWidth: shouldShowBreachSheet || shouldShowSafeZoneSheet ? undefined : contentMaxWidth,
  } as const;
  const permissionOverlayStyle = {
    padding: horizontalPadding,
  } as const;
  const floatingActionRailWrapStyle = {
    bottom: insets.bottom + getScaledValue(spacing.lg, spacingScale),
    paddingRight: horizontalPadding,
  } as const;
  const transitionBannerWrapStyle = {
    paddingHorizontal: horizontalPadding,
    top: topChromeOffset,
  } as const;

  const mapRegion = useMemo(() => {
    if (currentLocation == null) {
      return DEFAULT_MAP_REGION;
    }

    return buildFocusedRegion(currentLocation.latitude, currentLocation.longitude);
  }, [currentLocation]);

  /**
   * Resolves a search query to the first geocoded coordinate.
   *
   * @param query - User-entered location text
   * @returns First matching coordinate or null when no result is found
   */
  const resolveSearchQuery = async (query: string): Promise<GeofenceCoordinate | null> => {
    const expoLocation = getExpoLocation();

    if (expoLocation == null) {
      throw new Error(LOCATION_SEARCH_UNAVAILABLE_MESSAGE);
    }

    const results = await expoLocation.geocodeAsync(query);

    const [firstResult] = results;

    if (firstResult == null) {
      return null;
    }

    return {
      latitude: firstResult.latitude,
      longitude: firstResult.longitude,
    };
  };

  /**
   * Centers the map on the user's current location when available.
   */
  const centerOnUser = () => {
    if (currentLocation == null) {
      return;
    }

    mapRef.current?.animateToRegion(
      buildFocusedRegion(currentLocation.latitude, currentLocation.longitude),
      350,
    );
  };

  /**
   * Places or moves the geofence center to the tapped coordinate.
   *
   * @param event - React Native Maps press event
   */
  const handleMapPress = (event: MapPressEvent) => {
    setGeofenceCenter(event.nativeEvent.coordinate);
  };

  /**
   * Creates a zone using the user's current location when available.
   */
  const handleUseCurrentLocation = () => {
    if (currentLocation == null) {
      return;
    }

    setGeofenceCenter(currentLocation);
    centerOnUser();
  };

  /**
   * Geocodes the typed query and recenters the map on the first result.
   */
  const handleSearchLocation = async () => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length === 0 || isSearching) {
      return;
    }

    if (!isLocationSearchAvailable) {
      Alert.alert('Search Unavailable', LOCATION_SEARCH_UNAVAILABLE_MESSAGE);
      return;
    }

    Keyboard.dismiss();
    setIsSearching(true);

    try {
      const coordinate = await resolveSearchQuery(trimmedQuery);

      if (coordinate == null) {
        Alert.alert('Location Not Found', 'Try a more specific search term.');
        return;
      }

      mapRef.current?.animateToRegion(
        buildFocusedRegion(coordinate.latitude, coordinate.longitude),
        350,
      );
    } catch {
      Alert.alert('Search Unavailable', 'Location search is unavailable right now.');
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Geocodes the current query and creates a geofence at the result.
   */
  const handleSetGeofenceFromSearch = async () => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length === 0 || isSearching) {
      return;
    }

    if (!isLocationSearchAvailable) {
      Alert.alert('Search Unavailable', LOCATION_SEARCH_UNAVAILABLE_MESSAGE);
      return;
    }

    Keyboard.dismiss();
    setIsSearching(true);

    try {
      const coordinate = await resolveSearchQuery(trimmedQuery);

      if (coordinate == null) {
        Alert.alert('Location Not Found', 'Try a more specific search term.');
        return;
      }

      setGeofenceCenter(coordinate);
      mapRef.current?.animateToRegion(
        buildFocusedRegion(coordinate.latitude, coordinate.longitude),
        350,
      );
      setSearchQuery('');
      setIsSetupSheetOpen(false);
    } catch {
      Alert.alert('Search Unavailable', 'Location search is unavailable right now.');
    } finally {
      setIsSearching(false);
    }
  };

  /**
   * Clears the active geofence and returns the setup flow to its collapsed state.
   */
  const handleClearGeofence = () => {
    clearGeofence();
    setIsSetupSheetOpen(true);
  };

  /**
   * Confirms the current geofence configuration and collapses the controls.
   */
  const handleSetGeofence = () => {
    setIsSetupSheetOpen(false);
    setIsStatusSheetVisible(true);
  };

  /**
   * Opens or closes the floating search field.
   */
  const handleToggleSearch = () => {
    if (isSearchOpen) {
      Keyboard.dismiss();
      setIsSearchFocused(false);
      setIsSearchOpen(false);
      setSearchQuery('');
      return;
    }

    setIsSearchOpen(true);
  };

  /**
   * Displays the current safe-zone entry details using a native alert.
   */
  const handleViewSafeZoneLog = () => {
    const entryTimeLabel =
      lastEnteredAt == null
        ? 'Pending'
        : new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }).format(lastEnteredAt);

    Alert.alert(
      'Zone Log',
      `Entered geofence at ${entryTimeLabel}. Status is currently inside boundary.`,
    );
  };

  /**
   * Opens system settings to help the user recover from a denied permission state.
   */
  const handleOpenSettings = () => {
    void Linking.openSettings();
  };

  /**
   * Retries permission acquisition or routes blocked users to settings.
   */
  const handleRetryPermission = async () => {
    if (isPermissionBlocked) {
      handleOpenSettings();
      return;
    }

    const permissionResult = await requestPermission();

    if (permissionResult === 'blocked' && Platform.OS !== 'web') {
      handleOpenSettings();
    }
  };

  useEffect(() => {
    if (currentLocation == null || hasAutoCenteredRef.current) {
      return;
    }

    hasAutoCenteredRef.current = true;
    centerOnUser();
  }, [currentLocation]);

  useEffect(() => {
    if (transition == null || lastAlertTimestampRef.current === transition.occurredAt) {
      return;
    }

    lastAlertTimestampRef.current = transition.occurredAt;
    Alert.alert('Geofence Update', getTransitionNotificationMessage(transition.type));

    if (transition.type === 'exit') {
      setLastInsideAt(transition.occurredAt);
      setIsStatusSheetVisible(true);
      setIsTransitionBannerVisible(true);
      setTransitionBannerTone('exit');
      return;
    }

    setLastEnteredAt(transition.occurredAt);
    setIsStatusSheetVisible(true);
    setIsTransitionBannerVisible(true);
    setTransitionBannerTone('enter');
  }, [transition]);

  useEffect(() => {
    if (!isTransitionBannerVisible) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setIsTransitionBannerVisible(false);
    }, 4000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isTransitionBannerVisible]);

  useEffect(() => {
    if (geofenceCenter == null) {
      setIsStatusSheetVisible(false);
      setIsTransitionBannerVisible(false);
      setLastEnteredAt(null);
      setLastInsideAt(null);
      return;
    }

    setIsStatusSheetVisible(true);
    setIsSearchOpen(false);
    setSearchQuery('');
    setIsSetupSheetOpen(true);
  }, [geofenceCenter]);

  useEffect(() => {
    if (distanceMeters == null) {
      previousDistanceMetersRef.current = null;
      setMovementTrend('steady');
      return;
    }

    const previousDistanceMeters = previousDistanceMetersRef.current;

    if (previousDistanceMeters != null) {
      const distanceDelta = distanceMeters - previousDistanceMeters;

      if (distanceDelta > 4) {
        setMovementTrend('away');
      } else if (distanceDelta < -4) {
        setMovementTrend('returning');
      } else {
        setMovementTrend('steady');
      }
    }

    previousDistanceMetersRef.current = distanceMeters;
  }, [distanceMeters]);

  useEffect(() => {
    if (!isInsideBoundary || lastEnteredAt != null) {
      return;
    }

    setLastEnteredAt(Date.now());
  }, [isInsideBoundary, lastEnteredAt]);

  useEffect(() => {
    if (!isInsideBoundary && !isOutsideBoundary) {
      return;
    }

    setIsStatusSheetVisible(true);
  }, [isInsideBoundary, isOutsideBoundary]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {permissionStatus === 'granted' ? (
        <View style={styles.grantedScene}>
          <View style={[styles.mapLayer, mapLayerStyle]}>
            <MapPanel
              chrome="fullBleed"
              currentLocation={currentLocation}
              geofenceCenter={geofenceCenter}
              initialRegion={mapRegion}
              isLoading={isLoading}
              mapRef={mapRef}
              onLocatePress={centerOnUser}
              onMapPress={handleMapPress}
              panelHeight={mapHeight}
              radiusMeters={radiusMeters}
              showHelper={false}
              showLocateButton={false}
              status={status}
            />
          </View>

          {geofenceCenter == null && isSearchOpen && (
            <View style={[styles.searchBarWrap, searchBarWrapStyle]}>
              <View style={[styles.searchBar, searchBarStyle]}>
                {isSearching ? (
                  <ActivityIndicator color={colors.textSecondary} size="small" />
                ) : (
                  <Ionicons name="search-outline" color={colors.textSecondary} size={24} />
                )}
                <TextInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  editable={isLocationSearchAvailable}
                  onBlur={() => setIsSearchFocused(false)}
                  onChangeText={setSearchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onSubmitEditing={() => {
                    void handleSearchLocation();
                  }}
                  placeholder={
                    isLocationSearchAvailable
                      ? 'Search for a location...'
                      : 'Location search unavailable in this build'
                  }
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="search"
                  selectionColor={colors.primary}
                  style={[styles.searchInput, { color: colors.text }]}
                  value={searchQuery}
                />
                {hasSearchValue && (
                  <AppButton
                    disabled={!isLocationSearchAvailable || isSearching}
                    onPress={() => {
                      void handleSetGeofenceFromSearch();
                    }}
                    size="sm"
                    style={styles.searchSetButton}
                    title="Set"
                  />
                )}
              </View>
            </View>
          )}

          {(isInsideBoundary || isOutsideBoundary) && isTransitionBannerVisible && (
            <View pointerEvents="box-none" style={[styles.transitionBannerWrap, transitionBannerWrapStyle]}>
              <GeofenceTransitionBanner
                message={
                  transitionBannerTone === 'enter'
                    ? 'Geofence Update: You entered the geofenced area'
                    : 'Geofence Update: You exited the geofenced area'
                }
                onDismiss={() => setIsTransitionBannerVisible(false)}
                tone={transitionBannerTone}
              />
            </View>
          )}

          {shouldShowFloatingSetupButton && (
            <View pointerEvents="box-none" style={[styles.floatingActionRailWrap, floatingActionRailWrapStyle]}>
              <View style={styles.floatingActionRail}>
                {geofenceCenter == null && (
                  <Pressable
                    accessibilityLabel={isSearchOpen ? 'Close search' : 'Open search'}
                    onPress={handleToggleSearch}
                    style={({ pressed }) => [
                      styles.floatingSetupButton,
                      {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        shadowColor: '#1E1630',
                      },
                      pressed && styles.floatingSetupButtonPressed,
                    ]}>
                    <Ionicons
                      color={colors.primary}
                      name={isSearchOpen ? 'close-outline' : 'search-outline'}
                      size={22}
                    />
                  </Pressable>
                )}

                <Pressable
                  accessibilityLabel="Show setup"
                  onPress={() => {
                    setIsSearchFocused(false);
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setIsSetupSheetOpen(true);
                  }}
                  style={({ pressed }) => [
                    styles.floatingSetupButton,
                    {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                      shadowColor: '#1E1630',
                    },
                    pressed && styles.floatingSetupButtonPressed,
                  ]}>
                  <Ionicons color={colors.surface} name="options-outline" size={22} />
                </Pressable>
              </View>
            </View>
          )}

          {(shouldShowSetupSheet || shouldShowBreachSheet || shouldShowSafeZoneSheet) && (
            <View
              pointerEvents="box-none"
              style={[styles.bottomSheetWrap, bottomSheetWrapStyle]}>
              <AppBottomSheet
                backgroundColor={
                  shouldShowBreachSheet || shouldShowSafeZoneSheet
                    ? colors.surface
                    : colors.background
                }
                borderColor={colors.border}
                closeButtonBackgroundColor={colors.primaryBorder}
                closeButtonIconColor={colors.primary}
                contentContainerStyle={[styles.bottomSheetScrollContent, bottomSheetScrollContentStyle]}
                initialHeight={
                  shouldShowBreachSheet || shouldShowSafeZoneSheet
                    ? statusSheetInitialHeight
                    : bottomSheetInitialHeight
                }
                initialSnapRatio={shouldShowBreachSheet || shouldShowSafeZoneSheet ? 0.78 : 0.55}
                maxHeight={bottomSheetMaxHeight}
                minSnapHeight={
                  shouldShowBreachSheet || shouldShowSafeZoneSheet
                    ? statusSheetPeekHeight
                    : bottomSheetMinSnapHeight
                }
                onClose={() => {
                  if (shouldShowSetupSheet) {
                    setIsSetupSheetOpen(false);
                    return;
                  }

                  setIsStatusSheetVisible(false);
                }}
                style={[styles.bottomSheet, bottomSheetStyle]}>
                <View style={[styles.bottomSheetInner, bottomSheetInnerStyle]}>
                  {shouldShowSafeZoneSheet ? (
                    <GeofenceSafeZoneSheet
                      compact={isCompact}
                      entryTime={lastEnteredAt}
                      onResetPress={handleClearGeofence}
                      onViewLogPress={handleViewSafeZoneLog}
                    />
                  ) : shouldShowBreachSheet ? (
                    <GeofenceBreachSheet
                      boundaryDistanceMeters={boundaryDistanceMeters}
                      compact={isCompact}
                      lastInsideAt={lastInsideAt}
                      movementLabel={getMovementLabel(movementTrend)}
                      onResetPress={handleClearGeofence}
                      onUpdatePress={() => setIsSetupSheetOpen(true)}
                    />
                  ) : geofenceCenter == null ? (
                    <GeofenceHelperCard
                      compact={isCompact}
                      isActionDisabled={currentLocation == null}
                      onUseCurrentLocation={handleUseCurrentLocation}
                    />
                  ) : (
                    <RadiusControlCard
                      compact={isCompact}
                      hasGeofence
                      onClearPress={handleClearGeofence}
                      onSetPress={handleSetGeofence}
                      radiusMeters={radiusMeters}
                      setRadiusMeters={setRadiusMeters}
                    />
                  )}
                </View>
              </AppBottomSheet>
            </View>
          )}
        </View>
      ) : permissionStatus === 'checking' ? (
        <>
        <View style={styles.permissionScene}>
          <MapPanel
            chrome="fullBleed"
            currentLocation={currentLocation}
            geofenceCenter={null}
            initialRegion={mapRegion}
            isLoading={false}
            mapRef={mapRef}
            onLocatePress={centerOnUser}
            onMapPress={handleMapPress}
            radiusMeters={radiusMeters}
            showHelper={false}
            showLocateButton
            status="unknown"
          />
          <View
            pointerEvents="box-none"
            style={[styles.permissionOverlay, permissionOverlayStyle]}>
            <BlurView intensity={40} pointerEvents="none" style={styles.permissionBlur} tint="light" />
            <View pointerEvents="none" style={styles.permissionTint} />
            <PermissionEmptyState compact={isCompact} mode="checking" onRetryPress={handleRetryPermission} />
          </View>
        </View>
        </>
      ) : permissionStatus === 'denied' || permissionStatus === 'unsupported' ? (
        <>
        <View style={styles.permissionScene}>
          <MapPanel
            chrome="fullBleed"
            currentLocation={currentLocation}
            geofenceCenter={null}
            initialRegion={mapRegion}
            isLoading={false}
            mapRef={mapRef}
            onLocatePress={centerOnUser}
            onMapPress={handleMapPress}
            radiusMeters={radiusMeters}
            showHelper={false}
            showLocateButton
            status="unknown"
          />
          <View
            pointerEvents="box-none"
            style={[styles.permissionOverlay, permissionOverlayStyle]}>
            <BlurView intensity={48} pointerEvents="none" style={styles.permissionBlur} tint="light" />
            <View pointerEvents="none" style={styles.permissionTint} />
            <PermissionEmptyState
              compact={isCompact}
              mode={permissionStatus === 'unsupported' ? 'unsupported' : 'denied'}
              onOpenSettings={
                permissionStatus === 'unsupported' || Platform.OS === 'web'
                  ? undefined
                  : handleOpenSettings
              }
              onRetryPress={handleRetryPermission}
            />
          </View>
        </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomSheet: {},
  bottomSheetInner: {
    alignSelf: 'center',
    width: '100%',
  },
  bottomSheetScrollContent: {
    alignItems: 'center',
  },
  bottomSheetWrap: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 4,
  },
  floatingActionRail: {
    alignItems: 'flex-end',
    gap: spacing.md,
  },
  floatingActionRailWrap: {
    position: 'absolute',
    right: 0,
    zIndex: 5,
  },
  floatingSetupButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    elevation: 10,
    height: 58,
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    width: 58,
  },
  floatingSetupButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.97 }],
  },
  transitionBannerWrap: {
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 5,
  },
  grantedScene: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  permissionOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  permissionBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  permissionScene: {
    flex: 1,
  },
  permissionTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 247, 251, 0.12)',
  },
  mapLayer: {
    left: 0,
    position: 'absolute',
    right: 0,
  },
  screen: {
    flex: 1,
  },
  searchBar: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    minHeight: 54,
    paddingHorizontal: spacing.lg,
    shadowOffset: {
      width: 0,
      height: 14,
    },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    width: '100%',
    elevation: 8,
  },
  searchBarWrap: {
    left: 0,
    position: 'absolute',
    right: 0,
    zIndex: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    paddingVertical: 0,
  },
  searchSetButton: {
    minWidth: 68,
  },
});

export default MapScreen;
