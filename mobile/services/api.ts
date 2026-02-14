import * as SecureStore from 'expo-secure-store';

// Pour le développement local Android (Émulateur) : utilise 10.0.2.2
// Pour iOS Simulator : utilise localhost
// Pour un appareil physique : utilise l'IP de ton PC (ex: 192.168.1.XX)
// En production : utilise l'URL Render
const DEV_API_URL = 'http://192.168.1.70:3001/api'; 
const PROD_API_URL = 'https://medigo-api-vxrv.onrender.com/api';

// Changer cette variable pour basculer entre DEV et PROD
const IS_DEV = false; 

const API_URL = IS_DEV ? DEV_API_URL : PROD_API_URL;

export async function saveToken(token: string) {
  await SecureStore.setItemAsync('userToken', token);
}

export async function getToken() {
  return await SecureStore.getItemAsync('userToken');
}

export async function saveUser(user: any) {
  await SecureStore.setItemAsync('userData', JSON.stringify(user));
}

export async function getUser() {
  const data = await SecureStore.getItemAsync('userData');
  return data ? JSON.parse(data) : null;
}

export async function removeToken() {
  await SecureStore.deleteItemAsync('userToken');
  await SecureStore.deleteItemAsync('userData');
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = await getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    await removeToken();
    // On pourrait utiliser un event emitter ou une state globale pour rediriger
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Une erreur est survenue' }));
    throw new Error(error.message || 'Erreur réseau');
  }

  return response.json();
}
