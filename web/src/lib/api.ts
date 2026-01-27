const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

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
  post: (endpoint: string, data: any) => fetchWithAuth(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  get: (endpoint: string) => fetchWithAuth(endpoint, {
    method: 'GET',
  }),
  patch: (endpoint: string, data: any) => fetchWithAuth(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (endpoint: string) => fetchWithAuth(endpoint, {
    method: 'DELETE',
  }),
};
