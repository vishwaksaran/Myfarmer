import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class LocationBarWidget extends StatelessWidget {
  final String? location;
  final VoidCallback? onTap;

  const LocationBarWidget({super.key, this.location, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap ?? () => _showLocationSheet(context),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.divider),
          boxShadow: [BoxShadow(color: AppColors.cardShadow, blurRadius: 4, offset: const Offset(0, 1))],
        ),
        child: Row(
          children: [
            const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 18),
            const SizedBox(width: 8),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text('Nearby', style: TextStyle(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
                  Text(
                    location ?? 'Enable location access',
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                  ),
                ],
              ),
            ),
            const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.textSecondary, size: 20),
          ],
        ),
      ),
    );
  }

  void _showLocationSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Container(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Select Location', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              TextField(
                decoration: InputDecoration(
                  hintText: 'Search city, village...',
                  prefixIcon: const Icon(Icons.search_rounded),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),
              ListTile(
                leading: const Icon(Icons.my_location_rounded, color: AppColors.primary),
                title: const Text('Use Current Location', style: TextStyle(fontWeight: FontWeight.w600)),
                subtitle: const Text('Enable GPS to auto-detect'),
                onTap: () => Navigator.pop(ctx),
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}
