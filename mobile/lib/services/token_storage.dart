import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class TokenStorage {
  static const _storage = FlutterSecureStorage();
  static const _tokenKey = 'auth_token';
  static const _userKey = 'user_data';

  // Fallback to SharedPreferences if SecureStorage fails
  static Future<SharedPreferences> _getPrefs() async {
    return await SharedPreferences.getInstance();
  }

  // Save token securely (with fallback)
  static Future<void> saveToken(String token) async {
    try {
      await _storage.write(key: _tokenKey, value: token);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await _getPrefs();
      await prefs.setString(_tokenKey, token);
    }
  }

  // Get token (with fallback)
  static Future<String?> getToken() async {
    try {
      return await _storage.read(key: _tokenKey);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await _getPrefs();
      return prefs.getString(_tokenKey);
    }
  }

  // Delete token (with fallback)
  static Future<void> deleteToken() async {
    try {
      await _storage.delete(key: _tokenKey);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await _getPrefs();
      await prefs.remove(_tokenKey);
    }
  }

  // Save user data (with fallback)
  static Future<void> saveUserData(String userData) async {
    try {
      await _storage.write(key: _userKey, value: userData);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await _getPrefs();
      await prefs.setString(_userKey, userData);
    }
  }

  // Get user data (with fallback)
  static Future<String?> getUserData() async {
    try {
      return await _storage.read(key: _userKey);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await _getPrefs();
      return prefs.getString(_userKey);
    }
  }

  // Delete user data (with fallback)
  static Future<void> deleteUserData() async {
    try {
      await _storage.delete(key: _userKey);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await _getPrefs();
      await prefs.remove(_userKey);
    }
  }

  // Clear all auth data (with fallback)
  static Future<void> clearAll() async {
    try {
      await _storage.delete(key: _tokenKey);
      await _storage.delete(key: _userKey);
    } catch (e) {
      // Fallback to SharedPreferences
      final prefs = await _getPrefs();
      await prefs.remove(_tokenKey);
      await prefs.remove(_userKey);
    }
  }

  // Check if user is authenticated
  static Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }
}
