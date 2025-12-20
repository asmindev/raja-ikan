import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:mobile/config/api_config.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/services/http_interceptor.dart';

class OrderService {
  static String get baseUrl => '${ApiConfig.baseUrl}/api/v1';

  Future<(List<OrderModel> orders, int? nextPage)> fetchOrders({
    int page = 1,
    int perPage = 20,
    String? status,
    String? search,
  }) async {
    final query = <String, String>{'page': '$page', 'per_page': '$perPage'};
    if (status != null && status.isNotEmpty) query['status'] = status;
    if (search != null && search.isNotEmpty) query['search'] = search;

    final uri = Uri.parse('$baseUrl/orders').replace(queryParameters: query);

    debugPrint('📦 [OrderService] Fetching orders: $uri');
    final response = await HttpInterceptor.get(uri.toString());

    // If 401, HttpInterceptor already handled logout, just return empty
    if (response.statusCode == 401) {
      debugPrint('🔒 [OrderService] 401 detected, returning empty list');
      return (<OrderModel>[], null);
    }

    if (response.statusCode != 200) {
      debugPrint(
        '❌ [OrderService] Failed to fetch orders: ${response.statusCode}',
      );
      throw Exception('Failed to load orders: ${response.body}');
    }

    final data = json.decode(response.body) as Map<String, dynamic>;
    final items = (data['data'] as List<dynamic>? ?? [])
        .map((e) => OrderModel.fromJson(e as Map<String, dynamic>))
        .toList();
    final current = (data['current_page'] as num?)?.toInt() ?? page;
    final last = (data['last_page'] as num?)?.toInt() ?? current;
    final next = current < last ? current + 1 : null;

    debugPrint(
      '✅ [OrderService] Loaded ${items.length} orders (page $current/$last)',
    );
    return (items, next);
  }

  Future<OrderModel?> fetchOrderDetail(int orderId) async {
    final url = '$baseUrl/orders/$orderId';

    debugPrint('📦 [OrderService] Fetching order detail: $url');
    final response = await HttpInterceptor.get(url);

    // If 401, HttpInterceptor already handled logout
    if (response.statusCode == 401) {
      debugPrint('🔒 [OrderService] 401 detected, returning null');
      return null;
    }

    if (response.statusCode != 200) {
      debugPrint(
        '❌ [OrderService] Failed to fetch order detail: ${response.statusCode}',
      );
      throw Exception('Failed to load order detail: ${response.body}');
    }

    final data = json.decode(response.body) as Map<String, dynamic>;
    debugPrint('✅ [OrderService] Order detail loaded');
    return OrderModel.fromJson(data['data'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> fetchTodayStats() async {
    final url = '$baseUrl/dashboard/stats';

    debugPrint('📊 [OrderService] Fetching today stats: $url');
    final response = await HttpInterceptor.get(url);

    if (response.statusCode == 401) {
      debugPrint('🔒 [OrderService] 401 detected, returning empty stats');
      return {
        'completed_count': 0,
        'total_earnings': 0,
        'pending_count': 0,
        'delivering_count': 0,
      };
    }

    if (response.statusCode != 200) {
      debugPrint(
        '❌ [OrderService] Failed to fetch stats: ${response.statusCode}',
      );
      throw Exception('Failed to load stats: ${response.body}');
    }

    final data = json.decode(response.body) as Map<String, dynamic>;
    debugPrint('✅ [OrderService] Stats loaded');
    return data;
  }
}
