/**
 * @fileoverview Interactive map panel for geofence placement and monitoring.
 * @module components/geofence/map-panel
 */
import { Ionicons } from '@expo/vector-icons';
import type { RefObject } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, type MapPressEvent, type Region } from 'react-native-maps';

import { AppText } from '@components/shared/app-text';
import type { GeofenceCoordinate, GeofenceStatus } from '@constants/geofence';
import { radius, spacing } from '@theme/tokens';
import { useAppTheme } from '@theme/use-app-theme';

/**
 * Props for the map panel component.
 */
type MapPanelProps = {
  backdropMode?: 'none' | 'frosted';
  chrome?: 'card' | 'fullBleed';
  currentLocation: GeofenceCoordinate | null;
  geofenceCenter: GeofenceCoordinate | null;
  initialRegion: Region;
  isLoading: boolean;
  mapRef: RefObject<MapView | null>;
  onLocatePress: () => void;
  onMapPress: (event: MapPressEvent) => void;
  panelHeight?: number;
  radiusMeters: number;
  showHelper?: boolean;
  showLocateButton?: boolean;
  status: GeofenceStatus;
};

/**
 * Returns helper copy shown above the map based on geofence setup state.
 *
 * @param geofenceCenter - Active geofence center
 * @returns User-facing helper text
 */
const getHelperText = (geofenceCenter: GeofenceCoordinate | null) => {
  if (geofenceCenter == null) {
    return 'Tap anywhere on the map to place a geofence';
  }

  return 'Boundary set. Adjust radius below';
};

/**
 * Interactive map surface showing the user marker and optional geofence boundary.
 */
const MapPanel = ({
  backdropMode = 'none',
  chrome = 'card',
  currentLocation,
  geofenceCenter,
  initialRegion,
  isLoading,
  mapRef,
  onLocatePress,
  onMapPress,
  panelHeight,
  radiusMeters,
  showHelper = true,
  showLocateButton = true,
  status,
}: MapPanelProps) => {
  const { colors } = useAppTheme();
  const isFullBleed = chrome === 'fullBleed';
  const boundaryColors =
    status === 'inside'
      ? {
          fillColor: colors.geofenceSafeFill,
          strokeColor: colors.geofenceSafeStroke,
        }
      : {
          fillColor: colors.mapGeofenceFill,
          strokeColor: colors.mapGeofenceStroke,
        };
  const helperTone =
    geofenceCenter == null
      ? {
          backgroundColor: colors.primarySoft,
          textColor: colors.primary,
        }
      : status === 'inside'
        ? {
            backgroundColor: colors.successSoft,
            textColor: colors.success,
          }
        : status === 'outside'
          ? {
              backgroundColor: colors.warningSoft,
              textColor: colors.warning,
            }
          : {
              backgroundColor: colors.primarySoft,
              textColor: colors.primary,
            };

  return (
    <View
      style={[
        styles.card,
        panelHeight != null ? { minHeight: panelHeight, height: panelHeight } : null,
        isFullBleed
          ? styles.fullBleedCard
          : {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
      ]}>
      <MapView
        ref={mapRef}
        initialRegion={initialRegion}
        onPress={onMapPress}
        showsCompass={false}
        showsMyLocationButton={false}
        style={styles.map}>
        {currentLocation != null && (
          <Marker coordinate={currentLocation} title="Your location">
            <View style={styles.userMarkerWrap}>
              <View
                style={[
                  styles.userMarkerHalo,
                  {
                    backgroundColor: 'rgba(37, 13, 75, 0.12)',
                  },
                ]}
              />
              <View
                style={[
                  styles.userMarkerCore,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.surface,
                  },
                ]}
              />
            </View>
          </Marker>
        )}

        {geofenceCenter != null && (
          <>
            <Marker coordinate={geofenceCenter} pinColor={colors.mapCenterMarker} title="Geofence center" />
            <Circle
              center={geofenceCenter}
              fillColor={boundaryColors.fillColor}
              radius={radiusMeters}
              strokeColor={boundaryColors.strokeColor}
              strokeWidth={2}
            />
          </>
        )}
      </MapView>

      {backdropMode === 'frosted' && (
        <View pointerEvents="none" style={styles.backdropOverlay}>
          <View style={[styles.backdropBase, { backgroundColor: colors.surface }]} />
          <View style={[styles.backdropTint, { backgroundColor: colors.primarySoft }]} />
        </View>
      )}

      {isFullBleed && (
        <View pointerEvents="none" style={styles.atmosphere}>
          <View
            style={[
              styles.atmosphereGlow,
              styles.atmosphereTop,
              {
                backgroundColor: 'rgba(255, 214, 120, 0.28)',
              },
            ]}
          />
          <View
            style={[
              styles.atmosphereGlow,
              styles.atmosphereBottom,
              {
                backgroundColor: 'rgba(74, 192, 216, 0.24)',
              },
            ]}
          />
        </View>
      )}

      {showHelper && (
        <View style={styles.helperWrap}>
          <View
            style={[
              styles.helperChip,
              {
                backgroundColor: helperTone.backgroundColor,
              },
            ]}>
            <AppText variant="label" style={{ color: helperTone.textColor }}>
              {getHelperText(geofenceCenter)}
            </AppText>
          </View>
        </View>
      )}

      {showLocateButton && (
        <Pressable
          accessibilityLabel="Center map on current location"
          onPress={onLocatePress}
          style={[
            styles.locateButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primaryBorder,
            },
          ]}>
          <Ionicons name="locate" color={colors.primary} size={24} />
        </Pressable>
      )}

      {isLoading && (
        <View style={[styles.overlay, { backgroundColor: 'rgba(248, 247, 251, 0.9)' }]}>
          <ActivityIndicator color={colors.primary} size="small" />
          <AppText tone="muted">Checking location access…</AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  atmosphere: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  atmosphereBottom: {
    bottom: -160,
    height: 520,
    left: -80,
    width: 520,
  },
  atmosphereGlow: {
    borderRadius: radius.pill,
    position: 'absolute',
  },
  atmosphereTop: {
    height: 460,
    right: -40,
    top: 40,
    width: 460,
  },
  backdropBase: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.5,
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTint: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.24,
  },
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    minHeight: 360,
    overflow: 'hidden',
    position: 'relative',
  },
  fullBleedCard: {
    borderRadius: 0,
    borderWidth: 0,
  },
  helperChip: {
    borderRadius: radius.pill,
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  helperWrap: {
    left: spacing.md,
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
  },
  locateButton: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    bottom: spacing.md,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.md,
    width: 56,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  userMarkerCore: {
    borderRadius: radius.pill,
    borderWidth: 4,
    height: 28,
    position: 'absolute',
    width: 28,
  },
  userMarkerHalo: {
    borderRadius: radius.pill,
    height: 64,
    width: 64,
  },
  userMarkerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { MapPanel };
