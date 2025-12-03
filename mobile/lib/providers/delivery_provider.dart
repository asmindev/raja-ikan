import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/services/order_service.dart';

// Service provider
final orderServiceProvider = Provider<OrderService>((ref) {
  return OrderService();
});

// Delivery state class
class DeliveryState {
  final List<OrderModel> activeDeliveries;
  final int completedToday;
  final bool isLoading;
  final String? error;

  DeliveryState({
    this.activeDeliveries = const [],
    this.completedToday = 0,
    this.isLoading = false,
    this.error,
  });

  DeliveryState copyWith({
    List<OrderModel>? activeDeliveries,
    int? completedToday,
    bool? isLoading,
    String? error,
  }) {
    return DeliveryState(
      activeDeliveries: activeDeliveries ?? this.activeDeliveries,
      completedToday: completedToday ?? this.completedToday,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

// Delivery provider (StateNotifier)
class DeliveryNotifier extends StateNotifier<DeliveryState> {
  final OrderService _orderService;

  DeliveryNotifier(this._orderService) : super(DeliveryState());

  // Load delivery data
  Future<void> loadDeliveries() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final result = await _orderService.fetchOrders(page: 1);
      final orders = result.$1;

      // Filter for delivering orders (active deliveries for the driver)
      final activeDeliveries = orders
          .where((order) => order.status.toLowerCase() == 'delivering')
          .toList();

      // Count delivered today
      final deliveredToday = orders
          .where((order) => order.status.toLowerCase() == 'delivered')
          .length;

      state = state.copyWith(
        activeDeliveries: activeDeliveries,
        completedToday: deliveredToday,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  // Mark delivery as completed
  Future<void> markAsCompleted(String orderId) async {
    // TODO: Call API to update order status
    final updatedDeliveries = state.activeDeliveries
        .where((order) => order.id != orderId)
        .toList();

    state = state.copyWith(
      activeDeliveries: updatedDeliveries,
      completedToday: state.completedToday + 1,
    );
  }

  // Optimize route
  Future<void> optimizeRoute() async {
    // TODO: Call optimization API
    // For now, just shuffle the list as demo
    final optimized = List<OrderModel>.from(state.activeDeliveries);
    // In real app, this would call the optimization service
    state = state.copyWith(activeDeliveries: optimized);
  }
}

// Provider instance
final deliveryProvider = StateNotifierProvider<DeliveryNotifier, DeliveryState>(
  (ref) {
    final orderService = ref.watch(orderServiceProvider);
    return DeliveryNotifier(orderService);
  },
);

// Computed providers
final activeDeliveriesCountProvider = Provider<int>((ref) {
  return ref.watch(deliveryProvider).activeDeliveries.length;
});

final totalDeliveryValueProvider = Provider<double>((ref) {
  final deliveries = ref.watch(deliveryProvider).activeDeliveries;
  return deliveries.fold<double>(0, (sum, order) => sum + order.total);
});

final hasActiveDeliveriesProvider = Provider<bool>((ref) {
  return ref.watch(deliveryProvider).activeDeliveries.isNotEmpty;
});
