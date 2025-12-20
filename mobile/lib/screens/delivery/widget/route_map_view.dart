import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_compass/flutter_compass.dart';
import '../../../models/route.dart';
import '../../../providers/map_tile_provider.dart';
import 'tile_selector_sheet.dart';
import '../../../services/location_service.dart';

class RouteMapView extends ConsumerStatefulWidget {
  final DeliveryRoute route;

  const RouteMapView({super.key, required this.route});

  @override
  ConsumerState<RouteMapView> createState() => _RouteMapViewState();
}

class _RouteMapViewState extends ConsumerState<RouteMapView>
    with TickerProviderStateMixin {
  List<LatLng> _routePoints = [];
  bool _isLoadingRoute = true;
  bool _isLocatingUser = false;
  final MapController _mapController = MapController();
  LatLng? _userLocation;
  AnimationController? _pingController;

  // Live tracking states
  StreamSubscription<Position>? _positionStreamSubscription;
  StreamSubscription<CompassEvent>? _compassStreamSubscription;
  double _userHeading = 0.0; // Bearing/heading in degrees (0-360)
  double? _compassHeading; // Real-time compass heading from magnetometer
  bool _isTracking = false;
  LatLng? _previousLocation; // For calculating bearing

  // Smooth marker animation with interpolation
  AnimationController? _markerAnimationController;
  Animation<double>? _markerAnimation;
  LatLng? _markerStartPos; // Start position for interpolation
  LatLng? _markerTargetPos; // Target position for interpolation
  LatLng _animatedMarkerPos = const LatLng(
    -3.9778,
    122.515,
  ); // Current animated position

  // Animation controllers for smooth transitions
  Timer? _smoothFollowTimer;

  // Manual rotation control
  bool _autoFollowMode = true; // Auto-follow and rotate
  double _manualRotation = 0.0; // User's manual rotation

  // Auto route recalculation
  LatLng? _lastRouteUpdatePosition; // Position saat route terakhir di-update
  bool _isRecalculatingRoute = false;

  @override
  void initState() {
    super.initState();

    // Initialize marker animation controller
    _markerAnimationController = AnimationController(
      duration: const Duration(milliseconds: 800), // Smooth movement duration
      vsync: this,
    );

    _loadRouteData();
    _ensurePingController();
    _initUserLocation();
    _checkAndStartTracking(); // Start tracking if delivering
  }

  @override
  void didUpdateWidget(RouteMapView oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Reload route if status changed (draft → active/delivering)
    if (oldWidget.route.status != widget.route.status ||
        oldWidget.route.osrmUrl != widget.route.osrmUrl) {
      debugPrint(
        '🔄 Route updated: ${oldWidget.route.status} → ${widget.route.status}',
      );
      _loadRouteData();

      // Start/stop tracking based on status
      _checkAndStartTracking();
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _ensurePingController();
  }

  Future<void> _initUserLocation() async {
    final locationService = LocationService();
    final location = await locationService.getCurrentLocation();
    if (mounted && location != null) {
      setState(() {
        _userLocation = location;
        _animatedMarkerPos = location; // Initialize animated position
      });
    }
  }

  /// Check if should start tracking based on route status
  void _checkAndStartTracking() {
    if (widget.route.status == 'delivering') {
      _startTracking();
    } else {
      _stopTracking();
    }
  }

  /// Start live location tracking
  Future<void> _startTracking() async {
    if (_isTracking) return; // Already tracking

    final locationService = LocationService();
    final hasPermission = await locationService.handlePermission();

    if (!hasPermission) {
      debugPrint('❌ Location permission denied');
      return;
    }

    final positionStream = locationService.getPositionStream();
    if (positionStream == null) {
      debugPrint('❌ Could not get position stream');
      return;
    }

    setState(() => _isTracking = true);
    debugPrint('🎯 Live tracking started');

    // Start compass stream untuk device orientation
    _compassStreamSubscription = FlutterCompass.events?.listen(
      (CompassEvent event) {
        if (!mounted || !_isTracking) return;

        // Update compass heading dari magnetometer
        if (event.heading != null) {
          setState(() {
            _compassHeading = event.heading;
          });
        }
      },
      onError: (error) {
        debugPrint('⚠️ Compass error: $error');
      },
      onDone: () {
        debugPrint('🧭 Compass stream closed');
      },
    );

    _positionStreamSubscription = positionStream.listen(
      (Position position) {
        if (!mounted) return;

        final newLocation = LatLng(position.latitude, position.longitude);

        // Calculate distance and bearing from movement
        double distance = 0.0;
        double? movementBearing;

        if (_previousLocation != null) {
          distance = Geolocator.distanceBetween(
            _previousLocation!.latitude,
            _previousLocation!.longitude,
            newLocation.latitude,
            newLocation.longitude,
          );

          // Calculate bearing from movement if moved significantly
          if (distance > 1.0) {
            movementBearing = Geolocator.bearingBetween(
              _previousLocation!.latitude,
              _previousLocation!.longitude,
              newLocation.latitude,
              newLocation.longitude,
            );

            // Normalize to 0-360 range
            if (movementBearing < 0) {
              movementBearing = movementBearing + 360;
            }
            if (movementBearing >= 360) {
              movementBearing = movementBearing - 360;
            }
          }
        }

        // Determine heading priority:
        // 1. Compass heading (magnetometer) - real device orientation
        // 2. GPS heading - fallback if compass not available
        // 3. Movement bearing - if moving without compass
        // 4. Keep previous heading - if stationary
        double newHeading = _userHeading; // Default: keep current

        if (_compassHeading != null) {
          // Magnetometer compass heading available (device orientation) - BEST
          newHeading = _compassHeading!;
        } else if (position.heading > 0) {
          // GPS compass heading available (device orientation) - GOOD
          newHeading = position.heading;
        } else if (movementBearing != null && position.speed > 0.3) {
          // Use movement bearing if moving without compass - OK
          newHeading = movementBearing;
        }
        // else: keep previous heading when stationary

        // Apply smooth interpolation untuk menghindari jitter
        double displayHeading = newHeading;
        if (_userHeading > 0) {
          // Calculate shortest rotation angle
          double diff = newHeading - _userHeading;

          // Normalize diff to -180 to 180 range
          while (diff > 180) diff -= 360;
          while (diff < -180) diff += 360;

          // Smooth interpolation based on change magnitude
          if (diff.abs() < 5) {
            // Very small change - smooth heavily to avoid jitter
            displayHeading = _userHeading + (diff * 0.3);
          } else if (diff.abs() < 30) {
            // Medium change - smooth moderately
            displayHeading = _userHeading + (diff * 0.6);
          } else {
            // Large change - apply immediately for responsiveness
            displayHeading = newHeading;
          }
        }

        // Normalize final heading
        while (displayHeading < 0) displayHeading += 360;
        while (displayHeading >= 360) displayHeading -= 360;

        setState(() {
          _previousLocation = _userLocation;
          _userLocation = newLocation;
          _userHeading = displayHeading;
        });

        // Animate marker to new position with smooth interpolation
        _animateMarkerToPosition(newLocation);

        // Smooth camera follow with rotation
        _smoothFollowUserWithRotation(newLocation, displayHeading);

        // Auto-recalculate route jika sudah bergerak > 50 meter dari last update
        _checkAndRecalculateRoute(newLocation);

        debugPrint(
          '📍 Lat: ${position.latitude.toStringAsFixed(6)}, Lng: ${position.longitude.toStringAsFixed(6)}\n'
          '📏 Distance: ${distance.toStringAsFixed(2)}m\n'
          '🧭 Compass: ${_compassHeading?.toStringAsFixed(1) ?? 'N/A'}°, GPS: ${position.heading.toStringAsFixed(1)}°, Movement: ${movementBearing?.toStringAsFixed(1) ?? 'N/A'}°\n'
          '➡️ Display: ${displayHeading.toStringAsFixed(1)}°\n'
          '🏃 Speed: ${position.speed.toStringAsFixed(2)} m/s, Accuracy: ±${position.accuracy.toStringAsFixed(1)}m',
        );
      },
      onError: (error) {
        debugPrint('❌ Position stream error: $error');
      },
    );
  }

  /// Animate marker smoothly to new position using linear interpolation
  void _animateMarkerToPosition(LatLng targetPosition) {
    // Skip if target is same as current animated position
    if (_animatedMarkerPos.latitude == targetPosition.latitude &&
        _animatedMarkerPos.longitude == targetPosition.longitude) {
      return;
    }

    // Set start and target positions for interpolation
    _markerStartPos = _animatedMarkerPos;
    _markerTargetPos = targetPosition;

    // Reset and configure animation with easeInOut curve for smooth start/end
    _markerAnimation = CurvedAnimation(
      parent: _markerAnimationController!,
      curve: Curves.easeInOut,
    );

    // Add listener for smooth interpolation
    _markerAnimationController!.addListener(() {
      if (!mounted || _markerStartPos == null || _markerTargetPos == null) {
        return;
      }

      setState(() {
        // Linear interpolation: Position = Start + (End - Start) * t
        final t = _markerAnimation!.value;
        final lat =
            _markerStartPos!.latitude +
            (_markerTargetPos!.latitude - _markerStartPos!.latitude) * t;
        final lng =
            _markerStartPos!.longitude +
            (_markerTargetPos!.longitude - _markerStartPos!.longitude) * t;

        _animatedMarkerPos = LatLng(lat, lng);
      });
    });

    // Start animation from beginning
    _markerAnimationController!.forward(from: 0.0);
  }

  /// Stop live location tracking
  void _stopTracking() {
    if (!_isTracking) return;

    _positionStreamSubscription?.cancel();
    _positionStreamSubscription = null;

    _compassStreamSubscription?.cancel();
    _compassStreamSubscription = null;

    setState(() {
      _isTracking = false;
      _compassHeading = null;
    });
    debugPrint('🛑 Live tracking stopped');
  }

  /// Check if need to recalculate route based on distance moved
  Future<void> _checkAndRecalculateRoute(LatLng currentLocation) async {
    if (_isRecalculatingRoute) return; // Already recalculating
    if (widget.route.waypoints.isEmpty) return; // No waypoints

    // Initialize last update position
    _lastRouteUpdatePosition ??= currentLocation;

    // Calculate distance from last route update
    final distanceFromLastUpdate = Geolocator.distanceBetween(
      _lastRouteUpdatePosition!.latitude,
      _lastRouteUpdatePosition!.longitude,
      currentLocation.latitude,
      currentLocation.longitude,
    );

    // Recalculate if moved more than 50 meters
    if (distanceFromLastUpdate > 50) {
      debugPrint(
        '🔄 Recalculating route - moved ${distanceFromLastUpdate.toStringAsFixed(1)}m',
      );
      _isRecalculatingRoute = true;
      _lastRouteUpdatePosition = currentLocation;

      try {
        // Build OSRM URL with current location as start
        final destinations = widget.route.waypoints
            .skip(1) // Skip driver location, use remaining destinations
            .map((w) => '${w.longitude},${w.latitude}')
            .join(';');

        final osrmUrl =
            'https://router.project-osrm.org/route/v1/driving/'
            '${currentLocation.longitude},${currentLocation.latitude};'
            '$destinations?'
            'overview=full&geometries=geojson';

        debugPrint('🗺️ New route URL: $osrmUrl');
        final response = await http.get(Uri.parse(osrmUrl));

        if (response.statusCode == 200) {
          final data = json.decode(response.body);
          if (data['routes'] != null && data['routes'].isNotEmpty) {
            final coordinates =
                data['routes'][0]['geometry']['coordinates'] as List;

            setState(() {
              _routePoints = coordinates
                  .map(
                    (coord) => LatLng(coord[1] as double, coord[0] as double),
                  )
                  .toList();
            });

            debugPrint('✅ Route recalculated: ${_routePoints.length} points');
          }
        }
      } catch (e) {
        debugPrint('❌ Error recalculating route: $e');
      } finally {
        _isRecalculatingRoute = false;
      }
    }
  }

  /// Smooth follow user location with map rotation based on heading
  void _smoothFollowUserWithRotation(LatLng location, double heading) {
    if (!_isTracking || !_autoFollowMode) return; // Skip if manual mode

    // Cancel previous timer if exists
    _smoothFollowTimer?.cancel();

    // Target rotation (negative for map rotation)
    final targetRotation = -heading;
    final currentRotation = _mapController.camera.rotation;
    final currentCenter = _mapController.camera.center;

    // Calculate rotation difference
    double rotationDiff = targetRotation - currentRotation;

    // Normalize rotation difference to -180 to 180 range
    while (rotationDiff > 180) rotationDiff -= 360;
    while (rotationDiff < -180) rotationDiff += 360;

    // Smooth animation parameters
    const steps = 10;
    const duration = Duration(milliseconds: 300);
    final stepDuration = duration.inMilliseconds ~/ steps;

    int currentStep = 0;

    _smoothFollowTimer = Timer.periodic(Duration(milliseconds: stepDuration), (
      timer,
    ) {
      if (!mounted || !_isTracking) {
        timer.cancel();
        return;
      }

      currentStep++;
      final progress = currentStep / steps;

      // Ease-out interpolation
      final easedProgress = 1 - (1 - progress) * (1 - progress);

      // Interpolate position
      final lat =
          currentCenter.latitude +
          (location.latitude - currentCenter.latitude) * easedProgress;
      final lng =
          currentCenter.longitude +
          (location.longitude - currentCenter.longitude) * easedProgress;

      // Interpolate rotation
      final newRotation = currentRotation + rotationDiff * easedProgress;

      _mapController.move(LatLng(lat, lng), _mapController.camera.zoom);
      _mapController.rotate(newRotation);

      if (currentStep >= steps) {
        timer.cancel();
      }
    });
  }

  void _loadRouteData() {
    // Only fetch OSRM route if not draft
    if (widget.route.status != 'draft') {
      _fetchRouteFromOSRM();
    } else {
      setState(() => _isLoadingRoute = false);
      // For draft, fit bounds to waypoints
      if (widget.route.waypoints.isNotEmpty) {
        _fitBounds();
      }
    }
  }

  void _ensurePingController() {
    _pingController ??= AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat();
  }

  @override
  void dispose() {
    _stopTracking(); // Stop tracking when disposing
    _smoothFollowTimer?.cancel();
    _pingController?.dispose();
    _markerAnimationController?.dispose();
    super.dispose();
  }

  Future<void> _fetchRouteFromOSRM() async {
    try {
      // Check if osrmUrl is available
      if (widget.route.osrmUrl == null || widget.route.osrmUrl!.isEmpty) {
        setState(() => _isLoadingRoute = false);
        debugPrint('❌ OSRM URL is null or empty');
        return;
      }

      debugPrint('🗺️ Fetching route from: ${widget.route.osrmUrl}');
      final response = await http.get(Uri.parse(widget.route.osrmUrl!));
      debugPrint('📡 Response status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        debugPrint('📦 Response data keys: ${data.keys}');
        debugPrint('Widget Waypoints: ${widget.route.waypoints}');
        debugPrint('Data Waypoints: ${data['waypoints']}');

        if (data['routes'] != null && data['routes'].isNotEmpty) {
          final coordinates =
              data['routes'][0]['geometry']['coordinates'] as List;
          debugPrint('✅ Got ${coordinates.length} route points');

          setState(() {
            _routePoints = coordinates
                .map((coord) => LatLng(coord[1] as double, coord[0] as double))
                .toList();
            _isLoadingRoute = false;
          });

          // Fit bounds to show entire route
          if (_routePoints.isNotEmpty) {
            _fitBounds();
          }
        } else {
          debugPrint('❌ No routes in response');
          setState(() => _isLoadingRoute = false);
        }
      } else {
        debugPrint('❌ HTTP ${response.statusCode}: ${response.body}');
        setState(() => _isLoadingRoute = false);
      }
    } catch (e) {
      setState(() => _isLoadingRoute = false);
      debugPrint('❌ Error fetching route: $e');
    }
  }

  Future<void> _centerOnUserLocation() async {
    setState(() => _isLocatingUser = true);

    final locationService = LocationService();
    final location = await locationService.getCurrentLocation();

    if (mounted) {
      setState(() {
        _isLocatingUser = false;
        if (location != null) {
          _userLocation = location;
        }
      });
    }

    if (location != null) {
      _mapController.move(location, 15.0);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Could not get current location')),
        );
      }
    }
  }

  void _fitBounds() {
    // If draft mode, use waypoints for bounds
    if (_routePoints.isEmpty && widget.route.waypoints.isNotEmpty) {
      double minLat = widget.route.waypoints[0].latitude;
      double maxLat = widget.route.waypoints[0].latitude;
      double minLng = widget.route.waypoints[0].longitude;
      double maxLng = widget.route.waypoints[0].longitude;

      for (final waypoint in widget.route.waypoints) {
        if (waypoint.latitude < minLat) minLat = waypoint.latitude;
        if (waypoint.latitude > maxLat) maxLat = waypoint.latitude;
        if (waypoint.longitude < minLng) minLng = waypoint.longitude;
        if (waypoint.longitude > maxLng) maxLng = waypoint.longitude;
      }

      final paddedBounds = LatLngBounds(
        LatLng(minLat - 0.01, minLng - 0.01),
        LatLng(maxLat + 0.01, maxLng + 0.01),
      );

      WidgetsBinding.instance.addPostFrameCallback((_) {
        _mapController.fitCamera(
          CameraFit.bounds(
            bounds: paddedBounds,
            padding: const EdgeInsets.all(50),
          ),
        );
      });
      return;
    }

    // Optimized route - use route points
    if (_routePoints.isEmpty) return;

    double minLat = _routePoints[0].latitude;
    double maxLat = _routePoints[0].latitude;
    double minLng = _routePoints[0].longitude;
    double maxLng = _routePoints[0].longitude;

    for (final point in _routePoints) {
      if (point.latitude < minLat) minLat = point.latitude;
      if (point.latitude > maxLat) maxLat = point.latitude;
      if (point.longitude < minLng) minLng = point.longitude;
      if (point.longitude > maxLng) maxLng = point.longitude;
    }

    // Add padding
    final paddedBounds = LatLngBounds(
      LatLng(minLat - 0.01, minLng - 0.01),
      LatLng(maxLat + 0.01, maxLng + 0.01),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _mapController.fitCamera(
        CameraFit.bounds(
          bounds: paddedBounds,
          padding: const EdgeInsets.all(50),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    // Get safe area padding
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Stack(
      children: [
        FlutterMap(
          mapController: _mapController,
          options: MapOptions(
            initialCenter: widget.route.waypoints.isNotEmpty
                ? LatLng(
                    widget.route.waypoints[0].latitude,
                    widget.route.waypoints[0].longitude,
                  )
                : const LatLng(-3.9778, 122.515), // Default Kendari
            initialZoom: 13.0,
            // minZoom: 5.0,
            // maxZoom: 16.0, // Match ArcGIS tile maxZoom
            // Enable all map interactions including rotation
            interactionOptions: const InteractionOptions(
              flags:
                  InteractiveFlag.all, // Enable all gestures including rotate
            ),
            onPositionChanged: (position, hasGesture) {
              // Detect manual rotation by user
              if (hasGesture && position.rotation != null) {
                final currentRotation = position.rotation!;
                // If user manually rotates, disable auto-follow
                if (_autoFollowMode &&
                    (currentRotation - _manualRotation).abs() > 5) {
                  setState(() {
                    _autoFollowMode = false;
                    _manualRotation = currentRotation;
                  });
                  debugPrint(
                    '🔄 Manual rotation detected - Auto-follow disabled',
                  );
                }
              }
            },
          ),
          children: [
            // Tile Layer (Dynamic - from provider)
            Consumer(
              builder: (context, ref, child) {
                final selectedTile = ref.watch(selectedTileProvider);
                return TileLayer(
                  urlTemplate: selectedTile.urlTemplate,
                  userAgentPackageName: 'com.example.mobile',
                  maxZoom: selectedTile.maxZoom.toDouble(),
                  minZoom: selectedTile.minZoom.toDouble(),
                  additionalOptions: {'attribution': selectedTile.attribution},
                );
              },
            ),

            // Route Polyline
            if (_routePoints.isNotEmpty)
              PolylineLayer(
                polylines: [
                  Polyline(
                    points: _routePoints,
                    strokeWidth: 4.0,
                    color: const Color(0xFF7C3AED),
                    borderStrokeWidth: 2.0,
                    borderColor: Colors.white,
                  ),
                ],
              ),

            // Waypoint Markers
            MarkerLayer(
              markers: [
                // User Location Marker - Simple Circle with Smooth Animation
                if (_userLocation != null)
                  Marker(
                    point:
                        _animatedMarkerPos, // Use animated position for smooth movement
                    width: 80,
                    height: 80,
                    alignment: Alignment.center,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Ping Animation - always show
                        if (_pingController != null)
                          AnimatedBuilder(
                            animation: _pingController!,
                            builder: (context, child) {
                              final value = Curves.easeOut.transform(
                                _pingController!.value,
                              );
                              final size = 16.0 + (24.0 * value);
                              return Container(
                                width: size,
                                height: size,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color:
                                      (_isTracking
                                              ? const Color(0xFF2563EB)
                                              : Colors.blue)
                                          .withValues(alpha: 1 * (1.0 - value)),
                                ),
                              );
                            },
                          ),
                        // Inner Circle - larger when tracking
                        Container(
                          width: _isTracking ? 28 : 24,
                          height: _isTracking ? 28 : 24,
                          decoration: BoxDecoration(
                            color: _isTracking
                                ? const Color(0xFF2563EB)
                                : Colors.blue,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 3),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.3),
                                blurRadius: 4,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                // Driver location marker (first waypoint - no number)
                // Only show if NOT local draft (ID != 0) AND NOT delivering (use real-time marker instead)
                if (widget.route.waypoints.isNotEmpty &&
                    widget.route.id != 0 &&
                    widget.route.status != 'delivering')
                  Marker(
                    point: LatLng(
                      widget.route.waypoints[0].latitude,
                      widget.route.waypoints[0].longitude,
                    ),
                    width: 32,
                    height: 32,
                    child: GestureDetector(
                      onTap: () {
                        // Show driver location label
                        final driverLabel =
                            widget.route.waypoints[0].customerName ??
                            'Driver Location';
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              driverLabel,
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            duration: const Duration(seconds: 2),
                            behavior: SnackBarBehavior.floating,
                            margin: const EdgeInsets.all(16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        );
                      },
                      child: Container(
                        decoration: BoxDecoration(
                          color: const Color(0xFF059669), // Green for driver
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2.5),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.3),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: const Center(
                          child: Icon(
                            Icons.person_pin_circle,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                      ),
                    ),
                  ),

                // Customer waypoint markers
                // If local draft (ID == 0), show ALL waypoints as customers
                // If backend route (ID != 0), skip first (driver)
                ...widget.route.waypoints
                    .asMap()
                    .entries
                    .where(
                      (entry) => widget.route.id == 0 || entry.key > 0,
                    ) // Skip index 0 only if backend route
                    .map((entry) {
                      // Adjust display number:
                      // If local draft: index + 1
                      // If backend route: index (since index 1 is customer 1)
                      final displayNumber = widget.route.id == 0
                          ? entry.key + 1
                          : entry.key;

                      return Marker(
                        point: LatLng(
                          entry.value.latitude,
                          entry.value.longitude,
                        ),
                        width: 32,
                        height: 32,
                        child: GestureDetector(
                          onTap: () {
                            // Show customer name in SnackBar
                            final customerName =
                                entry.value.customerName ??
                                'Customer $displayNumber';
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  customerName,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                duration: const Duration(seconds: 2),
                                behavior: SnackBarBehavior.floating,
                                margin: const EdgeInsets.all(16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                            );
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(
                                0xFF7C3AED,
                              ), // Purple for all customers
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white,
                                width: 2.5,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.3),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Center(
                              child: Text(
                                '$displayNumber',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
              ],
            ),
          ],
        ),

        // Auto-Follow Toggle Button (only show when tracking)
        if (_isTracking)
          Positioned(
            right: 16,
            top: 80,
            child: Material(
              elevation: 4,
              borderRadius: BorderRadius.circular(8),
              child: InkWell(
                onTap: () {
                  setState(() {
                    _autoFollowMode = !_autoFollowMode;
                    if (_autoFollowMode) {
                      // Re-enable auto-follow - reset rotation to current heading
                      _manualRotation = _userHeading;
                      debugPrint('🎯 Auto-follow enabled');
                    } else {
                      debugPrint('👆 Manual control enabled');
                    }
                  });
                },
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: _autoFollowMode
                        ? const Color(0xFF059669)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    _autoFollowMode
                        ? Icons.my_location
                        : Icons.location_searching,
                    color: _autoFollowMode
                        ? Colors.white
                        : const Color(0xFF059669),
                    size: 24,
                  ),
                ),
              ),
            ),
          ),

        // Zoom Controls
        Positioned(
          right: 16,
          bottom: 100 + bottomPadding, // Tambah padding untuk navigation bar
          child: Column(
            children: [
              // Zoom In
              Material(
                elevation: 4,
                borderRadius: BorderRadius.circular(8),
                child: InkWell(
                  onTap: () {
                    final currentZoom = _mapController.camera.zoom;
                    _mapController.move(
                      _mapController.camera.center,
                      currentZoom + 1,
                    );
                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.add,
                      color: Color(0xFF059669),
                      size: 24,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              // Zoom Out
              Material(
                elevation: 4,
                borderRadius: BorderRadius.circular(8),
                child: InkWell(
                  onTap: () {
                    final currentZoom = _mapController.camera.zoom;
                    _mapController.move(
                      _mapController.camera.center,
                      currentZoom - 1,
                    );
                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.remove,
                      color: Color(0xFF059669),
                      size: 24,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              // Reset View
              Material(
                elevation: 4,
                borderRadius: BorderRadius.circular(8),
                child: InkWell(
                  onTap: _isLocatingUser ? null : _centerOnUserLocation,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: _isLocatingUser
                        ? const Padding(
                            padding: EdgeInsets.all(12.0),
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              color: Color(0xFF059669),
                            ),
                          )
                        : const Icon(
                            Icons.my_location,
                            color: Color(0xFF059669),
                            size: 20,
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Tile Selector Button - Top Right
        Positioned(
          top: 120,
          right: 16,
          child: Material(
            elevation: 4,
            borderRadius: BorderRadius.circular(8),
            child: InkWell(
              onTap: () {
                showModalBottomSheet(
                  context: context,
                  backgroundColor: Colors.transparent,
                  builder: (context) => const TileSelectorSheet(),
                );
              },
              borderRadius: BorderRadius.circular(8),
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.layers,
                  color: Color(0xFF7C3AED),
                  size: 20,
                ),
              ),
            ),
          ),
        ),

        // Loading indicator
        if (_isLoadingRoute)
          Container(
            color: Colors.black.withValues(alpha: 0.3),
            child: const Center(
              child: Card(
                child: Padding(
                  padding: EdgeInsets.all(20),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(),
                      SizedBox(height: 16),
                      Text('Loading route...'),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
