import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../theme/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';
import 'miraitu_logo.dart';

class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  final VoidCallback? onMenuTap;
  final VoidCallback? onCartTap;
  final VoidCallback? onLanguageTap;

  const AppHeader({
    super.key,
    this.onMenuTap,
    this.onCartTap,
    this.onLanguageTap,
  });

  @override
  Size get preferredSize => const Size.fromHeight(60);

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AppAuthProvider>();
    final cart = context.watch<CartProvider>();

    return Container(
      height: preferredSize.height + MediaQuery.of(context).padding.top,
      padding: EdgeInsets.only(top: MediaQuery.of(context).padding.top),
      decoration: BoxDecoration(
        color: AppColors.surface,
        boxShadow: [
          BoxShadow(
            color: AppColors.cardShadow,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        child: Row(
          children: [
            const MiraituLogo(size: 32),
            const Spacer(),
            // Language toggle
            IconButton(
              onPressed: onLanguageTap ?? () => _showLanguageSheet(context),
              icon: const Icon(Icons.translate_rounded),
              color: AppColors.textSecondary,
              iconSize: 22,
              tooltip: 'Change Language',
              padding: const EdgeInsets.all(6),
              constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            ),
            // Cart
            Stack(
              clipBehavior: Clip.none,
              children: [
                IconButton(
                  onPressed: onCartTap ?? () => Navigator.pushNamed(context, '/cart'),
                  icon: const Icon(Icons.shopping_cart_outlined),
                  color: AppColors.textSecondary,
                  iconSize: 22,
                  padding: const EdgeInsets.all(6),
                  constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                ),
                if (cart.totalItems > 0)
                  Positioned(
                    right: 4,
                    top: 4,
                    child: Container(
                      padding: const EdgeInsets.all(3),
                      decoration: const BoxDecoration(
                        color: AppColors.error,
                        shape: BoxShape.circle,
                      ),
                      child: Text(
                        '${cart.totalItems}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(width: 4),
            // Login / Avatar
            if (!auth.isLoggedIn)
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/login'),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: AppColors.loginButtonBg,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Text(
                    'Login',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              )
            else
              GestureDetector(
                onTap: () => Navigator.pushNamed(context, '/profile'),
                child: CircleAvatar(
                  radius: 16,
                  backgroundColor: AppColors.primary,
                  child: Text(
                    auth.user?.fullName.substring(0, 1).toUpperCase() ?? 'U',
                    style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700),
                  ),
                ),
              ),
            const SizedBox(width: 4),
            // Hamburger menu
            IconButton(
              onPressed: onMenuTap ?? () => _showDrawerMenu(context),
              icon: const Icon(Icons.menu_rounded),
              color: AppColors.textSecondary,
              iconSize: 24,
              padding: const EdgeInsets.all(6),
              constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
            ),
          ],
        ),
      ),
    );
  }

  void _showLanguageSheet(BuildContext context) {
    const languages = [
      ('English', 'en'), ('हिंदी', 'hi'), ('తెలుగు', 'te'),
      ('தமிழ்', 'ta'), ('ಕನ್ನಡ', 'kn'), ('मराठी', 'mr'),
      ('বাংলা', 'bn'), ('ગુજરાતી', 'gu'),
    ];
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Select Language', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: languages.map((lang) => GestureDetector(
                onTap: () => Navigator.pop(ctx),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: lang.$2 == 'en' ? AppColors.primary : AppColors.statIconBg,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: Text(
                    lang.$1,
                    style: TextStyle(
                      color: lang.$2 == 'en' ? Colors.white : AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                ),
              )).toList(),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  void _showDrawerMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (_, controller) => _DrawerMenu(scrollController: controller),
      ),
    );
  }
}

class _DrawerMenu extends StatelessWidget {
  final ScrollController scrollController;
  const _DrawerMenu({required this.scrollController});

  @override
  Widget build(BuildContext context) {
    final menuItems = [
      (Icons.home_outlined, 'Home', '/'),
      (Icons.agriculture_outlined, 'Machinery', '/machinery'),
      (Icons.grass_outlined, 'Crops', '/crops'),
      (Icons.pets_outlined, 'Livestock', '/livestock'),
      (Icons.account_balance_outlined, 'Finance', '/finance'),
      (Icons.shopping_bag_outlined, 'Shop', '/shop'),
      (Icons.build_outlined, 'Services', '/services'),
      (Icons.people_outline, 'Community', '/community'),
      (Icons.calculate_outlined, 'Toolbox', '/toolbox'),
      (Icons.person_outline, 'Profile', '/profile'),
      (Icons.settings_outlined, 'Settings', '/settings'),
    ];

    return ListView(
      controller: scrollController,
      padding: const EdgeInsets.all(20),
      children: [
        Row(
          children: [
            const MiraituLogo(size: 28),
            const Spacer(),
            IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
          ],
        ),
        const SizedBox(height: 16),
        ...menuItems.map((item) => ListTile(
          leading: Icon(item.$1, color: AppColors.primary),
          title: Text(item.$2, style: const TextStyle(fontWeight: FontWeight.w600)),
          onTap: () {
            Navigator.pop(context);
            Navigator.pushNamed(context, item.$3);
          },
          contentPadding: EdgeInsets.zero,
        )),
        const SizedBox(height: 20),
      ],
    );
  }
}
