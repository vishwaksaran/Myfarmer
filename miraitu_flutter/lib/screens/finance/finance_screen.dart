import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_header.dart';

class FinanceScreen extends StatelessWidget {
  const FinanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final schemes = [
      {'icon': Icons.credit_card_rounded, 'title': 'Kisan Credit Card (KCC)', 'desc': 'Get up to ₹3 Lakhs credit for farming needs', 'tag': 'Popular', 'color': Color(0xFF2563EB), 'rate': '4% p.a.'},
      {'icon': Icons.account_balance_rounded, 'title': 'PM Kisan Yojana', 'desc': '₹6,000 per year direct benefit transfer', 'tag': 'Government', 'color': Color(0xFF16A34A), 'rate': 'Free'},
      {'icon': Icons.shield_rounded, 'title': 'Crop Insurance (PMFBY)', 'desc': 'Protect your crops against natural calamities', 'tag': 'Insurance', 'color': Color(0xFF7C3AED), 'rate': '2-5%'},
      {'icon': Icons.solar_power_rounded, 'title': 'PM-KUSUM Solar Scheme', 'desc': 'Solar pump subsidy up to 90% for farmers', 'tag': 'Subsidy', 'color': Color(0xFFD97706), 'rate': '90% subsidy'},
      {'icon': Icons.home_rounded, 'title': 'Agri Infrastructure Fund', 'desc': 'Loan for cold storage, godown construction', 'tag': 'Infrastructure', 'color': Color(0xFF059669), 'rate': '3% interest'},
      {'icon': Icons.group_rounded, 'title': 'FPO Finance Support', 'desc': 'Credit facility for Farmer Producer Organizations', 'tag': 'FPO', 'color': Color(0xFFDC2626), 'rate': '6% p.a.'},
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            floating: true, snap: true,
            backgroundColor: AppColors.surface,
            toolbarHeight: 60,
            flexibleSpace: const AppHeader(),
          ),
          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Hero
                Container(
                  margin: const EdgeInsets.all(16),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [Color(0xFF1F3A1D), Color(0xFF2C5926)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                        child: const Text('FARM FINANCE', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                      ),
                      const SizedBox(height: 12),
                      const Text('Government Schemes\n& Farm Loans', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800, height: 1.3)),
                      const SizedBox(height: 8),
                      const Text('Access ₹10,000+ crore in subsidies, loans & government benefits', style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4)),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          _HeroStat('₹3L+', 'KCC Limit'),
                          const SizedBox(width: 20),
                          _HeroStat('₹6,000', 'PM Kisan'),
                          const SizedBox(width: 20),
                          _HeroStat('90%', 'Solar Subsidy'),
                        ],
                      ),
                    ],
                  ),
                ),
                // Calculator banner
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFFBEB),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFFDE68A)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.calculate_rounded, color: Color(0xFFD97706), size: 28),
                        const SizedBox(width: 12),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Check Loan Eligibility', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                              Text('Calculate your eligible loan amount', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                            ],
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () {},
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFFD97706),
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          ),
                          child: const Text('Check Now', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text('Available Schemes', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                ),
                const SizedBox(height: 12),
                ...schemes.map((scheme) => Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                  child: _SchemeCard(scheme: scheme),
                )),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroStat extends StatelessWidget {
  final String value;
  final String label;
  const _HeroStat(this.value, this.label);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 18)),
        Text(label, style: const TextStyle(color: Colors.white60, fontSize: 11)),
      ],
    );
  }
}

class _SchemeCard extends StatelessWidget {
  final Map<String, dynamic> scheme;
  const _SchemeCard({required this.scheme});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
        boxShadow: [BoxShadow(color: AppColors.cardShadow, blurRadius: 4, offset: const Offset(0, 2))],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: (scheme['color'] as Color).withOpacity(0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(scheme['icon'] as IconData, color: scheme['color'] as Color, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(scheme['title'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14))),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: (scheme['color'] as Color).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(scheme['tag'] as String, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: scheme['color'] as Color)),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(scheme['desc'] as String, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.percent_rounded, size: 14, color: AppColors.success),
                    const SizedBox(width: 4),
                    Text('Interest: ${scheme['rate']}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.success)),
                    const Spacer(),
                    GestureDetector(
                      onTap: () {},
                      child: const Text('Apply Now →', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primary)),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
