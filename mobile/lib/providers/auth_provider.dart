import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../services/auth_service.dart';

// Auth state
class AuthState {
  final bool isAuthenticated;
  final UserModel? user;
  final bool isLoading;
  final String? error;

  AuthState({
    this.isAuthenticated = false,
    this.user,
    this.isLoading = false,
    this.error,
  });

  AuthState copyWith({
    bool? isAuthenticated,
    UserModel? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error,
    );
  }
}

// Auth notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;

  AuthNotifier(this._authService) : super(AuthState()) {
    checkAuth();
  }

  // Check authentication status
  Future<void> checkAuth() async {
    state = state.copyWith(isLoading: true);

    try {
      final isAuth = await _authService.isAuthenticated();

      if (isAuth) {
        final user = await _authService.getCurrentUser();
        state = AuthState(isAuthenticated: true, user: user, isLoading: false);
      } else {
        state = AuthState(isAuthenticated: false, isLoading: false);
      }
    } catch (e) {
      state = AuthState(
        isAuthenticated: false,
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  // Login
  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final result = await _authService.login(email, password);

      if (result['success'] == true) {
        state = AuthState(
          isAuthenticated: true,
          user: result['user'] as UserModel?,
          isLoading: false,
        );
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          error: result['message'] as String?,
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  // Logout
  Future<void> logout() async {
    await _authService.logout();
    state = AuthState(isAuthenticated: false, isLoading: false);
  }

  // Refresh user data
  Future<void> refreshUser() async {
    final result = await _authService.me();
    if (result['success'] == true) {
      state = state.copyWith(user: result['user'] as UserModel?);
    }
  }
}

// Providers
final authServiceProvider = Provider<AuthService>((ref) => AuthService());

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});

// Computed providers
final currentUserProvider = Provider<UserModel?>((ref) {
  return ref.watch(authProvider).user;
});

final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});
