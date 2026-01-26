import 'dart:async';
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

    return Scaffold(
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Center(child: Icon(LucideIcons.truck, size: 48)),
                const Gap(24),
                const Text(
                  'Login Pengemudi',
                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.w600),
                  textAlign: TextAlign.center,
                ),
                const Gap(8),
                const Text(
                  'Masuk ke akun pengemudi Anda',
                  style: TextStyle(color: material.Colors.grey),
                  textAlign: TextAlign.center,
                ),
                const Gap(32),

                if (authState.error != null)
                  Alert.destructive(
                    leading: const Icon(LucideIcons.circleAlert),
                    title: const Text('Gagal Masuk'),
                    content: Text(authState.error!),
                  ).withPadding(bottom: 24),

                Form(
                  onSubmit: (context, values) async {
                    final email = _emailKey[values] ?? '';
                    final password = _passwordKey[values] ?? '';
                    await _handleLogin(email, password);
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      FormField(
                        key: _emailKey,
                        label: const Text('Email'),
                        validator: const EmailValidator(
                          message: 'Email tidak valid',
                        ),
                        child: const TextField(
                          placeholder: Text('nama@contoh.com'),
                        ),
                      ),
                      const Gap(16),
                      FormField(
                        key: _passwordKey,
                        label: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Kata Sandi'),
                            Button.ghost(
                              onPressed: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                              child: Icon(
                                _obscurePassword
                                    ? LucideIcons.eye
                                    : LucideIcons.eyeOff,
                                size: 16,
                              ),
                            ),
                          ],
                        ),
                        validator: const LengthValidator(
                          min: 6,
                          message: 'Kata sandi minimal 6 karakter',
                        ),
                        child: TextField(obscureText: _obscurePassword),
                      ),
                      const Gap(24),
                      FormErrorBuilder(
                        builder: (context, errors, child) {
                          return Button.primary(
                            onPressed: authState.isLoading
                                ? null
                                : () => context.submitForm(),
                            child: authState.isLoading
                                ? const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  )
                                : const Text('Masuk'),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
