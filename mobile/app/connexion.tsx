import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { api } from '../src/lib/api';

export default function Connexion() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Erreur', 'Veuillez remplir tous les champs'); return; }
    setLoading(true);
    try {
      const res  = await api.post('/auth/login', { email, password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('user',  JSON.stringify(data.user));

      if (data.user.role === 'super_admin')      router.replace('/(tabs)/profil');
      else if (data.user.role === 'pharmacy_admin') router.replace('/(tabs)/dashboard');
      else                                          router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Connexion échouée', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.outer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logo}>
          <Text style={styles.logoText}>💊</Text>
          <Text style={styles.title}>MediGo</Text>
          <Text style={styles.subtitle}>Votre santé au Togo</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="nom@exemple.tg"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Se connecter</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/inscription')}>
            <Text style={styles.link}>Pas encore de compte ? <Text style={styles.linkBold}>S'inscrire</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer:     { flex: 1, backgroundColor: '#059669' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo:      { alignItems: 'center', marginBottom: 32 },
  logoText:  { fontSize: 56, marginBottom: 8 },
  title:     { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  subtitle:  { fontSize: 14, color: '#a7f3d0', marginTop: 4 },
  card:      { backgroundColor: '#fff', borderRadius: 28, padding: 28, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
  label:     { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input:     { backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, fontSize: 15, color: '#0f172a' },
  btn:       { backgroundColor: '#059669', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#059669', shadowOpacity: 0.4, shadowRadius: 10, elevation: 4 },
  btnText:   { color: '#fff', fontWeight: '800', fontSize: 16 },
  link:      { textAlign: 'center', marginTop: 20, color: '#64748b', fontSize: 13 },
  linkBold:  { color: '#059669', fontWeight: '800' },
});
