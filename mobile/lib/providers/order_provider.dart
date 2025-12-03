import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/providers/delivery_provider.dart';

// Order State
class OrderState {
  final List<OrderModel> orders;
  final bool isLoading;
  final String? error;
  final int? nextPage;

  OrderState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
    this.nextPage,
  });

  OrderState copyWith({
    List<OrderModel>? orders,
    bool? isLoading,
    String? error,
    int? nextPage,
  }) {
    return OrderState(
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      nextPage: nextPage ?? this.nextPage,
    );
  }
}

// Order Notifier
class OrderNotifier extends StateNotifier<OrderState> {
  final Ref _ref;
  final String? _status;

  OrderNotifier(this._ref, this._status) : super(OrderState());

  Future<void> fetchOrders({String? search, bool refresh = false}) async {
    if (state.isLoading) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final orderService = _ref.read(orderServiceProvider);
      final (orders, nextPage) = await orderService.fetchOrders(
        page: refresh ? 1 : (state.nextPage ?? 1),
        status: _status,
        search: search,
      );

      state = state.copyWith(
        orders: refresh ? orders : [...state.orders, ...orders],
        isLoading: false,
        nextPage: nextPage,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void reset() {
    state = OrderState();
  }
}

// Available Orders Provider (status: pending)
final availableOrdersProvider =
    StateNotifierProvider.autoDispose<OrderNotifier, OrderState>((ref) {
      return OrderNotifier(ref, 'pending');
    });

// In Progress Orders Provider (status: delivering)
final deliveringOrdersProvider =
    StateNotifierProvider.autoDispose<OrderNotifier, OrderState>((ref) {
      return OrderNotifier(ref, 'delivering');
    });

// Completed Orders Provider (status: completed)
final completedOrdersProvider =
    StateNotifierProvider.autoDispose<OrderNotifier, OrderState>((ref) {
      return OrderNotifier(ref, 'completed');
    });

// Order Detail State
class OrderDetailState {
  final OrderModel? order;
  final bool isLoading;
  final String? error;

  OrderDetailState({this.order, this.isLoading = false, this.error});

  OrderDetailState copyWith({
    OrderModel? order,
    bool? isLoading,
    String? error,
  }) {
    return OrderDetailState(
      order: order ?? this.order,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Order Detail Notifier
class OrderDetailNotifier extends StateNotifier<OrderDetailState> {
  final Ref _ref;
  final int _orderId;

  OrderDetailNotifier(this._ref, this._orderId) : super(OrderDetailState()) {
    fetchOrderDetail();
  }

  Future<void> fetchOrderDetail() async {
    if (state.isLoading) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final orderService = _ref.read(orderServiceProvider);
      final order = await orderService.fetchOrderDetail(_orderId);

      // If order is null (401 handled), just stop loading
      if (order == null) {
        state = state.copyWith(isLoading: false);
        return;
      }

      state = state.copyWith(order: order, isLoading: false);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void refresh() {
    fetchOrderDetail();
  }
}

// Order Detail Provider
final orderDetailProvider = StateNotifierProvider.autoDispose
    .family<OrderDetailNotifier, OrderDetailState, int>((ref, orderId) {
      return OrderDetailNotifier(ref, orderId);
    });
