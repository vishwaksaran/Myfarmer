import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_header.dart';
import '../../widgets/search_bar_widget.dart';

class LivestockScreen extends StatefulWidget {
  const LivestockScreen({super.key});

  @override
  State<LivestockScreen> createState() => _LivestockScreenState();
}

class _LivestockScreenState extends State<LivestockScreen> {
  int _selectedTab = 0;
  int _selectedCategory = 0;

  final List<String> _tabs = ['Buy', 'Sell'];
  final List<Map<String, dynamic>> _categories = [
    {'icon': Icons.pets_rounded, 'label': 'All', 'count': 980},
    {'icon': Icons.pets_rounded, 'label': 'Cattle', 'count': 245},
    {'icon': Icons.pets_rounded, 'label': 'Goats & Sheep', 'count': 189},
    {'icon': Icons.egg_rounded, 'label': 'Poultry', 'count': 312},
    {'icon': Icons.water_rounded, 'label': 'Fish', 'count': 156},
    {'icon': Icons.more_horiz_rounded, 'label': 'Others', 'count': 78},
  ];

  final List<Map<String, dynamic>> _listings = [
    {'name': 'Gir Cow', 'breed': 'Gir', 'age': '5 yrs', 'price': 95000, 'milk': '14 L/day', 'location': 'Anand, Gujarat', 'verified': true, 'category': 'Cattle'},
    {'name': 'Murrah Buffalo', 'breed': 'Murrah', 'age': '4 yrs', 'price': 110000, 'milk': '18 L/day', 'location': 'Karnal, Haryana', 'verified': true, 'category': 'Cattle'},
    {'name': 'HF Cross Cow', 'breed': 'HF Cross', 'age': '3 yrs', 'price': 65000, 'milk': '20 L/day', 'location': 'Pune, Maharashtra', 'verified': false, 'category': 'Cattle'},
    {'name': 'Boer Goat', 'breed': 'Boer', 'age': '2 yrs', 'price': 18000, 'milk': 'Meat', 'location': 'Jaipur, Rajasthan', 'verified': true, 'category': 'Goats & Sheep'},
    {'name': 'Barbari Goat', 'breed': 'Barbari', 'age': '1.5 yrs', 'price': 12000, 'milk': 'Dairy', 'location': 'Mathura, UP', 'verified': false, 'category': 'Goats & Sheep'},
    {'name': 'Broiler Chickens (100)', 'breed': 'Broiler', 'age': '6 wks', 'price': 15000, 'milk': 'Meat', 'location': 'Namakkal, TN', 'verified': true, 'category': 'Poultry'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: NestedScrollView(
        headerSliverBuilder: (context, _) => [
          SliverAppBar(
            floating: true, snap: true,
            backgroundColor: AppColors.surface,
            toolbarHeight: 60,
            flexibleSpace: const AppHeader(),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(56),
              child: Container(
                color: AppColors.surface,
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: const SearchBarWidget(hint: 'Search cattle, goat, poultry...'),
              ),
            ),
          ),
        ],
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text('Livestock Market', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(color: AppColors.statIconBg, borderRadius: BorderRadius.circular(20)),
                        child: const Row(
                          children: [
                            Icon(Icons.filter_list_rounded, size: 16, color: AppColors.primary),
                            SizedBox(width: 4),
                            Text('Filter', style: TextStyle(color: AppColors.primary, fontSize: 13, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('${_listings.length} listings • 5,000+ verified sellers', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                ],
              ),
            ),
            // Buy/Sell tabs
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                height: 44,
                decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: _tabs.asMap().entries.map((e) => Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => _selectedTab = e.key),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.all(4),
                        decoration: BoxDecoration(
                          color: _selectedTab == e.key ? AppColors.primary : Colors.transparent,
                          borderRadius: BorderRadius.circular(9),
                        ),
                        child: Center(
                          child: Text(e.value, style: TextStyle(
                            color: _selectedTab == e.key ? Colors.white : AppColors.textSecondary,
                            fontWeight: FontWeight.w700, fontSize: 14,
                          )),
                        ),
                      ),
                    ),
                  )).toList(),
                ),
              ),
            ),
            const SizedBox(height: 14),
            // Categories
            SizedBox(
              height: 80,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _categories.length,
                separatorBuilder: (_, __) => const SizedBox(width: 10),
                itemBuilder: (ctx, i) => GestureDetector(
                  onTap: () => setState(() => _selectedCategory = i),
                  child: Column(
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: _selectedCategory == i ? AppColors.primary : AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: _selectedCategory == i ? AppColors.primary : AppColors.divider),
                        ),
                        child: Icon(_categories[i]['icon'] as IconData, color: _selectedCategory == i ? Colors.white : AppColors.textSecondary, size: 24),
                      ),
                      const SizedBox(height: 4),
                      Text(_categories[i]['label'] as String, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: _selectedCategory == i ? AppColors.primary : AppColors.textSecondary)),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 12),
            // Listings
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _listings.length,
                separatorBuilder: (_, __) => const SizedBox(height: 12),
                itemBuilder: (ctx, i) => _LivestockListingCard(listing: _listings[i]),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, '/sell'),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Sell Livestock', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
      ),
    );
  }
}

class _LivestockListingCard extends StatelessWidget {
  final Map<String, dynamic> listing;
  const _LivestockListingCard({required this.listing});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
        boxShadow: [BoxShadow(color: AppColors.cardShadow, blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Row(
        children: [
          // Image
          ClipRRect(
            borderRadius: const BorderRadius.horizontal(left: Radius.circular(16)),
            child: Container(
              width: 110,
              height: 110,
              color: const Color(0xFFF0FDF4),
              child: Stack(
                children: [
                  Center(child: Icon(Icons.pets_rounded, size: 50, color: AppColors.primary.withOpacity(0.4))),
                  if (listing['verified'] as bool)
                    Positioned(
                      top: 8, left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.verified_rounded, size: 9, color: Colors.white),
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
          // Details
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(listing['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                  const SizedBox(height: 4),
                  Text('${listing['breed']} • ${listing['age']}', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(color: AppColors.statIconBg, borderRadius: BorderRadius.circular(8)),
                        child: Text('🥛 ${listing['milk']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on_rounded, size: 13, color: AppColors.textSecondary),
                      const SizedBox(width: 2),
                      Expanded(child: Text(listing['location'] as String, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary), maxLines: 1, overflow: TextOverflow.ellipsis)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text('₹${(listing['price'] as int).toStringAsFixed(0).replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]},')}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800, color: AppColors.primary)),
                      const Spacer(),
                      GestureDetector(
                        onTap: () {},
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
                          child: const Text('Enquire', style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
