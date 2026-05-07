import dynamic from 'next/dynamic';

export const PharmacyMap = dynamic(() => import('./PharmacyMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-[32px] bg-slate-100 animate-pulse flex items-center justify-center">
      <p className="text-slate-400 font-bold">Chargement de la carte de Lomé...</p>
    </div>
  ),
});
