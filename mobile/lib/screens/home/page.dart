import 'package:flutter/material.dart' as M;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';
import 'package:intl/intl.dart';
import 'widgets/stats_card.dart';
import 'widgets/order_card.dart';
import 'widgets/active_route_card.dart';
import 'widgets/empty_state.dart';
import '../../providers/dashboard_provider.dart';
import '../../providers/active_route_provider.dart';
import '../../providers/order_provider.dart';
import '../delivery/page.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _refreshData();
    });
  }

  Future<void> _refreshData() async {
    await Future.wait([
      ref.read(dashboardStatsProvider.notifier).fetchStats(),
      ref.read(activeRouteProvider.notifier).fetchActiveRoute(),
      ref.read(availableOrdersProvider.notifier).fetchOrders(refresh: true),
      ref.read(deliveringOrdersProvider.notifier).fetchOrders(refresh: true),
      ref.read(completedOrdersProvider.notifier).fetchOrders(refresh: true),
    ]);
  }

  void _navigateToActiveRoute() {
    final activeRouteState = ref.read(activeRouteProvider);
    if (activeRouteState.route != null) {
      M.Navigator.push(
        context,
        M.MaterialPageRoute(
          builder: (context) => RouteMapPage(
            route: activeRouteState.route!,
            orders: activeRouteState.orders,
          ),
        ),
      ).then((_) => _refreshData());
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  }

  @override
  Widget build(BuildContext context) {
    final statsState = ref.watch(dashboardStatsProvider);
    final activeRouteState = ref.watch(activeRouteProvider);
    final availableOrders = ref.watch(availableOrdersProvider);
    final deliveringOrders = ref.watch(deliveringOrdersProvider);
    final completedOrders = ref.watch(completedOrdersProvider);

    // Combine all today's orders
    final allTodayOrders = [
      ...availableOrders.orders,
      ...deliveringOrders.orders,
      ...completedOrders.orders,
    ];

    final isLoading =
        statsState.isLoading ||
        activeRouteState.isLoading ||
        availableOrders.isLoading ||
        deliveringOrders.isLoading ||
        completedOrders.isLoading;

    return Scaffold(
      headers: [
        Container(
          padding: const EdgeInsets.fromLTRB(24, 46, 24, 40),
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF059669), // Emerald
                Color(0xFF10B981), // Green
                Color(0xFF34D399), // Light Green
              ],
            ),
          ),
          child: SafeArea(
            bottom: false,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _getGreeting(),
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.5,
                          color: Colors.white,
                        ),
                      ),
                      const Gap(8),
                      Text(
                        'Ready to deliver todays?',
                        style: TextStyle(
                          fontSize: 15,
                          color: Colors.white.withValues(alpha: 0.9),
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: OutlineButton(
                    density: ButtonDensity.icon,
                    onPressed: () {},
                    child: const Icon(
                      LucideIcons.bell,
                      size: 20,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
      child: M.RefreshIndicator(
        onRefresh: _refreshData,
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Active Route Card (if exists)
              if (activeRouteState.route != null) ...[
                ActiveRouteCard(
                  route: activeRouteState.route!,
                  completedOrders: activeRouteState.orders
                      .where((o) => o.status == 'completed')
                      .length,
                  totalOrders: activeRouteState.orders.length,
                  onContinue: _navigateToActiveRoute,
                ),
              ],

              // Stats Cards
              Row(
                children: [
                  Expanded(
                    child: StatsCard(
                      icon: LucideIcons.circleCheck,
                      value: statsState.completedCount.toString(),
                      label: 'Completed Today',
                      iconColor: const Color(0xFF059669),
                      backgroundColor: const Color(
                        0xFF059669,
                      ).withValues(alpha: 0.1),
                    ),
                  ),
                  const Gap(12),
                  Expanded(
                    child: StatsCard(
                      icon: LucideIcons.wallet,
                      value: NumberFormat.compactCurrency(
                        locale: 'id_ID',
                        symbol: 'Rp',
                        decimalDigits: 0,
                      ).format(statsState.totalEarnings),
                      label: 'Earnings Today',
                      iconColor: const Color(0xFF10B981),
                      backgroundColor: const Color(
                        0xFF10B981,
                      ).withValues(alpha: 0.1),
                    ),
                  ),
                ],
              ),
              const Gap(20),

              // Today's Orders Section
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Today\'s Orders').large().semiBold(),
                  if (allTodayOrders.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        '${allTodayOrders.length} orders',
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF059669),
                        ),
                      ),
                    ),
                ],
              ),
              const Gap(12),

              // Orders List or Empty State
              if (isLoading && allTodayOrders.isEmpty)
                const Center(
                  child: Padding(
                    padding: EdgeInsets.all(40),
                    child: M.CircularProgressIndicator(),
                  ),
                )
              else if (allTodayOrders.isEmpty)
                EmptyStateWidget(
                  title: 'No Orders Yet',
                  message:
                      'You don\'t have any orders today.\nTake a rest or check back later!',
                  icon: Icons.local_shipping_outlined,
                )
              else
                ...allTodayOrders.map((order) {
                  Color statusColor;
                  switch (order.status) {
                    case 'completed':
                      statusColor = const Color(0xFF059669);
                      break;
                    case 'delivering':
                      statusColor = const Color(0xFF10B981);
                      break;
                    case 'pending':
                      statusColor = const Color(0xFF3B82F6);
                      break;
                    default:
                      statusColor = const Color(0xFF6B7280);
                  }

                  return Padding(
                    padding: const EdgeInsets.only(bottom: 12),
                    child: OrderCard(
                      orderNumber: '#${order.id}',
                      customerName: order.customerName ?? 'Unknown',
                      address: order.address,
                      distance: '-',
                      status: order.status.toUpperCase(),
                      statusColor: statusColor,
                      onViewDetails: () {
                        // Navigate to order detail
                      },
                      onNavigate: () {
                        // Open maps navigation
                      },
                    ),
                  );
                }),
            ],
          ),
        ),
      ),
    );
  }
}
