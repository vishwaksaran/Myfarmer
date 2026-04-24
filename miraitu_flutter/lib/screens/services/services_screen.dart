import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_header.dart';
import '../../widgets/search_bar_widget.dart';
import '../../widgets/location_bar_widget.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  int _selectedCategory = 0;

  final List<String> _categories = [
    'All', 'Machinery', 'Labour', 'Veterinary', 'Soil', 'Irrigation', 'Construction',
  ];

  final List<Map<String, dynamic>> _services = [
    {'icon': Icons.science_outlined, 'label': 'Soil Testing', 'providers': '48', 'color': Color(0xFF7C3AED)},
    {'icon': Icons.agriculture_rounded, 'label': 'Rent Machinery', 'providers': '120', 'color': Color(0xFF2563EB)},
    {'icon': Icons.water_drop_rounded, 'label': 'Borewell Services', 'providers': '35', 'color': Color(0xFF0891B2)},
    {'icon': Icons.videocam_outlined, 'label': 'CCTV Installation', 'providers': '22', 'color': Color(0xFF1F2937)},
    {'icon': Icons.fence_rounded, 'label': 'Fencing Services', 'providers': '19', 'color': Color(0xFF92400E)},
    {'icon': Icons.grass_rounded, 'label': 'Harvester', 'providers': '28', 'color': Color(0xFF16A34A)},
    {'icon': Icons.flight_rounded, 'label': 'Drone Spray', 'providers': '15', 'color': Color(0xFF4F46E5)},
    {'icon': Icons.people_rounded, 'label': 'Farm Labours', 'providers': '95', 'color': Color(0xFFD97706)},
    {'icon': Icons.local_shipping_rounded, 'label': 'Transportation', 'providers': '42', 'color': Color(0xFFDC2626)},
    {'icon': Icons.warehouse_rounded, 'label': 'Storage & Godown', 'providers': '17', 'color': Color(0xFF059669)},
    {'icon': Icons.plumbing_rounded, 'label': 'Plumber', 'providers': '31', 'color': Color(0xFF2563EB)},
    {'icon': Icons.electrical_services_rounded, 'label': 'Electrician', 'providers': '26', 'color': Color(0xFFF59E0B)},
    {'icon': Icons.build_circle_rounded, 'label': 'Mechanic', 'providers': '38', 'color': Color(0xFF6B7280)},
    {'icon': Icons.water_outlined, 'label': 'Milk Vendors', 'providers': '54', 'color': Color(0xFF0891B2)},
  ];

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
              preferredSize: const Size.fromHeight(116),
              child: Container(
                color: AppColors.surface,
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
                child: Column(
                  children: const [
                    SearchBarWidget(hint: 'Search farm services...'),
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
              _ServicesHero(),
              _StatsRow(),
              _CategoryFilter(
                categories: _categories,
                selected: _selectedCategory,
                onSelect: (i) => setState(() => _selectedCategory = i),
              ),
              _ServicesGrid(services: _services),
              _HowItWorksSection(),
              _FarmerRegistrationBanner(),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class _ServicesHero extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text(
            'Book reliable farm services\nfrom verified providers.',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary, height: 1.4),
          ),
          SizedBox(height: 6),
          Text(
            'From harvesting to transportation, we\'ve got you covered.',
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.4),
          ),
        ],
      ),
    );
  }
}

