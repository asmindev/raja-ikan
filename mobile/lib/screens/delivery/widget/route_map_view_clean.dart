import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import 'package:flutter_compass/flutter_compass.dart';
import '../../../models/route.dart';
import '../../../providers/map_tile_provider.dart';
import '../../../services/location_tracker.dart';
import '../../../services/marker_animator.dart';
import '../../../services/route_updater.dart';
import '../../../services/location_service.dart';
import 'tile_selector_sheet.dart';

/// Clean rebuild: RouteMapView dengan simple state management
class RouteMapViewClean extends ConsumerStatefulWidget {
  final DeliveryRoute route;

  const RouteMapViewClean({super.key, required this.route});

  @override
  ConsumerState<RouteMapViewClean> createState() => _RouteMapViewCleanState();
}

class _RouteMapViewCleanState extends ConsumerState<RouteMapViewClean>
    with TickerProviderStateMixin {
  // ========== Core Components ==========
  final MapController _mapController = MapController();
  late LocationTracker _locationTracker;
  late MarkerAnimator _markerAnimator;
  late RouteUpdater _routeUpdater;

  // ========== Simple State ==========
  List<LatLng> _routePoints = [];
  bool _isLoadingRoute = true;
  bool _isTracking = false;
  bool _autoFollowMode = true;
  bool _mapRotationEnabled = true; // Toggle untuk rotasi peta
  double _currentMapRotation = 0.0; // Track rotasi peta saat ini
  double _deviceHeading = 0.0; // Heading dari compass sensor (arah HP)
  double? _gpsHeading; // Fallback: heading dari GPS (arah gerak)
  bool _compassAvailable = true; // Track compass availability

  // Compass stream
  StreamSubscription<CompassEvent>? _compassSubscription;

  // Ping animation
  AnimationController? _pingController;

  @override
  void initState() {
    super.initState();

    // Initialize services
    _locationTracker = LocationTracker();
    _markerAnimator = MarkerAnimator(
      vsync: this,
      initialPosition: const LatLng(-3.9778, 122.515), // Default Kendari
    );
    _routeUpdater = RouteUpdater();

    // Initialize ping animation
    _pingController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat();

    // Start compass stream untuk device heading
    _startCompass();

    // Load initial data
    _initMap();
  }

  /// Start compass stream with error handling
  void _startCompass() {
    try {
      _compassSubscription = FlutterCompass.events?.listen(
        (CompassEvent event) {
          if (mounted) {
            setState(() {
              // heading dari compass sensor (0-360°)
              _deviceHeading = event.heading ?? 0.0;
              _compassAvailable = true;
            });
          }
        },
        onError: (error) {
          debugPrint('⚠️ Compass error: $error');
          if (mounted) {
            setState(() => _compassAvailable = false);
          }
        },
        cancelOnError: false,
      );

      // Check if compass stream is null (not supported)
      if (FlutterCompass.events == null) {
        debugPrint('⚠️ Compass not available on this device');
        setState(() => _compassAvailable = false);
      }
    } catch (e) {
      debugPrint('⚠️ Failed to start compass: $e');
      setState(() => _compassAvailable = false);
    }
  }

  Future<void> _initMap() async {
    // Get initial user location
    final locationService = LocationService();
    final userLocation = await locationService.getCurrentLocation();

    if (userLocation != null && mounted) {
      _markerAnimator.jumpTo(userLocation);
    }

    // Load route from OSRM
    await _loadRoute();

    // Start tracking if delivering
    if (widget.route.status == 'delivering') {
      _startTracking();
    }
  }

  /// Load route dari OSRM API
  Future<void> _loadRoute() async {
    if (widget.route.osrmUrl == null || widget.route.osrmUrl!.isEmpty) {
      setState(() => _isLoadingRoute = false);
      return;
    }

    try {
      final response = await http.get(Uri.parse(widget.route.osrmUrl!));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);

        if (data['routes'] != null && data['routes'].isNotEmpty) {
          final coordinates =
              data['routes'][0]['geometry']['coordinates'] as List;

          setState(() {
            _routePoints = coordinates
                .map((coord) => LatLng(coord[1] as double, coord[0] as double))
                .toList();
            _isLoadingRoute = false;
          });

          _fitBounds();
        }
      }
    } catch (e) {
      debugPrint('❌ Load route error: $e');
      setState(() => _isLoadingRoute = false);
    }
  }

  /// Start live tracking
  void _startTracking() async {
    final success = await _locationTracker.startTracking(_onLocationUpdate);

    if (success) {
      setState(() => _isTracking = true);
    }
  }

  /// Handle location update dari GPS
  void _onLocationUpdate(LatLng position, double? heading, double speed) {
    // Store GPS heading as fallback
    if (heading != null) {
      setState(() => _gpsHeading = heading);
    }

    // 1. LOCAL UPDATE: Trim polyline (hapus titik yang sudah dilewati)
    if (_routePoints.isNotEmpty) {
      final trimmedRoute = _routeUpdater.trimPassedPoints(
        position,
        _routePoints,
      );

      if (trimmedRoute.length != _routePoints.length) {
        setState(() => _routePoints = trimmedRoute);
      }
    }

    // 2. SNAP TO ROAD: Gunakan titik terdekat di rute sebagai posisi marker
    LatLng displayPosition = position;
    if (_routePoints.isNotEmpty) {
      final closest = _routeUpdater.findClosestPoint(position, _routePoints);

      // Jika dekat dengan rute (< 20m), snap ke rute
      if (!closest.distance.isInfinite &&
          !closest.distance.isNaN &&
          closest.distance < 20.0) {
        displayPosition = _routePoints[closest.closestIndex];
      }
    }

    // 3. Animate marker ke posisi (snapped)
    _markerAnimator.animateTo(
      displayPosition,
      onUpdate: () {
        if (mounted) setState(() {});
      },
    );

    // 4. Auto-follow camera dengan rotasi (jika bergerak)
    if (_autoFollowMode) {
      _mapController.move(displayPosition, _mapController.camera.zoom);

      // Rotate map jika enabled dan bergerak cukup cepat (driving mode)
      if (_mapRotationEnabled && speed > 1.0 && heading != null) {
        // 1 m/s ≈ 3.6 km/h
        final newRotation = -heading; // Negative agar arah gerak ke atas
        if (_currentMapRotation != newRotation) {
          setState(() => _currentMapRotation = newRotation);
          _mapController.rotate(_currentMapRotation);
        }
      } else if (!_mapRotationEnabled && _currentMapRotation != 0) {
        // Reset rotation jika dinonaktifkan
        setState(() => _currentMapRotation = 0);
        _mapController.rotate(0);
      }
    }

    // 5. REROUTING: Jika user keluar dari jalur (> 50m)
    if (_routePoints.isNotEmpty &&
        _routeUpdater.isOffRoute(position, _routePoints)) {
      _rerouteFromCurrentPosition(position);
      return;
    }

    // 6. UPDATE ESTIMASI: Jika sudah berpindah jauh (> 100m)
    if (_routeUpdater.shouldUpdateForEstimation(position)) {
      _rerouteFromCurrentPosition(position);
    }
  }

  /// Reroute dari posisi sekarang
  void _rerouteFromCurrentPosition(LatLng position) async {
    if (widget.route.waypoints.length > 1) {
      final destinations = widget.route.waypoints
          .skip(1) // Skip driver location
          .map((w) => LatLng(w.latitude, w.longitude))
          .toList();

      await _routeUpdater.rerouteFromCurrentPosition(
        currentPosition: position,
        destinations: destinations,
        onUpdate: (newRoute) {
          if (mounted) {
            setState(() => _routePoints = newRoute);
          }
        },
      );
    }
  }

  /// Fit map bounds to show route
  void _fitBounds() {
    if (_routePoints.isEmpty) return;

    double minLat = _routePoints.first.latitude;
    double maxLat = _routePoints.first.latitude;
    double minLng = _routePoints.first.longitude;
    double maxLng = _routePoints.first.longitude;

    for (final point in _routePoints) {
      if (point.latitude < minLat) minLat = point.latitude;
      if (point.latitude > maxLat) maxLat = point.latitude;
      if (point.longitude < minLng) minLng = point.longitude;
      if (point.longitude > maxLng) maxLng = point.longitude;
    }

    final bounds = LatLngBounds(
      LatLng(minLat - 0.01, minLng - 0.01),
      LatLng(maxLat + 0.01, maxLng + 0.01),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _mapController.fitCamera(
        CameraFit.bounds(bounds: bounds, padding: const EdgeInsets.all(50)),
      );
    });
  }

  /// Center on user location
  void _centerOnUser() async {
    final locationService = LocationService();
    final location = await locationService.getCurrentLocation();

    if (location != null) {
      _mapController.move(location, 15.0);
    }
  }

  /// Calculate marker rotation with fallback mechanism
  /// Priority: Compass > GPS heading > Default (0)
  double _calculateMarkerRotation() {
    const double degreesToRadians = 3.14159 / 180;

    // 1. If compass is available and working, use device heading
    if (_compassAvailable) {
      // Device heading - map rotation = arrow selalu point ke atas HP
      return (_deviceHeading - _currentMapRotation) * degreesToRadians;
    }

    // 2. Fallback: If compass not available, use GPS heading (movement direction)
    if (_gpsHeading != null) {
      // GPS heading shows movement direction, counter map rotation
      return (_gpsHeading! - _currentMapRotation) * degreesToRadians;
    }

    // 3. Default: no rotation (point north)
    return 0.0;
  }

  @override
  void dispose() {
    _locationTracker.dispose();
    _markerAnimator.dispose();
    _compassSubscription?.cancel();
    _pingController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    return Stack(
      children: [
        // Map
        FlutterMap(
          mapController: _mapController,
          options: MapOptions(
            initialCenter: _markerAnimator.position,
            initialZoom: 13.0,
            interactionOptions: const InteractionOptions(
              flags: InteractiveFlag.all,
            ),
            onPositionChanged: (position, hasGesture) {
              // Disable auto-follow jika user manual gesture
              if (hasGesture && _autoFollowMode) {
                setState(() => _autoFollowMode = false);
              }
            },
          ),
          children: [
            // Tile Layer
            Consumer(
              builder: (context, ref, child) {
                final selectedTile = ref.watch(selectedTileProvider);
                return TileLayer(
                  urlTemplate: selectedTile.urlTemplate,
                  maxZoom: selectedTile.maxZoom.toDouble(),
                  minZoom: selectedTile.minZoom.toDouble(),
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

            // Markers
            MarkerLayer(
              markers: [
                // User location marker (navigation arrow - always pointing up)
                Marker(
                  point: _markerAnimator.position,
                  width: 80,
                  height: 80,
                  alignment: Alignment.center,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Ping animation background
                      if (_pingController != null)
                        AnimatedBuilder(
                          animation: _pingController!,
                          builder: (context, child) {
                            final value = _pingController!.value;
                            final size = 20.0 + (30.0 * value);
                            return Container(
                              width: size,
                              height: size,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color:
                                    (_isTracking
                                            ? const Color(0xFF2563EB)
                                            : Colors.blue)
                                        .withValues(alpha: 0.5 * (1.0 - value)),
                              ),
                            );
                          },
                        ),
                      // Navigation Arrow - mengikuti arah atas HP (compass)
                      // Fallback ke GPS heading jika compass tidak tersedia
                      Transform.rotate(
                        // Use compass if available, otherwise fallback to GPS heading
                        angle: _calculateMarkerRotation(),
                        child: Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white,
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.2),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ],
                          ),
                          padding: const EdgeInsets.all(2),
                          child: Icon(
                            Icons.navigation,
                            size: _isTracking ? 40 : 36,
                            color: _isTracking
                                ? const Color(0xFF2563EB)
                                : Colors.blue,
                          ),
                        ),
                      ),
                    ],
                  ),
                ), // Destination markers
                ...widget.route.waypoints.skip(1).map((waypoint) {
                  final index = widget.route.waypoints.indexOf(waypoint);
                  return Marker(
                    point: LatLng(waypoint.latitude, waypoint.longitude),
                    width: 32,
                    height: 32,
                    child: Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF7C3AED),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2.5),
                      ),
                      child: Center(
                        child: Text(
                          '$index',
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 13,
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

        // Tile Selector Button
        Positioned(
          right: 16,
          top: 200,
          child: Material(
            elevation: 4,
            borderRadius: BorderRadius.circular(8),
            child: InkWell(
              onTap: () {
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
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
                  Icons.layers_outlined,
                  color: Color(0xFF059669),
                  size: 24,
                ),
              ),
            ),
          ),
        ),

        // Auto-follow toggle button
        if (_isTracking)
          Positioned(
            right: 16,
            top: 80,
            child: Material(
              elevation: 4,
              borderRadius: BorderRadius.circular(8),
              child: InkWell(
                onTap: () => setState(() => _autoFollowMode = !_autoFollowMode),
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

        // Map rotation toggle button
        if (_isTracking)
          Positioned(
            right: 16,
            top: 136,
            child: Material(
              elevation: 4,
              borderRadius: BorderRadius.circular(8),
              child: InkWell(
                onTap: () {
                  setState(() => _mapRotationEnabled = !_mapRotationEnabled);
                  // Reset rotation jika dinonaktifkan
                  if (!_mapRotationEnabled) {
                    _currentMapRotation = 0;
                    _mapController.rotate(0);
                  }
                },
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: _mapRotationEnabled
                        ? const Color(0xFF059669)
                        : Colors.white,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    _mapRotationEnabled ? Icons.explore : Icons.explore_off,
                    color: _mapRotationEnabled
                        ? Colors.white
                        : const Color(0xFF6B7280),
                    size: 24,
                  ),
                ),
              ),
            ),
          ),

        // Zoom controls
        Positioned(
          right: 16,
          bottom: 100 + bottomPadding,
          child: Column(
            children: [
              // Zoom in
              Material(
                elevation: 4,
                borderRadius: BorderRadius.circular(8),
                child: InkWell(
                  onTap: () {
                    final zoom = _mapController.camera.zoom;
                    _mapController.move(_mapController.camera.center, zoom + 1);
                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.add, color: Color(0xFF059669)),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              // Zoom out
              Material(
                elevation: 4,
                borderRadius: BorderRadius.circular(8),
                child: InkWell(
                  onTap: () {
                    final zoom = _mapController.camera.zoom;
                    _mapController.move(_mapController.camera.center, zoom - 1);
                  },
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.remove, color: Color(0xFF059669)),
                  ),
                ),
              ),
              const SizedBox(height: 8),
              // Center on user
              Material(
                elevation: 4,
                borderRadius: BorderRadius.circular(8),
                child: InkWell(
                  onTap: _centerOnUser,
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.gps_fixed,
                      color: Color(0xFF059669),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),

        // Loading indicator
        if (_isLoadingRoute)
          Container(
            color: Colors.black26,
            child: const Center(child: CircularProgressIndicator()),
          ),
      ],
    );
  }
}
