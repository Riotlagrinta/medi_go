import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Lock, Mail, ArrowRight } from 'lucide-react-native';
import { apiFetch, saveToken, saveUser } from '../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      await saveToken(data.token);
      await saveUser(data.user);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erreur de connexion', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-8 pt-20 pb-10">
          <View className="items-center mb-12">
            <View className="w-20 h-20 bg-emerald-500 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200">
              <Text className="text-white text-3xl font-bold">M</Text>
            </View>
            <Text className="text-2xl font-bold mt-4 text-slate-800">MediGo Togo</Text>
            <Text className="text-slate-500 mt-2">Votre santé, notre priorité</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-slate-600 mb-2 ml-1 font-medium">Email</Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <Mail size={20} color="#64748b" />
                <TextInput
                  className="flex-1 ml-3 text-slate-800"
                  placeholder="exemple@email.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-slate-600 mb-2 ml-1 font-medium">Mot de passe</Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <Lock size={20} color="#64748b" />
                <TextInput
                  className="flex-1 ml-3 text-slate-800"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity className="items-end mt-2">
              <Text className="text-emerald-600 font-medium">Mot de passe oublié ?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loading}
              className={`mt-8 bg-emerald-500 rounded-xl py-4 flex-row items-center justify-center shadow-md shadow-emerald-200 ${loading ? 'opacity-70' : ''}`}
            >
              <Text className="text-white font-bold text-lg mr-2">
                {loading ? 'Connexion...' : 'Se connecter'}
              </Text>
              {!loading && <ArrowRight size={20} color="white" />}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-auto pt-10">
            <Text className="text-slate-500">Pas encore de compte ? </Text>
            <TouchableOpacity onPress={() => router.push('/inscription')}>
              <Text className="text-emerald-600 font-bold">S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
