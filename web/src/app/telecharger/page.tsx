'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Smartphone, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  Share2, 
  PlusSquare, 
  MoreVertical, 
  ShieldCheck, 
  Zap, 
  MapPin, 
  Bell, 
  Pill,
  Sparkles
} from 'lucide-react';

export default function TelechargerPage() {
  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Vérifier si l'application est déjà installée en mode standalone
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error('Installation error:', err);
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 selection:bg-emerald-100 selection:text-emerald-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-200 group-hover:rotate-12 transition-transform">
              <Pill className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">MediGo</span>
          </Link>
          <Link 
            href="/" 
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 overflow-hidden bg-gradient-to-b from-emerald-600 to-emerald-700 text-white">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 font-black text-xs uppercase tracking-widest mb-6 border border-white/20">
            <Sparkles className="w-4 h-4 text-emerald-300" />
            Application Mobile & PWA
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
            Installez <span className="text-emerald-300">MediGo</span> sur votre téléphone
          </h1>
          <p className="text-emerald-50/90 text-lg md:text-xl max-w-2xl mx-auto font-medium mb-8 leading-relaxed">
            Accédez à vos pharmacies de garde et recherchez vos médicaments en un clic depuis votre écran d&apos;accueil, sans consommer votre forfait internet.
          </p>

          {/* Bouton d'installation rapide si PWA supportée */}
          {deferredPrompt && !isInstalled && (
            <div className="animate-bounce mb-8">
              <button
                onClick={handleInstallClick}
                disabled={installing}
                className="bg-white text-emerald-800 px-8 py-4 rounded-full font-black text-base md:text-lg shadow-2xl hover:bg-emerald-50 transition-all flex items-center gap-3 mx-auto active:scale-95"
              >
                <Download className="w-6 h-6 text-emerald-600" />
                Installer l&apos;application en 1 clic
              </button>
            </div>
          )}

          {isInstalled && (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-md text-white font-bold text-sm border border-white/30">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              MediGo est déjà installé sur cet appareil !
            </div>
          )}
        </div>
      </section>

      {/* Guide Écran d'accueil Section */}
      <section className="max-w-5xl mx-auto px-4 -mt-10 relative z-20 mb-20">
        <div className="bg-white rounded-[40px] p-6 md:p-12 shadow-2xl shadow-slate-900/10 border border-slate-100">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-3 tracking-tight">
              Comment ajouter MediGo sur votre écran d&apos;accueil ?
            </h2>
            <p className="text-slate-500 font-medium text-sm md:text-base max-w-xl mx-auto">
              L&apos;installation est instantanée et ne prend que 5 secondes. Choisissez votre type de téléphone ci-dessous :
            </p>
          </div>

          {/* Switcher d'OS */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-md mx-auto mb-12">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-3 px-6 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'android'
                  ? 'bg-white text-emerald-700 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              Android (Chrome)
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-3 px-6 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                activeTab === 'ios'
                  ? 'bg-white text-emerald-700 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-4 h-4 text-blue-600" />
              iPhone (Safari)
            </button>
          </div>

          {/* Contenu Android */}
          {activeTab === 'android' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 font-black text-xl shadow-sm">
                  1
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 border border-slate-100">
                  <MoreVertical className="w-8 h-8 text-slate-700" />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">Ouvrez le menu</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Sur Google Chrome, touchez les <strong>trois petits points (⋮)</strong> situés en haut à droite de l&apos;écran.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 font-black text-xl shadow-sm">
                  2
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 border border-slate-100">
                  <Download className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">Installer l&apos;application</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Appuyez sur l&apos;option <strong>« Installer l&apos;application »</strong> ou <strong>« Ajouter à l&apos;écran d&apos;accueil »</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 font-black text-xl shadow-sm">
                  3
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 border border-slate-100">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">C&apos;est prêt !</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  L&apos;icône <strong>MediGo</strong> apparaît sur votre écran d&apos;accueil comme une vraie application native.
                </p>
              </div>
            </div>
          )}

          {/* Contenu iOS */}
          {activeTab === 'ios' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6 font-black text-xl shadow-sm">
                  1
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 border border-slate-100">
                  <Share2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">Touchez Partager</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Dans Safari, touchez le bouton <strong>Partager</strong> (le carré avec une flèche vers le haut au bas de l&apos;écran).
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6 font-black text-xl shadow-sm">
                  2
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 border border-slate-100">
                  <PlusSquare className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">Sur l&apos;écran d&apos;accueil</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Faites défiler le menu vers le bas et sélectionnez <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6 font-black text-xl shadow-sm">
                  3
                </div>
                <div className="bg-white p-3 rounded-2xl shadow-sm mb-4 border border-slate-100">
                  <CheckCircle2 className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="font-black text-slate-900 text-lg mb-2">Confirmez l&apos;ajout</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Appuyez sur <strong>« Ajouter »</strong> en haut à droite. MediGo est maintenant installé sur votre iPhone.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Section Fichier APK Direct */}
      <section className="max-w-5xl mx-auto px-4 mb-20">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[40px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px]"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-xs uppercase tracking-widest mb-4 border border-emerald-500/30">
                Fichier Android APK
              </div>
              <h3 className="text-3xl font-black mb-4 tracking-tight">Téléchargement direct du fichier APK</h3>
              <p className="text-slate-300 text-base leading-relaxed mb-6 max-w-xl">
                Vous préférez installer le fichier d&apos;installation <code>.apk</code> directement sur votre appareil Android ? Le package officiel MediGo est en cours d&apos;optimisation pour une compatibilité maximale avec tous les smartphones du Togo.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <div className="bg-slate-800/80 border border-slate-700 px-5 py-3 rounded-2xl text-xs font-bold text-slate-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Version 1.0.0 (En préparation)
                </div>
                <Link
                  href="/"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-900/50 active:scale-95"
                >
                  Utiliser la version Web immédiate
                </Link>
              </div>
            </div>

            <div className="w-full md:w-64 bg-slate-800/60 backdrop-blur-md p-6 rounded-3xl border border-slate-700/60 text-center">
              <Smartphone className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">Taille estimée</p>
              <p className="text-2xl font-black text-white mb-4">~25 Mo</p>
              <p className="text-[11px] text-slate-400 leading-normal">
                Mises à jour automatiques OTA incluses sans réinstallation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages de l'application */}
      <section className="max-w-5xl mx-auto px-4 mb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Pourquoi installer MediGo ?</h2>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">
            Une expérience pensée spécialement pour les réalités du réseau au Togo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">Ultra Rapide & Léger</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Ne ralentit pas votre téléphone et consomme très peu de données mobiles pour fonctionner même en 3G.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <MapPin className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">GPS Haute Précision</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Détecte instantanément votre quartier à Lomé et dans tout le Togo pour trouver la pharmacie ouverte la plus proche.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3">100% Sécurisé</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Vos ordonnances et réservations médicales sont protégées selon les normes de confidentialité en vigueur.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400 text-sm border-t border-slate-800 mt-auto">
        <p>© 2026 MediGo Togo. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
