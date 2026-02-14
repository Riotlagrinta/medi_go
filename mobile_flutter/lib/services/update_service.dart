import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:ota_update/ota_update.dart';
import 'api_service.dart';

class UpdateService {
  // L'URL où sera stocké ton dernier APK (ex: sur ton serveur ou GitHub)
  static const String apkUrl = "https://medigo-api-vxrv.onrender.com/download/medigo-latest.apk";

  static Future<void> checkUpdate(BuildContext context) async {
    try {
      // 1. Récupérer la version actuelle de l'app
      PackageInfo packageInfo = await PackageInfo.fromPlatform();
      String currentVersion = packageInfo.version;

      // 2. Demander à l'API la version la plus récente
      // On simule ici, mais tu devras créer une route GET /api/version
      final response = await ApiService.get('/version');
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        String latestVersion = data['version'];

        if (currentVersion != latestVersion) {
          if (context.mounted) {
            _showUpdateDialog(context, latestVersion);
          }
        }
      }
    } catch (e) {
      debugPrint('Check update error: $e');
    }
  }

  static void _showUpdateDialog(BuildContext context, String newVersion) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            const Icon(Icons.system_update, color: Color(0xFF059669)),
            const SizedBox(width: 12),
            const Text('Mise à jour', style: TextStyle(fontWeight: FontWeight.w900)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Une nouvelle version ($newVersion) est disponible.'),
            const SizedBox(height: 12),
            const Text(
              'Nous recommandons de l'installer pour profiter des dernières sécurités et fonctionnalités.',
              style: TextStyle(color: Color(0xFF64748B), fontSize: 12),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Plus tard', style: TextStyle(color: Color(0xFF94A3B8))),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _executeUpdate(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A)),
            child: const Text('Installer'),
          ),
        ],
      ),
    );
  }

  static void _executeUpdate(BuildContext context) {
    try {
      OtaUpdate().execute(
        apkUrl,
        destinationFilename: 'medigo-update.apk',
      ).listen(
        (OtaEvent event) {
          // On peut afficher une barre de progression ici si on veut
          debugPrint('Update status: ${event.status}, value: ${event.value}');
        },
      );
    } catch (e) {
      debugPrint('Failed to update: $e');
    }
  }
}
