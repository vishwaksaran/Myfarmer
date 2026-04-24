import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../theme/app_colors.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/miraitu_logo.dart';
import 'otp_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phoneController = TextEditingController();
  bool _agreed = false;

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AppAuthProvider>();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.pop(context),
          icon: const Icon(Icons.arrow_back_rounded, color: AppColors.textPrimary),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const SizedBox(height: 20),
            const MiraituLogo(size: 44),
            const SizedBox(height: 32),
            // Illustration
            Container(
              width: 140,
              height: 140,
              decoration: BoxDecoration(
                color: AppColors.statIconBg,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.person_rounded, size: 70, color: AppColors.primary),
            ),
            const SizedBox(height: 28),
            const Text(
              'Welcome to Miraitu',
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: AppColors.textPrimary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'India\'s #1 Agriculture Super App\nSign in to continue',
              style: TextStyle(fontSize: 15, color: AppColors.textSecondary, height: 1.5),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 36),
            // Phone input
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.divider),
                boxShadow: [BoxShadow(color: AppColors.cardShadow, blurRadius: 8, offset: const Offset(0, 2))],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
                    decoration: const BoxDecoration(
                      border: Border(right: BorderSide(color: AppColors.divider)),
                    ),
                    child: const Row(
                      children: [
                        Text('🇮🇳', style: TextStyle(fontSize: 20)),
                        SizedBox(width: 6),
                        Text('+91', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: AppColors.textPrimary)),
                        SizedBox(width: 4),
                        Icon(Icons.keyboard_arrow_down_rounded, size: 18, color: AppColors.textSecondary),
                      ],
                    ),
                  ),
                  Expanded(
                    child: TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      maxLength: 10,
                      inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                      decoration: const InputDecoration(
                        hintText: 'Enter mobile number',
                        border: InputBorder.none,
                        enabledBorder: InputBorder.none,
                        focusedBorder: InputBorder.none,
                        filled: false,
                        contentPadding: EdgeInsets.symmetric(horizontal: 14),
                        counterText: '',
                      ),
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, letterSpacing: 1.5),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Terms agreement
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Checkbox(
                  value: _agreed,
                  onChanged: (v) => setState(() => _agreed = v ?? false),
                  activeColor: AppColors.primary,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _agreed = !_agreed),
                    child: const Padding(
                      padding: EdgeInsets.only(top: 10),
                      child: Text.rich(
                        TextSpan(
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          children: [
                            TextSpan(text: 'I agree to the '),
                            TextSpan(text: 'Terms of Service', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                            TextSpan(text: ' and '),
                            TextSpan(text: 'Privacy Policy', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),
            // OTP Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                onPressed: (_agreed && !auth.isLoading) ? _sendOtp : null,
                child: auth.isLoading
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Send OTP', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              ),
            ),
            const SizedBox(height: 24),
            // Divider
            const Row(
              children: [
                Expanded(child: Divider()),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 16),
                  child: Text('or', style: TextStyle(color: AppColors.textHint, fontSize: 13)),
                ),
                Expanded(child: Divider()),
              ],
            ),
            const SizedBox(height: 24),
            // Google sign in
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.g_mobiledata_rounded, size: 24),
                label: const Text('Continue with Google', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
              ),
            ),
            const SizedBox(height: 40),
            // Features bullets
            const _LoginFeatures(),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Future<void> _sendOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.length != 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter valid 10-digit mobile number'), backgroundColor: AppColors.error),
      );
      return;
    }
    final auth = context.read<AppAuthProvider>();
    await auth.sendOtp('+91$phone');
    if (mounted) {
      Navigator.push(context, MaterialPageRoute(builder: (_) => const OtpScreen()));
    }
  }
}

class _LoginFeatures extends StatelessWidget {
  const _LoginFeatures();

  @override
  Widget build(BuildContext context) {
    const features = [
      (Icons.verified_rounded, 'Verified Sellers & Buyers'),
      (Icons.security_rounded, 'Secure Transactions'),
      (Icons.support_agent_rounded, '24/7 Farmer Support'),
    ];
    return Column(
      children: features.map((f) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 6),
        child: Row(
          children: [
            Icon(f.$1, color: AppColors.success, size: 20),
            const SizedBox(width: 10),
            Text(f.$2, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500, color: AppColors.textSecondary)),
          ],
        ),
      )).toList(),
    );
  }
}
