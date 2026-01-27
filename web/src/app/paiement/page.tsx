'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Smartphone, CheckCircle2, Loader2, ShieldCheck, Pill, Lock, Info } from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

export default function Paiement() {
  const [method, setMethod] = useState<'tmoney' | 'flooz' | 'card' | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Method, 2: Details, 3: Success
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderSummary, setOrderSummary] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const initOrder = () => {
      const mockOrder = [
        { name: 'Paracétamol 500mg', price: 1500, quantity: 1 },
        { name: 'Sirop Humex', price: 2000, quantity: 1 }
      ];
      setOrderSummary(mockOrder);
      setTotal(mockOrder.reduce((acc, item) => acc + (item.price * item.quantity), 0));
    };
    initOrder();
  }, []);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 2500);
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-emerald-100 p-8 rounded-full mb-8 relative">
          <CheckCircle2 className="w-20 h-20 text-emerald-600 relative z-10" />
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">Paiement Réussi !</h1>
        <p className="text-slate-500 max-w-md mb-10 text-lg leading-relaxed">
          Votre commande est en cours de préparation. Vous recevrez un SMS avec votre code de retrait unique dès qu&apos;elle sera prête.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link href="/commandes" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95">
            Suivre ma commande
          </Link>
          <Link href="/" className="w-full text-emerald-600 py-4 font-bold hover:bg-emerald-50 rounded-2xl transition-all">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => step > 1 ? setStep(1) : window.history.back()} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <Pill className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-slate-800">Sécurisé par MediGo</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
            {step === 1 ? (
              <div className="p-6 md:p-10">
                <div className="mb-8">
                  <h2 className="text-2xl font-black text-slate-800 mb-2">Mode de paiement</h2>
                  <p className="text-slate-500 text-sm">Sélectionnez votre moyen de paiement local ou international.</p>
                </div>
                
                <div className="space-y-4">
                  <button onClick={() => { setMethod('tmoney'); setStep(2); }} className="w-full flex items-center justify-between p-6 rounded-[24px] border-2 border-slate-50 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-400 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic">T</div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-lg">T-Money</p>
                        <p className="text-xs text-slate-400">Togocom • Instantané</p>
                      </div>
                    </div>
                    <Smartphone className="text-slate-200 group-hover:text-emerald-500 w-8 h-8" />
                  </button>

                  <button onClick={() => { setMethod('flooz'); setStep(2); }} className="w-full flex items-center justify-between p-6 rounded-[24px] border-2 border-slate-50 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic">F</div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-lg">Moov Money (Flooz)</p>
                        <p className="text-xs text-slate-400">Moov • Instantané</p>
                      </div>
                    </div>
                    <Smartphone className="text-slate-200 group-hover:text-emerald-600 w-8 h-8" />
                  </button>

                  <button onClick={() => { setMethod('card'); setStep(2); }} className="w-full flex items-center justify-between p-6 rounded-[24px] border-2 border-slate-50 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white">
                        <CreditCard className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-slate-800 text-lg">Carte Bancaire</p>
                        <p className="text-xs text-slate-400">International</p>
                      </div>
                    </div>
                    <CreditCard className="text-slate-200 group-hover:text-emerald-500 w-8 h-8" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="p-6 md:p-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="text-2xl font-black text-slate-800 mb-8 tracking-tight">Coordonnées</h2>
                {method === 'card' ? (
                  <div className="space-y-4">
                    <input type="text" placeholder="Numéro de carte" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
                    <div className="flex gap-4">
                      <input type="text" placeholder="MM/YY" className="flex-1 bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
                      <input type="text" placeholder="CVC" className="flex-1 bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Numéro Mobile</label>
                    <input type="tel" required placeholder="90 00 00 00" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-5 px-6 outline-none focus:ring-2 focus:ring-emerald-500 text-xl font-bold tracking-[0.2em]" />
                    <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
                      <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 leading-relaxed">Confirmation PIN requise sur votre mobile.</p>
                    </div>
                  </div>
                )}
                <button disabled={loading} className="w-full bg-emerald-600 text-white py-5 rounded-[24px] font-black text-lg hover:bg-emerald-700 active:scale-95 transition-all mt-10 shadow-xl shadow-emerald-100">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Confirmer le paiement"}
                </button>
              </form>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 py-6 opacity-50 grayscale">
            <ShieldCheck className="w-4 h-4" /><Lock className="w-4 h-4" />
          </div>
        </div>

        <aside className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] md:rounded-[40px] shadow-sm border border-slate-100 sticky top-28">
            <h3 className="text-lg font-black text-slate-800 mb-6">Résumé</h3>
            <div className="space-y-4 mb-8">
              {orderSummary.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-slate-700">{item.quantity}x {item.name}</span>
                  <span className="font-bold text-slate-900">{item.price.toLocaleString()} F</span>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="font-black text-slate-800 text-lg">Total</span>
                <span className="font-black text-emerald-600 text-2xl">{total.toLocaleString()} F</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}