import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/order.dart';

// Route optimization state
class RouteState {
  final List<OrderModel> optimizedRoute;
  final double totalDistance; // in km
  final int estimatedTime; // in minutes
  final bool isOptimizing;
  final String? error;

  RouteState({
    this.optimizedRoute = const [],
    this.totalDistance = 0.0,
    this.estimatedTime = 0,
    this.isOptimizing = false,
    this.error,
  });

  RouteState copyWith({
    List<OrderModel>? optimizedRoute,
    double? totalDistance,
    int? estimatedTime,
    bool? isOptimizing,
    String? error,
  }) {
    return RouteState(
      optimizedRoute: optimizedRoute ?? this.optimizedRoute,
      totalDistance: totalDistance ?? this.totalDistance,
      estimatedTime: estimatedTime ?? this.estimatedTime,
      isOptimizing: isOptimizing ?? this.isOptimizing,
      error: error ?? this.error,
    );
  }
}

// Route provider
class RouteNotifier extends StateNotifier<RouteState> {
  RouteNotifier() : super(RouteState());

  // Optimize route using backend API
  Future<void> optimizeRoute(List<OrderModel> orders) async {
    state = state.copyWith(isOptimizing: true, error: null);

    try {
      // TODO: Call optimization API endpoint
      // POST http://localhost:8000/api/v1/optimize
      // Body: { coordinates: [[lat, lon], ...] }

      // For now, just simulate optimization
      await Future.delayed(const Duration(seconds: 2));

      // Mock optimized result
      final optimized = List<OrderModel>.from(orders);
      // In real app, this would be the order from API response

      state = state.copyWith(
        optimizedRoute: optimized,
        totalDistance: 12.5, // Mock distance
        estimatedTime: 45, // Mock time
        isOptimizing: false,
      );
    } catch (e) {
      state = state.copyWith(isOptimizing: false, error: e.toString());
    }
  }

  // Clear route
  void clearRoute() {
    state = RouteState();
  }
}

// Provider instance
final routeProvider = StateNotifierProvider<RouteNotifier, RouteState>((ref) {
  return RouteNotifier();
});

// Computed providers
final hasOptimizedRouteProvider = Provider<bool>((ref) {
  return ref.watch(routeProvider).optimizedRoute.isNotEmpty;
});

final estimatedDeliveryTimeProvider = Provider<String>((ref) {
  final time = ref.watch(routeProvider).estimatedTime;
  if (time == 0) return '-';
  if (time < 60) return '$time menit';
  final hours = time ~/ 60;
  final minutes = time % 60;
  return '$hours jam ${minutes > 0 ? '$minutes menit' : ''}';
});
