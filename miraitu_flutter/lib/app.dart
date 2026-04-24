import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'screens/main_scaffold.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/otp_screen.dart';
import 'screens/livestock/livestock_screen.dart';
import 'screens/machinery/machinery_screen.dart';
import 'screens/crops/crops_screen.dart';
import 'screens/finance/finance_screen.dart';
import 'screens/community/community_screen.dart';
import 'screens/toolbox/toolbox_screen.dart';
import 'screens/services/services_screen.dart';
import 'screens/shop/shop_screen.dart';
import 'screens/sell/sell_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';

class MiraituApp extends StatelessWidget {
  const MiraituApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppAuthProvider()),
        ChangeNotifierProvider(create: (_) => CartProvider()),
      ],
      child: MaterialApp(
        title: 'Miraitu',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        initialRoute: '/',
        routes: {
          '/': (ctx) => const MainScaffold(),
          '/login': (ctx) => const LoginScreen(),
          '/otp': (ctx) => const OtpScreen(),
          '/livestock': (ctx) => const LivestockScreen(),
          '/machinery': (ctx) => const MachineryScreen(),
          '/crops': (ctx) => const CropsScreen(),
          '/finance': (ctx) => const FinanceScreen(),
          '/community': (ctx) => const CommunityScreen(),
          '/toolbox': (ctx) => const ToolboxScreen(),
          '/services': (ctx) => const ServicesScreen(),
          '/shop': (ctx) => const ShopScreen(),
          '/sell': (ctx) => const SellScreen(),
          '/dashboard': (ctx) => const DashboardScreen(),
        },
      ),
    );
  }
}
