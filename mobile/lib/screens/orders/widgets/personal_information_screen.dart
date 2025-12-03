import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';

class PersonalInformationScreen extends ConsumerWidget {
  const PersonalInformationScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      headers: [
        Container(
          padding: const EdgeInsets.fromLTRB(24, 32, 24, 20),
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                Color(0xFF059669), // Emerald
                Color(0xFF10B981), // Green
                Color(0xFF34D399), // Light Green
              ],
            ),
          ),
          child: SafeArea(
            bottom: false,
            child: Row(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: OutlineButton(
                    density: ButtonDensity.icon,
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                    child: const Icon(
                      LucideIcons.arrowLeft,
                      size: 20,
                      color: Colors.white,
                    ),
                  ),
                ),
                const Gap(16),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Personal Information',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Gap(4),
                      Text(
                        'Manage your personal details',
                        style: TextStyle(fontSize: 14, color: Colors.white),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const Divider(height: 0),
      ],
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Profile Picture Section
          Center(
            child: Column(
              children: [
                Stack(
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        color: const Color(0xFF059669).withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: const Color(0xFF059669),
                          width: 2,
                        ),
                      ),
                      child: const Icon(
                        LucideIcons.user,
                        size: 50,
                        color: Color(0xFF059669),
                      ),
                    ),
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF059669),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white, width: 2),
                        ),
                        child: const Icon(
                          LucideIcons.camera,
                          size: 16,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  ],
                ),
                const Gap(8),
                TextButton(
                  onPressed: () {
                    // TODO: Change photo
                  },
                  child: const Text('Change Photo'),
                ),
              ],
            ),
          ),
          const Gap(24),
          // Information Fields
          Card(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildInfoField(
                  context: context,
                  label: 'Full Name',
                  value: 'Driver Name',
                  icon: LucideIcons.user,
                ),
                const Gap(16),
                const Divider(height: 0),
                const Gap(16),
                _buildInfoField(
                  context: context,
                  label: 'Driver ID',
                  value: 'DRV-12345',
                  icon: LucideIcons.badgeCheck,
                ),
                const Gap(16),
                const Divider(height: 0),
                const Gap(16),
                _buildInfoField(
                  context: context,
                  label: 'Phone Number',
                  value: '+62 812 3456 7890',
                  icon: LucideIcons.phone,
                ),
                const Gap(16),
                const Divider(height: 0),
                const Gap(16),
                _buildInfoField(
                  context: context,
                  label: 'Email',
                  value: 'driver@example.com',
                  icon: LucideIcons.mail,
                ),
                const Gap(16),
                const Divider(height: 0),
                const Gap(16),
                _buildInfoField(
                  context: context,
                  label: 'Address',
                  value: 'Jl. Example No. 123, Kendari',
                  icon: LucideIcons.mapPin,
                ),
              ],
            ),
          ),
          const Gap(20),
          // Edit Button
          PrimaryButton(
            onPressed: () {
              // TODO: Edit profile
            },
            child: const Text('Edit Profile'),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoField({
    required BuildContext context,
    required String label,
    required String value,
    required IconData icon,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: const Color(0xFF059669)),
        const Gap(12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: Theme.of(context).colorScheme.mutedForeground,
                ),
              ),
              const Gap(4),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
