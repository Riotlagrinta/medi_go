import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { api } from '../../src/lib/api';

interface Result {
  pharmacy_id: number; pharmacy_name: string; address: string; phone: string;
  is_on_duty: boolean; medication_id: number; medication_name: string;
  price: string; quantity: number; distance: number;
}

export default function Accueil() {
  const [user, setUser]         = useState<any>(null);
  const [query, setQuery]       = useState('');
  const [results, setResults]   = useState<Result[]>([]);
  const [loading, setLoading]   = useState(false);
  const [coords, setCoords]     = useState({ lat: 6.1372, lng: 1.2255 });
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const saved = await SecureStore.getItemAsync('user');
      if (saved) setUser(JSON.parse(saved));

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      }
    };
    init();
  }, []);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res  = await api.get(`/search?q=${encodeURIComponent(query)}&lat=${coords.lat}&lng=${coords.lng}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch { Alert.alert('Erreur', 'Recherche échouée'); }
    finally   { setLoading(false); }
  };

  const reserve = async (pharmacyId: number, medicationId: number) => {
    try {
      const res = await api.post('/reservations', { pharmacy_id: pharmacyId, medication_id: medicationId, quantity: 1 });
      if (res.ok) { Alert.alert('✅ Réservation confirmée !', 'Rendez-vous dans Commandes'); router.push('/(tabs)/commandes'); }
      else         { const d = await res.json(); Alert.alert('Erreur', d.error); }
    } catch { Alert.alert('Erreur', 'Réservation échouée'); }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} 👋</Text>
          <Text style={styles.subtitle}>Que cherchez-vous aujourd'hui ?</Text>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Paracétamol, Insuline..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={search}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={search} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={{ color: '#fff', fontSize: 18 }}>🔍</Text>}
        </TouchableOpacity>
      </View>

      {/* Résultats */}
      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(_, i) => i.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.medName}>{item.medication_name}</Text>
                {item.is_on_duty && <View style={styles.badge}><Text style={styles.badgeText}>GARDE</Text></View>}
              </View>
              <Text style={styles.pharmName}>📍 {item.pharmacy_name}</Text>
              <Text style={styles.address}>{item.address}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>{parseFloat(item.price).toLocaleString()} F CFA</Text>
                <TouchableOpacity
                  style={styles.reserveBtn}
                  onPress={() => reserve(item.pharmacy_id, item.medication_id)}
                >
                  <Text style={styles.reserveBtnText}>Réserver</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💊</Text>
          <Text style={styles.emptyTitle}>Recherchez un médicament</Text>
          <Text style={styles.emptyDesc}>Trouvez la pharmacie la plus proche qui possède ce dont vous avez besoin.</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f8fafc' },
  header:         { backgroundColor: '#059669', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 },
  greeting:       { fontSize: 22, fontWeight: '900', color: '#fff' },
  subtitle:       { fontSize: 13, color: '#a7f3d0', marginTop: 2 },
  searchBar:      { flexDirection: 'row', margin: 16, gap: 8 },
  searchInput:    { flex: 1, backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: '#0f172a', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  searchBtn:      { backgroundColor: '#059669', borderRadius: 16, width: 52, alignItems: 'center', justifyContent: 'center' },
  card:           { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  medName:        { fontSize: 16, fontWeight: '800', color: '#0f172a', flex: 1 },
  badge:          { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText:      { color: '#fff', fontSize: 9, fontWeight: '800' },
  pharmName:      { fontSize: 13, fontWeight: '700', color: '#059669', marginBottom: 2 },
  address:        { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price:          { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  reserveBtn:     { backgroundColor: '#0f172a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  reserveBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, paddingTop: 80 },
  emptyIcon:      { fontSize: 64, marginBottom: 16 },
  emptyTitle:     { fontSize: 18, fontWeight: '800', color: '#0f172a', textAlign: 'center' },
  emptyDesc:      { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
