import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiService {
  static const String baseUrl = 'https://medigo-api-vxrv.onrender.com/api';
  
  // Instance de stockage chiffré
  static const _storage = FlutterSecureStorage();

  static Future<String?> getToken() async {
    return await _storage.read(key: 'token');
  }

  static Future<void> saveToken(String token) async {
    await _storage.write(key: 'token', value: token);
  }

  static Future<void> saveUser(Map<String, dynamic> user) async {
    await _storage.write(key: 'user', value: jsonEncode(user));
  }

  static Future<Map<String, dynamic>?> getUser() async {
    final userStr = await _storage.read(key: 'user');
    return userStr != null ? jsonDecode(userStr) : null;
  }

  static Future<void> logout() async {
    await _storage.deleteAll();
  }

  static Future<http.Response> get(String endpoint) async {
    final token = await getToken();
    try {
      final response = await http.get(
        Uri.parse('$baseUrl$endpoint'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );
      
      // Auto-logout si token expiré
      if (response.statusCode == 401) {
        await logout();
      }
      
      return response;
    } catch (e) {
      rethrow;
    }
  }

  static Future<http.Response> post(String endpoint, Map<String, dynamic> data) async {
    final token = await getToken();
    return http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: {
        'Content-Type': 'application/json',
        if (token != null) 'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    );
  }
}
