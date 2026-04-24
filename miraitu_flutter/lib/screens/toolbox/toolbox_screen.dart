import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_header.dart';

class ToolboxScreen extends StatelessWidget {
  const ToolboxScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tools = [
      {'icon': Icons.calculate_rounded, 'label': 'Crop Costing', 'desc': 'Calculate input costs', 'color': Color(0xFF2563EB), 'screen': const _CropCostingTool()},
      {'icon': Icons.trending_up_rounded, 'label': 'Profit Estimator', 'desc': 'Estimate crop profit', 'color': Color(0xFF16A34A), 'screen': null},
      {'icon': Icons.water_drop_rounded, 'label': 'Irrigation Calc', 'desc': 'Water requirement', 'color': Color(0xFF0891B2), 'screen': null},
      {'icon': Icons.straighten_rounded, 'label': 'Land Area', 'desc': 'Convert area units', 'color': Color(0xFF7C3AED), 'screen': const _LandAreaTool()},
      {'icon': Icons.science_rounded, 'label': 'Fertilizer Guide', 'desc': 'NPK recommendations', 'color': Color(0xFFD97706), 'screen': null},
      {'icon': Icons.cloud_rounded, 'label': 'Weather Alerts', 'desc': 'Local farm weather', 'color': Color(0xFF0EA5E9), 'screen': null},
      {'icon': Icons.percent_rounded, 'label': 'Interest Calc', 'desc': 'Loan interest calc', 'color': Color(0xFFDC2626), 'screen': null},
      {'icon': Icons.swap_horiz_rounded, 'label': 'Unit Converter', 'desc': 'Weight, volume units', 'color': Color(0xFF059669), 'screen': null},
      {'icon': Icons.storefront_rounded, 'label': 'Market Rates', 'desc': 'Live mandi prices', 'color': Color(0xFFF59E0B), 'screen': null},
      {'icon': Icons.map_rounded, 'label': 'Soil Test Finder', 'desc': 'Nearest soil lab', 'color': Color(0xFF78716C), 'screen': null},
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
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Farmer Toolbox', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  const SizedBox(height: 4),
                  const Text('Smart tools to help you make better farming decisions', style: TextStyle(fontSize: 13, color: AppColors.textSecondary)),
                  const SizedBox(height: 20),
                  // Weather banner
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF0369A1), Color(0xFF0891B2)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.wb_sunny_rounded, size: 40, color: Colors.amber),
                        const SizedBox(width: 16),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Today\'s Weather', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16)),
                              Text('28°C • Partly Cloudy • Light winds\nGood day for spraying!', style: TextStyle(color: Colors.white70, fontSize: 12, height: 1.4)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                mainAxisSpacing: 14,
                crossAxisSpacing: 14,
                childAspectRatio: 1.5,
              ),
              delegate: SliverChildBuilderDelegate(
                (ctx, i) => GestureDetector(
                  onTap: () {
                    final screen = tools[i]['screen'] as Widget?;
                    if (screen != null) {
                      Navigator.push(ctx, MaterialPageRoute(builder: (_) => screen));
                    } else {
                      ScaffoldMessenger.of(ctx).showSnackBar(
                        SnackBar(content: Text('${tools[i]['label']} - Coming Soon!'), duration: const Duration(seconds: 1)),
                      );
                    }
                  },
                  child: Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.divider),
                      boxShadow: [BoxShadow(color: AppColors.cardShadow, blurRadius: 4, offset: const Offset(0, 2))],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 40,
                          height: 40,
                          decoration: BoxDecoration(
                            color: (tools[i]['color'] as Color).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Icon(tools[i]['icon'] as IconData, color: tools[i]['color'] as Color, size: 22),
                        ),
                        const Spacer(),
                        Text(tools[i]['label'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                        Text(tools[i]['desc'] as String, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                      ],
                    ),
                  ),
                ),
                childCount: tools.length,
              ),
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 20)),
        ],
      ),
    );
  }
}

class _CropCostingTool extends StatefulWidget {
  const _CropCostingTool();

  @override
  State<_CropCostingTool> createState() => _CropCostingToolState();
}

class _CropCostingToolState extends State<_CropCostingTool> {
  double _area = 1;
  double _seedCost = 2000;
  double _fertCost = 5000;
  double _laborCost = 3000;
  double _otherCost = 1000;

