import 'package:shadcn_flutter/shadcn_flutter.dart';

class StatsCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;
  final Color? iconColor;
  final Color? backgroundColor;

  const StatsCard({
    super.key,
    required this.icon,
    required this.value,
    required this.label,
    this.iconColor,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final bgColor =
        backgroundColor ??
        Theme.of(context).colorScheme.primary.withValues(alpha: 0.1);
    final iconCol = iconColor ?? Theme.of(context).colorScheme.primary;

    return Card(
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Icon Container
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 24, color: iconCol),
          ),
          const Gap(12),
          // Value
          Text(
            value,
            style: const TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              letterSpacing: -0.5,
            ),
          ),
          const Gap(4),
          // Label
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Theme.of(context).colorScheme.mutedForeground,
            ),
          ),
        ],
      ),
    );
  }
}
