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
  final int? orderId; // Link to order
  final String? customerName; // Customer name for display

  RouteWaypoint({
    this.waypointIndex,
    this.tripsIdx,
    required this.latitude,
    required this.longitude,
    this.orderId,
    this.customerName,
  });

  factory RouteWaypoint.fromJson(Map<String, dynamic> json) {
    return RouteWaypoint(
      waypointIndex: json['waypoint_index'] as int?,
      tripsIdx: json['trips_idx'] as int?,
      latitude: double.tryParse(json['latitude'].toString()) ?? 0.0,
      longitude: double.tryParse(json['longitude'].toString()) ?? 0.0,
      orderId: json['order_id'] as int?,
      customerName: json['customer_name'] as String?,
    );
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
    List<int> optimizedOrder = [];
    if (json['optimized_order'] != null && json['optimized_order'] is List) {
      optimizedOrder = (json['optimized_order'] as List)
          .map((e) => e as int)
          .toList();
    }

    List<RouteWaypoint> waypoints = [];
    if (json['waypoints'] != null && json['waypoints'] is List) {
      waypoints = (json['waypoints'] as List)
          .map((e) => RouteWaypoint.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    return DeliveryRoute(
      id: json['id'] as int,
      driverId: json['driver_id'] as int,
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
          ? (DateTime.tryParse(json['created_at'].toString()) ?? DateTime.now())
          : DateTime.now(),
    );
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
