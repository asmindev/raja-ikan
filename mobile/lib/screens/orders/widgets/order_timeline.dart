import 'package:flutter/material.dart' as material show Colors, Divider;
import 'package:shadcn_flutter/shadcn_flutter.dart';
import 'package:mobile/models/order.dart';
import 'package:intl/intl.dart';

class OrderTimeline extends StatelessWidget {
  final List<OrderModel> orders;
  final Function(OrderModel)? onOrderTap;

  const OrderTimeline({super.key, required this.orders, this.onOrderTap});

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      itemCount: orders.length,
      itemBuilder: (context, index) {
        final order = orders[index];
        final isFirst = index == 0;
        final isLast = index == orders.length - 1;

        return _TimelineItem(
          order: order,
          sequence: index + 1,
          isFirst: isFirst,
          isLast: isLast,
          onTap: onOrderTap != null ? () => onOrderTap!(order) : null,
        );
      },
    );
  }
}

class _TimelineItem extends StatelessWidget {
  final OrderModel order;
  final int sequence;
  final bool isFirst;
  final bool isLast;
  final VoidCallback? onTap;

  const _TimelineItem({
    required this.order,
    required this.sequence,
    required this.isFirst,
    required this.isLast,
    this.onTap,
  });

  Color _getStatusColor() {
    switch (order.status) {
      case 'completed':
        return const Color(0xFF10B981);
      case 'delivering':
        return const Color(0xFF3B82F6);
      default:
        return const Color(0xFF6B7280);
    }
  }

  IconData _getStatusIcon() {
    switch (order.status) {
      case 'completed':
        return LucideIcons.circleCheck;
      case 'delivering':
        return LucideIcons.navigation;
      default:
        return LucideIcons.circle;
    }
  }

  String _getStatusLabel() {
    switch (order.status) {
      case 'completed':
        return 'Delivered';
      case 'delivering':
        return 'On the way';
      default:
        return 'Pending';
    }
  }

  @override
  Widget build(BuildContext context) {
    final statusColor = _getStatusColor();

    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline indicator
          Column(
            children: [
              // Top line
              if (!isFirst)
                Container(
                  width: 2,
                  height: 24,
                  color: material.Colors.grey.shade300,
                ),
              // Circle with number/icon
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: statusColor.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                  border: Border.all(color: statusColor, width: 2),
                ),
                child: Center(
                  child: order.status == 'completed'
                      ? Icon(_getStatusIcon(), size: 20, color: statusColor)
                      : Text(
                          '$sequence',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: statusColor,
                          ),
                        ),
                ),
              ),
              // Bottom line
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    color: material.Colors.grey.shade300,
                  ),
                ),
            ],
          ),

          const Gap(16),

          // Order card
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(
                bottom: isLast ? 0 : 20,
                top: isFirst ? 0 : 4,
              ),
              child: GestureDetector(
                onTap: onTap,
                child: Container(
                  decoration: BoxDecoration(
                    color: material.Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: material.Colors.grey.shade200,
                      width: 1,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: material.Colors.black.withValues(alpha: 0.04),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 6,
                                          vertical: 2,
                                        ),
                                        decoration: BoxDecoration(
                                          color: const Color(
                                            0xFF6B7280,
                                          ).withValues(alpha: 0.1),
                                          borderRadius: BorderRadius.circular(
                                            4,
                                          ),
                                        ),
                                        child: Text(
                                          '#${order.id}',
                                          style: const TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.w600,
                                            color: Color(0xFF6B7280),
                                          ),
                                        ),
                                      ),
                                      const Gap(8),
                                      Expanded(
                                        child: Text(
                                          order.customerName ??
                                              'Customer #${order.id}',
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.w600,
                                            color: Color(0xFF1F2937),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  if (order.customerPhone != null) ...[
                                    const Gap(4),
                                    Row(
                                      children: [
                                        Icon(
                                          LucideIcons.phone,
                                          size: 12,
                                          color: material.Colors.grey.shade600,
                                        ),
                                        const Gap(4),
                                        Text(
                                          order.customerPhone!,
                                          style: TextStyle(
                                            fontSize: 12,
                                            color:
                                                material.Colors.grey.shade600,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ],
                              ),
                            ),
                            // Status badge
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: statusColor.withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                _getStatusLabel(),
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: statusColor,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const Gap(12),

                        // Address
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              LucideIcons.mapPin,
                              size: 16,
                              color: material.Colors.grey.shade600,
                            ),
                            const Gap(8),
                            Expanded(
                              child: Text(
                                order.address,
                                style: TextStyle(
                                  fontSize: 13,
                                  color: material.Colors.grey.shade700,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),

                        const Gap(12),

                        material.Divider(
                          height: 1,
                          color: material.Colors.grey.shade200,
                        ),

                        const Gap(12),

                        // Footer
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  LucideIcons.package,
                                  size: 14,
                                  color: material.Colors.grey.shade600,
                                ),
                                const Gap(6),
                                Text(
                                  '${order.items.length} items',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: material.Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                            Text(
                              NumberFormat.currency(
                                locale: 'id_ID',
                                symbol: 'Rp ',
                                decimalDigits: 0,
                              ).format(order.total),
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF059669),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
