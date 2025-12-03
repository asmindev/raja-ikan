import 'package:shadcn_flutter/shadcn_flutter.dart';

class SummaryCard extends StatelessWidget {
  const SummaryCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('This Week Summary').semiBold().large(),
          const Gap(16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('48').large().semiBold(),
                    const Gap(4),
                    const Text('Total Deliveries').muted().small(),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Rp 1.2M').large().semiBold(),
                    const Gap(4),
                    const Text('Total Earnings').muted().small(),
                  ],
                ),
              ),
            ],
          ),
          const Gap(16),
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('156 km').large().semiBold(),
                    const Gap(4),
                    const Text('Distance Covered').muted().small(),
                  ],
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('4.8 ⭐').large().semiBold(),
                    const Gap(4),
                    const Text('Average Rating').muted().small(),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
