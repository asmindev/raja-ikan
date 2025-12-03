import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';

class HistoryPage extends ConsumerStatefulWidget {
  const HistoryPage({super.key});

  @override
  ConsumerState<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends ConsumerState<HistoryPage> {
  String _selectedFilter = 'all'; // all, today, week, month

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      headers: [
        Container(
          padding: const EdgeInsets.fromLTRB(24, 32, 24, 16),
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
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'History',
                  style: TextStyle(
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                    letterSpacing: -0.5,
                    color: Colors.white,
                  ),
                ),
                const Gap(4),
                Text(
                  'Your delivery history',
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.white.withValues(alpha: 0.9),
                  ),
                ),
                const Gap(16),
                // Stats
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.3),
                      width: 1,
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        LucideIcons.circleCheck,
                        size: 20,
                        color: Colors.white,
                      ),
                      const Gap(8),
                      const Text(
                        '42',
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      const Gap(8),
                      Text(
                        'Completed Deliveries',
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.white.withValues(alpha: 0.9),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        const Divider(height: 0),
        // Filter Tabs
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          color: theme.colorScheme.background,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterButton('All Time', 'all'),
                const Gap(8),
                _buildFilterButton('Today', 'today'),
                const Gap(8),
                _buildFilterButton('This Week', 'week'),
                const Gap(8),
                _buildFilterButton('This Month', 'month'),
              ],
            ),
          ),
        ),
        const Divider(height: 0),
      ],
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildHistoryItem(
            date: 'Today, 14:30',
            orderNumber: '#12344',
            customer: 'John Doe',
            location: 'Jl. Ahmad Yani No. 123',
            earnings: 23000,
          ),
          const Gap(12),
          _buildHistoryItem(
            date: 'Today, 12:15',
            orderNumber: '#12343',
            customer: 'Jane Smith',
            location: 'Jl. Sudirman No. 45',
            earnings: 18000,
          ),
          const Gap(12),
          _buildHistoryItem(
            date: 'Today, 10:30',
            orderNumber: '#12342',
            customer: 'Bob Wilson',
            location: 'Jl. Pahlawan No. 78',
            earnings: 25000,
          ),
          const Gap(12),
          _buildHistoryItem(
            date: 'Yesterday, 16:45',
            orderNumber: '#12341',
            customer: 'Alice Brown',
            location: 'Jl. Gatot Subroto No. 90',
            earnings: 20000,
          ),
        ],
      ),
    );
  }

  Widget _buildFilterButton(String label, String value) {
    final isSelected = _selectedFilter == value;
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedFilter = value;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF059669) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF059669)
                : Theme.of(context).colorScheme.border,
            width: 1.5,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
            color: isSelected
                ? Colors.white
                : Theme.of(context).colorScheme.foreground,
          ),
        ),
      ),
    );
  }

  Widget _buildHistoryItem({
    required String date,
    required String orderNumber,
    required String customer,
    required String location,
    required double earnings,
  }) {
    final currencyFormat = NumberFormat.currency(
      locale: 'id_ID',
      symbol: 'Rp ',
      decimalDigits: 0,
    );

    return Card(
      padding: const EdgeInsets.all(12),
      child: Row(
        children: [
          // Check Icon
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: const Color(0xFF059669).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(
              LucideIcons.circleCheck,
              size: 18,
              color: Color(0xFF059669),
            ),
          ),
          const Gap(12),
          // Content
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      orderNumber,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      currencyFormat.format(earnings),
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF059669),
                      ),
                    ),
                  ],
                ),
                const Gap(6),
                Text(
                  customer,
                  style: TextStyle(
                    fontSize: 13,
                    color: Theme.of(context).colorScheme.mutedForeground,
                  ),
                ),
                const Gap(4),
                Text(
                  date,
                  style: TextStyle(
                    fontSize: 12,
                    color: Theme.of(context).colorScheme.mutedForeground,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
