import { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator
} from 'react-native';
import { api } from '../../src/lib/api';

type Tab = 'reservations' | 'appointments';

const STATUS_COLOR: Record<string, string> = {
  pending:   '#fef3c7',
  confirmed: '#d1fae5',
  cancelled: '#fee2e2',
  picked_up: '#e0e7ff',
};
const STATUS_TEXT: Record<string, string> = {
  pending:   '⏳ En attente',
  confirmed: '✅ Confirmée',
  cancelled: '❌ Annulée',
  picked_up: '🎁 Récupérée',
};
const STATUS_COLOR_TXT: Record<string, string> = {
  pending: '#92400e', confirmed: '#065f46', cancelled: '#991b1b', picked_up: '#3730a3',
};

export default function Commandes() {
  const [tab, setTab]                   = useState<Tab>('reservations');
  const [reservations, setReservations] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [r, a] = await Promise.all([api.get('/reservations'), api.get('/appointments')]);
        if (r.ok) setReservations(await r.json());
        if (a.ok) setAppointments(await a.json());
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const data = tab === 'reservations' ? reservations : appointments;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Suivi Santé</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['reservations', 'appointments'] as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'reservations' ? `📦 Achats (${reservations.length})` : `📅 RDV (${appointments.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.centered}><ActivityIndicator color="#059669" size="large" /></View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>{tab === 'reservations' ? '📦' : '📅'}</Text>
              <Text style={styles.emptyText}>Aucun élément pour le moment</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>
                  {tab === 'reservations' ? item.medication_name : item.reason}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] ?? '#f1f5f9' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLOR_TXT[item.status] ?? '#475569' }]}>
                    {STATUS_TEXT[item.status] ?? item.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.cardSub}>📍 {item.pharmacy_name}</Text>
              {tab === 'reservations' && (
                <Text style={styles.cardPrice}>{parseFloat(item.price).toLocaleString()} F CFA</Text>
              )}
              {tab === 'appointments' && (
                <Text style={styles.cardSub}>
                  📅 {new Date(item.appointment_date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                </Text>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: '#f8fafc' },
  header:          { backgroundColor: '#0f172a', paddingTop: 52, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle:     { fontSize: 22, fontWeight: '900', color: '#fff' },
  tabs:            { flexDirection: 'row', margin: 16, gap: 8 },
  tab:             { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tabActive:       { backgroundColor: '#059669' },
  tabText:         { fontSize: 12, fontWeight: '700', color: '#64748b' },
  tabTextActive:   { color: '#fff' },
  centered:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty:           { alignItems: 'center', paddingTop: 60 },
  emptyIcon:       { fontSize: 48, marginBottom: 12 },
  emptyText:       { fontSize: 15, color: '#94a3b8', fontWeight: '600' },
  card:            { backgroundColor: '#fff', borderRadius: 20, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle:       { fontSize: 15, fontWeight: '800', color: '#0f172a', flex: 1, marginRight: 8 },
  statusBadge:     { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText:      { fontSize: 10, fontWeight: '800' },
  cardSub:         { fontSize: 12, color: '#64748b', marginBottom: 4 },
  cardPrice:       { fontSize: 16, fontWeight: '900', color: '#059669', marginTop: 4 },
});
