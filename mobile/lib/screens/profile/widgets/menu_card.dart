import 'package:shadcn_flutter/shadcn_flutter.dart';

class MenuCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;
  final bool isDestructive;

  const MenuCard({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.isDestructive = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Card(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Icon(icon, size: 24),
            const Gap(16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title).semiBold(),
                  const Gap(4),
                  Text(subtitle).small().muted(),
                ],
              ),
            ),
            Icon(LucideIcons.chevronRight, size: 20),
          ],
        ),
      ),
    );
  }
}
