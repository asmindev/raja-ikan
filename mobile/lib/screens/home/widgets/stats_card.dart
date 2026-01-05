import 'package:flutter/material.dart' as M;
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
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return M.Container(
      decoration: M.BoxDecoration(
        borderRadius: M.BorderRadius.circular(16),
        gradient: M.LinearGradient(
          begin: M.Alignment.topLeft,
          end: M.Alignment.bottomRight,
          colors: isDark
              ? [
                  M.Colors.white.withValues(alpha: 0.05),
                  M.Colors.white.withValues(alpha: 0.02),
                ]
              : [
                  M.Colors.white,
                  M.Colors.white.withValues(alpha: 0.95),
                ],
        ),
        boxShadow: [
          M.BoxShadow(
            color: iconCol.withValues(alpha: 0.15),
            blurRadius: 16,
            offset: const M.Offset(0, 4),
          ),
        ],
      ),
      child: Card(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon Container with glow
            M.Container(
              padding: const EdgeInsets.all(10),
              decoration: M.BoxDecoration(
                color: bgColor,
                borderRadius: M.BorderRadius.circular(10),
                boxShadow: [
                  M.BoxShadow(
                    color: iconCol.withValues(alpha: 0.2),
                    blurRadius: 8,
                    offset: const M.Offset(0, 2),
                  ),
                ],
              ),
              child: Icon(icon, size: 22, color: iconCol),
            ),
            const Gap(14),
            // Value - more prominent
            Text(
              value,
              style: const TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.8,
                height: 1.0,
              ),
            ),
            const Gap(6),
            // Label
            Text(
              label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w500,
                color: Theme.of(context).colorScheme.mutedForeground,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
