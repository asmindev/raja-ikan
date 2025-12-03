import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';

class LocationService {
  static final LocationService _instance = LocationService._internal();

  factory LocationService() {
    return _instance;
  }

  LocationService._internal();

  Future<bool> handlePermission() async {
    bool serviceEnabled;
    LocationPermission permission;

    // Test if location services are enabled.
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      // Location services are not enabled don't continue
      // accessing the position and request users of the
      // App to enable the location services.
      return false;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        // Permissions are denied, next time you could try
        // requesting permissions again (this is also where
        // Android's shouldShowRequestPermissionRationale
        // returned true. According to Android guidelines
        // your App should show an explanatory UI now.
        return false;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      // Permissions are denied forever, handle appropriately.
      return false;
    }

    return true;
  }

  Future<LatLng?> getCurrentLocation() async {
    final hasPermission = await handlePermission();
    if (!hasPermission) {
      return null;
    }

    try {
      // Force fresh location with timeout
      final position =
          await Geolocator.getCurrentPosition(
            locationSettings: const LocationSettings(
              accuracy: LocationAccuracy.high,
              timeLimit: Duration(seconds: 10),
            ),
            forceAndroidLocationManager: true,
          ).timeout(
            const Duration(seconds: 15),
            onTimeout: () async {
              // Fallback to last known location if timeout
              final lastKnown = await Geolocator.getLastKnownPosition();
              if (lastKnown != null) {
                return lastKnown;
              }
              throw Exception('Location timeout and no last known position');
            },
          );

      return LatLng(position.latitude, position.longitude);
    } catch (e) {
      return null;
    }
  }
}
