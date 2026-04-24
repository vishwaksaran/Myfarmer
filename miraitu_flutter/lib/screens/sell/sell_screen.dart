import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_header.dart';

class SellScreen extends StatefulWidget {
  const SellScreen({super.key});

  @override
  State<SellScreen> createState() => _SellScreenState();
}

class _SellScreenState extends State<SellScreen> {
  int _selectedType = 0;

  final List<Map<String, dynamic>> _categories = [
    {'icon': Icons.pets_rounded, 'label': 'Livestock', 'color': Color(0xFF16A34A), 'fields': ['Animal Type', 'Breed', 'Age', 'Weight', 'Price']},
    {'icon': Icons.agriculture_rounded, 'label': 'Machinery', 'color': Color(0xFF2563EB), 'fields': ['Machine Type', 'Brand', 'Year', 'HP/CC', 'Price']},
    {'icon': Icons.grass_rounded, 'label': 'Crops', 'color': Color(0xFFD97706), 'fields': ['Crop Name', 'Variety', 'Quantity', 'Quality', 'Price']},
    {'icon': Icons.landscape_rounded, 'label': 'Land', 'color': Color(0xFF7C3AED), 'fields': ['Area (acres)', 'Soil Type', 'Location', 'Type', 'Price']},
    {'icon': Icons.home_repair_service_rounded, 'label': 'Services', 'color': Color(0xFFDC2626), 'fields': ['Service Type', 'Experience', 'Location', 'Rate', 'Availability']},
    {'icon': Icons.shopping_bag_rounded, 'label': 'Products', 'color': Color(0xFF0891B2), 'fields': ['Product Name', 'Category', 'Quantity', 'Brand', 'Price']},
  ];

  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _priceController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _locationController = TextEditingController();

  @override
  void dispose() {
    _titleController.dispose();
    _priceController.dispose();
    _descriptionController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
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
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Create Listing', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  const Text('Sell your farm products, livestock, machinery and more', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  const SizedBox(height: 20),
                  // Category grid
                  const Text('What are you selling?', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
                  const SizedBox(height: 12),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 1.1,
                    ),
                    itemCount: _categories.length,
                    itemBuilder: (ctx, i) => GestureDetector(
                      onTap: () => setState(() => _selectedType = i),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        decoration: BoxDecoration(
                          color: _selectedType == i
                              ? (_categories[i]['color'] as Color).withOpacity(0.15)
                              : AppColors.surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: _selectedType == i ? _categories[i]['color'] as Color : AppColors.divider,
                            width: _selectedType == i ? 2 : 1,
                          ),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(_categories[i]['icon'] as IconData, color: _categories[i]['color'] as Color, size: 28),
                            const SizedBox(height: 6),
                            Text(_categories[i]['label'] as String, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: _selectedType == i ? _categories[i]['color'] as Color : AppColors.textPrimary)),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  _ListingForm(
                    formKey: _formKey,
                    titleController: _titleController,
                    priceController: _priceController,
                    descController: _descriptionController,
                    locationController: _locationController,
                    fields: _categories[_selectedType]['fields'] as List<String>,
                    categoryColor: _categories[_selectedType]['color'] as Color,
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: _submitListing,
                      icon: const Icon(Icons.upload_rounded),
                      label: const Text('Publish Listing', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                    ),
                  ),
                  const SizedBox(height: 30),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _submitListing() {
    if (_formKey.currentState?.validate() ?? false) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 70,
                height: 70,
                decoration: const BoxDecoration(color: AppColors.statIconBg, shape: BoxShape.circle),
                child: const Icon(Icons.check_circle_rounded, color: AppColors.success, size: 40),
              ),
              const SizedBox(height: 16),
              const Text('Listing Published!', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700)),
              const SizedBox(height: 8),
              const Text('Your listing is now live and visible to buyers.', textAlign: TextAlign.center, style: TextStyle(color: AppColors.textSecondary)),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(onPressed: () => Navigator.pop(ctx), child: const Text('Done')),
              ),
            ],
          ),
        ),
      );
    }
  }
}

class _ListingForm extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController titleController;
  final TextEditingController priceController;
  final TextEditingController descController;
  final TextEditingController locationController;
  final List<String> fields;
  final Color categoryColor;

  const _ListingForm({
    required this.formKey,
    required this.titleController,
    required this.priceController,
    required this.descController,
    required this.locationController,
    required this.fields,
    required this.categoryColor,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Listing Details', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
          const SizedBox(height: 14),
          // Photo upload
          Container(
            height: 120,
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.divider, style: BorderStyle.solid, width: 2),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.add_photo_alternate_outlined, size: 36, color: categoryColor),
                const SizedBox(height: 8),
                Text('Add Photos', style: TextStyle(color: categoryColor, fontWeight: FontWeight.w600, fontSize: 14)),
                const Text('Up to 5 photos', style: TextStyle(color: AppColors.textSecondary, fontSize: 11)),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Title field
          TextFormField(
            controller: titleController,
            decoration: InputDecoration(labelText: fields.isNotEmpty ? fields[0] : 'Title', hintText: 'Enter ${fields.isNotEmpty ? fields[0].toLowerCase() : "title"}'),
            validator: (v) => v?.isEmpty == true ? 'Required' : null,
          ),
          const SizedBox(height: 14),
          if (fields.length > 1)
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    decoration: InputDecoration(labelText: fields[1]),
                    validator: (v) => v?.isEmpty == true ? 'Required' : null,
                  ),
                ),
                const SizedBox(width: 12),
                if (fields.length > 2)
                  Expanded(
                    child: TextFormField(
                      decoration: InputDecoration(labelText: fields[2]),
                    ),
                  ),
              ],
            ),
          const SizedBox(height: 14),
          TextFormField(
            controller: priceController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Price (₹)', hintText: 'Enter asking price', prefixText: '₹ '),
            validator: (v) => v?.isEmpty == true ? 'Enter price' : null,
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: locationController,
            decoration: const InputDecoration(labelText: 'Location', hintText: 'Village, District, State', prefixIcon: Icon(Icons.location_on_outlined, size: 20)),
            validator: (v) => v?.isEmpty == true ? 'Enter location' : null,
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: descController,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Description', hintText: 'Describe your listing in detail...', alignLabelWithHint: true),
          ),
          const SizedBox(height: 14),
          // Contact preference
          const Text('Contact Preference', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
          const SizedBox(height: 8),
          Row(
            children: [
              _ContactChip(icon: Icons.phone_rounded, label: 'Phone Call', selected: true),
              const SizedBox(width: 8),
              _ContactChip(icon: Icons.chat_rounded, label: 'WhatsApp', selected: false),
              const SizedBox(width: 8),
              _ContactChip(icon: Icons.message_rounded, label: 'In-App Chat', selected: false),
            ],
          ),
        ],
      ),
    );
  }
}

class _ContactChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  const _ContactChip({required this.icon, required this.label, required this.selected});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: selected ? AppColors.statIconBg : AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: selected ? AppColors.primary : AppColors.divider),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: selected ? AppColors.primary : AppColors.textSecondary),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: selected ? AppColors.primary : AppColors.textSecondary)),
        ],
      ),
    );
  }
}
