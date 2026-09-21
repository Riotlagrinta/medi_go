'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Calendar, Pill, Phone, Loader2, MessageCircle, X, Send, Camera, ShieldCheck, Heart, User, LogOut, Info, Navigation, Smartphone, Download } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  pharmacy_id: number;
  pharmacy_name: string;
  address: string;
  phone: string;
  is_on_duty: boolean;
  is_verified: boolean;
  medication_id: number;
  medication_name: string;
  price: string;
  quantity: number;
  distance: number;
  lat: number;
  lng: number;
}

// Composant Landing Page pour les visiteurs non connectés
const LandingPage = () => (
  <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800">
    {/* Header Public */}
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg"><Pill className="text-white w-6 h-6" /></div>
            <span className="text-2xl font-bold text-slate-800">MediGo</span>
          </div>
          <Link href="/telecharger" className="hidden md:flex items-center gap-1.5 text-slate-600 font-bold hover:text-emerald-600 transition-colors text-sm">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            App Mobile
          </Link>
          <Link href="/a-propos" className="hidden md:block text-slate-500 font-semibold hover:text-emerald-600 transition-colors text-sm">
            À Propos
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/telecharger" className="md:hidden p-2 rounded-full bg-emerald-50 text-emerald-600" title="Télécharger l'application">
            <Download className="w-5 h-5" />
          </Link>
          <Link href="/connexion" className="px-5 py-2 font-semibold text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors">
            Se connecter
          </Link>
          <Link href="/inscription" className="px-5 py-2 font-semibold bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
            S&apos;inscrire
          </Link>
        </div>
      </div>
    </header>

    {/* Hero Section */}
    <section className="relative pt-20 pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-white -z-10" />
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm mb-8 animate-fade-in-up">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          La référence santé au Togo
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 tracking-tight">
          Votre santé, <span className="text-emerald-600">notre priorité.</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed">
          MediGo simplifie votre accès aux soins. Localisez les pharmacies de garde, vérifiez la disponibilité de vos médicaments et consultez des experts, le tout depuis votre mobile.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/inscription" className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
            <User className="w-5 h-5" />
            Créer mon compte patient
          </Link>
          <Link href="/telecharger" className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white font-bold text-lg rounded-full shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            Installer l&apos;application
          </Link>
        </div>
      </div>
    </section>

    {/* Objectives / Features Section */}
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Pourquoi choisir MediGo ?</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Notre mission est de rendre l&apos;information pharmaceutique accessible, fiable et instantanée pour tous.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <MapPin className="w-8 h-8 text-blue-500" />,
              title: "Proximité Immédiate",
              desc: "Géolocalisez instantanément les pharmacies ouvertes et de garde autour de vous, où que vous soyez.",
              color: "bg-blue-50"
            },
            {
              icon: <Search className="w-8 h-8 text-emerald-500" />,
              title: "Disponibilité Réelle",
              desc: "Plus besoin de faire le tour de la ville. Vérifiez si votre ordonnance est disponible avant de vous déplacer.",
              color: "bg-emerald-50"
            },
            {
              icon: <ShieldCheck className="w-8 h-8 text-purple-500" />,
              title: "Sécurité & Conseil",
              desc: "Des informations fiables et un accès direct à des professionnels de santé pour vous guider.",
              color: "bg-purple-50"
            }
          ].map((item, idx) => (
            <div key={idx} className="p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-shadow bg-white group">
              <div className={`${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Call to Action Footer */}
    <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à simplifier votre parcours de soin ?</h2>
        <p className="text-slate-400 mb-10 text-lg">Rejoignez des milliers d&apos;utilisateurs qui font confiance à MediGo pour leur santé.</p>
        <Link href="/inscription" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/50">
          Rejoindre MediGo gratuitement
          <Heart className="w-5 h-5 fill-current" />
        </Link>
      </div>
    </section>

    <footer className="bg-slate-50 py-12 text-center text-slate-400 text-sm border-t border-slate-200">
      <p>© 2026 MediGo. Tous droits réservés.</p>
    </footer>
  </div>
);

import { api } from '@/lib/api';
import { uploadPrescriptionAction } from '@/app/actions/pharmacyActions';
import { PharmacyMap } from '@/components/Map';

// Composant Principal (Dashboard)
export default function Home() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
        } else {
          localStorage.clear();
        }
      } catch (e) {
        console.error("Session check failed");
      } finally {
        setAuthLoading(false);
      }
    };
    checkSession();
  }, []);

  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'medication' | 'pharmacy'>('medication');
  const [location, setLocation] = useState('📍 Détection de votre position...');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<{ 
    id: number; 
    name: string; 
    address: string; 
    phone: string;
    is_on_duty: boolean;
    is_verified: boolean;
    lat: number;
    lng: number;
    distance: number;
  }[]>([]);
  const [searched, setSearched] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Pharmacie ciblée par le chat "Conseil" : la plus proche de l'utilisateur (fallback : premier résultat de recherche).
  const chatPharmacyId = nearbyPharmacies[0]?.id ?? results[0]?.pharmacy_id ?? null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !chatPharmacyId) return;
    try {
      const response = await api.post('/messages', {
        pharmacy_id: chatPharmacyId,
        content: chatMessage,
        is_from_pharmacy: false
      });
      if (response.ok) {
        setChatMessage('');
        fetchMsgs();
      }
    } catch {
      console.error('Chat failed');
    }
  };

  const fetchMsgs = async () => {
    if (!chatPharmacyId) return;
    try {
      const response = await api.get(`/messages/${chatPharmacyId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (showChat && user && chatPharmacyId) {
      fetchMsgs();
      const interval = setInterval(fetchMsgs, 5000);
      return () => clearInterval(interval);
    }
  }, [showChat, !!user, chatPharmacyId]);

  // Récupère les pharmacies à proximité en temps réel
  const fetchNearby = async (lat: number, lng: number) => {
    try {
      const response = await api.get(`/pharmacies?lat=${lat}&lng=${lng}`);
      if (response.ok) {
        const data = await response.json();
        setNearbyPharmacies(Array.isArray(data) ? data : []);
      } else {
        setNearbyPharmacies([]);
      }
    } catch {
      setNearbyPharmacies([]);
    }
  };

  // Géolocalisation GPS de l'utilisateur
  const getUserLocation = (showNotif = false) => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng });
          setLocation('📍 Position GPS actuelle');
          setIsLocating(false);
          fetchNearby(lat, lng);
          if (showNotif) {
            setNotification({ message: 'Position actualisée avec succès !', type: 'success' });
          }
        },
        (error) => {
          console.warn('Geolocation denied or failed, fallback to Lomé:', error);
          const defaultLat = 6.1372;
          const defaultLng = 1.2255;
          setUserCoords({ lat: defaultLat, lng: defaultLng });
          setLocation('Lomé, Togo (défaut)');
          setIsLocating(false);
          fetchNearby(defaultLat, defaultLng);
          if (showNotif) {
            setNotification({ message: 'GPS indisponible. Localisation par défaut (Lomé).', type: 'error' });
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      const defaultLat = 6.1372;
      const defaultLng = 1.2255;
      setUserCoords({ lat: defaultLat, lng: defaultLng });
      setLocation('Lomé, Togo (défaut)');
      setIsLocating(false);
      fetchNearby(defaultLat, defaultLng);
    }
  };

  // Déclencher la géolocalisation dès le chargement
  useEffect(() => {
    getUserLocation();
  }, []);

  // Gère la disparition automatique des notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const lat = userCoords?.lat ?? 6.1372;
      const lng = userCoords?.lng ?? 1.2255;
      let url = `/search?q=${encodeURIComponent(query)}&lat=${lat}&lng=${lng}`;
      if (searchType === 'pharmacy') {
        url = `/pharmacies?q=${encodeURIComponent(query)}&lat=${lat}&lng=${lng}`;
      }
      const response = await api.get(url);
      if (response.ok) {
        const data = await response.json();
        if (searchType === 'pharmacy') {
          // Normaliser pour SearchResult format
          const formatted = (Array.isArray(data) ? data : []).map((p: any) => ({
            pharmacy_id: p.id,
            pharmacy_name: p.name,
            address: p.address,
            phone: p.phone,
            is_on_duty: p.is_on_duty,
            is_verified: p.is_verified,
            medication_id: 0,
            medication_name: p.is_on_duty ? 'Pharmacie de garde' : 'Pharmacie partenaire',
            price: '---',
            quantity: 1,
            distance: p.distance ?? 0,
            lat: p.lat,
            lng: p.lng,
          }));
          setResults(formatted);
        } else {
          setResults(Array.isArray(data) ? data : []);
        }
      } else {
        setResults([]);
      }
    } catch {
      setNotification({ message: 'La recherche a échoué', type: 'error' });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOnDutySearch = async () => {
    setLoading(true);
    setSearched(true);
    setQuery('Pharmacies de Garde');
    try {
      const lat = userCoords?.lat ?? 6.1372;
      const lng = userCoords?.lng ?? 1.2255;
      const response = await api.get(`/pharmacies/on-duty?lat=${lat}&lng=${lng}`);
      if (response.ok) {
        const data = await response.json();
        const formatted = (Array.isArray(data) ? data : []).map((p: any) => ({
          pharmacy_id: p.id,
          pharmacy_name: p.name,
          address: p.address,
          phone: p.phone,
          is_on_duty: p.is_on_duty,
          is_verified: p.is_verified,
          medication_id: 0,
          medication_name: 'Pharmacie de garde 24h/7',
          price: '---',
          quantity: 1,
          distance: p.distance ?? 0,
          lat: p.lat,
          lng: p.lng,
        }));
        setResults(formatted);
      } else {
        setResults([]);
      }
    } catch {
      setNotification({ message: 'Erreur lors de la recherche des pharmacies de garde', type: 'error' });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async (pharmacyId: number, medicationId: number) => {
    if (medicationId === 0) {
      setNotification({ message: 'Veuillez appeler la pharmacie', type: 'error' });
      return;
    }
    try {
      const response = await api.post('/reservations', { pharmacy_id: pharmacyId, medication_id: medicationId, quantity: 1 });
      if (response.ok) {
        setNotification({ message: 'Réservation réussie ! Redirection...', type: 'success' });
        setTimeout(() => router.push('/commandes'), 1500);
      }
    } catch {
      setNotification({ message: 'Échec de la réservation', type: 'error' });
    }
  };

  const handleAppointment = async (pharmacyId: number, pharmacyName: string) => {
    const date = prompt(`Date du RDV à ${pharmacyName} ? (Ex: 2026-01-25 10:00)`);
    if (!date) return;
    try {
      const response = await api.post('/appointments', { pharmacy_id: pharmacyId, appointment_date: date, reason: 'Consultation' });
      if (response.ok) setNotification({ message: 'Demande de RDV envoyée !', type: 'success' });
    } catch {
      setNotification({ message: 'Échec du RDV', type: 'error' });
    }
  };

  const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      const targetPharmacyId = nearbyPharmacies[0]?.id ?? results[0]?.pharmacy_id;
      if (!targetPharmacyId) {
        setNotification({ message: 'Activez votre position pour choisir une pharmacie destinataire', type: 'error' });
        return;
      }

      setLoading(true);
      setNotification({ message: "Envoi de l'ordonnance...", type: 'success' });

      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadPrescriptionAction(formData);

      if (result.success) {
        await api.post('/prescriptions', { pharmacy_id: targetPharmacyId, image_url: result.publicUrl });
        setNotification({ message: 'Ordonnance envoyée !', type: 'success' });
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setNotification({ message: `Erreur : ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------------------
  // RENDER LOGIC
  // ----------------------------------------------------------------------

  // 1. Loading State (Auth Check)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    );
  }

  // 2. Guest View (Landing Page)
  if (!user) {
    return <LandingPage />;
  }

  // 3. Authenticated View (Dashboard)
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {notification && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-2xl shadow-2xl text-white font-black animate-in slide-in-from-top-8 duration-500 ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? <ShieldCheck className="w-6 h-6" /> : <Info className="w-6 h-6" />}
            {notification.message}
          </div>
        </div>
      )}

      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-200 group-hover:rotate-12 transition-transform duration-300">
              <Pill className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tighter">MediGo</span>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
            <Link href="/" className="px-6 py-2 rounded-xl bg-white shadow-sm text-emerald-600 font-bold text-sm">Accueil</Link>
            <Link href="/commandes" className="px-6 py-2 rounded-xl text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors">Commandes</Link>
            <Link href="/telecharger" className="px-6 py-2 rounded-xl text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              App Mobile
            </Link>
            <Link href="/a-propos" className="px-6 py-2 rounded-xl text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors">Aide</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={user?.role === 'super_admin' ? '/super-admin' : (user?.role === 'patient' ? '/profil' : '/dashboard')}
              className="flex items-center gap-3 pl-2 pr-5 py-2 bg-white border border-slate-200 rounded-full hover:shadow-md transition-all active:scale-95"
            >
              <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-black text-xs border-2 border-white shadow-sm">
                {user?.full_name?.charAt(0) || 'U'}
              </div>
              <span className="font-bold text-slate-700 text-sm hidden sm:inline">{user?.full_name?.split(' ')[0]}</span>
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-emerald-600 to-emerald-700 py-12 md:py-24 px-4 relative overflow-hidden">
        {/* Cercles de décoration en arrière-plan */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-[80px] translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-[1.1]">
            Votre santé au <span className="text-emerald-300">bout des doigts.</span>
          </h1>
          <p className="text-emerald-50/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
            Le réseau intelligent qui connecte les patients et les pharmacies du Togo en temps réel.
          </p>

          <div className="bg-white/10 backdrop-blur-md p-1.5 rounded-[28px] inline-flex gap-1 mb-8 border border-white/20">
            <button onClick={() => setSearchType('medication')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${searchType === 'medication' ? 'bg-white text-emerald-700 shadow-xl' : 'text-white hover:bg-white/10'}`}>Médicaments</button>
            <button onClick={() => setSearchType('pharmacy')} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${searchType === 'pharmacy' ? 'bg-white text-emerald-700 shadow-xl' : 'text-white hover:bg-white/10'}`}>Pharmacies</button>
          </div>

          <div className="bg-white p-3 rounded-[32px] shadow-2xl shadow-emerald-900/20 flex flex-col gap-3 max-w-3xl mx-auto border border-white">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-[1.5] flex items-center px-6 py-4 gap-4 bg-slate-50 rounded-[24px] group focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                <Search className="text-slate-400 w-6 h-6 group-focus-within:text-emerald-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={searchType === 'medication' ? "Ex: Paracétamol, Insuline..." : "Rechercher une pharmacie..."}
                  className="w-full focus:outline-none text-slate-900 font-bold bg-transparent text-lg placeholder:text-slate-400"
                />
              </div>
              <div className="flex-1 flex items-center px-4 md:px-6 py-4 gap-3 bg-slate-50 rounded-[24px] group focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500 transition-all justify-between">
                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                  <MapPin className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full focus:outline-none text-slate-900 font-bold bg-transparent text-sm md:text-base placeholder:text-slate-400 truncate"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => getUserLocation(true)}
                  disabled={isLocating}
                  title="Actualiser ma position GPS"
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-xl transition-all active:scale-90 flex-shrink-0 flex items-center gap-1.5 text-xs font-black"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">GPS</span>
                </button>
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black text-lg flex items-center justify-center gap-3 hover:bg-emerald-500 active:scale-[0.98] transition-all shadow-xl shadow-emerald-100"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Search className="w-6 h-6" /> Rechercher maintenant</>}
            </button>
          </div>
        </div>
      </section>

      {/* BOUTON FLOTTANT DE VUE (LISTE/CARTE) */}
      <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 ease-in-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-28 opacity-0'}`}>
        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
          className="bg-slate-900/90 text-white px-8 py-4 rounded-full font-black shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-3 active:scale-90 transition-all border border-white/10 backdrop-blur-2xl"
        >
          {viewMode === 'list' ? (
            <><MapPin className="w-5 h-5 text-emerald-400 animate-pulse" /> Voir la carte</>
          ) : (
            <><Search className="w-5 h-5 text-emerald-400" /> Voir la liste</>
          )}
        </button>
      </div>

      {viewMode === 'map' ? (
        <section className="h-[calc(100vh-80px)] w-full relative animate-in fade-in duration-500">
          <PharmacyMap
            userLocation={userCoords}
            pharmacies={(results.length > 0 ? results : nearbyPharmacies).map((p: any) => ({
              id: p.pharmacy_id || p.id,
              name: p.pharmacy_name || p.name,
              address: p.address,
              phone: p.phone || '',
              is_on_duty: !!p.is_on_duty,
              is_verified: !!p.is_verified,
              lat: parseFloat(p.lat) || 6.1372,
              lng: parseFloat(p.lng) || 1.2255,
              distance: typeof p.distance === 'number' ? p.distance : undefined,
            }))}
          />
          <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center justify-between pointer-events-none">
            <p className="text-xs font-black text-slate-800 uppercase tracking-tight">Pharmacies autour de vous</p>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg">{(results.length > 0 ? results : nearbyPharmacies).length} RÉSULTATS</span>
          </div>
        </section>
      ) : (
        <>
          {searched && (
            <section className="max-w-7xl mx-auto px-4 py-16 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Résultats trouvés</h2>
                  <p className="text-slate-500 font-medium">Pour votre recherche : <span className="text-emerald-600">"{query}"</span></p>
                </div>
                <div className="hidden sm:block px-4 py-2 bg-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {results.length} résultats
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.isArray(results) && results.map((res, idx) => (
                  <div key={idx} className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col group">
                    <div className="bg-slate-50 rounded-[28px] p-6 mb-4 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:scale-110 transition-transform duration-500">
                          <Pill className="w-6 h-6 text-emerald-500" />
                        </div>
                        {res.is_on_duty && (
                          <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg shadow-red-200 uppercase tracking-tighter">De Garde</span>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{res.medication_name}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-sm font-bold text-slate-600 truncate">{res.pharmacy_name}</span>
                      </div>

                      <div className="flex items-baseline gap-1 mt-6">
                        <span className="text-3xl font-black text-slate-900">{parseFloat(res.price).toLocaleString()}</span>
                        <span className="text-sm font-black text-slate-400 uppercase">F CFA</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleReserve(res.pharmacy_id, res.medication_id)}
                      className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black hover:bg-emerald-600 active:scale-95 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                    >
                      {res.medication_id === 0 ? 'Contacter' : 'Acheter maintenant'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="max-w-7xl mx-auto px-4 mt-12 mb-16">
            <div className="bg-white p-8 md:p-12 rounded-[48px] shadow-sm border border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <Clock className="w-6 h-6" />, label: "De Garde", desc: "Ouvert 24h/7", action: handleOnDutySearch, color: "text-red-600", bg: "bg-red-50" },
                { icon: <Camera className="w-6 h-6" />, label: "Ordonnance", desc: "Scan rapide", action: () => { }, color: "text-blue-600", bg: "bg-blue-50", type: "file" },
                { icon: <Calendar className="w-6 h-6" />, label: "RDV", desc: "Sans attente", action: () => { }, color: "text-emerald-600", bg: "bg-emerald-50" },
                { icon: <MessageCircle className="w-6 h-6" />, label: "Conseil", desc: "Chat expert", action: () => setShowChat(true), color: "text-amber-600", bg: "bg-amber-50" }
              ].map((item, i) => (
                <div
                  key={i}
                  onClick={item.action}
                  className="flex flex-col items-center text-center group cursor-pointer"
                >
                  <div className={`${item.bg} ${item.color} p-6 rounded-3xl mb-4 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 relative`}>
                    {item.icon}
                    {item.type === 'file' && <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handlePrescriptionUpload} />}
                  </div>
                  <h3 className="font-black text-slate-900 text-lg mb-1">{item.label}</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-tighter">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="pharmacies-section" className="max-w-7xl mx-auto px-4 py-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-widest mb-3">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  Géolocalisation en temps réel
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-none">Pharmacies à proximité</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => getUserLocation(true)}
                  disabled={isLocating}
                  className="bg-white px-5 py-3 rounded-2xl font-bold text-xs text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  Actualiser GPS
                </button>
                {nearbyPharmacies.length > 3 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="bg-white px-6 py-3 rounded-2xl font-black text-xs text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    {showAll ? 'Voir moins' : `Tout afficher (${nearbyPharmacies.length})`}
                  </button>
                )}
              </div>
            </div>

            {nearbyPharmacies.length === 0 ? (
              <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100 shadow-sm max-w-lg mx-auto">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-2">Recherche des pharmacies autour de vous...</h3>
                <p className="text-slate-500 text-sm mb-6">Autorisez la géolocalisation pour découvrir les pharmacies les plus proches en temps réel.</p>
                <button
                  onClick={() => getUserLocation(true)}
                  className="bg-emerald-600 text-white px-6 py-3.5 rounded-2xl font-black text-sm hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
                >
                  Activer la géolocalisation
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {(showAll ? nearbyPharmacies : nearbyPharmacies.slice(0, 3)).map((p) => (
                  <div key={p.id} className="group bg-white rounded-[40px] p-3 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col justify-between">
                    <div>
                      <div className="relative h-52 rounded-[32px] overflow-hidden bg-slate-900 mb-6">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent"></div>
                        <div className="absolute top-4 left-4 flex gap-2">
                          {p.is_on_duty && (
                            <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-500/50 uppercase tracking-tight flex items-center gap-1">
                              <Clock className="w-3 h-3" /> De Garde
                            </span>
                          )}
                          {p.is_verified && (
                            <span className="bg-blue-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-blue-500/50 uppercase tracking-tight flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Certifiée
                            </span>
                          )}
                        </div>
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg">
                          OUVERT
                        </div>
                        <div className="absolute bottom-5 left-5 flex items-center gap-3 text-white">
                          <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-2xl">
                            <MapPin className="w-5 h-5 text-emerald-300" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Distance réelle</p>
                            <p className="text-xl font-black">
                              {p.distance < 1000 ? `${p.distance} m` : `${(p.distance / 1000).toFixed(1)} km`}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors truncate">{p.name}</h4>
                        </div>
                        <p className="text-slate-500 font-medium text-sm mb-6 line-clamp-2 h-10">{p.address}</p>
                      </div>
                    </div>

                    <div className="px-4 pb-4 flex gap-2">
                      {p.phone && (
                        <a
                          href={`tel:${p.phone}`}
                          className="flex-1 bg-slate-900 text-white py-3.5 rounded-2xl font-black text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 text-center"
                        >
                          <Phone className="w-3.5 h-3.5" /> Appeler
                        </a>
                      )}
                      <button 
                        onClick={() => handleAppointment(p.id, p.name)} 
                        className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-100 py-3.5 rounded-2xl font-black text-xs hover:bg-emerald-100 transition-all active:scale-95 text-center"
                      >
                        Prendre RDV
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <footer className="bg-slate-900 py-20 px-4 mt-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 relative z-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg">
                <Pill className="text-white w-6 h-6" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter">MediGo</span>
            </div>
            <p className="text-slate-400 max-w-sm text-lg leading-relaxed">
              La plateforme de référence pour l'accès aux soins de santé au Togo. Plus rapide, plus proche, plus sûr.
            </p>
          </div>
          <div>
            <h5 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-8">Navigation</h5>
            <ul className="space-y-4 text-slate-400 font-bold">
              <li><Link href="/" className="hover:text-emerald-400 transition-colors">Accueil</Link></li>
              <li><Link href="/telecharger" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-emerald-400" /> Installer l&apos;application</Link></li>
              <li><Link href="/commandes" className="hover:text-emerald-400 transition-colors">Mes Commandes</Link></li>
              <li><Link href="/a-propos" className="hover:text-emerald-400 transition-colors">À Propos</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-8">Légal</h5>
            <ul className="space-y-4 text-slate-400 font-bold">
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Confidentialité</Link></li>
              <li><Link href="#" className="hover:text-emerald-400 transition-colors">Conditions d'utilisation</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-800 text-center text-slate-500 font-bold text-sm">
          © 2026 MediGo. Développé avec passion pour le Togo.
        </div>
      </footer>

      <button onClick={() => setShowChat(!showChat)} className="fixed bottom-8 right-8 bg-emerald-600 text-white p-4 rounded-full shadow-2xl z-50">
        {showChat ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {showChat && (
        <div className="fixed bottom-24 right-8 w-80 md:w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden z-50">
          <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
            <div className="flex items-center gap-3"><Pill className="w-5 h-5" /><div><p className="font-bold text-sm">Conseil</p><p className="text-[10px] opacity-80">En ligne</p></div></div>
            <button onClick={() => setShowChat(false)}><X className="w-5 h-5" /></button>
          </div>
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {!chatPharmacyId ? (
              <p className="text-center text-xs text-slate-400 font-medium mt-8">
                Activez votre position ou lancez une recherche pour discuter avec une pharmacie proche de vous.
              </p>
            ) : (
              Array.isArray(messages) && messages.map((m) => (
                <div key={m.id} className={`flex ${!m.is_from_pharmacy ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${!m.is_from_pharmacy ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 shadow-sm border border-slate-100'}`}>{m.content}</div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
            <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Message..." disabled={!chatPharmacyId} className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50" />
            <button type="submit" disabled={!chatPharmacyId} className="bg-emerald-600 text-white p-2 rounded-xl disabled:opacity-50"><Send className="w-5 h-5" /></button>
          </form>
        </div>
      )}
    </main>
  );
}
