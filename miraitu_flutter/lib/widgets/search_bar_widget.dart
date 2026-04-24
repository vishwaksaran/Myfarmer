import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class SearchBarWidget extends StatelessWidget {
  final String? hint;
  final VoidCallback? onTap;
  final ValueChanged<String>? onChanged;

  const SearchBarWidget({super.key, this.hint, this.onTap, this.onChanged});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 46,
        decoration: BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: AppColors.divider),
        ),
        child: Row(
          children: [
            const SizedBox(width: 14),
            const Icon(Icons.search_rounded, color: AppColors.textSecondary, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: TextField(
                onChanged: onChanged,
                onTap: onTap,
                readOnly: onTap != null,
                decoration: InputDecoration(
                  hintText: hint ?? 'Search livestock, tools, services...',
                  hintStyle: const TextStyle(color: AppColors.textHint, fontSize: 14),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  filled: false,
                  isDense: true,
                  contentPadding: EdgeInsets.zero,
                ),
                style: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
              ),
            ),
            Container(
              height: 30,
              width: 1,
              color: AppColors.divider,
              margin: const EdgeInsets.symmetric(vertical: 8),
            ),
            const SizedBox(width: 12),
            const Icon(Icons.tune_rounded, color: AppColors.textSecondary, size: 18),
            const SizedBox(width: 14),
          ],
        ),
      ),
    );
  }
}
