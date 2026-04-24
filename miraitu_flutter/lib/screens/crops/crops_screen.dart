import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_header.dart';
import '../../widgets/search_bar_widget.dart';

class CropsScreen extends StatefulWidget {
  const CropsScreen({super.key});

  @override
  State<CropsScreen> createState() => _CropsScreenState();
}

class _CropsScreenState extends State<CropsScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  final List<Map<String, dynamic>> _mandiPrices = [
    {'crop': 'Wheat', 'variety': 'Sharbati', 'mandi': 'Indore APMC', 'price': 2125, 'change': 2.3, 'unit': 'qtl', 'icon': '🌾'},
    {'crop': 'Rice (Paddy)', 'variety': 'Sona Masuri', 'mandi': 'Vijayawada', 'price': 1868, 'change': -0.8, 'unit': 'qtl', 'icon': '🌾'},
    {'crop': 'Soybean', 'variety': 'Yellow', 'mandi': 'Nagpur APMC', 'price': 4210, 'change': 1.5, 'unit': 'qtl', 'icon': '🫘'},
    {'crop': 'Cotton', 'variety': 'Long Staple', 'mandi': 'Akola APMC', 'price': 6500, 'change': 3.1, 'unit': 'qtl', 'icon': '🌸'},
    {'crop': 'Onion', 'variety': 'Red', 'mandi': 'Lasalgaon APMC', 'price': 1200, 'change': -5.2, 'unit': 'qtl', 'icon': '🧅'},
    {'crop': 'Tomato', 'variety': 'Hybrid', 'mandi': 'Kolar APMC', 'price': 800, 'change': 12.4, 'unit': 'qtl', 'icon': '🍅'},
    {'crop': 'Maize', 'variety': 'Yellow', 'mandi': 'Gulbarga APMC', 'price': 1850, 'change': 0.5, 'unit': 'qtl', 'icon': '🌽'},
    {'crop': 'Sugarcane', 'variety': 'CO-86032', 'mandi': 'FRP Rate', 'price': 315, 'change': 0.0, 'unit': 'qtl', 'icon': '🎋'},
  ];

  final List<Map<String, dynamic>> _listings = [
    {'crop': 'Wheat', 'qty': '500 qtl', 'quality': 'FAQ Grade', 'price': 2200, 'location': 'Hoshiarpur, Punjab', 'seller': 'Gurjeet Singh'},
    {'crop': 'Soybean', 'qty': '200 qtl', 'quality': 'Bold', 'price': 4400, 'location': 'Indore, MP', 'seller': 'Ramlal Patel'},
    {'crop': 'Cotton', 'qty': '100 qtl', 'quality': 'Long Staple', 'price': 6800, 'location': 'Vidarbha, Maharashtra', 'seller': 'Suresh Deshmukh'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: NestedScrollView(
        headerSliverBuilder: (context, _) => [
          SliverAppBar(
            floating: true, snap: true, pinned: true,
            backgroundColor: AppColors.surface,
            toolbarHeight: 60,
            flexibleSpace: const AppHeader(),
            bottom: TabBar(
              controller: _tabController,
              labelColor: AppColors.primary,
              unselectedLabelColor: AppColors.textSecondary,
              indicatorColor: AppColors.primary,
              indicatorWeight: 3,
              labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14),
              tabs: const [
                Tab(text: 'Mandi Prices'),
                Tab(text: 'Buy Crops'),
                Tab(text: 'Sell Crops'),
              ],
            ),
          ),
        ],
        body: TabBarView(
          controller: _tabController,
          children: [
            _MandiPricesTab(prices: _mandiPrices),
            _BuyCropsTab(listings: _listings),
            _SellCropsTab(),
          ],
        ),
      ),
    );
  }
}

class _MandiPricesTab extends StatelessWidget {
  final List<Map<String, dynamic>> prices;
  const _MandiPricesTab({required this.prices});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(16),
          child: const SearchBarWidget(hint: 'Search crop or mandi...'),
        ),
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFFFFFBEB),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFFDE68A)),
          ),
          child: const Row(
            children: [
              Icon(Icons.update_rounded, size: 16, color: Color(0xFFD97706)),
              SizedBox(width: 8),
              Text('Prices updated: Today, 09:30 AM', style: TextStyle(fontSize: 12, color: Color(0xFFD97706), fontWeight: FontWeight.w600)),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: prices.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (ctx, i) {
              final p = prices[i];
              final change = p['change'] as double;
              return Container(
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
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(color: AppColors.statIconBg, borderRadius: BorderRadius.circular(12)),
                      child: Center(child: Text(p['icon'] as String, style: const TextStyle(fontSize: 22))),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(p['crop'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                          Text('${p['variety']} • ${p['mandi']}', style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        ],
                      ),
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text('₹${p['price']}/${p['unit']}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(change >= 0 ? Icons.trending_up_rounded : Icons.trending_down_rounded, size: 14, color: change >= 0 ? AppColors.success : AppColors.error),
                            const SizedBox(width: 2),
                            Text(
                              '${change >= 0 ? '+' : ''}${change.toStringAsFixed(1)}%',
                              style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: change >= 0 ? AppColors.success : AppColors.error),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _BuyCropsTab extends StatelessWidget {
  final List<Map<String, dynamic>> listings;
  const _BuyCropsTab({required this.listings});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: listings.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (ctx, i) {
        final l = listings[i];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.divider),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Text(l['crop'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(color: AppColors.statIconBg, borderRadius: BorderRadius.circular(8)),
                    child: Text(l['quality'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.success)),
                  ),
                  const Spacer(),
                  Text('₹${l['price']}/qtl', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16, color: AppColors.primary)),
                ],
              ),
              const SizedBox(height: 6),
              Text('Qty: ${l['qty']}', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.location_on_rounded, size: 13, color: AppColors.textSecondary),
                  Text(l['location'] as String, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  const Spacer(),
                  const Icon(Icons.person_rounded, size: 13, color: AppColors.textSecondary),
                  Text(l['seller'] as String, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                ],
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () {},
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 10)),
                  child: const Text('Contact Seller'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

class _SellCropsTab extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF1F3A1D), Color(0xFF2C5926)], begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                const Icon(Icons.grass_rounded, size: 50, color: Colors.white54),
                const SizedBox(height: 12),
                const Text('Sell Your Crops', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w700)),
                const SizedBox(height: 6),
                const Text('Get the best price from verified buyers across India', style: TextStyle(color: Colors.white70, fontSize: 13, height: 1.4), textAlign: TextAlign.center),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.pushNamed(context, '/sell'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppColors.primary, padding: const EdgeInsets.symmetric(vertical: 14)),
                    child: const Text('List Your Crop', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
