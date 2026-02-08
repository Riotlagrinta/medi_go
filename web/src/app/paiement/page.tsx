'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Smartphone, CheckCircle2, Loader2, ShieldCheck, Pill, Lock, Info, Truck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Suspense } from 'react';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

function PaiementContent() {
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<'tmoney' | 'flooz' | 'delivery' | 'card' | null>(null);
  // ... (reste du code identique jusqu'au return)
}

export default function Paiement() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
      </div>
    }>
      <PaiementContent />
    </Suspense>
  );
}

function PaiementContent() {
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<'tmoney' | 'flooz' | 'delivery' | 'card' | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Method, 2: Details, 3: Success
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderSummary, setOrderSummary] = useState<OrderItem[]>([]);
  const [total, setTotal] = useState(0);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const resId = searchParams.get('reservation_id');
    const amt = searchParams.get('amount');
    
    if (resId && amt) {
      setReservationId(parseInt(resId));
      setTotal(parseInt(amt));
    } else {
      const mockOrder = [
        { name: 'Commande Pharmacie', price: parseInt(amt || '0'), quantity: 1 }
      ];
      setOrderSummary(mockOrder);
      if (amt) setTotal(parseInt(amt));
    }
  }, [searchParams]);

  const validateTogoNumber = (num: string) => {
    const regex = /^(90|91|92|93|96|97|98|99|70)\d{6}$/;
    return regex.test(num.replace(/\s/g, ''));
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if ((method === 'tmoney' || method === 'flooz') && !validateTogoNumber(phoneNumber)) {
      setError('Veuillez entrer un numéro de téléphone togolais valide (8 chiffres).');
      return;
    }

    setLoading(true);

    try {
      if (method === 'delivery') {
        setTimeout(() => { setLoading(false); setStep(3); }, 1500);
        return;
      }

      const response = await api.post('/payments/initialize', {
        reservation_id: reservationId,
        amount: total,
        payment_method: method,
        phone: phoneNumber
      });

      if (!response.ok) throw new Error('Erreur lors de l\'initialisation du paiement');

      const data = await response.json();
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setStep(3);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-emerald-100 p-8 rounded-full mb-8 relative">
          <CheckCircle2 className="w-20 h-20 text-emerald-600 relative z-10" />
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">Commande Validée !</h1>
        <p className="text-slate-500 max-w-md mb-10 text-lg leading-relaxed">
          {method === 'delivery' 
            ? "Votre commande est enregistrée. Vous paierez directement au livreur lors de la réception."
            : "Votre paiement a été reçu. Vous recevrez un SMS avec votre code de retrait unique dès que votre commande sera prête."}
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
                  <button onClick={() => { setMethod('tmoney'); setStep(2); }} className="w-full flex items-center justify-between p-6 rounded-[24px] border-2 border-slate-50 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group text-left">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-400 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-lg shadow-yellow-100">T</div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg leading-tight">T-Money</p>
                        <p className="text-xs text-slate-400 mt-1">Togocom • Frais 0F</p>
                      </div>
                    </div>
                    <Smartphone className="text-slate-200 group-hover:text-emerald-500 w-8 h-8 transition-colors" />
                  </button>

                  <button onClick={() => { setMethod('flooz'); setStep(2); }} className="w-full flex items-center justify-between p-6 rounded-[24px] border-2 border-slate-50 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group text-left">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-lg shadow-slate-200">F</div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg leading-tight">Flooz</p>
                        <p className="text-xs text-slate-400 mt-1">Moov Money • Instantané</p>
                      </div>
                    </div>
                    <Smartphone className="text-slate-200 group-hover:text-emerald-600 w-8 h-8 transition-colors" />
                  </button>

                  <button onClick={() => { setMethod('delivery'); setStep(2); }} className="w-full flex items-center justify-between p-6 rounded-[24px] border-2 border-slate-50 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group text-left">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                        <Truck className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg leading-tight">Paiement à la livraison</p>
                        <p className="text-xs text-slate-400 mt-1">Cash ou Mobile Money</p>
                      </div>
                    </div>
                    <CheckCircle2 className="text-slate-200 group-hover:text-emerald-500 w-8 h-8 transition-colors" />
                  </button>

                  <div className="relative py-4 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <span className="relative bg-white px-4 text-[10px] text-slate-400 uppercase font-black tracking-widest">Autres options</span>
                  </div>

                  <button onClick={() => { setMethod('card'); setStep(2); }} className="w-full flex items-center justify-between p-6 rounded-[24px] border-2 border-slate-50 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group text-left">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                        <CreditCard className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg leading-tight">Carte Bancaire</p>
                        <p className="text-xs text-slate-400 mt-1">Visa, Mastercard</p>
                      </div>
                    </div>
                    <CreditCard className="text-slate-200 group-hover:text-emerald-500 w-8 h-8 transition-colors" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="p-6 md:p-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {method === 'delivery' ? 'Confirmation' : 'Coordonnées'}
                  </h2>
                  <div className="bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    Étape 2/2
                  </div>
                </div>

                {method === 'card' ? (
                  <div className="space-y-4">
                    <input type="text" placeholder="Numéro de carte" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
                    <div className="flex gap-4">
                      <input type="text" placeholder="MM/YY" className="flex-1 bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
                      <input type="text" placeholder="CVC" className="flex-1 bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
                    </div>
                  </div>
                ) : method === 'delivery' ? (
                  <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="bg-emerald-100 p-2 rounded-lg"><Truck className="text-emerald-600 w-5 h-5" /></div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Un livreur MediGo se présentera à votre adresse dans les prochaines **45 minutes**. Assurez-vous d&apos;avoir le montant exact de **{total.toLocaleString()} F** ou d&apos;être prêt à faire un transfert mobile.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Numéro Mobile Togo</label>
                    <div className="relative">
                      <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="tel" required 
                        placeholder="90 00 00 00" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-emerald-500 text-xl font-bold tracking-[0.2em]" 
                      />
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold pl-1">{error}</p>}
                    <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
                      <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 leading-relaxed font-medium">Vous recevrez une demande de confirmation PIN sur votre téléphone.</p>
                    </div>
                  </div>
                )}

                <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg hover:bg-slate-800 active:scale-95 transition-all mt-10 shadow-xl shadow-slate-200">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (method === 'delivery' ? "Confirmer la commande" : "Lancer le paiement")}
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
                <span className="font-black text-slate-800 text-lg">Total à payer</span>
                <span className="font-black text-emerald-600 text-2xl">{total.toLocaleString()} F</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

  if (step === 3) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-emerald-100 p-8 rounded-full mb-8 relative">
          <CheckCircle2 className="w-20 h-20 text-emerald-600 relative z-10" />
          <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-20"></div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 mb-4 tracking-tight">Commande Validée !</h1>
        <p className="text-slate-500 max-w-md mb-10 text-lg leading-relaxed">
          {method === 'delivery' 
            ? "Votre commande est enregistrée. Vous paierez directement au livreur lors de la réception."
            : "Votre paiement a été reçu. Vous recevrez un SMS avec votre code de retrait unique dès que votre commande sera prête."}
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
                  <button onClick={() => { setMethod('tmoney'); setStep(2); }} className="w-full flex items-center justify-between p-6 rounded-[24px] border-2 border-slate-50 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group text-left">
                    <div className="flex items-center gap-4">
                      <div className="bg-yellow-400 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-lg shadow-yellow-100">T</div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg leading-tight">T-Money</p>
                        <p className="text-xs text-slate-400 mt-1">Togocom • Frais 0F</p>
                      </div>
                    </div>
                    <Smartphone className="text-slate-200 group-hover:text-emerald-500 w-8 h-8 transition-colors" />
                  </button>

                  <button onClick={() => { setMethod('flooz'); setStep(2); }} className="w-full flex items-center justify-between p-6 rounded-[24px] border-2 border-slate-50 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group text-left">
                    <div className="flex items-center gap-4">
                      <div className="bg-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-lg shadow-slate-200">F</div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg leading-tight">Flooz</p>
                        <p className="text-xs text-slate-400 mt-1">Moov Money • Instantané</p>
                      </div>
                    </div>
                    <Smartphone className="text-slate-200 group-hover:text-emerald-600 w-8 h-8 transition-colors" />
                  </button>

                  <button onClick={() => { setMethod('delivery'); setStep(2); }} className="w-full flex items-center justify-between p-6 rounded-[24px] border-2 border-slate-50 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group text-left">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                        <Truck className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg leading-tight">Paiement à la livraison</p>
                        <p className="text-xs text-slate-400 mt-1">Cash ou Mobile Money</p>
                      </div>
                    </div>
                    <CheckCircle2 className="text-slate-200 group-hover:text-emerald-500 w-8 h-8 transition-colors" />
                  </button>

                  <div className="relative py-4 text-center">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <span className="relative bg-white px-4 text-[10px] text-slate-400 uppercase font-black tracking-widest">Autres options</span>
                  </div>

                  <button onClick={() => { setMethod('card'); setStep(2); }} className="w-full flex items-center justify-between p-6 rounded-[24px] border-2 border-slate-50 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group text-left">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                        <CreditCard className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-lg leading-tight">Carte Bancaire</p>
                        <p className="text-xs text-slate-400 mt-1">Visa, Mastercard</p>
                      </div>
                    </div>
                    <CreditCard className="text-slate-200 group-hover:text-emerald-500 w-8 h-8 transition-colors" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePayment} className="p-6 md:p-10 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="mb-8 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                    {method === 'delivery' ? 'Confirmation' : 'Coordonnées'}
                  </h2>
                  <div className="bg-emerald-50 px-3 py-1 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                    Étape 2/2
                  </div>
                </div>

                {method === 'card' ? (
                  <div className="space-y-4">
                    <input type="text" placeholder="Numéro de carte" className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
                    <div className="flex gap-4">
                      <input type="text" placeholder="MM/YY" className="flex-1 bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
                      <input type="text" placeholder="CVC" className="flex-1 bg-slate-50 border-none rounded-2xl py-4 px-6 outline-none focus:ring-2 focus:ring-emerald-500 font-mono" />
                    </div>
                  </div>
                ) : method === 'delivery' ? (
                  <div className="bg-slate-50 p-6 rounded-3xl space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="bg-emerald-100 p-2 rounded-lg"><Truck className="text-emerald-600 w-5 h-5" /></div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Un livreur MediGo se présentera à votre adresse dans les prochaines **45 minutes**. Assurez-vous d&apos;avoir le montant exact de **{total.toLocaleString()} F** ou d&apos;être prêt à faire un transfert mobile.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Numéro Mobile Togo</label>
                    <div className="relative">
                      <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input 
                        type="tel" required 
                        placeholder="90 00 00 00" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value)} 
                        className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-14 pr-6 outline-none focus:ring-2 focus:ring-emerald-500 text-xl font-bold tracking-[0.2em]" 
                      />
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold pl-1">{error}</p>}
                    <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 border border-blue-100">
                      <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700 leading-relaxed font-medium">Vous recevrez une demande de confirmation PIN sur votre téléphone.</p>
                    </div>
                  </div>
                )}

                <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-[24px] font-black text-lg hover:bg-slate-800 active:scale-95 transition-all mt-10 shadow-xl shadow-slate-200">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (method === 'delivery' ? "Confirmer la commande" : "Lancer le paiement")}
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
                <span className="font-black text-slate-800 text-lg">Total à payer</span>
                <span className="font-black text-emerald-600 text-2xl">{total.toLocaleString()} F</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
