import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/driver_stats.dart';
import '../services/driver_service.dart';

final driverStatsProvider = FutureProvider.autoDispose<DriverStats>((
  ref,
) async {
  final driverService = DriverService();
  final result = await driverService.getStats();

  if (result['success'] == true) {
    return result['data'] as DriverStats;
  }

  return DriverStats.empty();
});
