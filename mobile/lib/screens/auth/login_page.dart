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
  // Define form field keys
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
      child: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: SizedBox(
              width: 480,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Logo/Icon - Emerald Theme (Centered)
                  Center(
                    child: material.Container(
                      width: 80,
                      height: 80,
                      decoration: material.BoxDecoration(
                        gradient: const material.LinearGradient(
                          colors: [
                            material.Color(0xFF10B981),
                            material.Color(0xFF059669),
                          ], // emerald-500 to emerald-600
                          begin: material.Alignment.topLeft,
                          end: material.Alignment.bottomRight,
                        ),
                        borderRadius: material.BorderRadius.circular(20),
                        boxShadow: [
                          material.BoxShadow(
                            color: const material.Color(
                              0xFF10B981,
                            ).withOpacity(0.3),
                            blurRadius: 20,
                            offset: const material.Offset(0, 8),
                          ),
                        ],
                      ),
                      child: const Icon(
                        LucideIcons.truck,
                        size: 40,
                        color: material.Colors.white,
                      ),
                    ),
                  ),
                  const Gap(32),

                  // Title
                  const Text(
                    'Driver Login',
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const Gap(8),
                  const Text(
                    'Enter your credentials to continue',
                    style: TextStyle(
                      fontSize: 16,
                      color: material.Colors.black54,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const Gap(48),

                  // Error Alert
                  if (authState.error != null)
                    Alert.destructive(
                      leading: const Icon(LucideIcons.circleAlert),
                      title: const Text('Login Failed'),
                      content: Text(authState.error!),
                    ).withPadding(bottom: 24),

                  // Form Card Container
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Form(
                        onSubmit: (context, values) async {
                          final email = _emailKey[values] ?? '';
                          final password = _passwordKey[values] ?? '';
                          await _handleLogin(email, password);
                        },
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            // Email Field
                            FormField(
                              key: _emailKey,
                              label: const Text('📧 Email'),
                              hint: const Text('driver@example.com'),
                              validator: const EmailValidator(),
                              child: const TextField(initialValue: ''),
                            ),
                            const Gap(20),

                            // Password Field with Toggle
                            FormField(
                              key: _passwordKey,
                              label: Row(
                                children: [
                                  const Text('🔒 Password'),
                                  const Spacer(),
                                  material.InkWell(
                                    onTap: () {
                                      setState(() {
                                        _obscurePassword = !_obscurePassword;
                                      });
                                    },
                                    child: Padding(
                                      padding: const EdgeInsets.all(4),
                                      child: Icon(
                                        _obscurePassword
                                            ? LucideIcons.eyeOff
                                            : LucideIcons.eye,
                                        size: 16,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              hint: const Text('Minimum 6 characters'),
                              validator: const LengthValidator(
                                min: 6,
                                message:
                                    'Password must be at least 6 characters',
                              ),
                              child: TextField(obscureText: _obscurePassword),
                            ),
                            const Gap(32),

                            // Submit Button with Loading State
                            FormErrorBuilder(
                              builder: (context, errors, child) {
                                return PrimaryButton(
                                  onPressed: authState.isLoading
                                      ? null
                                      : (errors.isEmpty
                                            ? () => context.submitForm()
                                            : null),
                                  size: ButtonSize.large,
                                  trailing: authState.isLoading
                                      ? const SizedBox(
                                          height: 16,
                                          width: 16,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : null,
                                  child: Text(
                                    authState.isLoading
                                        ? 'Logging in...'
                                        : 'Login',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                );
                              },
                            ),
                            const Gap(48),

                            // Info Alert - Emerald Theme
                            const Gap(24),
                            Alert(
                              leading: const Icon(LucideIcons.info),
                              title: const Text('Driver Access Only'),
                              content: const Text(
                                'Only accounts with driver role can access this application',
                              ),
                            ),
                          ],
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
    );
  }
}
