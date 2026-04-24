import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';
import '../../widgets/app_header.dart';

class CommunityScreen extends StatefulWidget {
  const CommunityScreen({super.key});

  @override
  State<CommunityScreen> createState() => _CommunityScreenState();
}

class _CommunityScreenState extends State<CommunityScreen> {
  final List<Map<String, dynamic>> _posts = [
    {'user': 'Gurjeet Singh', 'loc': 'Punjab', 'time': '2h ago', 'content': 'My wheat crop is ready! Got amazing yield this year using drip irrigation. Thank you Miraitu community for the soil testing advice! 🌾', 'likes': 48, 'comments': 12, 'tag': 'Wheat', 'liked': false},
    {'user': 'Meena Devi', 'loc': 'Haryana', 'time': '4h ago', 'content': 'Looking for Murrah buffalo near Karnal area. Budget ₹90,000 - ₹1,20,000. Should be producing minimum 15L/day. Please contact if anyone is selling.', 'likes': 23, 'comments': 8, 'tag': 'Livestock', 'liked': true},
    {'user': 'Ramu Patel', 'loc': 'Gujarat', 'time': '6h ago', 'content': 'Important: Onion prices in Lasalgaon mandi dropped to ₹800/qtl today. Farmers should wait for prices to recover before selling. Market expected to improve in 2 weeks.', 'likes': 102, 'comments': 34, 'tag': 'Market Tips', 'liked': false},
    {'user': 'Suresh Farmer', 'loc': 'Maharashtra', 'time': '1d ago', 'content': 'Drone spraying service completed 50 acres today in just 4 hours! Cost ₹400/acre vs ₹900/acre for manual spraying. Highly recommend trying it for large farms.', 'likes': 67, 'comments': 19, 'tag': 'Technology', 'liked': false},
  ];

  @override
  Widget build(BuildContext context) {
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
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: Row(
                children: [
                  const Text('Farmer Community', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => _showNewPost(context),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(20)),
                      child: const Row(
                        children: [
                          Icon(Icons.add_rounded, color: Colors.white, size: 16),
                          SizedBox(width: 4),
                          Text('Post', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          // Topics
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(0, 14, 0, 0),
              child: SizedBox(
                height: 36,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: ['All', 'Market Tips', 'Livestock', 'Wheat', 'Technology', 'Weather', 'Soil']
                      .map((t) => Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                    decoration: BoxDecoration(
                      color: t == 'All' ? AppColors.primary : AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: t == 'All' ? AppColors.primary : AppColors.divider),
                    ),
                    child: Text(t, style: TextStyle(
                      color: t == 'All' ? Colors.white : AppColors.textSecondary,
                      fontSize: 12, fontWeight: FontWeight.w600,
                    )),
                  )).toList(),
                ),
              ),
            ),
          ),
          SliverList(
            delegate: SliverChildBuilderDelegate(
              (ctx, i) => Padding(
                padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
                child: _PostCard(
                  post: _posts[i],
                  onLike: () => setState(() => _posts[i]['liked'] = !(_posts[i]['liked'] as bool)),
                ),
              ),
              childCount: _posts.length,
            ),
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 20)),
        ],
      ),
    );
  }

  void _showNewPost(BuildContext context) {
    final controller = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('New Post', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              TextField(
                controller: controller,
                maxLines: 4,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'Share your experience, tips, or ask questions...',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 14),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(ctx),
                  child: const Text('Post to Community'),
                ),
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
    );
  }
}

class _PostCard extends StatelessWidget {
  final Map<String, dynamic> post;
  final VoidCallback onLike;
  const _PostCard({required this.post, required this.onLike});

  @override
  Widget build(BuildContext context) {
    final liked = post['liked'] as bool;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.divider),
        boxShadow: [BoxShadow(color: AppColors.cardShadow, blurRadius: 4, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(radius: 20, backgroundColor: AppColors.statIconBg, child: Text((post['user'] as String)[0], style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 16))),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(post['user'] as String, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                    Row(
                      children: [
                        const Icon(Icons.location_on_rounded, size: 11, color: AppColors.textSecondary),
                        Text(post['loc'] as String, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                        const SizedBox(width: 6),
                        Text('• ${post['time']}', style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                      ],
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: AppColors.statIconBg, borderRadius: BorderRadius.circular(10)),
                child: Text('#${post['tag']}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primary)),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(post['content'] as String, style: const TextStyle(fontSize: 14, color: AppColors.textPrimary, height: 1.5)),
          const SizedBox(height: 12),
          Row(
            children: [
              GestureDetector(
                onTap: onLike,
                child: Row(
                  children: [
                    Icon(liked ? Icons.favorite_rounded : Icons.favorite_border_rounded, size: 20, color: liked ? Colors.red : AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text('${post['likes']}', style: TextStyle(color: liked ? Colors.red : AppColors.textSecondary, fontWeight: FontWeight.w600, fontSize: 13)),
                  ],
                ),
              ),
              const SizedBox(width: 20),
              Row(
                children: [
                  const Icon(Icons.chat_bubble_outline_rounded, size: 18, color: AppColors.textSecondary),
                  const SizedBox(width: 4),
                  Text('${post['comments']}', style: const TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.w600, fontSize: 13)),
                ],
              ),
              const Spacer(),
              const Icon(Icons.share_outlined, size: 18, color: AppColors.textSecondary),
            ],
          ),
        ],
      ),
    );
  }
}
