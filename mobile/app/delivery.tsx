import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Package, MapPin, CheckCircle2, Navigation2, Truck } from 'lucide-react-native';
import { apiFetch } from '../services/api';

interface Delivery {
  id: number;
  status: string;
  reservation_id: number;
  reservations: {
    id: number;
    medications: { name: string };
  };
}

export default function DeliveryScreen() {
  const [availableDeliveries, setAvailableDeliveries] = useState<Delivery[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      // Pour l'instant, on récupère via l'endpoint /delivery/available
      // On pourrait en avoir un autre pour les livraisons en cours de l'user
      const data = await apiFetch('/delivery/available');
      setAvailableDeliveries(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const acceptDelivery = async (id: number) => {
    try {
      await apiFetch(`/delivery/${id}/accept`, { method: 'POST' });
      Alert.alert("Succès", "Course acceptée ! Rendez-vous à la pharmacie.");
      fetchData();
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'accepter cette course.");
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      // On simule une position à Lomé
      await apiFetch(`/delivery/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, lat: 6.1375, lng: 1.2123 })
      });
      fetchData();
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le statut.");
    }
  };

  return (
    <View className="flex-1 bg-slate-50 pt-16 px-6">
      <View className="flex-row items-center mb-8">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 mr-4">
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-black text-slate-800">Espace Livreur</Text>
          <Text className="text-slate-500 font-medium">Courses disponibles</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#10b981" size="large" />
      ) : (
        <FlatList
          data={availableDeliveries}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 opacity-30">
              <Truck size={64} color="#64748b" />
              <Text className="mt-4 font-bold text-slate-500">Aucune course disponible</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-white p-6 rounded-[32px] mb-4 shadow-sm border border-slate-100">
              <View className="flex-row items-center mb-4">
                <View className="bg-emerald-50 p-3 rounded-2xl">
                  <Package size={24} color="#10b981" />
                </View>
                <View className="ml-4">
                  <Text className="text-slate-800 font-black text-base">{item.reservations?.medications?.name || 'Médicaments'}</Text>
                  <Text className="text-slate-400 text-xs font-bold uppercase tracking-tighter">ID Commande: #{item.reservation_id}</Text>
                </View>
              </View>

              <View className="flex-row items-center mb-6">
                <MapPin size={16} color="#94a3b8" />
                <Text className="text-slate-500 text-sm ml-2 font-medium">Lomé, Quartier Adidogomé</Text>
              </View>

              {item.status === 'pending' ? (
                <TouchableOpacity 
                  onPress={() => acceptDelivery(item.id)}
                  className="bg-slate-900 py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-slate-200"
                >
                  <Navigation2 size={18} color="white" />
                  <Text className="text-white font-black ml-2">Accepter la course</Text>
                </TouchableOpacity>
              ) : (
                <View className="flex-row gap-2">
                   <TouchableOpacity 
                    onPress={() => updateStatus(item.id, 'picked_up')}
                    className="flex-1 bg-blue-600 py-3 rounded-xl items-center"
                   >
                    <Text className="text-white font-bold">Récupéré</Text>
                   </TouchableOpacity>
                   <TouchableOpacity 
                    onPress={() => updateStatus(item.id, 'delivered')}
                    className="flex-1 bg-emerald-600 py-3 rounded-xl items-center"
                   >
                    <Text className="text-white font-bold">Livré</Text>
                   </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}
