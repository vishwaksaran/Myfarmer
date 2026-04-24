import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_header.dart';
import '../../providers/auth_provider.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AppAuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true,
            snap: true,
            backgroundColor: AppColors.surface,
            toolbarHeight: 60,
            flexibleSpace: const AppHeader(),
          ),
          if (!auth.isLoggedIn)
            SliverFillRemaining(child: _LoginPromptSection())
          else
            SliverList(
              delegate: SliverChildListDelegate([
                _DashboardHeader(user: auth.user!),
                _QuickStats(),
                _RecentActivity(),
                _MyListings(),
                _OrdersSection(),
                const SizedBox(height: 20),
              ]),
            ),
        ],
      ),
    );
  }
}

class _LoginPromptSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(40),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(color: AppColors.statIconBg, shape: BoxShape.circle),
              child: const Icon(Icons.person_outline_rounded, size: 50, color: AppColors.primary),
            ),
            const SizedBox(height: 24),
            const Text('Sign in to access\nyour dashboard', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: AppColors.textPrimary), textAlign: TextAlign.center),
            const SizedBox(height: 8),
            const Text('View your listings, orders, and more', style: TextStyle(color: AppColors.textSecondary, fontSize: 14), textAlign: TextAlign.center),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pushNamed(context, '/login'),
                child: const Text('Login / Sign Up'),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {},
                child: const Text('Continue as Guest'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardHeader extends StatelessWidget {
  final UserProfile user;
  const _DashboardHeader({required this.user});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF1F3A1D), Color(0xFF2C5926)], begin: Alignment.topLeft, end: Alignment.bottomRight),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: Colors.white.withOpacity(0.2),
            child: Text(user.fullName.substring(0, 1).toUpperCase(), style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w800)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Welcome back,', style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 12)),
                Text(user.fullName, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.verified_rounded, size: 14, color: Color(0xFF8CDA4F)),
                    const SizedBox(width: 4),
                    Text(user.role.toUpperCase(), style: const TextStyle(color: Color(0xFF8CDA4F), fontSize: 11, fontWeight: FontWeight.w600)),
                  ],
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.edit_outlined, color: Colors.white54, size: 20),
          ),
        ],
      ),
    );
  }
}

class _QuickStats extends StatelessWidget {
  final List<Map<String, dynamic>> _stats = const [
    {'icon': Icons.list_alt_rounded, 'value': '3', 'label': 'My Listings', 'color': Color(0xFF2563EB)},
    {'icon': Icons.shopping_bag_outlined, 'value': '5', 'label': 'My Orders', 'color': Color(0xFFD97706)},
    {'icon': Icons.star_rounded, 'value': '4.8', 'label': 'Avg Rating', 'color': Color(0xFFF59E0B)},
    {'icon': Icons.account_balance_wallet_rounded, 'value': '₹2.4k', 'label': 'Earnings', 'color': Color(0xFF16A34A)},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 2.0,
        ),
        itemCount: _stats.length,
        itemBuilder: (ctx, i) => Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.divider),
            boxShadow: [BoxShadow(color: AppColors.cardShadow, blurRadius: 4, offset: const Offset(0, 2))],
          ),
          child: Row(
            children: [
              Container(
                width: 36,
                height: 36,
                decoration: BoxDecoration(
                  color: (_stats[i]['color'] as Color).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(_stats[i]['icon'] as IconData, color: _stats[i]['color'] as Color, size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(_stats[i]['value'] as String, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                    Text(_stats[i]['label'] as String, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RecentActivity extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final activities = [
      {'icon': Icons.visibility_rounded, 'text': 'Your listing "Gir Cow" got 12 views', 'time': '2h ago', 'color': AppColors.primary},
      {'icon': Icons.message_rounded, 'text': 'New enquiry for Wheat Seeds', 'time': '5h ago', 'color': Color(0xFF2563EB)},
      {'icon': Icons.shopping_bag_rounded, 'text': 'Order #1234 delivered successfully', 'time': '1d ago', 'color': AppColors.success},
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Recent Activity', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.divider),
            ),
            child: Column(
              children: activities.asMap().entries.map((entry) {
                final i = entry.key;
                final a = entry.value;
                return Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      child: Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(
                              color: (a['color'] as Color).withOpacity(0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(a['icon'] as IconData, color: a['color'] as Color, size: 18),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Text(a['text'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500), maxLines: 2)),
                          const SizedBox(width: 8),
                          Text(a['time'] as String, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    if (i < activities.length - 1) const Divider(height: 1, indent: 14, endIndent: 14),
                  ],
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

class _MyListings extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final listings = [
      {'name': 'Gir Cow', 'price': '₹95,000', 'views': '124', 'status': 'Active', 'icon': Icons.pets_rounded},
      {'name': 'Mahindra 575 DI', 'price': '₹7.5L', 'views': '89', 'status': 'Active', 'icon': Icons.agriculture_rounded},
      {'name': 'Wheat (200 qtl)', 'price': '₹2,100/qtl', 'views': '45', 'status': 'Pending', 'icon': Icons.grass_rounded},
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('My Listings', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const Spacer(),
              TextButton(onPressed: () {}, child: const Text('View All', style: TextStyle(color: AppColors.primary))),
            ],
          ),
          const SizedBox(height: 8),
          ...listings.map((l) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.divider),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: AppColors.statIconBg, borderRadius: BorderRadius.circular(12)),
                  child: Icon(l['icon'] as IconData, color: AppColors.primary, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(l['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                      Text(l['price'] as String, style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600, fontSize: 13)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: l['status'] == 'Active' ? AppColors.statIconBg : Colors.orange.shade50,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        l['status'] as String,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: l['status'] == 'Active' ? AppColors.success : Colors.orange,
                        ),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(Icons.visibility_rounded, size: 12, color: AppColors.textSecondary),
                        const SizedBox(width: 2),
                        Text('${l['views']} views', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }
}

class _OrdersSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final orders = [
      {'id': '#ORD-1234', 'item': 'DAP Fertilizer 50kg', 'date': 'Apr 20, 2026', 'status': 'Delivered', 'amount': '₹1,350'},
      {'id': '#ORD-1198', 'item': 'Hybrid Tomato Seeds', 'date': 'Apr 15, 2026', 'status': 'Processing', 'amount': '₹299'},
    ];

    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('My Orders', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const Spacer(),
              TextButton(onPressed: () {}, child: const Text('View All', style: TextStyle(color: AppColors.primary))),
            ],
          ),
          const SizedBox(height: 8),
          ...orders.map((o) => Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.divider),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: AppColors.statIconBg, borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.shopping_bag_outlined, color: AppColors.primary, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(o['id'] as String, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      Text(o['item'] as String, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                      Text(o['date'] as String, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(o['amount'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14, color: AppColors.primary)),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: o['status'] == 'Delivered' ? AppColors.statIconBg : Colors.blue.shade50,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        o['status'] as String,
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: o['status'] == 'Delivered' ? AppColors.success : Colors.blue,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          )),
        ],
      ),
    );
  }
}
