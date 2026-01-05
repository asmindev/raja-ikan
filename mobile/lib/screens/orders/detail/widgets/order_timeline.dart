import 'package:intl/intl.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';
import 'package:mobile/models/order.dart';

class OrderTimeline extends StatelessWidget {
  final OrderModel order;

  const OrderTimeline({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    final timeline = <Map<String, dynamic>>[];

    // Order Created
    if (order.createdAt != null) {
      timeline.add({
        'title': 'Pesanan Dibuat',
        'description': 'Pesanan telah dibuat',
        'time': order.createdAt,
        'icon': LucideIcons.shoppingBag,
      });
    }

    // Order Accepted
    if (order.acceptedAt != null) {
      timeline.add({
        'title': 'Pesanan Diterima',
        'description': 'Driver menerima pesanan',
        'time': order.acceptedAt,
        'icon': LucideIcons.circleCheck,
      });
    }

    // Pickup Started
    if (order.pickupAt != null) {
      timeline.add({
        'title': 'Pengambilan Dimulai',
        'description': 'Driver menuju lokasi pengambilan',
        'time': order.pickupAt,
        'icon': LucideIcons.package,
      });
    }

    // Delivery Started
    if (order.deliveringAt != null) {
      timeline.add({
        'title': 'Sedang Dikirim',
        'description': 'Pesanan sedang dikirim',
        'time': order.deliveringAt,
        'icon': LucideIcons.truck,
      });
    }

    // Order Completed
    if (order.deliveryAt != null) {
      timeline.add({
        'title': 'Terkirim',
        'description': 'Pesanan telah sampai',
        'time': order.deliveryAt,
        'icon': LucideIcons.circleCheck,
      });
    }

    // Order Cancelled
    if (order.cancelledAt != null) {
      timeline.add({
        'title': 'Dibatalkan',
        'description': 'Pesanan telah dibatalkan',
        'time': order.cancelledAt,
        'icon': LucideIcons.circleX,
      });
    }

    return Card(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Timeline Status',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const Gap(16),
          Column(
            children: [
              for (var i = 0; i < timeline.length; i++)
                _buildTimelineItem(
                  context,
                  title: timeline[i]['title'] as String,
                  description: timeline[i]['description'] as String,
                  time: timeline[i]['time'] as DateTime,
                  icon: timeline[i]['icon'] as IconData,
                  isLast: i == timeline.length - 1,
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineItem(
    BuildContext context, {
    required String title,
    required String description,
    required DateTime time,
    required IconData icon,
    bool isLast = false,
  }) {
    final theme = Theme.of(context);
    final timeFormat = DateFormat('dd MMM, HH:mm');

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Timeline indicator
        Column(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: const Color(0xFF059669),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, size: 14, color: Colors.white),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 36,
                color: theme.colorScheme.border,
                margin: const EdgeInsets.symmetric(vertical: 4),
              ),
          ],
        ),
        const Gap(12),
        // Content
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Gap(2),
                Text(
                  timeFormat.format(time),
                  style: TextStyle(
                    fontSize: 12,
                    color: theme.colorScheme.mutedForeground,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
