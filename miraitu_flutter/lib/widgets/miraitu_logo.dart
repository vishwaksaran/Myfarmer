import 'package:flutter/material.dart';

class MiraituLogo extends StatelessWidget {
  final double size;
  const MiraituLogo({super.key, this.size = 32});

  @override
  Widget build(BuildContext context) {
    return Image.asset(
      'assets/images/miraitu-logo.png',
      height: size,
      fit: BoxFit.contain,
    );
  }
}
