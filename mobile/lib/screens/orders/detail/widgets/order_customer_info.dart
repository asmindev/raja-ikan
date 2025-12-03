import 'package:shadcn_flutter/shadcn_flutter.dart';
import 'package:mobile/models/order.dart';
import 'info_row.dart';

class OrderCustomerInfo extends StatelessWidget {
  final OrderModel order;

  const OrderCustomerInfo({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    if (order.customerName == null) return const SizedBox.shrink();

    return Card(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Customer',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const Gap(12),
          InfoRow(icon: LucideIcons.user, value: order.customerName!),
          if (order.customerPhone != null) ...[
            const Gap(8),
            InfoRow(icon: LucideIcons.phone, value: order.customerPhone!),
          ],
        ],
      ),
    );
  }
}
