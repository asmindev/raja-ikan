import 'package:shadcn_flutter/shadcn_flutter.dart';

class StatusCard extends StatelessWidget {
  final bool isOnline;
  final ValueChanged<bool> onStatusChanged;

  const StatusCard({
    super.key,
    required this.isOnline,
    required this.onStatusChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      padding: const EdgeInsets.all(20),
      child: Row(
        children: [
          Avatar(
            backgroundColor: Colors.blue,
            initials: Avatar.getInitials('Driver Name'),
            size: 48,
          ),
          const Gap(16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Welcome back!').semiBold().large(),
                const Gap(4),
                Text(
                  isOnline ? 'You are online' : 'You are offline',
                ).muted().small(),
              ],
            ),
          ),
          Switch(value: isOnline, onChanged: onStatusChanged),
        ],
      ),
    );
  }
}
