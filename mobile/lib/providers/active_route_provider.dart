import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/route.dart';
import '../models/order.dart';
import '../services/route_service.dart';

// State for active route
class ActiveRouteState {
  final DeliveryRoute? route;
  final List<OrderModel> orders;
  final bool isLoading;
  final String? error;

  ActiveRouteState({
    this.route,
    this.orders = const [],
    this.isLoading = false,
    this.error,
  });

  ActiveRouteState copyWith({
    DeliveryRoute? route,
    List<OrderModel>? orders,
    bool? isLoading,
    String? error,
  }) {
    return ActiveRouteState(
      route: route ?? this.route,
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Notifier for active route
class ActiveRouteNotifier extends StateNotifier<ActiveRouteState> {
  final RouteService _routeService;

  ActiveRouteNotifier(this._routeService) : super(ActiveRouteState());

  Future<void> fetchActiveRoute() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final result = await _routeService.getActiveRoute();

      if (result['success'] == true) {
        state = ActiveRouteState(
          route: result['route'],
          orders: result['orders'] ?? [],
          isLoading: false,
        );
      } else {
        state = ActiveRouteState(
          isLoading: false,
          error: result['message'] ?? 'Failed to load route',
        );
      }
    } catch (e) {
      state = ActiveRouteState(isLoading: false, error: e.toString());
    }
  }

  void clearRoute() {
    state = ActiveRouteState();
  }
}

// Provider
final activeRouteProvider =
    StateNotifierProvider<ActiveRouteNotifier, ActiveRouteState>((ref) {
      return ActiveRouteNotifier(RouteService());
    });
