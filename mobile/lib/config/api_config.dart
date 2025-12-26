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
        // change to ngrok url if wireless android is enabled
        // return https://your-ngrok-url.ngrok.io
        return 'http://10.0.2.2:8000'; // Android emulator to host
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
      case TargetPlatform.linux:
      case TargetPlatform.fuchsia:
        return 'http://localhost:8000';
    }
  }
}
