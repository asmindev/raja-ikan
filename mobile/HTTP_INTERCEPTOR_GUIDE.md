# HTTP Interceptor Usage Guide

## Auto Logout pada Token Invalid (401)

Service `HttpInterceptor` secara otomatis menangani response 401 Unauthorized dan melakukan logout + redirect ke login page.

### Setup (Sudah dilakukan):

1. ✅ Register `navigatorKey` di `main.dart`
2. ✅ Tambahkan `/login` route

### Cara Penggunaan:

**Sebelum (manual http):**

```dart
import 'package:http/http.dart' as http;
import 'auth_service.dart';

final headers = await AuthService.getAuthHeaders();
final response = await http.get(
  Uri.parse('$baseUrl/endpoint'),
  headers: headers,
);
```

**Sesudah (dengan interceptor):**

```dart
import '../services/http_interceptor.dart';

// Otomatis handle 401 dan logout
final response = await HttpInterceptor.get('$baseUrl/endpoint');
```

### Methods Available:

-   `HttpInterceptor.get(url)` - GET request
-   `HttpInterceptor.post(url, body: {...})` - POST request
-   `HttpInterceptor.put(url, body: {...})` - PUT request
-   `HttpInterceptor.delete(url)` - DELETE request

### Behavior pada 401:

1. Clear token & user data dari storage
2. Show SnackBar: "Sesi berakhir. Silakan login kembali."
3. Navigate ke `/login` dan clear navigation stack
4. User harus login ulang

### Contoh Update Service:

**RouteService - Start Navigation:**

```dart
// Dari:
final response = await http.post(
  Uri.parse(url),
  headers: headers,
);

// Jadi:
final response = await HttpInterceptor.post(url);
```

Semua service yang sudah pakai `AuthService.getAuthHeaders()` bisa langsung diganti dengan `HttpInterceptor`.
