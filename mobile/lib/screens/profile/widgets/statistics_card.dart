import 'package:shadcn_flutter/shadcn_flutter.dart';

class StatisticsCard extends StatelessWidget {
  final String totalDeliveries;
  final String totalEarnings;
  final String distanceCovered;
  final String acceptanceRate;

  const StatisticsCard({
    super.key,
    required this.totalDeliveries,
    required this.totalEarnings,
    required this.distanceCovered,
    required this.acceptanceRate,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          _buildStatRow('Total Deliveries', totalDeliveries),
          const Gap(12),
          const Divider(),
          const Gap(12),
          _buildStatRow('Total Earnings', totalEarnings),
          const Gap(12),
          const Divider(),
          const Gap(12),
          _buildStatRow('Distance Covered', distanceCovered),
          const Gap(12),
          const Divider(),
          const Gap(12),
          _buildStatRow('Acceptance Rate', acceptanceRate),
        ],
      ),
    );
  }

  Widget _buildStatRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [Text(label).muted(), Text(value).semiBold()],
    );
  }
}
