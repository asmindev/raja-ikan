import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';
import '../models/route.dart';
import '../models/order.dart';
import '../config/api_config.dart';
import 'auth_service.dart';

class RouteService {
  static String get baseUrl => '${ApiConfig.baseUrl}/api/v1';

  // Create draft route (without optimization)
  Future<Map<String, dynamic>> createDraft(
    List<int> orderIds,
    LatLng driverLocation,
  ) async {
    try {
      debugPrint(
        '📝 [CREATE DRAFT] Creating draft route with orders: $orderIds',
      );
      debugPrint(
        '📍 [CREATE DRAFT] Driver Location: ${driverLocation.latitude}, ${driverLocation.longitude}',
      );
      final headers = await AuthService.getAuthHeaders();

      final body = {
        'order_ids': orderIds,
        'start_location': {
          'latitude': driverLocation.latitude,
          'longitude': driverLocation.longitude,
        },
      };

      final response = await http.post(
        Uri.parse('$baseUrl/routes/draft'),
        headers: headers,
        body: json.encode(body),
      );

      debugPrint('📨 [CREATE DRAFT] Response Status: ${response.statusCode}');
      debugPrint('📦 [CREATE DRAFT] Response Body: ${response.body}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'route': DeliveryRoute.fromJson(data['route']),
          'orders': (data['orders'] as List)
              .map((order) => OrderModel.fromJson(order))
              .toList(),
          'message': data['message'] ?? 'Draft route created successfully',
        };
      } else {
        final data = json.decode(response.body);
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to create draft route',
        };
      }
    } catch (e) {
      debugPrint('💥 [CREATE DRAFT] Exception: $e');
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Optimize and start route with fresh driver location
  Future<Map<String, dynamic>> optimizeAndStart(
    int routeId,
    LatLng startLocation,
  ) async {
    try {
      debugPrint('🚀 [OPTIMIZE AND START] Route ID: $routeId');
      debugPrint('📍 [OPTIMIZE AND START] Start Location: $startLocation');
      final headers = await AuthService.getAuthHeaders();

      final body = {
        'start_location': {
          'latitude': startLocation.latitude,
          'longitude': startLocation.longitude,
        },
      };

      final response = await http.post(
        Uri.parse('$baseUrl/routes/$routeId/optimize-and-start'),
        headers: headers,
        body: json.encode(body),
      );

      debugPrint(
        '📨 [OPTIMIZE AND START] Response Status: ${response.statusCode}',
      );
      debugPrint('📦 [OPTIMIZE AND START] Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'route': DeliveryRoute.fromJson(data['route']),
          'orders': (data['orders'] as List)
              .map((order) => OrderModel.fromJson(order))
              .toList(),
          'message':
              data['message'] ?? 'Route optimized and started successfully',
        };
      } else {
        final data = json.decode(response.body);
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to optimize route',
        };
      }
    } catch (e) {
      debugPrint('💥 [OPTIMIZE AND START] Exception: $e');
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Create and optimize route (OLD METHOD - untuk backward compatibility)
  Future<Map<String, dynamic>> createAndOptimize(
    List<int> orderIds, {
    LatLng? startLocation,
  }) async {
    try {
      final headers = await AuthService.getAuthHeaders();

      final body = {
        'order_ids': orderIds,
        if (startLocation != null)
          'start_location': {
            'latitude': startLocation.latitude,
            'longitude': startLocation.longitude,
          },
      };

      final response = await http.post(
        Uri.parse('$baseUrl/routes/optimize'),
        headers: headers,
        body: json.encode(body),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'route': DeliveryRoute.fromJson(data['route']),
          'orders': (data['orders'] as List)
              .map((order) => OrderModel.fromJson(order))
              .toList(),
          'message': data['message'] ?? 'Route optimized successfully',
        };
      } else {
        final data = json.decode(response.body);
        return {
          'success': false,
          'message': data['message'] ?? 'Failed to optimize route',
        };
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Get active route for current driver
  Future<Map<String, dynamic>> getActiveRoute() async {
    try {
      final headers = await AuthService.getAuthHeaders();

      final response = await http.get(
        Uri.parse('$baseUrl/routes/active'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'route': data['route'] != null
              ? DeliveryRoute.fromJson(data['route'])
              : null,
          'orders': data['orders'] != null
              ? (data['orders'] as List)
                    .map((order) => OrderModel.fromJson(order))
                    .toList()
              : <OrderModel>[],
        };
      } else {
        return {'success': false, 'message': 'Failed to fetch active route'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Accept route (planned -> active)
  Future<Map<String, dynamic>> startRoute(int routeId) async {
    try {
      debugPrint('🚀 [START ROUTE] Requesting route start for ID: $routeId');
      final headers = await AuthService.getAuthHeaders();
      debugPrint('🔑 [START ROUTE] Headers: ${headers.keys}');

      final url = '$baseUrl/routes/$routeId/start';
      debugPrint('📡 [START ROUTE] URL: $url');

      final response = await http.post(Uri.parse(url), headers: headers);

      debugPrint('📨 [START ROUTE] Response Status: ${response.statusCode}');
      debugPrint('📦 [START ROUTE] Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        debugPrint('✅ [START ROUTE] Success! Route started.');
        debugPrint('📋 [START ROUTE] Route data: ${data['route']}');
        return {
          'success': true,
          'route': DeliveryRoute.fromJson(data['route']),
          'message': data['message'] ?? 'Route started successfully',
        };
      } else {
        final errorBody = response.body;
        debugPrint('❌ [START ROUTE] Failed with status ${response.statusCode}');
        debugPrint('❌ [START ROUTE] Error body: $errorBody');

        try {
          final errorData = json.decode(errorBody);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Failed to start route',
          };
        } catch (e) {
          return {'success': false, 'message': 'Failed to start route'};
        }
      }
    } catch (e, stackTrace) {
      debugPrint('💥 [START ROUTE] Exception caught: $e');
      debugPrint('📍 [START ROUTE] Stack trace: $stackTrace');
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Start navigation (active -> delivering)
  Future<Map<String, dynamic>> startNavigation(int routeId) async {
    try {
      debugPrint(
        '🚗 [START NAVIGATION] Starting navigation for route ID: $routeId',
      );
      final headers = await AuthService.getAuthHeaders();

      final url = '$baseUrl/routes/$routeId/start-navigation';
      debugPrint('📡 [START NAVIGATION] URL: $url');

      final response = await http.post(Uri.parse(url), headers: headers);

      debugPrint(
        '📨 [START NAVIGATION] Response Status: ${response.statusCode}',
      );
      debugPrint('📦 [START NAVIGATION] Response Body: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        debugPrint('✅ [START NAVIGATION] Success! Navigation started.');
        return {
          'success': true,
          'route': DeliveryRoute.fromJson(data['route']),
          'message': data['message'] ?? 'Navigation started successfully',
        };
      } else {
        final errorBody = response.body;
        debugPrint(
          '❌ [START NAVIGATION] Failed with status ${response.statusCode}',
        );
        debugPrint('❌ [START NAVIGATION] Error body: $errorBody');

        try {
          final errorData = json.decode(errorBody);
          return {
            'success': false,
            'message': errorData['message'] ?? 'Failed to start navigation',
          };
        } catch (e) {
          return {'success': false, 'message': 'Failed to start navigation'};
        }
      }
    } catch (e, stackTrace) {
      debugPrint('💥 [START NAVIGATION] Exception caught: $e');
      debugPrint('📍 [START NAVIGATION] Stack trace: $stackTrace');
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Complete single order in route
  Future<Map<String, dynamic>> completeOrderInRoute(int orderId) async {
    try {
      final headers = await AuthService.getAuthHeaders();

      final response = await http.put(
        Uri.parse('$baseUrl/orders/$orderId/complete'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'order': OrderModel.fromJson(data['order']),
          'message': data['message'] ?? 'Order completed successfully',
        };
      } else {
        return {'success': false, 'message': 'Failed to complete order'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Complete entire route
  Future<Map<String, dynamic>> completeRoute(int routeId) async {
    try {
      final headers = await AuthService.getAuthHeaders();

      final response = await http.post(
        Uri.parse('$baseUrl/routes/$routeId/complete'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'route': DeliveryRoute.fromJson(data['route']),
          'message': data['message'] ?? 'Route completed successfully',
        };
      } else {
        return {'success': false, 'message': 'Failed to complete route'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Get route summary/statistics
  Future<Map<String, dynamic>> getRouteSummary(int routeId) async {
    try {
      final headers = await AuthService.getAuthHeaders();

      final response = await http.get(
        Uri.parse('$baseUrl/routes/$routeId/summary'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {'success': true, 'summary': data['summary']};
      } else {
        return {'success': false, 'message': 'Failed to fetch route summary'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }
}
