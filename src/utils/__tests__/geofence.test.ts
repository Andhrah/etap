import {
  calculateDistanceMeters,
  clampRadiusMeters,
  getGeofenceStatus,
  getGeofenceTransition,
} from '@utils/geofence';

describe('geofence utilities', () => {
  describe('calculateDistanceMeters', () => {
    it('returns zero for identical coordinates', () => {
      const distanceMeters = calculateDistanceMeters(
        { latitude: 6.5244, longitude: 3.3792 },
        { latitude: 6.5244, longitude: 3.3792 },
      );

      expect(distanceMeters).toBe(0);
    });

    it('returns a plausible distance between nearby coordinates', () => {
      const distanceMeters = calculateDistanceMeters(
        { latitude: 6.5244, longitude: 3.3792 },
        { latitude: 6.5249, longitude: 3.38 },
      );

      expect(distanceMeters).toBeGreaterThan(100);
      expect(distanceMeters).toBeLessThan(110);
    });
  });

  describe('getGeofenceStatus', () => {
    it('treats the first reading inside the radius as inside', () => {
      expect(
        getGeofenceStatus({
          distanceMeters: 180,
          hysteresisMeters: 15,
          previousStatus: 'unknown',
          radiusMeters: 200,
        }),
      ).toBe('inside');
    });

    it('treats the first reading outside the radius as outside', () => {
      expect(
        getGeofenceStatus({
          distanceMeters: 220,
          hysteresisMeters: 15,
          previousStatus: 'unknown',
          radiusMeters: 200,
        }),
      ).toBe('outside');
    });

    it('keeps the user inside while they remain within the hysteresis buffer', () => {
      expect(
        getGeofenceStatus({
          distanceMeters: 212,
          hysteresisMeters: 15,
          previousStatus: 'inside',
          radiusMeters: 200,
        }),
      ).toBe('inside');
    });

    it('switches to outside once the user exceeds the inside hysteresis buffer', () => {
      expect(
        getGeofenceStatus({
          distanceMeters: 216,
          hysteresisMeters: 15,
          previousStatus: 'inside',
          radiusMeters: 200,
        }),
      ).toBe('outside');
    });

    it('keeps the user outside until they clearly re-enter past the hysteresis buffer', () => {
      expect(
        getGeofenceStatus({
          distanceMeters: 190,
          hysteresisMeters: 15,
          previousStatus: 'outside',
          radiusMeters: 200,
        }),
      ).toBe('outside');
    });

    it('switches to inside once the user re-enters beyond the hysteresis threshold', () => {
      expect(
        getGeofenceStatus({
          distanceMeters: 184,
          hysteresisMeters: 15,
          previousStatus: 'outside',
          radiusMeters: 200,
        }),
      ).toBe('inside');
    });
  });

  describe('getGeofenceTransition', () => {
    it('returns null when there is no state change', () => {
      expect(getGeofenceTransition('inside', 'inside')).toBeNull();
    });

    it('returns null when either side is unknown', () => {
      expect(getGeofenceTransition('unknown', 'inside')).toBeNull();
      expect(getGeofenceTransition('outside', 'unknown')).toBeNull();
    });

    it('returns enter when the user moves from outside to inside', () => {
      expect(getGeofenceTransition('outside', 'inside')).toBe('enter');
    });

    it('returns exit when the user moves from inside to outside', () => {
      expect(getGeofenceTransition('inside', 'outside')).toBe('exit');
    });
  });

  describe('clampRadiusMeters', () => {
    it('clamps values below the minimum radius', () => {
      expect(clampRadiusMeters(20, 50, 1000)).toBe(50);
    });

    it('clamps values above the maximum radius', () => {
      expect(clampRadiusMeters(1200, 50, 1000)).toBe(1000);
    });

    it('preserves values inside the supported range', () => {
      expect(clampRadiusMeters(240, 50, 1000)).toBe(240);
    });
  });
});
