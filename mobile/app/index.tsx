import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { View, ActivityIndicator } from 'react-native';
import { api } from '../src/lib/api';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      const token = await SecureStore.getItemAsync('token');
      if (!token) { router.replace('/connexion'); return; }

      const res = await api.get('/auth/me').catch(() => null);
      if (res?.ok) {
        router.replace('/(tabs)');
      } else {
        await SecureStore.deleteItemAsync('token');
        router.replace('/connexion');
      }
    };
    check();
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#059669' }}>
      <ActivityIndicator size="large" color="#fff" />
    </View>
  );
}
