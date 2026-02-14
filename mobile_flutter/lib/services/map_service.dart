import 'package:url_launcher/url_launcher.dart';

class MapService {
  static Future<void> openOnDutyPharmacies() async {
    // Recherche spécifique pour le Togo / Lomé
    const String query = "pharmacies de garde Lomé Togo";
    final Uri googleMapsUrl = Uri.parse("https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(query)}");
    
    if (await canLaunchUrl(googleMapsUrl)) {
      await launchUrl(googleMapsUrl, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not open the map.';
    }
  }

  static Future<void> openSpecificPharmacy(String name, String address) async {
    final String query = "$name $address Togo";
    final Uri googleMapsUrl = Uri.parse("https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(query)}");

    if (await canLaunchUrl(googleMapsUrl)) {
      await launchUrl(googleMapsUrl, mode: LaunchMode.externalApplication);
    }
  }
}
