'use client';

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Calendar, Pill, Phone, Loader2, MessageCircle, X, Send, Camera, ShieldCheck, Heart, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface SearchResult {
  pharmacy_id: number;
  pharmacy_name: string;
  address: string;
  phone: string;
  is_on_duty: boolean;
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
          <Link href="/a-propos" className="hidden md:block text-slate-500 font-semibold hover:text-emerald-600 transition-colors">
            À Propos
          </Link>
        </div>
        <div className="flex gap-4">
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
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link href="/inscription" className="w-full md:w-auto px-8 py-4 bg-emerald-600 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
            <User className="w-5 h-5" />
            Créer mon compte patient
          </Link>
          <Link href="/connexion" className="w-full md:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 font-bold text-lg rounded-full hover:bg-slate-50 transition-all">
            Déjà membre ?
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

// Composant Principal (Dashboard)
export default function Home() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Vérification de la session au chargement
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
  const [location, setLocation] = useState('Lomé, Togo');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<{id: number, name: string, address: string, distance: number}[]>([]);
  const [searched, setSearched] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    try {
      const response = await api.post('/messages', { 
        pharmacy_id: 1, 
        content: chatMessage,
        is_from_pharmacy: false 
      });
      if (response.ok) {
        setChatMessage('');
        fetchMsgs(); // Refresh messages
      }
    } catch {
      console.error('Chat failed');
    }
  };

  const fetchMsgs = async () => {
    try {
      const response = await api.get('/messages/1');
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
    if (showChat && user) {
      fetchMsgs();
      const interval = setInterval(fetchMsgs, 5000); 
      return () => clearInterval(interval);
    }
  }, [showChat, !!user]);

  useEffect(() => {
    if (!user) return;

    const fetchNearby = async (lat: number, lng: number) => {
      try {
        const response = await api.get(`/search?q=&lat=${lat}&lng=${lng}&radius=10000`);
        const data = await response.json();
        if (Array.isArray(data)) {
          const uniquePharmacies = Array.from(new Set(data.map((r: any) => r.pharmacy_id)))
            .map(id => {
              const r = data.find((x: any) => x.pharmacy_id === id);
              return { id: r.pharmacy_id, name: r.pharmacy_name, address: r.address, distance: r.distance };
            });
          setNearbyPharmacies(uniquePharmacies);
        } else {
          setNearbyPharmacies([]);
        }
      } catch {
        setNearbyPharmacies([]);
      }
    };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => fetchNearby(p.coords.latitude, p.coords.longitude),
        () => fetchNearby(6.1372, 1.2255)
      );
    } else { fetchNearby(6.1372, 1.2255); }
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification, user]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setSearched(true);
    try {
      const lat = 6.1372; const lng = 1.2255;
      let url = `/search?q=${encodeURIComponent(query)}&lat=${lat}&lng=${lng}`;
      if (searchType === 'pharmacy') url = `/pharmacies/search?q=${encodeURIComponent(query)}&lat=${lat}&lng=${lng}`;
      const response = await api.get(url);
      const data = await response.json();
      setResults(data);
    } catch {
      setNotification({ message: 'La recherche a échoué', type: 'error' });
    } finally { setLoading(false); }
  };

  const handleOnDutySearch = async () => {
    setLoading(true);
    try {
      const response = await api.get('/pharmacies/on-duty');
      const data = await response.json();
      let q = "pharmacies de garde Lomé Togo";
      if (data.length > 0) q = `pharmacies de garde ${data.map((p: {name: string}) => p.name).join(' ')} Lomé Togo`;
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}`, '_blank');
    } catch {
      window.open(`https://www.google.com/maps/search/pharmacies+de+garde+Lomé+Togo`, '_blank');
    } finally { setLoading(false); }
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
      setLoading(true);
      setNotification({ message: "Envoi de l'ordonnance...", type: 'success' });
      const file = e.target.files[0];
      const fileName = `${Math.random()}-${file.name}`;
      
      const { data: uploadData, error: upError } = await supabase.storage.from('prescriptions').upload(`prescriptions/${fileName}`, file);
      if (upError) throw upError;
      
      const { data: { publicUrl } } = supabase.storage.from('prescriptions').getPublicUrl(`prescriptions/${fileName}`);
      
      await api.post('/prescriptions', { pharmacy_id: 1, image_url: publicUrl });
      
      setNotification({ message: 'Ordonnance envoyée !', type: 'success' });
    } catch {
      setNotification({ message: 'Erreur lors de l\'envoi', type: 'error' });
    } finally { setLoading(false); }
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
    <main className="min-h-screen bg-slate-50">
      {notification && (
        <div className={`fixed top-20 right-4 z-[60] px-6 py-3 rounded-xl shadow-lg text-white font-bold animate-bounce ${notification.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {notification.message}
        </div>
      )}

      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg"><Pill className="text-white w-6 h-6" /></div>
            <span className="text-2xl font-bold text-slate-800">MediGo</span>
          </div>
          <nav className="hidden md:flex gap-8 text-slate-600 font-medium">
            <Link href="/" className="hover:text-emerald-600">Accueil</Link>
            <Link href="/a-propos" className="hover:text-emerald-600">À Propos</Link>
            <Link href="/commandes" className="hover:text-emerald-600">Mes Commandes</Link>
            <Link href="/profil" className="hover:text-emerald-600">Mon Profil</Link>
          </nav>
          <div className="flex gap-4">
            <button 
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              className="hidden md:flex items-center gap-2 px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-full transition-all"
            >
              <LogOut className="w-4 h-4" /> Déconnexion
            </button>
            <Link 
              href={user?.role === 'patient' ? '/profil' : '/dashboard'} 
              className="bg-emerald-50 text-emerald-600 px-5 py-2 rounded-full font-semibold hover:bg-emerald-100"
            >
               {user?.full_name || 'Mon Espace'}
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-emerald-600 py-10 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-4 md:mb-6 leading-tight">Trouvez vos médicaments en un clic</h1>
          <p className="text-emerald-50 text-base md:text-lg mb-8 md:mb-10 opacity-90">Disponibilité en temps réel, pharmacies de garde et livraison rapide.</p>
          
          <div className="flex gap-2 mb-6 justify-center">
            <button onClick={() => setSearchType('medication')} className={`px-5 py-2 rounded-full font-bold text-xs md:text-sm transition-all ${searchType === 'medication' ? 'bg-white text-emerald-600 shadow-md' : 'bg-emerald-700/30 text-emerald-100 hover:bg-emerald-700/50'}`}>Médicaments</button>
            <button onClick={() => setSearchType('pharmacy')} className={`px-5 py-2 rounded-full font-bold text-xs md:text-sm transition-all ${searchType === 'pharmacy' ? 'bg-white text-emerald-600 shadow-md' : 'bg-emerald-700/30 text-emerald-100 hover:bg-emerald-700/50'}`}>Pharmacies</button>
          </div>

          <div className="bg-white p-2 rounded-2xl md:rounded-3xl shadow-xl flex flex-col gap-2">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 py-3.5 gap-3 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none border-b md:border-b-0 md:border-r border-slate-100">
                <Search className="text-slate-400 w-5 h-5 flex-shrink-0" />
                <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} placeholder={searchType === 'medication' ? "Quel médicament ?" : "Nom pharmacie..."} className="w-full focus:outline-none text-slate-900 font-semibold bg-transparent text-sm md:text-base" />
              </div>
              <div className="flex-1 flex items-center px-4 py-3.5 gap-3 bg-slate-50 md:bg-transparent rounded-xl md:rounded-none">
                <MapPin className="text-slate-400 w-5 h-5 flex-shrink-0" />
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full focus:outline-none text-slate-900 font-semibold bg-transparent text-sm md:text-base" />
              </div>
            </div>
            <button onClick={handleSearch} disabled={loading} className="w-full bg-slate-800 text-white py-4 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 active:scale-[0.98] transition-all">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lancer la recherche'}
            </button>
          </div>
        </div>
      </section>

      {searched && (
        <section className="max-w-7xl mx-auto px-4 py-10 md:py-12">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-6 px-1">Résultats pour &quot;{query}&quot;</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.isArray(results) && results.map((res, idx) => (
              <div key={idx} className="bg-white p-5 md:p-6 rounded-[28px] md:rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base md:text-lg text-slate-800 truncate">{res.pharmacy_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{(res.distance / 1000).toFixed(1)} km - {res.address}</span></p>
                  </div>
                  {res.is_on_duty && <span className="bg-red-100 text-red-600 text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase flex-shrink-0 ml-2">De Garde</span>}
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl mb-5">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-slate-700 text-sm md:text-base truncate">{res.medication_name}</span>
                    <span className="font-black text-emerald-600 text-sm md:text-base whitespace-nowrap">{res.price} {res.price !== '---' ? 'F' : ''}</span>
                  </div>
                </div>
                <button onClick={() => handleReserve(res.pharmacy_id, res.medication_id)} className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 active:scale-[0.98] transition-all text-sm md:text-base shadow-lg shadow-emerald-100 mt-auto">
                  {res.medication_id === 0 ? 'Appeler la pharmacie' : 'Réserver / Acheter'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-4 -mt-6 md:-mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <div onClick={handleOnDutySearch} className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-md border border-slate-100 flex flex-col items-center text-center cursor-pointer hover:translate-y-[-4px] active:scale-95 transition-all">
            <div className="bg-red-50 p-3 md:p-4 rounded-2xl mb-3 md:mb-4"><Clock className="text-red-600 w-5 h-5 md:w-6 md:h-6" /></div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">De Garde</h3>
            <p className="hidden xs:block text-[10px] md:text-sm text-slate-500 mt-1">Ouvertes 24/7</p>
          </div>
          <label className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-md border border-slate-100 flex flex-col items-center text-center cursor-pointer hover:translate-y-[-4px] active:scale-95 transition-all">
            <div className="bg-blue-50 p-3 md:p-4 rounded-2xl mb-3 md:mb-4"><Camera className="text-blue-600 w-5 h-5 md:w-6 md:h-6" /></div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">Ordonnance</h3>
            <p className="hidden xs:block text-[10px] md:text-sm text-slate-500 mt-1">Envoyer photo</p>
            <input type="file" className="hidden" accept="image/*" onChange={handlePrescriptionUpload} />
          </label>
          <div onClick={() => { document.getElementById('pharmacies-section')?.scrollIntoView({ behavior: 'smooth' }); setNotification({ message: 'Choisissez une pharmacie ci-dessous', type: 'success' }); }} className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-md border border-slate-100 flex flex-col items-center text-center cursor-pointer hover:translate-y-[-4px] active:scale-95 transition-all">
            <div className="bg-emerald-50 p-3 md:p-4 rounded-2xl mb-3 md:mb-4"><Calendar className="text-emerald-600 w-5 h-5 md:w-6 md:h-6" /></div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">RDV</h3>
            <p className="hidden xs:block text-[10px] md:text-sm text-slate-500 mt-1">Prendre RDV</p>
          </div>
          <div onClick={() => setShowChat(true)} className="bg-white p-5 md:p-6 rounded-2xl md:rounded-3xl shadow-md border border-slate-100 flex flex-col items-center text-center cursor-pointer hover:translate-y-[-4px] active:scale-95 transition-all">
            <div className="bg-amber-50 p-3 md:p-4 rounded-2xl mb-3 md:mb-4"><Phone className="text-amber-600 w-5 h-5 md:w-6 md:h-6" /></div>
            <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight">Conseil</h3>
            <p className="hidden xs:block text-[10px] md:text-sm text-slate-500 mt-1">Chat direct</p>
          </div>
        </div>
      </section>

      <section id="pharmacies-section" className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="flex justify-between items-end mb-6 md:mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">Pharmacies à proximité</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">Basé sur votre position</p>
          </div>
          <button onClick={() => setShowAll(!showAll)} className="text-emerald-600 font-bold hover:underline text-sm md:text-base">{showAll ? 'Voir moins' : 'Voir tout'}</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {(Array.isArray(nearbyPharmacies) ? (showAll ? nearbyPharmacies : nearbyPharmacies.slice(0, 3)) : []).map((p) => (
            <div key={p.id} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-300">
              <div className="h-40 md:h-48 bg-slate-100 relative flex items-center justify-center overflow-hidden">
                <MapPin className="w-10 md:w-12 h-10 md:h-12 text-slate-300 opacity-30 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] md:text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/20">OUVERT</div>
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-bold shadow-sm">{(p.distance / 1000).toFixed(1)} km</div>
              </div>
              <div className="p-5 md:p-6">
                <h4 className="text-lg md:text-xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors truncate">{p.name}</h4>
                <p className="text-slate-500 text-xs md:text-sm mb-5 flex items-start gap-2 h-10 overflow-hidden line-clamp-2"><MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" /> {p.address}</p>
                <div className="flex gap-2">
                  <button onClick={() => setNotification({ message: 'Livraison bientôt disponible', type: 'success' })} className="flex-1 bg-emerald-50 text-emerald-700 py-2.5 rounded-xl font-bold text-xs md:text-sm hover:bg-emerald-100 active:scale-95 transition-all">Commander</button>
                  <button onClick={() => handleAppointment(p.id, p.name)} className="px-5 bg-slate-50 text-slate-600 py-2.5 rounded-xl font-bold text-xs md:text-sm hover:bg-slate-100 active:scale-95 transition-all">RDV</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-white border-t border-slate-100 py-12 px-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-slate-400">© 2026 MediGo. Tous droits réservés.</div>
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
            {Array.isArray(messages) && messages.map((m) => (
              <div key={m.id} className={`flex ${!m.is_from_pharmacy ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${!m.is_from_pharmacy ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 shadow-sm border border-slate-100'}`}>{m.content}</div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t flex gap-2">
            <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Message..." className="flex-1 bg-slate-50 border-none rounded-xl py-2 px-4 outline-none focus:ring-2 focus:ring-emerald-500" />
            <button type="submit" className="bg-emerald-600 text-white p-2 rounded-xl"><Send className="w-5 h-5" /></button>
          </form>
        </div>
      )}
    </main>
  );
}
