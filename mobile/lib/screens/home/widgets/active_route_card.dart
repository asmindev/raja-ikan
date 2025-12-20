import 'package:flutter/material.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart'
    hide Colors, LinearProgressIndicator;
import '../../../models/route.dart';

class ActiveRouteCard extends StatelessWidget {
  final DeliveryRoute route;
  final int completedOrders;
  final int totalOrders;
  final VoidCallback onContinue;

  const ActiveRouteCard({
    super.key,
    required this.route,
    required this.completedOrders,
    required this.totalOrders,
    required this.onContinue,
  });

  String _getStatusText() {
    switch (route.status) {
      case 'active':
        return 'Active Route';
      case 'delivering':
        return 'Live Tracking';
      case 'planned':
        return 'Planned Route';
      default:
        return 'Route';
    }
  }

  IconData _getStatusIcon() {
    switch (route.status) {
      case 'delivering':
        return Icons.navigation_rounded;
      case 'active':
        return Icons.route_rounded;
      default:
        return Icons.map_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final progress = totalOrders > 0 ? completedOrders / totalOrders : 0.0;
    final remainingOrders = totalOrders - completedOrders;

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF059669), Color(0xFF10B981), Color(0xFF34D399)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF059669).withValues(alpha: 0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onContinue,
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        _getStatusIcon(),
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const Gap(12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _getStatusText(),
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const Gap(2),
                          Text(
                            route.status == 'delivering'
                                ? 'Delivery in progress'
                                : 'Ready to start',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.white.withValues(alpha: 0.9),
                            ),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        '$remainingOrders left',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),

                const Gap(16),

                // Progress Info
                Row(
                  children: [
                    Icon(
                      Icons.check_circle_outline,
                      size: 16,
                      color: Colors.white.withValues(alpha: 0.9),
                    ),
                    const Gap(6),
                    Text(
                      '$completedOrders of $totalOrders orders completed',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.9),
                      ),
                    ),
                  ],
                ),

                const Gap(8),

                // Progress Bar
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: SizedBox(
                    height: 8,
                    child: LinearProgressIndicator(
                      value: progress,
                      backgroundColor: Colors.white.withValues(alpha: 0.3),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                        Colors.white,
                      ),
                    ),
                  ),
                ),

                const Gap(16),

                // Route Stats
                Row(
                  children: [
                    Expanded(
                      child: _buildStatItem(
                        Icons.location_on,
                        '${route.totalStops} stops',
                      ),
                    ),
                    Expanded(
                      child: _buildStatItem(
                        Icons.route,
                        route.totalDistance != null
                            ? '${(route.totalDistance! / 1000).toStringAsFixed(1)} km'
                            : '-',
                      ),
                    ),
                    Expanded(
                      child: _buildStatItem(
                        Icons.access_time,
                        route.totalDuration != null
                            ? '${(route.totalDuration! / 60).toStringAsFixed(0)} min'
                            : '-',
                      ),
                    ),
                  ],
                ),

                const Gap(16),

                // Continue Button
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.map_rounded,
                        color: Color(0xFF059669),
                        size: 20,
                      ),
                      const Gap(8),
                      Text(
                        route.status == 'delivering'
                            ? 'Continue Delivery'
                            : 'View Route Map',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF059669),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatItem(IconData icon, String value) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: Colors.white.withValues(alpha: 0.8)),
        const Gap(4),
        Flexible(
          child: Text(
            value,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withValues(alpha: 0.9),
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}
