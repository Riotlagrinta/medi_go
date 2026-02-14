import 'package:flutter/material.dart';
import 'dart:convert';
import '../services/api_service.dart';
import 'payment_screen.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<dynamic> reservations = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    try {
      final response = await ApiService.get('/reservations/reservations');
      if (response.statusCode == 200) {
        setState(() => reservations = jsonDecode(response.body));
      }
    } catch (e) {
      debugPrint('Error: $e');
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Mes Commandes', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
              const Text('Historique et suivi en direct', style: TextStyle(fontSize: 14, color: Color(0xFF64748B))),
              const SizedBox(height: 32),
              Expanded(
                child: loading
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFF059669)))
                    : reservations.isEmpty
                        ? _buildEmptyState()
                        : RefreshIndicator(
                            onRefresh: _fetchOrders,
                            color: const Color(0xFF059669),
                            child: ListView.builder(
                              itemCount: reservations.length,
                              itemBuilder: (context, index) {
                                final item = reservations[index];
                                return _buildOrderCard(item);
                              },
                            ),
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_bag_outlined, size: 64, color: const Color(0xFF94A3B8).withOpacity(0.5)),
          const SizedBox(height: 16),
          const Text('Aucune commande en cours', style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildOrderCard(dynamic item) {
    final status = item['status'] ?? 'pending';
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: const Color(0xFFF1F5F9)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.shopping_bag, size: 20, color: Color(0xFF64748B)),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item['medication_name'] ?? 'Médicament', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Text('Qté: ${item['quantity']}', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
              _buildStatusBadge(status),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              const Icon(Icons.store, size: 14, color: Color(0xFF94A3B8)),
              const SizedBox(width: 4),
              Text(item['pharmacy_name'] ?? 'Pharmacie', style: const TextStyle(color: Color(0xFF64748B), fontSize: 12, fontWeight: FontWeight.w500)),
            ],
          ),
          const SizedBox(height: 16),
          const Divider(height: 1, color: Color(0xFFF1F5F9)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(item['created_at'] != null ? item['created_at'].substring(0, 10) : '', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
              Text('${item['price']} F', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 18, color: Color(0xFF0F172A))),
            ],
          ),
          if (status == 'pending') ...[
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => PaymentScreen(
                      reservationId: item['id'],
                      amount: (item['price'] as num).toDouble(),
                    ),
                  ),
                );
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF059669),
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                elevation: 0,
              ),
              child: const Text('Payer maintenant', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color = Colors.blue;
    Color bg = Colors.blue.shade50;
    String label = status.toUpperCase();

    if (status == 'paid') {
      color = const Color(0xFF059669);
      bg = const Color(0xFFECFDF5);
      label = 'PAYÉ';
    } else if (status == 'pending') {
      color = const Color(0xFFD97706);
      bg = const Color(0xFFFFFBEB);
      label = 'EN ATTENTE';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
      child: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w900, fontSize: 9)),
    );
  }
}
