class RouteCoordinate {
  final double latitude;
  final double longitude;

  RouteCoordinate({required this.latitude, required this.longitude});

  factory RouteCoordinate.fromJson(Map<String, dynamic> json) {
    return RouteCoordinate(
      latitude: double.tryParse(json['latitude'].toString()) ?? 0.0,
      longitude: double.tryParse(json['longitude'].toString()) ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {'latitude': latitude, 'longitude': longitude};
  }
}

class RouteWaypoint {
  final int? waypointIndex;
  final int? tripsIdx;
  final double latitude;
  final double longitude;
  final int? orderId; // Link to order (primary order ID)
  final String? customerName; // Customer name for display
  final List<int>? orderIds; // All order IDs at this location (for grouping)

  RouteWaypoint({
    this.waypointIndex,
    this.tripsIdx,
    required this.latitude,
    required this.longitude,
    this.orderId,
    this.customerName,
    this.orderIds,
  });

  factory RouteWaypoint.fromJson(Map<String, dynamic> json) {
    print('🔍 RouteWaypoint.fromJson - RAW JSON: $json');
    try {
      final waypoint = RouteWaypoint(
        waypointIndex: json['waypoint_index'] != null
            ? int.tryParse(json['waypoint_index'].toString())
            : null,
        tripsIdx: json['trips_idx'] != null
            ? int.tryParse(json['trips_idx'].toString())
            : null,
        latitude: double.tryParse(json['latitude'].toString()) ?? 0.0,
        longitude: double.tryParse(json['longitude'].toString()) ?? 0.0,
        orderId: json['order_id'] != null
            ? int.tryParse(json['order_id'].toString())
            : null,
        customerName: json['customer_name'] as String?,
        orderIds: json['order_ids'] != null
            ? (json['order_ids'] as List)
                  .map((e) => int.tryParse(e.toString()) ?? 0)
                  .toList()
            : null,
      );
      print('✅ RouteWaypoint created: orderId=${waypoint.orderId}');
      return waypoint;
    } catch (e, stackTrace) {
      print('❌ ERROR in RouteWaypoint.fromJson: $e');
      print('📍 Stack trace: $stackTrace');
      rethrow;
    }
  }
}

class DeliveryRoute {
  final int id;
  final int driverId;
  final String status; // assigned, in_progress, completed
  final double? totalDistance; // in meters
  final double? totalDuration; // in seconds
  final String? osrmUrl;
  final List<int> optimizedOrder;
  final List<RouteWaypoint> waypoints;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final DateTime createdAt;

  DeliveryRoute({
    required this.id,
    required this.driverId,
    required this.status,
    this.totalDistance,
    this.totalDuration,
    this.osrmUrl,
    required this.optimizedOrder,
    required this.waypoints,
    this.startedAt,
    this.completedAt,
    required this.createdAt,
  });

  factory DeliveryRoute.fromJson(Map<String, dynamic> json) {
    print('🔍 DeliveryRoute.fromJson - RAW JSON: $json');
    print(
      '🔍 DeliveryRoute - id type: ${json['id'].runtimeType}, value: ${json['id']}',
    );

    try {
      List<int> optimizedOrder = [];
      if (json['optimized_order'] != null && json['optimized_order'] is List) {
        print('🔍 Parsing optimized_order: ${json['optimized_order']}');
        optimizedOrder = (json['optimized_order'] as List)
            .map((e) => int.tryParse(e.toString()) ?? 0)
            .toList();
      }

      List<RouteWaypoint> waypoints = [];
      if (json['waypoints'] != null && json['waypoints'] is List) {
        print('🔍 Parsing ${(json['waypoints'] as List).length} waypoints...');
        waypoints = (json['waypoints'] as List)
            .map((e) => RouteWaypoint.fromJson(e as Map<String, dynamic>))
            .toList();
      }

      final route = DeliveryRoute(
        id: int.tryParse(json['id'].toString()) ?? 0,
        driverId: int.tryParse(json['driver_id'].toString()) ?? 0,
        status: json['status'] as String,
        totalDistance: json['total_distance'] != null
            ? double.tryParse(json['total_distance'].toString())
            : null,
        totalDuration: json['estimated_duration'] != null
            ? double.tryParse(json['estimated_duration'].toString())
            : (json['total_duration'] != null
                  ? double.tryParse(json['total_duration'].toString())
                  : null),
        osrmUrl: json['osrm_url'] as String?,
        optimizedOrder: optimizedOrder,
        waypoints: waypoints,
        startedAt: json['started_at'] != null && json['started_at'] != ''
            ? DateTime.tryParse(json['started_at'].toString())
            : null,
        completedAt: json['completed_at'] != null && json['completed_at'] != ''
            ? DateTime.tryParse(json['completed_at'].toString())
            : null,
        createdAt: json['created_at'] != null && json['created_at'] != ''
            ? (DateTime.tryParse(json['created_at'].toString()) ??
                  DateTime.now())
            : DateTime.now(),
      );

      print(
        '✅ DeliveryRoute created: id=${route.id}, status=${route.status}, waypoints=${route.waypoints.length}',
      );
      return route;
    } catch (e, stackTrace) {
      print('❌ ERROR in DeliveryRoute.fromJson: $e');
      print('📍 Stack trace: $stackTrace');
      print('📋 Full JSON that caused error: $json');
      rethrow;
    }
  }

  // Helper getters
  String get distanceKm => totalDistance != null
      ? '${(totalDistance! / 1000).toStringAsFixed(2)} km'
      : '-';

  String get durationMinutes => totalDuration != null
      ? '${(totalDuration! / 60).toStringAsFixed(0)} menit'
      : '-';

  int get totalStops => waypoints.length;

  bool get isActive => status == 'in_progress';
  bool get isCompleted => status == 'completed';
  bool get isAssigned => status == 'assigned';
}
