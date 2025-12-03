import 'package:shadcn_flutter/shadcn_flutter.dart';

class OrderCard extends StatelessWidget {
  final String orderNumber;
  final String customerName;
  final String address;
  final String distance;
  final String status;
  final Color statusColor;
  final VoidCallback? onViewDetails;
  final VoidCallback? onNavigate;

  const OrderCard({
    super.key,
    required this.orderNumber,
    required this.customerName,
    required this.address,
    required this.distance,
    required this.status,
    required this.statusColor,
    this.onViewDetails,
    this.onNavigate,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return GestureDetector(
      onTap: onViewDetails,
      child: Card(
        padding: const EdgeInsets.all(14),
        child: Row(
          children: [
            // Truck Icon (sama untuk semua)
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFF059669).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                LucideIcons.truck,
                size: 20,
                color: Color(0xFF059669),
              ),
            ),
            const Gap(12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Order Number
                  Text(
                    orderNumber,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Gap(6),

                  // Address
                  Text(
                    address,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 13,
                      color: theme.colorScheme.mutedForeground,
                    ),
                  ),
                  const Gap(4),

                  // Distance
                  Text(
                    distance,
                    style: TextStyle(
                      fontSize: 12,
                      color: theme.colorScheme.mutedForeground,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

            // Arrow
            const Gap(8),
            Icon(
              LucideIcons.chevronRight,
              size: 18,
              color: theme.colorScheme.mutedForeground,
            ),
          ],
        ),
      ),
    );
  }
}
