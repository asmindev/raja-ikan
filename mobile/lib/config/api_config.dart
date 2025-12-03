import 'package:flutter/foundation.dart';

class ApiConfig {
  static const String _envBase = String.fromEnvironment('API_BASE_URL');

  static String get baseUrl {
    if (_envBase.isNotEmpty) return _envBase;
    if (kIsWeb) return 'http://localhost:8000';
    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
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
