import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/user.dart';
import 'token_storage.dart';

class AuthService {
  static String get baseUrl => '${ApiConfig.baseUrl}/api/v1/auth';

  // Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: json.encode({'email': email, 'password': password}),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200 && data['success'] == true) {
        // Save token and user data
        final token = data['data']['token'] as String;
        final user = UserModel.fromJson(data['data']['user']);

        await TokenStorage.saveToken(token);
        await TokenStorage.saveUserData(json.encode(user.toJson()));

        return {
          'success': true,
          'message': data['message'] ?? 'Login successful',
          'user': user,
        };
      } else {
        return {'success': false, 'message': data['message'] ?? 'Login failed'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Get current user
  Future<UserModel?> getCurrentUser() async {
    try {
      final userData = await TokenStorage.getUserData();
      if (userData != null) {
        return UserModel.fromJson(json.decode(userData));
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  // Check if authenticated
  Future<bool> isAuthenticated() async {
    return await TokenStorage.isAuthenticated();
  }

  // Get me (refresh user data from API)
  Future<Map<String, dynamic>> me() async {
    try {
      final token = await TokenStorage.getToken();
      if (token == null) {
        return {'success': false, 'message': 'Not authenticated'};
      }

      final response = await http.get(
        Uri.parse('$baseUrl/me'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final user = UserModel.fromJson(data['data']['user']);

        // Update stored user data
        await TokenStorage.saveUserData(json.encode(user.toJson()));

        return {'success': true, 'user': user};
      } else {
        return {'success': false, 'message': 'Failed to get user data'};
      }
    } catch (e) {
      return {'success': false, 'message': 'Error: $e'};
    }
  }

  // Logout
  Future<Map<String, dynamic>> logout() async {
    try {
      final token = await TokenStorage.getToken();

      if (token != null) {
        // Call logout endpoint
        await http.post(
          Uri.parse('$baseUrl/logout'),
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer $token',
          },
        );
      }

      // Clear local storage regardless of API call result
      await TokenStorage.clearAll();

      return {'success': true, 'message': 'Logout successful'};
    } catch (e) {
      // Clear local storage even if API call fails
      await TokenStorage.clearAll();

      return {'success': true, 'message': 'Logout successful'};
    }
  }

  // Get auth headers for API calls
  static Future<Map<String, String>> getAuthHeaders() async {
    final token = await TokenStorage.getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }
}