  double get _totalCost => (_seedCost + _fertCost + _laborCost + _otherCost) * _area;
  double get _expectedRevenue => _area * 25000;
  double get _profit => _expectedRevenue - _totalCost;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Crop Costing Calculator'), backgroundColor: AppColors.surface),
      backgroundColor: AppColors.background,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Crop Costing Calculator', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.textPrimary)),
            const SizedBox(height: 16),
            _InputField('Area (acres)', _area, (v) => setState(() => _area = v), min: 0.1, max: 100),
            _InputField('Seed Cost (₹/acre)', _seedCost, (v) => setState(() => _seedCost = v)),
            _InputField('Fertilizer Cost (₹/acre)', _fertCost, (v) => setState(() => _fertCost = v)),
            _InputField('Labor Cost (₹/acre)', _laborCost, (v) => setState(() => _laborCost = v)),
            _InputField('Other Costs (₹/acre)', _otherCost, (v) => setState(() => _otherCost = v)),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Color(0xFF1F3A1D), Color(0xFF2C5926)], begin: Alignment.topLeft, end: Alignment.bottomRight),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  _ResultRow('Total Cost', '₹${_totalCost.toStringAsFixed(0)}', Colors.white70, Colors.white),
                  const Divider(color: Colors.white24),
                  _ResultRow('Expected Revenue', '₹${_expectedRevenue.toStringAsFixed(0)}', Colors.white70, const Color(0xFF8CDA4F)),
                  const Divider(color: Colors.white24),
                  _ResultRow('Estimated Profit', '₹${_profit.toStringAsFixed(0)}', Colors.white70, _profit >= 0 ? const Color(0xFF8CDA4F) : Colors.red),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InputField extends StatelessWidget {
  final String label;
  final double value;
  final ValueChanged<double> onChanged;
  final double min;
  final double max;

  const _InputField(this.label, this.value, this.onChanged, {this.min = 0, this.max = 100000});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.textPrimary)),
          const SizedBox(height: 6),
          Slider(
            value: value.clamp(min, max),
            min: min,
            max: max,
            divisions: 100,
            activeColor: AppColors.primary,
            label: value.toStringAsFixed(0),
            onChanged: onChanged,
          ),
          Align(
            alignment: Alignment.centerRight,
            child: Text('₹${value.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w700, color: AppColors.primary)),
          ),
        ],
      ),
    );
  }
}

class _ResultRow extends StatelessWidget {
  final String label;
  final String value;
  final Color labelColor;
  final Color valueColor;

  const _ResultRow(this.label, this.value, this.labelColor, this.valueColor);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Text(label, style: TextStyle(color: labelColor, fontSize: 14)),
          const Spacer(),
          Text(value, style: TextStyle(color: valueColor, fontWeight: FontWeight.w800, fontSize: 18)),
        ],
      ),
    );
  }
}

class _LandAreaTool extends StatefulWidget {
  const _LandAreaTool();

  @override
  State<_LandAreaTool> createState() => _LandAreaToolState();
}

class _LandAreaToolState extends State<_LandAreaTool> {
  final _controller = TextEditingController();
  String _fromUnit = 'Acre';
  String _toUnit = 'Hectare';

  final Map<String, double> _toSqMeter = {
    'Acre': 4046.86,
    'Hectare': 10000,
    'Bigha': 1337.8,
    'Guntha': 101.17,
    'Sq. Meter': 1,
    'Sq. Feet': 0.0929,
  };

  double get _converted {
    final input = double.tryParse(_controller.text) ?? 0;
    return input * (_toSqMeter[_fromUnit]! / _toSqMeter[_toUnit]!);
  }

  @override
  Widget build(BuildContext context) {
    final units = _toSqMeter.keys.toList();
    return Scaffold(
      appBar: AppBar(title: const Text('Land Area Converter'), backgroundColor: AppColors.surface),
      backgroundColor: AppColors.background,
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _controller, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Enter Value', border: OutlineInputBorder()), onChanged: (_) => setState(() {})),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: DropdownButtonFormField<String>(
                  value: _fromUnit,
                  decoration: const InputDecoration(labelText: 'From', border: OutlineInputBorder()),
                  items: units.map((u) => DropdownMenuItem(value: u, child: Text(u))).toList(),
                  onChanged: (v) => setState(() => _fromUnit = v!),
                )),
                const Padding(padding: EdgeInsets.symmetric(horizontal: 12), child: Icon(Icons.swap_horiz_rounded, color: AppColors.primary, size: 28)),
                Expanded(child: DropdownButtonFormField<String>(
                  value: _toUnit,
                  decoration: const InputDecoration(labelText: 'To', border: OutlineInputBorder()),
                  items: units.map((u) => DropdownMenuItem(value: u, child: Text(u))).toList(),
                  onChanged: (v) => setState(() => _toUnit = v!),
                )),
              ],
            ),
            const SizedBox(height: 24),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: AppColors.statIconBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppColors.primary.withOpacity(0.3))),
              child: Column(
                children: [
                  const Text('Result', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                  const SizedBox(height: 8),
                  Text(_converted.toStringAsFixed(4), style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w800, color: AppColors.primary)),
                  Text(_toUnit, style: const TextStyle(color: AppColors.textSecondary, fontSize: 16)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
