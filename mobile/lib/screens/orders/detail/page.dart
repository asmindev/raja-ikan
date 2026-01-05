import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/providers/order_provider.dart';
import 'widgets/order_detail_header.dart';
import 'widgets/order_status_badge.dart';
import 'widgets/order_customer_info.dart';
import 'widgets/order_delivery_info.dart';
import 'widgets/order_items_list.dart';
import 'widgets/order_timeline.dart';
import 'widgets/order_action_buttons.dart';

class OrderDetailScreen extends ConsumerWidget {
  final OrderModel order;

  const OrderDetailScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Fetch order detail from API
    final orderDetailState = ref.watch(orderDetailProvider(order.id));

    // Use fetched order if available, otherwise use passed order
    final displayOrder = orderDetailState.order ?? order;

    return Scaffold(
      headers: [
        OrderDetailHeader(
          order: displayOrder,
          isLoading: orderDetailState.isLoading,
          status: displayOrder.status,
        ),
        const Divider(height: 0),
      ],
      child: orderDetailState.error != null
          ? Center(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      LucideIcons.circleAlert,
                      size: 48,
                      color: Colors.red,
                    ),
                    const Gap(16),
                    Text(
                      'Gagal memuat detail pesanan',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Gap(8),
                    Text(
                      orderDetailState.error!,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.mutedForeground,
                      ),
                    ),
                    const Gap(16),
                    PrimaryButton(
                      onPressed: () {
                        ref
                            .read(orderDetailProvider(order.id).notifier)
                            .refresh();
                      },
                      child: const Text('Coba Lagi'),
                    ),
                  ],
                ),
              ),
            )
          : Stack(
              children: [
                // Main scrollable content
                SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(12, 12, 12, 100),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Customer Info
                      OrderCustomerInfo(order: displayOrder),
                      const Gap(12),

                      // Delivery Address & Time
                      OrderDeliveryInfo(order: displayOrder),
                      const Gap(12),

                      // Order Items
                      OrderItemsList(order: displayOrder),
                      const Gap(12),

                      // Status Timeline
                      OrderTimeline(order: displayOrder),
                    ],
                  ),
                ),
                // Fixed bottom buttons
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: Container(
                    decoration: BoxDecoration(
                      color: Theme.of(context).colorScheme.background,
                      border: Border(
                        top: BorderSide(
                          color: Theme.of(context).colorScheme.border,
                          width: 1,
                        ),
                      ),
                    ),
                    child: SafeArea(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: OrderActionButtons(order: displayOrder),
                      ),
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
