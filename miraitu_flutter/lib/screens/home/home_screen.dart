import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_header.dart';
import '../../widgets/search_bar_widget.dart';
import '../../widgets/location_bar_widget.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            floating: true,
            snap: true,
            pinned: false,
            backgroundColor: AppColors.surface,
            toolbarHeight: 60,
            flexibleSpace: const AppHeader(),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(100),
              child: Container(
                color: AppColors.surface,
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Column(
                  children: const [
                    SearchBarWidget(),
                    SizedBox(height: 10),
                    LocationBarWidget(),
                  ],
                ),
              ),
            ),
          ),
        ],
        body: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _HeroSection(),
              _StatsSection(),
              _QuickServicesSection(),
              _FeaturedCategoriesSection(),
              _MachinerySection(),
              _LivestockSection(),
              _CropsSection(),
              _FinanceBanner(),
              _TestimonialsSection(),
              _AppDownloadBanner(),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeroSection extends StatefulWidget {
  @override
  State<_HeroSection> createState() => _HeroSectionState();
}

class _HeroSectionState extends State<_HeroSection> {
  int _currentSlide = 0;

  final List<Map<String, String>> _slides = [
    {
      'tag': 'INNOVATION IN AGRICULTURE',
      'title': 'The Future of',
      'highlight': 'Smart Farming',
      'subtitle': 'Redefining the agricultural super-app experience with precision tools, real-time marketplace, and a connected community hub for modern farmers.',
      'btn1': 'Explore Gallery',
      'btn2': 'Watch Farmer Videos',
      'color': '1F3A1D',
    },
    {
      'tag': 'TRUSTED MARKETPLACE',
      'title': 'India\'s #1',
      'highlight': 'Agriculture App',
      'subtitle': 'Buy and sell livestock, machinery, crops and land with verified farmers across 500+ villages in India.',
      'btn1': 'Browse Marketplace',
      'btn2': 'List Your Product',
      'color': '1A3A2A',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final slide = _slides[_currentSlide];
    return Container(
      height: 340,
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF1F3A1D),
            const Color(0xFF2C5926),
            AppColors.primaryLight.withOpacity(0.8),
          ],
        ),
      ),
      child: Stack(
        children: [
          // Background pattern overlay
          Positioned.fill(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  image: const DecorationImage(
                    image: NetworkImage(
                      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80',
                    ),
                    fit: BoxFit.cover,
                    colorFilter: ColorFilter.mode(
                      Color(0xCC1F3A1D),
                      BlendMode.srcOver,
                    ),
                  ),
                ),
              ),
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Tag badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.orange,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.bolt_rounded, color: Colors.white, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        slide['tag']!,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                // Title
                Text(
                  slide['title']!,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 28,
                    fontWeight: FontWeight.w700,
                    height: 1.2,
                  ),
                ),
                Text(
                  slide['highlight']!,
                  style: const TextStyle(
                    color: Color(0xFFDAA520),
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 12),
                // Subtitle
                Text(
                  slide['subtitle']!,
                  style: const TextStyle(
                    color: Color(0xCCFFFFFF),
                    fontSize: 13,
                    height: 1.5,
                  ),
                ),
                const Spacer(),
                // Buttons
                _HeroButton(
                  icon: Icons.photo_library_outlined,
                  label: slide['btn1']!,
                  filled: true,
                  onTap: () {},
                ),
                const SizedBox(height: 10),
                _HeroButton(
                  icon: Icons.play_circle_outline_rounded,
                  label: slide['btn2']!,
                  filled: false,
                  onTap: () {},
                ),
              ],
            ),
          ),
          // Slide indicators
          Positioned(
            bottom: 16,
            right: 16,
            child: Row(
              children: List.generate(_slides.length, (i) => AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                margin: const EdgeInsets.only(left: 4),
                width: i == _currentSlide ? 20 : 6,
                height: 6,
                decoration: BoxDecoration(
                  color: i == _currentSlide ? Colors.white : Colors.white38,
                  borderRadius: BorderRadius.circular(3),
                ),
              )),
            ),
          ),
        ],
      ),
    );
  }
}

