import 'package:shadcn_flutter/shadcn_flutter.dart';

class ProfileHeader extends StatelessWidget {
  final String name;
  final String driverId;
  final double rating;
  final int totalReviews;
  final VoidCallback? onEditProfile;

  const ProfileHeader({
    super.key,
    required this.name,
    required this.driverId,
    required this.rating,
    required this.totalReviews,
    this.onEditProfile,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          Avatar(
            backgroundColor: Colors.blue,
            initials: Avatar.getInitials(name),
            size: 80,
          ),
          const Gap(16),
          Text(name).large().semiBold(),
          const Gap(4),
          Text('ID: $driverId').muted().small(),
          const Gap(4),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(LucideIcons.star, size: 16),
              const Gap(4),
              Text('$rating').semiBold(),
              const Gap(4),
              Text('($totalReviews reviews)').muted().small(),
            ],
          ),
          const Gap(16),
          Row(
            children: [
              Expanded(
                child: OutlineButton(
                  onPressed: onEditProfile,
                  child: const Text('Edit Profile'),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
