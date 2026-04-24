import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_header.dart';
import '../../widgets/search_bar_widget.dart';

class MachineryScreen extends StatefulWidget {
  const MachineryScreen({super.key});

  @override
  State<MachineryScreen> createState() => _MachineryScreenState();
}

class _MachineryScreenState extends State<MachineryScreen> {
  int _selectedType = 0;

  final List<Map<String, dynamic>> _types = [
    {'icon': Icons.agriculture_rounded, 'label': 'Tractors', 'color': Color(0xFF2563EB)},
    {'icon': Icons.construction_rounded, 'label': 'JCB', 'color': Color(0xFFD97706)},
    {'icon': Icons.grass_rounded, 'label': 'Harvesters', 'color': Color(0xFF16A34A)},
    {'icon': Icons.flight_rounded, 'label': 'Drones', 'color': Color(0xFF7C3AED)},
    {'icon': Icons.build_rounded, 'label': 'Implements', 'color': Color(0xFF6B7280)},
  ];

  final List<Map<String, dynamic>> _listings = [
    {'name': 'Mahindra 575 DI', 'brand': 'Mahindra', 'hp': '45 HP', 'year': '2022', 'price': 750000, 'rentalPrice': '₹1,200/day', 'type': 'Tractor', 'options': ['Rent', 'Buy'], 'location': 'Ludhiana, Punjab', 'rating': 4.8},
    {'name': 'John Deere 5050D', 'brand': 'John Deere', 'hp': '50 HP', 'year': '2021', 'price': 920000, 'rentalPrice': '₹1,500/day', 'type': 'Tractor', 'options': ['Buy'], 'location': 'Jaipur, Rajasthan', 'rating': 4.9},
    {'name': 'Sonalika 750 DI', 'brand': 'Sonalika', 'hp': '60 HP', 'year': '2023', 'price': 680000, 'rentalPrice': '₹900/day', 'type': 'Tractor', 'options': ['Rent', 'Buy', 'Sell'], 'location': 'Agra, UP', 'rating': 4.6},
    {'name': 'New Holland 3630', 'brand': 'New Holland', 'hp': '75 HP', 'year': '2020', 'price': 1100000, 'rentalPrice': '₹1,800/day', 'type': 'Tractor', 'options': ['Rent', 'Buy'], 'location': 'Amritsar, Punjab', 'rating': 4.7},
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
                child: const SearchBarWidget(hint: 'Search tractors, harvesters...'),
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
                  const Text('Farm Machinery', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  const Text('Buy, Sell or Rent agricultural machinery', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  const SizedBox(height: 14),
                  // Action chips
                  Row(
                    children: ['All', 'Rent', 'Buy', 'Sell New'].map((label) => Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                      decoration: BoxDecoration(
                        color: label == 'All' ? AppColors.primary : AppColors.surface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: label == 'All' ? AppColors.primary : AppColors.divider),
                      ),
                      child: Text(label, style: TextStyle(
                        color: label == 'All' ? Colors.white : AppColors.textSecondary,
                        fontSize: 13, fontWeight: FontWeight.w600,
                      )),
                    )).toList(),
                  ),
                ],
              ),
            ),
            // Types
            SizedBox(
              height: 80,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _types.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (ctx, i) => GestureDetector(
                  onTap: () => setState(() => _selectedType = i),
                  child: Column(
                    children: [
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 56,
                        height: 56,
                        decoration: BoxDecoration(
                          color: _selectedType == i ? (_types[i]['color'] as Color).withOpacity(0.15) : AppColors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: _selectedType == i ? _types[i]['color'] as Color : AppColors.divider, width: _selectedType == i ? 2 : 1),
                        ),
                        child: Icon(_types[i]['icon'] as IconData, color: _selectedType == i ? _types[i]['color'] as Color : AppColors.textSecondary, size: 24),
                      ),
                      const SizedBox(height: 4),
                      Text(_types[i]['label'] as String, style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: _selectedType == i ? _types[i]['color'] as Color : AppColors.textSecondary)),
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
                itemBuilder: (ctx, i) => _MachineryCard(listing: _listings[i]),
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, '/sell'),
        backgroundColor: AppColors.primary,
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('List Machinery', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
      ),
    );
  }
}

class _MachineryCard extends StatelessWidget {
  final Map<String, dynamic> listing;
  const _MachineryCard({required this.listing});

  @override
  Widget build(BuildContext context) {
    final options = listing['options'] as List<String>;
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
        boxShadow: [BoxShadow(color: AppColors.cardShadow, blurRadius: 6, offset: const Offset(0, 2))],
      ),
      child: Column(
        children: [
          // Image
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            child: Container(
              height: 140,
              color: const Color(0xFFEFF6FF),
              child: Stack(
                children: [
                  Center(child: Icon(Icons.agriculture_rounded, size: 80, color: const Color(0xFF2563EB).withOpacity(0.3))),
                  Positioned(
                    top: 10, left: 10,
                    child: Row(
                      children: options.map((opt) => Container(
                        margin: const EdgeInsets.only(right: 6),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: opt == 'Rent' ? Colors.orange : opt == 'Buy' ? AppColors.primary : AppColors.success,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(opt, style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                      )).toList(),
                    ),
                  ),
                  Positioned(
                    top: 10, right: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: Colors.black.withOpacity(0.5), borderRadius: BorderRadius.circular(10)),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.star_rounded, size: 12, color: Colors.amber),
                          const SizedBox(width: 3),
                          Text('${listing['rating']}', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(listing['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16))),
                    Text(listing['year'] as String, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 4),
                Text('${listing['brand']} • ${listing['hp']}', style: const TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.location_on_rounded, size: 13, color: AppColors.textSecondary),
                    const SizedBox(width: 2),
                    Text(listing['location'] as String, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('₹${(listing['price'] as int) ~/ 100000}.${((listing['price'] as int) % 100000) ~/ 10000}L', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.primary)),
                        Text(listing['rentalPrice'] as String, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                      ],
                    ),
                    const Spacer(),
                    GestureDetector(
                      onTap: () {},
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
                        child: const Text('Get Price', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                      ),
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
