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
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            // Truck Icon
            Container(
              padding: const EdgeInsets.all(9),
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
                  // Customer Name
                  Text(
                    customerName,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Gap(6),

                  // Address
                  Text(
                    address,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      color: theme.colorScheme.mutedForeground,
                    ),
                  ),
                ],
              ),
            ),

            // Arrow
            const Gap(8),
            Icon(
              LucideIcons.chevronRight,
              size: 16,
              color: theme.colorScheme.mutedForeground,
            ),
          ],
        ),
      ),
    );
  }
}
