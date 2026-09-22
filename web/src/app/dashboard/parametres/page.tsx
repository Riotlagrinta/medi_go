'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Lock, ArrowLeft, Pill, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function Parametres() {
  const [pharmacyId, setPharmacyId] = useState<number | null>(null);
  const [pharmacyName, setPharmacyName] = useState('');
  const [pharmacyPhone, setPharmacyPhone] = useState('');
  const [pharmacyAddress, setPharmacyAddress] = useState('');
  const [savingPharmacy, setSavingPharmacy] = useState(false);

  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    const user = JSON.parse(userStr);
    setEmail(user.email);
    setNewEmail(user.email);
    if (user.pharmacy_id) {
      setPharmacyId(user.pharmacy_id);
      api.get(`/pharmacies/${user.pharmacy_id}`).then(async (res) => {
        if (res.ok) {
          const pharmacy = await res.json();
          setPharmacyName(pharmacy.name ?? '');
          setPharmacyPhone(pharmacy.phone ?? '');
          setPharmacyAddress(pharmacy.address ?? '');
        }
      });
    }
  }, []);

  const handleUpdatePharmacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pharmacyId) return;
    setSavingPharmacy(true);
    try {
      const res = await api.patch(`/pharmacies/${pharmacyId}`, {
        name: pharmacyName,
        phone: pharmacyPhone,
        address: pharmacyAddress,
      });
      if (!res.ok) throw new Error((await res.json()).error);
      alert('Fiche pharmacie mise à jour.');
    } catch (error: unknown) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setSavingPharmacy(false);
    }
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    const changingEmail = newEmail !== email;
    const changingPassword = !!newPassword;
    if ((changingEmail || changingPassword) && !currentPassword) {
      alert('Indique ton mot de passe actuel pour confirmer ce changement.');
      return;
    }
    setSavingAccount(true);
    try {
      const res = await api.patch('/auth/profile', {
        ...(changingEmail ? { email: newEmail } : {}),
        ...(changingPassword ? { password: newPassword } : {}),
        ...(changingEmail || changingPassword ? { current_password: currentPassword } : {}),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user') || '{}'), ...updated }));
      setEmail(updated.email);
      setNewPassword('');
      setCurrentPassword('');
      alert('Modifications sauvegardées.');
    } catch (error: unknown) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setSavingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="bg-white border-b border-slate-100 px-4 py-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-slate-50 rounded-xl active:scale-90 transition-all">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <h1 className="text-xl md:text-3xl font-black text-slate-800 tracking-tight leading-none">Réglages</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8 flex flex-col gap-6">
        {/* Section Établissement */}
        <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm border border-slate-100">
          <h2 className="text-base md:text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <div className="bg-emerald-50 p-2 rounded-lg"><Pill className="text-emerald-600 w-5 h-5" /></div>
            Ma Pharmacie
          </h2>
          <form onSubmit={handleUpdatePharmacy} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nom public</label>
              <input
                type="text"
                value={pharmacyName}
                onChange={(e) => setPharmacyName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold shadow-inner"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Téléphone Direct</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={pharmacyPhone}
                    onChange={(e) => setPharmacyPhone(e.target.value)}
                    placeholder="+228 90 00 00 00"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold shadow-inner"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adresse Géo</label>
                <div className="relative">
                  <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={pharmacyAddress}
                    onChange={(e) => setPharmacyAddress(e.target.value)}
                    placeholder="Lomé, Togo"
                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold shadow-inner"
                  />
                </div>
              </div>
            </div>
            <button
              disabled={savingPharmacy || !pharmacyId}
              className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-sm hover:bg-emerald-700 active:scale-95 transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingPharmacy ? 'Chargement...' : 'Enregistrer la fiche pharmacie'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Section Sécurité */}
        <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm border border-slate-100">
          <h2 className="text-base md:text-lg font-black text-slate-800 mb-6 flex items-center gap-2">
            <div className="bg-blue-50 p-2 rounded-lg"><ShieldCheck className="text-blue-600 w-5 h-5" /></div>
            Sécurité & Compte
          </h2>
          <form onSubmit={handleUpdateAccount} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email de gestion</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold shadow-inner"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nouveau mot de passe (optionnel)</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="password"
                  value={newPassword}
                  placeholder="••••••••"
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 font-bold shadow-inner"
                />
              </div>
            </div>
            {(newEmail !== email || newPassword) && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest ml-1">Mot de passe actuel (confirmation requise)</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" />
                  <input
                    type="password"
                    value={currentPassword}
                    placeholder="••••••••"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-amber-50 border-none rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-amber-500 outline-none text-slate-700 font-bold shadow-inner"
                  />
                </div>
              </div>
            )}
            <button
              disabled={savingAccount}
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-slate-800 active:scale-95 transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {savingAccount ? "Chargement..." : "Sauvegarder les modifications"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
