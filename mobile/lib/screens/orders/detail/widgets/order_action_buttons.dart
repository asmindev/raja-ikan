import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/models/route.dart';
import 'package:mobile/services/route_service.dart';
import 'package:mobile/services/location_service.dart';
import 'package:mobile/screens/delivery/page.dart';

class OrderActionButtons extends ConsumerWidget {
  final OrderModel order;

  const OrderActionButtons({super.key, required this.order});

  Future<void> _startDelivery(
    BuildContext context,
    WidgetRef ref,
    OrderModel order,
  ) async {
    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(),
            const Gap(16),
            const Text('Memulai pengiriman...'),
          ],
        ),
      ),
    );

    try {
      // Get current location
      final locationService = LocationService();
      final location = await locationService.getCurrentLocation();

      if (location == null) {
        if (context.mounted) {
          Navigator.pop(context); // Close loading
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Error Lokasi'),
              content: const Text(
                'Tidak dapat mendapatkan lokasi. Mohon aktifkan layanan lokasi.',
              ),
              actions: [
                PrimaryButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        }
        return;
      }

      final routeService = RouteService();
      final result = await routeService.createAndOptimize([
        order.id,
      ], startLocation: location);

      if (context.mounted) {
        Navigator.pop(context); // Close loading dialog

        if (result['success'] == true) {
          final route = result['route'] as DeliveryRoute;
          final orders = result['orders'] as List<OrderModel>;

          // Navigate to RouteMapPage
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => RouteMapPage(route: route, orders: orders),
            ),
          );
        } else {
          // Show error
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('Error'),
              content: Text(result['message'] ?? 'Gagal memulai pengiriman'),
              actions: [
                PrimaryButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        }
      }
    } catch (e) {
      if (context.mounted) {
        Navigator.pop(context); // Close loading dialog

        debugPrint('❌ [START DELIVERY] Failed to start delivery: $e');

        // Show error
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Error'),
            content: Text('Gagal memulai pengiriman: $e'),
            actions: [
              PrimaryButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    if (order.status.toLowerCase() == 'accepted' ||
        order.status.toLowerCase() == 'pending') {
      return Column(
        children: [
          Row(
            children: [
              Expanded(
                child: OutlineButton(
                  onPressed: () {
                    // TODO: Cancel order
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('Batalkan Pesanan'),
                        content: const Text(
                          'Apakah Anda yakin ingin membatalkan pesanan ini?',
                        ),
                        actions: [
                          OutlineButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text('Tidak'),
                          ),
                          DestructiveButton(
                            onPressed: () {
                              Navigator.pop(context);
                              // TODO: Call cancel API
                            },
                            child: const Text('Ya, Batalkan'),
                          ),
                        ],
                      ),
                    );
                  },
                  child: const Text('Batalkan'),
                ),
              ),
              const Gap(12),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [
                        Color(0xFF059669), // Emerald
                        Color(0xFF10B981), // Green
                      ],
                    ),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: PrimaryButton(
                    onPressed: () => _startDelivery(context, ref, order),
                    child: const Text('Mulai Pengiriman'),
                  ),
                ),
              ),
            ],
          ),
        ],
      );
    } else if (order.status.toLowerCase() == 'delivering') {
      return Container(
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [
              Color(0xFF059669), // Emerald
              Color(0xFF10B981), // Green
            ],
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: PrimaryButton(
          onPressed: () {
            // TODO: Complete delivery
          },
          child: const Text('Selesaikan Pengiriman'),
        ),
      );
    }

    return const SizedBox.shrink();
  }
}
