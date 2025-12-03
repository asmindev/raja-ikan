import 'package:shadcn_flutter/shadcn_flutter.dart';

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64),
          const Gap(16),
          Text(title).large().semiBold(),
          const Gap(8),
          Text(message).muted(),
        ],
      ),
    );
  }
}
