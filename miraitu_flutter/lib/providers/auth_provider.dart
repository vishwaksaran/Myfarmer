import 'package:flutter/material.dart';

class UserProfile {
  final String id;
  final String fullName;
  final String phone;
  final String? email;
  final String? avatarUrl;
  final String? farmLocation;
  final String role;
  final bool onboardingCompleted;

  UserProfile({
    required this.id,
    required this.fullName,
    required this.phone,
    this.email,
    this.avatarUrl,
    this.farmLocation,
    this.role = 'farmer',
    this.onboardingCompleted = false,
  });
}

class AppAuthProvider extends ChangeNotifier {
  UserProfile? _user;
  bool _isLoading = false;
  String? _error;
  String? _pendingPhone;

  UserProfile? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _user != null;
  String? get pendingPhone => _pendingPhone;

  Future<void> sendOtp(String phone) async {
    _isLoading = true;
    _error = null;
    _pendingPhone = phone;
    notifyListeners();
    await Future.delayed(const Duration(seconds: 1));
    _isLoading = false;
    notifyListeners();
  }

  Future<bool> verifyOtp(String otp) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    await Future.delayed(const Duration(seconds: 1));
    if (otp == '123456') {
      _user = UserProfile(
        id: 'user_001',
        fullName: 'Farmer User',
        phone: _pendingPhone ?? '',
        role: 'farmer',
        onboardingCompleted: true,
      );
      _isLoading = false;
      notifyListeners();
      return true;
    }
    _error = 'Invalid OTP. Please try again.';
    _isLoading = false;
    notifyListeners();
    return false;
  }

  void signOut() {
    _user = null;
    _pendingPhone = null;
    notifyListeners();
  }
}
