import 'package:flutter/material.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart' hide Colors, Divider;
import '../../../models/order.dart';
import '../../../services/order_service.dart';
import 'order_complete_card.dart';

class ActiveDeliverySheet extends StatefulWidget {
  final List<OrderModel> orders;
  final VoidCallback onOrderCompleted;
  final VoidCallback? onRouteCompleted;

  const ActiveDeliverySheet({
    super.key,
    required this.orders,
    required this.onOrderCompleted,
    this.onRouteCompleted,
  });

  @override
  State<ActiveDeliverySheet> createState() => _ActiveDeliverySheetState();
}

class _ActiveDeliverySheetState extends State<ActiveDeliverySheet> {
  final OrderService _orderService = OrderService();
  final Set<int> _completedOrderIds = {};
  final Set<int> _loadingOrderIds = {};

  Future<void> _completeOrder(OrderModel order) async {
    if (_loadingOrderIds.contains(order.id)) return;

    setState(() => _loadingOrderIds.add(order.id));

    final result = await _orderService.markAsDelivered(order.id);

    if (mounted) {
      setState(() => _loadingOrderIds.remove(order.id));

      if (result['success'] == true) {
        setState(() => _completedOrderIds.add(order.id));

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Order berhasil diselesaikan'),
            backgroundColor: const Color(0xFF059669),
            behavior: SnackBarBehavior.floating,
          ),
        );

        // Notify parent
        widget.onOrderCompleted();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ?? 'Gagal menyelesaikan order'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Count all completed orders (from current session + already completed from backend)
    final completedCount = widget.orders.where((order) {
      return _completedOrderIds.contains(order.id) ||
          order.status == 'completed' ||
          order.status == 'delivered';
    }).length;
    final totalCount = widget.orders.length;

    // Debug print
    debugPrint(
      '🔍 Active Delivery Sheet - Completed: $completedCount / $totalCount',
    );
    debugPrint('🔍 Completed Order IDs (local): $_completedOrderIds');
    debugPrint('🔍 Order statuses from backend:');
    for (var order in widget.orders) {
      debugPrint('   - Order ${order.id}: status = ${order.status}');
    }

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Handle bar
            Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.grey[300],
                borderRadius: BorderRadius.circular(2),
              ),
            ),

            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF10B981), Color(0xFF059669)],
                      ),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(
                      Icons.assignment_turned_in_outlined,
                      color: Colors.white,
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Daftar Pengiriman',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '$completedCount dari $totalCount pesanan selesai',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (completedCount == totalCount)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFF10B981).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Row(
                        children: [
                          Icon(
                            Icons.check_circle,
                            color: Color(0xFF059669),
                            size: 16,
                          ),
                          SizedBox(width: 4),
                          Text(
                            'Selesai',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF059669),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            Divider(height: 1, color: Colors.grey[200]),

            const SizedBox(height: 16),

            // Order list
            Flexible(
              child: ListView.builder(
                shrinkWrap: true,
                padding: const EdgeInsets.symmetric(horizontal: 20),
                itemCount: widget.orders.length,
                itemBuilder: (context, index) {
                  final order = widget.orders[index];
                  final isCompleted =
                      _completedOrderIds.contains(order.id) ||
                      order.status == 'completed' ||
                      order.status == 'delivered';
                  final isLoading = _loadingOrderIds.contains(order.id);

                  return OrderCompleteCard(
                    order: order,
                    sequence: index + 1,
                    isCompleted: isCompleted,
                    isLoading: isLoading,
                    onComplete: () => _completeOrder(order),
                  );
                },
              ),
            ),

            const SizedBox(height: 20),

            // Complete all button (if all orders completed)
            if (completedCount == totalCount)
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 16),
                child: SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: ElevatedButton(
                    onPressed: () {
                      // Call route completion callback if provided
                      if (widget.onRouteCompleted != null) {
                        widget.onRouteCompleted!();
                      }
                      // Close the sheet
                      Navigator.of(
                        context,
                      ).pop(true); // Return true = all completed
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF059669),
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.check_circle, size: 20),
                        SizedBox(width: 8),
                        Text(
                          'Selesaikan Rute',
                          style: TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else
              const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
