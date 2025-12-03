import 'package:shadcn_flutter/shadcn_flutter.dart';

class InfoRow extends StatelessWidget {
  final IconData icon;
  final String value;

  const InfoRow({super.key, required this.icon, required this.value});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 18, color: const Color(0xFF059669)),
        const Gap(12),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
          ),
        ),
      ],
    );
  }
}
