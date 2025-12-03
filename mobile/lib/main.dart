import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/navigation/main_navigation.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/screens/auth/login_page.dart';
import 'package:mobile/services/http_interceptor.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';

void main() {
  runApp(const ProviderScope(child: MainApp()));
}

class MainApp extends ConsumerWidget {
  const MainApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return ShadcnApp(
      navigatorKey: HttpInterceptor.navigatorKey,
      debugShowCheckedModeBanner: false,
      title: 'Delivery App',
      // Emerald/Green Theme
      theme: ThemeData(
        colorScheme: ColorSchemes.blue(ThemeMode.light),
        radius: 0.75,
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const AuthGate(),
        '/login': (context) => const LoginPage(),
      },
    );
  }
}

// Auth guard
class AuthGate extends ConsumerWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    // Show loading
    if (authState.isLoading) {
      return Scaffold(child: const Center(child: CircularProgressIndicator()));
    }

    // Show login or main app
    if (authState.isAuthenticated) {
      return const MainNavigation();
    } else {
      return const LoginPage();
    }
  }
}
