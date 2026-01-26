import 'package:flutter/material.dart'
    as material
    show Material, InkWell, RefreshIndicator;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/providers/order_provider.dart';
import 'package:mobile/screens/orders/widgets/order_card.dart';
import 'package:mobile/screens/orders/widgets/empty_state.dart';
import 'package:mobile/screens/orders/widgets/error_state.dart';

class HistoryPage extends ConsumerStatefulWidget {
  const HistoryPage({super.key});

  @override
  ConsumerState<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends ConsumerState<HistoryPage> {
  String _selectedFilter = 'all'; // all, today, week, month

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(completedOrdersProvider.notifier).fetchOrders(refresh: true);
    });
  }

  List<OrderModel> _filterOrders(List<OrderModel> orders) {
    final now = DateTime.now();

    switch (_selectedFilter) {
      case 'today':
        return orders.where((order) {
          if (order.deliveryAt == null) return false;
          final deliveryDate = order.deliveryAt!;
          return deliveryDate.year == now.year &&
              deliveryDate.month == now.month &&
              deliveryDate.day == now.day;
        }).toList();

      case 'week':
        final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
        return orders.where((order) {
          if (order.deliveryAt == null) return false;
          return order.deliveryAt!.isAfter(startOfWeek);
        }).toList();

      case 'month':
        return orders.where((order) {
          if (order.deliveryAt == null) return false;
          final deliveryDate = order.deliveryAt!;
          return deliveryDate.year == now.year &&
              deliveryDate.month == now.month;
        }).toList();

      default: // 'all'
        return orders;
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      headers: [
        Container(
          padding: const EdgeInsets.fromLTRB(20, 28, 20, 14),
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Riwayat',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -0.5,
                    color: Colors.white,
                  ),
                ),
                const Gap(4),
                Text(
                  'Riwayat pengiriman Anda',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.white.withValues(alpha: 0.9),
                  ),
                ),
                const Gap(14),
                // Stats
                Consumer(
                  builder: (context, ref, child) {
                    final orderState = ref.watch(completedOrdersProvider);
                    final completedCount = orderState.orders.length;

                    return Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 12,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.25),
                          width: 1,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            LucideIcons.circleCheck,
                            size: 20,
                            color: Colors.white,
                          ),
                          const Gap(8),
                          Text(
                            '$completedCount',
                            style: const TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const Gap(8),
                          Text(
                            'Pengiriman Selesai',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.white.withValues(alpha: 0.9),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
        const Divider(height: 0),
        // Filter Tabs
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          color: theme.colorScheme.background,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterButton('Semua', 'all'),
                const Gap(8),
                _buildFilterButton('Hari Ini', 'today'),
                const Gap(8),
                _buildFilterButton('Minggu Ini', 'week'),
                const Gap(8),
                _buildFilterButton('Bulan Ini', 'month'),
              ],
            ),
          ),
        ),
        const Divider(height: 0),
      ],
      child: Consumer(
        builder: (context, ref, child) {
          final orderState = ref.watch(completedOrdersProvider);

          if (orderState.isLoading && orderState.orders.isEmpty) {
            return const Center(child: CircularProgressIndicator());
          }

          if (orderState.error != null && orderState.orders.isEmpty) {
            return ErrorState(
              error: orderState.error!,
              onRetry: () {
                ref
                    .read(completedOrdersProvider.notifier)
                    .fetchOrders(refresh: true);
              },
            );
          }

          if (orderState.orders.isEmpty) {
            return const EmptyState(
              icon: LucideIcons.circleCheck,
              title: 'Tidak ada pesanan selesai',
              message: 'Pesanan yang selesai akan muncul di sini',
            );
          }

          final filteredOrders = _filterOrders(orderState.orders);

          if (filteredOrders.isEmpty) {
            return EmptyState(
              icon: LucideIcons.filter,
              title: 'Tidak ada hasil',
              message: 'Tidak ada pesanan pada periode $_selectedFilter',
            );
          }

          return material.RefreshIndicator(
            onRefresh: () async {
              await ref
                  .read(completedOrdersProvider.notifier)
                  .fetchOrders(refresh: true);
            },
            child: ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: filteredOrders.length,
              separatorBuilder: (_, __) => const Gap(12),
              itemBuilder: (context, index) {
                final order = filteredOrders[index];
                return OrderCard(
                  order: order,
                  status: 'Terkirim',
                  completedAt: order.deliveryAt != null
                      ? DateFormat('dd MMM, HH:mm').format(order.deliveryAt!)
                      : null,
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _buildFilterButton(String label, String value) {
    final isSelected = _selectedFilter == value;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF059669) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF059669)
                : Theme.of(context).colorScheme.border,
            width: 1.5,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected
                ? Colors.white
                : Theme.of(context).colorScheme.foreground,
          ),
        ),
      ),
    );
  }
}
