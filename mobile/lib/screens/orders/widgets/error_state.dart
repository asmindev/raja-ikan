import 'package:shadcn_flutter/shadcn_flutter.dart';

class ErrorState extends StatelessWidget {
  final String error;
  final VoidCallback onRetry;

  const ErrorState({super.key, required this.error, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Text('Failed to load orders').large(),
          const Gap(8),
          Text(error).small().muted(),
          const Gap(16),
          PrimaryButton(onPressed: onRetry, child: const Text('Retry')),
        ],
      ),
    );
  }
}
