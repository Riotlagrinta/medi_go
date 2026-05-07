import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { api } from '../../src/lib/api';

interface Pharmacy {
  pharmacy_id: number; pharmacy_name: string; address: string;
  phone: string; is_on_duty: boolean; lat: number; lng: number;
}

export default function Carte() {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading]       = useState(true);
  const [region, setRegion]         = useState({
    latitude: 6.1372, longitude: 1.2255, latitudeDelta: 0.08, longitudeDelta: 0.08,
  });

  useEffect(() => {
    const init = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      let lat = 6.1372, lng = 1.2255;
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        lat = loc.coords.latitude; lng = loc.coords.longitude;
        setRegion({ latitude: lat, longitude: lng, latitudeDelta: 0.05, longitudeDelta: 0.05 });
      }
      try {
        const res  = await api.get(`/search?q=&lat=${lat}&lng=${lng}&radius=10000`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const unique = Array.from(new Map(data.map((r: any) => [r.pharmacy_id, r])).values()) as Pharmacy[];
          setPharmacies(unique);
        }
      } catch {}
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#059669" />
      <Text style={styles.loadingText}>Chargement de la carte...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carte des pharmacies</Text>
        <Text style={styles.headerSub}>{pharmacies.length} pharmacies trouvées</Text>
      </View>

      <MapView style={styles.map} region={region} showsUserLocation showsMyLocationButton>
        {pharmacies.map((p) => (
          <Marker
            key={p.pharmacy_id}
            coordinate={{ latitude: p.lat || 6.1372, longitude: p.lng || 1.2255 }}
            pinColor={p.is_on_duty ? '#ef4444' : '#059669'}
          >
            <Callout>
              <View style={styles.callout}>
                <Text style={styles.calloutName}>{p.pharmacy_name}</Text>
                <Text style={styles.calloutAddress}>{p.address}</Text>
                {p.is_on_duty && <Text style={styles.calloutGuard}>🔴 DE GARDE</Text>}
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${p.phone}`)}>
                  <Text style={styles.calloutPhone}>📞 Appeler</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  centered:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText:    { marginTop: 12, color: '#64748b', fontSize: 14 },
  header:         { backgroundColor: '#fff', paddingTop: 52, paddingBottom: 12, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle:    { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  headerSub:      { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  map:            { flex: 1 },
  callout:        { width: 180, padding: 8 },
  calloutName:    { fontWeight: '800', fontSize: 13, color: '#0f172a', marginBottom: 4 },
  calloutAddress: { fontSize: 11, color: '#64748b', marginBottom: 4 },
  calloutGuard:   { fontSize: 11, fontWeight: '700', color: '#ef4444', marginBottom: 4 },
  calloutPhone:   { fontSize: 12, fontWeight: '700', color: '#059669' },
});
