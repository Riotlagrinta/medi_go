import 'package:flutter/material.dart';
import '../services/api_service.dart';

class PaymentScreen extends StatefulWidget {
  final int reservationId;
  final double amount;

  const PaymentScreen({
    super.key,
    required this.reservationId,
    required this.amount,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String? selectedMethod;
  final TextEditingController _phoneController = TextEditingController();
  bool loading = false;
  String? errorText;

  bool _validateTogoNumber(String value) {
    final regex = RegExp(r'^(90|91|92|93|96|97|98|99|70)\d{6}$');
    return regex.hasMatch(value.replaceAll(' ', ''));
  }

  Future<void> _processPayment() async {
    if (selectedMethod == null) return;

    if ((selectedMethod == 'tmoney' || selectedMethod == 'flooz') &&
        !_validateTogoNumber(_phoneController.text)) {
      setState(() => errorText = "Numéro Togo valide requis (8 chiffres)");
      return;
    }

    setState(() {
      loading = true;
      errorText = null;
    });

    try {
      // Pour l'instant, on simule l'appel API qui sera lié à FedaPay
      final response = await ApiService.post('/payments/initialize', {
        'reservation_id': widget.reservationId,
        'amount': widget.amount,
        'payment_method': selectedMethod,
        'phone': _phoneController.text,
      });

      if (response.statusCode == 201) {
        // En cas de succès, on affiche un message de réussite
        if (mounted) {
          _showSuccessDialog();
        }
      } else {
        setState(() => errorText = "Erreur lors de l'initialisation");
      }
    } catch (e) {
      setState(() => errorText = "Serveur injoignable");
    } finally {
      setState(() => loading = false);
    }
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(color: Color(0xFFECFDF5), shape: BoxShape.circle),
              child: const Icon(Icons.check_circle, color: Color(0xFF059669), size: 64),
            ),
            const SizedBox(height: 24),
            const Text('Commande Validée !', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
            const SizedBox(height: 12),
            const Text(
              'Votre paiement est en cours de traitement. Vous recevrez un SMS de confirmation.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Color(0xFF64748B)),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () {
                Navigator.of(context).pop();
                Navigator.of(context).pop();
              },
              child: const Text('Suivre ma commande'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Color(0xFF0F172A)),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Paiement', style: TextStyle(color: Color(0xFF0F172A), fontWeight: FontWeight.w900)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildAmountCard(),
            const SizedBox(height: 32),
            const Text('MODE DE PAIEMENT', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 2)),
            const SizedBox(height: 16),
            _buildPaymentOption('tmoney', 'T-Money', 'Togocom', const Color(0xFFFFD600), Icons.smartphone),
            _buildPaymentOption('flooz', 'Flooz', 'Moov Money', const Color(0xFF0F172A), Icons.smartphone),
            _buildPaymentOption('card', 'Carte Bancaire', 'Visa, Mastercard', const Color(0xFF2563EB), Icons.credit_card),
            _buildPaymentOption('delivery', 'Paiement à la livraison', 'Espèces ou Mobile', const Color(0xFF059669), Icons.local_shipping),
            
            if (selectedMethod == 'tmoney' || selectedMethod == 'flooz') ...[
              const SizedBox(height: 32),
              const Text('COORDONNÉES TOGO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 2)),
              const SizedBox(height: 16),
              TextField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, letterSpacing: 4),
                decoration: InputDecoration(
                  hintText: '90 00 00 00',
                  hintStyle: const TextStyle(fontSize: 16, letterSpacing: 1),
                  prefixIcon: const Icon(Icons.phone_android),
                  errorText: errorText,
                ),
              ),
            ],
            
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: (selectedMethod == null || loading) ? null : _processPayment,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0F172A),
                minimumSize: const Size(double.infinity, 64),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
              ),
              child: loading 
                ? const CircularProgressIndicator(color: Colors.white)
                : const Text('Confirmer le paiement', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAmountCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text('Total à payer', style: TextStyle(color: Color(0xFF64748B), fontWeight: FontWeight.bold)),
          Text('${widget.amount.toInt()} F', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Color(0xFF059669))),
        ],
      ),
    );
  }

  Widget _buildPaymentOption(String id, String name, String subtitle, Color color, IconData icon) {
    bool isSelected = selectedMethod == id;
    return GestureDetector(
      onTap: () => setState(() => selectedMethod = id),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: isSelected ? const Color(0xFF059669) : const Color(0xFFF1F5F9), width: 2),
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  Text(subtitle, style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
                ],
              ),
            ),
            if (isSelected) const Icon(Icons.check_circle, color: Color(0xFF059669)),
          ],
        ),
      ),
    );
  }
}
