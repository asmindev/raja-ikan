import 'package:shadcn_flutter/shadcn_flutter.dart';

class OrderStatusBadge extends StatelessWidget {
  final String status;

  const OrderStatusBadge({super.key, required this.status});

  @override
  Widget build(BuildContext context) {
    Color badgeColor;
    String displayStatus;

    switch (status.toLowerCase()) {
      case 'pending':
        badgeColor = const Color(0xFF059669); // Emerald
        displayStatus = 'Pending';
        break;
      case 'accepted':
        badgeColor = const Color(0xFF10B981); // Green
        displayStatus = 'Accepted';
        break;
      case 'delivering':
        badgeColor = const Color(0xFF34D399); // Light Green
        displayStatus = 'Delivering';
        break;
      case 'completed':
      case 'delivered':
        badgeColor = const Color(0xFF059669); // Emerald
        displayStatus = 'Completed';
        break;
      case 'cancelled':
        badgeColor = Colors.red;
        displayStatus = 'Cancelled';
        break;
      default:
        badgeColor = const Color(0xFF9E9E9E); // grey color
        displayStatus = status;
    }

    return Center(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        decoration: BoxDecoration(
          color: badgeColor.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: badgeColor.withValues(alpha: 0.3),
            width: 1.5,
          ),
        ),
        child: Text(
          displayStatus,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: badgeColor,
          ),
        ),
      ),
    );
  }
}
