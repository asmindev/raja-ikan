import 'package:flutter/foundation.dart';

class ApiConfig {
  static const String _envBase = String.fromEnvironment('API_BASE_URL');
  static const String _envWireless = String.fromEnvironment(
    'API_WIRELESS_ANDROID',
    defaultValue: 'false',
  );

  static String get baseUrl {
    // if (_envBase.isNotEmpty) return _envBase;
    if (kIsWeb) return 'http://localhost:8000';
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
        // Untuk HP fisik via USB, gunakan IP komputer di jaringan lokal
        // Untuk emulator, gunakan 10.0.2.2
        // return 'http://192.168.1.5:8000'; // IP komputer untuk device fisik
        return 'https://rajaikan.zettdev.my.id';
        // return 'http://10.0.2.2:8000'; // Uncomment ini untuk Android emulator
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
      case TargetPlatform.linux:
      case TargetPlatform.fuchsia:
        return 'http://localhost:8000';
    }
  }
}
