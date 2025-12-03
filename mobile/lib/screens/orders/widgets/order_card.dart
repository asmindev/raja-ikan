import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/screens/orders/detail/page.dart';

class OrderCard extends ConsumerWidget {
  final OrderModel order;
  final bool isAvailable;
  final String? status;
  final String? completedAt;

  const OrderCard({
    super.key,
    required this.order,
    this.isAvailable = false,
    this.status,
    this.completedAt,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return GestureDetector(
      onTap: () {
        Navigator.of(context).push(
          MaterialPageRoute(
            builder: (context) => OrderDetailScreen(order: order),
          ),
        );
      },
      child: Card(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // Truck Icon
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFF059669).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                LucideIcons.truck,
                size: 18,
                color: Color(0xFF059669),
              ),
            ),
            const Gap(12),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Order ID & Badge
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Text(
                            '#${order.id}',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          if (isAvailable) ...[
                            const Gap(8),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: order.isMine
                                    ? const Color(
                                        0xFF059669,
                                      ).withValues(alpha: 0.15)
                                    : const Color(
                                        0xFF3B82F6,
                                      ).withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(4),
                                border: Border.all(
                                  color: order.isMine
                                      ? const Color(
                                          0xFF059669,
                                        ).withValues(alpha: 0.3)
                                      : const Color(
                                          0xFF3B82F6,
                                        ).withValues(alpha: 0.3),
                                  width: 1,
                                ),
                              ),
                              child: Text(
                                order.isMine ? 'Assigned' : 'Available',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: order.isMine
                                      ? const Color(0xFF059669)
                                      : const Color(0xFF3B82F6),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                      Text(
                        currencyFormat.format(order.total),
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFF059669),
                        ),
                      ),
                    ],
                  ),
                  const Gap(6),
                  // Address
                  Text(
                    order.address,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 13,
                      color: Theme.of(context).colorScheme.mutedForeground,
                    ),
                  ),
                ],
              ),
            ),
            // Arrow indicator
            const Gap(8),
            Icon(
              LucideIcons.chevronRight,
              size: 18,
              color: Theme.of(context).colorScheme.mutedForeground,
            ),
          ],
        ),
      ),
    );
  }
}
