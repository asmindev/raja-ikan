import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

/// Simple callback untuk location updates
typedef LocationUpdateCallback =
    void Function(LatLng position, double? heading, double speed);

/// Clean service untuk tracking GPS location
class LocationTracker {
  StreamSubscription<Position>? _positionSubscription;
  LocationUpdateCallback? _onLocationUpdate;

  bool _isTracking = false;
  bool get isTracking => _isTracking;

  /// Start tracking dengan callback
  Future<bool> startTracking(LocationUpdateCallback onUpdate) async {
    if (_isTracking) return true;

    // Check permission
    final hasPermission = await _checkPermission();
    if (!hasPermission) return false;

    _onLocationUpdate = onUpdate;

    // Configure location settings
    const locationSettings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter:
          3, // Update setiap 3 meter untuk balance accuracy vs battery
    );

    // Start listening
    _positionSubscription =
        Geolocator.getPositionStream(locationSettings: locationSettings).listen(
          _handlePositionUpdate,
          onError: (error) {
            print('❌ GPS Error: $error');
          },
        );

    _isTracking = true;
    print('🎯 Location tracking started');
    return true;
  }

  /// Stop tracking
  void stopTracking() {
    _positionSubscription?.cancel();
    _positionSubscription = null;
    _onLocationUpdate = null;
    _isTracking = false;
    print('🛑 Location tracking stopped');
  }

  /// Handle position update dari stream
  void _handlePositionUpdate(Position position) {
    final location = LatLng(position.latitude, position.longitude);

    // Heading dari GPS (bisa null jika device diam)
    double? heading = position.heading >= 0 ? position.heading : null;

    // Speed dari GPS (m/s)
    double speed = position.speed;

    // Callback ke listener dengan speed
    _onLocationUpdate?.call(location, heading, speed);

    // Debug log
    print(
      '📍 GPS: ${position.latitude.toStringAsFixed(6)}, ${position.longitude.toStringAsFixed(6)} | '
      'Heading: ${heading?.toStringAsFixed(1) ?? 'N/A'}° | '
      'Speed: ${speed.toStringAsFixed(1)} m/s | '
      'Accuracy: ±${position.accuracy.toStringAsFixed(1)}m',
    );
  }

  /// Check location permission
  Future<bool> _checkPermission() async {
    // Check if location services are enabled
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      print('❌ Location services disabled');
      return false;
    }

    // Check permission
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        print('❌ Location permission denied');
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      print('❌ Location permission denied forever');
      return false;
    }

    return true;
  }

  /// Cleanup
  void dispose() {
    stopTracking();
  }
}
