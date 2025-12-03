import 'package:flutter/material.dart' as material show Material, InkWell;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/models/route.dart';
import 'package:mobile/providers/order_provider.dart';
import 'package:mobile/providers/active_route_provider.dart';
import 'package:mobile/screens/delivery/page.dart';
import 'widgets/order_card.dart';
import 'widgets/selectable_order_card.dart';
import 'widgets/empty_state.dart';
import 'widgets/error_state.dart';
import 'widgets/order_timeline.dart';

class OrdersPage extends ConsumerStatefulWidget {
  const OrdersPage({super.key});

  @override
  ConsumerState<OrdersPage> createState() => _OrdersPageState();
}

class _OrdersPageState extends ConsumerState<OrdersPage> {
  int _selectedTab = 0;
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  final Set<int> _selectedOrderIds = {};
  bool _isSelectionMode = false;

  @override
  void initState() {
    super.initState();
    // Load initial data
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadOrders();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _toggleSelection(int orderId) {
    setState(() {
      if (_selectedOrderIds.contains(orderId)) {
        _selectedOrderIds.remove(orderId);
        if (_selectedOrderIds.isEmpty) {
          _isSelectionMode = false;
        }
      } else {
        _selectedOrderIds.add(orderId);
        _isSelectionMode = true;
      }
    });
  }

  void _clearSelection() {
    setState(() {
      _selectedOrderIds.clear();
      _isSelectionMode = false;
    });
  }

  Future<void> _viewMapPreview() async {
    if (_selectedOrderIds.isEmpty) return;

    // Create local draft route for preview (Frontend only)
    final selectedOrders = ref
        .read(availableOrdersProvider)
        .orders
        .where((o) => _selectedOrderIds.contains(o.id))
        .toList();

    // Create waypoints from orders
    final waypoints = selectedOrders.map((order) {
      return RouteWaypoint(
        latitude: order.customerLatitude ?? 0.0,
        longitude: order.customerLongitude ?? 0.0,
        orderId: order.id,
        customerName: order.customerName,
      );
    }).toList();

    // Create dummy route
    final draftRoute = DeliveryRoute(
      id: 0, // Local draft ID
      driverId: 0, // Current user
      status: 'draft',
      optimizedOrder: [],
      waypoints: waypoints,
      createdAt: DateTime.now(),
    );

    _clearSelection();

    // Navigate to RouteMapPage (draft mode)
    final navResult = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) =>
            RouteMapPage(route: draftRoute, orders: selectedOrders),
      ),
    );

    // Jika route dimulai (START JOURNEY), switch ke In Progress tab
    if (navResult == 'started') {
      setState(() {
        _selectedTab = 1; // In Progress tab
      });
      // Fetch active route untuk update UI
      ref.read(activeRouteProvider.notifier).fetchActiveRoute();
    }
  }

  void _loadOrders() {
    switch (_selectedTab) {
      case 0:
        ref
            .read(availableOrdersProvider.notifier)
            .fetchOrders(refresh: true, search: _searchQuery);
        break;
      case 1:
        ref
            .read(deliveringOrdersProvider.notifier)
            .fetchOrders(refresh: true, search: _searchQuery);
        break;
      case 2:
        ref
            .read(completedOrdersProvider.notifier)
            .fetchOrders(refresh: true, search: _searchQuery);
        break;
    }
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query;
    });
    _loadOrders();
  }

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
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Orders',
                          style: TextStyle(
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            letterSpacing: -0.5,
                            color: Colors.white,
                          ),
                        ),
                        const Gap(4),
                        Text(
                          'Manage your deliveries',
                          style: TextStyle(
                            fontSize: 15,
                            color: Colors.white.withValues(alpha: 0.9),
                          ),
                        ),
                      ],
                    ),
                    // Stats summary
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.3),
                          width: 1,
                        ),
                      ),
                      child: Column(
                        children: [
                          Text(
                            '${_getOrderCount()}',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          Text(
                            'Active',
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.white.withValues(alpha: 0.9),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const Gap(16),
                // Search Bar & Selection Mode Button
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            Expanded(
                              child: _SearchTextField(
                                controller: _searchController,
                                onChanged: _onSearchChanged,
                              ),
                            ),
                            if (_searchQuery.isNotEmpty) ...[
                              const Gap(8),
                              GestureDetector(
                                onTap: () {
                                  _searchController.clear();
                                  _onSearchChanged('');
                                },
                                child: Icon(
                                  LucideIcons.x,
                                  size: 18,
                                  color: Colors.white.withValues(alpha: 0.8),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ),
                    // Selection Mode Toggle Button (only on Available tab)
                    if (_selectedTab == 0) ...[
                      const Gap(12),
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _isSelectionMode = !_isSelectionMode;
                            if (!_isSelectionMode) {
                              _selectedOrderIds.clear();
                            }
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: _isSelectionMode
                                ? const Color(0xFF7C3AED).withValues(alpha: 0.2)
                                : Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(12),
                            border: _isSelectionMode
                                ? Border.all(
                                    color: const Color(0xFF7C3AED),
                                    width: 2,
                                  )
                                : null,
                          ),
                          child: Icon(
                            _isSelectionMode
                                ? LucideIcons.listChecks
                                : LucideIcons.list,
                            size: 20,
                            color: _isSelectionMode
                                ? const Color(0xFF7C3AED)
                                : Colors.white.withValues(alpha: 0.8),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ),
        const Divider(height: 0),
        // Custom Tabs
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          color: theme.colorScheme.background,
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildTabButton(
                  label: 'Available',
                  count: ref.watch(availableOrdersProvider).orders.length,
                  isSelected: _selectedTab == 0,
                  onTap: () {
                    setState(() {
                      _selectedTab = 0;
                    });
                    _loadOrders();
                  },
                ),
                const Gap(8),
                _buildTabButton(
                  label: 'In Progress',
                  count: ref.watch(deliveringOrdersProvider).orders.length,
                  isSelected: _selectedTab == 1,
                  onTap: () {
                    setState(() {
                      _selectedTab = 1;
                    });
                    // Fetch active route when switching to In Progress tab
                    ref.read(activeRouteProvider.notifier).fetchActiveRoute();
                  },
                ),
                const Gap(8),
                _buildTabButton(
                  label: 'Completed',
                  count: ref.watch(completedOrdersProvider).orders.length,
                  isSelected: _selectedTab == 2,
                  onTap: () {
                    setState(() {
                      _selectedTab = 2;
                    });
                    _loadOrders();
                  },
                ),
              ],
            ),
          ),
        ),
        const Divider(height: 0),
      ],
      child: IndexedStack(
        index: _selectedTab,
        children: [
          _buildAvailableOrders(),
          _buildDeliveringOrders(),
          _buildCompletedOrders(),
        ],
      ),
    );
  }

  int _getOrderCount() {
    final available = ref.watch(availableOrdersProvider).orders.length;
    final delivering = ref.watch(deliveringOrdersProvider).orders.length;
    return available + delivering;
  }

  Widget _buildTabButton({
    required String label,
    required int count,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF059669) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected
                ? const Color(0xFF059669)
                : Theme.of(context).colorScheme.border,
            width: 1.5,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                color: isSelected
                    ? Colors.white
                    : Theme.of(context).colorScheme.foreground,
              ),
            ),
            const Gap(8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.2)
                    : Theme.of(context).colorScheme.muted,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '$count',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: isSelected
                      ? Colors.white
                      : Theme.of(context).colorScheme.mutedForeground,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAvailableOrders() {
    final orderState = ref.watch(availableOrdersProvider);

    if (orderState.isLoading && orderState.orders.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (orderState.error != null && orderState.orders.isEmpty) {
      return ErrorState(error: orderState.error!, onRetry: _loadOrders);
    }

    if (orderState.orders.isEmpty) {
      return const EmptyState(
        icon: LucideIcons.inbox,
        title: 'No available orders',
        message: 'New orders will appear here',
      );
    }

    return Stack(
      children: [
        ListView.separated(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
          itemCount: orderState.orders.length,
          separatorBuilder: (_, __) => const Gap(12),
          itemBuilder: (context, index) {
            final order = orderState.orders[index];
            return SelectableOrderCard(
              order: order,
              isSelected: _selectedOrderIds.contains(order.id),
              isSelectionMode: _isSelectionMode,
              onTap: () => _toggleSelection(order.id),
              onLongPress: () => _toggleSelection(order.id),
            );
          },
        ),

        // Floating Action Button for optimization
        if (_selectedOrderIds.isNotEmpty)
          Positioned(
            bottom: 16,
            left: 16,
            right: 16,
            child: Container(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF7C3AED), // Purple
                    Color(0xFF8B5CF6),
                  ],
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF7C3AED).withValues(alpha: 0.4),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: GestureDetector(
                onTap: _viewMapPreview,
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 16,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        LucideIcons.map,
                        color: Colors.white,
                        size: 20,
                      ),
                      const Gap(12),
                      Text(
                        'View Map (${_selectedOrderIds.length} Orders)',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

        // Clear selection button
        if (_isSelectionMode)
          Positioned(
            top: 8,
            right: 16,
            child: GestureDetector(
              onTap: _clearSelection,
              child: Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: Colors.red.withValues(alpha: 0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(LucideIcons.x, size: 14, color: Colors.red),
                    const Gap(4),
                    Text(
                      'Clear (${_selectedOrderIds.length})',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.red,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildDeliveringOrders() {
    final activeRouteState = ref.watch(activeRouteProvider);

    if (activeRouteState.isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (activeRouteState.error != null) {
      return ErrorState(
        error: activeRouteState.error!,
        onRetry: () {
          ref.read(activeRouteProvider.notifier).fetchActiveRoute();
        },
      );
    }

    if (activeRouteState.route == null || activeRouteState.orders.isEmpty) {
      return const EmptyState(
        icon: LucideIcons.route,
        title: 'No active route',
        message: 'Optimize orders from Available tab to start delivery',
      );
    }

    // Tampilkan timeline dengan button Maps
    return _ActiveRouteTimeline(
      route: activeRouteState.route!,
      orders: activeRouteState.orders,
    );
  }

  Widget _buildCompletedOrders() {
    final orderState = ref.watch(completedOrdersProvider);

    if (orderState.isLoading && orderState.orders.isEmpty) {
      return const Center(child: CircularProgressIndicator());
    }

    if (orderState.error != null && orderState.orders.isEmpty) {
      return ErrorState(error: orderState.error!, onRetry: _loadOrders);
    }

    if (orderState.orders.isEmpty) {
      return const EmptyState(
        icon: LucideIcons.circleCheck,
        title: 'No completed orders',
        message: 'Completed orders will appear here',
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: orderState.orders.length,
      separatorBuilder: (_, __) => const Gap(12),
      itemBuilder: (context, index) {
        final order = orderState.orders[index];
        return OrderCard(
          order: order,
          status: 'Delivered',
          completedAt: order.deliveryAt != null
              ? DateFormat('HH:mm a').format(order.deliveryAt!)
              : null,
        );
      },
    );
  }
}

// Custom Search TextField Widget
class _SearchTextField extends StatefulWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  const _SearchTextField({required this.controller, required this.onChanged});

  @override
  State<_SearchTextField> createState() => _SearchTextFieldState();
}

class _SearchTextFieldState extends State<_SearchTextField> {
  final FocusNode _focusNode = FocusNode();

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RawKeyboardListener(
      focusNode: FocusNode(),
      child: GestureDetector(
        onTap: () => _focusNode.requestFocus(),
        child: EditableText(
          controller: widget.controller,
          focusNode: _focusNode,
          style: const TextStyle(fontSize: 14, color: Colors.white),
          cursorColor: Colors.white,
          backgroundCursorColor: Colors.white.withValues(alpha: 0.7),
          onChanged: widget.onChanged,
          keyboardType: TextInputType.text,
        ),
      ),
    );
  }
}

// Active Route Timeline View (embedded in tab)
class _ActiveRouteTimeline extends StatelessWidget {
  final DeliveryRoute route;
  final List<OrderModel> orders;

  const _ActiveRouteTimeline({required this.route, required this.orders});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Timeline view
        OrderTimeline(orders: orders),

        // Floating button at bottom
        Positioned(
          bottom: 16,
          left: 16,
          right: 16,
          child: Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF10B981), Color(0xFF059669)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF10B981).withValues(alpha: 0.4),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: material.Material(
              color: Colors.transparent,
              child: material.InkWell(
                onTap: () {
                  // Navigate ke full map page
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          RouteMapPage(route: route, orders: orders),
                    ),
                  );
                },
                borderRadius: BorderRadius.circular(16),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 24,
                    vertical: 16,
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        LucideIcons.map,
                        color: Colors.white,
                        size: 22,
                      ),
                      const Gap(12),
                      const Text(
                        'View Maps',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }
}
