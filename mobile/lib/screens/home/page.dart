import 'package:shadcn_flutter/shadcn_flutter.dart';
import 'widgets/stats_card.dart';
import 'widgets/order_card.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      headers: [
        Container(
          padding: const EdgeInsets.fromLTRB(24, 46, 24, 40),
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
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _getGreeting(),
                        style: const TextStyle(
                          fontSize: 32,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.5,
                          color: Colors.white,
                        ),
                      ),
                      const Gap(8),
                      Text(
                        'Ready to deliver today?',
                        style: TextStyle(
                          fontSize: 15,
                          color: Colors.white.withValues(alpha: 0.9),
                        ),
                      ),
                    ],
                  ),
                ),
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
                    onPressed: () {},
                    child: const Icon(
                      LucideIcons.bell,
                      size: 20,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Stats Cards
            Row(
              children: [
                Expanded(
                  child: StatsCard(
                    icon: LucideIcons.circleCheck,
                    value: '12',
                    label: 'Completed Today',
                    iconColor: const Color(0xFF059669),
                    backgroundColor: const Color(
                      0xFF059669,
                    ).withValues(alpha: 0.1),
                  ),
                ),
                const Gap(12),
                Expanded(
                  child: StatsCard(
                    icon: LucideIcons.wallet,
                    value: 'Rp 450K',
                    label: 'Earnings Today',
                    iconColor: const Color(0xFF10B981),
                    backgroundColor: const Color(
                      0xFF10B981,
                    ).withValues(alpha: 0.1),
                  ),
                ),
              ],
            ),
            const Gap(20),

            // Current Orders Section
            const Text('Current Orders').large().semiBold(),
            const Gap(12),

            OrderCard(
              orderNumber: '#12345',
              customerName: 'John Doe',
              address: 'Jl. Ahmad Yani No. 123, Kendari',
              distance: '2.5 km',
              status: 'Ready to Pickup',
              statusColor: const Color(0xFF059669),
              onViewDetails: () {},
              onNavigate: () {},
            ),
            const Gap(12),
            OrderCard(
              orderNumber: '#12346',
              customerName: 'Jane Smith',
              address: 'Jl. Sudirman No. 456, Kendari',
              distance: '1.8 km',
              status: 'In Delivery',
              statusColor: const Color(0xFF10B981),
              onViewDetails: () {},
              onNavigate: () {},
            ),
          ],
        ),
      ),
    );
  }
}
