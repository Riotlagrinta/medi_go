import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/login_screen.dart';
import 'screens/main_navigation.dart';
import 'services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  bool isTokenValid = false;
  final token = await ApiService.getToken();
  
  if (token != null) {
    try {
      // On vérifie si le token est réellement valide auprès du serveur
      final response = await ApiService.get('/auth/me');
      if (response.statusCode == 200) {
        isTokenValid = true;
      } else {
        await ApiService.logout();
      }
    } catch (e) {
      // En cas d'erreur réseau, on garde le token local par défaut (mode offline)
      isTokenValid = true;
    }
  }
  
  runApp(MediGoApp(startWithNav: isTokenValid));
}

class MediGoApp extends StatelessWidget {
  final bool startWithNav;
  const MediGoApp({super.key, required this.startWithNav});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MediGo Togo',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF059669),
          primary: const Color(0xFF059669),
          secondary: const Color(0xFF0F172A),
          surface: const Color(0xFFF8FAFC),
        ),
        textTheme: GoogleFonts.plusJakartaSansTextTheme(
          Theme.of(context).textTheme,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: const BorderSide(color: Color(0xFFF1F5F9)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: const BorderSide(color: Color(0xFFF1F5F9)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(20),
            borderSide: const BorderSide(color: Color(0xFF059669), width: 2),
          ),
          hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.w500),
        ),
      ),
      home: startWithNav ? const MainNavigation() : const LoginScreen(),
      routes: {
        '/login': (context) => const LoginScreen(),
        '/home': (context) => const MainNavigation(),
      },
    );
  }
}
