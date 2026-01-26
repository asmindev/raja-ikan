import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/providers/delivery_provider.dart';
// debug print
import 'package:flutter/foundation.dart';

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

      debugPrint('📊 [DashboardProvider] Raw stats: $stats');
      debugPrint(
        '📊 [DashboardProvider] completed_count type: ${stats['completed_count'].runtimeType}',
      );
      debugPrint(
        '📊 [DashboardProvider] completed_count value: ${stats['completed_count']}',
      );

      final totalEarnings = stats['total_earnings'];
      debugPrint(
        '📊 [DashboardProvider] total_earnings raw: $totalEarnings (${totalEarnings.runtimeType})',
      );

      final earningsDouble = totalEarnings is String
          ? double.tryParse(totalEarnings) ?? 0.0
          : (totalEarnings ?? 0).toDouble();

      debugPrint(
        '📊 [DashboardProvider] total_earnings converted: $earningsDouble',
      );

      state = DashboardStatsState(
        completedCount: stats['completed_count'] ?? 0,
        totalEarnings: earningsDouble,
        pendingCount: stats['pending_count'] ?? 0,
        deliveringCount: stats['delivering_count'] ?? 0,
        isLoading: false,
      );

      debugPrint(
        '📊 [DashboardProvider] State updated - completedCount: ${state.completedCount}',
      );
    } catch (e, stackTrace) {
      debugPrint('❌ [DashboardProvider] Error: $e');
      debugPrint('❌ [DashboardProvider] StackTrace: $stackTrace');
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
