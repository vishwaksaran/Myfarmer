import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_header.dart';
import '../../widgets/search_bar_widget.dart';
import '../../providers/cart_provider.dart';

class ShopScreen extends StatefulWidget {
  const ShopScreen({super.key});

  @override
  State<ShopScreen> createState() => _ShopScreenState();
}

class _ShopScreenState extends State<ShopScreen> {
  int _selectedCategory = 0;

  final List<Map<String, dynamic>> _categories = [
    {'icon': Icons.grass_rounded, 'label': 'Seeds', 'color': Color(0xFF16A34A)},
    {'icon': Icons.science_rounded, 'label': 'Fertilizers', 'color': Color(0xFF7C3AED)},
    {'icon': Icons.bug_report_rounded, 'label': 'Pesticides', 'color': Color(0xFFDC2626)},
    {'icon': Icons.eco_rounded, 'label': 'Organic', 'color': Color(0xFF059669)},
    {'icon': Icons.handyman_rounded, 'label': 'Tools', 'color': Color(0xFFD97706)},
    {'icon': Icons.water_drop_rounded, 'label': 'Irrigation', 'color': Color(0xFF2563EB)},
  ];

  final List<Map<String, dynamic>> _products = [
    {'name': 'Hybrid Tomato Seeds', 'brand': 'MAHYCO', 'price': 299, 'originalPrice': 450, 'unit': '10g', 'rating': 4.5, 'reviews': 128, 'category': 'Seeds', 'badge': 'Best Seller'},
    {'name': 'DAP Fertilizer', 'brand': 'IFFCO', 'price': 1350, 'originalPrice': 1600, 'unit': '50kg', 'rating': 4.7, 'reviews': 340, 'category': 'Fertilizers', 'badge': 'Popular'},
    {'name': 'Neem Pesticide', 'brand': 'Bayer', 'price': 480, 'originalPrice': 600, 'unit': '500ml', 'rating': 4.3, 'reviews': 92, 'category': 'Pesticides', 'badge': null},
    {'name': 'Vermicompost', 'brand': 'Organic India', 'price': 320, 'originalPrice': 400, 'unit': '5kg', 'rating': 4.6, 'reviews': 215, 'category': 'Organic', 'badge': 'Organic'},
    {'name': 'Drip Irrigation Kit', 'brand': 'Jain Irrigation', 'price': 2100, 'originalPrice': 2800, 'unit': 'Set', 'rating': 4.8, 'reviews': 165, 'category': 'Irrigation', 'badge': 'Top Rated'},
    {'name': 'Hand Sprayer 16L', 'brand': 'Neptune', 'price': 1200, 'originalPrice': 1500, 'unit': '1 pc', 'rating': 4.4, 'reviews': 88, 'category': 'Tools', 'badge': null},
    {'name': 'Wheat Seeds (HD 3226)', 'brand': 'NSC', 'price': 850, 'originalPrice': 1000, 'unit': '30kg', 'rating': 4.9, 'reviews': 520, 'category': 'Seeds', 'badge': 'Best Seller'},
    {'name': 'Urea 46% N', 'brand': 'IFFCO', 'price': 267, 'originalPrice': 350, 'unit': '50kg', 'rating': 4.6, 'reviews': 289, 'category': 'Fertilizers', 'badge': null},
  ];

  String get _selectedCategoryLabel => _selectedCategory == 0 ? 'All' : _categories[_selectedCategory - 1]['label'] as String;

  List<Map<String, dynamic>> get _filteredProducts {
    if (_selectedCategory == 0) return _products;
    return _products.where((p) => p['category'] == _selectedCategoryLabel).toList();
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
            backgroundColor: AppColors.surface,
            toolbarHeight: 60,
            flexibleSpace: const AppHeader(),
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(56),
              child: Container(
                color: AppColors.surface,
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: const SearchBarWidget(hint: 'Search seeds, fertilizers, tools...'),
              ),
            ),
          ),
        ],
        body: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _BannerCarousel(),
            _CategoryChips(
              categories: ['All', ..._categories.map((c) => c['label'] as String)],
              selected: _selectedCategory,
              onSelect: (i) => setState(() => _selectedCategory = i),
            ),
            Expanded(
              child: _filteredProducts.isEmpty
                  ? const Center(child: Text('No products found', style: TextStyle(color: AppColors.textSecondary)))
                  : _ProductsGrid(products: _filteredProducts),
            ),
          ],
        ),
      ),
    );
  }
}

