import 'package:flutter/material.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart' hide Scaffold, Colors;
import '../../models/route.dart';
import '../../models/order.dart';
import '../../services/route_service.dart';
import '../../services/location_service.dart';
import 'widget/route_header.dart';
import 'widget/route_map_view.dart';
import 'widget/route_bottom_sheet.dart';

class RouteMapPage extends StatefulWidget {
  final DeliveryRoute route;
  final List<OrderModel> orders;

  const RouteMapPage({super.key, required this.route, required this.orders});

  @override
  State<RouteMapPage> createState() => _RouteMapPageState();
}

class _RouteMapPageState extends State<RouteMapPage> {
  bool _isLoading = false;
  final RouteService _routeService = RouteService();
  late List<OrderModel> _sortedOrders;
  late DeliveryRoute _currentRoute;

  @override
  void initState() {
    super.initState();
    _currentRoute = widget.route;
    // Sort orders by sequence from waypoints
    _sortedOrders = _sortOrdersByWaypoints();
  }

  // Check if route is draft (not optimized yet)
  bool get _isDraft => _currentRoute.status == 'draft';

  List<OrderModel> _sortOrdersByWaypoints() {
    // If no waypoints or waypoints don't have orderId, return original order
    if (_currentRoute.waypoints.isEmpty) {
      return widget.orders;
    }

    // Create a map of order_id to order
    final orderMap = {for (var order in widget.orders) order.id: order};

    // Sort orders based on waypoint sequence (skip first waypoint = driver)
    final sortedOrders = <OrderModel>[];
    for (int i = 1; i < _currentRoute.waypoints.length; i++) {
      final waypoint = _currentRoute.waypoints[i];
      if (waypoint.orderId != null && orderMap.containsKey(waypoint.orderId)) {
        sortedOrders.add(orderMap[waypoint.orderId]!);
      }
    }

    // If no orders were sorted (orderId not available), return original order
    if (sortedOrders.isEmpty) {
      return widget.orders;
    }

    return sortedOrders;
  }

  Future<void> _startDelivery() async {
    setState(() => _isLoading = true);

    try {
      Map<String, dynamic> result;

      // Case 1: Local Draft (ID=0) -> Create & Optimize
      if (_currentRoute.id == 0) {
        // Get current location
        final locationService = LocationService();
        final location = await locationService.getCurrentLocation();

        if (location == null) {
          if (mounted) {
            setState(() => _isLoading = false);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Tidak bisa mendapatkan lokasi. Aktifkan GPS.'),
                backgroundColor: Colors.red,
              ),
            );
          }
          return;
        }

        // Create and optimize
        final orderIds = widget.orders.map((o) => o.id).toList();
        result = await _routeService.createAndOptimize(
          orderIds,
          startLocation: location,
        );

        if (result['success'] == true) {
          setState(() {
            _currentRoute = result['route'] as DeliveryRoute;
            _sortedOrders = _sortOrdersByWaypoints();
          });

          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Rute berhasil dioptimalkan! Klik "Mulai Navigasi" untuk memulai.',
                ),
                backgroundColor: Color(0xFF059669),
                duration: Duration(seconds: 3),
              ),
            );
          }
        }
      }
      // Case 2: Backend Draft (ID>0) -> Optimize & Start (Legacy support)
      else if (_isDraft) {
        // Get current location
        final locationService = LocationService();
        final location = await locationService.getCurrentLocation();

        if (location == null) {
          if (mounted) {
            setState(() => _isLoading = false);
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Tidak bisa mendapatkan lokasi. Aktifkan GPS.'),
                backgroundColor: Colors.red,
              ),
            );
          }
          return;
        }

        // Optimize and start
        result = await _routeService.optimizeAndStart(
          _currentRoute.id,
          location,
        );

        // Update route and orders after optimization
        if (result['success'] == true) {
          setState(() {
            _currentRoute = result['route'] as DeliveryRoute;
            _sortedOrders = _sortOrdersByWaypoints();
          });

          // Show success message and stay on map page
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Rute berhasil dioptimalkan! Klik "Mulai Navigasi" untuk memulai.',
                ),
                backgroundColor: Color(0xFF059669),
                duration: Duration(seconds: 3),
              ),
            );
          }
        }
      } else {
        // Already optimized, start navigation
        // If planned, start route first (to active)
        if (_currentRoute.status == 'planned') {
          result = await _routeService.startRoute(_currentRoute.id);
          if (result['success'] == true) {
            // Then start navigation (to delivering)
            final activeRoute = result['route'] as DeliveryRoute;
            result = await _routeService.startNavigation(activeRoute.id);
          }
        } else {
          // If active, just start navigation
          result = await _routeService.startNavigation(_currentRoute.id);
        }

        if (result['success'] == true) {
          // Update route to delivering status
          setState(() {
            _currentRoute = result['route'] as DeliveryRoute;
          });

          // Navigation started - STAY on map for live tracking
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text(
                  'Navigasi dimulai! Ikuti rute dan selesaikan pengantaran.',
                ),
                backgroundColor: Color(0xFF059669),
                duration: Duration(seconds: 3),
              ),
            );
            // TODO: Start live location tracking
          }
        }
      }

      if (mounted) {
        setState(() => _isLoading = false);

        if (result['success'] != true) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(result['message'] ?? 'Failed to start delivery'),
                backgroundColor: Colors.red,
              ),
            );
          }
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return DrawerOverlay(
      child: Scaffold(
        body: Stack(
          children: [
            // Route map with flutter_map - use _currentRoute for updates
            RouteMapView(
              key: ValueKey(
                '${_currentRoute.id}_${_currentRoute.status}',
              ), // Force rebuild on status change
              route: _currentRoute,
            ),

            // Header
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              child: RouteHeader(
                route: _currentRoute,
                onBack: () {
                  // If delivering, notify parent to switch to In Progress tab
                  if (_currentRoute.status == 'delivering') {
                    Navigator.pop(context, 'started');
                  } else {
                    Navigator.pop(context);
                  }
                },
              ),
            ),

            // Bottom Sheet - show for draft, planned, active, or delivering
            if (_currentRoute.status == 'draft' ||
                _currentRoute.status == 'planned' ||
                _currentRoute.status == 'active' ||
                _currentRoute.status == 'delivering')
              RouteBottomSheet(
                route: _currentRoute,
                orders: _sortedOrders,
                isLoading: _isLoading,
                onStartDelivery: _startDelivery,
                isDraft: _isDraft,
              )
            else
              // Route completed - show completion info
              Positioned(
                left: 16,
                right: 16,
                bottom: 16,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF059669),
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.check_circle,
                        color: Colors.white,
                        size: 24,
                      ),
                      const Gap(12),
                      const Expanded(
                        child: Text(
                          'Semua pengantaran selesai!',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
