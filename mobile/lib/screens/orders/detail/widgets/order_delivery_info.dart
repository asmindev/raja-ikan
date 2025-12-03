import 'package:intl/intl.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';
import 'package:mobile/models/order.dart';
import 'info_row.dart';

class OrderDeliveryInfo extends StatelessWidget {
  final OrderModel order;

  const OrderDeliveryInfo({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Card(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Delivery Info',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const Gap(12),
          InfoRow(icon: LucideIcons.mapPin, value: order.address),
          if (order.estimated != null) ...[
            const Gap(8),
            InfoRow(
              icon: LucideIcons.clock,
              value: DateFormat('dd MMM yyyy, HH:mm').format(order.estimated!),
            ),
          ],
        ],
      ),
    );
  }
}
