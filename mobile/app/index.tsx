import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { getToken, removeToken } from '../services/api';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkAuth() {
      // FORCE LOGOUT POUR NETTOYAGE
      await removeToken(); 
      const token = await getToken();
      setIsAuthenticated(!!token);
    }
    checkAuth();
  }, []);

  if (isAuthenticated === null) return null;

  // Si on veut forcer la reconnexion pour tester les nouveaux changements du profil:
  // return <Redirect href="/login" />; 

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