class _HeroButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool filled;
  final VoidCallback onTap;

  const _HeroButton({required this.icon, required this.label, required this.filled, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        decoration: BoxDecoration(
          color: filled ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: Colors.white.withOpacity(0.4), width: 1.5),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: filled ? AppColors.primary : Colors.white, size: 18),
            const SizedBox(width: 8),
            Text(
              label,
              style: TextStyle(
                color: filled ? AppColors.primary : Colors.white,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _StatsSection extends StatelessWidget {
  final List<Map<String, dynamic>> _stats = const [
    {'icon': Icons.people_rounded, 'value': '50,000+', 'label': 'Active Farmers'},
    {'icon': Icons.currency_rupee_rounded, 'value': '₹2Cr+', 'label': 'Trade Volume'},
    {'icon': Icons.location_on_rounded, 'value': '500+', 'label': 'Villages Covered'},
    {'icon': Icons.star_rounded, 'value': '4.8★', 'label': 'User Rating'},
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
        itemBuilder: (ctx, i) => _StatCard(
          icon: _stats[i]['icon'] as IconData,
          value: _stats[i]['value'] as String,
          label: _stats[i]['label'] as String,
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;

  const _StatCard({required this.icon, required this.value, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.divider),
        boxShadow: [
          BoxShadow(color: AppColors.cardShadow, blurRadius: 6, offset: const Offset(0, 2)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: AppColors.statIconBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.primary, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                Text(label, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, height: 1.3)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _QuickServicesSection extends StatelessWidget {
  final List<Map<String, dynamic>> _services = const [
    {'icon': Icons.agriculture_rounded, 'label': 'Farm Services', 'color': Color(0xFF16A34A)},
    {'icon': Icons.people_rounded, 'label': 'Book Labour', 'color': Color(0xFF2563EB)},
    {'icon': Icons.store_mall_directory_rounded, 'label': 'Buy & Sell', 'color': Color(0xFFDC2626)},
    {'icon': Icons.calculate_rounded, 'label': 'Calculators', 'color': Color(0xFF9333EA)},
    {'icon': Icons.water_drop_rounded, 'label': 'Borewell', 'color': Color(0xFF0891B2)},
    {'icon': Icons.solar_power_rounded, 'label': 'Solar Setup', 'color': Color(0xFFF59E0B)},
    {'icon': Icons.pets_rounded, 'label': 'Livestock', 'color': Color(0xFF059669)},
    {'icon': Icons.more_horiz_rounded, 'label': 'More', 'color': Color(0xFF6B7280)},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Quick Services', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 14),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              mainAxisSpacing: 16,
              crossAxisSpacing: 12,
              childAspectRatio: 0.85,
            ),
            itemCount: _services.length,
            itemBuilder: (ctx, i) => _QuickServiceItem(
              icon: _services[i]['icon'] as IconData,
              label: _services[i]['label'] as String,
              color: _services[i]['color'] as Color,
              onTap: () => _navigate(context, _services[i]['label'] as String),
            ),
          ),
        ],
      ),
    );
  }

  void _navigate(BuildContext context, String label) {
    final routes = {
      'Farm Services': '/services',
      'Book Labour': '/services',
      'Buy & Sell': '/sell',
      'Calculators': '/toolbox',
      'Borewell': '/services',
      'Solar Setup': '/services',
      'Livestock': '/livestock',
      'More': '/services',
    };
    Navigator.pushNamed(context, routes[label] ?? '/');
  }
}

class _QuickServiceItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _QuickServiceItem({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: color.withOpacity(0.2)),
            ),
            child: Icon(icon, color: color, size: 26),
          ),
          const SizedBox(height: 6),
          Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

class _FeaturedCategoriesSection extends StatelessWidget {
  final List<Map<String, dynamic>> _categories = const [
    {'icon': Icons.agriculture_rounded, 'label': 'Machinery', 'count': '1,200+ listings', 'color': Color(0xFF2563EB)},
    {'icon': Icons.grass_rounded, 'label': 'Crops', 'count': '3,500+ listings', 'color': Color(0xFF16A34A)},
    {'icon': Icons.pets_rounded, 'label': 'Livestock', 'count': '980+ listings', 'color': Color(0xFFD97706)},
    {'icon': Icons.landscape_rounded, 'label': 'Land', 'count': '450+ listings', 'color': Color(0xFF7C3AED)},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Browse Categories', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const Spacer(),
              TextButton(onPressed: () {}, child: const Text('See All', style: TextStyle(color: AppColors.primary))),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 100,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (ctx, i) => GestureDetector(
                onTap: () {},
                child: Container(
                  width: 120,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: (_categories[i]['color'] as Color).withOpacity(0.08),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: (_categories[i]['color'] as Color).withOpacity(0.2)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(_categories[i]['icon'] as IconData, color: _categories[i]['color'] as Color, size: 24),
                      const Spacer(),
                      Text(_categories[i]['label'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                      Text(_categories[i]['count'] as String, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MachinerySection extends StatelessWidget {
  final List<Map<String, dynamic>> _items = const [
    {'name': 'Mahindra 575 DI', 'type': 'Tractor • 45 HP', 'price': '₹7.5L', 'tag': 'Rent', 'rating': '4.8'},
    {'name': 'John Deere 5050D', 'type': 'Tractor • 50 HP', 'price': '₹9.2L', 'tag': 'Buy', 'rating': '4.9'},
    {'name': 'Rotary Tiller', 'type': 'Implement', 'price': '₹800/day', 'tag': 'Rent', 'rating': '4.6'},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Farm Machinery', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const Spacer(),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/machinery'),
                child: const Text('View All', style: TextStyle(color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 200,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _items.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (ctx, i) => _MachineryCard(item: _items[i]),
            ),
          ),
        ],
      ),
    );
  }
}

class _MachineryCard extends StatelessWidget {
  final Map<String, dynamic> item;
  const _MachineryCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            child: Container(
              height: 100,
              color: AppColors.surfaceVariant,
              child: Stack(
                children: [
                  const Center(child: Icon(Icons.agriculture_rounded, size: 50, color: AppColors.primary)),
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: item['tag'] == 'Rent' ? Colors.orange : AppColors.primary,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(item['tag'] as String, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                const SizedBox(height: 2),
                Text(item['type'] as String, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Text(item['price'] as String, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w800, color: AppColors.primary)),
                    const Spacer(),
                    const Icon(Icons.star_rounded, size: 12, color: Colors.amber),
                    Text(item['rating'] as String, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
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

class _LivestockSection extends StatelessWidget {
  final List<Map<String, dynamic>> _items = const [
    {'name': 'Gir Cow', 'breed': 'Gir • 5 yrs', 'price': '₹95,000', 'milk': '14 L/day', 'verified': true},
    {'name': 'HF Buffalo', 'breed': 'Murrah • 4 yrs', 'price': '₹1,10,000', 'milk': '18 L/day', 'verified': true},
    {'name': 'Boer Goat', 'breed': 'Boer • 2 yrs', 'price': '₹18,000', 'milk': 'Meat', 'verified': false},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Livestock Market', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const Spacer(),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/livestock'),
                child: const Text('View All', style: TextStyle(color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 175,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _items.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (ctx, i) => _LivestockCard(item: _items[i]),
            ),
          ),
        ],
      ),
    );
  }
}

class _LivestockCard extends StatelessWidget {
  final Map<String, dynamic> item;
  const _LivestockCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 160,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            child: Container(
              height: 80,
              color: const Color(0xFFF0FDF4),
              child: Stack(
                children: [
                  const Center(child: Icon(Icons.pets_rounded, size: 40, color: AppColors.primary)),
                  if (item['verified'] as bool)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.verified_rounded, size: 10, color: Colors.white),
                            SizedBox(width: 2),
                            Text('Verified', style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w700)),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                Text(item['breed'] as String, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Expanded(child: Text(item['price'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.primary))),
                    Text(item['milk'] as String, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
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

class _CropsSection extends StatelessWidget {
  final List<Map<String, dynamic>> _items = const [
    {'name': 'Wheat', 'price': '₹2,125/qtl', 'change': '+2.3%', 'up': true},
    {'name': 'Rice (Paddy)', 'price': '₹1,868/qtl', 'change': '-0.8%', 'up': false},
    {'name': 'Soybean', 'price': '₹4,210/qtl', 'change': '+1.5%', 'up': true},
    {'name': 'Cotton', 'price': '₹6,500/qtl', 'change': '+3.1%', 'up': true},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text('Mandi Prices', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
              const Spacer(),
              TextButton(
                onPressed: () => Navigator.pushNamed(context, '/crops'),
                child: const Text('View All', style: TextStyle(color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.divider),
            ),
            child: Column(
              children: _items.asMap().entries.map((entry) {
                final i = entry.key;
                final item = entry.value;
                return Column(
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      child: Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(color: AppColors.statIconBg, borderRadius: BorderRadius.circular(10)),
                            child: const Icon(Icons.grass_rounded, color: AppColors.primary, size: 18),
                          ),
                          const SizedBox(width: 12),
                          Expanded(child: Text(item['name'] as String, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14))),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(item['price'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                              Text(
                                item['change'] as String,
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: (item['up'] as bool) ? AppColors.success : AppColors.error,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    if (i < _items.length - 1) const Divider(height: 1, indent: 14, endIndent: 14),
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

class _FinanceBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: [Color(0xFF1F3A1D), Color(0xFF2C5926)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.accentGold.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text('KISAN CREDIT CARD', style: TextStyle(color: Color(0xFFDAA520), fontSize: 10, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(height: 8),
                  const Text('Get KCC Loan\nup to ₹3 Lakhs', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700, height: 1.3)),
                  const SizedBox(height: 6),
                  const Text('Easy application, minimal docs', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  const SizedBox(height: 14),
                  GestureDetector(
                    onTap: () => Navigator.pushNamed(context, '/finance'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text('Apply Now', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 13)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            const Icon(Icons.account_balance_wallet_rounded, size: 80, color: Colors.white24),
          ],
        ),
      ),
    );
  }
}

class _TestimonialsSection extends StatelessWidget {
  final List<Map<String, String>> _testimonials = const [
    {'name': 'Raju Patel', 'loc': 'Gujarat', 'text': 'Sold my buffalo for great price. Very easy process!', 'rating': '5'},
    {'name': 'Suresh Kumar', 'loc': 'Rajasthan', 'text': 'Got tractor on rent for harvesting. Saved ₹50,000!', 'rating': '5'},
    {'name': 'Meena Devi', 'loc': 'Haryana', 'text': 'Soil testing service helped improve my crop yield by 30%.', 'rating': '4'},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Farmer Stories', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 12),
          SizedBox(
            height: 140,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _testimonials.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (ctx, i) {
                final t = _testimonials[i];
                return Container(
                  width: 230,
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
                          CircleAvatar(radius: 18, backgroundColor: AppColors.statIconBg, child: Text(t['name']![0], style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700))),
                          const SizedBox(width: 10),
                          Expanded(child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(t['name']!, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                              Text(t['loc']!, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                            ],
                          )),
                          Row(
                            children: List.generate(int.parse(t['rating']!), (_) =>
                              const Icon(Icons.star_rounded, size: 12, color: Colors.amber)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Text('"${t['text']!}"', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, height: 1.4), maxLines: 3, overflow: TextOverflow.ellipsis),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _AppDownloadBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFFECFDF5),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFBBF7D0)),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Download Miraitu App', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  const Text('Available on Android & iOS', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      _StoreButton(label: 'Play Store', icon: Icons.android_rounded),
                      const SizedBox(width: 8),
                      _StoreButton(label: 'App Store', icon: Icons.apple_rounded),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(Icons.smartphone_rounded, size: 60, color: AppColors.primary),
          ],
        ),
      ),
    );
  }
}

class _StoreButton extends StatelessWidget {
  final String label;
  final IconData icon;
  const _StoreButton({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.primary,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 14),
          const SizedBox(width: 4),
          Text(label, style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
