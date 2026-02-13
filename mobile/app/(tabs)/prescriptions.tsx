import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, Image, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { FileText, Plus, ChevronRight, Camera, Image as ImageIcon, X, Send } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '../../services/api';

interface Prescription {
  id: string;
  created_at: string;
  status: string;
  image_url: string;
  pharmacies?: { name: string };
}

interface Pharmacy {
  id: number;
  name: string;
  address: string;
}

export default function PrescriptionsScreen() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPharmacy, setSelectedPharmacy] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prescData, pharmData] = await Promise.all([
        apiFetch('/prescriptions'),
        apiFetch('/pharmacies')
      ]);
      setPrescriptions(prescData);
      setPharmacies(pharmData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    const permissionResult = useCamera 
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission requise", "Vous devez autoriser l'accès pour envoyer une ordonnance.");
      return;
    }

    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || !selectedPharmacy) {
      Alert.alert("Erreur", "Veuillez sélectionner une image et une pharmacie.");
      return;
    }

    setUploading(true);
    try {
      // Simulation d'upload : En prod, on uploaderait le fichier vers un S3/Cloudinary 
      // et on enverrait l'URL résultante à notre API.
      // Pour l'instant, on envoie une URL placeholder.
      await apiFetch('/prescriptions', {
        method: 'POST',
        body: JSON.stringify({
          pharmacy_id: selectedPharmacy,
          image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500' 
        })
      });

      Alert.alert("Succès", "Votre ordonnance a été envoyée avec succès.");
      setModalVisible(false);
      setSelectedImage(null);
      setSelectedPharmacy(null);
      fetchData();
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'envoyer l'ordonnance.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50 px-6 pt-16">
      <View className="flex-row justify-between items-center mb-8">
        <View>
          <Text className="text-2xl font-black text-slate-800">Ordonnances</Text>
          <Text className="text-slate-500 font-medium">Suivi de vos envois</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="bg-emerald-600 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200 active:scale-95"
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#10b981" size="large" className="mt-10" />
      ) : (
        <FlatList
          data={prescriptions}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center mt-20 opacity-30">
              <FileText size={64} color="#64748b" />
              <Text className="mt-4 font-bold text-slate-500">Aucune ordonnance envoyée</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity className="bg-white p-5 rounded-[28px] mb-4 flex-row items-center shadow-sm border border-slate-100">
              <View className="w-14 h-14 bg-slate-50 rounded-2xl items-center justify-center">
                <FileText size={24} color="#10b981" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-slate-800 font-black text-base leading-tight">
                  {item.pharmacies?.name || 'Pharmacie Locale'}
                </Text>
                <Text className="text-slate-400 text-xs mt-1">
                  {new Date(item.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </Text>
              </View>
              <View className="items-end">
                <View className={`px-3 py-1 rounded-full ${
                  item.status === 'ready' ? 'bg-emerald-100' : 
                  item.status === 'pending' ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                  <Text className={`text-[10px] font-black uppercase tracking-tighter ${
                    item.status === 'ready' ? 'text-emerald-700' : 
                    item.status === 'pending' ? 'text-amber-700' : 'text-slate-600'
                  }`}>
                    {item.status === 'ready' ? 'Prête' : item.status === 'pending' ? 'En attente' : item.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal d'envoi */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] p-8 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-black text-slate-800">Envoyer une ordonnance</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-slate-100 rounded-full">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Image Picker */}
              <View className="flex-row gap-4 mb-8">
                <TouchableOpacity 
                  onPress={() => pickImage(true)}
                  className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 h-32 rounded-3xl items-center justify-center"
                >
                  <Camera size={28} color="#64748b" />
                  <Text className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Caméra</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => pickImage(false)}
                  className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 h-32 rounded-3xl items-center justify-center"
                >
                  <ImageIcon size={28} color="#64748b" />
                  <Text className="text-[10px] font-bold text-slate-500 mt-2 uppercase">Galerie</Text>
                </TouchableOpacity>
              </View>

              {selectedImage && (
                <View className="mb-8 relative">
                  <Image source={{ uri: selectedImage }} className="w-full h-48 rounded-3xl" />
                  <TouchableOpacity 
                    onPress={() => setSelectedImage(null)}
                    className="absolute top-2 right-2 bg-black/50 p-2 rounded-full"
                  >
                    <X size={16} color="white" />
                  </TouchableOpacity>
                </View>
              )}

              {/* Pharmacy Selector */}
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Sélectionner la pharmacie</Text>
              <View className="mb-8">
                {pharmacies.map((pharm) => (
                  <TouchableOpacity 
                    key={pharm.id}
                    onPress={() => setSelectedPharmacy(pharm.id)}
                    className={`p-4 rounded-2xl mb-2 flex-row items-center border ${
                      selectedPharmacy === pharm.id ? 'bg-emerald-50 border-emerald-500' : 'bg-slate-50 border-transparent'
                    }`}
                  >
                    <View className={`w-4 h-4 rounded-full border-2 items-center justify-center mr-3 ${
                      selectedPharmacy === pharm.id ? 'border-emerald-500' : 'border-slate-300'
                    }`}>
                      {selectedPharmacy === pharm.id && <View className="w-2 h-2 bg-emerald-500 rounded-full" />}
                    </View>
                    <Text className={`font-bold ${selectedPharmacy === pharm.id ? 'text-emerald-900' : 'text-slate-700'}`}>
                      {pharm.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                onPress={handleUpload}
                disabled={uploading || !selectedImage || !selectedPharmacy}
                className={`w-full py-5 rounded-[24px] flex-row items-center justify-center shadow-lg ${
                  uploading || !selectedImage || !selectedPharmacy ? 'bg-slate-300' : 'bg-slate-900 shadow-slate-200'
                }`}
              >
                {uploading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Send size={20} color="white" className="mr-2" />
                    <Text className="text-white font-black text-lg ml-2">Envoyer l&apos;ordonnance</Text>
                  </>
                )}
              </TouchableOpacity>
              <View className="h-10" />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
