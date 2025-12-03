import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'token_storage.dart';
import 'auth_service.dart';

class HttpInterceptor {
  static final GlobalKey<NavigatorState> navigatorKey =
      GlobalKey<NavigatorState>();

  /// Make authenticated GET request with auto-logout on 401
  static Future<http.Response> get(String url) async {
    final headers = await AuthService.getAuthHeaders();
    final response = await http.get(Uri.parse(url), headers: headers);

    await _checkAuthError(response);
    return response;
  }

  /// Make authenticated POST request with auto-logout on 401
  static Future<http.Response> post(
    String url, {
    Map<String, dynamic>? body,
  }) async {
    final headers = await AuthService.getAuthHeaders();
    final response = await http.post(
      Uri.parse(url),
      headers: headers,
      body: body != null ? json.encode(body) : null,
    );

    await _checkAuthError(response);
    return response;
  }

  /// Make authenticated PUT request with auto-logout on 401
  static Future<http.Response> put(
    String url, {
    Map<String, dynamic>? body,
  }) async {
    final headers = await AuthService.getAuthHeaders();
    final response = await http.put(
      Uri.parse(url),
      headers: headers,
      body: body != null ? json.encode(body) : null,
    );

    await _checkAuthError(response);
    return response;
  }

  /// Make authenticated DELETE request with auto-logout on 401
  static Future<http.Response> delete(String url) async {
    final headers = await AuthService.getAuthHeaders();
    final response = await http.delete(Uri.parse(url), headers: headers);

    await _checkAuthError(response);
    return response;
  }

  /// Check if response is 401 Unauthorized and handle logout
  static Future<void> _checkAuthError(http.Response response) async {
    if (response.statusCode == 401) {
      debugPrint(
        '🔒 [HTTP INTERCEPTOR] 401 Unauthorized - Auto logout triggered',
      );

      // Clear token and user data FIRST
      await TokenStorage.clearAll();
      debugPrint('🗑️ [HTTP INTERCEPTOR] Token cleared');

      // Force navigation using navigatorKey (no context needed)
      final navigator = navigatorKey.currentState;
      if (navigator != null) {
        debugPrint('🚪 [HTTP INTERCEPTOR] Force navigating to /login...');

        // Force navigate to login and remove all routes
        navigator.pushNamedAndRemoveUntil('/login', (route) => false);

        debugPrint('✅ [HTTP INTERCEPTOR] Navigation to login completed');

        // Show snackbar after navigation
        Future.delayed(const Duration(milliseconds: 300), () {
          final context = navigatorKey.currentContext;
          if (context != null && context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Sesi berakhir. Silakan login kembali.'),
                backgroundColor: Colors.red,
                duration: Duration(seconds: 3),
              ),
            );
          }
        });
      } else {
        debugPrint('⚠️ [HTTP INTERCEPTOR] NavigatorState is null!');
      }
    }
  }
}
