import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

/// Callback untuk route update
typedef RouteUpdateCallback = void Function(List<LatLng> routePoints);

/// Service untuk auto-recalculate route berdasarkan posisi current
/// Menggunakan strategi:
/// 1. Local trimming (hapus titik yang sudah dilewati)
/// 2. Rerouting only jika user keluar dari jalur (> offRouteThreshold)
class RouteUpdater {
  LatLng? _lastUpdatePosition;
  DateTime? _lastUpdateTime;
  bool _isUpdating = false;

  // Configuration
  final double offRouteThreshold; // Jarak max dari rute sebelum reroute (meter)
  final double
  significantDistanceMeters; // Jarak signifikan untuk update estimasi
  final int minIntervalSeconds;

  RouteUpdater({
    this.offRouteThreshold = 50.0, // 50m dari rute = reroute
    this.significantDistanceMeters = 100.0, // Update tiap 100m untuk estimasi
    this.minIntervalSeconds = 30, // Min 30 detik interval
  });

  /// Hitung jarak terdekat dari posisi user ke polyline
  /// Returns: (closestIndex, distanceToRoute)
  ({int closestIndex, double distance}) findClosestPoint(
    LatLng userPos,
    List<LatLng> routePoints,
  ) {
    if (routePoints.isEmpty) {
      return (closestIndex: 0, distance: double.infinity);
    }

    int closestIndex = 0;
    double minDistance = double.infinity;
    const Distance distanceCalc = Distance();

    for (int i = 0; i < routePoints.length; i++) {
      final distance = distanceCalc.as(
        LengthUnit.Meter,
        userPos,
        routePoints[i],
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    return (closestIndex: closestIndex, distance: minDistance);
  }

  /// Trim polyline: hapus titik yang sudah dilewati user
  /// Returns: updated routePoints
  List<LatLng> trimPassedPoints(LatLng userPos, List<LatLng> routePoints) {
    if (routePoints.isEmpty) return routePoints;

    final result = findClosestPoint(userPos, routePoints);

    // Jika user sudah melewati beberapa titik, hapus titik di belakang
    if (result.closestIndex > 0) {
      print(
        '✂️ Trimming polyline: removing ${result.closestIndex} passed points',
      );
      return routePoints.sublist(result.closestIndex);
    }

    return routePoints;
  }

  /// Check apakah user keluar dari jalur (need rerouting)
  bool isOffRoute(LatLng userPos, List<LatLng> routePoints) {
    if (routePoints.isEmpty) return false;

    final result = findClosestPoint(userPos, routePoints);

    // Safety check
    if (result.distance.isInfinite || result.distance.isNaN) {
      return false;
    }

    if (result.distance > offRouteThreshold) {
      print(
        '⚠️ User off route: ${result.distance.toStringAsFixed(1)}m from path',
      );
      return true;
    }

    return false;
  }

  /// Check apakah perlu update route (untuk estimasi waktu)
  bool shouldUpdateForEstimation(LatLng currentPosition) {
    if (_lastUpdatePosition == null) return false;

    final distance = Geolocator.distanceBetween(
      _lastUpdatePosition!.latitude,
      _lastUpdatePosition!.longitude,
      currentPosition.latitude,
      currentPosition.longitude,
    );

    if (distance >= significantDistanceMeters) {
      // Check time interval
      if (_lastUpdateTime != null) {
        final elapsed = DateTime.now().difference(_lastUpdateTime!);
        if (elapsed.inSeconds >= minIntervalSeconds) {
          return true;
        }
      }
    }

    return false;
  }

  /// Recalculate route dari current position ke destinations (Rerouting)
  Future<void> rerouteFromCurrentPosition({
    required LatLng currentPosition,
    required List<LatLng> destinations,
    required RouteUpdateCallback onUpdate,
  }) async {
    if (_isUpdating) {
      print('⏳ Route update already in progress');
      return;
    }

    _isUpdating = true;
    _lastUpdatePosition = currentPosition;
    _lastUpdateTime = DateTime.now();

    try {
      print('🔄 Rerouting from current position...');

      // Build OSRM URL
      final coords = [
        currentPosition,
        ...destinations,
      ].map((p) => '${p.longitude},${p.latitude}').join(';');

      final url =
          'https://router.project-osrm.org/route/v1/driving/'
          '$coords?overview=full&geometries=geojson';

      // Fetch route
      final response = await http
          .get(Uri.parse(url))
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        if (data['routes'] != null && data['routes'].isNotEmpty) {
          final coordinates =
              data['routes'][0]['geometry']['coordinates'] as List;

          final routePoints = coordinates
              .map((coord) => LatLng(coord[1] as double, coord[0] as double))
              .toList();

          print('✅ Route recalculated: ${routePoints.length} points');
          onUpdate(routePoints);
        }
      } else {
        print('❌ Reroute failed: ${response.statusCode}');
      }
    } catch (e) {
      print('❌ Reroute error: $e');
    } finally {
      _isUpdating = false;
    }
  }

  /// Reset state (untuk restart tracking)
  void reset() {
    _lastUpdatePosition = null;
    _lastUpdateTime = null;
    _isUpdating = false;
  }
}
