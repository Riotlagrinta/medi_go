import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { api } from '../src/lib/api';

export default function Inscription() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!fullName || !email || !password) { Alert.alert('Erreur', 'Tous les champs sont requis'); return; }
    if (password !== confirm) { Alert.alert('Erreur', 'Les mots de passe ne correspondent pas'); return; }
    setLoading(true);
    try {
      const res  = await api.post('/auth/register', { full_name: fullName, email, password, role: 'patient' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      await SecureStore.setItemAsync('token', data.token);
      await SecureStore.setItemAsync('user',  JSON.stringify(data.user));
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Inscription échouée', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.outer} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoignez MediGo dès aujourd'hui</Text>
        </View>

        <View style={styles.card}>
          {[
            { label: 'Nom complet', value: fullName, set: setFullName, placeholder: 'Jean Dupont' },
            { label: 'Email', value: email, set: setEmail, placeholder: 'jean@exemple.tg', type: 'email-address' as const },
            { label: 'Mot de passe', value: password, set: setPassword, placeholder: '••••••••', secure: true },
            { label: 'Confirmer le mot de passe', value: confirm, set: setConfirm, placeholder: '••••••••', secure: true },
          ].map((f) => (
            <View key={f.label}>
              <Text style={styles.label}>{f.label}</Text>
              <TextInput
                style={styles.input}
                value={f.value}
                onChangeText={f.set}
                placeholder={f.placeholder}
                secureTextEntry={f.secure}
                keyboardType={f.type}
                autoCapitalize="none"
              />
            </View>
          ))}

          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Créer mon compte</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/connexion')}>
            <Text style={styles.link}>Déjà inscrit ? <Text style={styles.linkBold}>Se connecter</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  outer:     { flex: 1, backgroundColor: '#059669' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header:    { alignItems: 'center', marginBottom: 28 },
  title:     { fontSize: 28, fontWeight: '900', color: '#fff' },
  subtitle:  { fontSize: 13, color: '#a7f3d0', marginTop: 4 },
  card:      { backgroundColor: '#fff', borderRadius: 28, padding: 28, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 8 },
  label:     { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input:     { backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 16, fontSize: 15, color: '#0f172a' },
  btn:       { backgroundColor: '#059669', borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowColor: '#059669', shadowOpacity: 0.4, shadowRadius: 10, elevation: 4 },
  btnText:   { color: '#fff', fontWeight: '800', fontSize: 16 },
  link:      { textAlign: 'center', marginTop: 20, color: '#64748b', fontSize: 13 },
  linkBold:  { color: '#059669', fontWeight: '800' },
});
