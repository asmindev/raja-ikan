import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
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
    with SingleTickerProviderStateMixin {
  List<LatLng> _routePoints = [];
  bool _isLoadingRoute = true;
  bool _isLocatingUser = false;
  final MapController _mapController = MapController();
  LatLng? _userLocation;
  AnimationController? _pingController;

  @override
  void initState() {
    super.initState();
    _loadRouteData();
    _ensurePingController();
    _initUserLocation();
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
      });
    }
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
    _pingController?.dispose();
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
            // Enable all map interactions - explicit flags
            interactionOptions: const InteractionOptions(
              flags:
                  InteractiveFlag.pinchZoom |
                  InteractiveFlag.drag |
                  InteractiveFlag.doubleTapZoom |
                  InteractiveFlag.flingAnimation,
            ),
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
                // User Location Marker
                if (_userLocation != null)
                  Marker(
                    point: _userLocation!,
                    width: 80,
                    height: 80,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Ping Animation
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
                                  color: Colors.blue.withValues(
                                    alpha: 1 * (1.0 - value),
                                  ),
                                ),
                              );
                            },
                          ),
                        // Inner Circle
                        Container(
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            color: Colors.blue,
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
                // Only show if NOT local draft (ID != 0)
                if (widget.route.waypoints.isNotEmpty && widget.route.id != 0)
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

        // Zoom Controls
        Positioned(
          right: 16,
          bottom: 100,
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
