import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import 'dart:io';
import '../services/api_service.dart';

class PrescriptionsScreen extends StatefulWidget {
  const PrescriptionsScreen({super.key});

  @override
  State<PrescriptionsScreen> createState() => _PrescriptionsScreenState();
}

class _PrescriptionsScreenState extends State<PrescriptionsScreen> {
  List<dynamic> prescriptions = [];
  List<dynamic> pharmacies = [];
  bool loading = true;
  bool uploading = false;
  File? _selectedImage;
  int? _selectedPharmacyId;

  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final responses = await Future.wait([
        ApiService.get('/prescriptions'),
        ApiService.get('/pharmacies'),
      ]);

      if (responses[0].statusCode == 200) {
        prescriptions = jsonDecode(responses[0].body);
      }
      if (responses[1].statusCode == 200) {
        pharmacies = jsonDecode(responses[1].body);
      }
    } catch (e) {
      debugPrint('Data fetch error: $e');
    } finally {
      if (mounted) setState(() => loading = false);
    }
  }

  Future<void> _pickImage(ImageSource source) async {
    final XFile? image = await _picker.pickImage(source: source, imageQuality: 70);
    if (image != null) {
      setState(() {
        _selectedImage = File(image.path);
      });
      _showUploadModal();
    }
  }

  Future<void> _handleUpload() async {
    if (_selectedImage == null || _selectedPharmacyId == null) return;

    setState(() => uploading = true);
    try {
      // Pour l'instant, on simule l'envoi car l'API attend un image_url.
      // Dans une version finale, on uploaderait le fichier vers Supabase Storage ou Cloudinary
      // puis on enverrait l'URL à l'API.
      final response = await ApiService.post('/prescriptions', {
        'pharmacy_id': _selectedPharmacyId,
        'image_url': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500',
      });

      if (response.statusCode == 201) {
        if (mounted) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ordonnance envoyée avec succès !')));
          _fetchData();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Erreur lors de l\'envoi')));
      }
    } finally {
      if (mounted) setState(() => uploading = false);
    }
  }

  void _showUploadModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          height: MediaQuery.of(context).size.height * 0.8,
          decoration: const BoxDecoration(color: Colors.white, borderRadius: BorderRadius.vertical(top: Radius.circular(40))),
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Nouvelle Ordonnance', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                  IconButton(onPressed: () => Navigator.pop(context), icon: const Icon(Icons.close)),
                ],
              ),
              const SizedBox(height: 24),
              ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: Image.file(_selectedImage!, height: 200, width: double.infinity, fit: BoxFit.cover),
              ),
              const SizedBox(height: 32),
              const Text('DESTINATAIRE', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF94A3B8), letterSpacing: 2)),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.builder(
                  itemCount: pharmacies.length,
                  itemBuilder: (context, index) {
                    final pharm = pharmacies[index];
                    final isSelected = _selectedPharmacyId == pharm['id'];
                    return GestureDetector(
                      onTap: () => setModalState(() => _selectedPharmacyId = pharm['id']),
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFFECFDF5) : const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: isSelected ? const Color(0xFF059669) : Colors.transparent),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.store, size: 16, color: isSelected ? const Color(0xFF059669) : const Color(0xFF94A3B8)),
                            const SizedBox(width: 12),
                            Text(pharm['name'], style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? const Color(0xFF059669) : const Color(0xFF1E293B))),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: (uploading || _selectedPharmacyId == null) ? null : _handleUpload,
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0F172A), minimumSize: const Size(double.infinity, 64), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20))),
                child: uploading ? const CircularProgressIndicator(color: Colors.white) : const Text('Envoyer l\'ordonnance'),
              ),
            ],
          ),
        ),
      ),
    );
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text('Ordonnances', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF0F172A))),
                      Text('Suivi de vos envois', style: TextStyle(fontSize: 14, color: Color(0xFF64748B))),
                    ],
                  ),
                  _buildActionButtons(),
                ],
              ),
              const SizedBox(height: 32),
              Expanded(
                child: loading
                    ? const Center(child: CircularProgressIndicator(color: Color(0xFF059669)))
                    : prescriptions.isEmpty
                        ? _buildEmptyState()
                        : ListView.builder(
                            itemCount: prescriptions.length,
                            itemBuilder: (context, index) {
                              final item = prescriptions[index];
                              return _buildPrescriptionCard(item);
                            },
                          ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActionButtons() {
    return Row(
      children: [
        _buildCircleBtn(Icons.camera_alt, () => _pickImage(ImageSource.camera)),
        const SizedBox(width: 12),
        _buildCircleBtn(Icons.photo_library, () => _pickImage(ImageSource.gallery)),
      ],
    );
  }

  Widget _buildCircleBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: const Color(0xFFF1F5F9)), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)]),
        child: Icon(icon, color: const Color(0xFF059669), size: 24),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(color: Colors.white, shape: BoxShape.circle, border: Border.all(color: const Color(0xFFF1F5F9))),
            child: Icon(Icons.description_outlined, size: 48, color: const Color(0xFF94A3B8).withOpacity(0.5)),
          ),
          const SizedBox(height: 16),
          const Text('Aucune ordonnance', style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _buildPrescriptionCard(dynamic item) {
    final bool isReady = item['status'] == 'ready';
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: isReady ? const Color(0xFFECFDF5) : const Color(0xFFF1F5F9)),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16)),
            child: const Icon(Icons.assignment, color: Color(0xFF059669)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['pharmacies']?['name'] ?? 'Pharmacie Locale', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                Text(item['created_at'] != null ? item['created_at'].substring(0, 10) : '', style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(color: isReady ? const Color(0xFFECFDF5) : const Color(0xFFFFFBEB), borderRadius: BorderRadius.circular(12)),
            child: Text(isReady ? 'PRÊTE' : 'EN ATTENTE', style: TextStyle(color: isReady ? const Color(0xFF059669) : const Color(0xFFD97706), fontWeight: FontWeight.w900, fontSize: 10)),
          ),
        ],
      ),
    );
  }
}
