import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { api } from '../../src/lib/api';

export default function Profil() {
  const [user, setUser]     = useState<any>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const res = await api.get('/auth/me').catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        setUser(data);
        await SecureStore.setItemAsync('user', JSON.stringify(data));
      } else {
        const saved = await SecureStore.getItemAsync('user');
        if (saved) setUser(JSON.parse(saved));
      }
    };
    load();
  }, []);

  const save = async () => {
    setLoading(true);
    try {
      const res = await api.patch('/auth/profile', {
        full_name:    user.full_name,
        phone:        user.phone,
        address:      user.address,
        medical_info: user.medical_info,
      });
      if (res.ok) {
        const updated = await res.json();
        await SecureStore.setItemAsync('user', JSON.stringify(updated));
        Alert.alert('✅', 'Profil mis à jour !');
      } else {
        const e = await res.json();
        Alert.alert('Erreur', e.error);
      }
    } catch { Alert.alert('Erreur', 'Mise à jour échouée'); }
    finally { setLoading(false); }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    router.replace('/connexion');
  };

  const fields = [
    { label: 'Nom complet', key: 'full_name', placeholder: 'Jean Dupont' },
    { label: 'Téléphone',   key: 'phone',     placeholder: '+228 90 00 00 00', type: 'phone-pad' as const },
    { label: 'Adresse',     key: 'address',   placeholder: 'Quartier, Rue, Lomé' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLetter}>{user?.full_name?.charAt(0)?.toUpperCase() ?? '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.full_name || 'Utilisateur'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role === 'pharmacy_admin' ? '🏥 Pharmacie' : '👤 Patient'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        {fields.map((f) => (
          <View key={f.key} style={styles.field}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input}
              value={user[f.key] ?? ''}
              onChangeText={(v) => setUser({ ...user, [f.key]: v })}
              placeholder={f.placeholder}
              keyboardType={f.type}
            />
          </View>
        ))}

        <View style={styles.field}>
          <Text style={styles.label}>Antécédents médicaux</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={user.medical_info ?? ''}
            onChangeText={(v) => setUser({ ...user, medical_info: v })}
            placeholder="Allergies, groupe sanguin..."
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>💾 Enregistrer</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f8fafc' },
  header:       { backgroundColor: '#0f172a', paddingTop: 52, paddingBottom: 32, alignItems: 'center' },
  avatar:       { width: 80, height: 80, borderRadius: 40, backgroundColor: '#059669', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarLetter: { fontSize: 32, fontWeight: '900', color: '#fff' },
  name:         { fontSize: 20, fontWeight: '900', color: '#fff' },
  email:        { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  roleBadge:    { marginTop: 10, backgroundColor: '#1e293b', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  roleText:     { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  section:      { margin: 16, backgroundColor: '#fff', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#0f172a', marginBottom: 16 },
  field:        { marginBottom: 14 },
  label:        { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input:        { backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#0f172a' },
  textarea:     { height: 90, textAlignVertical: 'top' },
  saveBtn:      { backgroundColor: '#059669', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText:  { color: '#fff', fontWeight: '800', fontSize: 15 },
  logoutBtn:    { margin: 16, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: '#fee2e2' },
  logoutText:   { color: '#ef4444', fontWeight: '800', fontSize: 15 },
});
