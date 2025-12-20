import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/driver_stats.dart';
import 'token_storage.dart';

class DriverService {
  final String baseUrl = '${ApiConfig.baseUrl}/driver';

  /// Get driver statistics
  Future<Map<String, dynamic>> getStats() async {
    try {
      final token = await TokenStorage.getToken();
      if (token == null) {
        return {
          'success': false,
          'message': 'Not authenticated',
          'data': DriverStats.empty(),
        };
      }

      final response = await http
          .get(
            Uri.parse('$baseUrl/stats'),
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': 'Bearer $token',
            },
          )
          .timeout(const Duration(seconds: 10));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'success': true,
          'data': DriverStats.fromJson(data['data'] ?? {}),
        };
      } else {
        return {
          'success': false,
          'message': 'Failed to load stats',
          'data': DriverStats.empty(),
        };
      }
    } catch (e) {
      print('Error getting driver stats: $e');
      return {
        'success': false,
        'message': 'Error: $e',
        'data': DriverStats.empty(),
      };
    }
  }
}
