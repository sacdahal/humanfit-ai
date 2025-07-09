// API service for Flutter mobile app

import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:8000'; // Update for production

  static Future<String> ping() async {
    final response = await http.get(Uri.parse('$baseUrl/ping'));
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return data['message'] ?? 'pong';
    } else {
      return 'Error: ${response.statusCode}';
    }
  }

  static Future<String> createUser(int id, String name, String email) async {
    final response = await http.post(
      Uri.parse('$baseUrl/users'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'id': id, 'name': name, 'email': email}),
    );
    if (response.statusCode == 200) {
      return 'User created: ${response.body}';
    } else {
      return 'Error: ${response.statusCode}';
    }
  }

  static Future<String> createAvatar(int id, int userId, String meshUrl, String textureUrl) async {
    final response = await http.post(
      Uri.parse('$baseUrl/avatars'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'id': id, 'user_id': userId, 'mesh_url': meshUrl, 'texture_url': textureUrl}),
    );
    if (response.statusCode == 200) {
      return 'Avatar created: ${response.body}';
    } else {
      return 'Error: ${response.statusCode}';
    }
  }

  static Future<String> listGarments() async {
    final response = await http.get(Uri.parse('$baseUrl/garments'));
    if (response.statusCode == 200) {
      return 'Garments: ${response.body}';
    } else {
      return 'Error: ${response.statusCode}';
    }
  }

  static Future<String> createGarment(int id, String name, String category, String assetUrl) async {
    final response = await http.post(
      Uri.parse('$baseUrl/garments'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'id': id, 'name': name, 'category': category, 'asset_url': assetUrl}),
    );
    if (response.statusCode == 200) {
      return 'Garment created: ${response.body}';
    } else {
      return 'Error: ${response.statusCode}';
    }
  }

  static Future<String> recommend(Map<String, dynamic> userProfile, List<String> garmentCatalog) async {
    final response = await http.post(
      Uri.parse('$baseUrl/recommend'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'user_profile': userProfile,
        'garment_catalog': garmentCatalog,
      }),
    );
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      return 'Recommendation: ${data['recommendations'].join(', ')}';
    } else {
      return 'Error: ${response.statusCode}';
    }
  }
}
