import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart' as material;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shadcn_flutter/shadcn_flutter.dart';
import '../../providers/auth_provider.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({super.key});

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _emailKey = const TextFieldKey('email');
  final _passwordKey = const TextFieldKey('password');
  bool _obscurePassword = true;

  Future<void> _handleLogin(String email, String password) async {
    final success = await ref
        .read(authProvider.notifier)
        .login(email, password);

    if (success && mounted) {
      Navigator.of(context).pushReplacementNamed('/');
    }
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authProvider);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      child: material.Container(
        decoration: material.BoxDecoration(
          gradient: material.LinearGradient(
            begin: material.Alignment.topLeft,
            end: material.Alignment.bottomRight,
            colors: isDark
                ? [
                    const material.Color(0xFF0F172A),
                    const material.Color(0xFF1E293B),
                  ]
                : [
                    const material.Color(0xFFF0FDF4),
                    const material.Color(0xFFDCFCE7),
                  ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 16.0),
              child: material.Container(
                constraints: const material.BoxConstraints(maxWidth: 400),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Compact Logo with Modern Shadow
                    Center(
                      child: material.Container(
                        width: 64,
                        height: 64,
                        decoration: material.BoxDecoration(
                          gradient: const material.LinearGradient(
                            colors: [
                              material.Color(0xFF10B981),
                              material.Color(0xFF059669),
                            ],
                            begin: material.Alignment.topLeft,
                            end: material.Alignment.bottomRight,
                          ),
                          borderRadius: material.BorderRadius.circular(16),
                          boxShadow: [
                            material.BoxShadow(
                              color: const material.Color(0xFF10B981).withOpacity(0.4),
                              blurRadius: 16,
                              offset: const material.Offset(0, 4),
                            ),
                          ],
                        ),
                        child: const Icon(
                          LucideIcons.truck,
                          size: 32,
                          color: material.Colors.white,
                        ),
                      ),
                    ),
                    const Gap(20),

                    // Compact Title
                    const Text(
                      'Driver Login',
                      style: TextStyle(fontSize: 26, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                    const Gap(6),
                    Text(
                      'Secure access for drivers',
                      style: TextStyle(
                        fontSize: 14,
                        color: isDark
                            ? material.Colors.white70
                            : material.Colors.black54,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const Gap(28),

                    // Error Alert - Compact
                    if (authState.error != null)
                      Alert.destructive(
                        leading: const Icon(LucideIcons.circleAlert, size: 18),
                        title: const Text('Login Failed', style: TextStyle(fontSize: 14)),
                        content: Text(authState.error!, style: const TextStyle(fontSize: 13)),
                      ).withPadding(bottom: 16),

                    // Glassmorphic Card
                    material.Container(
                      decoration: material.BoxDecoration(
                        color: isDark
                            ? material.Colors.white.withOpacity(0.05)
                            : material.Colors.white.withOpacity(0.7),
                        borderRadius: material.BorderRadius.circular(16),
                        border: material.Border.all(
                          color: isDark
                              ? material.Colors.white.withOpacity(0.1)
                              : material.Colors.white.withOpacity(0.5),
                          width: 1,
                        ),
                        boxShadow: [
                          material.BoxShadow(
                            color: material.Colors.black.withOpacity(0.05),
                            blurRadius: 20,
                            offset: const material.Offset(0, 10),
                          ),
                        ],
                      ),
                      child: material.ClipRRect(
                        borderRadius: material.BorderRadius.circular(16),
                        child: material.BackdropFilter(
                          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                          child: Padding(
                            padding: const EdgeInsets.all(20),
                            child: Form(
                              onSubmit: (context, values) async {
                                final email = _emailKey[values] ?? '';
                                final password = _passwordKey[values] ?? '';
                                await _handleLogin(email, password);
                              },
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  // Email Field - Clean Design
                                  FormField(
                                    key: _emailKey,
                                    label: Row(
                                      children: [
                                        Icon(
                                          LucideIcons.mail,
                                          size: 14,
                                          color: isDark
                                              ? material.Colors.white70
                                              : material.Colors.black87,
                                        ),
                                        const Gap(6),
                                        const Text('Email', style: TextStyle(fontSize: 14)),
                                      ],
                                    ),
                                    hint: const Text('driver@example.com', style: TextStyle(fontSize: 13)),
                                    validator: const EmailValidator(),
                                    child: const TextField(initialValue: ''),
                                  ),
                                  const Gap(16),

                                  // Password Field - Clean Design with Toggle
                                  FormField(
                                    key: _passwordKey,
                                    label: Row(
                                      children: [
                                        Icon(
                                          LucideIcons.lock,
                                          size: 14,
                                          color: isDark
                                              ? material.Colors.white70
                                              : material.Colors.black87,
                                        ),
                                        const Gap(6),
                                        const Text('Password', style: TextStyle(fontSize: 14)),
                                        const Spacer(),
                                        material.InkWell(
                                          onTap: () {
                                            setState(() {
                                              _obscurePassword = !_obscurePassword;
                                            });
                                          },
                                          borderRadius: material.BorderRadius.circular(4),
                                          child: Padding(
                                            padding: const EdgeInsets.all(4),
                                            child: Icon(
                                              _obscurePassword
                                                  ? LucideIcons.eyeOff
                                                  : LucideIcons.eye,
                                              size: 14,
                                              color: isDark
                                                  ? material.Colors.white60
                                                  : material.Colors.black54,
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                    hint: const Text('Minimum 6 characters', style: TextStyle(fontSize: 13)),
                                    validator: const LengthValidator(
                                      min: 6,
                                      message: 'Password must be at least 6 characters',
                                    ),
                                    child: TextField(obscureText: _obscurePassword),
                                  ),
                                  const Gap(24),

                                  // Submit Button - Modern Gradient
                                  FormErrorBuilder(
                                    builder: (context, errors, child) {
                                      return material.Container(
                                        decoration: material.BoxDecoration(
                                          gradient: const material.LinearGradient(
                                            colors: [
                                              material.Color(0xFF10B981),
                                              material.Color(0xFF059669),
                                            ],
                                          ),
                                          borderRadius: material.BorderRadius.circular(8),
                                          boxShadow: authState.isLoading
                                              ? []
                                              : [
                                                  material.BoxShadow(
                                                    color: const material.Color(0xFF10B981)
                                                        .withOpacity(0.3),
                                                    blurRadius: 12,
                                                    offset: const material.Offset(0, 4),
                                                  ),
                                                ],
                                        ),
                                        child: material.Material(
                                          color: material.Colors.transparent,
                                          child: material.InkWell(
                                            onTap: authState.isLoading
                                                ? null
                                                : (errors.isEmpty
                                                      ? () => context.submitForm()
                                                      : null),
                                            borderRadius: material.BorderRadius.circular(8),
                                            child: material.Container(
                                              padding: const EdgeInsets.symmetric(vertical: 14),
                                              child: Row(
                                                mainAxisAlignment: MainAxisAlignment.center,
                                                children: [
                                                  if (authState.isLoading)
                                                    const material.SizedBox(
                                                      height: 18,
                                                      width: 18,
                                                      child: material.CircularProgressIndicator(
                                                        strokeWidth: 2,
                                                        valueColor: material.AlwaysStoppedAnimation<material.Color>(
                                                          material.Colors.white,
                                                        ),
                                                      ),
                                                    )
                                                  else
                                                    const Icon(
                                                      LucideIcons.logIn,
                                                      size: 18,
                                                      color: material.Colors.white,
                                                    ),
                                                  const Gap(8),
                                                  material.Text(
                                                    authState.isLoading ? 'Logging in...' : 'Login',
                                                    style: const material.TextStyle(
                                                      fontSize: 15,
                                                      fontWeight: material.FontWeight.w600,
                                                      color: material.Colors.white,
                                                    ),
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                  const Gap(20),

                                  // Info Alert - Compact
                                  material.Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: material.BoxDecoration(
                                      color: isDark
                                          ? const material.Color(0xFF3B82F6).withOpacity(0.1)
                                          : const material.Color(0xFFDBEAFE),
                                      borderRadius: material.BorderRadius.circular(8),
                                      border: material.Border.all(
                                        color: isDark
                                            ? const material.Color(0xFF3B82F6).withOpacity(0.3)
                                            : const material.Color(0xFF93C5FD),
                                        width: 1,
                                      ),
                                    ),
                                    child: Row(
                                      children: [
                                        Icon(
                                          LucideIcons.info,
                                          size: 16,
                                          color: isDark
                                              ? const material.Color(0xFF60A5FA)
                                              : const material.Color(0xFF3B82F6),
                                        ),
                                        const Gap(10),
                                        Expanded(
                                          child: material.Text(
                                            'Driver access only',
                                            style: material.TextStyle(
                                              fontSize: 13,
                                              color: isDark
                                                  ? const material.Color(0xFF93C5FD)
                                                  : const material.Color(0xFF1E40AF),
                                            ),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
