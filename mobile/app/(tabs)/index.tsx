import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Image } from 'react-native';
import { Search, MapPin, MessageSquare, Phone, BadgeCheck, Pill, Navigation2, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { apiFetch } from '../../services/api';

export default function SearchScreen() {
  const [results, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<'pharmacy' | 'medication'>('medication');
  const router = useRouter();

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      // On utilise l'endpoint de recherche globale qui fait du PostGIS
      const data = await apiFetch(`/search?q=${text}&lat=6.1375&lng=1.2123`);
      setMessages(data);
    } catch (error) {
      console.error('Erreur recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 pt-16 px-6">
      <View className="mb-6">
        <Text className="text-2xl font-black text-slate-800 tracking-tight">Rechercher</Text>
        <Text className="text-slate-500 font-medium text-sm">Trouvez vos médicaments au Togo</Text>
      </View>

      {/* Barre de recherche moderne */}
      <View className="bg-white rounded-[24px] flex-row items-center px-5 py-4 shadow-sm border border-slate-100 mb-4">
        <Search size={20} color="#94a3b8" />
        <TextInput 
          className="flex-1 ml-3 text-slate-800 font-bold"
          placeholder={searchMode === 'medication' ? "Nom du médicament (ex: Paracétamol)" : "Nom de la pharmacie..."}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {loading && <ActivityIndicator size="small" color="#10b981" />}
      </View>

      {/* Sélecteur de mode */}
      <View className="flex-row gap-2 mb-6">
        <TouchableOpacity 
          onPress={() => setSearchMode('medication')}
          className={`px-4 py-2 rounded-xl border ${searchMode === 'medication' ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200'}`}
        >
          <Text className={`font-bold text-xs ${searchMode === 'medication' ? 'text-white' : 'text-slate-500'}`}>Médicaments</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setSearchMode('pharmacy')}
          className={`px-4 py-2 rounded-xl border ${searchMode === 'pharmacy' ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-200'}`}
        >
          <Text className={`font-bold text-xs ${searchMode === 'pharmacy' ? 'text-white' : 'text-slate-500'}`}>Pharmacies</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && searchQuery.length > 1 ? (
            <View className="items-center justify-center mt-20 opacity-30">
              <Pill size={64} color="#64748b" />
              <Text className="mt-4 font-bold text-slate-500">Aucun résultat trouvé</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="bg-white p-5 rounded-[32px] mb-4 shadow-sm border border-slate-100"
            onPress={() => router.push({
              pathname: '/chat',
              params: { pharmacyId: item.pharmacy_id, pharmacyName: item.pharmacy_name }
            })}
          >
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 mr-2">
                <View className="flex-row items-center gap-1.5 mb-1">
                  <Text className="text-lg font-black text-slate-800">{item.pharmacy_name}</Text>
                  {item.is_verified && <BadgeCheck size={16} color="#3b82f6" fill="#3b82f620" />}
                </View>
                <View className="flex-row items-center">
                  <MapPin size={12} color="#94a3b8" />
                  <Text className="text-slate-400 text-xs ml-1 font-bold" numberOfLines={1}>{item.address}</Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-emerald-600 font-black text-lg">{item.price} F</Text>
                <Text className="text-[10px] font-bold text-slate-400 uppercase">En stock: {item.quantity}</Text>
              </View>
            </View>

            <View className="bg-slate-50 p-4 rounded-2xl flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="bg-white p-2 rounded-lg shadow-xs">
                  <Pill size={16} color="#10b981" />
                </View>
                <Text className="ml-3 font-bold text-slate-700">{item.medication_name}</Text>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity 
                   onPress={() => router.push({
                    pathname: '/chat',
                    params: { pharmacyId: item.pharmacy_id, pharmacyName: item.pharmacy_name }
                  })}
                  className="bg-slate-900 p-2 rounded-lg"
                >
                  <MessageSquare size={18} color="white" />
                </TouchableOpacity>
                <TouchableOpacity className="bg-white border border-slate-200 p-2 rounded-lg">
                  <Navigation2 size={18} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
