import 'package:shadcn_flutter/shadcn_flutter.dart';

class HistoryItem extends StatelessWidget {
  final String date;
  final String orderNumber;
  final String customer;
  final String location;
  final String earnings;
  final int rating;
  final VoidCallback? onViewDetails;

  const HistoryItem({
    super.key,
    required this.date,
    required this.orderNumber,
    required this.customer,
    required this.location,
    required this.earnings,
    required this.rating,
    this.onViewDetails,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [Text(date).small().muted(), Text(earnings).semiBold()],
          ),
          const Gap(8),
          Text(orderNumber).semiBold(),
          const Gap(8),
          Row(
            children: [
              Icon(LucideIcons.user, size: 16),
              const Gap(8),
              Text(customer).small(),
            ],
          ),
          const Gap(4),
          Row(
            children: [
              Icon(LucideIcons.mapPin, size: 16),
              const Gap(8),
              Expanded(child: Text(location).small().muted()),
            ],
          ),
          const Gap(8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  for (var i = 0; i < rating; i++)
                    Icon(LucideIcons.star, size: 16),
                  for (var i = rating; i < 5; i++)
                    Icon(LucideIcons.star, size: 16),
                ],
              ),
              OutlineButton(
                density: ButtonDensity.compact,
                onPressed: onViewDetails,
                child: const Text('View Details'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
