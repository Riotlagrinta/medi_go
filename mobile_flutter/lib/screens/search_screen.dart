import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:shimmer/shimmer.dart';
import '../services/api_service.dart';
import '../services/map_service.dart';
import 'chat_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  List<dynamic> results = [];
  bool loading = false;
  String searchMode = 'medication';
  final TextEditingController _searchController = TextEditingController();

  Future<void> handleSearch(String text) async {
    if (text.length < 2) {
      setState(() => results = []);
      return;
    }

    setState(() => loading = true);
    try {
      final response = await ApiService.get('/search?q=$text&lat=6.1375&lng=1.2123');
      if (response.statusCode == 200) {
        setState(() => results = jsonDecode(response.body));
      }
    } catch (e) {
      debugPrint('Search error: $e');
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
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: const [
                      Text(
                        'Rechercher',
                        style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF0F172A)),
                      ),
                      Text(
                        'Trouvez vos médicaments au Togo',
                        style: TextStyle(fontSize: 14, color: Color(0xFF64748B)),
                      ),
                    ],
                  ),
                  if (searchMode == 'pharmacy')
                    IconButton(
                      onPressed: () => MapService.openOnDutyPharmacies(),
                      icon: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: const Color(0xFFECFDF5),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.map, color: Color(0xFF059669)),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 24),
              
              // Search Bar
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
                  ],
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: handleSearch,
                  decoration: InputDecoration(
                    hintText: searchMode == 'medication' ? 'Nom du médicament...' : 'Pharmacie...',
                    prefixIcon: const Icon(Icons.search, color: Color(0xFF94A3B8)),
                    filled: false,
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Mode Selector
              Row(
                children: [
                  _buildModeChip('Médicaments', 'medication'),
                  const SizedBox(width: 8),
                  _buildModeChip('Pharmacies', 'pharmacy'),
                  const Spacer(),
                  if (searchMode == 'pharmacy')
                    TextButton.icon(
                      onPressed: () => MapService.openOnDutyPharmacies(),
                      icon: const Icon(Icons.emergency, size: 16, color: Color(0xFFD97706)),
                      label: const Text('DE GARDE', style: TextStyle(color: Color(0xFFD97706), fontWeight: FontWeight.bold, fontSize: 10)),
                    ),
                ],
              ),
              const SizedBox(height: 16),

              // Results List
              Expanded(
                child: loading 
                  ? _buildShimmerLoading()
                  : results.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.medication_liquid, size: 64, color: const Color(0xFF94A3B8).withOpacity(0.5)),
                            const SizedBox(height: 16),
                            const Text('Aucun résultat', style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold)),
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: results.length,
                        physics: const BouncingScrollPhysics(),
                        itemBuilder: (context, index) {
                          final item = results[index];
                          return _buildResultCard(item);
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildShimmerLoading() {
    return ListView.builder(
      itemCount: 5,
      itemBuilder: (context, index) {
        return Shimmer.fromColors(
          baseColor: Colors.grey[300]!,
          highlightColor: Colors.grey[100]!,
          child: Container(
            margin: const EdgeInsets.only(bottom: 16),
            height: 140,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
            ),
          ),
        );
      },
    );
  }

  Widget _buildModeChip(String label, String mode) {
    final isSelected = searchMode == mode;
    return GestureDetector(
      onTap: () => setState(() => searchMode = mode),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF059669) : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: isSelected ? const Color(0xFF059669) : const Color(0xFFE2E8F0)),
        ),
        child: Text(
          label,
          style: TextStyle(color: isSelected ? Colors.white : const Color(0xFF64748B), fontWeight: FontWeight.bold, fontSize: 12),
        ),
      ),
    );
  }

  Widget _buildResultCard(dynamic item) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => ChatScreen(
            pharmacyId: item['pharmacy_id'],
            pharmacyName: item['pharmacy_name'],
          ),
        ),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10, offset: const Offset(0, 4))],
          border: Border.all(color: const Color(0xFFF1F5F9)),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(item['pharmacy_name'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      Row(
                        children: [
                          const Icon(Icons.location_on, size: 12, color: Color(0xFF94A3B8)),
                          const SizedBox(width: 4),
                          Expanded(child: Text(item['address'], style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 11), overflow: TextOverflow.ellipsis)),
                        ],
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('${item['price']} F', style: const TextStyle(color: Color(0xFF059669), fontWeight: FontWeight.w900, fontSize: 18)),
                    Text('Stock: ${item['quantity']}', style: const TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold, fontSize: 10)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(16)),
              child: Row(
                children: [
                  const Icon(Icons.medication, color: Color(0xFF059669), size: 16),
                  const SizedBox(width: 12),
                  Text(item['medication_name'], style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF334155))),
                  const Spacer(),
                  const Icon(Icons.message_outlined, color: Color(0xFF059669), size: 18),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