class _BannerCarousel extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      height: 140,
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF2C5926), Color(0xFF4CAF50)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Stack(
        children: [
          Positioned(right: 20, bottom: 0,
            child: const Icon(Icons.grass_rounded, size: 100, color: Colors.white10)),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(10)),
                  child: const Text('LIMITED TIME OFFER', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w700)),
                ),
                const SizedBox(height: 8),
                const Text('Up to 30% off on\nFertilizers & Seeds', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800, height: 1.2)),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                  child: const Text('Shop Now', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w700, fontSize: 12)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryChips extends StatelessWidget {
  final List<String> categories;
  final int selected;
  final ValueChanged<int> onSelect;

  const _CategoryChips({required this.categories, required this.selected, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 16, 0, 8),
      child: SizedBox(
        height: 36,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: categories.length,
          separatorBuilder: (_, __) => const SizedBox(width: 8),
          itemBuilder: (ctx, i) => GestureDetector(
            onTap: () => onSelect(i),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
              decoration: BoxDecoration(
                color: i == selected ? AppColors.primary : AppColors.surface,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: i == selected ? AppColors.primary : AppColors.divider),
              ),
              child: Text(
                categories[i],
                style: TextStyle(
                  color: i == selected ? Colors.white : AppColors.textSecondary,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ProductsGrid extends StatelessWidget {
  final List<Map<String, dynamic>> products;
  const _ProductsGrid({required this.products});

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 0.72,
      ),
      itemCount: products.length,
      itemBuilder: (ctx, i) => _ProductCard(product: products[i]),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    final cart = context.read<CartProvider>();
    final discountPct = (((product['originalPrice'] as int) - (product['price'] as int)) / (product['originalPrice'] as int) * 100).round();

    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.divider),
        boxShadow: [BoxShadow(color: AppColors.cardShadow, blurRadius: 4, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Image area
          ClipRRect(
            borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            child: Container(
              height: 110,
              color: AppColors.surfaceVariant,
              child: Stack(
                children: [
                  Center(child: Icon(Icons.grass_rounded, size: 50, color: AppColors.primary.withOpacity(0.3))),
                  if (product['badge'] != null)
                    Positioned(
                      top: 8,
                      left: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                        decoration: BoxDecoration(
                          color: product['badge'] == 'Organic' ? AppColors.success : AppColors.primary,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(product['badge'] as String, style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700)),
                      ),
                    ),
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(10)),
                      child: Text('$discountPct% OFF', style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product['brand'] as String, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary, fontWeight: FontWeight.w500)),
                  const SizedBox(height: 2),
                  Text(product['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13, height: 1.2), maxLines: 2, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, size: 11, color: Colors.amber),
                      const SizedBox(width: 2),
                      Text('${product['rating']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
                      const SizedBox(width: 3),
                      Text('(${product['reviews']})', style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                    ],
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('₹${product['price']}', style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 15, color: AppColors.primary)),
                            Text('₹${product['originalPrice']}', style: const TextStyle(fontSize: 10, color: AppColors.textHint, decoration: TextDecoration.lineThrough)),
                          ],
                        ),
                      ),
                      GestureDetector(
                        onTap: () {
                          cart.addItem(
                            product['name'] as String,
                            product['name'] as String,
                            (product['price'] as int).toDouble(),
                            '',
                          );
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('${product['name']} added to cart'),
                              duration: const Duration(seconds: 1),
                              backgroundColor: AppColors.primary,
                              behavior: SnackBarBehavior.floating,
                            ),
                          );
                        },
                        child: Container(
                          width: 32,
                          height: 32,
                          decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(8)),
                          child: const Icon(Icons.add_rounded, color: Colors.white, size: 18),
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
