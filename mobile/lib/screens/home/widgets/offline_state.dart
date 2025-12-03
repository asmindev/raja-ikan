import 'package:shadcn_flutter/shadcn_flutter.dart';

class OfflineState extends StatelessWidget {
  const OfflineState({super.key});

  @override
  Widget build(BuildContext context) {
    return Card(
      padding: const EdgeInsets.all(32),
      child: Column(
        children: [
          Icon(LucideIcons.power, size: 64),
          const Gap(16),
          const Text('You are offline').semiBold().large(),
          const Gap(8),
          const Text('Turn on your status to start receiving orders').muted(),
        ],
      ),
    );
  }
}
