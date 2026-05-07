import * as SecureStore from 'expo-secure-store';

// ⬇️ Remplacer par votre URL Vercel après déploiement
export const API_URL = 'https://medi-go-murex.vercel.app/api';

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync('token');
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
  }

  return res;
}

export const api = {
  get:    (endpoint: string) =>
    fetchWithAuth(endpoint, { method: 'GET' }),
  post:   (endpoint: string, data: unknown) =>
    fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  patch:  (endpoint: string, data: unknown) =>
    fetchWithAuth(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  upload: (endpoint: string, formData: FormData) =>
    fetchWithAuth(endpoint, { method: 'POST', body: formData }),
};
