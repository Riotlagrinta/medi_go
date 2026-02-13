import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Package, Clock, CheckCircle2, AlertCircle, ShoppingBag, MapPin } from 'lucide-react-native';
import { apiFetch } from '../../services/api';

interface Reservation {
  id: number;
  quantity: number;
  status: string;
  created_at: string;
  pharmacy_name: string;
  medication_name: string;
  price: number;
}

export default function OrdersScreen() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservations = async () => {
    try {
      const data = await apiFetch('/reservations/reservations');
      setReservations(data);
    } catch (error) {
      console.error('Erreur réservations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return { color: '#10b981', bg: '#ecfdf5', icon: <CheckCircle2 size={16} color="#10b981" />, label: 'Payé' };
      case 'pending':
        return { color: '#f59e0b', bg: '#fffbeb', icon: <Clock size={16} color="#f59e0b" />, label: 'En attente' };
      case 'confirmed':
        return { color: '#3b82f6', bg: '#eff6ff', icon: <Package size={16} color="#3b82f6" />, label: 'Prêt' };
      default:
        return { color: '#64748b', bg: '#f1f5f9', icon: <AlertCircle size={16} color="#64748b" />, label: status };
    }
  };

  return (
    <View className="flex-1 bg-slate-50 px-6 pt-16">
      <View className="mb-8">
        <Text className="text-2xl font-black text-slate-800">Mes Commandes</Text>
        <Text className="text-slate-500 font-medium">Historique et suivi en direct</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#10b981" size="large" className="mt-10" />
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#10b981']} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 opacity-30">
              <ShoppingBag size={64} color="#64748b" />
              <Text className="mt-4 font-bold text-slate-500">Aucune commande en cours</Text>
            </View>
          }
          renderItem={({ item }) => {
            const config = getStatusConfig(item.status);
            return (
              <View className="bg-white p-5 rounded-[28px] mb-4 shadow-sm border border-slate-100">
                <View className="flex-row justify-between items-start mb-4">
                  <View className="flex-row items-center">
                    <View className="bg-slate-50 p-3 rounded-2xl">
                      <ShoppingBag size={20} color="#64748b" />
                    </View>
                    <View className="ml-3">
                      <Text className="text-slate-800 font-black text-base">{item.medication_name}</Text>
                      <Text className="text-slate-400 text-xs uppercase font-bold tracking-tighter">Qté: {item.quantity}</Text>
                    </View>
                  </View>
                  <View style={{ backgroundColor: config.bg }} className="px-3 py-1.5 rounded-full flex-row items-center">
                    {config.icon}
                    <Text style={{ color: config.color }} className="text-[10px] font-black uppercase ml-1.5 tracking-tighter">
                      {config.label}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center mb-4">
                  <MapPin size={14} color="#94a3b8" />
                  <Text className="text-slate-500 text-sm ml-1 font-medium">{item.pharmacy_name}</Text>
                </View>

                <View className="flex-row justify-between items-center pt-4 border-t border-slate-50">
                  <Text className="text-slate-400 text-xs font-medium">
                    {new Date(item.created_at).toLocaleDateString('fr-FR')}
                  </Text>
                  <Text className="text-slate-900 font-black text-lg">
                    {item.price.toLocaleString()} F
                  </Text>
                </View>

                {item.status === 'pending' && (
                  <TouchableOpacity className="mt-4 bg-emerald-600 py-3 rounded-xl items-center shadow-lg shadow-emerald-100">
                    <Text className="text-white font-bold">Payer maintenant</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
        />
      )}
    </View>
  );
}
