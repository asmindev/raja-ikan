import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';
import 'package:mobile/screens/home/page.dart';
import 'package:mobile/screens/orders/page.dart';
import 'package:mobile/screens/history/page.dart';
import 'package:mobile/screens/profile/page.dart';

class MainNavigation extends ConsumerStatefulWidget {
  const MainNavigation({super.key});

  @override
  ConsumerState<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends ConsumerState<MainNavigation> {
  int _selectedIndex = 0;

  final List<Widget> _screens = const [
    HomePage(),
    OrdersPage(),
    HistoryPage(),
    ProfilePage(),
  ];

  final List<_NavItem> _navItems = const [
    _NavItem(label: 'Home', icon: LucideIcons.house),
    _NavItem(label: 'Orders', icon: LucideIcons.clipboardList),
    _NavItem(label: 'History', icon: LucideIcons.clock),
    _NavItem(label: 'Profile', icon: LucideIcons.user),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      footers: [
        Container(
          decoration: BoxDecoration(
            border: Border(
              top: BorderSide(color: const Color(0xFFE5E7EB), width: 0.5),
            ),
          ),
          child: SafeArea(
            top: false,
            child: Container(
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: List.generate(_navItems.length, (index) {
                  final item = _navItems[index];
                  final isSelected = _selectedIndex == index;

                  return Expanded(
                    child: GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedIndex = index;
                        });
                      },
                      behavior: HitTestBehavior.opaque,
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              item.icon,
                              size: 20,
                              color: isSelected
                                  ? const Color(0xFF059669)
                                  : const Color(0xFF9CA3AF),
                            ),
                            const Gap(2),
                            Text(
                              item.label,
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: isSelected
                                    ? FontWeight.w600
                                    : FontWeight.w400,
                                color: isSelected
                                    ? const Color(0xFF059669)
                                    : const Color(0xFF9CA3AF),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),
          ),
        ),
      ],
      child: IndexedStack(index: _selectedIndex, children: _screens),
    );
  }
}

class _NavItem {
  final String label;
  final IconData icon;

  const _NavItem({required this.label, required this.icon});
}