class _StatsRow extends StatelessWidget {
  final List<Map<String, dynamic>> _stats = const [
    {'icon': Icons.people_rounded, 'value': '500+', 'label': 'Active Providers'},
    {'icon': Icons.calendar_month_rounded, 'value': '12,450', 'label': 'Services Booked'},
    {'icon': Icons.star_rounded, 'value': '4.8★', 'label': 'Avg. Rating'},
    {'icon': Icons.location_on_rounded, 'value': '200+', 'label': 'Areas Covered'},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 2.2,
        ),
        itemCount: _stats.length,
        itemBuilder: (ctx, i) => Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.divider),
            boxShadow: [BoxShadow(color: AppColors.cardShadow, blurRadius: 6, offset: const Offset(0, 2))],
          ),
          child: Row(
            children: [
              Container(
                width: 34,
                height: 34,
                decoration: BoxDecoration(color: AppColors.statIconBg, borderRadius: BorderRadius.circular(10)),
                child: Icon(_stats[i]['icon'] as IconData, color: AppColors.primary, size: 18),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(_stats[i]['value'] as String, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                    Text(_stats[i]['label'] as String, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary, height: 1.2)),
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

class _CategoryFilter extends StatelessWidget {
  final List<String> categories;
  final int selected;
  final ValueChanged<int> onSelect;

  const _CategoryFilter({required this.categories, required this.selected, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(0, 20, 0, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text('Our Services', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 38,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: categories.length,
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemBuilder: (ctx, i) => GestureDetector(
                onTap: () => onSelect(i),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  decoration: BoxDecoration(
                    color: i == selected ? AppColors.primary : AppColors.surface,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: i == selected ? AppColors.primary : AppColors.divider,
                    ),
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
        ],
      ),
    );
  }
}

class _ServicesGrid extends StatelessWidget {
  final List<Map<String, dynamic>> services;
  const _ServicesGrid({required this.services});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          mainAxisSpacing: 14,
          crossAxisSpacing: 14,
          childAspectRatio: 0.85,
        ),
        itemCount: services.length,
        itemBuilder: (ctx, i) => _ServiceCard(
          icon: services[i]['icon'] as IconData,
          label: services[i]['label'] as String,
          providers: services[i]['providers'] as String,
          color: services[i]['color'] as Color,
          onTap: () => _showServiceDetail(context, services[i]),
        ),
      ),
    );
  }

  void _showServiceDetail(BuildContext context, Map<String, dynamic> service) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(24))),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: (service['color'] as Color).withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(service['icon'] as IconData, color: service['color'] as Color, size: 30),
            ),
            const SizedBox(height: 12),
            Text(service['label'] as String, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
            const SizedBox(height: 4),
            Text('${service['providers']} providers available', style: const TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Book Service'),
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }
}

class _ServiceCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String providers;
  final Color color;
  final VoidCallback onTap;

  const _ServiceCard({required this.icon, required this.label, required this.providers, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.divider),
          boxShadow: [BoxShadow(color: AppColors.cardShadow, blurRadius: 4, offset: const Offset(0, 2))],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textPrimary, height: 1.2),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 4),
            Text(
              '$providers providers',
              style: const TextStyle(fontSize: 9, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}

class _HowItWorksSection extends StatelessWidget {
  final List<Map<String, String>> _steps = const [
    {'step': '1', 'title': 'Choose a Service', 'desc': 'Browse from 14+ farm services'},
    {'step': '2', 'title': 'Select Provider', 'desc': 'Pick a verified local provider'},
    {'step': '3', 'title': 'Book & Pay', 'desc': 'Confirm booking and pay online'},
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 28, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('How It Works', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 16),
          Row(
            children: _steps.asMap().entries.map((entry) {
              final step = entry.value;
              final isLast = entry.key == _steps.length - 1;
              return Expanded(
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: const BoxDecoration(color: AppColors.primary, shape: BoxShape.circle),
                            child: Center(child: Text(step['step']!, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16))),
                          ),
                          const SizedBox(height: 8),
                          Text(step['title']!, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12), textAlign: TextAlign.center),
                          const SizedBox(height: 2),
                          Text(step['desc']!, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary), textAlign: TextAlign.center, maxLines: 2),
                        ],
                      ),
                    ),
                    if (!isLast)
                      const Padding(
                        padding: EdgeInsets.only(bottom: 40),
                        child: Icon(Icons.arrow_forward_rounded, color: AppColors.divider, size: 18),
                      ),
                  ],
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}

class _FarmerRegistrationBanner extends StatelessWidget {
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
                  const Text('Become a Service Provider', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 6),
                  const Text('Register and start earning by offering farm services', style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4)),
                  const SizedBox(height: 14),
                  ElevatedButton(
                    onPressed: () {},
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: AppColors.primary,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    ),
                    child: const Text('Register Now', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
                  ),
                ],
              ),
            ),
            const Icon(Icons.handshake_rounded, size: 60, color: Colors.white24),
          ],
        ),
      ),
    );
  }
}
