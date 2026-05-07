const API_URL = '/api';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (response.status === 401 || response.status === 403) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/connexion';
    }
  }

  return response;
}

export const api = {
  get:    (endpoint: string) =>
    fetchWithAuth(endpoint, { method: 'GET' }),
  post:   (endpoint: string, data: unknown) =>
    fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  patch:  (endpoint: string, data: unknown) =>
    fetchWithAuth(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (endpoint: string) =>
    fetchWithAuth(endpoint, { method: 'DELETE' }),
  upload: (endpoint: string, formData: FormData) =>
    fetchWithAuth(endpoint, { method: 'POST', body: formData }),
};
