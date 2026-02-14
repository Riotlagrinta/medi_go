import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Send, ArrowLeft, Phone, Info } from 'lucide-react-native';
import { io } from 'socket.io-client';
import { apiFetch, getUser } from '../services/api';

const SOCKET_URL = 'https://medigo-api-vxrv.onrender.com'; // Base URL for Socket.io

export default function ChatScreen() {
  const { pharmacyId, pharmacyName } = useLocalSearchParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  useEffect(() => {
    const initChat = async () => {
      const userData = await getUser();
      setUser(userData);
      
      // Initialisation Socket
      socketRef.current = io(SOCKET_URL);
      
      socketRef.current.on('connect', () => {
        socketRef.current.emit('join_room', `pharmacy_${pharmacyId}`);
        socketRef.current.emit('join_room', `user_${userData.id}`);
      });

      socketRef.current.on('receive_message', (message: any) => {
        setMessages(prev => [...prev, message]);
      });

      // Charger l'historique (Si on avait un endpoint dédié, sinon on simule)
      setLoading(false);
    };

    initChat();

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [pharmacyId]);

  const sendMessage = async () => {
    if (!input.trim() || !user) return;

    const messageData = {
      pharmacy_id: parseInt(pharmacyId as string),
      sender_id: user.id,
      content: input.trim(),
      is_from_pharmacy: false,
      created_at: new Date().toISOString()
    };

    // Envoi via Socket pour le temps réel
    socketRef.current.emit('send_message', messageData);
    
    // Ajout local immédiat pour fluidité
    setMessages(prev => [...prev, messageData]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      className="flex-1 bg-white"
    >
      {/* Header Ergonomique */}
      <View className="pt-14 pb-4 px-6 bg-white border-b border-slate-100 flex-row items-center justify-between shadow-sm">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-slate-50 rounded-xl mr-3">
            <ArrowLeft size={20} color="#1e293b" />
          </TouchableOpacity>
          <View>
            <Text className="text-lg font-black text-slate-800 leading-tight">{pharmacyName}</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5" />
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En ligne</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity className="p-3 bg-emerald-50 rounded-2xl">
          <Phone size={20} color="#10b981" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#10b981" size="large" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(_, index) => index.toString()}
          className="flex-1 px-4"
          contentContainerStyle={{ paddingVertical: 20 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => {
            const isMe = !item.is_from_pharmacy;
            return (
              <View className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
                <View 
                  className={`max-w-[80%] p-4 rounded-[24px] ${
                    isMe ? 'bg-slate-900 rounded-tr-none shadow-sm' : 'bg-slate-100 rounded-tl-none'
                  }`}
                >
                  <Text className={`text-sm font-medium ${isMe ? 'text-white' : 'text-slate-800'}`}>
                    {item.content}
                  </Text>
                  <Text className={`text-[8px] mt-1 font-bold uppercase tracking-tighter ${isMe ? 'text-slate-400' : 'text-slate-500'}`}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Input de saisie ergonomique */}
      <View className="p-4 bg-white border-t border-slate-50 flex-row items-center gap-3 pb-8">
        <TouchableOpacity className="p-3 bg-slate-50 rounded-2xl">
          <Info size={20} color="#94a3b8" />
        </TouchableOpacity>
        <View className="flex-1 bg-slate-50 rounded-[24px] px-5 py-3 border border-slate-100 flex-row items-center">
          <TextInput
            placeholder="Écrire un message..."
            value={input}
            onChangeText={setInput}
            multiline
            className="flex-1 text-slate-800 font-medium py-1"
          />
        </View>
        <TouchableOpacity 
          onPress={sendMessage}
          disabled={!input.trim()}
          className={`w-12 h-12 rounded-2xl items-center justify-center shadow-lg ${
            input.trim() ? 'bg-emerald-600 shadow-emerald-200' : 'bg-slate-200'
          }`}
        >
          <Send size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
