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
        displayStatus = 'Menunggu';
        break;
      case 'accepted':
        badgeColor = const Color(0xFF10B981); // Green
        displayStatus = 'Diterima';
        break;
      case 'delivering':
        badgeColor = const Color(0xFF34D399); // Light Green
        displayStatus = 'Dalam Pengiriman';
        break;
      case 'completed':
      case 'delivered':
        badgeColor = const Color(0xFF059669); // Emerald
        displayStatus = 'Selesai';
        break;
      case 'cancelled':
        badgeColor = Colors.red;
        displayStatus = 'Dibatalkan';
        break;
      default:
        badgeColor = const Color(0xFF9E9E9E); // grey color
        displayStatus = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: badgeColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        displayStatus,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),
    );
  }
}
