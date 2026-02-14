import 'package:flutter/material.dart';
import 'dart:convert';
import '../services/api_service.dart';

class PharmacyDashboardScreen extends StatefulWidget {
  const PharmacyDashboardScreen({super.key});

  @override
  State<PharmacyDashboardScreen> createState() => _PharmacyDashboardScreenState();
}

class _PharmacyDashboardScreenState extends State<PharmacyDashboardScreen> {
  List<dynamic> prescriptions = [];
  List<dynamic> lowStocks = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _fetchPharmacyData();
  }

  Future<void> _fetchPharmacyData() async {
    try {
      final user = await ApiService.getUser();
      if (user == null || user['pharmacy_id'] == null) return;

      final pharmacyId = user['pharmacy_id'];
      
      final responses = await Future.wait([
        ApiService.get('/prescriptions'), // L'API filtre déjà par pharmacy_id pour pharmacy_admin
        ApiService.get('/pharmacies/$pharmacyId/stocks'),
      ]);

      if (responses[0].statusCode == 200) {
        prescriptions = jsonDecode(responses[0].body);
      }
      if (responses[1].statusCode == 200) {
        final allStocks = jsonDecode(responses[1].body) as List;
        lowStocks = allStocks.where((s) => s['quantity'] < 10).toList();
      }
    } catch (e) {
      debugPrint('Pharmacy Dashboard error: $e');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _updatePrescriptionStatus(int id, String status) async {
    try {
      final response = await ApiService.post('/prescriptions/$id/status', {
        'status': status,
      });
      if (response.statusCode == 200) {
        _fetchPharmacyData();
      }
    } catch (e) {
      debugPrint('Status update error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: const Color(0xFFF8FAFC),
        appBar: AppBar(
          backgroundColor: Colors.white,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
            onPressed: () => Navigator.pop(context),
          ),
          title: const Text('Ma Pharmacie', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w900)),
          bottom: const TabBar(
            labelColor: Color(0xFF059669),
            unselectedLabelColor: Color(0xFF94A3B8),
            indicatorColor: Color(0xFF059669),
            tabs: [
              Tab(text: 'Ordonnances'),
              Tab(text: 'Alertes Stocks'),
            ],
          ),
        ),
        body: loading 
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF059669)))
          : TabBarView(
              children: [
                _buildPrescriptionsList(),
                _buildStocksList(),
              ],
            ),
      ),
    );
  }

  Widget _buildPrescriptionsList() {
    if (prescriptions.isEmpty) {
      return const Center(child: Text('Aucune ordonnance reçue', style: TextStyle(color: Color(0xFF94A3B8))));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: prescriptions.length,
      itemBuilder: (context, index) {
        final p = prescriptions[index];
        final bool isPending = p['status'] == 'pending';
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(24), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)]),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(p['users']?['full_name'] ?? 'Patient Anonyme', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  _buildStatusBadge(p['status']),
                ],
              ),
              const SizedBox(height: 8),
              Text('Reçue le ${p['created_at'].substring(0, 10)}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
              const SizedBox(height: 16),
              if (isPending)
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => _updatePrescriptionStatus(p['id'], 'ready'),
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF059669), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                        child: const Text('Marquer comme prête', style: TextStyle(fontSize: 12)),
                      ),
                    ),
                  ],
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStocksList() {
    if (lowStocks.isEmpty) {
      return const Center(child: Text('Tout est en stock 👍', style: TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.bold)));
    }
    return ListView.builder(
      padding: const EdgeInsets.all(24),
      itemCount: lowStocks.length,
      itemBuilder: (context, index) {
        final s = lowStocks[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: const Color(0xFFFFF1F2), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFFECDD3))),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(s['name'], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF9F1239))),
                  Text('Stock critique', style: TextStyle(color: const Color(0xFFE11D48).withOpacity(0.7), fontSize: 11)),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
                child: Text('${s['quantity']} restants', style: const TextStyle(color: Color(0xFFE11D48), fontWeight: FontWeight.black, fontSize: 12)),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color = status == 'ready' ? const Color(0xFF059669) : const Color(0xFFD97706);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
      child: Text(status.toUpperCase(), style: TextStyle(color: color, fontWeight: FontWeight.black, fontSize: 9)),
    );
  }
}
