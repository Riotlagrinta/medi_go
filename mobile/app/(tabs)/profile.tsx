import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, Settings, Shield, LogOut, 
  ChevronRight, MapPin, Phone, Mail,
  Truck, Star
} from 'lucide-react-native';
import { getUser, removeToken } from '../../services/api';

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await getUser();
      if (!userData) {
        router.replace('/login');
        return;
      }
      setUser(userData);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        { 
          text: "Déconnexion", 
          style: "destructive",
          onPress: async () => {
            await removeToken();
            router.replace('/login');
          }
        }
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="pt-20 pb-10 px-6 bg-white rounded-b-[40px] shadow-sm border-b border-slate-100">
        <View className="items-center">
          <View className="relative">
            <View className="w-28 h-28 bg-emerald-100 rounded-full items-center justify-center border-4 border-emerald-50">
              <Text className="text-3xl font-black text-emerald-600">
                {user?.full_name?.charAt(0) || 'U'}
              </Text>
            </View>
            <View className="absolute bottom-1 right-1 bg-emerald-500 p-2 rounded-full border-4 border-white">
              <Star size={12} color="white" fill="white" />
            </View>
          </View>
          
          <Text className="text-2xl font-black text-slate-800 mt-4">{user?.full_name || 'Utilisateur'}</Text>
          <View className="bg-slate-100 px-3 py-1 rounded-full mt-2">
            <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              {user?.role || 'Patient'}
            </Text>
          </View>
        </View>

        <View className="mt-8 flex-row justify-around border-t border-slate-50 pt-8">
          <View className="items-center">
            <Phone size={20} color="#94a3b8" />
            <Text className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Appeler</Text>
          </View>
          <View className="items-center">
            <Mail size={20} color="#94a3b8" />
            <Text className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Email</Text>
          </View>
          <View className="items-center">
            <MapPin size={20} color="#94a3b8" />
            <Text className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Adresse</Text>
          </View>
        </View>
      </View>

      <View className="p-6 space-y-4">
        <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 mb-2">Services</Text>
        
        {/* Accès Livreur (visible pour les coursiers ou pour démo) */}
        <TouchableOpacity 
          onPress={() => router.push('/delivery')}
          className="bg-slate-900 p-5 rounded-3xl flex-row items-center justify-between shadow-lg shadow-slate-200"
        >
          <View className="flex-row items-center">
            <View className="bg-emerald-500 p-3 rounded-2xl">
              <Truck size={24} color="white" />
            </View>
            <View className="ml-4">
              <Text className="text-white font-black text-lg">Espace Livreur</Text>
              <Text className="text-emerald-300 text-xs font-medium">Gérer vos courses locales</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#10b981" />
        </TouchableOpacity>

        <View className="bg-white rounded-[32px] overflow-hidden border border-slate-100">
          <TouchableOpacity className="p-5 flex-row items-center justify-between border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="bg-slate-50 p-3 rounded-2xl">
                <User size={20} color="#64748b" />
              </View>
              <Text className="ml-4 font-bold text-slate-700">Modifier le profil</Text>
            </View>
            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity className="p-5 flex-row items-center justify-between border-b border-slate-50">
            <View className="flex-row items-center">
              <View className="bg-slate-50 p-3 rounded-2xl">
                <Settings size={20} color="#64748b" />
              </View>
              <Text className="ml-4 font-bold text-slate-700">Paramètres</Text>
            </View>
            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>

          <TouchableOpacity className="p-5 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="bg-slate-50 p-3 rounded-2xl">
                <Shield size={20} color="#64748b" />
              </View>
              <Text className="ml-4 font-bold text-slate-700">Confidentialité</Text>
            </View>
            <ChevronRight size={18} color="#cbd5e1" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-white p-5 rounded-[32px] flex-row items-center justify-center border border-red-50 mt-4"
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="ml-2 font-black text-red-500">Déconnexion</Text>
        </TouchableOpacity>
      </View>
      
      <View className="h-20" />
    </ScrollView>
  );
}
