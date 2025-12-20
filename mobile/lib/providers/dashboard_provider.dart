import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/providers/delivery_provider.dart';

// Dashboard Stats State
class DashboardStatsState {
  final int completedCount;
  final double totalEarnings;
  final int pendingCount;
  final int deliveringCount;
  final bool isLoading;
  final String? error;

  DashboardStatsState({
    this.completedCount = 0,
    this.totalEarnings = 0,
    this.pendingCount = 0,
    this.deliveringCount = 0,
    this.isLoading = false,
    this.error,
  });

  DashboardStatsState copyWith({
    int? completedCount,
    double? totalEarnings,
    int? pendingCount,
    int? deliveringCount,
    bool? isLoading,
    String? error,
  }) {
    return DashboardStatsState(
      completedCount: completedCount ?? this.completedCount,
      totalEarnings: totalEarnings ?? this.totalEarnings,
      pendingCount: pendingCount ?? this.pendingCount,
      deliveringCount: deliveringCount ?? this.deliveringCount,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Dashboard Stats Notifier
class DashboardStatsNotifier extends StateNotifier<DashboardStatsState> {
  final Ref _ref;

  DashboardStatsNotifier(this._ref) : super(DashboardStatsState());

  Future<void> fetchStats() async {
    if (state.isLoading) return;

    state = state.copyWith(isLoading: true, error: null);

    try {
      final orderService = _ref.read(orderServiceProvider);
      final stats = await orderService.fetchTodayStats();

      state = DashboardStatsState(
        completedCount: stats['completed_count'] ?? 0,
        totalEarnings: (stats['total_earnings'] ?? 0).toDouble(),
        pendingCount: stats['pending_count'] ?? 0,
        deliveringCount: stats['delivering_count'] ?? 0,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void reset() {
    state = DashboardStatsState();
  }
}

// Dashboard Stats Provider
final dashboardStatsProvider =
    StateNotifierProvider<DashboardStatsNotifier, DashboardStatsState>((ref) {
      return DashboardStatsNotifier(ref);
    });
